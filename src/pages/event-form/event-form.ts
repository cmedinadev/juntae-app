import { Component, ElementRef } from '@angular/core';
import { IonicPage, ViewController, NavParams, LoadingController, ActionSheetController, Platform } from 'ionic-angular';
import { UserService } from '../../providers/user-service';
import { FormBuilder, Validators } from '@angular/forms';
import { Camera } from '@ionic-native/camera';
import { EventService } from '../../providers/event-service';
import { FormGroup } from '@angular/forms/src/model';
import { DatePipe } from '@angular/common';
import { Firebase } from '@ionic-native/firebase';

@IonicPage()
@Component({
  selector: 'page-event-form',
  templateUrl: 'event-form.html' 
})
export class EventFormPage {

  public evento: Evento;
  public dataEvento : any = {};
  public form : FormGroup;
  public status : boolean = false;
  public coverImage: string;
  public thumbImage: string;
  public titleAction: string = "Avançar";
  public step: number = 1;
  public imgType : string;
  public action: string;
  
  private eventoOriginal: Evento;
  //private cancelUpdate : boolean = true;
  private loading : any;

  constructor(private params: NavParams, private eventosService : EventService,
    public viewCtrl: ViewController, formBuilder: FormBuilder, 
    private fireNative: Firebase,
    private platform : Platform, private loadingCtrl: LoadingController,
    private actionSheetCtrl: ActionSheetController, private el: ElementRef,
    private camera : Camera, private userService : UserService) {

      this.action = this.params.get("action") || "insert";
      let passo = this.params.get("step") || 1;
      this.configStep(passo, this.action);
      let _evento = this.params.get("evento");
      if (_evento) {
        
        this.dataEvento.date = new DatePipe('pt-BR').transform(_evento.eventDate.toDate(), 'yyyy-MM-dd');
        this.dataEvento.time = new DatePipe('pt-BR').transform(_evento.eventDate.toDate(), 'HH:mm');
        if (_evento.picture && _evento.picture.cover)
          this.coverImage = _evento.picture.cover;
        if (_evento.picture && _evento.picture.thumbnail)
          this.thumbImage = _evento.picture.thumbnail;
        
          //clono o objeto para caso o usuário cancele a operação ele perca as alterações
        this.eventoOriginal = JSON.parse(JSON.stringify(_evento));
        _evento.private = _evento.private || false;
        this.evento = _evento; 
      } else {
        this.evento = {
          place : { address: '', name: '' },
          code : this.randomString(4, "ABCDEFGHIJKLMNOPQRSTUVXWYZ0123456789"),
          organizers : {[this.userService.getUser().uid] : true},
          invitations : {[this.userService.getUser().uid] : true},
          eventName : '',
          description : '',
          eventDate : null,
          picture : {thumbnail : null, cover : null},
          private : false, 
          archived : false
        };
        this.dataEvento.date = null;
        this.dataEvento.time = null;
      }      
      this.form = formBuilder.group({ 
      nomeEvento: ["", Validators.required],
      dataEvento: ["", Validators.required],
      timeEvento: ["", Validators.required],
      endereco: [],
      local: ["", Validators.required],
      detalhes: [],
      privado: []
    });
  }

  ionViewDidLoad() {
    this.fireNative.setScreenName(this.action ===  'insert'? 'Inclusão de evento' : 'Alteração de evento').then();
  }

  private showLoading(msg) {
    this.loading = this.loadingCtrl.create({
      content: msg
    });
    return this.loading.present();
  }

  private hideLoading() {
    if (!this.loading)
      return Promise.resolve();
    return this.loading.dismiss();
          
  }

  private incStep() {
    this.step++;
    this.hideLoading();
    this.configStep(this.step, this.action);
  }

  private configStep(step, action) {
    switch (step) {
      case 1:
        this.titleAction = (action == "insert" ? "Avançar" : "Gravar"); break;
      case 2:
        this.titleAction = "Fechar"; break;
      case 3:
        this.titleAction = (action == "insert" ? "Concluir" : "Gravar"); break;
      default: 
        this.titleAction = "";
    }
    this.step = step;
  }

  dismiss() {
    this.hideLoading().then(()=>{
      this.viewCtrl.dismiss();
    });
  }

