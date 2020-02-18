import { PromptService } from './../../../providers/prompt-service';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, App, ItemSliding } from 'ionic-angular';
import { UserService } from '../../../providers/user-service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { SplitService } from '../../../providers/split-service';
import { HistoryService } from "../../../providers/history-service";
import { Utilities } from "../../../utils/utilities";
import { Firebase } from '@ionic-native/firebase';

@IonicPage()
@Component({
  selector: 'page-groups',
  templateUrl: 'groups.html',
})
export class GroupsPage {

  dataList : Array<ExpenseGroupModel> = [];
  isUserAdmin : boolean;
  loaded : boolean = true;
  eventName : string;
  public gruposSubject : BehaviorSubject<any>;
  public participantsSubject : BehaviorSubject<any>;

  constructor(private app : App, public navCtrl: NavController, public navParams: NavParams, 
              private  groupsService : SplitService, 
              private userService : UserService, private promptService : PromptService, 
              private historyService : HistoryService,
              private fireNative: Firebase,
              private alertCtrl : AlertController) {
    this.eventName = this.groupsService.evento.eventName;
    this.isUserAdmin = this.groupsService.evento.organizers[this.userService.getUser().uid];
    this.gruposSubject = this.groupsService.gruposSubject;
    this.gruposSubject.subscribe(res=>{
      this.dataList = res;
    });
    
  }

  ionViewDidLeave(){
    this.fireNative.setScreenName('Grupos para rateio').then();
  }

  ionViewDidEnter() {
  }

  countParticipants(participants){
    if (participants == null)
      return 0;
    else
      return Object.keys(participants).length;
  }

  addGroup(){
    this.promptService.showPrompt('Criar grupo', 'Informe o nome do grupo para rateio',  [{
      name: 'name',
      placeholder: 'Nome do grupo', 
      required : true
    }], (res)=>{
      this.saveGroup({ groupName : res.name, amountPerPerson : 0, amountTotal : 0});
    });
  }

  editGroup(item:ExpenseGroupModel, slidingItem: ItemSliding){
    slidingItem.close();
    this.promptService.showPrompt('Editar grupo', 'Informe o nome do grupo para rateio',  [{
      name: 'name',
      placeholder: 'Nome do grupo', 
      value : item.groupName, 
      required : true
    }], (res)=>{
      item.groupName = res.name;
      this.saveGroup(item);
    });
  }

  removeGroup(event, data, slidingItem: ItemSliding){
    slidingItem.close();
    let options = { message : "Deseja excluir o grupo '" + data.groupName + "'?",
                    title : "Excluir grupo?", 
                    okHandler : ()=>{ 
                        this.groupsService.removeExpenseGroup(data.groupId);
                        this.historyService.addHistory(this.userService.getUser(), this.groupsService.evento, "MSG_DELETE_EXPENSE", null);
                        let index = this.dataList.indexOf(data, 0);
                        if (index > -1) {
                          this.dataList.splice(index, 1);
                        }
                        this.gruposSubject.next(this.dataList);                        
                    }
                  };
    Utilities.showConfirm(this.alertCtrl, options);
    event.preventDefault();
    event.stopPropagation();
  }

  saveGroup(item : any){
    if (item.groupId){
      this.groupsService.updateGroup(item);
    }else{
      this.groupsService.addGroup(item);
      this.historyService.addHistory(this.userService.getUser(), this.groupsService.evento, "MSG_CREATE_GROUP", [item.groupName]);
    }
    this.gruposSubject.next(this.dataList);
  }

  navigationToSelectItem(item){
    let nav = this.app.getRootNav();
    nav.push("CreateGroupPage", {isAdmin : this.isUserAdmin, item : item});
  }

  

}
