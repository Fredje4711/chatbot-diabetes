
const volledigeAntwoorden = {
  "ledenfeest": `📌 Ledenfeest 2025

📅 Datum: Zaterdag 13 december 2025  
⏰ Tijd: 11.30 u  
📍 Locatie: Zaal De Ploeg, Steenweg 184, 3590 Diepenbeek  
💶 Prijs: € 45,00 p.p.  
🅿️ Parking: Gratis  
📩 Inlichtingen: <a href="mailto:midden.limburg@diabetes.be">midden.limburg@diabetes.be</a>
ℹ️ Meer informatie volgt nog.`,

  "praatcafé": `📌 Praatcafé

📅 Datum: Donderdag 16 oktober 2025  
⏰ Tijd: 20.00 u – 22.00 u  
📍 Locatie: JZ aula Salvator Ziekenhuis, Salvatorstraat 20, 3500 Hasselt  
🧑‍⚕️ Spreker: team diabetesconventie Hasselt  
💬 Methode: groepsgesprek  
💶 Prijs: Gratis  
🅿️ Parking: Gratis (tickets)  
📩 Inlichtingen: <a href="mailto:midden.limburg@diabetes.be">midden.limburg@diabetes.be</a>
📝 Inschrijven: www.dlml.be/praatcafe/`,

  "holiday": `📌 All-in Holiday

📅 Datum: Dinsdag 9 december 2025  
⏰ Tijd: 19.00 u – 21.00 u  
📍 Locatie: Personeelscafetaria AZ Vesalius, Hazelereik 51, 3700 Tongeren  
🧑‍⚕️ Spreker: Diëtisten van de diabetesconventie AZ Vesalius  
💶 Prijs: Gratis  
🅿️ Parking: Gratis  
📩 Inlichtingen: <a href="mailto:midden.limburg@diabetes.be">midden.limburg@diabetes.be</a>
📝 Inschrijven: www.dlml.be/holiday/`,

  "herkenrode": `📌 Culturele uitstap Herkenrode

📅 Datum: Zaterdag 27 september 2025  
⏰ Tijd: 14.00 u  
📍 Locatie: parking domein Herkenrode  
🚶‍♂️ Afstand: ± 5 km  
🧑‍🏫 Gids: Alex Ghys  
💶 Prijs: wandeling + bezoek € 7,00 p.p.  
🍽️ Etentje: achteraf in restaurant 'De paardenstallen' (facultatief, ter plaatse te betalen)  
📩 Inlichtingen: <a href="mailto:midden.limburg@diabetes.be">midden.limburg@diabetes.be</a>
📝 Inschrijven: www.dlml.be/uitstap/`,

  "wandeling": `📌 Wekelijkse wandeling

📅 Datum: Iedere zondag  
⏰ Tijd: 9.30 u – 11.30 u  
📍 Locatie: Putvennestraat 110, Kiewit – Hasselt  
🚶‍♂️ Afstand: Kiewit – Bokrijk – Kiewit (4 of 8 km)  
🧑‍🏫 M.m.v.: onze gids Jan Pierco  
💶 Prijs: Gratis  
🅿️ Parking: Gratis  
📩 Inlichtingen: <a href="mailto:midden.limburg@diabetes.be">midden.limburg@diabetes.be</a>
📝 Inschrijven: niet verplicht`,

  "wandelevenement": `📌 Wandelevenement – Wereld Diabetes Dag 2025

📅 Datum: Zondag 16 november 2025  
⏰ Tijd: 9.00 u – 18.00 u  
📍 Locatie: Natuurpunt Hasselt, Putvennestraat 112, 3500 Hasselt  
💶 Prijs: volwassenen € 2,00 p.p. – kinderen gratis  
🅿️ Parking: gratis  
📩 Inlichtingen: <a href="mailto:midden.limburg@diabetes.be">midden.limburg@diabetes.be</a>
📝 Inschrijven: www.dlml.be/wandelingWDD/`,

  "technieken": `📌 Infosessie – Nieuwe technieken, nieuwe medicatie

📅 Datum: Donderdag 27 november 2025  
⏰ Tijd: 20.00 u – 22.00 u  
📍 Locatie: JZ aula Salvator Ziekenhuis, Salvatorstraat 20, 3500 Hasselt  
🧑‍⚕️ Sprekers:

Dr. Annelies Mullens en het diabetesteam van het Jessa Ziekenhuis

Eddy Foulon, apotheker  
💶 Prijs: Gratis  
🅿️ Parking: Gratis (met tickets)  
📩 Inlichtingen: <a href="mailto:midden.limburg@diabetes.be">midden.limburg@diabetes.be</a>
📝 Inschrijven: www.dlml.be/nieuwetechnieken/`
};

