// --- 1. STRUCTURED DATA: CONTACTEN, EVENEMENTEN, DLML ALGEMENE INFO ---
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
  ],

general: {
  email: "midden.limburg@diabetes.be",
  website: "https://www.dlml.be/",
  regio: "Onze afdeling bestrijkt de regio Midden-Limburg. Deze omvat volgende steden en gemeenten: Alken, Bilzen, Borgloon, Diepenbeek, Hasselt, Herk-De-Stad, Herstappen, Hoeselt, Kortessem, Tongeren, Wellen en Zonhoven.",
  lidmaatschap: "U kunt lid worden via www.diabetes.be of door contact op te nemen via e-mail. Lidmaatschap biedt toegang tot infosessies, nieuwsbrieven en begeleiding.",
  social: {
    facebook: "https://www.facebook.com/p/Diabetes-Liga-Midden-Limburg-100091325418693",
    instagram: "https://www.instagram.com/diabetes_liga_midden_limburg/",
    youtube: "https://www.youtube.com/@Diabetesligamiddenlimburg"
  }
}

};

// --- 2. HULPFUNCTIES ---

function findStructuredAnswer(q) {
  q = q.toLowerCase();

  // 🔹 Bestuursleden
  if (q.includes("alle bestuursleden") || q.includes("lijst van het bestuur")) {
    return structuredData.contacts.map(c =>
      `${c.name} (${c.functions.join(', ')}):\n- E-mail: ${c.email}\n- Telefoon: ${c.phone}`
    ).join('\n\n');
  }

  // 🔹 Individuele bestuursleden
  for (const contact of structuredData.contacts) {
    if (q.includes(contact.name.toLowerCase().split(' ')[0])) {
      return `Hier zijn de gegevens van ${contact.name} (${contact.functions.join(', ')}):\n- E-mail: ${contact.email}\n- Telefoon: ${contact.phone}`;
    }
  }

  // 🔹 Algemeen contact
  if (q.includes("bestuur") || q.includes("contact") || q.includes("email") || q.includes("website")) {
    return `Het algemene e-mailadres is ${structuredData.general.email}, website: ${structuredData.general.website}.`;
  }

  // 🔹 Sociale media
  if (q.includes("facebook") || q.includes("instagram") || q.includes("youtube") || q.includes("sociale media")) {
    const s = structuredData.general.social;
    return `Je vindt ons op:\n- Facebook: ${s.facebook}\n- Instagram: ${s.instagram}\n- YouTube: ${s.youtube}`;
  }

  // 🔹 Lidmaatschap
  if (q.includes("lid worden") || q.includes("hoe lid") || q.includes("lidmaatschap")) {
    return structuredData.general.lidmaatschap;
  }

  // 🔹 Regio / steden
  if (q.includes("midden-limburg") || q.includes("regio") || q.includes("steden") || q.includes("gemeenten")) {
    return structuredData.general.regio;
  }

  // 🔹 Wandelvragen
  if (q.includes("wandeling") || q.includes("wandelen") || q.includes("wandelingen")) {
    const wandelingen = structuredData.events.filter(e =>
      e.titel.toLowerCase().includes("wandel")
    );
    if (wandelingen.length > 0) {
      return "Geplande wandelactiviteiten:\n\n" + wandelingen.map(e =>
        `• ${e.titel} op ${e.datum} te ${e.locatie}`
      ).join('\n');
    } else {
      return "Er zijn momenteel geen wandelingen gepland.";
    }
  }

  // 🔹 Activiteiten (ruimere detectie)
  const maanden = ["september", "oktober", "november", "december"];
  const maand = maanden.find(m => q.includes(m));
  if (maand) {
    const result = structuredData.events.filter(e => e.datum.toLowerCase().includes(maand));
    if (result.length > 0) {
      return `Activiteiten in ${maand}:\n\n` + result.map(e => `• ${e.titel} op ${e.datum} te ${e.locatie}`).join('\n');
    } else {
      return `Geen activiteiten gevonden voor ${maand}.`;
    }
  }

  if (
    q.includes("activiteiten") || q.includes("agenda") || q.includes("evenement") ||
    q.includes("wat is er te doen") || q.includes("infosessie") || q.includes("infosessies")
  ) {
    return `Enkele geplande activiteiten:\n\n` + structuredData.events.map(e =>
      `• ${e.titel} op ${e.datum} (${e.type})`
    ).join('\n');
  }

  return null;
}


