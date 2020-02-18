import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ParticipantsPage } from './participants';
import { IonicImageLoader } from "ionic-image-loader/dist";
import { DirectivesModule } from '../../directives/directives.module';

@NgModule({
  declarations: [
    ParticipantsPage,
  ],
  imports: [
    IonicPageModule.forChild(ParticipantsPage),
    IonicImageLoader,
    DirectivesModule
  ],
})
export class ParticipantsPageModule {}
