import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SplitsPage } from './splits';
import { PipesModule } from '../../../pipes/pipes.module';
import { IonicImageLoader } from "ionic-image-loader/dist";
import { DirectivesModule } from '../../../directives/directives.module';
@NgModule({
  declarations: [
    SplitsPage,
  ],
  imports: [
    IonicPageModule.forChild(SplitsPage),
    IonicImageLoader,
    PipesModule,
    DirectivesModule
  ],
})
export class SplitsPageModule {}
