const shutterButton = document.getElementById('shutter');
const cameraVideoStream = document.getElementById('camera-stream');
const switchCameraButton = document.getElementById('switch-camera');
const canvas = document.getElementById('canvas');
let currentFacingMode = 'environment';
let width = window.innerWidth;
let height = 0;
let streaming = false;

function startCamera(facingMode) {
  navigator.mediaDevices.getUserMedia({ video: { facingMode } })
    .then((stream) => {
      cameraVideoStream.srcObject = stream;
      cameraVideoStream.play();

      const track = stream.getVideoTracks()[0];
      const settings = track.getSettings();
      cameraVideoStream.style.transform = (settings.facingMode === 'user' || !settings.facingMode) ? 'scaleX(-1)' : '';
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

cameraVideoStream.addEventListener("canplay", () => {
  if (!streaming) {
    height = cameraVideoStream.videoHeight / (cameraVideoStream.videoWidth / width);
    height = isNaN(height) ? width / (4 / 3) : height;
    canvas.setAttribute("width", width);
    canvas.setAttribute("height", height);
    streaming = true;
  }
});

function captureImage() {
  const canvasContext = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;
  canvasContext.drawImage(cameraVideoStream, 0, 0, width, height);
  const data = canvas.toDataURL('image/png');
  return data;
}

function displayHotDogBanner(isHotDog) {
  const banner = document.createElement('div');
  banner.id = 'hotdog-banner';
  banner.style.position = 'fixed';
  banner.style.top = isHotDog ? '0' : 'auto';
  banner.style.bottom = isHotDog ? 'auto' : '0';
  banner.style.width = '100%';
  banner.style.zIndex = '1000';
  
  const img = document.createElement('img');
  img.src = isHotDog ? 'assets/images/green.png' : 'assets/images/red.png';
  img.style.maxWidth = '100%';
  img.style.width = '100%';
  img.style.height = 'auto';

  banner.appendChild(img);
  document.body.appendChild(banner);

  setTimeout(() => {
    banner.remove();
    cameraVideoStream.style.display = 'block';
  }, 5000);
}

shutterButton.addEventListener('click', async () => {
  console.log('Button was clicked')
  const data = captureImage();

  const response = await fetch('/api/check-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageData: data }),
  });

  try {
    const result = await response.json();
    if (result.responses && result.responses[0]) {
      console.log('Result', result);
      
      const isHotDog = (
        (result.responses[0].labelAnnotations || []).some(label => 
          ['hot dog', 'hotdog', 'sausage', 'wurst'].some(keyword => 
            label.description.toLowerCase().includes(keyword)
          )
        ) ||
        (result.responses[0].localizedObjectAnnotations || []).some(obj => 
          ['Hot dog', 'Hotdog'].includes(obj.name)
        )
      );

      console.log('Is it a hot dog?', isHotDog);
      displayHotDogBanner(isHotDog);
      return isHotDog;
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error parsing JSON response:', error);
    return false;
  }
});
