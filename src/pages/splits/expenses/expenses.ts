import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App, AlertController } from 'ionic-angular';
import { Utilities } from '../../../utils/utilities';
import { SplitService } from '../../../providers/split-service';
import { UserService } from '../../../providers/user-service';
import { Observable } from 'rxjs/Observable';
import { EventService } from '../../../providers/event-service';
import { HistoryService } from "../../../providers/history-service";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Firebase } from '@ionic-native/firebase';
import 'rxjs/add/observable/forkJoin';

@IonicPage()
@Component({
  selector: 'page-expenses',
  templateUrl: 'expenses.html',
})
export class ExpensesPage {

  participantsSubject: BehaviorSubject<any>;
  participantList: any;

  dataList : Array<ExpenseModel> = [];
  isUserAdmin : boolean;
  subscriptionExpenses : any;
  subscriptionGroups : any;
  groupList : Array<ExpenseGroupModel> = [];
  mapGroupList : any = {};
  public intLoad = 0;
  loaded : boolean = false;
  noResult : boolean = false;
  gruposSubject : any;
  despesasSubject : any;
  public total : number = 0;
  despesasObservable : Observable<Array<ExpenseModel>>;
  eventName : string;

  constructor(private app : App, public navCtrl: NavController, public navParams: NavParams,  
              private splitService : SplitService, 
              private fireNative : Firebase, 
              private alertCtrl : AlertController, 
              private historyService : HistoryService,
              private userService : UserService) {

    let uid = this.userService.getUser().uid;
    this.eventName = this.splitService.evento.eventName;
    this.isUserAdmin = this.splitService.evento.organizers[uid];
    this.gruposSubject = this.splitService.gruposSubject;
    this.despesasSubject = this.splitService.despesasSubject;
    this.participantsSubject = this.splitService.participantsSubject;
  }

  ionViewDidLeave(){

  } 

  ionViewDidLoad() {

    this.fireNative.setScreenName('Despesas').then();

    let a = false;
    let b = false;
    this.despesasSubject.subscribe(res=>{
      this.total = this.getAmountTotal(res);
      this.dataList = res;
      this.loaded = (a = true) == b;
    });

    this.gruposSubject.subscribe(res=>{
      this.groupList = res;
      if (res){
        this.groupList.forEach(element => {
            this.mapGroupList[element.groupId] = element.groupName;
        });     
      }else{
        this.mapGroupList = {};
      }
      this.loaded = (b = true) == a;
    });
    
    this.participantsSubject.subscribe((list) => {
      list && list.forEach(element => {
        if (!element.displayName)
          element.displayName = element._displayName;
      });
      this.participantList = list;
    });

  }  


  getAmountTotal(items) : number{
    let tot = 0;
    items && items.forEach(element => {
      tot += element.amount;
    });
    return tot;
  }

  canAddExpense(){
    return this.isUserAdmin; // || (this.evento.config && this.evento.config.whoAddExpense == 'everyone');
  }

  addExpense(){
    if (!this.groupList || this.groupList.length == 0){
      let alert = this.alertCtrl.create({
        title: 'Incluir Despesa',
        subTitle: 'É necessário cadastrar um grupo para rateio antes de incluir uma despesa.',
        buttons: ['Ok']
      });
      alert.present();
      return;
    }
    let nav = this.app.getRootNav();
    nav.push("CreateExpensePage", {groupList : this.groupList, participantList : this.participantList});
  }

  editExpense(expense : any){
    let nav = this.app.getRootNav();
    let readOnly = !this.canAddExpense();
    nav.push("CreateExpensePage", {expense : expense, groupList : this.groupList, participantList : this.participantList, readOnly : readOnly});
  }

  getFormattedPrice(val){
    return Utilities.getFormattedPrice(val);
  }

  deleteExpense(expense : any, index : number){
    let options = { message : "Deseja excluir a despesa '" + expense.description + "'?",
                    title : "Excluir despesa?", 
                    okHandler : ()=>{ 
                        this.splitService.deleteExpense(expense);
                        this.historyService.addHistory(this.userService.getUser(), this.splitService.evento, "MSG_DELETE_EXPENSE", null);
                    }
                  };
    Utilities.showConfirm(this.alertCtrl, options);
  }

}
