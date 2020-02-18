import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, Platform } from 'ionic-angular';
import { HomePage } from '../home/home';
import { UserService } from '../../providers/user-service';
import { AngularFireAuth } from '@angular/fire/auth';
import { Firebase } from '@ionic-native/firebase';
import firebase from 'firebase/app';
import { Subscription } from 'rxjs';
import { Keyboard } from '@ionic-native/keyboard';
import { COUNTRIES } from '../../consts/countries';
import { parsePhoneNumber, CountryCode, PhoneNumber } from 'libphonenumber-js';
import { NotificationService } from '../../providers/notification';
import { AuthService } from '../../providers/auth-service';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  public phone: string;
  public phoneNumber: PhoneNumber;
  public codeCountry : CountryCode = 'BR';
  private authSub: Subscription;
  loading: any;
  code: string;
  waiting = false;
  verificationId: string;
  listCountry = COUNTRIES;

  constructor(public navCtrl: NavController, public navParams: NavParams, 
    public alertCtrl: AlertController, private userProvider: UserService, 
    private fireAuth: AngularFireAuth, private notification: NotificationService,
    private fireNative: Firebase, private keyboard: Keyboard, private authService: AuthService,
    private loadingController : LoadingController) {
  }

  ionViewDidLoad() {
    this.fireNative.setScreenName('Login').then();
    this.authSub = this.fireAuth.authState.subscribe((user: firebase.User) => {
      if (user) {        
        this.doLogin(user);
      }
    });
    this.keyboard.disableScroll(true);
  }

  ionViewDidLeave(){
    this.authSub.unsubscribe();
    this.keyboard.disableScroll(false);
  }

  async registerPhone(): Promise<void> {
    this.code = '';
    let num = parsePhoneNumber(this.phone, this.codeCountry);
    if (!num.isValid()){
      this.alertCtrl.create({title: 'Erro', message: 'Número de telefone inválido!', buttons: ['OK']}).present();
      return;
    }
    this.loading = this.loadingController.create({
      content: 'Enviando SMS...', 
      dismissOnPageChange : true
    });
    this.loading.present();    
    const phone = num.number.toString();
    /*if(document.URL.startsWith('http') || document.URL.startsWith('http://localhost:8080')){
      this.authService.signInWithCustomToken(phone.substring(1)).subscribe();
      return;
    }*/
    const result = await this.fireNative.verifyPhoneNumber(phone, 120);
    this.showPrompt(result.verificationId || result);
  }

  private async verifyCode(code: string, verificationId: string): Promise<void> {
    this.loading = this.loadingController.create({
      content: 'Carregando...', 
      dismissOnPageChange : true
    });
    this.loading.present();    
    try{
      const credential = await firebase.auth.PhoneAuthProvider.credential(verificationId, code);
      await this.fireAuth.auth.signInAndRetrieveDataWithCredential(credential);
    } catch(error){
      this.loading.dismiss();
      let msg = null;
      switch(error.code){
        case 'auth/invalid-verification-code':
          msg = 'Código de verificação inválido.';
          break;
        default:
          msg = 'Erro durante a autenticação.'; 
      }
      this.alertCtrl.create({title: 'Erro', message: msg, buttons: ['OK']}).present();
    }
    
  }

  private showPrompt(verificationId: string): void {
    this.loading.dismiss();
    this.waiting = true;
    this.verificationId = verificationId;
  }

  doLogin(_user): any {
    const phoneNumber = _user.phoneNumber ? _user.phoneNumber.substring(1) : _user.uid;
    this.fireNative.setUserId(phoneNumber);
    this.userProvider.setNationalCodeCountry(this.codeCountry);
    this.userProvider.setFirebaseUser(_user);
    this.fireNative.getToken().then(res=>{
      this.notification.saveToken(phoneNumber, res).then();
    });
    this.navCtrl.setRoot(_user.displayName ? HomePage : 'PerfilPage');
  }

  codeVerificationOnKeyUp(event){
    if (event.srcElement.value.length == 6)
      this.verifyCode(event.srcElement.value, this.verificationId);
  }

}
