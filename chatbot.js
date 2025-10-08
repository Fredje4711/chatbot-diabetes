async function sendMessage() {
  const input = document.getElementById("chat-input");
  const question = input.value.trim();
  if (!question) return;

  const chat = document.getElementById("chat-box");

  // Toon gebruikersbericht
  const userMessage = document.createElement("div");
  userMessage.className = "message user-message";
  userMessage.innerHTML = `<span class="icon">🧑</span><div>${question}</div>`;
  chat.appendChild(userMessage);
  input.value = "";

  // Toon loader
  const loadingMessage = document.createElement("div");
  loadingMessage.className = "message assistant-message loading";
  loadingMessage.innerHTML = `<span class="icon"><img src="logo.png" alt="Bot icon"></span><div><div class="loader"></div></div>`;
  chat.appendChild(loadingMessage);
  chat.scrollTop = chat.scrollHeight;

  try {
    // ✨ CORRECTIE: Stuur 'query' in plaats van 'question'
    const response = await fetch("https://diabetes-chatbot-worker.fredje4711.workers.dev", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: question 
      })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Serverfout: ${response.status} - ${errorText}`);
    }

    // ✨ CORRECTIE: Verwerk het nieuwe, gestructureerde antwoord
    const data = await response.json(); 
    let antwoord = data.content || "(Geen antwoord ontvangen)";
    
    // Voeg een introductie toe als het een 'OR' (bredere) zoekopdracht was
    if (data.type === 'OR') {
        antwoord = `Ik kon geen exact antwoord vinden voor uw volledige vraag, maar hier zijn resultaten die enkele van uw zoekwoorden bevatten:\n\n${antwoord}`;
    }

    // URL en e-mail regex (ongewijzigd)
    const urlRegex = /(?<!href=")(https?:\/\/[^\s<]+)/g;
    let formattedAntwoord = antwoord.replace(urlRegex, url => `<a href="${url.replace(/[.,!?;:]+$/, '')}" target="_blank" rel="noopener noreferrer">${url.replace(/[.,!?;:]+$/, '')}</a>`);
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    formattedAntwoord = formattedAntwoord.replace(emailRegex, '<a href="mailto:$1">$1</a>');
    
    // Regeleindes converteren (ongewijzigd)
    formattedAntwoord = formattedAntwoord.replace(/\n/g, '<br>');

    loadingMessage.remove();

    const assistantMessage = document.createElement("div");
    assistantMessage.className = "message assistant-message";
    assistantMessage.innerHTML = `<span class="icon"><img src="logo.png" alt="Bot icon"></span><div>${formattedAntwoord}</div>`;
    chat.appendChild(assistantMessage);
    chat.scrollTop = chat.scrollHeight;

  } catch (err) {
    console.error("Fout bij ophalen antwoord:", err);
    loadingMessage.remove();
    const errorMessage = document.createElement("div");
    errorMessage.className = "message assistant-message error";
    errorMessage.innerHTML = `<span class="icon"><img src="logo.png" alt="Bot icon"></span><div>Er is een fout opgetreden. Probeer opnieuw.</div>`;
    chat.appendChild(errorMessage);
  }
}