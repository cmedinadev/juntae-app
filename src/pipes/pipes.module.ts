import { NgModule } from '@angular/core';
import { KeysPipe } from './keys';
import { CurrencyFormatPipe } from './currency-format';
@NgModule({
	declarations: [
		KeysPipe,
		CurrencyFormatPipe
	],
	imports: [],
	exports: [
		KeysPipe,
		CurrencyFormatPipe
	]
})
export class PipesModule {}
