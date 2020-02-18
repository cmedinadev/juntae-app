import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ToastController } from 'ionic-angular';
import { UserService } from '../../providers/user-service';
import { AngularFireDatabase } from '@angular/fire/database';
import { NotificationService } from "../../providers/notification";
import * as firebase from 'firebase/app';
import { Keyboard } from "@ionic-native/keyboard";
import { Subscription } from "rxjs/Subscription";
import { Network } from "@ionic-native/network";
import { Observable } from "rxjs/Rx";

export class Message {
  _id: string;
  chatId: string;
  content: string;
  createdAt: Date;
  ownership: string;
  senderName: string;
  senderID: string;
  showName: boolean;
  showDaySep: boolean;

}

@IonicPage()
@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html'
  //providers : [NotificationService]
})
export class ChatPage implements OnInit {
  onConnect: Subscription;
  onDisconnect: Subscription;
  subOnKeyHide: Subscription;
  subscriptionKeyboard: Subscription;
  firstKnownKey: any;
  appElHeight: number;
  appEl: HTMLElement;

  title: string;
  messages: Message[] = [];
  message: string = "";
  autoScroller: MutationObserver;
  inc: number = 1;
  messagesRef;
  eventoID;
  evento: any;
  user;
  timer;
  private invitations: any;
  private registrationIDs: Array<string> = [];
  scrollOffset = 0;
  limit = 20;
  isRefresher = false;
  isConnected = true;
  testOnce = true;
  @ViewChild('content') content:any;

  constructor(public navCtrl: NavController,
    private keyboard: Keyboard, private network : Network, private toast : ToastController,
    private af: AngularFireDatabase, 
    public params: NavParams, private ref: ChangeDetectorRef, private el: ElementRef,
    private notification: NotificationService,
    private userService: UserService,
    private platform: Platform) {
    this.evento = params.get('data');
    this.eventoID = this.evento.eventId;
    this.invitations = this.evento.invitations;
    this.title = this.evento.eventName;
    this.user = this.userService.getUser();
  }

  ionViewDidLoad() {
    this.keyboard.disableScroll(true);
    this.loadRegistrationIDs();
  }

  ionViewDidLeave() {

  }

  ionViewDidEnter(){

  }

  showMessageDisconnect(){
      this.toast.create({
        message: `Sem conexão.`,
        duration: 3000
      }).present();
  }

  sendMessage(): void {
    if (!this.isConnected){
      this.showMessageDisconnect();
      return;
    }
    let msg = {
      content: this.message,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      senderName: this.user.displayName,
      senderID: this.user.uid
    };
    this.message = '';
    this.messagesRef.push(msg);
    this.sendNotification(msg);
  }

  ngOnInit() {
    this.initDataBase();
    this.autoScroller = this.autoScroll();

    if (this.platform.is("cordova") && this.platform.is('ios')) {
      let appEl = <HTMLElement>(document.getElementsByTagName('ION-APP')[0]),
        appElHeight = appEl.clientHeight;
      this.subscriptionKeyboard = this.keyboard.onKeyboardShow().subscribe(data => {
        const keyHeight = (<any>data).keyboardHeight;
        appEl.style.height = (appElHeight - keyHeight) + 'px';
        this.scrollDown();
      });

      this.subOnKeyHide = this.keyboard.onKeyboardHide().subscribe(data => {
        appEl.style.height = '100%';
      });
    }

    if(this.network.type == 'none'){
      this.isConnected = false;
      this.showMessageDisconnect();
    }

    this.onConnect = this.network.onConnect().subscribe(data => {
      this.isConnected = true;
    }, error => console.error(error));
 
    this.onDisconnect = this.network.onDisconnect().subscribe(data => {
      this.isConnected = false;
    }, error => console.error(error));
  }

  ngOnDestroy() {
    this.autoScroller.disconnect();
    if (this.platform.is("cordova") && this.platform.is('ios')) {
      this.subscriptionKeyboard.unsubscribe();
      this.subOnKeyHide.unsubscribe();
    }
    this.onConnect.unsubscribe();
    this.onDisconnect.unsubscribe();
  }

  loadRegistrationIDs() {
    this.registrationIDs = [];
    let arr = [];
    for (const uid in this.evento.invitations){
      arr.push(this.notification.getDeviceTokenByUserId(uid).first());
    }
    Observable.forkJoin(arr).subscribe(data => {
      data.forEach((items:any) => {
        items && items.forEach((item:any) => {
          if (item.uid != this.user.uid){
            this.registrationIDs.push(item.token);
          }
        });
      });
    });
  }

