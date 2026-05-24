export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { image } = req.body;
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: image.split(',')[1] }},
            { type: 'text', text: `You are a fashion expert. Analyse the clothing in this image. For each visible item identify: type, description, which brands it could be from (ZARA, PrettyLittleThing, ASOS, Shein, Fashion Nova, H&M, Mango, Boohoo, River Island, Oh Polly etc), and search terms to find it. Respond ONLY in JSON: {"items":[{"type":"","description":"","brands":[],"searchTerms":[]}],"summary":""}` }
          ]
        }]
      })
    });
    const data = await response.json();
    const text = data.content?.map(c => c.text || '').join('');
    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
    res.json(parsed);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
