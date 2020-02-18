import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Firebase } from '@ionic-native/firebase';

@IonicPage()
@Component({
  selector: 'page-about',
  templateUrl: 'about.html',
})
export class AboutPage {

  versaoApp = '0.0.49';

  constructor(public navCtrl: NavController, public navParams: NavParams, private fireNative: Firebase) {
    
  }

  ionViewDidLoad() {
    this.fireNative.setScreenName('Sobre o app').then();
  }

}
