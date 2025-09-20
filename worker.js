// === MINI-DATABASE (VOLLEDIGE VERSIE) ===
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
    // Infosessies
    { type: "Infosessie", titel: "Geef darmkanker geen kans", datum: "maandag 15 september 2025", tijd: "19.00 u - 21.30 u", locatie: "JZ aula Salvator Ziekenhuis, Salvatorstraat 20, 3500 Hasselt", spreker: "Dr. Luc Colemont", prijs: "gratis", parking: "gratis (tickets)", inlichtingen: "midden.limburg@diabetes.be", inschrijven: "www.dlml.be/darmkanker/", organisatie: ["Diabetes Liga", "Eerstelijnszone Herkenrode", "Wildgroei", "Jessa Ziekenhuis", "Stoma Ilco"] },
    { type: "Infosessie", titel: "Nieuwe technieken nieuwe medicatie", datum: "donderdag 27 november 2025", tijd: "20.00 u - 22.00 u", locatie: "JZ aula Salvator Ziekenhuis, Salvatorstraat 20, 3500 Hasselt", spreker: "Eddy Foulon, Apotheker", prijs: "gratis", parking: "gratis (tickets)", inlichtingen: "midden.limburg@diabetes.be", inschrijven: "www.dlml.be/nieuwetechnieken/" },
    { type: "Infosessie", titel: "Praatcafé", datum: "donderdag 16 oktober 2025", tijd: "20.00 u - 22.00 u", locatie: "JZ aula Salvator Ziekenhuis, Salvatorstraat 20, 3500 Hasselt", spreker: "team diabetesconventie Hasselt", prijs: "gratis", parking: "gratis (tickets)", methode: "groepsgesprek", inlichtingen: "midden.limburg@diabetes.be", inschrijven: "www.dlml.be/praatcafe/" },
    { type: "Infosessie", titel: "All-in Holiday", datum: "dinsdag 9 december 2025", tijd: "19.00 u - 21.00 u", locatie: "Personeelscafetaria az Vesalius, Hazelereik 51, 3700 Tongeren", spreker: "Diëtisten van de diabetesconventie AZ Vesalius", prijs: "gratis", parking: "gratis", inlichtingen: "midden.limburg@diabetes.be", inschrijven: "www.dlml.be/holiday/" },
    // Cultuur
    { type: "Activiteit", titel: "Gezellige fietstocht", datum: "zaterdag 20 september 2025", tijd: "14.00 u", locatie: "parking kinderboerderij Kiewit, Putvennestraat 110, 3500 Hasselt", afstand: "± 33 km", prijs: "gratis", parking: "gratis", etentje: "achteraf Koe-Vert Kiewit (facultatief, ter plaatse te betalen)", inlichtingen: "midden.limburg@diabetes.be", inschrijven: "www.dlml.be/fietstocht/" },
    { type: "Activiteit", titel: "Culturele uitstap Herkenrode", datum: "zaterdag 27 september 2025", tijd: "14.00 u", locatie: "parking domein Herkenrode", afstand: "± 5 km", gids: "Alex Ghys", prijs: "wandeling + bezoek € 7,00 p.p.", etentje: "achteraf restaurant 'De paardenstallen' (facultatief, ter plaatse te betalen)", inlichtingen: "midden.limburg@diabetes.be", inschrijven: "www.dlml.be/uitstap/" },
    { type: "Activiteit", titel: "Wandelevenement Wereld Diabetes Dag 2025", datum: "zondag 16 november 2025", tijd: "9.00 u - 18.00 u", locatie: "Natuurpunt Hasselt, Putvennestraat 112, 3500 Hasselt", prijs: "volwassenen € 2,00 p.p., kinderen gratis", parking: "gratis", inlichtingen: "midden.limburg@diabetes.be", inschrijven: "www.dlml.be/wandelingWDD/" },
    { type: "Activiteit", titel: "Ledenfeest 2025", datum: "zaterdag 13 december 2025", tijd: "11.30 u", locatie: "zaal Elckerlyc, Pastorijstraat 4, Sint-Lambrechts-Herk", prijs: "€ 40.00 p.p.", parking: "gratis", inlichtingen: "midden.limburg@diabetes.be", opmerking: "Meer informatie volgt" },
    { type: "Activiteit", titel: "Wekelijkse wandeling", datum: "iedere zondag", tijd: "9.30 u - 11.30 u", locatie: "Putvennestraat 110, Kiewit - Hasselt", afstand: "4 of 8 km (Kiewit - Bokrijk - Kiewit)", gids: "Jan Pierco", prijs: "gratis", parking: "gratis", inlichtingen: "midden.limburg@diabetes.be", inschrijven: "niet verplicht" }
  ],
  general: {
    email: "midden.limburg@diabetes.be",
    website: "www.diabetes.be",
    social: {
        facebook: "https://www.facebook.com/p/Diabetes-Liga-Midden-Limburg-100091325418693",
        instagram: "https://www.instagram.com/diabetes_liga_midden_limburg/",
        youtube: "https://www.youtube.com/@Diabetesligamiddenlimburg"
    }
  }
};

