import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';
import { Client } from '../Client.interface'
import { FormBuilder } from '@angular/forms';
import { codes } from './indicativo';
import { EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../nav-menu-interna/data.service';
import { debounceTime, distinctUntilChanged, Subscription, tap } from 'rxjs';
import { TableInfoService } from '../../table-info/table-info.service';
import { CountryInformation } from '../../table-info/ITable-info.interface';
import { SubmissionService } from '../../submission/service/submission-service.service';
import { ClientService } from '../client.service';
import { XhrFactory } from '@angular/common';
import { Configuration, configurationToken } from 'src/app/configuration';
import { infoDeclarativaForm } from './info-declarativa.model';


@Component({
  selector: 'app-info-declarativa',
  templateUrl: './info-declarativa.component.html',
  styleUrls: ['./info-declarativa.component.css']
})
export class InfoDeclarativaComponent implements OnInit {

  public oferta = "";
  e: any;

  ListaInd = codes;
  listValue!: FormGroup;
  phone1: AbstractControl;
  phone2: AbstractControl;
  phone1CountryCode?: string = "";
  phone2CountryCode?: string = "";
  faxPhoneNumber?: string = "";
  faxCountryCode?: string = "";

  displayValueSearch = '';

  public teste: Client = {
    id: 0,
    newClientNr: 4,
    docType: "",
    docNr: 1,
    flagAutCol: true,
    crcCode: "",
    socialDenomination: "",
    nameClient: "EMPRESA PARTICIPANTE UNIP LDA",
    callingCodeLandClient: "315",
    phoneLandClient: 20000,
    callingCodeMobileClient: "1",
    mobilePhoneClient: 10000,
    emailClient: "empresa@participante.com",
    callingCodeFaxClient: "376",
    faxClient: 54000,
    billingEmail: "empresa@participante.com",
  } as unknown as Client;

  //Informação de campos/tabelas
  internationalCallingCodes: CountryInformation[];


  public newClient: Client = {
    clientId: '0',
    commercialName: "",
    contactName: "EMPRESA PARTICIPANTE UNIP LDA",
    billingEmail: "empresa@participante.com",
    contacts: {
      email: "empresa@participante.com",
      phone1: {
        countryCode: "",
        phoneNumber: ""
      },
      phone2: {
        countryCode: "",
        phoneNumber: ""
      },
    },
  } as unknown as Client;

  @Output() nameEmitter = new EventEmitter<string>();

  public map: Map<number, boolean>;
  public currentPage: number;
  public subscription: Subscription; 

  public returned: string;
  public merchantInfo: any;

  sendToParent() {
    this.nameEmitter.emit(this.displayValueSearch);
  }


  getValueSearch(val: string) {
    console.warn("component recebeu: ", val)
    this.displayValueSearch = val;

  }

  //Custom Validators

  validPhoneNumber(control: AbstractControl) : ValidationErrors | null {  
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



  constructor(private formBuilder: FormBuilder, 
    @Inject(configurationToken) private configuration: Configuration, private router: Router, private data: DataService, private tableInfo: TableInfoService, private submissionService: SubmissionService, private clientService: ClientService) {
    this.ngOnInit();


    this.tableInfo.GetAllCountries().subscribe(result => {
      this.internationalCallingCodes = result;
    });

    

    //this.internationalCallingCodes = [{code:'POR', continent:"Europe", description:"thing", internationalCallingCode:"+351"}];

    this.listValue = this.formBuilder.group({
      comercialName: new FormControl((this.merchantInfo !== null) ? this.merchantInfo.commercialName : this.newClient.commercialName, Validators.required),
      phone1: this.formBuilder.group({
        countryCode: new FormControl((this.merchantInfo !== null) ? this.merchantInfo.contacts?.phone1?.countryCode : this.newClient.contacts?.phone1?.countryCode),
        phoneNumber: new FormControl((this.merchantInfo !== null) ? this.merchantInfo.contacts?.phone1?.phoneNumber : this.newClient.contacts?.phone1?.phoneNumber),
      },{validators: [this.validPhoneNumber]}),
      phone2: this.formBuilder.group({
        countryCode: new FormControl((this.merchantInfo !== null) ? this.merchantInfo.contacts?.phone2?.countryCode : this.newClient.contacts?.phone2?.countryCode),
        phoneNumber: new FormControl((this.merchantInfo !== null) ? this.merchantInfo.contacts?.phone2?.phoneNumber : this.newClient.contacts?.phone2?.phoneNumber),
      },{validators: [this.validPhoneNumber]}),
      faxCountryCode: new FormControl(this.newClient.contacts?.fax?.countryCode),
      faxPhoneNumber: new FormControl(this.newClient.contacts?.fax?.phoneNumber),
      email: new FormControl((this.merchantInfo !== null) ? this.merchantInfo.contacts?.email : this.newClient.contacts?.email, Validators.required),
      billingEmail: new FormControl((this.merchantInfo !== null) ? this.merchantInfo.billingEmail : this.newClient.billingEmail)
    });
    
    this.phone1 = this.listValue.get("phone1");
    this.phone2 = this.listValue.get("phone2");

    this.submissionService.GetSubmissionByID(localStorage.getItem("submissionId")).subscribe(result => {
      this.clientService.GetClientById(result.id).subscribe(resul => {
        if (this.newClient.clientId == '0') {
          console.log("Fui buscar o merchant da submission ", resul);
          this.newClient = resul;
          if (this.newClient.contacts == null) {
            this.newClient.contacts = {
              phone1: {
                countryCode: "",
                phoneNumber: ""
              },
              phone2: {
                countryCode: "",
                phoneNumber: ""
              },
              email: ""
            }

          }
        } else {
          console.log("Fui buscar o merchant da localStorage ", this.newClient);
        }
        //this.listValue.get("comercialName").setValue(result.commercialName);
        //this.listValue.get("phone1").get("phoneNumber").setValue(result.contacts.phone1.phoneNumber);
        //this.listValue.get("phone2").get("phoneNumber").setValue(result.contacts.phone2.phoneNumber);
        //this.listValue.get("email").setValue(result.contacts.email);
        //this.listValue.get("billingEmail").setValue(result.billingEmail);
      });
    });

    if (this.returned !== null) {
      this.submissionService.GetSubmissionByProcessNumber(localStorage.getItem("processNumber")).subscribe(result => {
        console.log('Submissão retornada quando pesquisada pelo número de processo', result);
        this.submissionService.GetSubmissionByID(result[0].submissionId).subscribe(resul => {
          console.log('Submissão com detalhes mais especificos ', resul);
          this.clientService.GetClientById(resul.id).subscribe(res => {
            this.merchantInfo = res;
          });
        });
      });
    }

    /* this.listValue.get("phone1CountryCode").valueChanges.subscribe(data => {
      if (data !== '') {
        this.listValue.controls["phone1PhoneNumber"].setValidators([Validators.required]);  
      } else {
        this.listValue.controls["phone1PhoneNumber"].clearValidators();
      }
      this.listValue.controls["phone1PhoneNumber"].updateValueAndValidity();
    });

    this.listValue.get("phone1PhoneNumber").valueChanges.subscribe(data => {
      if (data !== '') {
        this.listValue.controls["phone1CountryCode"].setValidators([Validators.required]);
      } else {
        this.listValue.controls["phone1CountryCode"].clearValidators();
      }
      this.listValue.controls["phone1CountryCode"].updateValueAndValidity();
    });

    this.listValue.get("phone2CountryCode").valueChanges.subscribe(data => {
      if (data !== '') {
        this.listValue.controls["phone2PhoneNumber"].setValidators([Validators.required]);
      } else {
        this.listValue.controls["phone2PhoneNumber"].clearValidators();
      }
      this.listValue.controls["phone2PhoneNumber"].updateValueAndValidity();
    });

    this.listValue.get("phone2PhoneNumber").valueChanges.subscribe(data => {
      if (data !== '') {
        this.listValue.controls["phone2CountryCode"].setValidators([Validators.required]);
      } else {
        this.listValue.controls["phone2CountryCode"].clearValidators();
      }
      this.listValue.controls["phone2CountryCode"].updateValueAndValidity();
    }); */

    //this.listValue.get("faxCountryCode").valueChanges.subscribe(data => {
    //  if (data !== '') {
    //    this.listValue.controls["faxPhoneNumber"].setValidators([Validators.required]);
    //  } else {
    //    this.listValue.controls["faxPhoneNumber"].clearValidators();
    //  }
    //  this.listValue.controls["faxPhoneNumber"].updateValueAndValidity();
    //});

    //this.listValue.get("faxPhoneNumber").valueChanges.subscribe(data => {
    //  if (data !== '') {
    //    this.listValue.controls["faxCountryCode"].setValidators([Validators.required]);
    //  } else {
    //    this.listValue.controls["faxCountryCode"].clearValidators();
    //  }
    //  this.listValue.controls["faxCountryCode"].updateValueAndValidity();
    //});

   /** if (this.newClient.id != 0) {
      http.get<Client>(baseUrl + 'beclient/GetClientById/' + this.newClient.id).subscribe(result => {
        console.log(result);
        this.newClient = result;
      }, error => console.error(error));

    } **/
}
  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    this.data.updateData(false, 6, 1);
    this.returned = localStorage.getItem("returned");
    this.newClient = JSON.parse(localStorage.getItem("info-declarativa"))?.client ?? this.newClient;

  }


  changeListElement(variavel:string, e: any) {
    if (e.target.id == 'phone1CountryCode') {
      this.listValue.get("phone1").get("countryCode").setValue(e.target.value);
      //this.phone1CountryCode = e.target.value;
    }
    if (e.target.id == 'phone2CountryCode') {
      this.listValue.get("phone2").get("countryCode").setValue(e.target.value);
      //this.phone2CountryCode = e.target.value;
    }
    if (e.target.id == 'faxCountryCode') {
      this.listValue.get("faxCountryCode").setValue(e.target.value);
    }
  }

  submit() {
    if (this.returned !== 'consult') { 
      this.newClient.commercialName = this.listValue.get('comercialName').value;
      this.newClient.contacts.phone1.countryCode = this.listValue.get('phone1').get('countryCode').value;
      this.newClient.contacts.phone1.phoneNumber = this.listValue.get('phone1').get('phoneNumber').value;
      this.newClient.contacts.phone2.countryCode = this.listValue.get('phone2').get('countryCode').value;
      this.newClient.contacts.phone2.phoneNumber = this.listValue.get('phone2').get('phoneNumber').value;
      this.newClient.contacts.email = this.listValue.get('email').value;
      this.newClient.billingEmail = this.listValue.get('billingEmail').value;
      let storedForm: infoDeclarativaForm = JSON.parse(localStorage.getItem("info-declarativa")) ?? new infoDeclarativaForm();
      storedForm.client = this.newClient;
      localStorage.setItem("info-declarativa", JSON.stringify(storedForm));

      this.clientService.EditClient(localStorage.getItem("submissionId"), this.newClient).subscribe(result => {
        console.log("Resultado da chamada do edit do cliente ", result);
      });
    }
    this.router.navigate(['/info-declarativa-stakeholder']);
  }



}
