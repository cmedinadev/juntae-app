import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { ListService } from '../../../providers/list-service';
import { ListItemModel } from '../../../model/list.model';
import { FormBuilder, Validators } from '@angular/forms';
import { Firebase } from '@ionic-native/firebase';

@IonicPage()
@Component({
  selector: 'page-create-list-item',
  templateUrl: 'create-list-item.html'
})
export class CreateListItemPage {

  listId;
  form;
  listItem : ListItemModel;
  title : string;
  eventId : string;

  constructor(public navCtrl: NavController, public params: NavParams, 
              private viewCtrl: ViewController, private listService : ListService, 
              private fireNative: Firebase,
              formBuilder : FormBuilder) {
    this.listId = params.get("listId");
    this.eventId = params.get("eventId");
    this.listItem = params.get("listItem");
    if (this.listItem){
      this.title = "Alterar item";
      this.listItem.allowMaxAmount = this.listItem.allowMaxAmount || false;
      this.listItem.chosen = this.listItem.chosen || false;
    }else{
      this.title = "Incluir item";
      this.listItem = {itemName:"", itemId:null, quantity:0, packing:"", allowMaxAmount : false, maxAmount : null};
    }
    this.form = formBuilder.group({ // name should match [ngFormModel] in your html
      itemName: ["", Validators.required], // Setting fields as required
      /*category: ["", Validators.required],*/
      packing : [""],
      allowMaxAmount : [""],
      maxAmount : [""],
    });
  }

  dismiss(data?) {
    this.viewCtrl.dismiss(data);
  }


  ionViewDidLoad() {
    this.fireNative.setScreenName(this.title).then();
  }

  saveItem(){
    if (this.listItem.itemId){
      this.listService.updateListItem(this.eventId, this.listId, this.listItem);
      this.dismiss({result:'UPDATE', item:this.listItem});
    }else{
      this.listService.createListItem(this.eventId, this.listId, this.listItem);
      this.dismiss({result:'INSERT', item:this.listItem});
    }
  }

  selectMaxAmount(event){
      this.listItem.maxAmount = event.checked ? 1 : null;
  }

}
