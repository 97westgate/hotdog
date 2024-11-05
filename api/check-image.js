const fetch = require('node-fetch');

async function processImage(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { imageData } = req.body;

  try {
    console.log('at least within the try')
    const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_CLOUD_VISION_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [{
          image: { content: imageData.replace('data:image/png;base64,', '') },
          features: [
            { type: 'LABEL_DETECTION', maxResults: 20 },
            { type: 'OBJECT_LOCALIZATION', maxResults: 20 },
          ],
        }],
      }),
    });
    console.log('RESULTADO', result)

    const result = await response.json();
    if (!response.ok) throw new Error('Error with Vision API request');
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error processing the image' });
  }
}

module.exports = processImage;
