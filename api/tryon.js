export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') return res.status(405).end();
  const { modelImage, garmentImage, category } = req.body;
  const apiKey = process.env.FASHN_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'No API key' });
  try {
    const response = await fetch('https://api.fashn.ai/v1/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model_image: modelImage,
        garment_image: garmentImage,
        category: category || 'auto',
        mode: 'balanced'
      }),
    });
    const data = await response.json();
    if (!data.id) return res.status(500).json({ error: JSON.stringify(data) });
    const predId = data.id;
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 3000));
      const st = await fetch(`https://api.fashn.ai/v1/status/${predId}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      const stData = await st.json();
      if (stData.status === 'completed') return res.json({ result: stData.output[0] });
      if (stData.status === 'failed') return res.status(500).json({ error: 'Render failed' });
    }
    res.status(500).json({ error: 'Timed out' });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
