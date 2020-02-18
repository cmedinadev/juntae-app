import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SplitsTabPage } from './splits-tab';
import { DirectivesModule } from '../../directives/directives.module';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    SplitsTabPage,
  ],
  imports: [
    IonicPageModule.forChild(SplitsTabPage),
    DirectivesModule, 
    PipesModule
  ],
  providers : [

  ]
})
export class SplitsPageModule {}
