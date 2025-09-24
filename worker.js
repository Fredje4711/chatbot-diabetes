// === FUNCTIES VOOR SEMANTISCH ZOEKEN ===
let kbEmbeddingsCache = {};
async function findSemanticBestMatches(question, kbData, env, topK = 1) {
    const cacheKey = "all_items_cache";
    if (!kbEmbeddingsCache[cacheKey]) {
        console.log("Aanmaken van kennisbank-embeddings cache...");
        const textsToEmbed = kbData.map(item => item.titel + "\n" + item.tekst);
        const response = await fetch("https://api.openai.com/v1/embeddings", { method: "POST", headers: { "Authorization": `Bearer ${env.OPENAI_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ input: textsToEmbed, model: "text-embedding-ada-002" }), });
        if (!response.ok) { console.error("Fout bij ophalen KB embeddings:", await response.text()); return "Geen relevante informatie gevonden."; }
        const { data } = await response.json();
        kbEmbeddingsCache[cacheKey] = data.map(d => d.embedding);
        console.log("Cache aangemaakt.");
    }
    const questionResponse = await fetch("https://api.openai.com/v1/embeddings", { method: "POST", headers: { "Authorization": `Bearer ${env.OPENAI_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ input: question, model: "text-embedding-ada-002" }), });
    if (!questionResponse.ok) { console.error("Fout bij ophalen vraag embedding:", await questionResponse.text()); return "Geen relevante informatie gevonden."; }
    const { data: questionData } = await questionResponse.json();
    const questionEmbedding = questionData[0].embedding;
    let bestMatch = { score: -1, index: -1 };
    for (let i = 0; i < kbEmbeddingsCache[cacheKey].length; i++) {
        let dotProduct = 0, normA = 0, normB = 0;
        for (let j = 0; j < questionEmbedding.length; j++) {
            dotProduct += questionEmbedding[j] * kbEmbeddingsCache[cacheKey][i][j];
            normA += questionEmbedding[j] ** 2;
            normB += kbEmbeddingsCache[cacheKey][i][j] ** 2;
        }
        const score = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
        if (score > bestMatch.score) { bestMatch = { score, index: i }; }
    }
    if (bestMatch.score > 0.8) { 
        return kbData[bestMatch.index].tekst;
    }
    return "Geen relevante informatie gevonden.";
}

// === HOOFDFUNCTIE VAN DE WORKER ===
export default {
    async fetch(request, env) {
        const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
        if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
        if (request.method !== 'POST') return new Response('Methode niet toegestaan', { status: 405, headers: corsHeaders });
        try {
            const { question } = await request.json();
            if (!question) return new Response('Vraag ontbreekt.', { status: 400, headers: corsHeaders });

            const object = await env.KB_BUCKET.get('kb_master.json');
            if (object === null) throw new Error('Kennisbank (kb_master.json) niet gevonden in R2.');
            const kbData = await object.json();
            
            const context = await findSemanticBestMatches(question, kbData, env);
            const contextFound = context !== "Geen relevante informatie gevonden.";

            const ai = env.AI;
            
            // --- DE DEFINITIEVE, GECORRIGEERDE PROMPT ---
            let systemPrompt;
            if (contextFound) {
                systemPrompt = `Je bent een expert-assistent. Baseer je antwoord VOLLEDIG op de CONTEXT. Wees zo letterlijk en compleet mogelijk. Antwoord in het Nederlands. CONTEXT: ${context}`;
            } else {
                systemPrompt = `Je bent een algemene AI-assistent. Beantwoord de vraag naar beste vermogen. Als je het antwoord weet, voeg dan aan het einde op een nieuwe regel de zin toe: "Houd er rekening mee dat ik voornamelijk ben ontworpen om vragen over diabetes en de Diabetes Liga Midden-Limburg te beantwoorden.". Als je het antwoord NIET weet, antwoord dan letterlijk: "Mijn excuses, maar ik kan geen antwoord op uw vraag vinden. Voor meer informatie kunt u terecht op onze website www.dlml.be of mailen naar midden.limburg@diabetes.be.". Antwoord in het Nederlands.`;
            }
            
            const messages = [{ role: 'system', content: systemPrompt }, { role: 'user', content: question }];
            const aiResponse = await ai.run('@cf/meta/llama-3-8b-instruct', { messages });
            
            let finalAnswer = aiResponse.response;

            // --- DE NIEUWE, BETROUWBARE DISCLAIMER LOGICA ---
            if (contextFound) {
                finalAnswer += "\n\nLet op: deze informatie is van algemene aard. Voor persoonlijk medisch advies, raadpleeg altijd uw arts.";
            }
            
            const responsePayload = { choices: [{ message: { role: 'assistant', content: finalAnswer } }] };
            return new Response(JSON.stringify(responsePayload), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        } catch (e) {
            return new Response(`Er is een fout opgetreden: ${e.message}`, { status: 500, headers: corsHeaders });
        }
    },
};