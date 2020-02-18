import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PerfilPage } from './perfil';
import { IonicImageLoader } from "ionic-image-loader/dist";

@NgModule({
  declarations: [
    PerfilPage,
  ],
  imports: [
    IonicPageModule.forChild(PerfilPage),
    IonicImageLoader,
  ],
})
export class PerfilPageModule {}
