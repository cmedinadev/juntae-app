import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule, LOCALE_ID } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Camera } from '@ionic-native/camera';
//import { Keyboard } from '@ionic-native/keyboard';
import { HttpClientModule } from '@angular/common/http';

import {FirebaseProvider} from '../providers/mock.providers';

import { JuntaeApp } from './app.component';
import { HomePage } from '../pages/home/home';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireDatabaseModule } from '@angular/fire/database'; //npm i @firebase/database@0.2.1  
import { AngularFireStorageModule } from '@angular/fire/storage';

import { UserService } from '../providers/user-service';
import { MenuService } from '../providers/menu-service';
import { EventService } from '../providers/event-service';
import { AuthService } from '../providers/auth-service';
import { ListService } from '../providers/list-service';
import { SplitService } from '../providers/split-service';
import { HistoryService } from '../providers/history-service';

//import { FCM } from '@ionic-native/fcm';
import { NotificationService } from "../providers/notification";

import { IonicStorageModule } from '@ionic/storage';
import { IonicImageLoader } from 'ionic-image-loader';
import { HttpModule } from '@angular/http';
import { LaunchNavigator } from '@ionic-native/launch-navigator';
import { SocialSharing } from '@ionic-native/social-sharing';

import localePtBr from '@angular/common/locales/pt';
import { registerLocaleData } from '@angular/common';
import { PromptService } from '../providers/prompt-service';
import { UniqueDeviceID } from '@ionic-native/unique-device-id';
//import { FCM } from '@ionic-native/fcm';
import { Keyboard } from '@ionic-native/keyboard';
//import { GoogleAnalytics } from '@ionic-native/google-analytics';

var firebaseConfig = {
  apiKey: "AIzaSyAwXO0FMM0bBlwmxZIOEAonb4wBj2iYj10",
  authDomain: "juntae-app.firebaseapp.com",
  databaseURL: "https://juntae-app.firebaseio.com",
  projectId: "juntae-app",
  storageBucket: "juntae-app.appspot.com",
  messagingSenderId: "787681286723"
};

registerLocaleData(localePtBr);

@NgModule({
  declarations: [
    JuntaeApp,
    HomePage,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(JuntaeApp, {
      monthNames: ['janeiro', 'fevereiro', 'mar\u00e7o', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro' ],
      monthShortNames: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
      dayNames: ['domingo', 'segunda-feira', 'ter\u00e7a-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'],
      dayShortNames: ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab' ],
      cancelButtonText: 'Cancelar',
      platforms: {
        ios: {
          backButtonText: 'Voltar',
        }
      }
    }), 
    AngularFireModule.initializeApp(firebaseConfig, 'juntae-app'), 
    AngularFireDatabaseModule,
    AngularFirestoreModule, 
    AngularFirestoreModule.enablePersistence(),
    IonicStorageModule.forRoot(),
    IonicImageLoader.forRoot(),
    AngularFireAuthModule,    
    AngularFireStorageModule, 
    HttpModule,
    HttpClientModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    JuntaeApp,
    HomePage,
  ],
  providers: [
    { provide: LOCALE_ID, useValue: "pt-BR" },
    AngularFireAuthModule, 
    StatusBar,
    SplashScreen, Camera, 
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    UserService,
    MenuService,
    EventService,
    AuthService,
    ListService,
    SplitService,
    HistoryService,
    NotificationService,
    LaunchNavigator,
    SocialSharing,
    PromptService,
    UniqueDeviceID,
    //FCM,
    Keyboard, FirebaseProvider
    //GoogleAnalytics
  ]
})
export class AppModule {}
