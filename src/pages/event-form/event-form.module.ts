import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EventFormPage } from './event-form';
import { IonicImageLoader } from "ionic-image-loader/dist";

@NgModule({
  declarations: [
    EventFormPage,
  ],
  imports: [
    IonicPageModule.forChild(EventFormPage),
    IonicImageLoader,
  ],
})
export class EventFormPageModule {}
