// === MINI-DATABASE (voor hardgecodeerde, perfecte antwoorden) ===
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
    ],
    events: [
        { type: "Infosessie", titel: "Nieuwe technieken nieuwe medicatie", datum: "donderdag 27 november 2025", tijd: "20.00 u - 22.00 u", locatie: "JZ aula Salvator Ziekenhuis, Hasselt", spreker: "Eddy Foulon, Apotheker", prijs: "gratis" },
        { type: "Infosessie", titel: "Praatcafé", datum: "donderdag 16 oktober 2025", tijd: "20.00 u - 22.00 u", locatie: "JZ aula Salvator Ziekenhuis, Hasselt", spreker: "team diabetesconventie Hasselt", prijs: "gratis" },
        { type: "Infosessie", titel: "All-in Holiday", datum: "dinsdag 9 december 2025", tijd: "19.00 u - 21.00 u", locatie: "Personeelscafetaria az Vesalius, Tongeren", spreker: "Diëtisten van de diabetesconventie AZ Vesalius", prijs: "gratis" },
        { type: "Activiteit", titel: "Culturele uitstap Herkenrode", datum: "zaterdag 27 september 2025", tijd: "14.00 u", locatie: "parking domein Herkenrode", gids: "Alex Ghys", prijs: "€ 7,00 p.p." },
        { type: "Activiteit", titel: "Wandelevenement Wereld Diabetes Dag 2025", datum: "zondag 16 november 2025", tijd: "9.00 u - 18.00 u", locatie: "Natuurpunt Hasselt", prijs: "volwassenen € 2,00 p.p., kinderen gratis" },
        { type: "Activiteit", titel: "Ledenfeest 2025", datum: "zaterdag 13 december 2025", tijd: "11.30 u", locatie: "zaal De Ploeg, Diepenbeek", prijs: "€ 45.00 p.p." },
        { type: "Activiteit", titel: "Wekelijkse wandeling", datum: "iedere zondag", tijd: "9.30 u - 11.30 u", locatie: "Kiewit - Hasselt", gids: "Jan Pierco", prijs: "gratis" }
    ]
};

// De "RECEPTIONIST" voor 100% betrouwbare antwoorden op lijst-vragen
function findStructuredAnswer(question) {
    const q = question.toLowerCase();
    
    // Vragen over het bestuur
    if (q.includes('alle bestuursleden') || q.includes('lijst van het bestuur')) {
        const fullDetails = structuredData.contacts.map(c => `${c.name} (${c.functions.join(', ')}):\n- E-mail: ${c.email}\n- Telefoon: ${c.phone}`).join('\n\n');
        return `Hier is de volledige lijst van de bestuursleden:\n\n${fullDetails}`;
    }

    // Vragen over evenementen
    const eventKeywords = ['activiteiten', 'agenda', 'programma', 'evenementen'];
    if (eventKeywords.some(kw => q.includes(kw))) {
        let eventsToList = structuredData.events;
        let responseTitle = "Hier is een overzicht van alle geplande activiteiten:\n\n";

        if (q.includes('infosessies')) {
            eventsToList = structuredData.events.filter(e => e.type === "Infosessie");
            responseTitle = "Hier is een overzicht van alle geplande infosessies:\n\n";
        } else if (q.includes('cultuur') || q.includes('ontspanning')) {
            eventsToList = structuredData.events.filter(e => e.type === "Activiteit");
             responseTitle = "Hier is een overzicht van alle geplande cultuur- en ontspanningsactiviteiten:\n\n";
        }
        
        const eventList = eventsToList.map(e => `- ${e.titel} op ${e.datum}`).join('\n');
        return responseTitle + eventList;
    }

    return null; // Geen match, geef door aan de "Bibliothecaris"
}

