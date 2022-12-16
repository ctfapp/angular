import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class UtilService {
  constructor() { }

  static shortNumber(type:string, format:string, value:any){
    if(!isNaN(value)){
		if(type === "number"){
			let formatter = new Intl.NumberFormat('en-GB',
				{
				  notation: 'compact',
				  compactDisplay: "short",
				  minimumFractionDigits: 0,
				  maximumFractionDigits: 3
				});
			return formatter.format(value);
		}
		else if(type === "currency"){
			let formatter = new Intl.NumberFormat('en-GB',
				{
				  style: 'currency',
				  currency: format, //EUR, USD, AOA
				  currencyDisplay: 'narrowSymbol',
				  notation: 'compact',
				  compactDisplay: "short",
				  minimumFractionDigits: 0,
				  maximumFractionDigits: 3
				});
			return formatter.format(value);
		}
		else if(type === "currency_short"){
			let formatter = new Intl.NumberFormat('en-GB',
				{
				  style: 'currency',
				  currency: format, //EUR, USD, AOA
				  currencyDisplay: 'narrowSymbol',
				  notation: 'compact',
				  compactDisplay: "short",
				  minimumFractionDigits: 0,
				  maximumFractionDigits: 2
				});
			return formatter.format(value);
		} else if (type === "percentage"){
			let formatter = new Intl.NumberFormat("en-US", {
				style: "percent"
				});
			return formatter.format(value);
		}
	}
	return value;
  }
  
}