async function sendMessage() {
  const input = document.getElementById("chat-input");
  const question = input.value.trim();
  if (!question) return;

  // Toon gebruikersvraag in de chat
  const chat = document.getElementById("chat-box");
  const userMessage = document.createElement("div");
  // Gebruik de class namen uit uw HTML/CSS voor de styling
  userMessage.className = "chat-message user"; 
  userMessage.textContent = question;
  chat.appendChild(userMessage);
  input.value = "";

  // Laadindicator
  const loadingMessage = document.createElement("div");
  loadingMessage.className = "chat-message bot";
  loadingMessage.textContent = "..."; // Simple loading indicator
  chat.appendChild(loadingMessage);
  chat.scrollTop = chat.scrollHeight;

  try {
    // Stuur ALLEEN de vraag naar de NIEUWE Worker URL
    const response = await fetch("https://diabetes-chatbot-worker.fredje4711.workers.dev", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: question // Stuur een object met de key "question"
      })
    });

    if (!response.ok) {
        // Als de server een fout terugstuurt, toon die dan.
        const errorText = await response.text();
        throw new Error(`Serverfout: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const antwoord = data.choices?.[0]?.message?.content?.trim() || "(Geen antwoord ontvangen)";
    
    // Verwijder laadindicator en toon het echte antwoord
    loadingMessage.textContent = antwoord;
    chat.scrollTop = chat.scrollHeight;

  } catch (err) {
    console.error("Fout bij ophalen antwoord:", err);
    loadingMessage.textContent = `Er is een fout opgetreden: ${err.message}`;
    loadingMessage.style.color = 'red';
  }
}