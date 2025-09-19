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

      // DE AANPASSING ZIT HIER: GEEN IMPORT MEER NODIG
      // We roepen 'env.AI' direct aan. Dit is de "oude" manier die altijd werkt.
      const ai = env.AI;

      const object = await env.KB_BUCKET.get('kb_index.json');
      if (object === null) {
        return new Response('Interne fout: Kennisbank niet gevonden.', { status: 500, headers: corsHeaders });
      }
      const kbData = await object.json();
      const context = kbData.map(item => item.tekst).join('\n\n---\n\n');

      const systemPrompt = `Je bent een behulpzame en vriendelijke chatbot voor de Diabetes Liga Midden-Limburg. 
      Beantwoord de vraag van de gebruiker KORT EN DUIDELIJK en ALLEEN op basis van de onderstaande CONTEXT.
      Geef geen informatie die niet letterlijk uit de context komt.
      Als het antwoord absoluut niet in de context te vinden is, antwoord dan: "Mijn excuses, maar ik kan het antwoord op uw vraag niet in mijn kennisbank vinden."
      Begin je antwoord niet met "Op basis van de context...". Geef direct het antwoord.

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