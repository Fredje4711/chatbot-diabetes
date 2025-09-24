// === FUNCTIES VOOR SEMANTISCH ZOEKEN ===
let kbEmbeddingsCache = {};
async function findSemanticBestMatches(question, kbData, env, topK = 1) {
    const cacheKey = "all_items_cache";
    if (!kbEmbeddingsCache[cacheKey]) {
        console.log("Aanmaken van kennisbank-embeddings cache...");
        const textsToEmbed = kbData.map(item => item.titel + "\n" + item.tekst);
        const response = await fetch("https://api.openai.com/v1/embeddings", {
            method: "POST",
            headers: { "Authorization": `Bearer ${env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ input: textsToEmbed, model: "text-embedding-ada-002" }),
        });
        if (!response.ok) { console.error("Fout bij ophalen KB embeddings:", await response.text()); return "Geen relevante informatie gevonden."; }
        const { data } = await response.json();
        kbEmbeddingsCache[cacheKey] = data.map(d => d.embedding);
        console.log("Cache aangemaakt.");
    }
    const questionResponse = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: { "Authorization": `Bearer ${env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ input: question, model: "text-embedding-ada-002" }),
    });
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
            
            const ai = env.AI;

            // --- DE NIEUWE, VERBETERDE SYSTEM PROMPT ---
            const systemPrompt = `Je bent een chatbot voor de Diabetes Liga Midden-Limburg. Antwoord altijd in het Nederlands.

            **INSTRUCTIES:**
            1.  Als de CONTEXT hieronder een duidelijk antwoord op de vraag bevat, baseer je antwoord dan **volledig en uitsluitend** op die CONTEXT. Voeg in dit geval GEEN extra zinnen toe.
            
            2.  Als de CONTEXT "Geen relevante informatie gevonden." is, of de context de vraag niet kan beantwoorden, gebruik dan je **algemene kennis** om een behulpzaam antwoord te geven.
            
            3.  **BELANGRIJK:** Als je je algemene kennis hebt gebruikt (volgens Regel 2), voeg dan **altijd** de volgende zin toe aan het einde van je antwoord, op een nieuwe regel:
                "Voor meer specifieke informatie, bezoek onze website www.dlml.be, contacteer het bestuur via https://fredje4711.github.io/dlml/#contact, of mail naar midden.limburg@diabetes.be."
            
            CONTEXT:
            ${context}`;
            
            const messages = [{ role: 'system', content: systemPrompt }, { role: 'user', content: question }];
            const aiResponse = await ai.run('@cf/meta/llama-3-8b-instruct', { messages });
            
            const responsePayload = { choices: [{ message: { role: 'assistant', content: aiResponse.response } }] };
            return new Response(JSON.stringify(responsePayload), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        } catch (e) {
            return new Response(`Er is een fout opgetreden: ${e.message}`, { status: 500, headers: corsHeaders });
        }
    },
};