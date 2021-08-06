import { Component, OnInit } from '@angular/core';
import { ActionSheetController, Platform } from '@ionic/angular';
import { MediaCapture, MediaFile } from '@ionic-native/media-capture/ngx';
import { File, FileEntry } from '@ionic-native/file/ngx';
import { StreamingMedia } from '@ionic-native/streaming-media/ngx';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { Router } from '@angular/router';
import { FilePath } from '@ionic-native/file-path/ngx';
declare var cv: any;

const FOLDER_NAME = 'tcc';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  videoPath: any
  // videoPath: string = "";

  constructor(private mediaCapture: MediaCapture,
              private file: File,
              private streamingMedia: StreamingMedia,
              private fileChooser: FileChooser,
              private filePath: FilePath,
              private router: Router,
              //private actionSheetController: ActionSheetController,
              //private plt: Platform
            ) {
    //

  }

  // constructor() {}

  ngOnInit() {
    //this.loadFiles();
  //   this.plt.ready().then(() => {
  //     let path = this.file.dataDirectory;
  //     this.file.checkDir(path, MEDIA_FOLDER_NAME).then(
  //       () => {
  //         this.loadFiles();
  //       },
  //       err => {
  //         this.file.createDir(path, MEDIA_FOLDER_NAME, false);
  //       }
  //     );
  //   });
  }

  loadFiles() {
  //   this.file.listDir(this.file.dataDirectory, FOLDER_NAME).then(
  //     res => {
  //       this.files = res;
  //     },
  //     err => console.log('error loading files: ', err)
  //   );
   }

  recordVideo() {
    this.mediaCapture.captureVideo().then(
      (data: MediaFile[]) => {
        if (data.length > 0) {
          this.copyFileToLocalDir(data[0].fullPath);
        }
      },
      (err) => console.error(err)
    );
  }

  async selectMedia() {
  //   const actionSheet = await this.actionSheetController.create({
  //     header: 'What would you like to add?',
  //     buttons: [
  //       {
  //         text: 'Record Video',
  //         handler: () => {
  //           this.recordVideo();
  //         }
  //       },
  //       {
  //         text: 'Cancel',
  //         role: 'cancel'
  //       }
  //     ]
  //   });
  //   await actionSheet.present();
   }


  copyFileToLocalDir(fullPath) {
  //   let myPath = fullPath;
  //   // Make sure we copy from the right location
  //   if (fullPath.indexOf('file://') < 0) {
  //     myPath = 'file://' + fullPath;
  //   }
  //
  //   const ext = myPath.split('.').pop();
  //   const d = Date.now();
  //   const newName = `${d}.${ext}`;
  //
  //   const name = myPath.substr(myPath.lastIndexOf('/') + 1);
  //   const copyFrom = myPath.substr(0, myPath.lastIndexOf('/') + 1);
  //   const copyTo = this.file.dataDirectory + FOLDER_NAME;
  //
  //   this.file.copyFile(copyFrom, name, copyTo, newName).then(
  //     success => {
  //       this.loadFiles();
  //     },
  //     error => {
  //       console.log('error: ', error);
  //     }
  //   );
   }

  selectFile() {
    // if (f.name.indexOf('.MOV') > -1 || f.name.indexOf('.mp4') > -1) {
    //   // E.g: Use the Streaming Media plugin to play a video
    //   this.streamingMedia.playVideo(f.nativeURL);
    // }
    this.fileChooser.open({ "mime": "video/mp4" }).then(uri => console.log(uri)).catch(e => console.log(e));

    this.fileChooser.open().then((fileuri) => {
      this.videoPath = this.filePath.resolveNativePath((fileuri));

    });

    localStorage.setItem('videoPath', this.videoPath);


  }

  redirect(page: string){
      this.router.navigate(['/' + page + '']);
  }

}
