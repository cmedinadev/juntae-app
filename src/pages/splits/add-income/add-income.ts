import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-add-income',
  templateUrl: 'add-income.html',
})
export class AddIncomePage {

  item : any;  
  mapParticipants : any;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.mapParticipants = navParams.get("participantes");
    this.item = navParams.get("item");
  }
  
}
