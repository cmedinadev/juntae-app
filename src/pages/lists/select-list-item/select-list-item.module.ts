import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SelectListItemPage } from './select-list-item';
import { PipesModule } from '../../../pipes/pipes.module';
import { IonicImageLoader } from 'ionic-image-loader';
import { DirectivesModule } from '../../../directives/directives.module';

@NgModule({
  declarations: [
    SelectListItemPage,
  ],
  imports: [
    IonicPageModule.forChild(SelectListItemPage),
    PipesModule,
    IonicImageLoader,
    DirectivesModule
  ],
})
export class SelectListItemPageModule {}
