require('dotenv').config();
const express = require('express');
const path = require('path');
const fetch = require('node-fetch'); // Ensure this is installed with `npm install node-fetch`
const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Add the /api/check-image route for local testing
app.post('/api/check-image', async (req, res) => {
  const { imageData } = req.body;

  try {
    const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_CLOUD_VISION_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [{
          image: { content: imageData.replace('data:image/png;base64,', '') },
          features: [{ type: 'LABEL_DETECTION', maxResults: 5 }],
        }],
      }),
    });
    const result = await response.json();
    res.status(200).json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error processing the image' });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
