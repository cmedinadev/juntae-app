import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import 'rxjs/add/operator/map';
import { AngularFireDatabase } from "@angular/fire/database";
import { UserService } from "../../providers/user-service";
import * as firebase from 'firebase/app';
import { Firebase } from '@ionic-native/firebase';

@IonicPage()
@Component({
  selector: 'page-contact-us',
  templateUrl: 'contact-us.html',
})
export class ContactUsPage {
  isSent: boolean = false;
  mail : any = {assunto:'', email : '', msg : ''};

  constructor(public navCtrl: NavController, public navParams: NavParams, private user : UserService, 
    private fireNative: Firebase,
    private afDb : AngularFireDatabase, private loadingCtrl : LoadingController) {
  }

  ionViewDidLoad() {
    this.fireNative.setScreenName('Fale conosco').then();
  }

  enviar(){
    let data = {
      uid : this.user.getUser().uid, 
      name : this.user.getUser().displayName,
      email : this.mail.email,
      subject : this.mail.assunto, 
      message : this.mail.msg,
      sentAt : firebase.database.ServerValue.TIMESTAMP
    }
    let loading = this.loadingCtrl.create({
      content: 'Enviando...'
    });
    loading.present().then(()=>{
      this.afDb.list("emails").push(data).then(res=>{
        this.mail = {};
        loading.dismiss();
        this.isSent = true;
      });
    });
  }

}
