import { BrMaskerModule } from 'brmasker-ionic-3';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreateExpensePage } from './create-expense';
import { DirectivesModule } from "../../../directives/directives.module";

@NgModule({
  declarations: [
    CreateExpensePage,
  ],
  imports: [
    IonicPageModule.forChild(CreateExpensePage),
    DirectivesModule, 
    BrMaskerModule
  ],
  //providers:[SplitService]
})
export class CreateExpensePageModule {}
