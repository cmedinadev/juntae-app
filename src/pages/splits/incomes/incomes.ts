import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController, Content } from 'ionic-angular';
import { Utilities } from '../../../utils/utilities';
import { SplitService } from '../../../providers/split-service';

@IonicPage()
@Component({
  selector: 'page-incomes',
  templateUrl: 'incomes.html',
})
export class IncomesPage {

  splitItem : any;
  participantes : any;
  income : any = {};
  isAdding : boolean  = false;
  @ViewChild('content') content: Content;

  constructor(public navCtrl: NavController, public navParams: NavParams, 
              private viewController : ViewController, 
              private splitService : SplitService, 
              private alertCtrl : AlertController) {
    this.splitItem = navParams.get("item");
    this.participantes = navParams.get("participantes");
    this.sortIncomes();
  }

  dismiss(){
    this.viewController.dismiss();
  }

  ionViewDidLoad() {
    //this.fireNative.setScreenName('Incomes');
  }

  sortIncomes(){
    if (!this.splitItem.incomes || this.splitItem.incomes.length == 0) return;
    this.splitItem.incomes.sort((a,b)=>{
      return a.userWhoPaid.displayName.localeCompare(b.userWhoPaid.displayName);
    });
  }

  addIncome(){
    let inputs = [];
    for (const uid in this.participantes){
      let item = this.participantes[uid];
      let v = item.despesa - item.rateio;
      item.quitado = (v < 0 && ((v * -1) <= parseFloat(item.pagamento.toFixed(2))));      
      if (item.quitado || uid == this.splitItem.user.uid || item.situacao == 'receber') continue;
      const a = item.rateio, b = item.pagamento + item.despesa;
      let vl = (b-a) >= 0 ? 0 : a-b; 
      inputs.push( {
        type:'radio',
        label: item.user.displayName + " - R$ " + Utilities.getFormattedDecimal(vl),
        value: uid, 
        valor: vl
     });
    }

    inputs.sort((a, b) => {
      const p1 = a.valor;
      const p2 = b.valor;
      if (p1 < p2) return 1;
      if (p1 > p2) return -1;
      return 0;
    });

    if (inputs.length == 0) return;
    let prompt = this.alertCtrl.create({
    title: 'Quem pagou?',
    message: 'Selecione o participante',
    inputs : inputs,
    buttons : [
    {
        text: "Cancelar",
        handler: data => {
          this.isAdding = false;
        console.log("cancel clicked");
        }
    },
    {
        text: "OK",
        handler: data => {
          this.isAdding = true;
          this.income = new Object();
          this.income.fromUser = data;
          this.income.userWhoPaid = this.participantes[data].user;
          this.income.value = null;
          const a = this.participantes[data].rateio, b = this.participantes[data].pagamento + this.participantes[data].despesa;
          let vl = (b-a) >= 0 ? 0 : a-b; 
          if (vl > (this.splitItem.valor - this.splitItem.receita)){
            vl = (this.splitItem.valor - this.splitItem.receita);
          }
          this.income.value = Utilities.getFormattedDecimal(vl);
          setTimeout(()=>{
            this.content.scrollToBottom(200);
          }, 300);
        }
    }]});
    prompt.present();
  }

  strToNumber(value : string){
    if (!value) return 0;
    return Number.parseInt(value.toString().replace(/[^0-9.]/g, '')) / 100;
  }

  createIncome(){
    if (!this.income.value || !(this.strToNumber(this.income.value) > 0)) return;
    this.income.toUser = this.splitItem.user.uid;
    this.income.value = this.strToNumber(this.income.value);
    const obj = {fromUser : this.income.fromUser, toUser : this.income.toUser, value : this.income.value};
    this.income.id = this.splitService.addIncome(obj);
    this.splitItem.receita += +(this.income.value.toFixed(2));
    this.participantes[this.income.fromUser].pagamento += +(this.income.value.toFixed(2));
    this.splitItem.incomes.push(this.income);
    this.sortIncomes();
    this.isAdding = false;
  }

  removeIncome(item, index){
    this.participantes[item.fromUser].quitado = false;
    this.participantes[item.fromUser].pagamento -=  item.value;
    this.splitItem.receita = this.splitItem.receita - item.value;
    this.splitService.removeIncome(item);
    this.splitItem.incomes.splice(index, 1);
  }
  
  cancelAddIncome(){
    this.income = null;
    this.isAdding = false;
  }


}