function geefActiviteitenOverzicht() {
  return (
    "📋 Overzicht geplande activiteiten:\n\n" +
    Object.entries(volledigeAntwoorden)
      .map(([_, antw]) => {
        const lines = antw.split("\n").filter(l => l.trim() !== "");
        const titel = lines[0].replace(/^📌\s*/, "");
        const datum = lines.find(l => l.startsWith("📅 Datum:")) || "";
        const tijd = lines.find(l => l.startsWith("⏰ Tijd:")) || "";
        const locatie = lines.find(l => l.startsWith("📍 Locatie:")) || "";
        return `• ${titel} – ${datum.replace('📅 Datum: ', '')}, ${tijd.replace('⏰ Tijd: ', '')} – ${locatie.replace('📍 Locatie: ', '')}`;
      })
      .join("\n") +
    "\n\nℹ️ Voor detailinfo, stel je vraag met een woord uit de titel (bv. 'ledenfeest', 'praatcafé'...)."
  );
}

// --- Semantische Zoekfunctie voor Q&A (deel 3) ---
let kbEmbeddingsCache = [];

async function zoekInKennisbank(question, kbData, env) {
  if (kbEmbeddingsCache.length === 0) {
    const teksten = kbData.map(item => `${item.titel}\n${item.tekst}`);
    const resp = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ input: teksten, model: "text-embedding-ada-002" })
    });
    const json = await resp.json();
    kbEmbeddingsCache = json.data.map(d => d.embedding);
  }

  const vraagResp = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ input: question, model: "text-embedding-ada-002" })
  });

  const vraagJson = await vraagResp.json();
  const vraagEmbedding = vraagJson.data[0].embedding;

  let besteMatch = { score: -1, index: -1 };

  for (let i = 0; i < kbEmbeddingsCache.length; i++) {
    let dot = 0, norm1 = 0, norm2 = 0;
    for (let j = 0; j < vraagEmbedding.length; j++) {
      dot += vraagEmbedding[j] * kbEmbeddingsCache[i][j];
      norm1 += vraagEmbedding[j] ** 2;
      norm2 += kbEmbeddingsCache[i][j] ** 2;
    }
    const score = dot / (Math.sqrt(norm1) * Math.sqrt(norm2));
    if (score > besteMatch.score) {
      besteMatch = { score, index: i };
    }
  }

  if (besteMatch.score > 0.82) {
    return kbData[besteMatch.index].tekst;
  }

  return null;
}

// --- Handler ---
async function handleQuestion(question, env) {
  const q = question.toLowerCase();

  // Activiteitenkernwoorden
  const gevonden = Object.entries(volledigeAntwoorden).filter(([kw]) =>
    q.includes(kw)
  );
  
  if (gevonden.length > 0) {
  return gevonden.map(([, a]) => a).join("\n\n");
}
  
  // --- STAP 4: Herken maandnamen en toon alle bijhorende activiteiten ---
const maanden = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];
const maandGevraagd = maanden.find(m => q.includes(m));

if (maandGevraagd) {
  const resultaten = Object.values(volledigeAntwoorden)
    .filter(antwoord => antwoord.toLowerCase().includes(maandGevraagd))
    .join("\n\n");

  if (resultaten) {
    return `📆 Activiteiten in ${maandGevraagd}:\n\n${resultaten}`;
  } else {
    return `❌ Geen activiteiten gevonden in ${maandGevraagd}.`;
  }
}

  
  if (gevonden.length > 0) {
    return gevonden.map(([, a]) => a).join("\n\n");
  }

  if (
  q.includes("alle activiteiten") ||
  q.includes("overzicht van activiteiten") ||
  q.includes("toon activiteiten") ||
  q.includes("programma") ||
  q.includes("wat is er gepland") ||
  q.includes("planning")
) {
  return geefActiviteitenOverzicht() + "\n\n📄 Bekijk ook het volledige jaarprogramma in PDF:\nhttps://www.dlml.be/site/downloadPDF/jaarprogramma2025.pdf";
}

