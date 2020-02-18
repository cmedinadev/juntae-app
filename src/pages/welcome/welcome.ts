import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Firebase } from '@ionic-native/firebase';

@IonicPage()
@Component({
  selector: 'page-welcome',
  templateUrl: 'welcome.html',
})
export class WelcomePage {

  constructor(public navCtrl: NavController, public navParams: NavParams, private fireNative: Firebase) {
  }

  ionViewDidLoad() {
    this.fireNative.setScreenName('Bem-vindo').then();
  }

  loginPhone() {
    this.navCtrl.push("LoginPage");
  }

}
