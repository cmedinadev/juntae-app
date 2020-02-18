import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreateListItemPage } from './create-list-item';

@NgModule({
  declarations: [
    CreateListItemPage,
  ],
  imports: [
    IonicPageModule.forChild(CreateListItemPage),
  ],
})
export class CreateListItemPageModule {}
