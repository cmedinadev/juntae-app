import { AlertController } from 'ionic-angular';
import { Injectable } from '@angular/core';

@Injectable()
export class PromptService {

  constructor(
      private alertController: AlertController,
  ) {
  }

  public showPrompt(title: string, message: string, inputs: any[], cb: any, ecb: any = ()=>{}, present: boolean = true) {
      inputs = inputs || [];
      const cleanedInputs: any[] = this.cleanInputs(inputs);
      let prompt = this.alertController.create({
          title: title,
          message: message,
          inputs: cleanedInputs,
          buttons: [
              { text: 'Cancelar', handler: ecb },
              { text: 'OK', handler: data => {
                      this.validate(data, title, message, inputs, cb, ecb, present);
                  }
              }
          ]
      });
      present && prompt.present();
      return prompt;
  }

  protected cleanInputs(inputs: any[]): any[] {
      return inputs.map(item => {
          let cleanedItem: any = Object.assign({}, item);
          delete cleanedItem['required']
          return cleanedItem;
      });
  }

  protected validate(data: any, title: string, message: string, inputs: any[], cb: Function, ecb: Function = ()=>{}, present: boolean = true) {
      let errors: any[] = [];
      let requiredInputs: any[] = inputs.filter(item => item['required']);
      for (let requiredInputFor of requiredInputs) {
          if (data[requiredInputFor.name] === '') {
              let fieldName: string = requiredInputFor['placeholder'] || requiredInputFor['name'];
              errors.push(`O campo ${fieldName} é requerido.`);
          }
      }
      if (errors.length) {
          this.invalidAlert(errors, title, message, inputs, cb, ecb, present);
      }else{
          cb(data);
      }
  }

  protected invalidAlert(errors: string[], title: string, message: string, inputs: any[], cb: Function, ecb: Function = ()=>{}, present: boolean = true) {
      let alert = this.alertController.create({
          title: 'Erro',
          subTitle: errors.join('\n'),
          buttons: [{
          text: 'OK',
              handler: () => {
                  this.showPrompt(title, message, inputs, cb, ecb, present);
              }
          }]
      });
      alert.present();
  }

}
