import { AlertController } from 'ionic-angular';

export class Utilities {
    static getFormattedPrice(val: number): string {
        if (!val || val == Infinity) return "R$ 0,00";
        if (val.toString().indexOf("R$") > -1) return val.toString();
        let num = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
        let pos = num.indexOf(num.match(/\d/)[0]);
        return num.substring(0, pos) + " " + num.substring(pos);
    }

    static getFormattedDecimal(val: number): string {
        if (!val || val == Infinity) return "0,00";
        let num = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
        let pos = num.indexOf(num.match(/\d/)[0]);
        return num.substring(pos);
    }

    static showConfirm(alertCtrl: AlertController, options: { message: string, cancelHandler?: Function, okHandler: Function, title: string }) {
        let alert = alertCtrl.create({
            title: 'Confirmação',
            message: options.message,
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel',
                    handler: () => { if (options.cancelHandler) options.cancelHandler() }
                },
                {
                    text: 'Excluir',
                    handler: () => options.okHandler()
                }
            ]
        });
        alert.present();
    }

    findIndexInArray(arr: [any], key: string, search: string) {
        for (let i in arr) {
            if (arr[i][key] == search)
                return i;
        }
        return null;
    }

    static format(str:string, args: string[]){
        return str.replace(/{(\d+)}/g, function(match, number) { 
          return args[number];
        });
    }    


}