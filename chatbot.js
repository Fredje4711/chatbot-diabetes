// === Instellingen ===
const API_URL = "https://broad-king-6e2d.fredje4711.workers.dev";
const MODEL = "gpt-4o";

const SYSTEM_PROMPT = `Je bent een Nederlandstalige chatbot van de Diabetes Liga Midden-Limburg. Beantwoord vragen over diabetes (type 1, type 2, zwangerschapsdiabetes, symptomen, behandeling, voeding, enz.) en over de werking van onze organisatie. Antwoord altijd in duidelijke, vriendelijke mensentaal.`;

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

let messages = [
  { role: "system", content: SYSTEM_PROMPT }
];

async function sendMessage() {
  const input = document.getElementById("chatbot-input");
  const userMessage = input.value.trim();
  if (!userMessage) return;

  addMessage("user", userMessage);
  input.value = "";

  messages.push({ role: "user", content: userMessage });

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: messages,
        temperature: 0.7
      })
    });

    const data = await response.json();
    const botReply = data.choices?.[0]?.message?.content?.trim() || "(Geen antwoord ontvangen)";
    addMessage("assistant", botReply);
    messages.push({ role: "assistant", content: botReply });

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
