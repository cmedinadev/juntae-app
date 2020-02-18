import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddIncomePage } from './add-income';
import { IonicImageLoader } from 'ionic-image-loader';
import { DirectivesModule } from '../../../directives/directives.module';
import { PipesModule } from "../../../pipes/pipes.module";

@NgModule({
  declarations: [
    AddIncomePage,
  ],
  imports: [
    IonicPageModule.forChild(AddIncomePage),
    IonicImageLoader,
    DirectivesModule,
    PipesModule    
  ],
})
export class AddIncomePageModule {}
