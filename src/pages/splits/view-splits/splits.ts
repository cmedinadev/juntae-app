import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController, ModalController } from 'ionic-angular';
import { SplitService } from '../../../providers/split-service';
import { UserService } from "../../../providers/user-service";
import { Firebase } from '@ionic-native/firebase';

@IonicPage()
@Component({
  selector: 'page-splits',
  templateUrl: 'splits.html'
})
export class SplitsPage {
  userId: string;
  eventID : string;
  evento : any;
  isUserAdmin : boolean;
  groupList : any;
  mapGroupList : any = {};
  expenseList : any;
  intLoad = 0;
  listRateioParticips : any = [];
  listDepesasParticips : any = [];
  loaded : boolean = false;
  mapParticipants = {};
  subscriptionExpenses : any;
  subscriptionGroups : any;
  gruposSubject : any;
  despesasSubject : any;
  incomes : any;
  mapParticipList : {};
  equalize : boolean = false;
  pagamentos : any;

  constructor(public navCtrl: NavController, public navParams: NavParams, 
              private popoverController : PopoverController,
              private modalController : ModalController,
              private fireNative: Firebase,
              private splitService : SplitService, userService:UserService) {
    this.evento = this.splitService.evento;
    this.eventID = this.evento.eventId;
    this.equalize = navParams.get("equalize");
    this.isUserAdmin = this.evento.organizers[userService.getUser().uid];
    this.userId = userService.getUser().uid;
    this.gruposSubject = this.splitService.gruposSubject;
    this.despesasSubject = this.splitService.despesasSubject;
  }

  ionViewDidLeave(){

  }

  ionViewDidEnter(){
    if (this.loaded){
      this.loadAndSplit();
    }
  }  

  ionViewDidLoad() {
    this.fireNative.setScreenName('Ver rateio').then();
    const sub = this.splitService.getIncomesByEvent().subscribe(res=>{
      this.incomes = res;
      if (this.splitService.despesasSubject.getValue()){
        this.loaded = true;
        this.loadAndSplit();
      }else{
        const obs = this.splitService.participantsSubject.subscribe(res=>{
              if (res != null){
                this.loaded = true;
                this.loadAndSplit();
                obs.unsubscribe();
              }
        });
      }
      sub.unsubscribe();
    });
  } 

  private loadAndSplit(){
    this.groupList = this.gruposSubject.getValue();
    this.expenseList = this.despesasSubject.getValue();
    let list = this.splitService.participantsSubject.getValue();
    list && list.forEach(item=>{
      this.mapParticipants[item.uid] = item;
    });
    this.processSplit(this.expenseList, this.groupList);     
  }

