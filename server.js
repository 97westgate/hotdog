require('dotenv').config();
const express = require('express');
const path = require('path');
const processImage = require('./api/check-image'); // Ensure check-image.js is located in the correct folder
const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/check-image', processImage);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
