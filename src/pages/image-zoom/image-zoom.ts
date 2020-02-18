import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-image-zoom',
  templateUrl: 'image-zoom.html',
})
export class ImageZoomPage {

  public src : string;
  public title : string = '';
  constructor(public navCtrl: NavController, public navParams: NavParams, private viewCtrl: ViewController,) {
    this.src = navParams.get("imageSrc");
    this.title = navParams.get("title");
  }

  ionViewDidLoad() {
    
  }

  dismiss(){
    this.viewCtrl.dismiss();
  }

}
