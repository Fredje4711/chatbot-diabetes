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

  // 🧠 Verbeterde GPT-instructie
  const systemInstruction = `
Je bent een behulpzame Nederlandstalige chatbot voor de Diabetes Liga Midden-Limburg.

Je krijgt hieronder enkele tekstfragmenten uit de kennisbank. Beantwoord de gebruikersvraag **uitsluitend op basis van die fragmenten**.

✅ Als er **ook maar één fragment** een mogelijk antwoord bevat, geef dat antwoord dan.  
❌ Geef **geen extra uitleg of gissingen** buiten wat in de fragmenten staat.  
🆘 Als er echt niets relevants bijzit, zeg dan letterlijk: **"Niet gevonden in de kennisbank."**

Kennisbankfragmenten:
${relevanteFragmenten.map((f, i) => `[${i + 1}] ${f.tekst}`).join('\n\n')}
  `.trim();

  const messages = [
    { role: "system", content: systemInstruction },
    { role: "user", content: question }
  ];

  // Laadindicator
  const loadingMessage = document.createElement("div");
  loadingMessage.className = "message assistant-message loading";
  loadingMessage.innerHTML = `<span class="icon">🤖</span><div class="loader"></div>`;
  chat.appendChild(loadingMessage);
  chat.scrollTop = chat.scrollHeight;

  try {
    const response = await fetch("https://diabetes-chatbot-worker.fredje4711.workers.dev", {
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
