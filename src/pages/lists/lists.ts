import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ModalController, AlertController } from 'ionic-angular';
import { UserService } from '../../providers/user-service';
import { ListService } from '../../providers/list-service';
import { HistoryService } from "../../providers/history-service";
import { Firebase } from '@ionic-native/firebase';

@IonicPage()
@Component({
  selector: 'page-lists',
  templateUrl: 'lists.html'
})
export class ListsPage {
  
  private eventId;
  private evento;
  public icon : string;
  public isEditing : boolean = false;

  view: string = "view-list";
  public dataList : any = null;
  public collection : any = null;
  public dataSelectedList;
  public noResult : boolean = false;
  public isUserAdmin : boolean = false;
  public subscriptionLists;
  public subscriptionItems;
  public isLoaded : boolean = false;
  public uid : string;
  private lists : any = {};

  constructor(public navCtrl: NavController, private modalCtrl : ModalController,
              public params: NavParams, private alertCtrl : AlertController, 
              private historyService : HistoryService,
              public loadingCtrl: LoadingController, 
              private listService : ListService, 
              private fireNative: Firebase,
              private userService : UserService ) {
    this.evento = params.get('data');
    this.eventId = this.evento.eventId;
    this.uid = this.userService.getUser().uid;
    this.isUserAdmin = this.evento.organizers[this.uid];
  }

  private loadSelectedList(){
      let arrData = [];
      for(const listId in this.lists) {
        this.listService.getSelectedItems(this.eventId, listId, this.uid).subscribe(items=>{
          if (items && items.length > 0)
            arrData.push({listName:this.lists[listId], items : items, listId:listId });
        });
      }
      this.dataSelectedList = arrData;
  }

  ionViewDidLoad() {
    this.fireNative.setScreenName('Listas').then();
    let l = {};
    this.subscriptionLists = this.listService.getListsByEvent(this.eventId).map(items =>{
      this.noResult = items.length == 0;
      items.forEach(element => {
        l[element.listId] = element.listName;
      });
      this.lists = l;
      return items;
    });
  }

  ionViewDidLeave(){
    //this.hideLoading();
  }

  createList(){
    
    let myModal = this.modalCtrl.create("CreateListPage", {evento : this.evento}); 
    myModal.onDidDismiss(data => {
      if (data){
        this.historyService.addHistory(this.userService.getUser(), this.evento, "MSG_CREATE_LIST", [data.listName]);
      }
    });
    myModal.present();    
  }

  editList(e, item){
    let myModal = this.modalCtrl.create("CreateListPage", {evento : this.evento, item : item}); 
    myModal.onDidDismiss(data => { });
    myModal.present();    
    e.preventDefault();
    e.stopPropagation();    
  }

  navigationToItem(item){
      this.navCtrl.push("ViewListItemPage", {item:item, evento:this.evento, isUserAdmin:this.isUserAdmin, subscriptionLists : this.subscriptionLists});
  }

  changeView(){
    if (this.view == 'view-select-list-item'){
      this.loadSelectedList();
    }    
  }

  removeList(e, item){
    let name = item.listName;
    this.presentConfirm("Confirma a exclusão da lista '" + name + "'?<br /> Todos os itens também serão excluídos.", ()=>{
      this.listService.removeList(this.eventId, item.listId).then(()=>{
          this.historyService.addHistory(this.userService.getUser(), this.evento, "MSG_DELETE_LIST", [name]);
      });
    });
    e.preventDefault();
    e.stopPropagation();
  }

  removeSelItem(listId, item){
    this.presentConfirm("Deseja remover o item '" + item.itemName + "' de sua lista?", ()=>{
      const name = item.itemName;
      this.listService.removerItemEscolhido(this.eventId, listId, item.itemId, this.userService.getUser().uid).then(()=>{
        this.loadSelectedList();
      });
      this.historyService.addHistory(this.userService.getUser(), this.evento, "MSG_REMOVE_ITEM", [name]);
      //let indexList = this.findIndexInArray(this.dataList, "listId", listId);
      //let indexItem = this.findIndexInArray(this.dataList[indexList].lists, "itemId", item.itemId);
      //this.dataList[indexList].lists.splice(indexItem, 1);
    });
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


}
