import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// declare var cv: any;

@Component({
  selector: 'app-video',
  templateUrl: './video.page.html',
  styleUrls: ['./video.page.scss'],
})

export class VideoPage implements OnInit {

  videoSource: string;
  tab: number;

  constructor(private router: Router,) {
    //

  }

  ngOnInit() {
    this.tab = 1;
    // this.videoSource = "/assets/media/2.mp4";
    // this.videoSource = JSON.parse(localStorage.getItem('videoPath'));
  }

  redirect(page: string) {
      this.router.navigate(['/' + page + '']);
  }

  // tabChanged(i: number) {
  //   this.tab = (i == 1) ? 1 : 2;
  // }

}
