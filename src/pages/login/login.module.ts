import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoginPage } from './login';
import { HttpModule } from '@angular/http';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    LoginPage,
  ],
  imports: [
    IonicPageModule.forChild(LoginPage),
    HttpModule, 
    PipesModule
  ],
})
export class LoginPageModule {}
