import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChatPage } from './chat';
//import { MomentModule } from 'angular2-moment';
import { HttpClientModule } from "@angular/common/http";
import { DirectivesModule } from "../../directives/directives.module";
//import { ChatService } from "../../providers/chat-service";
import { Network } from '@ionic-native/network';

@NgModule({
  declarations: [
    ChatPage,
  ],
  imports: [
    IonicPageModule.forChild(ChatPage),
    HttpClientModule,
    //MomentModule, 
    DirectivesModule
  ],
  providers:[
  //  ChatService
    Network
  ]
})
export class ChatPageModule {}
