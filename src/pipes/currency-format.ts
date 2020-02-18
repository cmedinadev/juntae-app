import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Pipe({
  name: 'currencyformat'
})
export class CurrencyFormatPipe implements PipeTransform {

  transform(value: number, currencyCode: string = 'BRL', symbolDisplay: 'code' | 'symbol' | 'symbol-narrow' = 'symbol', digits?: string): string {
    if (!value) {
      return '';
    }
    let currencyPipe: CurrencyPipe = new CurrencyPipe('pt');
    let newValue: string = currencyPipe.transform(value, currencyCode, symbolDisplay, digits);
    return newValue;
  }

}