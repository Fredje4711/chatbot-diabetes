async function sendMessage() {
  const input = document.getElementById("chat-input");
  const question = input.value.trim();
  if (!question) return;

  // Toon gebruikersvraag in de chat
  const chat = document.getElementById("chat-box");
  const userMessage = document.createElement("div");
  userMessage.className = "message user-message";
  userMessage.innerHTML = `<span class="icon">🧑</span><div>${question}</div>`;
  chat.appendChild(userMessage);
  input.value = "";

  // 🔍 Zoek relevante fragmenten uit de kennisbank
  const relevanteFragmenten = zoekKennisbank(question);

  // 🧠 Maak systeeminstructie
  const systemInstruction = `
Je bent een hulpvaardige Nederlandstalige chatbot die alleen antwoorden geeft op basis van de kennisbankfragmenten hieronder.
Als het antwoord niet terug te vinden is in de fragmenten, zeg dan letterlijk: "Niet gevonden in de kennisbank."

Kennisbankfragmenten:
${relevanteFragmenten.map((f, i) => `[${i + 1}] ${f.tekst}`).join('\n\n')}
  `.trim();

  // 📨 Bouw de messages payload
  const messages = [
    { role: "system", content: systemInstruction },
    { role: "user", content: question }
  ];

  // ⏳ Laad-indicator
  const loadingMessage = document.createElement("div");
  loadingMessage.className = "message assistant-message loading";
  loadingMessage.innerHTML = `<span class="icon">🤖</span><div class="loader"></div>`;
  chat.appendChild(loadingMessage);
  chat.scrollTop = chat.scrollHeight;

  try {
    const response = await fetch("https://broad-king-6e2d.fredje4711.workers.dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o",
        messages,
        temperature: 0.3
      })
    });

    const data = await response.json();
    const antwoord = data.choices?.[0]?.message?.content?.trim() || "(Geen antwoord ontvangen)";

    // ❌ Fallback als het niet gelukt is
    if (!antwoord || antwoord.toLowerCase().includes("niet gevonden in de kennisbank")) {
      console.warn("Geen antwoord gevonden op basis van fragmenten.");
    }

    loadingMessage.remove();

    const assistantMessage = document.createElement("div");
    assistantMessage.className = "message assistant-message";
    assistantMessage.innerHTML = `<span class="icon">🤖</span><div>${antwoord}</div>`;
    chat.appendChild(assistantMessage);
    chat.scrollTop = chat.scrollHeight;

  } catch (err) {
    console.error("Fout bij ophalen antwoord:", err);
    loadingMessage.remove();
    const errorMessage = document.createElement("div");
    errorMessage.className = "message assistant-message error";
    errorMessage.innerHTML = `<span class="icon">⚠️</span><div>Er is een fout opgetreden. Probeer opnieuw.</div>`;
    chat.appendChild(errorMessage);
  }
}
