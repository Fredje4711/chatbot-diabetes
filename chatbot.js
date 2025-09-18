const API_URL = "https://broad-king-6e2d.fredje4711.workers.dev/";
const MODEL = "gpt-3.5-turbo";

// ➤ Bericht versturen naar GPT
async function sendMessage() {
  const vraag = document.getElementById("chat-input").value;
  if (!vraag.trim()) return;

  toonBericht("user", vraag);

  const kbAntwoord = zoekKennisbank(vraag);
  const prompt = maakPrompt(kbAntwoord, vraag);

  const payload = {
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("Serverfout: " + response.status);

    const data = await response.json();
    const antwoord = data.choices?.[0]?.message?.content || "(Geen antwoord ontvangen)";
    toonBericht("bot", antwoord);
  } catch (err) {
    toonBericht("bot", "Er is een fout opgetreden. Probeer opnieuw.");
    console.error(err);
  }

  document.getElementById("chat-input").value = "";
}

// ➤ Bericht toevoegen aan venster
function toonBericht(type, tekst) {
  const chatBox = document.getElementById("chat-box");
  const bericht = document.createElement("div");
  bericht.className = "chat-message " + type;
  bericht.innerText = tekst;
  chatBox.appendChild(bericht);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// ➤ Prompt bouwen op basis van KB
function maakPrompt(kbResultaten, vraag) {
  const MAX_FRAG = 3;
  const fragmenten = kbResultaten.slice(0, MAX_FRAG);

  const kbTekst = fragmenten
    .map(frag => `Bron: ${frag.bron}\n${frag.tekst}`)
    .join("\n\n");

  return `Je bent een Nederlandstalige assistent gespecialiseerd in diabetes en de werking van Diabetes Liga Midden-Limburg. Beantwoord de vraag enkel op basis van de onderstaande kennisbank. Indien het antwoord niet 100% zeker in de kennisbank staat, geef dat beleefd aan.

KENNISBANK:
${kbTekst}

VRAAG:
${vraag}`;
}
