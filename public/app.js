const shutterButton = document.getElementById('shutter')
const photosButton = document.getElementById('photos-btn')
// const gallery = document.querySelector('.gallery-view')
// const currentImageElement = document.querySelector('.gallery-view img')
// const closeGalleryButton = document.getElementById('close-gallery')
const nextButton = document.getElementById('next')
const prevButton = document.getElementById('prev')
const canvas = document.getElementById('canvas')

let width = window.innerWidth
let height = 0
let streaming = false

const capturedImages = []
const currentImage = 0

const cameraVideoStream = document.getElementById('camera-stream');
const switchCameraButton = document.getElementById('switch-camera');
let currentFacingMode = 'environment'; // back-facing camera

function startCamera(facingMode) {
  navigator.mediaDevices.getUserMedia({ video: { facingMode } })
    .then((stream) => {
      cameraVideoStream.srcObject = stream;
      cameraVideoStream.play();

      const track = stream.getVideoTracks()[0];
      const settings = track.getSettings();

      if (settings.facingMode === 'user' || !settings.facingMode) {
        cameraVideoStream.style.transform = 'scaleX(-1)';
      } else {
        cameraVideoStream.style.transform = '';
      }

      console.log('Active camera facing mode:', settings.facingMode || 'Not specified');
    })
    .catch((err) => {
      console.error('Camera access error:', err);
      alert('Error accessing the camera. Please check permissions and try again.');
    });
}

if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  startCamera(currentFacingMode);
}

switchCameraButton.addEventListener('click', () => {
  currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
  startCamera(currentFacingMode);
});



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
        // currentImageElement.src = data;
        // photosButton.style.backgroundImage = `url(${data})`;
        capturedImages.unshift(data);
        resolve(data);
      }, 0);
    });
  });
}

function displayHotDogBanner(hotdogFound) {
  const existingBanner = document.getElementById('hotdog-banner');
  if (existingBanner) {
    existingBanner.remove();
  }

  const banner = document.createElement('div');
  banner.id = 'hotdog-banner';
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

  setTimeout(() => {
    banner.remove();
  }, 5000);
}

shutterButton.addEventListener('click', async () => {
  const existingBanner = document.getElementById('hotdog-banner');
  if (existingBanner) {
    existingBanner.remove();
  }

  console.log('Button was clicked');
  try {
    if (!cameraVideoStream.srcObject || cameraVideoStream.srcObject.getTracks().length === 0) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      cameraVideoStream.srcObject = stream;
      await cameraVideoStream.play();
      console.log('Camera stream started');
    }
  } catch (err) {
    console.error('Camera access error:', err);
    alert('Error accessing the camera. Please check permissions and try again.');
  }

  const data = await captureImage();
  checkIfHotDog(data).then(isHotDog => {
    displayHotDogBanner(isHotDog);
  }).catch(err => {
    console.error('Error checking image:', err);
    alert('There was an error analyzing the image.');
  });
});



// photosButton.addEventListener('click', () => {
//   gallery.classList.add('show-gallery')
//   currentImageElement.setAttribute('data-index', 0)
// })
// closeGalleryButton.addEventListener('click', () => gallery.classList.remove('show-gallery'))

// nextButton.addEventListener('click', () => {
//   const index = Number(currentImageElement.getAttribute('data-index'))
//   if (capturedImages[index + 1]) {
//     currentImageElement.src = capturedImages[index + 1]
//     currentImageElement.setAttribute('data-index', index + 1)
//   }
// })
// prevButton.addEventListener('click', () => {
//   const index = Number(currentImageElement.getAttribute('data-index'))
//   if (capturedImages[index - 1]) {
//     currentImageElement.src = capturedImages[index - 1]
//     currentImageElement.setAttribute('data-index', index - 1)
//   }
// })

async function checkIfHotDog(imageData) {
  const baseURL = window.location.origin;
  const response = await fetch(`${baseURL}/api/check-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageData }),
  });

  try {
    const result = await response.json();
    if (result.responses && result.responses[0]) {
      const response = result.responses[0];
      console.log('Our response', response)
      
      // Keywords to detect hot dog-related items
      const hotDogKeywords = ['hot dog', 'sausage', 'wurst'];

      // Check LABEL_DETECTION
      const labels = response.labelAnnotations || [];
      const isHotDogInLabels = labels.some(label => hotDogKeywords.some(keyword => label.description.toLowerCase().includes(keyword)));

      // Check OBJECT_LOCALIZATION
      const objects = response.localizedObjectAnnotations || [];
      const isHotDogInObjects = objects.some(object => hotDogKeywords.some(keyword => object.name.toLowerCase().includes(keyword)));

      // Check WEB_DETECTION
      // const webEntities = response.webDetection?.webEntities || [];
      // const isHotDogInWebEntities = webEntities.some(entity => hotDogKeywords.some(keyword => entity.description.toLowerCase().includes(keyword)));

      return isHotDogInObjects || isHotDogInLabels
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error parsing JSON response:', error);
    return false;
  }
}
