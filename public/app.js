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

if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    .then((stream) => {
      cameraVideoStream.srcObject = stream;
      cameraVideoStream.play();
    })
    .catch((err) => {
      console.error('Camera access error:', err);
      alert('Error accessing the camera. Please check permissions and try again.');
    });
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

function captureImage() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      const canvasContext = canvas.getContext('2d');
      canvas.width = width;
      canvas.height = height;
      canvasContext.drawImage(cameraVideoStream, 0, 0, width, height);

      setTimeout(() => {
        const data = canvas.toDataURL('image/png');
        currentImageElement.src = data;
        photosButton.style.backgroundImage = `url(${data})`;
        capturedImages.unshift(data);
        resolve(data);
      }, 0);
    });
  });
}

function displayHotDogBanner(hotdogFound) {
  const banner = document.createElement('div');
  banner.style.position = 'fixed';
  banner.style.top = hotdogFound ? '0' : 'auto';
  banner.style.bottom = hotdogFound ? 'auto' : '0';
  banner.style.width = '100%';
  banner.style.zIndex = '1000';

  const img = document.createElement('img');
  img.src = hotdogFound ? 'assets/images/green.png' : 'assets/images/red.png';
  img.style.maxWidth = '100%';
  img.style.width = '100%';
  img.style.height = 'auto';

  banner.appendChild(img);
  document.body.appendChild(banner);

  // setTimeout(() => {
  //   banner.remove();
  // }, 5000);
}

shutterButton.addEventListener('click', async () => {
  console.log('Button was clickedeth')
  try {
    if (!cameraVideoStream.srcObject || cameraVideoStream.srcObject.getTracks().length === 0) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      cameraVideoStream.srcObject = stream;
      await cameraVideoStream.play(); // Ensure this is called after a click
      console.log('Camera stream started');
    }
  } catch (err) {
    console.error('Camera access error:', err);
    alert('Error accessing the camera. Please check permissions and try again.');
  }

  const data = await captureImage();
  checkIfHotDog(data).then(isHotDog => {
    if (isHotDog) {
      displayHotDogBanner(true);
    } else {
      displayHotDogBanner(false);
    }
  }).catch(err => {
    console.error('Error checking image:', err);
    alert('There was an error analyzing the image.');
  });
});


photosButton.addEventListener('click', () => {
  gallery.classList.add('show-gallery')
  currentImageElement.setAttribute('data-index', 0)
})
closeGalleryButton.addEventListener('click', () => gallery.classList.remove('show-gallery'))

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
  const baseURL = window.location.origin;
  const response = await fetch(`${baseURL}/api/check-image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imageData }),
  });

  try {
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
  } catch (error) {
    console.error('Error parsing JSON response:', error);
    return false;
  }
}