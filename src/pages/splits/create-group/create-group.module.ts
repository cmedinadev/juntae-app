import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreateGroupPage } from './create-group';
import { IonicImageLoader } from "ionic-image-loader/dist";
import { DirectivesModule } from '../../../directives/directives.module';

@NgModule({
  declarations: [
    CreateGroupPage,
  ],
  imports: [
    IonicPageModule.forChild(CreateGroupPage),
        IonicImageLoader,
        DirectivesModule
  ],
})
export class CreateGroupPageModule {}
