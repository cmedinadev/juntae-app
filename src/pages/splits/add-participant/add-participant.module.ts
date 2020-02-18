import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddParticipantPage } from './add-participant';
import { IonicImageLoader } from "ionic-image-loader/dist";
import { DirectivesModule } from '../../../directives/directives.module';

@NgModule({
  declarations: [
    AddParticipantPage,
  ],
  imports: [
    IonicPageModule.forChild(AddParticipantPage),
    IonicImageLoader,
    DirectivesModule
  ],
})
export class AddParticipantPageModule {}
