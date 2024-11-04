const cameraVideoStream = document.getElementById('camera-stream')
const shutterButton = document.getElementById('shutter')
const photosButton = document.getElementById('photos-btn')
const gallery = document.querySelector('.gallery-view')
const currentImageElement = document.querySelector('.gallery-view img')
const closeGalleryButton = document.getElementById('close-gallery')
const nextButton = document.getElementById('next')
const prevButton = document.getElementById('prev')
const canvas = document.getElementById('canvas')
require('dotenv').config();
const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;

let width = window.innerWidth
let height = 0
let streaming = false

const capturedImages = []
const currentImage = 0

// Connect media device
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia({ video: true })) {
  navigator.mediaDevices.getUserMedia({ video: true }).then ((stream) => {
    cameraVideoStream.srcObject = stream
    cameraVideoStream.play()
  })
} 

cameraVideoStream.addEventListener(
  "canplay",
  (ev) => {
    if (!streaming) {
      height = cameraVideoStream.videoHeight / (cameraVideoStream.videoWidth / width);
      
      if (isNaN(height)) {
        height = width / (4 / 3);
      }

      canvas.setAttribute("width", width);
      canvas.setAttribute("height", height);
      cameraVideoStream.setAttribute("width", width);
      cameraVideoStream.setAttribute("height", height);
      streaming = true;
    }
  },
  false
);

// Capture snapshots using HTML Canvas
function captureImage() {
  requestAnimationFrame(() => {
    const canvasContext = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    canvasContext.drawImage(cameraVideoStream, 0, 0, width, height);

    // Convert captured data to image (base64) asynchronously
    setTimeout(() => {
      const data = canvas.toDataURL('image/png');
      currentImageElement.src = data;
      photosButton.style.backgroundImage = `url(${data})`;
      capturedImages.unshift(data); // Reverse order handled here efficiently
    }, 0);
  });
}

shutterButton.addEventListener('click', () => captureImage())

// Event handlers to close and open gallery
photosButton.addEventListener('click', () => {
  gallery.classList.add('show-gallery')
  currentImageElement.setAttribute('data-index', 0)
})
closeGalleryButton.addEventListener('click', () => gallery.classList.remove('show-gallery'))

// Event handlers to browse gallery (next and previous)
nextButton.addEventListener('click', () => {
  const index = Number(currentImageElement.getAttribute('data-index'))
  if (capturedImages[index + 1]) {
    currentImageElement.src = capturedImages[index + 1]
    currentImageElement.setAttribute('data-index', index + 1)
  }
})
prevButton.addEventListener('click', () => {
  const index = Number(currentImageElement.getAttribute('data-index'))
  if (capturedImages[index - 1]) {
    currentImageElement.src = capturedImages[index - 1]
    currentImageElement.setAttribute('data-index', index - 1)
  }
})

async function checkIfHotDog(imageData) {
  const response = await fetch('https://vision.googleapis.com/v1/images:annotate?key=YOUR_API_KEY', {
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
  return result.responses[0].labelAnnotations.some(label => label.description.toLowerCase() === 'hot dog');
}
captureImage();  // Assuming the image is stored as a variable or data URL
checkIfHotDog(data).then(isHotDog => {
  alert(isHotDog ? 'This is a hot dog!' : 'This is not a hot dog.');
});