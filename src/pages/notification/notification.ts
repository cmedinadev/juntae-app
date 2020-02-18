import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-notification',
  templateUrl: 'notification.html',
})
export class NotificationPage {

  data : any;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
     this.data = navParams.get("data");
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NotificationPage');
  }

  

}
