const cameraVideoStream = document.getElementById('camera-stream')
const shutterButton = document.getElementById('shutter')
const photosButton = document.getElementById('photos-btn')
const gallery = document.querySelector('.gallery-view')
const currentImageElement = document.querySelector('.gallery-view img')
const closeGalleryButton = document.getElementById('close-gallery')
const nextButton = document.getElementById('next')
const prevButton = document.getElementById('prev')
const canvas = document.getElementById('canvas')

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
  return new Promise((resolve) => {
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
        resolve(data);
      }, 0);
    });
  });
}

shutterButton.addEventListener('click', async () => {
  const data = await captureImage();
  checkIfHotDog(data).then(isHotDog => {
    console.log(isHotDog ? 'This is a hot dog!' : 'This is not a hot dog.');
  }).catch(err => {
    console.error('Error checking image:', err);
    console.log('There was an error analyzing the image.');
  });
});

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
  const response = await fetch('/check-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imageData }),
  });
  const result = await response.json();

  if (result.responses && result.responses[0] && result.responses[0].labelAnnotations) {
    console.log('Labels:', result.responses[0].labelAnnotations);
    return result.responses[0].labelAnnotations.some(label => {
      const labelLower = label.description.toLowerCase();
      return labelLower.includes('hot dog') || labelLower.includes('sausage') || labelLower.includes('food');
    });
  } else {
    console.error('No label annotations found or invalid response:', result);
    return false;
  }
}

// captureImage();  // Assuming the image is stored as a variable or data URL
// checkIfHotDog(data).then(isHotDog => {
//   alert(isHotDog ? 'This is a hot dog!' : 'This is not a hot dog.');
// });

