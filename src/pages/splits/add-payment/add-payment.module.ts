import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddPaymentPage } from './add-payment';
import { BrMaskerModule } from 'brmasker-ionic-3';
import { PipesModule } from '../../../pipes/pipes.module';

@NgModule({
  declarations: [
    AddPaymentPage,
  ],
  imports: [
    IonicPageModule.forChild(AddPaymentPage),
    BrMaskerModule, PipesModule
  ],
})
export class AddPaymentPageModule {}
