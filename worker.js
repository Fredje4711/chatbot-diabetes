// === MINI-DATABASE (voor contacten en evenementen) ===
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
        { type: "Infosessie", titel: "Geef darmkanker geen kans", datum: "maandag 15 september 2025", tijd: "19.00 u - 21.30 u", locatie: "JZ aula Salvator Ziekenhuis, Salvatorstraat 20, 3500 Hasselt", spreker: "Dr. Luc Colemont", prijs: "gratis", parking: "gratis (tickets)", inlichtingen: "midden.limburg@diabetes.be", inschrijven: "www.dlml.be/darmkanker/", organisatie: ["Diabetes Liga", "Eerstelijnszone Herkenrode", "Wildgroei", "Jessa Ziekenhuis", "Stoma Ilco"] },
        { type: "Infosessie", titel: "Nieuwe technieken nieuwe medicatie", datum: "donderdag 27 november 2025", tijd: "20.00 u - 22.00 u", locatie: "JZ aula Salvator Ziekenhuis, Salvatorstraat 20, 3500 Hasselt", spreker: "Eddy Foulon, Apotheker", prijs: "gratis", parking: "gratis (tickets)", inlichtingen: "midden.limburg@diabetes.be", inschrijven: "www.dlml.be/nieuwetechnieken/" },
        { type: "Infosessie", titel: "Praatcafé", datum: "donderdag 16 oktober 2025", tijd: "20.00 u - 22.00 u", locatie: "JZ aula Salvator Ziekenhuis, Salvatorstraat 20, 3500 Hasselt", spreker: "team diabetesconventie Hasselt", prijs: "gratis", parking: "gratis (tickets)", methode: "groepsgesprek", inlichtingen: "midden.limburg@diabetes.be", inschrijven: "www.dlml.be/praatcafe/" },
        { type: "Infosessie", titel: "All-in Holiday", datum: "dinsdag 9 december 2025", tijd: "19.00 u - 21.00 u", locatie: "Personeelscafetaria az Vesalius, Hazelereik 51, 3700 Tongeren", spreker: "Diëtisten van de diabetesconventie AZ Vesalius", prijs: "gratis", parking: "gratis", inlichtingen: "midden.limburg@diabetes.be", inschrijven: "www.dlml.be/holiday/" },
        { type: "Activiteit", titel: "Gezellige fietstocht", datum: "zaterdag 20 september 2025", tijd: "14.00 u", locatie: "parking kinderboerderij Kiewit, Putvennestraat 110, 3500 Hasselt", afstand: "± 33 km", prijs: "gratis", parking: "gratis", etentje: "achteraf Koe-Vert Kiewit (facultatief, ter plaatse te betalen)", inlichtingen: "midden.limburg@diabetes.be", inschrijven: "www.dlml.be/fietstocht/" },
        { type: "Activiteit", titel: "Culturele uitstap Herkenrode", datum: "zaterdag 27 september 2025", tijd: "14.00 u", locatie: "parking domein Herkenrode", afstand: "± 5 km", gids: "Alex Ghys", prijs: "wandeling + bezoek € 7,00 p.p.", etentje: "achteraf restaurant 'De paardenstallen' (facultatief, ter plaatse te betalen)", inlichtingen: "midden.limburg@diabetes.be", inschrijven: "www.dlml.be/uitstap/" },
        { type: "Activiteit", titel: "Wandelevenement Wereld Diabetes Dag 2025", datum: "zondag 16 november 2025", tijd: "9.00 u - 18.00 u", locatie: "Natuurpunt Hasselt, Putvennestraat 112, 3500 Hasselt", prijs: "volwassenen € 2,00 p.p., kinderen gratis", parking: "gratis", inlichtingen: "midden.limburg@diabetes.be", inschrijven: "www.dlml.be/wandelingWDD/" },
        { type: "Activiteit", titel: "Ledenfeest 2025", datum: "zaterdag 13 december 2025", tijd: "11.30 u", locatie: "zaal Elckerlyc, Pastorijstraat 4, Sint-Lambrechts-Herk", prijs: "€ 40.00 p.p.", parking: "gratis", inlichtingen: "midden.limburg@diabetes.be", opmerking: "Meer informatie volgt" },
        { type: "Activiteit", titel: "Wekelijkse wandeling", datum: "iedere zondag", tijd: "9.30 u - 11.30 u", locatie: "Putvennestraat 110, Kiewit - Hasselt", afstand: "4 of 8 km (Kiewit - Bokrijk - Kiewit)", gids: "Jan Pierco", prijs: "gratis", parking: "gratis", inlichtingen: "midden.limburg@diabetes.be", inschrijven: "niet verplicht" }
    ],
    general: {
        email: "midden.limburg@diabetes.be",
        website: "www.diabetes.be"
    }
};

// === HULPFUNCTIES ===
const formatEventDetails = (e) => {
    let details = [`Titel: ${e.titel}`, `Datum: ${e.datum}`, `Tijd: ${e.tijd}`, `Locatie: ${e.locatie}`, `Prijs: ${e.prijs}`];
    if (e.spreker) details.push(`Spreker: ${e.spreker}`);
    if (e.gids) details.push(`Gids: ${e.gids}`);
    if (e.afstand) details.push(`Afstand: ${e.afstand}`);
    if (e.parking) details.push(`Parking: ${e.parking}`);
    if (e.etentje) details.push(`Etentje: ${e.etentje}`);
    if (e.inschrijven && e.inschrijven !== "niet verplicht") details.push(`Inschrijven: ${e.inschrijven}`);
    if (e.inlichtingen) details.push(`Inlichtingen: ${e.inlichtingen}`);
    if (e.opmerking) details.push(`Opmerking: ${e.opmerking}`);
    if (e.organisatie) details.push(`Organisatie: ${e.organisatie.join(', ')}`);
    if (e.methode) details.push(`Methode: ${e.methode}`);
    return details.join('\n');
};

