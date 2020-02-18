import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { SplitService } from '../../../providers/split-service';

@IonicPage()
@Component({
  selector: 'page-add-participant',
  templateUrl: 'add-participant.html'
})
export class AddParticipantPage {

  dataList;
  numConvidados;
  item;
  opCheckAll;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams, 
              private  groupsService : SplitService, 
              private viewCtrl: ViewController) {
    this.item = navParams.get("item");
    if (this.item.participants)
      this.numConvidados = Object.keys(this.item.participants).length;
    else
      this.numConvidados = 0;
  } 

  ionViewDidLoad() {
    
    let arr = [];
    const list = this.groupsService.participantsSubject.getValue(); 
    list && list.forEach(element => {
      if (!this.item.participants || !this.item.participants[element.uid]){
        element["checked"] = false;
        arr.push(element);
      }
    });
    this.dataList = arr;
  }

  dismiss(data){
    this.viewCtrl.dismiss(data);
  }

  add(){
    let participants = []; 
    if (!this.item.participants){
      this.item.participants = this.item["participants"] = {};
    }
    let hasRecord : boolean = false; 
    this.dataList.forEach(element => {
      if (element.checked){
        hasRecord = true;
        this.item.participants[element.uid] = true;
        participants.push(element);
      }
    });
    if (hasRecord){
      this.groupsService.updateGroup(this.item);
    }
    this.dismiss(participants);
  }

  checkAll(){
    this.dataList.forEach(element => {
      element.checked = this.opCheckAll;
    });
  }
  

}
