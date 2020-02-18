import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { ListModel } from '../../../model/list.model';
import { ListService } from '../../../providers/list-service';
import { HistoryService } from "../../../providers/history-service";
import { UserService } from "../../../providers/user-service";
import { Firebase } from '@ionic-native/firebase';

const enum ActionEnum {
    NONE,
    CREATE,
    UPDATE,
    DELETE
}

@IonicPage()
@Component({
  selector: 'page-create-list',
  templateUrl: 'create-list.html'
})
export class CreateListPage {

  title;
  item : ListModel = null;
  step : number = 1;
  eventID : string; 
  evento : any;
  private action : ActionEnum = ActionEnum.NONE;
  public btnLabel : string = "Criar";

  constructor(public navCtrl: NavController, public params: NavParams, 
              private historyService : HistoryService, private userService : UserService,
              private viewCtrl: ViewController, private fireNative: Firebase,
              private listService : ListService) {
    this.item = params.get('item');
    this.evento = params.get('evento');
    this.eventID = this.evento.eventId;

    if (this.item){
      this.title = "Editar Lista"
      this.action = ActionEnum.UPDATE;
      this.btnLabel = "Gravar";
    }else{
      this.title = "Criar Lista"
      this.action = ActionEnum.CREATE;
      this.btnLabel = "Criar";
      this.item = {listName:"", listId:"", config:{}};
    }  
  }

  ionViewDidLoad() {
    this.fireNative.setScreenName(this.title).then();
  }

  dismiss(result?){
     this.viewCtrl.dismiss(result);
  }

  navigateTo(step){
    this.step = step;
  }

  gravar(){
    if (this.action == ActionEnum.CREATE){
      this.listService.createList(this.eventID, this.item);
      this.dismiss({result:'INSERT', listName:this.item.listName});
      this.historyService.addHistory(this.userService.getUser(), this.evento, "MSG_CREATE_LIST", [this.item.listName]);
    }
    else if (this.action == ActionEnum.UPDATE){
      this.listService.updateList(this.eventID, this.item);
      this.dismiss({result:'UPDATE'});
    }else{
      console.log("Action unknow!");
    }
  }
}
