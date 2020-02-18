import { Component, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ActionSheetController, LoadingController, AlertController } from 'ionic-angular';
import { HomePage } from '../home/home';
import { UserService } from '../../providers/user-service';
import { EventService } from '../../providers/event-service';
import { Camera } from '@ionic-native/camera';
import { Platform } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { UploadTaskSnapshot } from '@angular/fire/storage/interfaces';
import { parsePhoneNumberFromString, CountryCode } from 'libphonenumber-js';
import { Firebase } from '@ionic-native/firebase';


@IonicPage()
@Component({
  selector: 'page-perfil',
  templateUrl: 'perfil.html',
})
export class PerfilPage {

  public action: string;
  public phoneNumber: string;
  public name: string;
  public photoURL: string;
  private imgBase64: string;
  public phoneNumberFmt: string;
  private loading;
  private user : User;

  constructor(public navCtrl: NavController, public navParams: NavParams, 
              private viewCtrl: ViewController, private userProvider : UserService, 
              private fireNative: Firebase,
              private actionSheetCtrl: ActionSheetController, public loadingCtrl: LoadingController, 
              private camera: Camera, public platform:Platform, private alertCtrl : AlertController,
              private el : ElementRef, private eventosService : EventService) {

  }

  ionViewDidLoad() {
    this.fireNative.setScreenName('Perfil').then();
    this.action = this.navParams.get("action");
    this.user = this.userProvider.getUser();
    const countryCode = this.userProvider.getNationalCodeCountry() as CountryCode;
    this.photoURL = this.user && this.user.photoURL ? this.user.photoURL : "assets/imgs/profile.png";
    if (this.user && this.user.uid)
      this.phoneNumberFmt = parsePhoneNumberFromString('+' + this.user.uid, countryCode).formatNational();

  }

  
  ionViewDidEnter(){
    if (this.user && this.action == "edit") 
      this.name = '' + this.user.displayName;
  }

  ionViewDidLeave(){
    if (this.action == "edit" && this.user && this.user.displayName != this.name) {
      //Nome alterado - Salvar
      this.user.displayName = this.name;
      this.eventosService.updateUser(this.user).then();        
      this.userProvider.updateProfile(this.user).then();
    }
  }

  async loadHome() {
    if (!this.name || this.name == ''){
      this.alertCtrl.create({title:"Erro", message:"Por favor, informe um nome para prosseguir.", buttons : ['OK']}).present();
      return;
    }
    this.user.displayName = this.name;
    await this.userProvider.updateProfile(this.user);
    await this.eventosService.updateUser(this.user);
    this.navCtrl.setRoot(HomePage);
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  onChange(event) {
    var files = event.srcElement.files;
    let myReader: FileReader = new FileReader();
    let self = this;
    myReader.onloadend = function(e){
      self.imgBase64 = myReader.result.toString();
      self.savePhoto();      
    }
    try{
      if (files[0])
        myReader.readAsDataURL(files[0]);
    }catch(e){
      console.log(e);
    }
  }

  openGallery() {

    if (this.platform.is("mobileweb") || this.platform.is("core")){
      this.el.nativeElement.querySelector('#selecao-arquivo').click();
      return;
    }

    this.camera.getPicture({
      quality: 75,
      encodingType: this.camera.EncodingType.JPEG,
      targetWidth: 300,
      targetHeight: 300,
      allowEdit: true,
      sourceType: this.camera.PictureSourceType.SAVEDPHOTOALBUM,
      destinationType: this.camera.DestinationType.DATA_URL
    }).then((imageData) => {
      this.imgBase64 = 'data:image/jpg;base64,' + imageData;
      this.savePhoto();
    }, (err) => {

    });
  }

  takePicture() {

    this.camera.getPicture({
      quality: 90,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.CAMERA,
      allowEdit: true,
      encodingType: this.camera.EncodingType.JPEG,
      targetWidth: 300,
      targetHeight: 300,
      saveToPhotoAlbum: false
    }).then(imageData => {
      this.imgBase64 = "data:image/jpg;base64," + imageData;
      this.savePhoto();
    }, error => {

    });

  }

  savePhoto() {
    this.loading = this.loadingCtrl.create({
      content: 'Carregando...'
    });
    this.loading.present();
    console.log('nome da foto: ' + this.user.uid);
    let p = this.uploadImage(this.imgBase64, this.user.uid);
    p.subscribe(uploadTask => {
      uploadTask.ref.getDownloadURL().then(downloadURL => {
        this.saveImageURL(downloadURL);
        this.photoURL = this.imgBase64;
      });
      this.loading.dismiss();
    });
  }

  saveImageURL(photoURL) {
    this.user.photoURL = photoURL;
    this.userProvider.updateProfile(this.user);
    this.eventosService.updateUser(this.user).then();
  }

  uploadImage(image, imageName: string) : Observable<UploadTaskSnapshot> {
    return this.eventosService.uploadImage(image, 'profile', imageName);
  }

  removePicture() {
    this.photoURL = "assets/imgs/profile.png";
    this.imgBase64 = null;
    this.saveImageURL(null);
    this.user.photoURL = this.photoURL;
    this.userProvider.setUser(this.user);
  }

  presentOptions(e) {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Foto de Perfil',
      buttons: [
        {
          text: 'Galeria',
          handler: () => {
            this.openGallery();
          }
        },
        {
          text: 'Câmera',
          handler: () => {
            this.takePicture();
          }
        },
        {
          text: 'Remover foto',
          handler: () => {
            this.removePicture();
          }
        }
      ]
    });
    actionSheet.present();
    e.preventDefault();
    e.stopPropagation();
  }


}
