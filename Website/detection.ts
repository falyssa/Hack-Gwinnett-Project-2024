import {
  HandLandmarker,
  FilesetResolver
} from "../node_modules/@mediapipe/tasks-vision";

let demosSection: any;
if (typeof window !== "undefined"){
  demosSection = window.document?.getElementById("demos")!;
}

let handLandmarker: HandLandmarker;
let runningMode: any;
let enableWebcamButton: HTMLButtonElement;
let webcamRunning: Boolean = false;

// Before we can use HandLandmarker class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment to
// get everything needed to run.
const createHandLandmarker = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );
  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
      delegate: "GPU"
    },
    runningMode: undefined,
    numHands: 2
  });
  demosSection?.classList.remove("invisible");
  return null;
};
createHandLandmarker();
console.log("hi");

/********************************************************************
// Demo 1: Grab a bunch of images from the page and detection them
// upon click.
********************************************************************/

// In this demo, we have put all our clickable images in divs with the
// CSS class 'detectionOnClick'. Lets get all the elements that have
// this class.
let imageContainers: any;
if (typeof window !== "undefined"){
  imageContainers = window.document.getElementsByClassName("detectOnClick");
}

// Now let's go through all of these and add a click event listener.
if (imageContainers){
  for (let i = 0; i < imageContainers!.length!; i++) {
    // Add event listener to the child element whichis the img element.
    imageContainers[i].children[0].addEventListener("click", handleClick);
  }
}

// When an image is clicked, let's detect it and display results!
async function handleClick(event: any) {
  if (!handLandmarker) {
    console.log("Wait for handLandmarker to load before clicking!");
    return;
  }

  if (runningMode === "VIDEO") {
    runningMode = "IMAGE";
    await handLandmarker.setOptions({ runningMode: "IMAGE" });
  }
  // Remove all landmarks drawed before
  const allCanvas = event.target.parentNode.getElementsByClassName("canvas");
  for (var i = allCanvas.length - 1; i >= 0; i--) {
    const n = allCanvas[i];
    n.parentNode.removeChild(n);
  }

  // We can call handLandmarker.detect as many times as we like with
  // different image data each time. This returns a promise
  // which we wait to complete and then call a function to
  // print out the results of the prediction.
  const handLandmarkerResult = handLandmarker.detect(event.target);
  //console.log(handLandmarkerResult.handednesses[0][0]);
  const canvas = document.createElement("canvas");
  canvas.setAttribute("class", "canvas");
  canvas.setAttribute("width", event.target.naturalWidth + "px");
  canvas.setAttribute("height", event.target.naturalHeight + "px");
  // canvas.style =
  //   "left: 0px;" +
  //   "top: 0px;" +
  //   "width: " +
  //   event.target.width +
  //   "px;" +
  //   "height: " +
  //   event.target.height +
  //   "px;";

  event.target.parentNode.appendChild(canvas);
  const cxt = canvas.getContext("2d");
  // for (const landmarks of handLandmarkerResult.landmarks) {
  //   drawConnectors(cxt, landmarks, HAND_CONNECTIONS, {
  //     color: "#00FF00",
  //     lineWidth: 5
  //   });
  //   drawLandmarks(cxt, landmarks, { color: "#FF0000", lineWidth: 1 });
  // }
  return null;
}

/********************************************************************
// Demo 2: Continuously grab image from webcam stream and detect it.
********************************************************************/

let video:any;
if (typeof window !== "undefined"){
  video = window.document.getElementById("webcam") as HTMLVideoElement;
}
let canvasElement: any;
if(typeof window !== "undefined"){
  let canvasElement = window.document.getElementById(
    "output_canvas"
  ) as HTMLCanvasElement;
}

let canvasCtx: any;
if(canvasElement){
  canvasCtx = canvasElement.getContext("2d") as any;
}

// Check if webcam access is supported.
let hasGetUserMedia;
if (typeof navigator !== "undefined"){
  hasGetUserMedia = () => !!navigator?.mediaDevices?.getUserMedia;
}


// If webcam supported, add event listener to button for when user
// wants to activate it.
if (hasGetUserMedia) {
  enableWebcamButton = document.getElementById("webcamButton") as any;
  enableWebcamButton.addEventListener("click", enableCam);
} else {
  console.warn("getUserMedia() is not supported by your browser");
}

// Enable the live webcam view and start detection.
function enableCam(event: any) {
  if (!handLandmarker) {
    console.log("Wait! objectDetector not loaded yet.");
    return;
  }

  if (webcamRunning === true) {
    webcamRunning = false;
    enableWebcamButton.innerText = "ENABLE PREDICTIONS";
  } else {
    webcamRunning = true;
    enableWebcamButton.innerText = "DISABLE PREDICTIONS";
  }

  // getUsermedia parameters.
  const constraints = {
    video: true
  };

  // Activate the webcam stream.
  if (typeof navigator !== "undefined"){
    navigator?.mediaDevices.getUserMedia(constraints).then((stream) => {
      video.srcObject = stream;
      video.addEventListener("loadeddata", predictWebcam);
    });
  }
  
}

let lastVideoTime = -1;
let results;
//console.log(video);
async function predictWebcam() {
  canvasElement.style.width = video.videoWidth + 'px';
  canvasElement.style.height = video.videoHeight + 'px';
  canvasElement.width = video.videoWidth;
  canvasElement.height = video.videoHeight;
  
  // Now let's start detecting the stream.
  if (runningMode === "IMAGE") {
    runningMode = "VIDEO";
    await handLandmarker.setOptions({ runningMode: "VIDEO" });
  }
  let startTimeMs = performance.now();
  if (lastVideoTime !== video.currentTime) {
    lastVideoTime = video.currentTime;
    results = handLandmarker.detectForVideo(video, startTimeMs);
  }
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  //if (results.landmarks) {
    // for (const landmarks of results.landmarks) {
    //   drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
    //     color: "#00FF00",
    //     lineWidth: 5
    //   });
    //   drawLandmarks(canvasCtx, landmarks, { color: "#FF0000", lineWidth: 2 });
    // }
  //}
  canvasCtx.restore();

  // Call this function again to keep predicting when the browser is ready.
  if (webcamRunning === true) {
    //window.requestAnimationFrame(predictWebcam);
    requestAnimationFrame(predictWebcam)
  }
}