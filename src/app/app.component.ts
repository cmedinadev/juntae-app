import { Component, ViewChild } from '@angular/core';
import { Platform, NavController, AlertController, ToastController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AngularFireAuth } from '@angular/fire/auth';
import { UserService } from '../providers/user-service';
import { HomePage } from '../pages/home/home';
import { MenuService } from '../providers/menu-service';
import { ChatPage } from "../pages/chat/chat";
import { NotificationService } from '../providers/notification';
import { Firebase } from '@ionic-native/firebase';


@Component({
  templateUrl: 'app.html'
})
export class JuntaeApp {

  @ViewChild('myNav') nav: NavController;
  rootPage:any = null;

  constructor(platform: Platform, 
              statusBar: StatusBar, 
              splashScreen: SplashScreen,
              private afAuth: AngularFireAuth, 
              public userProvider : UserService, 
              public toastCtrl: ToastController, 
              public menuService : MenuService, 
              private fcm: Firebase, 
              private alertCtrl : AlertController,
              private notification : NotificationService) {
  
    platform.ready().then(() => {
      statusBar.styleDefault();
      
      //keyboard.disableScroll(true);
      //keyboard.hideKeyboardAccessoryBar(false);

      const authObserver = afAuth.authState.subscribe(res => {
        splashScreen.hide();
        if (res){
            this.userProvider.setFirebaseUser(res);
            let user : User = res.toJSON() as User;
            if(!platform.is("core")) {
              platform.is('android') ? this.configOnNotification(user) : 
                fcm.grantPermission().then(()=>{
                   this.configOnNotification(user);
               });
            }
            this.rootPage = user.displayName ? HomePage : this.rootPage = 'PerfilPage';
        } else {
            this.rootPage = 'WelcomePage';
        }
        authObserver.unsubscribe();
      });
    });
  }

  configOnNotification(user){
    this.fcm.subscribe('all');
    this.fcm.subscribe('authenticated');
    this.fcm.onNotificationOpen().subscribe(data => {
        let self = this;
        if(data.tap) {
          if (data.action == 'chat'){
            if ( !(this.nav.getActive().instance instanceof ChatPage) || (data.eventId != this.nav.getActive().instance["eventoID"]) ){
              self.nav.push("ChatPage", {data:JSON.parse(data.evento)});
            }
          }
        } else {
          if (data.action == 'chat'){
            if ( !(this.nav.getActive().instance instanceof ChatPage) || (data.eventId != this.nav.getActive().instance["eventoID"]) ){
              let toast = self.toastCtrl.create({
                message: data.message,
                showCloseButton: true,
                closeButtonText: 'Ver',                
                duration: 4000
              });
              toast.onDidDismiss((dataToast, role) => {    
                  if (role == "close") {
                    if (this.nav.getActive().instance instanceof ChatPage && data.eventId != this.nav.getActive().instance["eventoID"]){
                      self.nav.pop();
                    }
                    self.nav.push("ChatPage", { data:JSON.parse(data.evento)});
                  }
              });              
              toast.present();
            }
          }else{    
            let confirmAlert = this.alertCtrl.create({
                title: 'Notificação',
                message: data.title,
                buttons: [{
                  text: 'Ignorar',
                  role: 'cancel'
                }, {
                    text: 'Ver',
                    handler: () => {
                        self.nav.push("NotificationPage", { data : data });
                    }
                  }]
              });
              confirmAlert.present();      
          }  
        };
      });
      this.fcm.onTokenRefresh().subscribe(res => {
        this.notification.saveToken((user.phoneNumber ? user.phoneNumber.substring(1): user.uid), res).then();
      });      
  }

  openPerfil(){
    this.nav.push("PerfilPage", { action : "edit" } );    
  }

  logout(){
    this.fcm.unsubscribe('authenticated');
    this.afAuth.auth.signOut();
  }

}

