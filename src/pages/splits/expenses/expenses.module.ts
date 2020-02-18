import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ExpensesPage } from './expenses';
//import { MomentModule } from 'angular2-moment';
import { PipesModule } from '../../../pipes/pipes.module';

@NgModule({
  declarations: [
    ExpensesPage,
  ],
  imports: [
    IonicPageModule.forChild(ExpensesPage),
    //MomentModule,
    PipesModule
  ],
})
export class ExpensesPageModule {}