const getCleanWords = (text) => new Set(text.toLowerCase().replace(/[.,!?;:"()]/g, "").split(/\s+/).filter(w => w.length > 2));

// === FINALE VERSIE - SPECIFIEKE ZOEKFUNCTIE ===
function findSpecificAnswer(question) {
    const q = question.toLowerCase();
    
    // 1. Zoek naar contacten
    // Trigger voor de volledige, gedetailleerde lijst
    if (q.includes('alle bestuursleden') || q.includes('lijst van het bestuur') || q.includes('volledige gegevens bestuur')) {
        const fullDetails = structuredData.contacts.map(c => {
            return `${c.name} (${c.functions.join(', ')}):\n- E-mail: ${c.email}\n- Telefoon: ${c.phone}`;
        }).join('\n\n');
        return `Hier is de volledige lijst van de bestuursleden en hun contactgegevens:\n\n${fullDetails}`;
    }

    // Zoek naar een specifiek persoon
    for (const contact of structuredData.contacts) {
        if (q.includes(contact.name.toLowerCase().split(' ')[0])) {
            return `Hier zijn de gegevens van ${contact.name} (${contact.functions.join(', ')}): E-mail: ${contact.email}, Telefoon: ${contact.phone}`;
        }
    }
    
    // Algemene vraag over het bestuur (korte versie)
    if (q.includes('bestuur') || q.includes('contact')) {
        return `De bestuursleden zijn: ${structuredData.contacts.map(c => c.name).join(', ')}. Het algemene e-mailadres is ${structuredData.general.email}. Voor de volledige lijst, vraag "geef alle bestuursleden".`;
    }

    // 2. Zoek naar evenementen (deze logica blijft hetzelfde)
    const months = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
    let targetMonth = months.find(m => q.includes(m));
    if (targetMonth) {
        const monthEvents = structuredData.events.filter(e => e.datum.toLowerCase().includes(targetMonth));
        if (monthEvents.length === 0) return `Ik kon geen evenementen vinden voor de maand ${targetMonth}.`;
        return `Voor ${targetMonth} heb ik de volgende evenementen gevonden:\n\n` + monthEvents.map(e => formatEventDetails(e)).join('\n\n');
    }

    const scoredEvents = structuredData.events.map(event => {
        const titleWords = getCleanWords(event.titel);
        let score = 0;
        getCleanWords(question).forEach(qw => {
            if (titleWords.has(qw)) score++;
        });
        return { ...event, score };
    }).filter(e => e.score > 0).sort((a, b) => b.score - a.score);

    if (scoredEvents.length > 0 && scoredEvents[0].score >= 2) {
        return `Hier zijn de details voor het evenement:\n\n${formatEventDetails(scoredEvents[0])}`;
    }

    return null;
}


// === FUNCTIES VOOR SEMANTISCH ZOEKEN ===
let kbEmbeddingsCache = {};

async function findSemanticBestMatch(question, kbData, env) {
    const cacheKey = "all_titles";
    if (!kbEmbeddingsCache[cacheKey]) {
        console.log("Aanmaken van kennisbank-embeddings cache...");
        const titles = kbData.map(item => item.titel || "");
        const response = await fetch("https://api.openai.com/v1/embeddings", {
            method: "POST",
            headers: { "Authorization": `Bearer ${env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ input: titles, model: "text-embedding-ada-002" }),
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
    
    let bestMatch = { score: -1, index: -1 };
    for (let i = 0; i < kbEmbeddingsCache[cacheKey].length; i++) {
        let dotProduct = 0, normA = 0, normB = 0;
        for (let j = 0; j < questionEmbedding.length; j++) {
            dotProduct += questionEmbedding[j] * kbEmbeddingsCache[cacheKey][i][j];
            normA += questionEmbedding[j] ** 2;
            normB += kbEmbeddingsCache[cacheKey][i][j] ** 2;
        }
        const score = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
        if (score > bestMatch.score) {
            bestMatch = { score, index: i };
        }
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

            let finalAnswer = findSpecificAnswer(question);

            if (!finalAnswer) {
                const object = await env.KB_BUCKET.get('kb_index.json');
                if (object === null) throw new Error('Kennisbank niet gevonden.');
                const kbData = await object.json();
                
                const context = await findSemanticBestMatch(question, kbData, env);
                
                const ai = env.AI;
                const systemPrompt = `Je bent een chatbot voor de Diabetes Liga Midden-Limburg. Beantwoord de vraag van de gebruiker. Gebruik de onderstaande CONTEXT om het antwoord te formuleren. Geef de informatie uit de context zo letterlijk mogelijk weer. Vat niet onnodig samen. Als de context "Geen relevante informatie gevonden." is, zeg dan: "Mijn excuses, maar ik kan het antwoord op uw vraag niet in mijn kennisbank vinden." Geef direct het antwoord. CONTEXT: ${context}`;
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