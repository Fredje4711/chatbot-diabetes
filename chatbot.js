async function sendMessage() {
  const input = document.getElementById("chat-input");
  const question = input.value.trim();
  if (!question) return;

  const chat = document.getElementById("chat-box");

  const userMessage = document.createElement("div");
  userMessage.className = "message user-message";
  userMessage.innerHTML = `<span class="icon">🧑</span><div>${question}</div>`;
  chat.appendChild(userMessage);
  input.value = "";

  const loadingMessage = document.createElement("div");
  loadingMessage.className = "message assistant-message loading";
  loadingMessage.innerHTML = `<span class="icon"><img src="logo.png" alt="Bot icon"></span><div><div class="loader"></div></div>`;
  chat.appendChild(loadingMessage);
  chat.scrollTop = chat.scrollHeight;

  try {
    const response = await fetch("https://diabetes-chatbot-worker.fredje4711.workers.dev", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: question
      })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Serverfout: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const antwoord = data.choices?.[0]?.message?.content?.trim() || "(Geen antwoord ontvangen)";
    
    // EERST de URLs aanklikbaar maken
    const urlRegex = /(https?:\/\/[^\s<]+)/g;
    let formattedAntwoord = antwoord.replace(urlRegex, (url) => {
        const cleanedUrl = url.replace(/[.,!?;:]+$/, '');
        return `<a href="${cleanedUrl}" target="_blank" rel="noopener noreferrer">${cleanedUrl}</a>`;
    });
    
    // DAARNA de regeleindes omzetten naar <br>
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