let kbEmbeddingsCache = {};

async function findSemanticBestMatch(question, kbData, env) {
  const cacheKey = "kb_embeddings";

  if (!kbEmbeddingsCache[cacheKey]) {
    const tekstBlokken = kbData.map(item => `${item.titel}\n${item.tekst}`);
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ input: tekstBlokken, model: "text-embedding-ada-002" })
    });
    if (!response.ok) return "Geen relevante informatie gevonden.";
    const { data } = await response.json();
    kbEmbeddingsCache[cacheKey] = data.map(d => d.embedding);
  }

  const vraagResponse = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ input: question, model: "text-embedding-ada-002" })
  });
  if (!vraagResponse.ok) return "Geen relevante informatie gevonden.";
  const { data: vraagData } = await vraagResponse.json();
  const vraagEmbedding = vraagData[0].embedding;

  let besteMatch = { score: -1, index: -1 };
  for (let i = 0; i < kbEmbeddingsCache[cacheKey].length; i++) {
    let dot = 0, normQ = 0, normK = 0;
    for (let j = 0; j < vraagEmbedding.length; j++) {
      dot += vraagEmbedding[j] * kbEmbeddingsCache[cacheKey][i][j];
      normQ += vraagEmbedding[j] ** 2;
      normK += kbEmbeddingsCache[cacheKey][i][j] ** 2;
    }
    const score = dot / (Math.sqrt(normQ) * Math.sqrt(normK));
    if (score > besteMatch.score) {
      besteMatch = { score, index: i };
    }
  }

  if (besteMatch.score > 0.82) {
    return kbData[besteMatch.index].tekst;
  }

  return "Geen relevante informatie gevonden.";
}

async function generateGPTAnswer(question, context, env) {
  const systemPrompt = `
Je bent een Nederlandstalige chatbot voor de Diabetes Liga Midden-Limburg.

1. Als de CONTEXT hieronder relevante informatie bevat, baseer je antwoord dan VOLLEDIG op die context.
2. Als de CONTEXT exact "Geen relevante informatie gevonden." is, gebruik dan je ALGEMENE GPT-kennis.
3. Als je zelfs dan geen nuttig antwoord weet, zeg dan letterlijk:
"Mijn excuses, maar ik kan geen antwoord op uw vraag vinden. Voor meer informatie kunt u terecht op onze website www.dlml.be of mailen naar midden.limburg@diabetes.be."

CONTEXT:
${context}
`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: question }
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ model: "gpt-4o", messages })
  });

  const data = await response.json();
  if (!data || !data.choices || !data.choices[0]) {
    return "Er is een fout opgetreden bij het ophalen van het GPT-antwoord.";
  }

  return data.choices[0].message.content.trim();
}

// --- FETCH HANDLER ---
export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response("Methode niet toegestaan", { status: 405, headers: corsHeaders });
    }

    try {
      const { question } = await request.json();
      if (!question) {
        return new Response("Vraag ontbreekt.", { status: 400, headers: corsHeaders });
      }

      let finalAnswer = findStructuredAnswer(question);
      let contextFound = !!finalAnswer;

      if (!finalAnswer) {
        const object = await env.KB_BUCKET.get("kb_master.json");
        if (!object) throw new Error("Kennisbank niet gevonden.");
        const kbData = await object.json();
        const context = await findSemanticBestMatch(question, kbData, env);
        contextFound = context !== "Geen relevante informatie gevonden.";
        finalAnswer = await generateGPTAnswer(question, context, env);
      }

      if (!finalAnswer) {
        finalAnswer = await generateGPTAnswer(question, "Geen relevante informatie gevonden.", env);
      }

      if (contextFound) {
        finalAnswer += "\n\nLet op: deze informatie is van algemene aard. Voor persoonlijk medisch advies, raadpleeg altijd uw arts.";
      } else if (!findStructuredAnswer(question)) {
        finalAnswer += "\n\nHoud er rekening mee dat ik voornamelijk ben ontworpen om vragen over diabetes en de Diabetes Liga Midden-Limburg te beantwoorden.";
      }

      const payload = {
        choices: [
          {
            message: {
              role: "assistant",
              content: finalAnswer
            }
          }
        ]
      };

      return new Response(JSON.stringify(payload), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });

    } catch (err) {
      return new Response(`Er is een fout opgetreden: ${err.message}`, {
        status: 500,
        headers: corsHeaders
      });
    }
  }
};
