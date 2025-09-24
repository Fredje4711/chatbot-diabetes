// === FUNCTIES VOOR SEMANTISCH ZOEKEN ===
let kbEmbeddingsCache = {};
async function findSemanticBestMatches(question, kbData, env, topK = 3) { // We vragen 3 resultaten voor meer context
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
    let matches = [];
    for (let i = 0; i < kbEmbeddingsCache[cacheKey].length; i++) {
        let dotProduct = 0, normA = 0, normB = 0;
        for (let j = 0; j < questionEmbedding.length; j++) {
            dotProduct += questionEmbedding[j] * kbEmbeddingsCache[cacheKey][i][j];
            normA += questionEmbedding[j] ** 2;
            normB += kbEmbeddingsCache[cacheKey][i][j] ** 2;
        }
        const score = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
        matches.push({ score, index: i });
    }
    matches.sort((a, b) => b.score - a.score);
    if (matches.length > 0 && matches[0].score > 0.78) {
        return matches.slice(0, topK).map(match => kbData[match.index].tekst).join('\n\n---\n\n');
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

            const systemPrompt = `Je bent een expert-assistent voor de Diabetes Liga Midden-Limburg. Antwoord altijd in het Nederlands.
            Jouw taak is om de vraag van de gebruiker te beantwoorden.
            1.  Baseer je antwoord VOLLEDIG op de meegeleverde CONTEXT. Synthetiseer de informatie uit ALLE relevante documenten in de context tot één vloeiend, compleet en accuraat antwoord.
            2.  Als de CONTEXT "Geen relevante informatie gevonden." is, gebruik dan je algemene kennis en start je antwoord met "Op basis van algemene informatie...".
            3.  Als een link (URL) wordt vermeld, neem deze dan ALTIJD op in je antwoord. Schrijf de URL volledig uit.
            CONTEXT:
            ${context}`;
            
            const messages = [{ role: 'system', content: systemPrompt }, { role: 'user', content: question }];

            // --- DE MOTOR UPGRADE: van ai.run naar OpenAI fetch ---
            const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "gpt-4o",
                    messages: messages
                })
            });

            if (!openAIResponse.ok) {
                throw new Error(`OpenAI API fout: ${openAIResponse.status} ${await openAIResponse.text()}`);
            }

            const responseData = await openAIResponse.json();
            let finalAnswer = responseData.choices[0].message.content;

            // De betrouwbare disclaimer-logica blijft behouden
            if (contextFound) {
                finalAnswer += "\n\nLet op: deze informatie is van algemene aard. Voor persoonlijk medisch advies, raadpleeg altijd uw arts.";
            } else {
                 finalAnswer += "\n\nHoud er rekening mee dat ik voornamelijk ben ontworpen om vragen over diabetes en de Diabetes Liga Midden-Limburg te beantwoorden.";
            }
            
            const finalPayload = { choices: [{ message: { role: 'assistant', content: finalAnswer } }] };
            return new Response(JSON.stringify(finalPayload), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

        } catch (e) {
            return new Response(`Er is een fout opgetreden: ${e.message}`, { status: 500, headers: corsHeaders });
        }
    },
};