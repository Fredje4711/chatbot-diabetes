// === FUNCTIES VOOR SEMANTISCH ZOEKEN ===
let kbEmbeddingsCache = {};

async function findSemanticBestMatches(question, kbData, env, topK = 3) {
    const cacheKey = "all_items_cache";
    if (!kbEmbeddingsCache[cacheKey]) {
        console.log("Aanmaken van kennisbank-embeddings cache...");
        const textsToEmbed = kbData.map(item => item.titel + "\n" + item.tekst); // Combineer titel en tekst voor betere context
        const response = await fetch("https://api.openai.com/v1/embeddings", {
            method: "POST",
            headers: { "Authorization": `Bearer ${env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ input: textsToEmbed, model: "text-embedding-ada-002" }),
        });
        if (!response.ok) throw new Error("Kon geen embeddings voor de kennisbank ophalen.");
        const { data } = await response.json();
        kbEmbeddingsCache[cacheKey] = data.map(d => d.embedding);
        console.log("Cache aangemaakt.");
    }
    
    const questionResponse = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: { "Authorization": `Bearer ${env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ input: question, model: "text-embedding-ada-002" }),
    });
    if (!questionResponse.ok) throw new Error("Kon geen embedding voor de vraag ophalen.");
    const { data: questionData } = await questionResponse.json();
    const questionEmbedding = questionData[0].embedding;
    
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
    
    // Stuur de tekst van de beste K matches terug
    return matches.slice(0, topK).map(match => kbData[match.index].tekst).join('\n\n---\n\n');
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

            const object = await env.KB_BUCKET.get('kb_master.json'); // Let op: nieuwe bestandsnaam!
            if (object === null) throw new Error('Kennisbank (kb_master.json) niet gevonden in R2.');
            const kbData = await object.json();
            
            const context = await findSemanticBestMatches(question, kbData, env);
            
            const ai = env.AI;
            const systemPrompt = `Je bent een chatbot voor de Diabetes Liga Midden-Limburg. Beantwoord de vraag van de gebruiker. Gebruik de onderstaande CONTEXT om het antwoord te formuleren. Als de CONTEXT relevante informatie bevat, baseer je antwoord dan VOLLEDIG op die context. Als het antwoord niet in de context staat, zeg dan: "Mijn excuses, maar ik kan het antwoord op uw vraag niet in mijn kennisbank vinden." Geef direct het antwoord. CONTEXT: ${context}`;
            const messages = [{ role: 'system', content: systemPrompt }, { role: 'user', content: question }];
            const aiResponse = await ai.run('@cf/meta/llama-3-8b-instruct', { messages });
            
            const responsePayload = { choices: [{ message: { role: 'assistant', content: aiResponse.response } }] };
            return new Response(JSON.stringify(responsePayload), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        } catch (e) {
            return new Response(`Er is een fout opgetreden: ${e.message}`, { status: 500, headers: corsHeaders });
        }
    },
};