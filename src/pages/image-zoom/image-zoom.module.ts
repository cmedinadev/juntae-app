import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ImageZoomPage } from './image-zoom';
import { IonicImageLoader } from "ionic-image-loader/dist";

@NgModule({
  declarations: [
    ImageZoomPage,
  ],
  imports: [
    IonicPageModule.forChild(ImageZoomPage),
    IonicImageLoader,
  ],
})
export class ImageZoomPageModule {}
