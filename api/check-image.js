const fetch = require('node-fetch');
require('dotenv').config();

async function processImage(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { imageData } = req.body;
  const timeoutDuration = 10000;

  const fetchWithTimeout = (url, options, timeout) => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Request timed out'));
      }, timeout);

      fetch(url, options)
        .then((response) => {
          clearTimeout(timer);
          resolve(response);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  };

  try {
    const response = await fetchWithTimeout(
      `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_CLOUD_VISION_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [{
            image: { content: imageData.replace(/^data:image\/\w+;base64,/, '') },
            features: [
              { type: 'LABEL_DETECTION', maxResults: 20 },
              { type: 'OBJECT_LOCALIZATION', maxResults: 20 },
            ],
          }],
        }),
      },
      timeoutDuration
    );

    if (!response.ok) {
      const result = await response.json();
      console.error('Google Vision API Error:', result.error);
      return res.status(response.status).json({ error: result.error.message || 'Unknown error from Google Vision API' });
    }

    const result = await response.json();
    res.status(200).json(result);

  } catch (error) {
    if (error.message === 'Request timed out') {
      console.error('Network Error: Request timed out');
      res.status(504).json({ error: 'Network timeout. Please check your connection and try again.' });
    } else if (error.message.includes('fetch') || error.message.includes('network')) {
      console.error('Network Error:', error.message);
      res.status(503).json({ error: 'Network error. Please check your connection and try again.' });
    } else {
      console.error('Processing Error:', error);
      res.status(500).json({ error: 'Error processing the image' });
    }
  }
}

module.exports = processImage;