// De rest van het bestand (zoekfuncties en de worker zelf) is ongewijzigd gebleven...
// Ik plak het hier opnieuw voor de volledigheid, maar alleen de 'structuredData' hierboven is aangepast.

function handleContactQuestion(question) {
    const q = question.toLowerCase();
    let results = [];
    for (const contact of structuredData.contacts) {
        if (q.includes(contact.name.toLowerCase().split(' ')[0])) { results.push(contact); }
    }
    if (results.length > 0) {
        return `Hier zijn de gegevens die ik kon vinden: ${results.map(c => `${c.name} (${c.functions.join(', ')}): E-mail: ${c.email}, Telefoon: ${c.phone}`).join('. ')}`;
    }
    if (q.includes('bestuur') || q.includes('contact')) {
        return `De bestuursleden zijn: ${structuredData.contacts.map(c => c.name).join(', ')}. Het algemene e-mailadres is ${structuredData.general.email}.`;
    }
    return null;
}

function handleEventQuestion(question) {
    const q = question.toLowerCase();
    const months = { 'januari': 0, 'februari': 1, 'maart': 2, 'april': 3, 'mei': 4, 'juni': 5, 'juli': 6, 'augustus': 7, 'september': 8, 'oktober': 9, 'november': 10, 'december': 11 };
    let targetMonth = -1;
    const searchTerms = new Set(q.replace(/[.,!?;:"()]/g, "").split(/\s+/).filter(w => w.length > 3 && !months[w]));
    for (const month in months) {
        if (q.includes(month)) { targetMonth = months[month]; break; }
    }
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
    let matchedEvents = structuredData.events.filter(e => {
        const title = e.titel.toLowerCase();
        for (const term of searchTerms) { if (title.includes(term)) return true; }
        return false;
    });
    if (searchTerms.size > 0 && matchedEvents.length === 1) {
        return `Hier zijn de details voor het evenement:\n\n${formatEventDetails(matchedEvents[0])}`;
    }
    if (matchedEvents.length > 1) {
         return `Ik heb meerdere evenementen gevonden die overeenkomen met uw vraag:\n\n${matchedEvents.map(e => `- ${e.type} '${e.titel}' op ${e.datum}`).join('\n')}\n\nStel een vraag over een specifiek evenement voor meer details.`;
    }
    if (targetMonth !== -1) {
         let monthEvents = structuredData.events.filter(e => {
            try {
                const eventDate = new Date(e.date.replace(/(\w+) (\d+) (\w+) (\d{4})/, '$3 $2, $4'));
                return eventDate.getMonth() === targetMonth;
            } catch { return false; }
        });
        if (monthEvents.length === 0) return `Ik kon geen evenementen vinden voor die maand.`;
        return `Voor die maand heb ik de volgende evenementen gevonden:\n\n${monthEvents.map(e => `- ${e.type} '${e.titel}' op ${e.datum}`).join('\n')}`;
    }
    if (q.includes('activiteit') || q.includes('infosessie') || q.includes('evenement')) {
        return `Hier is een overzicht van alle geplande evenementen:\n\n${structuredData.events.map(e => `- ${e.type} '${e.titel}' op ${e.datum}`).join('\n')}`;
    }
    return null;
}

function findRelevantKbItems(question, kbData, topK = 3) {
    const questionWords = new Set(question.toLowerCase().split(/\s+/).filter(w => w.length > 2));
    const scoredItems = kbData.map(item => {
        const titleWords = new Set((item.titel || "").toLowerCase().split(/\s+/));
        const textWords = new Set((item.tekst || "").toLowerCase().split(/\s+/));
        let score = 0;
        for (const word of questionWords) {
            if (titleWords.has(word)) score += 2;
            if (textWords.has(word)) score += 1;
        }
        return { ...item, score };
    });
    return scoredItems.filter(item => item.score > 0).sort((a, b) => b.score - a.score).slice(0, topK);
}

export default {
  async fetch(request, env) {
    const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
    if (request.method !== 'POST') return new Response('Methode niet toegestaan', { status: 405, headers: corsHeaders });

    try {
        const { question } = await request.json();
        if (!question) return new Response('Vraag ontbreekt.', { status: 400, headers: corsHeaders });

        let specificAnswer = handleContactQuestion(question) || handleEventQuestion(question);
        let finalAnswer;
        if (specificAnswer) {
            finalAnswer = specificAnswer;
        } else {
            const ai = env.AI;
            const object = await env.KB_BUCKET.get('kb_index.json');
            if (object === null) throw new Error('Kennisbank niet gevonden.');
            const kbData = await object.json();
            const relevantItems = findRelevantKbItems(question, kbData);
            const context = relevantItems.length > 0 ? relevantItems.map(item => item.tekst).join('\n\n---\n\n') : "Geen relevante informatie gevonden.";
            const systemPrompt = `Je bent een chatbot voor de Diabetes Liga Midden-Limburg. Beantwoord de vraag van de gebruiker KORT en ALLEEN op basis van de onderstaande CONTEXT. Als het antwoord niet in de context staat, zeg dan: "Mijn excuses, maar ik kan het antwoord op uw vraag niet in mijn kennisbank vinden." Geef direct het antwoord. CONTEXT: ${context}`;
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