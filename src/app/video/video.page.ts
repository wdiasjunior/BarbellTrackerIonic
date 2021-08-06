import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

declare var cv: any;

@Component({
  selector: 'app-video',
  templateUrl: './video.page.html',
  styleUrls: ['./video.page.scss'],
})

export class VideoPage implements OnInit {

  videoSource: string;
  tab: number;

  videoInput: any = <HTMLVideoElement>document.getElementById("videoInput");
  canvas: any = document.getElementById("canvasOutput");

  streaming: boolean = false;

  weightUnit: string = 'kg';
  weight: number;

  isConcentric = false;
  rest: boolean = true;
  yVelocity: number = 0;
  // velocity = 0;
  velocities = [];
  avgVelocity: number = 0;
  peakVelocity: number = 0;
  acceleration: number = 0;
  power: number = 0;
  hDisplacement: number = 0;
  lastY: number = 0;
  lastX: number = 0;
  xDisp: number = 0;
  yDisp: number = 0;
  // xDistance: number = 0;
  yDistance: number = 0;
  // distance: number = 0;
  barRadius: number = 25;
  mmpp: number = 0;
  initialY: number = 0;
  oscilation: number = 40;
  radius: number = null;
  refRadius: number = null;

  red: number = 0;
  green: number = 255;
  blue: number = 0;

  width: number = 432;
  height: number = 768;
  FPS: number = 30;

  count: number = 0;
  centerPointArray: any = [];// = new Array();

  v: any = 0;
  a: any = 0;
  hD: any = 0;


  constructor(private router: Router,) {
    //
    console.log(cv)
  }

  ngOnInit() {
    // this.redirect('home');
    this.tab = 1;
    // this.videoSource = "/assets/media/2.mp4";
    // this.videoSource = JSON.parse(localStorage.getItem('videoPath'));
    // this.setup();
  }

  redirect(page: string) {
      this.router.navigate(['/' + page + '']);
  }

  // tabChanged(i: number) {
  //   this.tab = (i == 1) ? 1 : 2;
  // }

  loadSampleVideo() {
    document.getElementById("videoInput").removeAttribute("src");
    document.getElementById("videoInput").setAttribute("src", "assets/media/2.mp4");
    console.log("Video Loaded");
    (<HTMLVideoElement>document.getElementById("videoInput")).pause();
  }

  playPause() {
    if(this.streaming == false) {
      this.videoInput.play();
      document.getElementById('playPause').innerHTML = "Stop";
    } else {
      this.videoInput.pause();
      document.getElementById('playPause').innerHTML = "Play";
    }
    this.streaming = !this.streaming;
  }

  barMath(x, y) {

    // acceleration (m/s^2)
    // speed/velocity (concentric only m/s)
    // power (kW)
    // horizontal displacement (cm)
    // current, average, min, max(peak) of each above ?

    if(this.initialY == 0) {
      this.initialY = y;
    }
    if((this.initialY + this.oscilation) < y) { // checks for rep. ignores bar whip in between reps
      this.rest = false;
      if(y < this.lastY) { // checks if movement is concentric
        this.isConcentric = true;
        // this.velocity = 0;
        this.yVelocity = 0;
        if (this.radius / this.height > 0.0125) {
          if(this.refRadius == null) {
            this.refRadius = this.radius;
            this.mmpp = this.barRadius / this.refRadius;
          }
          this.xDisp = this.lastX - x;
          this.xDisp = (this.xDisp / 10);
          this.yDisp = this.lastY - y
          // xthis.Distance = this.xDisp * this.mmpp;
          this.yDistance = this.yDisp * this.mmpp;
          // this.distance = Math.sqrt(this.xDisp ** 2 + this.yDisp ** 2) * this.mmpp;
          if(Math.abs(this.yDistance) > (this.barRadius / 4)) {
            // this.velocity = this.distance * this.FPS / 1000;
            this.yVelocity = this.yDistance * this.FPS / 1000;
            this.velocities.push(this.yVelocity);
          }
        }
      } else {
        this.isConcentric = false;
        this.lastY = y;
        this.lastX = x;
      }
    } else {
      this.lastY = 0;
      this.lastX = 0;
      this.rest = true;
    }

    let sum = 0;
    for(let i = 0; i < this.velocities.length; i++) {
      sum += this.velocities[i];
    }
    this.avgVelocity = (sum / this.velocities.length) / 10;
    this.acceleration = (this.avgVelocity / (this.FPS / 1000)) / 10;

    this.v = this.avgVelocity.toFixed(2);
    this.a = this.acceleration.toFixed(2);
    // document.getElementById("power").innerHTML = power;
    this.hD = -this.xDisp.toFixed(2);

  }

  pathColorChange(color) {
    if(color == 'red') {
      this.red = 255;
      this.green = 0;
      this.blue = 0;
      (<HTMLInputElement>document.getElementById('redButton')).disabled = true;
      (<HTMLInputElement>document.getElementById('greenButton')).disabled = false;
      (<HTMLInputElement>document.getElementById('blueButton')).disabled = false;
    } else if(color == 'green') {
      this.red = 0;
      this.green = 255;
      this.blue = 0;
      (<HTMLInputElement>document.getElementById('redButton')).disabled = false;
      (<HTMLInputElement>document.getElementById('greenButton')).disabled = true;
      (<HTMLInputElement>document.getElementById('blueButton')).disabled = false;
    } else if(color == 'blue') {
      this.red = 0;
      this.green = 0;
      this.blue = 255;
      (<HTMLInputElement>document.getElementById('redButton')).disabled = false;
      (<HTMLInputElement>document.getElementById('greenButton')).disabled = false;
      (<HTMLInputElement>document.getElementById('blueButton')).disabled = true;
    }
  }

  processVideo() {

    let src = new cv.Mat(this.height, this.width, cv.CV_8UC4);
    let dst = new cv.Mat(this.height, this.width, cv.CV_8UC1);
    let cap = new cv.VideoCapture("videoInput"); // this.videoInput
    (<HTMLButtonElement>document.getElementById("playPause")).disabled = false;

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
    let M01;
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
    let x_cm = M10/M00;
    let y_cm = M01/M00;

    this.radius = cv.minEnclosingCircle(cnts).radius;
    this.barMath(x_cm, y_cm);

    let centerPoint = new cv.Point(x_cm, y_cm);
    this.centerPointArray[this.count] = centerPoint;
    this.count++;
    cv.circle(src, centerPoint, 4, [0, 0, 255, 255], 2, cv.LINE_AA, 0);

    for(let k = 0; k < this.centerPointArray.length; k++) {
      // console.log(centerPointArray[k - 1])
      if(this.centerPointArray[k - 1] == null || this.centerPointArray[k] == null){
        continue;
      }
      cv.line(src, this.centerPointArray[k - 1], this.centerPointArray[k], [this.red, this.green, this.blue, 255], 2); // pathColor [0, 255, 0, 255]
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

    let delay = 1000/this.FPS - (Date.now() - begin);
    setTimeout(this.processVideo, delay);
  }

}
