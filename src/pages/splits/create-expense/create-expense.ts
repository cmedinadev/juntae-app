import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController, NavParams, AlertController } from 'ionic-angular';
import { SplitService } from '../../../providers/split-service';
import { UserService } from '../../../providers/user-service';
import { HistoryService } from "../../../providers/history-service";
import { Utilities } from "../../../utils/utilities";
import { DatePipe } from '@angular/common';


@IonicPage()
@Component({
  selector: 'page-create-expense',
  templateUrl: 'create-expense.html', 
})
export class CreateExpensePage {
  participantList: any;

  public title : string = '';
  public expense : ExpenseModel = null;
  public expenseOriginal : ExpenseModel = null;
  public maxYear : number;
  public expenseDate : string;
  public expenseAmount : string;
  public groupList : any;
  public groupWhoSplit : any;
  public readOnly : boolean;
  public loading;
  public urlPaymVoucher;
  public expenseId;
  //private imageData;
  public filename;
  

  constructor(public navCtrl: NavController, public navParams: NavParams, 
              private alertCtrl : AlertController,
              private viewCtrl: ViewController, 
              private splitService : SplitService, 
              private userService : UserService,
              private historyService : HistoryService
              ) {
    this.participantList = navParams.get("participantList");
    this.groupList = splitService.gruposSubject.getValue();    
    this.readOnly = navParams.get("readOnly");    

    if (!navParams.get("expense")){
      this.title = "Incluir despesa";
      this.expense = {
        description : "", 
        groupWhoSplit:null, 
        urlPaymVoucher : "", 
        id : null, 
        amount : 0, 
        expenseDate : new Date().getTime(), 
        usersWhoPaid : [this.userService.getUser().uid]
      }

      this.expenseDate = new DatePipe('pt-BR').transform((this.expense.expenseDate), 'yyyy-MM-dd') ;
      this.expenseAmount = null;
    }
    else{
      this.title = "Editar despesa";
      this.expenseOriginal = navParams.get("expense"); 
      this.expense = (JSON.parse(JSON.stringify(this.expenseOriginal)));
      this.expenseDate = new DatePipe('pt-BR').transform((this.expense.expenseDate), 'yyyy-MM-dd');
      let value = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', useGrouping : true }).format(this.expense.amount);
      this.expenseAmount = value.substring(2);      
    }
    this.maxYear = new Date().getFullYear() + 1;

  }



  gravar(formData){
    
    if (!formData.form.valid){
      for (let control in formData.form.controls){
        formData.form.controls[control].markAsDirty();
      }
      return false;
    }
    if(!this.expense.groupWhoSplit){
      return;
    }
    let newVal = this.expenseAmount.replace(/\D/g, '');
    this.expense.amount = parseInt(newVal) / 100.0;

    if(this.expense.id == null){
        this.splitService.addExpense(this.expense);
        this.historyService.addHistory(this.userService.getUser(), this.splitService.evento, "MSG_ADD_EXPENSE", null);
    }
    else{
        this.splitService.updateExpense(this.expense);  
    }
    this.dismiss();
  }
 
  dismiss(){
    this.viewCtrl.dismiss();
  }


  deleteExpense(){
    let options = { message : "Deseja excluir a despesa '" + this.expense.description + "'?",
                    title : "Excluir despesa?", 
                    okHandler : ()=>{ 
                        this.splitService.deleteExpense(this.expense);
                        this.dismiss();
                        this.historyService.addHistory(this.userService.getUser(), this.splitService.evento, "MSG_DELETE_EXPENSE", null);
                    }
                  };
    Utilities.showConfirm(this.alertCtrl, options);
  }

}