// De "BIBLIOTHECARIS" voor slimme antwoorden op alle andere vragen
let kbEmbeddingsCache = {};
async function findSemanticBestMatches(question, kbData, env, topK = 3) {
    const cacheKey = "all_items_cache";
    if (!kbEmbeddingsCache[cacheKey]) {
        const textsToEmbed = kbData.map(item => item.titel + "\n" + item.tekst);
        const response = await fetch("https://api.openai.com/v1/embeddings", { method: "POST", headers: { "Authorization": `Bearer ${env.OPENAI_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ input: textsToEmbed, model: "text-embedding-ada-002" }), });
        if (!response.ok) { console.error("Fout bij ophalen KB embeddings:", await response.text()); return "Geen relevante informatie gevonden."; }
        const { data } = await response.json();
        kbEmbeddingsCache[cacheKey] = data.map(d => d.embedding);
    }
    const questionResponse = await fetch("https://api.openai.com/v1/embeddings", { method: "POST", headers: { "Authorization": `Bearer ${env.OPENAI_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ input: question, model: "text-embedding-ada-002" }), });
    if (!questionResponse.ok) { console.error("Fout bij ophalen vraag embedding:", await questionResponse.text()); return "Geen relevante informatie gevonden."; }
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
    if (matches.length > 0 && matches[0].score > 0.78) {
        return matches.slice(0, topK).map(match => `--- BRON: ${kbData[match.index].titel} ---\n${kbData[match.index].tekst}`).join('\n\n');
    }
    return "Geen relevante informatie gevonden.";
}

// === HOOFDFUNCTIE ===
export default {
    async fetch(request, env) {
        const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
        if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
        if (request.method !== 'POST') return new Response('Methode niet toegestaan', { status: 405, headers: corsHeaders });
        try {
            const { question } = await request.json();
            if (!question) return new Response('Vraag ontbreekt.', { status: 400, headers: corsHeaders });

            let finalAnswer = findStructuredAnswer(question);
            let contextForDisclaimer = "Geen relevante informatie gevonden.";

            if (!finalAnswer) {
                const object = await env.KB_BUCKET.get('kb_master.json');
                if (object === null) throw new Error('Kennisbank (kb_master.json) niet gevonden in R2.');
                const kbData = await object.json();
                
                const context = await findSemanticBestMatches(question, kbData, env);
                contextForDisclaimer = context; // Onthoud of we iets vonden
                
                const systemPrompt = `Je bent een expert-assistent voor de Diabetes Liga Midden-Limburg. Antwoord altijd in het Nederlands. Jouw taak is om de vraag van de gebruiker te beantwoorden op basis van de meegeleverde CONTEXT.
                INSTRUCTIES:
                1. Analyseer de vraag en de context. Synthetiseer de informatie uit ALLE relevante documenten in de context tot één vloeiend, compleet en accuraat antwoord.
                2. Als de context "Geen relevante informatie gevonden." is, gebruik dan je algemene kennis.
                3. Als een link (URL) wordt vermeld, neem deze dan ALTIJD op in je antwoord. Schrijf de URL volledig uit. GEBRUIK GEEN Markdown opmaak.
                CONTEXT: ${context}`;
                
                const messages = [{ role: 'system', content: systemPrompt }, { role: 'user', content: question }];

                const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
                    body: JSON.stringify({ model: "gpt-4o", messages: messages })
                });

                if (!openAIResponse.ok) throw new Error(`OpenAI API fout: ${openAIResponse.status}`);
                
                const responseData = await openAIResponse.json();
                finalAnswer = responseData.choices[0].message.content;
            }
            
            // Disclaimer logica
            if (contextForDisclaimer !== "Geen relevante informatie gevonden.") {
                 finalAnswer += "\n\nLet op: deze informatie is van algemene aard. Voor persoonlijk medisch advies, raadpleeg altijd uw arts.";
            } else if (!findStructuredAnswer(question)) { // Alleen als het niet door de receptionist is beantwoord
                 finalAnswer += "\n\nHoud er rekening mee dat ik voornamelijk ben ontworpen om vragen over diabetes en de Diabetes Liga Midden-Limburg te beantwoorden.";
            }

            const responsePayload = { choices: [{ message: { role: 'assistant', content: finalAnswer } }] };
            return new Response(JSON.stringify(responsePayload), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        } catch (e) {
            return new Response(`Er is een fout opgetreden: ${e.message}`, { status: 500, headers: corsHeaders });
        }
    },
};