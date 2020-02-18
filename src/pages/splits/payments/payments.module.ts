import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PaymentsPage } from './payments';
import { IonicImageLoader } from "ionic-image-loader/dist";
import { DirectivesModule } from "../../../directives/directives.module";
import { PipesModule } from "../../../pipes/pipes.module";
//import { MomentModule } from 'angular2-moment';

@NgModule({
  declarations: [
    PaymentsPage,
  ],
  imports: [
    IonicPageModule.forChild(PaymentsPage),
    IonicImageLoader,
    DirectivesModule,
    PipesModule,
    //MomentModule
    
  ],
})
export class PaymentsPageModule {}
