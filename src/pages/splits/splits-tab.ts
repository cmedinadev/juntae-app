import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SplitService } from "../../providers/split-service";
import { Subscription } from 'rxjs';
import { Firebase } from '@ionic-native/firebase';
//import { GoogleAnalytics } from '../../../node_modules/@ionic-native/google-analytics';

@IonicPage()
@Component({
  selector: 'page-splits-tab',
  templateUrl: 'splits-tab.html',
})
export class SplitsTabPage {
  pagamentos: any;
  totalPagamentos: any;
  eventName : string;
  evento : any;
  countGrupos : number;
  totalDespesas : number = 0;
  gruposSubscribe : Subscription;
  pagamentosSubscribe : Subscription;
  despesasSubscribe : Subscription;

  constructor(public navCtrl: NavController, navParams: NavParams, 
    private fireNative: Firebase, 
    private splitService : SplitService)  {
    this.evento = navParams.get('data');
    this.eventName = this.evento.eventName;
    splitService.initialize(this.evento);
  }

  ionViewDidLoad() {

    this.fireNative.setScreenName('Rateio de despesas').then();

    this.gruposSubscribe = this.splitService.gruposSubject.subscribe(grupos=>{
      this.countGrupos = (grupos == null ? 0 : grupos.length);
    });

    this.despesasSubscribe = this.splitService.despesasSubject.subscribe(despesas=>{
      this.totalDespesas = this.getTotal(despesas, 'amount');
    });

    this.pagamentosSubscribe = this.splitService.getIncomesByEvent().subscribe(res => {
      this.pagamentos = res;
      this.totalPagamentos = res ? res.length : 0;
    });
  }

  ionViewDidLeave(){
   /* console.log("unsubscribe paradas");
   this.gruposSubscribe.unsubscribe();
   this.despesasSubscribe.unsubscribe();
   this.pagamentosSubscribe.unsubscribe();*/
  }

  openPageEqualize(){
    this.navCtrl.push("SplitsPage", {data:this.evento, equalize : true});    
  }

  openPaymentsPage(){
    let list = this.splitService.participantsSubject.getValue();
    this.navCtrl.push("PaymentsPage", {payments : this.pagamentos, participantes:list});  
  }

  openPage(pageName){
    this.navCtrl.push(pageName, {data:this.evento});    
  }

  private getTotal(items:any, field : string) : number{
    let tot = 0;
    items && items.forEach(element => {
      tot += element[field];
    });
    return tot;
  }

}
