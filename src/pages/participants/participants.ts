import { Component } from '@angular/core';
import { IonicPage, Platform, NavController, NavParams, ViewController, ModalController, AlertController, ActionSheetController, LoadingController } from 'ionic-angular';
import { EventService } from '../../providers/event-service';
import { UserService } from '../../providers/user-service';
import 'rxjs/add/operator/map';
import { HistoryService } from '../../providers/history-service';
import * as firebase from 'firebase/app';
import { AsYouType, CountryCode } from 'libphonenumber-js';
import { Firebase } from '@ionic-native/firebase';

@IonicPage()
@Component({
  selector: 'page-participants',
  templateUrl: 'participants.html',
})
export class ParticipantsPage {

  participants: any;
  eventId; evento : Evento;
  public user;
  public numConvidados: number = 1;
  public isUserAdmin: boolean = false;
  private loading : any;

  constructor(public navCtrl: NavController,
    public params: NavParams, public viewCtrl: ViewController, private eventosService: EventService,
    private modalCtrl: ModalController, public platform: Platform, private loadingCtrl : LoadingController,
    private historyService : HistoryService, private fireNative: Firebase, 
    private alertCtrl: AlertController, private userService: UserService, 
    private actionSheetCtrl: ActionSheetController) {
    this.evento = params.get('data');
    this.eventId = this.evento.eventId;
    this.user = this.userService.getUser();
    this.isUserAdmin = this.evento.organizers[this.user.uid];
  }

  ionViewDidLoad() {
    this.updateCount();
    this.loadInviteds();
    this.fireNative.setScreenName('Participantes').then();
  }

  updateCount() {
    this.numConvidados = Object.keys(this.evento.invitations).length;
  }

  loadInviteds() {
    const codeCountry = this.userService.getNationalCodeCountry();
    this.participants =  this.eventosService.getParticipants(this.evento, this.user).map(list => {
      if (list) {
        list.forEach(item => {
          Object.assign(item, {phoneNumber: item.uid.indexOf('SN') == -1 ? new AsYouType(codeCountry as CountryCode).input('+'+item.uid) : item.uid});
          if (this.evento.organizers[item.uid]) {
            Object.assign(item, { isAdministrator: true });
          }
        });
      }
      return list;
    });
  }

  removeItem(item, index) {
    const name = item.displayName ? item.displayName : item._displayName;
    this.presentConfirm("Desejar remover " + name + " do evento?", () => {
      delete this.evento.invitations[item.uid];
      this.eventosService.removeParticipant(this.eventId, item.uid);
      this.historyService.addHistory(this.userService.getUser(), this.evento, "MSG_REMOVE_PARTICIPANTE", [name]);
      this.numConvidados--;
    });
  }

  showContacts() {
    let modal = this.modalCtrl.create("ContactsPage", {evento : this.evento, tipoContato : 'phone'});
    let self = this;
    modal.onDidDismiss((result : any)=>{
      if (result.reload && result.participants) {
        this.loading = this.loadingCtrl.create({content:'Carregando...'});
        this.loading.present().then(()=>{
          this.eventosService.addNewParticipants(this.evento, result.participants).then(()=>{
            this.updateCount();
            this.loading.dismiss();
          });
        });
        if (result.participants.length > 1){
          this.historyService.addHistory(this.userService.getUser(), this.evento, "MSG_ADD_PARTICIPANTES", null);
        }else if (result.participants.length == 1){
          this.historyService.addHistory(this.userService.getUser(), this.evento, "MSG_ADD_PARTICIPANTE", [result.participants[0].displayName]);
        }
      }    
    });
    modal.present();
  }
 
  presentConfirm(msg: string, handlerOK: Function, handlerCancel?: Function) {
    let alert = this.alertCtrl.create({
      title: 'Confirmação',
      message: msg,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => handlerCancel()
        },
        {
          text: 'Excluir',
          handler: () => handlerOK()
        }
      ]
    });
    alert.present();
  }

  presentOptions(particip: any, index? : number) {

    let buttons = [];
    buttons.push({
      text: 'Dados do participante',
      handler: () => {
        this.zoomImage(particip.photoURL, particip.displayName);
      }
    });

    if (this.isUserAdmin && particip.id != this.user.uid) {
      buttons.push({
        text: (particip.isAdministrator ? 'remover perfil admin' : 'tornar admin do evento'),
        handler: () => {
          this.configAdmin(particip);
        }
      });
    }

    if (this.isUserAdmin && particip.uid != this.user.uid) {
      buttons.push({
        text: 'Remover do evento',
        disabled : true,
        handler: () => {
          this.removeItem(particip, index);
        }
      });
    }

    let actionSheet = this.actionSheetCtrl.create({
      title: 'Opções',
      buttons: buttons
    });
    actionSheet.present();
  }

  configAdmin(particip : any){
    let data = null;
    if (particip.isAdministrator){
      data = {['organizers.'+particip.uid] : firebase.firestore.FieldValue.delete(), ['invitations.'+particip.uid] : !this.evento.private };
    }else{
      data = {['organizers.'+particip.uid] : true, ['invitations.'+particip.uid] : true};
    }
    this.eventosService.updatePartialEvent(this.evento.eventId, data);
    particip.isAdministrator = !particip.isAdministrator;
  }

  zoomImage(image: any, title?: string) {
    if (!image) {
      image = 'assets/imgs/profile.png';
    }
    this.modalCtrl.create("ImageZoomPage", 
      { title: title, 
        imageSrc: image 
      }).present();
  }



}