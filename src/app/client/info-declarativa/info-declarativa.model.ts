import { AbstractControl, ValidationErrors, Validators } from "@angular/forms";
import { IStakeholders } from "src/app/stakeholders/IStakeholders.interface";
import { Istore, ShopDetailsAcquiring } from "src/app/store/IStore.interface";
import { Client } from "../Client.interface";

export class infoDeclarativaForm {
  client: Client
  stakeholder: IStakeholders
  store: ShopDetailsAcquiring
}

 //Custom Validators

export function validPhoneNumber(control: AbstractControl) : ValidationErrors | null {  
  let countryCodeExists = Validators.required(control.get("countryCode")) == null
  let phoneNumberExists = Validators.required(control.get("phoneNumber")) == null

  //Se nenhum existir, é valido
  if (!countryCodeExists && !phoneNumberExists){
    return null;
  }
  //Se só um existir, retorna erro
  if (!countryCodeExists || !phoneNumberExists){
    return {"missingValue" : countryCodeExists ? "phoneNumber" : "countryCode"};
  }
  //Se ambos existirem, proceder à validação do indicativo/numero
  let phoneNumber = control.get("phoneNumber").value;
  let countryCode = control.get("countryCode").value;
  if (countryCode == "+351") { //Indicativo de Portugal
    if (phoneNumber && phoneNumber.length == 9 && phoneNumber.startsWith('9')) {
      return null;
    } else {
      return {invalidNumber : true}
    }
  } else { // Indicativo não é de Portugal
    if (phoneNumber && phoneNumber.length <= 16) {
      return null;
    } else {
      return {invalidNumber : true}
    }
  }
}
 
