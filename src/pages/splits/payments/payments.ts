import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { SplitService } from '../../../providers/split-service';
import { Firebase } from '@ionic-native/firebase';

@IonicPage()
@Component({
  selector: 'page-payments',
  templateUrl: 'payments.html',
})
export class PaymentsPage {

  splitItem: any;
  participantes: any;
  loaded: boolean = true;
  dataList: Array<any>;
  total: number = 0;
  mapParticipants: {};

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private viewController: ViewController,
    private fireNative: Firebase,
    private splitService: SplitService) {
    this.participantes = navParams.get("participantes");
    let mapParticipants = {};
    this.participantes && this.participantes.forEach(item=>{
      mapParticipants[item.uid] = item;
    });
    this.mapParticipants = mapParticipants;
  }

  dismiss() {
    this.viewController.dismiss();
  }

  ionViewDidLoad() {
      this.fireNative.setScreenName('Pagamentos').then();
      this.splitService.getIncomesByEvent().subscribe(res => {
        this.dataList = res;
        this.total = this.getTotalPayments(this.dataList);
      });      
  }

  getAmountTotal(items): number {
    let tot = 0;
    items && items.forEach(element => {
      tot += element.amount;
    });
    return tot;
  }

  canAddPayment() {
    return true; // || (this.evento.config && this.evento.config.whoAddExpense == 'everyone');
  }
  
  deletePayment(item, i) {
    this.splitService.removeIncome(item);
    this.dataList.splice(i, 1);
  }
  addPayment() {
    this.navCtrl.push("AddPaymentPage", {participantes : this.mapParticipants});
  }

  editPayment(payment: any) {
    this.navCtrl.push("AddPaymentPage", {item : payment, participantes : this.mapParticipants});
  }

  getTotalPayments(items): number {
    let tot = 0;
    items && items.forEach(element => {
      tot += element.value;
    });
    return tot;
  }

}

