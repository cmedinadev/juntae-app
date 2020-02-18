import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { UniqueDeviceID } from '@ionic-native/unique-device-id';
import { Observable } from '../../node_modules/rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import 'rxjs/add/operator/map';


@Injectable()
export class NotificationService {

  data;
  result;
  fcmToken : string;

  constructor(public http: Http, private uniqueDeviceID: UniqueDeviceID, private afs: AngularFirestore ) {
    console.log('Hello PeopleService Provider');
  }

  sendMessage(registrationID, title, message, data?){
    let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization': 'key=AIzaSyBVQA11t9WGKuXbEIA_Uw9rlhpeDoLR4M4' });
    let options = new RequestOptions({ headers: headers });

    let body = JSON.stringify({
        "notification":{
          "title":title,
          "body":message,
          "sound":"default",
          "icon":"ic_notification"
        },
        "data": data,
        "to":registrationID,
        "priority":"medium"
      });

      return this.http.post('https://fcm.googleapis.com/fcm/send', body, options).map(res => res.json());
  }

  sendNotification(registrationIDs, title, message, data){
    let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization': 'key=AIzaSyBVQA11t9WGKuXbEIA_Uw9rlhpeDoLR4M4' });
    let options = new RequestOptions({ headers: headers });
    let body = JSON.stringify({
        "notification":{
          "title":title,
          "body":message,
          "sound":"default",
          "icon":"ic_notification"
        },
        "data": data,
        "registration_ids" : registrationIDs
      });
      return this.http.post('https://fcm.googleapis.com/fcm/send', body, options).map(res => res.json());
  }

  getDeviceToken() : Observable<any>{
    return new Observable((obs)=>{
      this.uniqueDeviceID.get()
      .then((uuid: any) => {
        console.log(uuid);
        this.afs.collection("tokens").doc(uuid).valueChanges().first().subscribe(res=>{
          obs.next(res);
        });
      })
      .catch((error: any) => obs.error(error));
    });
  }

  getDeviceTokenByUserId(uid : string) : Observable<any>{
      return this.afs.collection("tokens", ref => ref.where('uid', '==', uid)).valueChanges();
  } 

  setFcmToken(token : string){
    this.fcmToken = token;
  }

  saveToken(uid: string, token:string):Promise<any>{
    return this.uniqueDeviceID.get()
    .then((uuid: any) => {
      return this.afs.collection("tokens").doc(uuid).set({uid:uid, token : token});
    });
  }

}



