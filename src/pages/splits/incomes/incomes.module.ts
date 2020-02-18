import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { IncomesPage } from './incomes';
import { IonicImageLoader } from 'ionic-image-loader';
import { DirectivesModule } from '../../../directives/directives.module';
import { PipesModule } from '../../../pipes/pipes.module';

@NgModule({
  declarations: [
    IncomesPage,
  ],
  imports: [
    IonicPageModule.forChild(IncomesPage),
    IonicImageLoader,
    DirectivesModule,
    PipesModule   
  ],

})
export class IncomesPageModule {}


