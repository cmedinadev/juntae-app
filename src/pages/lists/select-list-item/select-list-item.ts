import { Component, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { UserService } from '../../../providers/user-service';
import { ListService } from '../../../providers/list-service';
import { HistoryService } from "../../../providers/history-service";
import { Firebase } from '@ionic-native/firebase';

@IonicPage()
@Component({
  selector: 'page-select-list-item',
  templateUrl: 'select-list-item.html'
})
export class SelectListItemPage {

  userId: string;
  item : any;
  copyMembers : any = null;
  listId;
  quantidade : number = 1;
  arrQuant = [];
  isAdding : boolean = false;
  isUserAdmin : boolean = false;
  participantes : any;
  userID;
  evento;
  height : number;
  changed : boolean  = false;
  

  constructor(public navCtrl: NavController, 
              private listsService: ListService, 
              public params: NavParams, 
              private fireNative: Firebase, 
              private userService : UserService, 
              private alertCtrl : AlertController,
              private viewCtrl : ViewController
            ) 
  {
    this.item = params.get('listItem');
    this.copyMembers = this.item["members"] ? JSON.parse(JSON.stringify(this.item["members"])) : null;
    this.listId = params.get('listId');
    this.evento = params.get("evento");
    this.isUserAdmin = params.get('isUserAdmin');
    this.participantes = params.get("participantes");
    this.userId = this.userService.getUser().uid;

  }

  ionViewDidLoad() {
    this.fireNative.setScreenName('Itens selecionados da lista').then();
    let obj = <HTMLElement>(document.getElementsByClassName('popover-wrapper')[0]);
    this.height = obj.offsetHeight - obj.offsetTop - 56;
    let content = <HTMLElement>(obj.getElementsByClassName('scroll-content')[0]);
    content.style.height = this.height + 'px';
  }

  canChoose(){
    return !this.item.allowMaxAmount || this.item.maxAmount > this.getQuantity();
  }

  increment(uid){
    this.item.members[uid].quantity++;  
    this.changed = true;
  }

  getQuantity(){
    const members = this.item.members;
    let num = 0;
    for (const key in members) {
      num += members[key].quantity;
    }
    return num;
  }

  decrement(uid){
    this.changed = true;
    if (this.item.members[uid].quantity > 1)
      this.item.members[uid].quantity--;  
    else
      delete this.item.members[uid];  
  }

  dismiss(cancel? : boolean){
    if (cancel){
      this.item["members"] = this.copyMembers;
    }
    this.viewCtrl.dismiss();
  }

  addLine(){
    let inputs = [];
    for (const uid in this.participantes){
      inputs.push( {
        type:'radio',
        label: this.participantes[uid].displayName,
        value:uid
     });
    }

    let prompt = this.alertCtrl.create({
    title: 'Participante',
    message: 'Selecione o participante',
    inputs : inputs,
    buttons : [
    {
        text: "Cancelar",
        handler: data => {
        console.log("cancel clicked");
        }
    },
    {
        text: "OK",
        handler: data => {
          this.item["members"] = this.item["members"] || {};
          this.item.members[data] = {quantity : 1}
          this.changed = true;
        }
    }]});
    prompt.present();
  }

  gravar(){
      this.listsService.adicionarParticipantesNoItem(this.evento.eventId, this.listId, this.item);
      this.dismiss();
  }

}
