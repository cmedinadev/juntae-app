import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { AngularFirestore } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { EventService } from './event-service';
import * as firebase from 'firebase/app';

@Injectable()
export class SplitService {
  
  private eventsCol : any;
  private eventDoc : any;
  public participantsSubject : BehaviorSubject<any>;
  public gruposSubject : BehaviorSubject<any>;
  public despesasSubject : BehaviorSubject<any>;
  public evento : Evento;
  
  constructor(private afs: AngularFirestore, private eventsService : EventService) {
    this.eventsCol = this.afs.collection("events");
  }

  ngOnDestroy(){
  }

  initialize(evento : Evento){
    this.evento = evento;
    this.eventDoc = this.eventsCol.doc(this.evento.eventId);
    this.despesasSubject = new BehaviorSubject(null);
    this.gruposSubject = new BehaviorSubject(null);
    this.participantsSubject = new BehaviorSubject(null);
    
    let arr = [this.getExpensesByEvent(), this.getExpenseGroupsByEvent(), this.eventsService.getParticipants(evento)];

    Observable.combineLatest(arr).subscribe(res=>{
      this.despesasSubject.next(res[0]);
      this.gruposSubject.next(res[1]);
      this.participantsSubject.next(res[2]);
    });
    
  }

  getExpensesByEvent() : Observable<any>{
    return this.eventDoc.collection("expenses", ref => ref.orderBy("expenseDate")).valueChanges();
  }

  getIncomesByEvent() : Observable<any>{
    return this.eventDoc.collection("incomes").snapshotChanges().map((incomes:any)=>{
      return incomes.map(a => {
          const data = a.payload.doc.data();
          data.id = a.payload.doc.id;
          return data;
      });
    });      
  }  

  addIncome(income : any) : string{
    const pushkey = this.afs.createId();
    this.eventDoc.collection("incomes").doc(pushkey).set(income);
    return pushkey;
  }    

  savePayment(payment: any): string {
    console.log(payment);
    if (payment.id){
      this.eventDoc.collection("incomes").doc(payment.id).update(payment);  
      return payment.id;
    }else{
      const pushkey = this.afs.createId();
      this.eventDoc.collection("incomes").doc(pushkey).set(payment);
      return pushkey;
    }
  }
  

  removeIncome(income : any) : Observable<any>{
    return this.eventDoc.collection("incomes").doc(income.id).delete();
  }      

  getExpenseGroupsByEvent() : Observable<any>{
    return this.eventDoc.collection("expenseGroups", ref => ref.orderBy("groupName")).valueChanges();
  }  

  addExpense(expense:ExpenseModel) : Promise<any>{
    const pushkey = this.afs.createId();
    expense.id = pushkey;
    return this.eventDoc.collection("expenses").doc(expense.id).set(expense);
  }

  updateExpense(expense:ExpenseModel) : Promise<any>{
    console.log("update", this.eventDoc, this.evento);

    return this.eventDoc.collection("expenses").doc(expense.id).update(expense);
  }

  deleteExpense(expense:ExpenseModel) : Promise<any>{
    return this.eventDoc.collection("expenses").doc(expense.id).delete();
  }

  addGroup(item : ExpenseGroupModel){
    const pushkey = this.afs.createId();
    item.groupId = pushkey;
    return this.eventDoc.collection("expenseGroups").doc(item.groupId).set(item);
  }

  updateGroup(item : ExpenseGroupModel){
    return this.eventDoc.collection("expenseGroups").doc(item.groupId).update(item);
  }

  removeExpenseGroup(groupId:string){
    return this.eventDoc.collection("expenseGroups").doc(groupId).delete();
  }

  removeParticipant(groupId : string, participantId : string){
    const docRef = this.eventDoc.collection("expenseGroups").doc(groupId);
    return docRef.update({['participants.' + participantId]: firebase.firestore.FieldValue.delete() });
  }

}
