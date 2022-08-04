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
    contactName: "EMPRESA PARTICIPANTE UNIP LDA",
    billingEmail: "empresa@participante.com",
    contacts: {
      preferredMethod: "",
      email: "empresa@participante.com",
      preferredPeriod: {
        startsAt: "",
        endsAt: ""
      },
      phone1: {
        countryCode: "315",
        phoneNumber: ""
      },
      phone2: {
        countryCode: "315",
        phoneNumber: ""
      },
      fax: {
        countryCode: "376",
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

    this.submissionService.GetSubmissionByID(localStorage.getItem("submissionId")).subscribe(result => {
      this.clientService.GetClientById(result.id).subscribe(resul => {
        this.merchantInfo = resul;
      });
    });

    //this.internationalCallingCodes = [{code:'POR', continent:"Europe", description:"thing", internationalCallingCode:"+351"}];

    this.listValue = this.formBuilder.group({
      comercialName: new FormControl((this.returned != null) ? this.merchantInfo.commercialName : '', Validators.required),
      phone1: this.formBuilder.group({
        countryCode: new FormControl(null),
        phoneNumber: new FormControl((this.returned != null) ? this.merchantInfo.contacts.phone1.phoneNumber : null),
      },{validators: [this.validPhoneNumber]}),
      phone2: this.formBuilder.group({
        countryCode: new FormControl(null),
        phoneNumber: new FormControl((this.returned != null) ? this.merchantInfo.contacts.phone2.phoneNumber : null),
      },{validators: [this.validPhoneNumber]}),
      faxCountryCode: new FormControl(''),
      faxPhoneNumber: new FormControl(''),
      email: new FormControl((this.returned != null) ? this.merchantInfo.contacts.email : '', Validators.required),
      billingEmail: new FormControl((this.returned != null) ? this.merchantInfo.billingEmail : '')
    });
    this.phone1 = this.listValue.get("phone1");
    this.phone2 = this.listValue.get("phone2");


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
  }


  changeListElement(variavel:string, e: any) {
    if (e.target.id == 'phone1CountryCode') {
      this.phone1CountryCode = e.target.value;
    }
    if (e.target.id == 'phone2CountryCode') {
      this.phone2CountryCode = e.target.value;
    }
    if (e.target.id == 'faxCountryCode') {
      this.faxPhoneNumber = e.target.value;
    }
    console.log(e.target.id);
  }

  submit() {
    this.newClient.companyName = this.listValue.get('comercialName').value;
    this.newClient.contacts.phone1.countryCode = this.listValue.get('phone1').get('CountryCode').value;
    this.newClient.contacts.phone1.phoneNumber = this.listValue.get('phone1').get('PhoneNumber').value;
    this.newClient.contacts.phone2.countryCode = this.listValue.get('phone2').get('CountryCode').value;
    this.newClient.contacts.phone2.phoneNumber = this.listValue.get('phone2').get('PhoneNumber').value;
    this.newClient.contacts.email = this.listValue.get('email').value;
    this.newClient.contacts.fax.countryCode = this.listValue.get('faxCountryCode').value;
    this.newClient.contacts.fax.phoneNumber = this.listValue.get('faxPhoneNumber').value;
    this.newClient.billingEmail = this.listValue.get('billingEmail').value;

    this.router.navigate(['/info-declarativa-stakeholder']);
  }



}