// Algemene contactvraag
if (
  q.includes("hoe contact opnemen") ||
  q.includes("contact opnemen") ||
  q.includes("contacteer dlml") ||
  q.includes("algemene e-mailadres") ||
  q.includes("algemeen e-mailadres") ||
  q.includes("hoofdmailadres") ||
  q.includes("contact e-mail") ||
  q.includes("contactadres")
) {
  return "Hoofdmailadres: midden.limburg@diabetes.be<br>Website: https://www.dlml.be";
}


  // Contactvragen
  if (q.includes("guido") && q.includes("smets")) {
    return "Guido Smets – Covoorzitter & Penningmeester\n📧 guido.smets4@telenet.be\n📱 0474 32 44 14";
  }

if (
  q.match(/(sociale media|socials|social media|facebook|instagram|youtube|waar vinden|volg.*ons|vinden jullie)/i)
) {
  return `📱 Je vindt ons op deze sociale mediakanalen:

🔵 Facebook: https://www.facebook.com/p/Diabetes-Liga-Midden-Limburg-100091325418693  
📸 Instagram: https://www.instagram.com/diabetes_liga_midden_limburg/  
▶️ YouTube: https://www.youtube.com/@Diabetesligamiddenlimburg`;
}
if (
  q.match(/(website|webadres|site|webpagina|dlml.be)/i)
) {
  return `🌐 De officiële website van Diabetes Liga Midden-Limburg is:\nhttps://www.dlml.be`;
}
if (
  q.match(/(bestuur|bestuursleden|wie zit er in het bestuur|wie zijn de bestuursleden|lijst bestuur|leden bestuur)/i)
) {
  return `👥 Bestuursleden van Diabetes Liga Midden-Limburg:

• Guido Smets (Covoorzitter, Penningmeester)  
📧 guido.smets4@telenet.be | 📞 0474 32 44 14

• Eddy Foulon (Covoorzitter, Medisch adviseur)  
📧 eddy.foulon@telenet.be | 📞 0472 37 98 50

• André Latet (Webmaster, Bestuurslid)  
📧 andre.latet@telenet.be | 📞 0474 27 56 62

• Marita Baerten (Diabeteseducator, Bestuurslid)  
📧 marita.baerten@telenet.be | 📞 0498 44 13 50

• Theo Hustings (Bestuurslid)  
📧 theohustings@scarlet.be | 📞 0479 89 21 15

• Freddy Sleeuwaert (Bestuurslid)  
📧 fredje_s@skynet.be | 📞 0479 85 09 97

• Greta Paesmans (Bestuurslid)  
📧 etienne.greta@gmail.com | 📞 0496 95 80 62

• Laurent Delbroek (Bestuurslid)  
📧 laurentdelbroek@gmail.com | 📞 0473 89 00 46`;
}

if (q.includes("lid worden") || q.includes("lidmaatschap")) {
  return "Lid worden? Ga naar <a href='https://www.diabetes.be/nl/steun-ons/word-lid' target='_blank'>www.diabetes.be/nl/steun-ons/word-lid</a> of mail naar <a href='mailto:midden.limburg@diabetes.be'>midden.limburg@diabetes.be</a>";
}



  if (q.includes("regio") || q.includes("steden") || q.includes("midden-limburg")) {
    return "Onze regio omvat: Alken, Bilzen, Borgloon, Diepenbeek, Hasselt, Herk-De-Stad, Herstappen, Hoeselt, Kortessem, Tongeren, Wellen, Zonhoven.";
  }

  // 👤 Herken individuele bestuursleden
  const bestuursleden = [
    { naam: "Guido Smets", functies: "Covoorzitter, Penningmeester", email: "guido.smets4@telenet.be", telefoon: "0474 32 44 14" },
    { naam: "Eddy Foulon", functies: "Covoorzitter, Medisch adviseur", email: "eddy.foulon@telenet.be", telefoon: "0472 37 98 50" },
    { naam: "André Latet", functies: "Webmaster, Bestuurslid", email: "andre.latet@telenet.be", telefoon: "0474 27 56 62" },
    { naam: "Marita Baerten", functies: "Diabeteseducator, Bestuurslid", email: "marita.baerten@telenet.be", telefoon: "0498 44 13 50" },
    { naam: "Theo Hustings", functies: "Bestuurslid", email: "theohustings@scarlet.be", telefoon: "0479 89 21 15" },
    { naam: "Freddy Sleeuwaert", functies: "Bestuurslid", email: "fredje_s@skynet.be", telefoon: "0479 85 09 97" },
    { naam: "Greta Paesmans", functies: "Bestuurslid", email: "etienne.greta@gmail.com", telefoon: "0496 95 80 62" },
    { naam: "Laurent Delbroek", functies: "Bestuurslid", email: "laurentdelbroek@gmail.com", telefoon: "0473 89 00 46" }
  ];

  // 👤 Herken individuele bestuursleden
