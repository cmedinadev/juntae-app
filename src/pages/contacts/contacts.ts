import { Component, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavParams, ViewController, LoadingController, AlertController } from 'ionic-angular';
import { Contacts, ContactFieldType } from '@ionic-native/contacts';
import { FormControl } from '@angular/forms';
import { UserService } from '../../providers/user-service';
import "rxjs/add/operator/debounceTime";
import { parsePhoneNumber, CountryCode } from 'libphonenumber-js';
import { Firebase } from '@ionic-native/firebase';

@IonicPage()
@Component({
  selector: 'contacts-page',
  templateUrl: 'contacts.html',
  providers:[Contacts]
})
export class ContactsPage {

  search : boolean;
  loaded : boolean = false; 
  items  : any = [];
  searchControl: FormControl;
  searching: any = false;
  countSelected : number = 0;
  
  private allContacts : any;
  private evento;
  private loading : any;
  public tipoContato : string;

  constructor(params : NavParams, 
              private loadingCtrl : LoadingController,
              private alertCtrl : AlertController, 
              private viewCtrl : ViewController, 
              private ref : ChangeDetectorRef,
              private contacts : Contacts, 
              private fireNative: Firebase,
              private userService : UserService) {
    this.searchControl = new FormControl();
    this.tipoContato = params.data.tipoContato;
    if (this.tipoContato == 'phone')
      this.evento = params.data.evento;
    this.search = false;
    //this.hideList = false;
  }

  ionViewWillEnter() {
  
    this.showLoading();
    this.searchControl.valueChanges.debounceTime(500).subscribe(search => {
      this.searching = false;
      this.applyFilter(search);
    });
    
    this.loadContactsFromDevice();
 
  }  

  ionViewDidLoad(){
    this.fireNative.setScreenName('Adicionar participante').then();
  }

  dismiss(reload, participants){
      this.viewCtrl.dismiss({reload:reload, participants : participants});
  }

  public loadContactsFromDevice(){
    this.loaded = false;
    let promiseContacts = this.loadAllContacts(this.tipoContato);
    promiseContacts.then(contacts => {
      if (this.tipoContato == 'phone')
        this.setPhoneItems(contacts);
      else
        this.setEmailItems(contacts);
    }).catch(err => {
      this.hideLoading();
      console.log(err);
    });
  }

  private loadAllContacts(tipo : string) : any {
    let options = { filter: '', multiple: true, hasPhoneNumber: true }
    var fields : ContactFieldType[] = ["displayName", "name", (tipo == 'phone' ? 'phoneNumbers' : 'emails')];
    return this.contacts.find(fields, options);
  }

  private getName(c : any) : string {
      if(c.displayName && c.displayName != "") return c.displayName;
      if(c.name && c.name.formatted) return c.name.formatted;
      if(c.name && c.name.givenName && c.name.familyName) return c.name.givenName +" "+c.name.familyName;
      return "";
  }

  setEmailItems(contacts){
    let list = [];
    for (let index in contacts){
      let contact = contacts[index];
      if (contact.emails && contact.emails.length > 0){
        let name = this.getName(contact);
        list.push({"displayName":name, "contact":contact.emails[0].value,"checked":false});
      }
    }
    list.sort((a, b)=>{return a.displayName.localeCompare(b.displayName)});
    this.allContacts = list;
    this.items = list;
    this.hideLoading().then(()=>{
      this.loaded = true;
    });
    
  }

  setPhoneItems(contacts){
    let list = [];
    for (let index in contacts){
      let contact = contacts[index];
      if (contact.phoneNumbers && contact.phoneNumbers.length > 0){
        let name = this.getName(contact);
        list.push({"displayName":name, "contact":contact.phoneNumbers[0].value,"checked":false});
      }else{
        console.log(JSON.stringify(contact));
      }
    }
    list.sort((a, b)=>{return a.displayName.localeCompare(b.displayName)});
    this.allContacts = list;
    this.items = list;
    this.hideLoading().then(()=>{
      this.loaded = true;
    });
    
  }


  showLoading(){
    if (!this.loading){
      this.loading = this.loadingCtrl.create({
          content: 'Por favor, aguarde', 
          dismissOnPageChange: true
        });
    }
    return this.loading.present();
  }

  hideLoading(){
    return this.loading.dismiss();
  }

  onCancel(ev){
    this.items = this.allContacts;
    ev.preventDefault();
  }

  selectContact(checked){
    this.countSelected += (checked) ? 1 : -1;
    this.ref.detectChanges();
  }

  applyFilter(searchTerm : string){
    this.items = this.allContacts.filter((item) => {
      return (item.displayName.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1);
    });
  }


  addParticipants(){
    if (this.tipoContato == 'phone'){
      this.addPhoneNumbers();
    }else{
      this.addEmails();
    }
  }

  private addPhoneNumbers(){

    const defaultCodeCountry =  this.userService.getNationalCodeCountry();

    const userNumber = parsePhoneNumber(this.userService.getUser().phoneNumber, defaultCodeCountry as CountryCode);

    let prefix = null;
    if (defaultCodeCountry == 'BR'){
      prefix = userNumber.nationalNumber.substring(0, 2); //recupera o ddd;
    }

    let participants = [];
    //this.showLoading().then(()=>{
      for (let index in this.items){
        let item = this.items[index];
        if (item.contact.indexOf('SN') == 0){
          participants.push({uid:item.contact, displayName:item.displayName});
          continue;
        }
        let num = (item.contact.indexOf('+') == 0 ? '+' : '') + item.contact.match(/\d+/gi).join('');
        if (defaultCodeCountry == 'BR' && (num.length == 8 || num.length == 9)) num = prefix + num; 
        const phoneNumber = parsePhoneNumber(num, defaultCodeCountry as CountryCode);
        if (phoneNumber && phoneNumber.isValid){
          const phone = phoneNumber.number.toString().substring(1);
          if (item.checked){
            if(!this.evento.invitations[phone]){
              participants.push({uid:phone, displayName:item.displayName});
            }
          }
        } else{
          participants.push({uid:num, displayName:item.displayName});
        }
      }
      this.dismiss(true, participants);        
  }

  private addEmails(){
    let contacts = [];
    for (let index in this.items){
      let item = this.items[index];
      if (item.checked){
        contacts.push({displayName:item.displayName, email : item.contact});
      }
    }
    this.dismiss(true, contacts);        
  }  

  incluirManual(nome:string, telefone:string){
    telefone = telefone.replace(/\s/g, "");
    if (telefone == '') {
      telefone = 'SN' + new Date().getTime();
    }
    this.items.splice(0, 0, {id:telefone, contact:telefone, displayName:nome, checked:true});
    this.countSelected++;
  }

  addContact(){
    let alert = this.alertCtrl.create({
      title: 'Adicionar Contato',
      subTitle: 'Se você não informar um número de telefone, o evento não será compartilhado com o participante.',
      inputs: [
        {
          name: 'nome',
          placeholder: 'nome'
        },
        {
          name: 'telefone',
          placeholder: 'ddd + telefone', 
          type : 'tel'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Incluir',
          handler: data => {
            this.incluirManual(data.nome, data.telefone);
          }
        }
      ]
    });
    alert.present();
  }

}