  private randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
  }

  private cadastrarEvento(){
    this.evento.eventDate = new Date(this.dataEvento.date + 'T' + this.dataEvento.time);

    if (this.action == 'insert') { //insert
      this.eventosService.insertEvent(this.evento, this.userService.getUser()).then(eventId => {
        this.evento.eventId = eventId;
        const user = this.userService.getUser();
        this.eventosService.addParticipant(eventId, {uid:user.uid, displayName:user.displayName, photoURL:user.photoURL});
        this.hideLoading().then(()=>{
          this.incStep();
        });
      }).catch(e => {
        this.hideLoading();
      });
    } else { //update
      if (this.eventoOriginal.private != this.evento.private){
        for (const key in this.evento.invitations){
          this.evento.invitations[key] = (!this.evento.private || this.evento.organizers[key]);
        }
      }
      this.eventosService.updateEvent(this.evento);
      this.hideLoading().then(()=>{
          this.dismiss();
      });
    }
  }

  submit() {
    switch(this.step) {
        case 1:
            this.showLoading("Gravando...").then(()=>{
              this.cadastrarEvento();
            });
            break;
        case 2:
        case 3:
            this.dismiss();
            break;
        default:
            console.log("Step not implemented yet", this.step);
    }    
  }

 onFileChange(event) {

    var files = event.srcElement.files;
    let myReader:FileReader = new FileReader();
    let self = this;
    myReader.onloadend = function(e){
      self.gravarImagem(self.imgType, myReader.result.toString());
    }
    try{
      if (files[0])
        myReader.readAsDataURL(files[0]);
    }catch(e){
      console.log(e);
    }
  }

 resizeImage(file) {
      var canvas = document.createElement('canvas');
      var context = canvas.getContext('2d');
      var maxW = 700;
      var maxH = 420;
      var img = document.createElement('img');

      img.onload = function() {
        var iw = img.width;
        var ih = img.height;
        var scale = Math.min((maxW / iw), (maxH / ih));
        var iwScaled = iw * scale;
        var ihScaled = ih * scale;
        canvas.width = iwScaled;
        canvas.height = ihScaled;
        context.drawImage(img, 0, 0, iwScaled, ihScaled);
        document.body.innerHTML+=canvas.toDataURL();
      }
      img.src = URL.createObjectURL(file);
    }



  openGallery(imageType) {

    if (this.platform.is("mobileweb") || this.platform.is("core")){
      this.el.nativeElement.querySelector('#selecao-arquivo').click();
      this.imgType = imageType;
      return;
    }

    this.camera.getPicture({
      quality: (imageType == 'cover' ? 75 : 100),
      encodingType: this.camera.EncodingType.JPEG,
      targetWidth: (imageType == 'cover' ? 700 : 100),
      targetHeight: (imageType == 'cover' ? 420 : 100),
      allowEdit: true,
      sourceType: this.camera.PictureSourceType.SAVEDPHOTOALBUM,
      destinationType: this.camera.DestinationType.DATA_URL
    }).then((imageData) => {
        this.gravarImagem(imageType, 'data:image/jpg;base64,' + imageData);
    }, (err) => {
      
    });
  }

  gravarImagem(imageType, imageData : string){
    this.showLoading("Enviando...");
    let imageName = this.evento.eventId + "_" + imageType;
    this.eventosService.uploadImage(imageData, 'images', imageName).subscribe(uploadTask=>{
      uploadTask.ref.getDownloadURL().then((downloadURL)=>{
        if (imageType == 'cover'){
          this.evento.picture.cover = downloadURL;
          this.coverImage = this.platform.is("ios") ? downloadURL : imageData;
        }
        else{
          this.evento.picture.thumbnail = downloadURL;
          this.thumbImage = this.platform.is("ios") ? downloadURL : imageData;
        }
        this.eventosService.updateEvent(this.evento);
      });
      this.hideLoading();
    });
    
  }

 takePicture(imageType) {
   
    this.camera.getPicture({
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.CAMERA,
      allowEdit: true,
      quality: imageType == 'cover' ? 85 : 100,
      encodingType: this.camera.EncodingType.JPEG,
      targetWidth: imageType == 'cover' ? 700 : 100,
      targetHeight: imageType == 'cover' ? 420 : 100,
      saveToPhotoAlbum: false
    }).then(imageData => {
      this.gravarImagem(imageType, 'data:image/jpg;base64,' + imageData);
    }, error => {

    });
  }

  removePicture(imageType) {
    if (imageType == 'cover'){
      this.evento.picture.cover = null;
      this.coverImage = null;
    }
    else{
      this.evento.picture.thumbnail = null;
      this.thumbImage = null;
    }
    this.eventosService.updateEvent(this.evento);
  }

  presentOptions(e, imageType) {
    let actionSheet = this.actionSheetCtrl.create({
      title: (imageType == 'cover' ? 'Imagem de Capa' : 'Imagem miniatura'),
      buttons: [
        {
          text: 'Galeria',
          handler: () => {
            this.openGallery(imageType);
          }
        },
        {
          text: 'Câmera',
          handler: () => {
            this.takePicture(imageType);
          }
        },
        {
          text: 'Remover imagem',
          handler: () => {
            this.removePicture(imageType);
          }
        }
      ]
    });
    actionSheet.present();
    e.preventDefault();
    e.stopPropagation();
  }  

}
