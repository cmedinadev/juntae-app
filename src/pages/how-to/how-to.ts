import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Firebase } from '@ionic-native/firebase';


@IonicPage()
@Component({
  selector: 'page-how-to',
  templateUrl: 'how-to.html',
})
export class HowToPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, private fireNative: Firebase) {
  }

  ionViewDidLoad() {
    this.fireNative.setScreenName('Como usar?').then();
  }

}
