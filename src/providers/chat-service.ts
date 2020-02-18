import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import 'firebase/storage';
//import * as firebase from 'firebase';

@Injectable()
export class ChatService {

  messagesCol : AngularFirestoreCollection<ChatMessage>;
  messages: Observable<ChatMessage[]>;
  chatMessageDoc: AngularFirestoreDocument<ChatMessage>;

  constructor(private afs: AngularFirestore) {
    
  }

  loadMessages(eventId:string, startAt : number, limit : number) : any {
    this.messagesCol = this.afs.collection("events").doc(eventId).collection("chat",ref => ref.orderBy("createdAt", "desc").limit(limit));
    return this.messagesCol.snapshotChanges();
  }

  addMessage(msg : ChatMessage){
    this.messagesCol.add(msg);
  }


}
