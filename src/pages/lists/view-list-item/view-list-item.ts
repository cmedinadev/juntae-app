import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController, PopoverController, ToastController } from 'ionic-angular';
import { ListService } from '../../../providers/list-service';
import { EventService } from '../../../providers/event-service';
import { UserService } from '../../../providers/user-service';
import { DomSanitizer } from '@angular/platform-browser';
import { ListModel, ListItemModel } from '../../../model/list.model';
import { HistoryService } from "../../../providers/history-service";
import { Firebase } from '@ionic-native/firebase';

@IonicPage()
@Component({
  selector: 'page-view-list-item',
  templateUrl: 'view-list-item.html', 
})
export class ViewListItemPage {

  item : ListModel = null;
  eventoId : string = null;
  isUserAdmin : boolean;
  dataList : any[];
  participantes : any = {};
  msgList : string = "";
  evento;
  userId;
  interval : number = null;

  constructor(public navCtrl: NavController, private eventosService : EventService,
              public params: NavParams, private listsServices : ListService,
              private modalCtrl : ModalController, private domSanitizer : DomSanitizer,
              private alertCtrl : AlertController, private popoverController : PopoverController,
              private historyService : HistoryService, 
              private fireNative: Firebase,
              private userService : UserService) {
    this.item = params.get('item');
    this.evento = params.get('evento');
    this.eventoId = this.evento.eventId;
    this.isUserAdmin = params.get('isUserAdmin');
    this.userId = this.userService.getUser().uid;
  }

  ionViewDidLoad() {
    this.fireNative.setScreenName('Itens da lista').then();
    const user = this.userService.getUser();
    this.participantes[user.uid] = user; 
    if (!this.isHideChoice()){
      this.eventosService.getParticipants(this.evento, user).subscribe(data=>{
        data && data.forEach(element => {
          this.participantes[element.uid] = element;  
        });  
        this.loadItems().subscribe(data=>this.dataList=data);
      });
    }else{
      this.loadItems().subscribe(data=>this.dataList=data);      
    }
  }

  private loadItems(){
    return this.listsServices.getItemsFromList(this.eventoId, this.item.listId)    
    .map(
      items => {
        for (let key in items){
          let names = this.fillNames(items[key].members);
          let selected = (items[key].members && items[key].members[this.userId] != undefined);
          let quantity = items[key].members ? Object.keys(items[key].members).length : 0;
          Object.assign(items[key], {indeterminate: names != '', usernames: names, chosen:selected, quantity : quantity});
        }
        return items;
      }
    );    
  }

  isHideChoice(){
    return this.item.config.hideChoicePartic && !this.isUserAdmin;
  }

  private fillNames(members){
    if (!members || this.isHideChoice()) return "";
    let names = '';
    for (const uid  in members){
      if (names != ''){
        names += ", ";
      }
      names += this.participantes[uid] ? this.participantes[uid].displayName : uid;
    }
    return names;
  }
  
  getItemFromArray(arr, field, search){
    for (let index in arr){
      if (arr[index][field] == search)
        return arr[index]; 
    }
    return null;
  }

  addListItem(){
    let myModal = this.modalCtrl.create("CreateListItemPage", {eventId:this.evento.eventId, listId: this.item.listId}); 
    myModal.onDidDismiss(data => {
      if (data && data.result == "INSERT"){
        this.historyService.addHistory(this.userService.getUser(), this.evento, "MSG_ADD_ITEM", [data.item.itemName]);
      }
    });
    myModal.present();    
  }

  removeListItem(listItem){
    this.presentConfirm("Confirma a exclusão do item '" + listItem.itemName + "'?", ()=>{
      this.listsServices.removeListItem(this.evento.eventId, this.item.listId, listItem.itemId).then(()=>{
        this.historyService.addHistory(this.userService.getUser(), this.evento, "MSG_REMOVE_ITEM", [listItem.itemName]);
      });
    });
  }

  editListItem(listItem){
    let myModal = this.modalCtrl.create("CreateListItemPage", {eventId:this.evento.eventId, listId: this.item.listId, listItem: listItem}); 
    myModal.onDidDismiss(data => {});
    myModal.present();    
  }

  canAddListItem(){
      return this.isUserAdmin || (this.item.config && this.item.config.allowChangeList == true);
  }

  presentConfirm(msg : string, handlerOK:Function, handlerCancel?:Function) {
    let alert = this.alertCtrl.create({
      title: 'Confirmação',
      message: msg,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => handlerCancel ? handlerCancel() : ()=>{}
        },
        {
          text: 'Excluir',
          handler: () => handlerOK()
        }
      ]
    });
    alert.present();
  }  
  
  getUrlShare(){
    let link = `whatsapp://send?text=${encodeURI(this.msgList)}`;
    return this.sanitize(link);
  }

  sanitize(url:string){
      return this.domSanitizer.bypassSecurityTrustUrl(url);
  }

  chooseItem(itemList, event){
     if (event.checked){
        this.listsServices.escolherItemNaLista(this.evento.eventId, this.item.listId, itemList.itemId, this.userId, 1).then(()=>{
            this.historyService.addHistory({uid:this.userId, displayName:name}, this.evento, "MSG_SELECT_ITEM", [itemList.itemName]);
        }).catch(err => {
          console.log(err);
        });        
     }else{
        this.listsServices.removerItemEscolhido(this.evento.eventId, this.item.listId, itemList.itemId, this.userId).then(()=>{
            this.historyService.addHistory(this.userService.getUser(), this.evento, "MSG_REMOVE_ITEM", [itemList.itemName]);
        }).catch(err => {
          console.log(err);
        });
     }
  }

  showAlert(listItem, event?) {
    if (!this.isUserAdmin && this.item.config.hideChoicePartic) return;
    let data = {"listItem":listItem, "listId": this.item.listId, isUserAdmin : this.isUserAdmin, evento:this.evento, participantes:this.participantes};
    let myModal = this.popoverController.create("SelectListItemPage", data, { cssClass: 'custom-popover'});
    myModal.onDidDismiss(data => {});
    myModal.present();   
    if (event){
      event.preventDefault();
      event.stopPropagation();
    }
  }

  getQuantity(items):number{
    let x = 0;
    for (const uid in items){
      x += items[uid].quantity;
    }
    return x;
  }

  

  increment(listItem : ListItemModel, e){
    if (!listItem.members) listItem["members"] = {};
    if (listItem.members[this.userId])
      listItem.members[this.userId].quantity += 1;
    else
      listItem.members[this.userId] = {quantity : 1};

    clearTimeout(this.interval);
    this.interval = setTimeout(()=>{
        this.listsServices.escolherItemNaLista(this.eventoId, this.item.listId, listItem.itemId, this.userId, listItem.members[this.userId].quantity);
        this.interval = null;
    }, 2000);

    e.preventDefault();
    e.stopPropagation();   
  }

  decrement(listItem : ListItemModel, e){
    if (!listItem.members) listItem["members"] = {};
    if (listItem.members[this.userId].quantity == 1){
      this.listsServices.removerItemEscolhido(this.eventoId, this.item.listId, listItem.itemId, this.userId);
      delete listItem.members[this.userId];
      return;
    } 
    listItem.members[this.userId].quantity -= 1;
    clearTimeout(this.interval);
    this.interval = setTimeout(()=>{
        this.listsServices.escolherItemNaLista(this.eventoId, this.item.listId, listItem.itemId, this.userId, listItem.members[this.userId].quantity);
        this.interval = null;
    }, 2000);

    e.preventDefault();
    e.stopPropagation();       
  }

}