  processSplit(expenses : Array<ExpenseModel>, groups : Array<ExpenseGroupModel>){
    let mapGroupList = {};
    let mapParticipList = {};
    if (!expenses && !groups) return;
    
    //console.log(' ******************** grupos **********************');
    groups.forEach(group => {
      group.amountPerPerson = 0;
      group.amountTotal = 0;
      mapGroupList[group.groupId] = group;
      for (let uid in group.participants){
        if (!this.mapParticipants[uid]){
          this.mapParticipants[uid] = {uid : uid, displayName : 'Participante excluído.'}
        }
        if (!mapParticipList[uid]){
          mapParticipList[uid] = {id : uid, user : this.mapParticipants[uid], despesa : 0, rateio : 0, pagamento : 0, receita : 0, quitado : false, incomes : []};    
        }
      }
    });

    //console.log(' ******************** receitas **********************');
    this.incomes.forEach(item=>{
      if (mapParticipList[item.fromUser]){
        mapParticipList[item.fromUser].pagamento += item.value; 
        mapParticipList[item.fromUser].incomes.push(item);
      }
      if (mapParticipList[item.toUser]){
        item['userWhoPaid'] = this.mapParticipants[item.fromUser];
        mapParticipList[item.toUser].receita += item.value;
        mapParticipList[item.toUser].incomes.push(item);
      }
    });

    //console.log(' ******************** despesas **********************');
    expenses.forEach(expense => {
      if (!mapGroupList[expense.groupWhoSplit] || !expense.usersWhoPaid){
        return;
      }

      mapGroupList[expense.groupWhoSplit].amountTotal += expense.amount;
      mapGroupList[expense.groupWhoSplit].amountPerPerson = mapGroupList[expense.groupWhoSplit].amountTotal / this.countParticipants(mapGroupList[expense.groupWhoSplit].participants);

      if (expense.usersWhoPaid){
        let value = expense.amount / expense.usersWhoPaid.length;
        for (let index in expense.usersWhoPaid){
          let id = expense.usersWhoPaid[index];
          if (!mapParticipList[id])
            mapParticipList[id] = {id : id, user : this.mapParticipants[id], despesa : 0, rateio : 0, pagamento : 0, receita : 0, quitado : false};    
          mapParticipList[id].despesa += value;
        }
      }
    });

    for (let key in mapGroupList){
      for (let x in mapGroupList[key].participants){
        mapParticipList[x].rateio += +(mapGroupList[key].amountPerPerson.toFixed(2));
      }
    }

    this.mapGroupList = mapGroupList;
    let listRateioParticips = [];
    let listDepesasParticips = [];
    for (const key in mapParticipList) {
      let item = mapParticipList[key];
      if (item.despesa > 0){
        listDepesasParticips.push(item);    
      }
      let v = item.despesa - item.rateio;

      item.receita = +(item.receita.toFixed(2));
      item.pagamento = +(item.pagamento.toFixed(2));
      
      Object.assign(item, {situacao : (v > 0 ? 'receber' : (v < 0 ? 'pagar' : '-'))});
      Object.assign(item, {valor : (v < 0 ? (v * -1) : +(v.toFixed(2)))});
      item.quitado = (v < 0 && ((v * -1) == item.pagamento));
      listRateioParticips.push(item);
    }

    listRateioParticips.sort((a, b) => {
      const o1 = a.situacao;
      const o2 = b.situacao;
      const p1 = a.valor;
      const p2 = b.valor;
      const u1 = a.user.displayName;
      const u2 = b.user.displayName;      
      if (o1 < o2) return 1;
      if (o1 > o2) return -1;
      if (p1 < p2) return 1;
      if (p1 > p2) return -1;
      if (u1 < u2) return -1;
      if (u1 > u2) return 1;
      return 0;
    });

    this.listRateioParticips = listRateioParticips;
    this.listDepesasParticips = listDepesasParticips;
    this.mapParticipList = mapParticipList;
    if (this.equalize)
      this.ratearPagamentos();
    this.loaded = true;
  }

  countParticipants(participants){
    if (participants)
      return Object.keys(participants).length;
    else
      return 0;      
  }

  getLabelColor(despesa, rateio){
    let v = despesa - rateio;
    return (v >= 0 ? '#01669a' : '#f53d3d');
    
  }

  openIncomes(item : any){
    let myModal = this.modalController.create("IncomesPage", {item : item, participantes : this.mapParticipList});
    myModal.onDidDismiss(data => {});
    myModal.present();   
  }

  showIncome(item : any){
    let myModal = this.popoverController.create("AddIncomePage", {item : item, participantes : this.mapParticipList}, { cssClass: 'add-popover'});
    myModal.onDidDismiss(data => {});
    myModal.present();   
  }

  openPayments(item : any){
    let myModal = this.modalController.create("PaymentsPage", {item : item, participantes : this.mapParticipList});
    myModal.onDidDismiss(data => {});
    myModal.present();   
  }

  ratearPagamentos(){
    let listReceber = [];
    let listPagar = [];
    for (let key in this.listRateioParticips){
      let item = this.listRateioParticips[key];
      if (item.situacao == 'receber'){
        if (item.valor != item.receita)
          listReceber.push(item);
      }else if (!item.quitado){
        listPagar.push(item);
      }
    }
    listPagar.forEach(item=>{
        this.realizarPagto(listReceber, item);
    });
    this.pagamentos = listPagar;
  }

  realizarPagto(listReceber, item){
    if (listReceber.length == 0) return;
    let delItemListRec : boolean = false;
    let vlPagar = item.valor - item.pagamento;
    let vlReceber = listReceber[0].valor - listReceber[0].receita;
    if (listReceber.length > 1 && ((vlPagar - vlReceber) > 0.01) && vlPagar > vlReceber){
      vlPagar = vlReceber;
      delItemListRec = true;
    }
    if (!item.equalizations) item["equalizations"] = [];
    if (vlPagar < 0){
      let income = {fromUser : listReceber[0].id, toUser: item.id, userWhoPaid : listReceber[0].user, value : (vlPagar * -1)};
      item.equalizations.push(income);
      listReceber[0].receita += vlPagar;
      item.pagamento += vlPagar;
    }
    else if (vlPagar > 0){
      let income = {fromUser : item.id, toUser: listReceber[0].id, userWhoPaid : item.user, value : vlPagar};
      item.equalizations.push(income);
      listReceber[0].receita += vlPagar;
      item.pagamento += vlPagar;
    }
    if(delItemListRec){
      listReceber.splice(0, 1);
      this.realizarPagto(listReceber, item);
    }
  }

}
