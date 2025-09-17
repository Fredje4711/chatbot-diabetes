// === Instellingen ===
const API_URL = "https://broad-king-6e2d.fredje4711.workers.dev";
const MODEL = "gpt-4o";
const LOG_URL = "https://script.google.com/macros/s/AKfycbzDpCXtkuNUXtd5pEyMZNqIKKcl7kqsaKxaZApQw7szDTOuAlHRwGNlgrcltp2yzIc8Lg/exec"; // <--- VUL DIT IN

// System-prompt, uitgebreid om omzeilantwoorden te verminderen
const SYSTEM_PROMPT = `Je bent een Nederlandstalige chatbot van de Diabetes Liga Midden-Limburg.
- Antwoord uitsluitend op basis van de meegegeven "Extra informatie" (kennisbank) en algemeen bekende diabeteskennis.
- Als de kennisbank geen voldoende info bevat voor een zeker antwoord: zeg dan kort en duidelijk "Onvoldoende informatie in de kennisbank voor een zeker antwoord." en stel één concreet verduidelijkende vraag of vermeld exact welke informatie ontbreekt.
- Verwijs nooit naar "de website" of "mail" zonder een concreet adres of URL die in de kennisbank staat. Gebruik alleen contactgegevens die in de kennisbank voorkomen.
- Geen verzinsels, geen placeholders, geen generieke adviezen zonder bron in de meegegeven informatie.
Beantwoord vriendelijk, duidelijk, feitelijk juist en menselijk.`;

// — Wordt gevuld met info uit de kennisbank —
let extraContext = "";

// === UI: chat openen/sluiten ===
document.getElementById("chatbot-button").addEventListener("click", () => {
  const container = document.getElementById("chatbot-container");
  container.style.display = container.style.display === "none" ? "flex" : "none";
});

// === UI: chat verzenden ===
document.getElementById("chatbot-send").addEventListener("click", sendMessage);
document.getElementById("chatbot-input").addEventListener("keypress", function (e) {
  if (e.key === "Enter") sendMessage();
});

// — We bouwen voor elke vraag de messages opnieuw op (contextlimiet) —
async function sendMessage() {
  const input = document.getElementById("chatbot-input");
  const userMessage = input.value.trim();
  if (!userMessage) return;

  addMessage("user", userMessage);
  input.value = "";

  const messages = [
    { role: "system", content: SYSTEM_PROMPT + "\n\nExtra informatie:\n" + extraContext },
    { role: "user", content: userMessage }
  ];

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages: messages,
        temperature: 0.3 // iets lager om minder “uitwijken” te stimuleren
      })
    });

    const data = await response.json();
    const botReply = data.choices?.[0]?.message?.content?.trim() || "(Geen antwoord ontvangen)";
    addMessage("assistant", botReply);

    // — Detectie van omzeilantwoorden —
    const detection = detectEvasive(botReply);
    if (detection.isEvasive) {
      logEvasive(userMessage, botReply, detection)
        .catch(err => console.error("Logfout:", err));
    }

  } catch (err) {
    addMessage("assistant", "Er is een fout opgetreden. Probeer opnieuw.");
    console.error(err);
  }
}

// === UI: berichten tonen ===
function addMessage(role, text) {
  const container = document.getElementById("chatbot-messages");
  const message = document.createElement("div");
  message.className = role;
  message.textContent = (role === "user" ? "👤 " : "🤖 ") + text;
  container.appendChild(message);
  container.scrollTop = container.scrollHeight;
}

// === Laad alle KB-bestanden bij het opstarten ===
loadKnowledgeBase();

async function loadKnowledgeBase() {
  try {
    const indexResponse = await fetch("kb_index.json");
    const fileList = await indexResponse.json();

    const allTextChunks = await Promise.all(
      fileList.map(async (filename) => {
        const res = await fetch(filename);
        const text = await res.text();

        if (filename.endsWith(".json")) {
          const data = JSON.parse(text);
          return formatJsonAsText(filename, data);
        }
        // Markdown/tekst gewoon opnemen
        return `=== Inhoud van ${filename} ===\n` + text;
      })
    );

    extraContext = allTextChunks.join("\n\n");

  } catch (err) {
    console.error("Fout bij laden van kennisbank:", err);
    extraContext = "(Let op: de kennisbank kon niet geladen worden.)";
  }
}