for (const lid of bestuursleden) {
  const naam = lid.naam.toLowerCase();
  if (q.includes(naam.split(" ")[0]) && q.includes(naam.split(" ")[1])) {
    return `📌 Contactgegevens – ${lid.naam}\n\n👤 Functie(s): ${lid.functies}\n📩 E-mail: ${lid.email}\n📞 Telefoon: ${lid.telefoon}`;
  }
}

// 🧑‍💼 Herken algemene vragen naar bestuursleden
if (
  q.includes("wie zit er in het bestuur") ||
  q.includes("wie zijn de bestuursleden") ||
  q.includes("geef alle bestuursleden") ||
  q.includes("lijst van het bestuur") ||
  q.includes("het bestuur")
) {
  return (
    "📋 Overzicht bestuursleden:\n\n" +
    bestuursleden
      .map(lid =>
        `${lid.naam} (${lid.functies}):\n📩 ${lid.email}\n📞 ${lid.telefoon}`
      )
      .join("\n\n")
  );
}


  // Kennisbank zoeken
  const kbObject = await env.KB_BUCKET.get("kb_master.json");
  if (kbObject) {
    const kbData = await kbObject.json();
    const antwoord = await zoekInKennisbank(question, kbData, env);
    if (antwoord) {
      return antwoord;
    }
  }

  // Als niets werkt, laatste poging met GPT zelf
return await genereerFallbackAntwoord(question, env);

}

async function genereerFallbackAntwoord(question, env) {
  const messages = [
    { role: "system", content: "Je bent een behulpzame Nederlandstalige chatbot voor Diabetes Liga Midden-Limburg. Als je geen specifieke info hebt, geef dan een algemeen antwoord op basis van je kennis." },
    { role: "user", content: question }
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages
    })
  });

  const data = await response.json();

  if (!data || !data.choices || !data.choices[0]) {
    return "❌ GPT gaf geen antwoord terug.";
  }

  return data.choices[0].message.content.trim();
}


// --- Cloudflare Export ---
export default {
  async fetch(request, env) {
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    if (request.method !== "POST") {
      return new Response("Methode niet toegestaan", { status: 405, headers });
    }

    try {
      const { question } = await request.json();
      let antwoord = await handleQuestion(question, env);

// Enkel losse e-mailadressen aanklikbaar maken (geen dubbele <a>)
antwoord = antwoord.replace(/(?<!["'>=])\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b(?![^<]*<\/a>)/g, function(match) {
  return `<a href="mailto:${match}">${match}</a>`;
});

	  antwoord += "\n\nLet op: deze informatie is van algemene aard. Voor persoonlijk medisch advies, raadpleeg altijd uw arts.";

      return new Response(JSON.stringify({
        choices: [
          { message: { role: "assistant", content: antwoord } }
        ]
      }), {
        headers: {
          ...headers,
          "Content-Type": "application/json"
        }
      });

    } catch (err) {
      console.error("❌ Interne fout:", err.message);

      const foutmelding = "❌ Er ging iets mis bij het verwerken van je vraag. Probeer het later opnieuw of stel je vraag anders.\n\nLet op: deze informatie is van algemene aard. Voor persoonlijk medisch advies, raadpleeg altijd je arts.";

      return new Response(JSON.stringify({
        choices: [
          {
            message: {
              role: "assistant",
              content: foutmelding
            }
          }
        ]
      }), {
        status: 200,
        headers: {
          ...headers,
          "Content-Type": "application/json"
        }
      });
    } // sluit async fetch

  } // sluit export default
};
