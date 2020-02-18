import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import * as firebase from 'firebase/app';
import { UploadTaskSnapshot } from '@angular/fire/storage/interfaces';

@Injectable()
export class EventService {

  eventsCol : AngularFirestoreCollection<Evento>;
  events: Observable<Evento[]>;
  eventDoc: AngularFirestoreDocument<Evento>;

  constructor(private afs: AngularFirestore, private storage: AngularFireStorage) {
    this.eventsCol = this.afs.collection("events");
  }

  getEventsByUserId(userId:string) : Observable<any> {
    //invitations == true  --> Participantes em evento público ou organizadores
    //invitations == false --> Participantes em evento privado e não organizadores
    const eventsCol = this.afs.collection("events", ref => ref.where(`invitations.${userId}`, "==", true).where('archived', '==', false));
    return eventsCol.snapshotChanges().map(events=>{
      return events.map(a => {
          const data = a.payload.doc.data() as Evento;
          data.eventId = a.payload.doc.id;
          return data;
      });
    }).map((events:any) =>{
      return events.sort((a, b)=>{
        return b.eventDate.seconds-a.eventDate.seconds
      });
    });
  }

  private guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
  }

  uploadImage(imageBase64 : string, contextPath : string, imageName : string) : Observable<UploadTaskSnapshot>{
    if (!imageName){
        imageName = this.guid();
    }
    let startIndex = imageBase64.indexOf("image/");
    if (startIndex < 0){
        throw new Error("Image invalid.");
    }
    let contentType = imageBase64.substring(startIndex, imageBase64.indexOf(";", startIndex)); 
    let extension = contentType.replace("image/", ".");

    const ref = this.storage.ref(`${contextPath}/${imageName}${extension}`);
    const task = ref.putString(imageBase64, 'data_url', { contentType: contentType });
    return task.snapshotChanges();
  }  

  updateEvent(evento : any){
    return this.eventsCol.doc(evento.eventId).update(evento);
  }

  updatePartialEvent(eventId : string, obj : any){
    return this.eventsCol.doc(eventId).update(obj);
  }

  updateInvitations(evento : any){
    return this.eventsCol.doc(evento.eventId).update({invitations:evento.invitations});
  }

  insertEvent(evento:Evento, user:User) : Promise<string> {
    return new Promise((resolve, reject) => {
      const pushkey = this.afs.createId();
      evento.eventId = pushkey;
      this.eventsCol.doc(pushkey).set(evento);
      resolve(pushkey);
    });
  }

  deleteEvent(eventId:string){
    return this.eventsCol.doc(eventId).delete();
  }

  archiveEvent(eventId:string){
    return this.eventsCol.doc(eventId).set({archived : true}, {merge:true});
  }


  findUser(uid) : Observable<any> {
    const usersCol = this.afs.collection("users");
    const user = usersCol.doc<User>(uid);
    return user.valueChanges().map(data=>{
      return {data : data, ref : user}
    }).first();
  }

  getUsersByKeys(keys : any):Observable<Array<User>>{
    const usersCol = this.afs.collection("users");
    let arr = [];
    for (let uid in keys) {
      arr.push(usersCol.doc(uid).valueChanges().map((d:any)=>{
        return {uid : uid, data : d.payload.doc.data()};
      }).first());
    }
    return Observable.forkJoin(arr);
  }

  getParticipantsNotRegistered(eventId:string) : Observable<any>{
    const usersCol = this.eventsCol.doc(eventId).collection("participants");
    return usersCol.valueChanges().map(data=>{
        let result = {};
        data.forEach((item:any)=>{
          result[item.uid] = item;
        });
        return result;
      }).first();
  }

  //deverá ser alterada
  getParticipants(evento : Evento, user? : User):Observable<any>{
    const usersCol = this.eventsCol.doc(evento.eventId).collection("participants", ref => ref.orderBy("displayName"));
    return usersCol.snapshotChanges().map(res=>{
      return res.map(a=>{
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        return { uid : id, displayName : data.displayName, photoURL : data.photoURL };
      });
    });
  }    

  updateUser(user){
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    let _user = {
      displayName : user.displayName,
      uid : user.uid,
      photoURL : user.photoURL,
      //lastLoginAt : user.lastLoginAt, 
      updateAt : timestamp,
      phoneNumber : user.phoneNumber
    };    
    return this.afs.collection("users").doc(user.uid).set(_user, {merge:true});
  }  

  addParticipant(eventId : string, participant : any){
    this.eventsCol.doc(eventId).collection("participants").doc(participant.uid).set(participant, {merge:true}).then();
  }

  addNewParticipants(evento : any, participants : any){
    let batch = this.afs.firestore.batch();
    for (const index in participants){
      const item = participants[index];
      let ref = this.eventsCol.doc(evento.eventId).collection("participants").doc(item.uid).ref;
      batch.set(ref, item, {merge:true});
      Object.assign(evento.invitations, { [item.uid]: !evento.private });
    }
    const ref = this.eventsCol.doc(evento.eventId).ref;
    batch.update(ref, {invitations:evento.invitations});
    return batch.commit();
  }

  removeParticipant(eventId, userId) {
    let batch = this.afs.firestore.batch();
    const refParticipants = this.eventsCol.doc(eventId).collection("participants").doc(userId).ref;
    batch.delete(refParticipants);
    batch.update(this.eventsCol.doc(eventId).ref, {
      ['invitations.'+userId]:firebase.firestore.FieldValue.delete(),
      ['organizers.'+userId]:firebase.firestore.FieldValue.delete()
    });
    return batch.commit();
  }

}
