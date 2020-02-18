import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { UserService } from '../../providers/user-service';
import { EventService } from '../../providers/event-service';
import { LaunchNavigator, LaunchNavigatorOptions } from '@ionic-native/launch-navigator';
import { Firebase } from '@ionic-native/firebase';

@IonicPage()
@Component({
  selector: 'page-event-details',
  templateUrl: 'event-details.html',
})
export class EventDetailsPage {

  evento : Evento;
  showBtnParticipar : boolean = false;
  numParticipantes : number;
  numMensagens;
  public isUserAdmin : boolean = false;
  
  constructor(public navCtrl: NavController,
    public params: NavParams, 
    private eventosService : EventService, 
    public alertCtrl: AlertController, 
    public viewCtrl: ViewController, 
    private launchNavigator: LaunchNavigator,
    private fireNative: Firebase,
    private userService : UserService) {
    this.evento = this.params.get('data');
    this.isUserAdmin = this.evento.organizers[this.userService.getUser().uid];
    this.showBtnParticipar = params.get('showBtnParticipar')  || false;
  }

  ionViewDidEnter() {
    if (this.evento.invitations)
      this.numParticipantes = Object.keys(this.evento.invitations).length;
  }

  ionViewDidLoad(){
    this.fireNative.setScreenName('Detalhes do evento').then();
  }

  goBack() {
    this.navCtrl.pop();
  }

  close(addParticipante){
    this.viewCtrl.dismiss(addParticipante);
  }

  openPage(pageName){
    this.navCtrl.push(pageName, {data:this.evento});    
  }

  editEvent(){
    this.navCtrl.push("EventFormPage", {evento:this.evento, action:'edit', step:1});    
  }

  editImage(){
    this.navCtrl.push("EventFormPage", {evento:this.evento, action:'edit', step:2});    
  }

  exitEvent(){

  let alert = this.alertCtrl.create({
      title: 'Sair do evento?',
      message: 'Tem certeza que deseja sair deste evento?',
      buttons: [
        {
          text: 'Não',
          role: 'cancel',
          handler: () => {} 
        },
        {
          text: 'Sim',
          handler: () => {
            this.eventosService.removeParticipant(this.evento.eventId, this.userService.getUser().uid);
            this.navCtrl.pop();
          }
        }
      ]
    });
    alert.present();
  }


  excluirEvento(){
    this.eventosService.deleteEvent(this.evento.eventId);
    this.navCtrl.pop();
 }

 confirmaExclusaoEvento(){
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
          handler: () => {this.excluirEvento()}
        }
      ]
    });
    alert.present();
  }

  arquivarEvent(){
      this.eventosService.archiveEvent(this.evento.eventId);
      this.navCtrl.pop();
  }
  
  navigate(){
    let options: LaunchNavigatorOptions = {
      start: ''
    };
    this.launchNavigator.navigate(this.evento.place.address, options)
        .then(
            success => console.log('Launched navigator'),
            error => console.log('Error launching navigator: ' + error)
    );
  }


}



