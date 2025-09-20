// Simpele zoekfunctie: vindt de meest relevante items uit de KB
function findRelevantKbItems(question, kbData, topK = 5) {
  const questionWords = new Set(question.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  
  const scoredItems = kbData.map(item => {
    const titleWords = new Set(item.titel.toLowerCase().split(/\s+/));
    const textWords = new Set(item.tekst.toLowerCase().split(/\s+/));
    
    let score = 0;
    for (const word of questionWords) {
      if (titleWords.has(word)) {
        score += 2; // Woorden in de titel tellen zwaarder
      }
      if (textWords.has(word)) {
        score += 1;
      }
    }
    return { ...item, score };
  });

  // Sorteer op score en neem de beste
  return scoredItems
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

export default {
  async fetch(request, env) {
    // CORS Headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    if (request.method !== 'POST') {
      return new Response('Methode niet toegestaan', { status: 405, headers: corsHeaders });
    }

    try {
      const { question } = await request.json();
      if (!question) {
        return new Response('Vraag ("question") ontbreekt.', { status: 400, headers: corsHeaders });
      }

      // Gebruik env.AI direct, ZONDER import
      const ai = env.AI;

      const object = await env.KB_BUCKET.get('kb_index.json');
      if (object === null) {
        return new Response('Interne fout: Kennisbank niet gevonden.', { status: 500, headers: corsHeaders });
      }
      const kbData = await object.json();
      
      const relevantItems = findRelevantKbItems(question, kbData);

      const context = relevantItems.length > 0
        ? relevantItems.map(item => item.tekst).join('\n\n---\n\n')
        : "Geen relevante informatie gevonden.";

const systemPrompt = `Je bent een behulpzame en vriendelijke chatbot voor de Diabetes Liga Midden-Limburg. Je bent een expert op het gebied van de meegeleverde context, maar je hebt ook algemene kennis.

**Instructies:**
1.  Bekijk EERST de onderstaande CONTEXT. Als het antwoord op de vraag van de gebruiker in de CONTEXT staat, baseer je antwoord dan **volledig en uitsluitend** op die informatie.
2.  Als de CONTEXT "Geen relevante informatie gevonden." is, of als het antwoord **absoluut niet** in de context staat, beantwoord de vraag dan naar beste vermogen met je algemene kennis. Vermeld in dat geval subtiel dat de informatie niet uit de documentatie van de Diabetes Liga komt, bijvoorbeeld door te zeggen: "Op basis van algemene informatie..." of "In het algemeen...".
3.  Begin je antwoord nooit met "Op basis van de context...". Geef direct het antwoord. Wees altijd kort, duidelijk en vriendelijk.

CONTEXT:
${context}`;
      
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ];

      const aiResponse = await ai.run('@cf/meta/llama-3-8b-instruct', {
        messages,
      });

      const openAIFormattedResponse = {
        choices: [{
          message: {
            role: 'assistant',
            content: aiResponse.response,
          }
        }]
      };

      return new Response(JSON.stringify(openAIFormattedResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (e) {
      return new Response(`Er is een fout opgetreden: ${e.message}`, { status: 500, headers: corsHeaders });
    }
  },
};