// — JSON leesbaar maken voor GPT —
function formatJsonAsText(filename, data) {
  if (!Array.isArray(data)) return `=== ${filename} ===\n` + JSON.stringify(data, null, 2);
  return `=== ${filename} ===\n` + data.map((item, i) =>
    `# ${item.titel || "Item " + (i + 1)}\n` +
    Object.entries(item).map(([k, v]) => `- ${k}: ${v}`).join("\n")
  ).join("\n\n");
}

/* ===========================
   Omzeilantwoord-detectie
   =========================== */

// woorden (losse termen) — brede dekking
const EVADE_WORDS = [
  "website", "webpagina", "internet", "google", "link", "klik", "hierboven", "hieronder",
  "mail", "e-mail", "email", "mailen", "stuur een mail",
  "contact", "contacteer", "neem contact", "contact opnemen", "helpdesk", "support",
  "bel", "telefonisch", "telefoon", "telefoonnummer",
  "ik weet", "onzeker", "niet zeker", "geen toegang", "kan niet", "mag niet",
  "raadpleeg", "vraag dit na", "bezoek", "bekijk", "vind meer info",
  "als ai", "als taalmodel", "kan niet browsen", "kan niet opzoeken"
];

// korte zinnen/patronen — preciezer
const EVADE_PHRASES = [
  "ik weet het niet",
  "ik kan dat niet met zekerheid zeggen",
  "ik heb geen toegang tot",
  "ga naar de website",
  "bezoek de website",
  "kijk op de website",
  "neem contact op",
  "mail naar",
  "stuur een mail",
  "bel naar",
  "dat kan ik niet doen",
  "dat mag ik niet doen",
  "ik kan dit niet opzoeken",
  "ik kan niet browsen",
  "als taalmodel kan ik dat niet",
  "onvoldoende informatie in de kennisbank",
  "onvoldoende informatie"
];

// Normaliseer tekst (lowercase + diacritics weg)
function normalizeNL(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // é → e
}

function detectEvasive(answer) {
  const txt = normalizeNL(answer);

  const matchedPhrases = EVADE_PHRASES.filter(p => txt.includes(normalizeNL(p)));
  const matchedWords = EVADE_WORDS.filter(w => txt.includes(normalizeNL(w)));

  // drempel: 1 exacte frase OF minstens 1 los woord
  const isEvasive = (matchedPhrases.length >= 1) || (matchedWords.length >= 1);

  return { isEvasive, matchedWords, matchedPhrases };
}


// Loggen naar Google Apps Script (CORS-vriendelijk: text/plain)
async function logEvasive(question, answer, detection) {
  if (!LOG_URL || LOG_URL.includes("___PLAATS_HIER_")) {
    console.warn("LOG_URL niet ingesteld; overslaan van logging.");
    return;
  }
  const payload = {
    origin: window.location.href,
    question,
    answer,
    matchedWords: detection.matchedWords,
    matchedPhrases: detection.matchedPhrases,
    note: "auto-detected evasive answer"
  };

  await fetch(LOG_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" }, // geen preflight
    body: JSON.stringify(payload)
  });
}

// TESTKNOP: handmatige logging proberen
function testLog() {
  const payload = {
    origin: "https://fredje4711.github.io/chatbot-diabetes/",
    question: "TESTVRAAG (manueel)",
    answer: "TESTANTWOORD (manueel)",
    matchedWords: ["test"],
    matchedPhrases: ["testzin"],
    note: "handmatige test via knop"
  };

  fetch(LOG_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(payload)
  })
    .then(r => r.text())
    .then(res => alert("Respons van server: " + res))
    .catch(err => alert("Fout bij versturen: " + err));
}
