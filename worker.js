// === FUNCTIES VOOR SEMANTISCH ZOEKEN ===
// Een cache om te voorkomen dat we de kennisbank steeds opnieuw moeten "leren"
let kbEmbeddingsCache = {};

// Deze functie zoekt de 3 meest relevante stukken tekst uit de volledige kennisbank
async function findSemanticBestMatches(question, kbData, env, topK = 3) {
    const cacheKey = "all_items_cache";
    // Als de cache leeg is, vul hem dan door alle titels en teksten om te zetten naar "betekeniscodes"
    if (!kbEmbeddingsCache[cacheKey]) {
        console.log("Aanmaken van kennisbank-embeddings cache...");
        const textsToEmbed = kbData.map(item => item.titel + "\n" + item.tekst); // Combineer titel en tekst voor betere context
        const response = await fetch("https://api.openai.com/v1/embeddings", {
            method: "POST",
            headers: { "Authorization": `Bearer ${env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ input: textsToEmbed, model: "text-embedding-ada-002" }),
        });
        if (!response.ok) {
            console.error("Fout bij ophalen KB embeddings:", await response.text());
            return "Geen relevante informatie gevonden.";
        }
        const { data } = await response.json();
        kbEmbeddingsCache[cacheKey] = data.map(d => d.embedding);
        console.log("Cache aangemaakt.");
    }
    
    // Zet de vraag van de gebruiker om in een "betekeniscode"
    const questionResponse = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: { "Authorization": `Bearer ${env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ input: question, model: "text-embedding-ada-002" }),
    });
    if (!questionResponse.ok) {
        console.error("Fout bij ophalen vraag embedding:", await questionResponse.text());
        return "Geen relevante informatie gevonden.";
    }
    const { data: questionData } = await questionResponse.json();
    const questionEmbedding = questionData[0].embedding;
    
    // Vergelijk de betekenis van de vraag met alle items in de kennisbank
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
    
    // Geef de tekst van de beste 3 matches terug als de beste match goed genoeg is
    if (matches.length > 0 && matches[0].score > 0.78) {
        // We voegen de titel toe aan de context voor de AI
        return matches.slice(0, topK).map(match => `--- BRON: ${kbData[match.index].titel} ---\n${kbData[match.index].tekst}`).join('\n\n');
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

            // De enige zoekmethode: semantisch zoeken in de volledige kennisbank
            const object = await env.KB_BUCKET.get('kb_master.json');
            if (object === null) throw new Error('Kennisbank (kb_master.json) niet gevonden in R2.');
            const kbData = await object.json();
            
            const context = await findSemanticBestMatches(question, kbData, env);
            
            const systemPrompt = `Je bent een expert-assistent voor de Diabetes Liga Midden-Limburg. Antwoord altijd in het Nederlands.
            
            Jouw taak is om de vraag van de gebruiker te beantwoorden op basis van de meegeleverde CONTEXT. De context bevat één of meerdere documenten, gescheiden door '---'.
            
            **INSTRUCTIES:**
            1.  Analyseer de vraag en de context. Synthetiseer de informatie uit ALLE relevante documenten in de context tot één vloeiend, compleet en accuraat antwoord.
            2.  Als de context "Geen relevante informatie gevonden." is, gebruik dan je algemene kennis. Start je antwoord met "Op basis van algemene informatie...".
            3.  Als een link (URL) wordt vermeld in de context, neem deze dan ALTIJD op in je antwoord.
            4.  Wees professioneel, behulpzaam en direct. Formuleer het antwoord alsof het direct van een expert komt.
            
            CONTEXT:
            ${context}`;
            
            const messages = [{ role: 'system', content: systemPrompt }, { role: 'user', content: question }];

            // GEBRUIK DE KRACHTIGE OPENAI API
            const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "gpt-4o", // Het beste en snelste model
                    messages: messages
                })
            });

            // Stuur het antwoord van OpenAI direct door naar de gebruiker
            return new Response(await openAIResponse.body, {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });

        } catch (e) {
            return new Response(`Er is een fout opgetreden: ${e.message}`, { status: 500, headers: corsHeaders });
        }
    },
};