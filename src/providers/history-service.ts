import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { HISTORY_MSG } from '../consts/history-messages';
import { Observable } from 'rxjs/Observable';
import { Utilities } from '../utils/utilities';
import * as firebase from 'firebase/app';

@Injectable()
export class HistoryService {
    
    constructor(private afDb : AngularFireDatabase) {   

    }

    getListHistoryInfinite(uid:string, endAt : string){
        return this.afDb.list(`user-history/${uid}`, ref => ref.orderByKey().endAt(endAt).limitToLast(10)).valueChanges().switchMap(values=>{
            let hstObservables = [];
            values.map((res : any) => {
                let obs = this.afDb.object("history/" + res.id).valueChanges().map((hst : any) => {
                    let str : string = HISTORY_MSG[hst.codMsg].msg; 
                    if (str){
                        str = str.replace("{autor}", hst.author.id == uid ? "Você" : hst.author.name);
                        str = Utilities.format(str, hst.variables);
                    }
                    hst.createdAt = new Date(hst.createdAt);
                    Object.assign(hst, {id: res.id, msg : str, icon: HISTORY_MSG[hst.codMsg].icon});
                    return hst;
                }).first();
                hstObservables.push(obs);
            });
            return Observable.forkJoin(hstObservables);
        });        
    }

    getListHistory(uid:string){
        return this.afDb.list(`user-history/${uid}`, ref => ref.limitToLast(10)).valueChanges().switchMap(values=>{
            let hstObservables = [];
            values.map((res : any) => {
                 let obs = this.afDb.object("history/" + res.id).valueChanges().map((hst : any) => {
                    let str : string = HISTORY_MSG[hst.codMsg].msg; 
                    if (str){
                        str = str.replace("{autor}", hst.author.id == uid ? "Você" : hst.author.name);
                        str = Utilities.format(str, hst.variables);
                    }
                    hst.createdAt = new Date(hst.createdAt);
                    Object.assign(hst, {id: res.id, msg : str, icon:HISTORY_MSG[hst.codMsg].icon});
                    return hst;
              }).first();
              hstObservables.push(obs);
            });
            return Observable.forkJoin(hstObservables);
        });
    }

    addHistory(user : {uid:string, displayName:string}, evento : Evento, codMsg:string, variables:Array<string>){
        let obj = {
                codMsg : codMsg,
                variables : variables,
                eventName : evento.eventName, 
                eventID : evento.eventId, 
                author : {id:user.uid, name:user.displayName},
                createdAt : firebase.database.ServerValue.TIMESTAMP
        };
        // Get a key for a new history
        let newHistoryKey = this.afDb.database.ref().child('history').push().key;
        var updates = {};
        updates['/history/' + newHistoryKey] = obj;
        for (const uid in evento.invitations){
            updates['/user-history/' + uid + '/' + newHistoryKey] = {id : newHistoryKey};
        }
        this.afDb.database.ref().update(updates);
    }
}

