import { Component } from '@angular/core';
import { NavController, AlertController, ActionSheetController, ModalController } from 'ionic-angular';
import { AngularFirestoreCollection } from '@angular/fire/firestore';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { UserService } from '../../providers/user-service';
import { MenuService, MenuItem } from '../../providers/menu-service';
import { EventService } from '../../providers/event-service';
import { AngularFireAuth } from '@angular/fire/auth';
import { HistoryService } from '../../providers/history-service';
import { DomSanitizer } from '@angular/platform-browser';
import { SocialSharing } from '@ionic-native/social-sharing';
//import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { DatePipe } from '@angular/common';
import { Firebase } from '@ionic-native/firebase';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  eventsCol: AngularFirestoreCollection<Evento>;
  listActivities : any;
  events: Observable<Evento[]>;
  view : string = "next";
  month : string = "";
  showDivider : boolean[] = [];
  userAdmin : boolean[] = [];
  user : any;
  loaded : boolean = false;
  noEvents : boolean = false;

  constructor(public navCtrl: NavController, 
              public alertCtrl:AlertController, 
              private afAuth: AngularFireAuth,
              private modalCtrl : ModalController,
              private eventosService : EventService,
              private actionSheetCtrl : ActionSheetController,
              private userProvider : UserService,
              public menuService : MenuService, 
              private domSanitizer : DomSanitizer,
              private fireNative: Firebase,
              private socialSharing : SocialSharing, 
              private historyService : HistoryService) {
    this.user = this.userProvider.getUser();
    this.createMenu();
    afAuth.authState.subscribe(user => {
      if (!user){
        this.navCtrl.setRoot('WelcomePage');
      }
    });    
  }

  ionViewDidLoad() {
    this.fireNative.setScreenName('Home').then();
    let uid = this.userProvider.getUser().uid;
    //this.fireNative.setUserId(uid);
    this.events = this.eventosService.getEventsByUserId(uid).map(events => {
      if (events){
        let lastValue = "";
        this.showDivider = [];
        this.userAdmin = [];
        events.forEach(event => {
          let mm = new DatePipe('pt-BR').transform(event.eventDate.toDate(), 'yyyyMM'); 
          this.showDivider.push(lastValue != mm);
          this.userAdmin.push(event.organizers && event.organizers[uid] ? event.organizers[uid] : false);
          lastValue = mm;
        });
        this.noEvents = events.length == 0; 
      }      
      return events;
    });
  }

  newEvent():void{
   this.navCtrl.push("EventFormPage", { action : "insert" }); 
  }

  logout(){
    this.afAuth.auth.signOut();
  }

  openEvento(evento){
    this.navCtrl.push("EventDetailsPage", {data : evento});
  }

  openPage(pageName, evento){
    this.navCtrl.push(pageName, {data:evento});    
  }


  getUrlShare(){
    let link = `whatsapp://send?text=${encodeURI('https://www.juntae.com.br')}`;
    return this.sanitize(link);
  }

  sanitize(url:string){
      return this.domSanitizer.bypassSecurityTrustUrl(url);
  }  
  
  presentShareOptions(){

    const msg = 'Eu baixei o Juntaê no meu smartphone. Esse aplicativo permite organizar listas (compras, presentes, atividades, etc) e realizar rateios de despesas em grupo.\nBaixe você também.';

    let actionSheet = this.actionSheetCtrl.create({
      title: 'Compartilhar',
      buttons: [
        {
          text: 'WhatsApp',
          handler: () => {
            this.socialSharing.shareViaWhatsApp(msg, null, 'https://www.juntae.com.br');          
          }
        },
        {
          text: 'Facebook',
          handler: () => {
            this.socialSharing.shareViaFacebook(msg, null, 'https://www.juntae.com.br');          
          }
        },
        {
          text: 'E-mail',
          handler: () => {
            let modal = this.modalCtrl.create("ContactsPage", {tipoContato : 'email'});
            let self = this;
            modal.onDidDismiss((result : any)=>{
              if (result.participants) {
                let arr = [];
                for (const i in result.participants){
                  arr.push(result.participants[i].email)
                }
                this.socialSharing.shareViaEmail(msg + '\n\nhttps://www.juntae.com.br', 'Juntaê App', arr).then();            
              }    
            });
            modal.present();
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    actionSheet.present();
   }
   
   doInfinite(event){
      if (!this.listActivities || this.listActivities.length == 0) {
        event.enable(false);
        event.complete();
        return;
      }
      let endAt = this.listActivities[this.listActivities.length-1].id;
      this.historyService.getListHistoryInfinite(this.user.uid, endAt).subscribe((data:any)=>{
        if (!data || data[0].id == endAt) {
          event.enable(false);
        }
        this.listActivities.splice(this.listActivities.length-1, 1);
        this.listActivities = this.listActivities.concat(data.reverse());
        event.complete();
      });
   }

   loadActivities(refresher?){
       this.historyService.getListHistory(this.user.uid).subscribe(data=>{
         this.listActivities = data.reverse();
       });
   }

   excluirEvento(eventId){
     this.eventosService.deleteEvent(eventId);
   }

   createMenu(){
    this.menuService.clear();
    let items : MenuItem[] = [
      {
        itemName :  "Novo evento", 
        action : () => this.navCtrl.push("EventFormPage", { action : "insert" }), 
        iconName : "create",
        color : "gray"
      },
      {
        itemName :  "Como funciona", 
        action : () => this.navCtrl.push("HowToPage"), 
        iconName : "help-circle",
        color : "gray"
      }, 
      {
        itemName :  "Fale conosco", 
        action : () => this.navCtrl.push("ContactUsPage"),
        iconName : "mail",
        color : "gray"
      }, 
      {
        itemName :  "Conte a um amigo", 
        action : () => this.presentShareOptions(),
        iconName : "share",
        color : "gray"
      }, 
      { 
        itemName :  "Sobre", 
        action : () =>  this.navCtrl.push("AboutPage"),
        iconName : "information-circle",
        color : "gray"
      }
    ];
    this.menuService.addItems(items);
  }
  
  confirmaExclusaoEvento(eventId:string){
      let alert = this.alertCtrl.create({
        title: 'Excluir evento?',
        message: 'Tem certeza que deseja excluir este evento? Esta ação não poderá ser desfeita.',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {} 
          },
          {
            text: 'Excluir',
            handler: () => {this.excluirEvento(eventId)}
          }
        ]
      });
      alert.present();
  }

}