  onInputKeypress({ keyCode }: KeyboardEvent): void {
    //console.log(keyCode, this.message);
    if (keyCode == 13 && this.message != '') {
      this.sendMessage();
    }
  }

  private get messagesPageContent(): Element {
    return this.el.nativeElement.querySelector('.messages-page-content');
  }

  private get messagesPageFooter(): Element {
    return this.el.nativeElement.querySelector('.messages-page-footer');
  }

  private get messagesList(): Element {
    return this.messagesPageContent.querySelector('.messages');
  }

  autoScroll(): MutationObserver {
    const autoScroller = new MutationObserver(this.scrollDown.bind(this));
    autoScroller.observe(this.messagesList, {
      childList: true,
      subtree: true
    });

    return autoScroller;
  }


  scrollDown(): void {
    if (!this.isRefresher)
      this.content.scrollToBottom(0);
  }

  sendNotification(message: any) {
    let msg = message.senderName + ": " + message.content;
    let data = { "title": "Juntaê", "message": msg, "action": "chat", "eventId": this.eventoID, "evento": { eventName: this.title, eventId: this.eventoID, invitations: this.invitations } };
    this.notification.sendNotification(this.registrationIDs, "Juntaê", msg, data).subscribe(result => {
      console.log(result);
    });
  }

  parseChatMessage(data : any): Message{
      let val = data.val();
      let msg: Message = new Message();
      msg.content = val.content;
      msg.createdAt = val.createdAt.toDate();
      msg.senderName = val.senderName;
      msg.senderID = val.senderID;
      msg.ownership = (val.senderID == this.user.uid ? 'mine' : 'other');
      msg._id = data.key;
      return msg;
  }

  doInfinite(infinite) {
    if (this.isRefresher) infinite.complete();
      this.isRefresher = true;
      let self = this;
      this.messagesRef.orderByKey().endAt(this.messages[0]._id).limitToLast(this.limit).once('value', function (snapshot) {
        let lastSenderId = null;
        let lastDay = null;
        let arr = [];
        let i = 0; 
        snapshot.forEach(element => {
          if (self.messages[0]._id == element.key) {
            if (i == 0) {
              infinite.enable(false); 
              infinite.complete();
              self.isRefresher = false;
            }
            //infinite.complete();
            return;
          }else{
            let msg = self.parseChatMessage(element);
            if (lastSenderId != msg.senderID && msg.senderID != self.user.id) {
              lastSenderId = msg.senderID;
              msg.showName = true;
            } else {
              msg.showName = false;
            }
            const actualDay = msg.createdAt.getDay() + "-" + msg.createdAt.getMonth();
            if (lastDay != actualDay) {
              lastDay = actualDay;
              msg.showDaySep = true;
            }
            arr.push(msg);
          }
          i++;
        });
        if (arr.length == 0) return;
        const d1 = arr[arr.length - 1].createdAt;
        const d2 = self.messages[0].createdAt;
        if (d1.getDate() == d2.getDate() && d1.getMonth() == d2.getMonth()) {
          self.messages[0].showDaySep = false;
        }
        self.messages = arr.concat(self.messages);
        self.isRefresher = false;
        infinite.complete();
      });
  }

  initDataBase(): void {
    // Reference to the /messages/ database path.
    this.messagesRef = this.af.database.ref('messages/' + this.eventoID);
    // Make sure we remove all previous listeners.
    this.messagesRef.off();
    let self = this;
    let lastID = null, lastDay = null;
    let setMessage = function (data) {
      let val = data.val();
      let msg: Message = new Message();
      clearTimeout(self.timer);
      msg.content = val.content;
      msg.createdAt = new Date(val.createdAt);
      msg.senderName = val.senderName;
      msg.senderID = val.senderID;
      if (lastID != val.senderID && val.senderID != self.user.id) {
        lastID = val.senderID;
        msg.showName = true;
      } else {
        msg.showName = false;
      }
      const actualDay = msg.createdAt.getDate() + "-" + msg.createdAt.getMonth();
      if (lastDay != actualDay) {
        lastDay = actualDay;
        msg.showDaySep = true;
      }
      msg.ownership = (val.senderID == self.user.uid ? 'mine' : 'other');
      msg._id = data.key;
      self.messages = self.messages.concat([msg]);
      self.timer = setTimeout(() => {
        self.ref.detectChanges();
        self.content.scrollToBottom(300);
      }, 500);

    }
    
    this.messagesRef.orderByKey().limitToLast(this.limit).on('child_added', function (childSnapshot, prevChildKey) {
      if (!self.firstKnownKey) {
        self.firstKnownKey = childSnapshot.key;
      }
      setMessage(childSnapshot); // adds post to a <div>
    });
  }

}
