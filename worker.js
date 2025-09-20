// === MINI-DATABASE (Alleen voor contacten) ===
const structuredData = {
    contacts: [
        { name: "Guido Smets", functions: ["Covoorzitter", "Penningmeester"], email: "guido.smets4@telenet.be", phone: "0474 32 44 14" },
        { name: "Eddy Foulon", functions: ["Covoorzitter", "Medisch adviseur"], email: "eddy.foulon@telenet.be", phone: "0472 37 98 50" },
        { name: "André Latet", functions: ["Webmaster", "Bestuurslid"], email: "andre.latet@telenet.be", phone: "0474 27 56 62" },
        { name: "Marita Baerten", functions: ["Diabeteseducator", "Bestuurslid"], email: "marita.baerten@telenet.be", phone: "0498 44 13 50" },
        { name: "Theo Hustings", functions: ["Bestuurslid"], email: "theohustings@scarlet.be", phone: "0479 89 21 15" },
        { name: "Freddy Sleeuwaert", functions: ["Bestuurslid"], email: "fredje_s@skynet.be", phone: "0479 85 09 97" },
        { name: "Greta Paesmans", functions: ["Bestuurslid"], email: "etienne.greta@gmail.com", phone: "0496 95 80 62" },
        { name: "Laurent Delbroek", functions: ["Bestuurslid"], email: "laurentdelbroek@gmail.com", phone: "0473 89 00 46" }
    ]
};

// === ZOEKFUNCTIES ===

// Deze functie geeft een GEGARANDEERD correct antwoord voor contact-vragen.
function findContactAnswer(question) {
    const q = question.toLowerCase();
    
    // Trigger voor de volledige, gedetailleerde lijst
    const fullListTriggers = ['alle bestuursleden', 'lijst van het bestuur', 'volledige gegevens bestuur', 'alle contactgegevens'];
    if (fullListTriggers.some(trigger => q.includes(trigger))) {
        const fullDetails = structuredData.contacts.map(c => {
            return `${c.name} (${c.functions.join(', ')}):\n- E-mail: ${c.email}\n- Telefoon: ${c.phone}`;
        }).join('\n\n');
        return `Hier is de volledige lijst van de bestuursleden en hun contactgegevens:\n\n${fullDetails}`;
    }

    // Zoek naar een specifiek persoon
    for (const contact of structuredData.contacts) {
        if (q.includes(contact.name.toLowerCase().split(' ')[0])) {
            return `Hier zijn de gegevens van ${contact.name} (${contact.functions.join(', ')}):\n- E-mail: ${contact.email}\n- Telefoon: ${contact.phone}`;
        }
    }
    
    // Algemene vraag over het bestuur (korte versie)
    if (q.includes('bestuur') || q.includes('contact')) {
        return `De bestuursleden zijn: ${structuredData.contacts.map(c => c.name).join(', ')}. Voor de volledige lijst, vraag bijvoorbeeld "geef alle bestuursleden".`;
    }

    return null; // Geen contactvraag
}

// Semantische zoekfunctie voor de algemene kennisbank
let kbEmbeddingsCache = {};
async function findSemanticBestMatches(question, kbData, env, topK = 3) {
    // ... (deze functie blijft exact hetzelfde als in de vorige versie)
    const cacheKey = "all_items_cache";
    if (!kbEmbeddingsCache[cacheKey]) {
        console.log("Aanmaken van kennisbank-embeddings cache...");
        const textsToEmbed = kbData.map(item => item.titel + "\n" + item.tekst);
        const response = await fetch("https://api.openai.com/v1/embeddings", { method: "POST", headers: { "Authorization": `Bearer ${env.OPENAI_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ input: textsToEmbed, model: "text-embedding-ada-002" }), });
        if (!response.ok) throw new Error("Kon geen embeddings voor de kennisbank ophalen.");
        const { data } = await response.json();
        kbEmbeddingsCache[cacheKey] = data.map(d => d.embedding);
        console.log("Cache aangemaakt.");
    }
    const questionResponse = await fetch("https://api.openai.com/v1/embeddings", { method: "POST", headers: { "Authorization": `Bearer ${env.OPENAI_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ input: question, model: "text-embedding-ada-002" }), });
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
    if (matches[0].score < 0.8) return "Geen relevante informatie gevonden."; // Drempelwaarde
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

            // EERST controleren op een hardgecodeerd, perfect antwoord
            let finalAnswer = findContactAnswer(question);

            // ALS die er niet is, dan de AI gebruiken
            if (!finalAnswer) {
                const object = await env.KB_BUCKET.get('kb_master.json');
                if (object === null) throw new Error('Kennisbank (kb_master.json) niet gevonden in R2.');
                const kbData = await object.json();
                
                const context = await findSemanticBestMatches(question, kbData, env);
                
                const ai = env.AI;
                const systemPrompt = `Je bent een chatbot voor de Diabetes Liga Midden-Limburg.
                1. Als de CONTEXT hieronder relevante informatie bevat, baseer je antwoord dan VOLLEDIG op die context.
                2. Als de CONTEXT "Geen relevante informatie gevonden." is, gebruik dan je ALGEMENE kennis en zeg: "Op basis van algemene informatie, ...".
                CONTEXT: ${context}`;
                
                const messages = [{ role: 'system', content: systemPrompt }, { role: 'user', content: question }];
                const aiResponse = await ai.run('@cf/meta/llama-3-8b-instruct', { messages });
                finalAnswer = aiResponse.response;
            }
            
            const responsePayload = { choices: [{ message: { role: 'assistant', content: finalAnswer } }] };
            return new Response(JSON.stringify(responsePayload), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        } catch (e) {
            return new Response(`Er is een fout opgetreden: ${e.message}`, { status: 500, headers: corsHeaders });
        }
    },
};