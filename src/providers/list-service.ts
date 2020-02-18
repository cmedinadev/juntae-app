import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import { AngularFirestore } from '@angular/fire/firestore';
import 'firebase/storage';
import * as firebase from 'firebase/app';
import { ListModel, ListItemModel } from '../model/list.model';
import { DbUtilities } from '../utils/db-utilities';

@Injectable()
export class ListService {
  
  public eventsCol;

  constructor(private afs: AngularFirestore) {
    this.eventsCol = this.afs.collection("events");
  }

  getListsByEvent(eventId:string) : Observable<any> {
    const listCol = this.eventsCol.doc(eventId).collection("lists", ref=> ref.orderBy("listName"));
    return listCol.snapshotChanges().map(items=>{
      if (items){
        let arr = [];
        items.forEach(itemRef => {
          const list = itemRef.payload.doc.data();
          list.listId = itemRef.payload.doc.id;
          arr.push(list);
        });
        return arr;
      };
      return items;
    });
  }  

  getSelectedItems(eventId : string, listId : string, uid : string)  : Observable<any> {
    const col = this.eventsCol.doc(eventId).collection("lists").doc(listId).collection("items", ref=> ref.where("members."+uid+".quantity", ">", 0));
    return col.valueChanges().map(data=>{
      data["listId"] = listId;
      return data;
    });
  }

  getItemsFromList(eventId:string, listId:string){
    const itemsCol = this.eventsCol.doc(eventId).collection("lists").doc(listId).collection("items", ref=> ref.orderBy("itemName"));
    return itemsCol.valueChanges();
  }

  removeList(eventId:string, listId:string){
    const itemsCol = firebase.firestore().collection("events").doc(eventId).collection("lists").doc(listId).collection("items");
    DbUtilities.deleteCollection(firebase.firestore(), itemsCol);
    const docRef = this.eventsCol.doc(eventId).collection("lists").doc(listId);
    return docRef.delete();
  }

  removeListItem(eventId:string, listId:string, itemId : string){
    const docRef = this.eventsCol.doc(eventId).collection("lists").doc(listId).collection("items").doc(itemId);
    return docRef.delete();
  }

  createList(eventId:string, data : ListModel){
    const listId = this.afs.createId();
    data.listId = listId;
    const docRef = this.eventsCol.doc(eventId).collection("lists").doc(listId);
    return docRef.set(data);
  }

  updateList(eventId:string, data : ListModel){
    const docRef = this.eventsCol.doc(eventId).collection("lists").doc(data.listId);
    return docRef.update(data);
  }

  createListItem(eventId:string, listId:string, data:ListItemModel){
    const itemId = this.afs.createId();
    data.itemId = itemId;
    const itemsCol = this.eventsCol.doc(eventId).collection("lists").doc(listId).collection("items").doc(itemId);
    return itemsCol.set(data);
  }

  updateListItem(eventId:string, listId:string, data:ListItemModel){
    const docRef = this.eventsCol.doc(eventId).collection("lists").doc(listId).collection("items").doc(data.itemId);
    return docRef.update(data);
  }

  escolherItemNaLista(eventId, listId, itemId, uid, quantity){
    const itemRef = this.eventsCol.doc(eventId).collection("lists").doc(listId).collection("items").doc(itemId);
    return itemRef.update({['members.' + uid]:  {quantity : quantity } });
  }

  adicionarParticipantesNoItem(eventId, listId, item){
    const itemRef = this.eventsCol.doc(eventId).collection("lists").doc(listId).collection("items").doc(item.itemId);
    return itemRef.update({members: item.members});
  }


  removerItemEscolhido(eventId, listId, itemId, uid){
    const docRef = this.eventsCol.doc(eventId).collection("lists").doc(listId).collection("items").doc(itemId);
    return docRef.update({['members.' + uid]: firebase.firestore.FieldValue.delete() });
  }


}

