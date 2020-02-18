import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { SplitService } from '../../../providers/split-service';
import { DecimalPipe } from '@angular/common';

@IonicPage()
@Component({
  selector: 'page-add-payment',
  templateUrl: 'add-payment.html',
})
export class AddPaymentPage {

  payment : {
    id?:string,
    fromUser : string,
    toUser : string,
    value : any,
    paymentDate : Date,
  };
  selectOptionsPagou: { title: string, subTitle: string };
  selectOptionsRecebeu: { title: string, subTitle: string };
  participantes: any;
  title : string;
  paymentOrig:any;

  constructor(public navCtrl: NavController, public navParams: NavParams, private viewCtrl : ViewController, private splitService : SplitService ) {
    let item = navParams.get("item");
    this.paymentOrig = item == null ? {fromUser : null, toUser : null, value : null, paymentDate : new Date().toISOString() } : item;
    this.payment = (item == null ? {paymentDate : new Date().toISOString()} : JSON.parse(JSON.stringify(item)));
    if (this.payment.value){
      this.payment.value = new DecimalPipe('pt').transform(this.payment.value, '1.2-2', 'pt');
    }
    this.participantes = navParams.get("participantes");
    
    if (this.payment.fromUser && !this.participantes[this.payment.fromUser]){
      this.payment.fromUser = null;
    }
    if (this.payment.toUser && !this.participantes[this.payment.toUser]){
      this.payment.toUser = null;
    }
    this.title = item != null ? 'Editar pagamento' : 'Incluir pagamento';
    this.selectOptionsPagou = {
      title: 'Quem Pagou?',
      subTitle: 'Selecione o participante que realizou o pagamento'
    };
    this.selectOptionsRecebeu = {
      title: 'Quem Recebeu?',
      subTitle: 'Selecione o participante que recebeu o pagamento'
    };    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddPaymentPage');
  }

  gravar(formData){

    if (!formData.form.valid){
      for (let control in formData.form.controls){
        formData.form.controls[control].markAsDirty();
      }
      return false;
    }

    this.paymentOrig.fromUser = this.payment.fromUser;
    this.paymentOrig.toUser = this.payment.toUser;
    this.paymentOrig.value = this.parseNumber(this.payment.value);
    this.paymentOrig.paymentDate = this.payment.paymentDate;

    if (this.payment.id) this.paymentOrig.id = this.payment.id;
    this.splitService.savePayment(this.paymentOrig);
    this.viewCtrl.dismiss();
  }

  parseNumber(n:string){
    return (typeof n === "string") ? parseFloat(n.replace(/\./g, '').replace(',', '.')) : (n ? n : 0);
  }
   
  cancelar(){
    this.viewCtrl.dismiss();
  }
}
