import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EventDetailsPage } from './event-details';
import { IonicImageLoader } from 'ionic-image-loader';

@NgModule({
  declarations: [
    EventDetailsPage,

  ],
  imports: [
    IonicPageModule.forChild(EventDetailsPage),
    IonicImageLoader,
  ],
})
export class EventDetailsPageModule {

}
