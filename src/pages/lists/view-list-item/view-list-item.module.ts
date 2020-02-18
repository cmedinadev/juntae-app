import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ViewListItemPage } from './view-list-item';
import { PipesModule } from '../../../pipes/pipes.module';
import { ColorGenerator } from '../../../directives/text-avatar/color-generator';

@NgModule({
  declarations: [
    ViewListItemPage,
  ],
  imports: [
    IonicPageModule.forChild(ViewListItemPage),
    PipesModule,
  ],
  providers : [ColorGenerator]
})
export class ViewListItemPageModule {}
