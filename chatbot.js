const API_URL = "https://broad-king-6e2d.fredje4711.workers.dev";
const MODEL = "gpt-4o";

// System-prompt los van extra context
const SYSTEM_PROMPT = `Je bent een Nederlandstalige chatbot van de Diabetes Liga Midden-Limburg. Je beantwoordt vragen over diabetes én over de werking, contactpersonen en activiteiten van onze lokale vereniging. Antwoord vriendelijk, duidelijk, feitelijk juist en menselijk.`;

// Wordt later gevuld met info uit KB-bestanden
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

let messages = [];

async function sendMessage() {
  const input = document.getElementById("chatbot-input");
  const userMessage = input.value.trim();
  if (!userMessage) return;

  addMessage("user", userMessage);
  input.value = "";

  // Bouw berichten opnieuw bij elke vraag (GPT-context is beperkt)
  messages = [
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
        temperature: 0.7
      })
    });

    const data = await response.json();
    const botReply = data.choices?.[0]?.message?.content?.trim() || "(Geen antwoord ontvangen)";
    addMessage("assistant", botReply);

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

        return `=== Inhoud van ${filename} ===\n` + text;
      })
    );

    extraContext = allTextChunks.join("\n\n");

  } catch (err) {
    console.error("Fout bij laden van kennisbank:", err);
    extraContext = "(Let op: de kennisbank kon niet geladen worden.)";
  }
}

// Hulpfunctie om JSON bestanden beter leesbaar te maken
function formatJsonAsText(filename, data) {
  if (!Array.isArray(data)) return `=== ${filename} ===\n` + JSON.stringify(data, null, 2);

  return `=== ${filename} ===\n` + data.map((item, i) =>
    `# ${item.titel || "Item " + (i + 1)}\n` +
    Object.entries(item).map(([k, v]) => `- ${k}: ${v}`).join("\n")
  ).join("\n\n");
}
