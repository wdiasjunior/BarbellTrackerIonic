// function getFilePath(file) {
//   'use strict'
//   var playSelectedFile = function(event) {
//     var file = this.files[0]
//     var URL = window.URL || window.webkitURL
//     var fileURL = URL.createObjectURL(file)
//     var videoNode = document.querySelector('video')
//     videoNode.src = fileURL
//   }
//   var inputNode = document.querySelector('input')
//   inputNode.addEventListener('change', playSelectedFile, true)
// }

function getFilePath() {

  var input = document.getElementById("videoInputButton");
  var fReader = new FileReader();
  fReader.readAsDataURL(input.files[0]);
  fReader.onloadend = function(file) {
    var video = document.getElementById("videoInput");
    // video.src = event.target.result;
    document.getElementById("videoInput").removeAttribute("src");
    document.getElementById("videoInput").setAttribute("src", event.target.result);
    document.getElementById("videoInput").pause();
  }


  // console.log(file);
  // console.log("Sample Video Loaded");
}

function localFileVideoPlayer() {

  var path
  document.getElementById("videoInput").removeAttribute("src");
  document.getElementById("videoInput").setAttribute("src", path);
  console.log("Local Video Loaded")
  document.getElementById("videoInput").pause();

}

function loadSampleVideo() {
  document.getElementById("videoInput").removeAttribute("src");
  document.getElementById("videoInput").setAttribute("src", "assets/media/2.mp4");
  console.log("Sample Video Loaded")
  // document.getElementById("videoInput").load();
  // document.getElementById("videoInput").play();
  document.getElementById("videoInput").pause();
}
let streaming = false;

function playPause() {
  if(streaming == false) {
    videoInput.play();
    document.getElementById('playPause').innerHTML = "Stop";
  } else {
    videoInput.pause();
    document.getElementById('playPause').innerHTML = "Play";
  }
  streaming = !streaming;
}

function onOpenCvReady() {
  console.log('OpenCV Ready');
  // document.getElementById('status').innerHTML = "OpenCV is Ready";
  // document.getElementById('videoInputButton').disabled = false;
}

let red = 0;
let green = 255;
let blue = 0;
function pathColorChange(color) {
  if(color == 'red') {
    red = 255;
    green = 0;
    blue = 0;
    document.getElementById('redButton').disabled = true;
    document.getElementById('greenButton').disabled = false;
    document.getElementById('blueButton').disabled = false;
  } else if(color == 'green') {
    red = 0;
    green = 255;
    blue = 0;
    document.getElementById('redButton').disabled = false;
    document.getElementById('greenButton').disabled = true;
    document.getElementById('blueButton').disabled = false;
  } else if(color == 'blue') {
    red = 0;
    green = 0;
    blue = 255;
    document.getElementById('redButton').disabled = false;
    document.getElementById('greenButton').disabled = false;
    document.getElementById('blueButton').disabled = true;
  }
}

