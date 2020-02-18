import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, LoadingController } from 'ionic-angular';
import { SplitService } from '../../../providers/split-service';

@IonicPage()
@Component({
  selector: 'page-create-group',
  templateUrl: 'create-group.html'
})
export class CreateGroupPage {
  //
  dataList : any;
  numParticipantes : number = 0;
  item;
  action : string;
  form;
  loading;
  participants : any;
  isUserAdmin : boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams, 
              public loadingCtrl: LoadingController, 
              private  splitService : SplitService,
              public modalCtrl: ModalController
              ) {
    this.item = navParams.get('item');
    this.action = navParams.get('action');
    this.isUserAdmin = navParams.get('isAdmin');
    this.participants = this.splitService.participantsSubject.getValue();
  }

  ionViewDidLeave(){
    
  }

  ionViewDidLoad() {
    this.loadParticipants();    
  }

  loadParticipants(){
    if (!this.item.participants) return;

    const listParticips = {};
    this.participants.forEach(element => {
      listParticips[element.uid] = element;
    });
    let list = [];
    for (const uid in this.item.participants){
      if (listParticips[uid])
        list.push(listParticips[uid]);
      else{
        list.push({uid : uid, displayName : 'Participante excluído.'})
      }
    }
    this.dataList = list; //.sort(UserModel.compare);
    this.numParticipantes = list.length;    
  }


  addParticipant(){

    let modal = this.modalCtrl.create("AddParticipantPage", {evento:this.splitService.evento, item : this.item });
    modal.onDidDismiss(data=>{
      if (!data) return;
      if (this.dataList){
        data.forEach(element => {
          this.dataList.push(element);
        });
      }else{
        this.dataList = data;
      }
      //this.dataList = this.dataList.sort(UserModel.compare);
      this.numParticipantes = this.dataList.length;
    });
    modal.present();

  } 

  countParticipants(participants){
    return participants ?  Object.keys(participants).length : 0;
  }

  removeItem(participant){
    this.splitService.removeParticipant(this.item.groupId, participant.uid);
    let index = this.dataList.indexOf(participant, 0);
    if (index > -1) {
      this.dataList.splice(index, 1);
      delete this.item.participants[participant.uid];
    }
    
  }

  canAddParticipant(){
    return this.isUserAdmin;
  }



}