function setup() {
  // TODO initialize variables


  let weightUnit = 'kg';
  let weight;

  let isConcentric = false;
  let rest = true;
  let yVelocity = 0;
  // let velocity = 0;
  let velocities = [];
  let avgVelocity = 0;
  let peakVelocity = 0;
  let acceleration = 0;
  let power = 0;
  let hDisplacement = 0;
  let lastY = 0;
  let lastX = 0;
  let xDisp = 0;
  let yDisp = 0;
  // let xDistance = 0;
  let yDistance = 0;
  // let distance = 0;
  let barRadius = 25;
  let mmpp = 0;
  let initialY = 0;
  let oscilation = 40;
  let radius = null;
  let refRadius = null;

  const width = 432;
  const height = 768;
  const FPS = 30;

  let count = 0;
  let centerPointArray = new Array();

  console.log("Setup ok");

  function barMath(x, y) {

    // acceleration (m/s^2)
    // speed/velocity (concentric only m/s)
    // power (kW)
    // horizontal displacement (cm)
    // current, average, min, max(peak) of each above ?

    if(initialY == 0) {
      initialY = y;
    }
    if((initialY + oscilation) < y) { // checks for rep. ignores bar whip in between reps
      rest = false;
      if(y < lastY) { // checks if movement is concentric
        isConcentric = true;
        // velocity = 0;
        yVelocity = 0;
        if (radius / height > 0.0125) {
          if(refRadius == null) {
            refRadius = radius;
            mmpp = barRadius / refRadius;
          }
          xDisp = lastX - x;
          xDisp = (xDisp / 10);
          yDisp = lastY - y
          // xDistance = xDisp * mmpp;
          yDistance = yDisp * mmpp;
          // distance = Math.sqrt(xDisp ** 2 + yDisp ** 2) * mmpp;
          if(Math.abs(yDistance) > (barRadius / 4)) {
            // velocity = distance * FPS / 1000;
            yVelocity = yDistance * FPS / 1000;
            velocities.push(yVelocity);
          }
        }
      } else {
        isConcentric = false;
        lastY = y;
        lastX = x;
        velocities = [];
      }
    } else {
      lastY = 0;
      lastX = 0;
      rest = true;
    }

    let sum = 0;
    for(let i = 0; i < velocities.length; i++) {
      sum += velocities[i];
    }
    avgVelocity = (sum / velocities.length) / 10;
    acceleration = (avgVelocity / (FPS / 1000)) / 10;

    document.getElementById("velocity").innerHTML = avgVelocity.toFixed(2);
    document.getElementById("acceleration").innerHTML = acceleration.toFixed(2);
    // document.getElementById("power").innerHTML = power;
    document.getElementById("horizontalDisplacement").innerHTML = -xDisp.toFixed(2);

  }

  function processVideo() {

    const videoInput = document.getElementById("videoInput");
    const canvas = document.getElementById("canvasOutput");
    let src = new cv.Mat(height, width, cv.CV_8UC4);
    let dst = new cv.Mat(height, width, cv.CV_8UC1);
    let cap = new cv.VideoCapture(videoInput);
    document.getElementById("playPause").disabled = false;

    let begin = Date.now();
    cap.read(src);

    let hsv = new cv.Mat();
    cv.cvtColor(src, hsv, cv.COLOR_RGBA2RGB);
    cv.cvtColor(hsv, hsv, cv.COLOR_RGB2HSV);

    let greenLower = new cv.Scalar(50, 130, 97);
    let greenUpper = new cv.Scalar(64, 255, 255);

    // let greenLower = new cv.Scalar(33, 46, 80);
    // let greenUpper = new cv.Scalar(86, 156, 255);

    // let greenLower = new cv.Scalar(29, 86, 6);
    // let greenUpper = new cv.Scalar(143, 255, 86);

    // let greenLower = new cv.Scalar(95, 110, 71);
    // let greenUpper = new cv.Scalar(79, 255, 67);

    let low = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), greenLower);
    let high = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), greenUpper);

    let mask = new cv.Mat();
    let mask1 = new cv.Mat();
    let mask2 = new cv.Mat();
    cv.inRange(hsv, low, high, mask1);
    cv.threshold(mask1, mask, 120, 255, cv.THRESH_BINARY);
    cv.bitwise_not(mask, mask2);

    let M = cv.Mat.ones(5, 5, cv.CV_8U);
    let anchor = new cv.Point(-1, -1);
    cv.erode(mask1, mask, M, anchor, 2, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
    cv.dilate(mask1, mask, M, anchor, 2, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());

    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    let cnts = contours.get(0);

    cv.findContours(mask, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);

    if(contours.size() == 0) {
      console.log('Could not recognize tracking point.')
      alert('Could not recognize tracking point.')
    }

    // for(let i = 0; i < contours.size(); i++) {
    //   cv.drawContours(src, contours, i, [0, 255, 0, 255], 2, cv.LINE_8, hierarchy, 100);
    // }

    let Moments;
    let M00;
    let M10;
    let M00Array = [0,];

    for(let j = 0; j < contours.size(); j++) {
      cnts = contours.get(j);
      Moments = cv.moments(cnts,false);
      M00Array[j] = Moments.m00;
    }

    Moments = cv.moments(cnts, false);
    M00 = Moments.m00;
    M10 = Moments.m10;
    M01 = Moments.m01;
    x_cm = M10/M00;
    y_cm = M01/M00;

    radius = cv.minEnclosingCircle(cnts).radius;
    barMath(x_cm, y_cm);

    let centerPoint = new cv.Point(x_cm, y_cm);
    centerPointArray[count] = centerPoint;
    count++;
    cv.circle(src, centerPoint, 4, [0, 0, 255, 255], 2, cv.LINE_AA, 0);

    for(let k = 0; k < centerPointArray.length; k++) {
      // console.log(centerPointArray[k - 1])
      if(centerPointArray[k - 1] == null || centerPointArray[k] == null){
        continue;
      }
      cv.line(src, centerPointArray[k - 1], centerPointArray[k], [red, green, blue, 255], 2); // pathColor [0, 255, 0, 255]
    }

    cv.imshow("canvasOutput", src);

    dst.delete();
    src.delete();
    mask.delete();
    mask1.delete();
    mask2.delete();
    low.delete();
    high.delete();
    contours.delete();
    hierarchy.delete();
    hsv.delete();

    let delay = 1000/FPS - (Date.now() - begin);
    setTimeout(processVideo, delay);
  }

  setTimeout(processVideo, 0);
}
