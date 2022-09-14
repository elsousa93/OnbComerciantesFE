import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators,  AbstractControl } from '@angular/forms';
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
import { infoDeclarativaForm, validPhoneNumber } from 'src/app/client/info-declarativa/info-declarativa.model';
import { LoggerService } from 'src/app/logger.service';




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

  setForm(client : Client){
    this.newClient = client;
    this.listValue.get("comercialName").setValue(client.commercialName);
    this.listValue.get("phone1").get("phoneNumber").setValue(client.contacts.phone1.phoneNumber);
    this.listValue.get("phone2").get("phoneNumber").setValue(client.contacts.phone2.phoneNumber);
    this.listValue.get("email").setValue(client.contacts.email);
    this.listValue.get("billingEmail").setValue(client.billingEmail);
  }




  public subs: Subscription[] = [];


  constructor(private logger : LoggerService, private formBuilder: FormBuilder, 
    @Inject(configurationToken) private configuration: Configuration, private router: Router, private data: DataService, private tableInfo: TableInfoService, private submissionService: SubmissionService, private clientService: ClientService) {
    this.ngOnInit();


    this.subs.push(this.tableInfo.GetAllCountries().subscribe(result => {
      this.internationalCallingCodes = result;
    }));

    

    //this.internationalCallingCodes = [{code:'POR', continent:"Europe", description:"thing", internationalCallingCode:"+351"}];

    this.listValue = this.formBuilder.group({
      comercialName: new FormControl(this.newClient.commercialName, Validators.required),
      phone1: this.formBuilder.group({
        countryCode: new FormControl(this.newClient.contacts?.phone1?.countryCode),
        phoneNumber: new FormControl(this.newClient.contacts?.phone1?.phoneNumber),
      },{validators: [validPhoneNumber]}),
      phone2: this.formBuilder.group({
        countryCode: new FormControl(this.newClient.contacts?.phone2?.countryCode),
        phoneNumber: new FormControl(this.newClient.contacts?.phone2?.phoneNumber),
      },{validators: [validPhoneNumber]}),
      faxCountryCode: new FormControl(this.newClient.contacts?.fax?.countryCode),
      faxPhoneNumber: new FormControl(this.newClient.contacts?.fax?.phoneNumber),
      email: new FormControl(this.newClient.contacts?.email, Validators.required),
      billingEmail: new FormControl(this.newClient.billingEmail)
    });
    
    this.phone1 = this.listValue.get("phone1");
    this.phone2 = this.listValue.get("phone2");

    if (!this.newClient){
      if (this.returned !== null) {
        this.submissionService.GetSubmissionByProcessNumber(localStorage.getItem("processNumber")).subscribe(result => {
          this.logger.debug('Submissão retornada quando pesquisada pelo número de processo' + result);
          this.submissionService.GetSubmissionByID(result[0].submissionId).subscribe(resul => {
            this.logger.debug('Submissão com detalhes mais especificos ' + resul);
            this.clientService.GetClientById(resul.id).subscribe(res => {
              this.setForm(res);
            });
          });
        });
      } else {
          this.clientService.GetClientById(localStorage.getItem("submissionId")).subscribe(res => {
              this.logger.debug("Fui buscar o merchant da submission " + res);
              this.setForm(res);
          });
        }
    } else {
      this.logger.debug("Fui buscar o merchant da localStorage " + this.newClient);
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
        this.logger.debug(result);
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

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub?.unsubscribe);
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
    //if (this.returned !== 'consult') { 
    //  this.newClient.commercialName = this.listValue.get('comercialName').value;
    //  this.newClient.contacts.phone1.countryCode = this.listValue.get('phone1').get('countryCode').value;
    //  this.newClient.contacts.phone1.phoneNumber = this.listValue.get('phone1').get('phoneNumber').value;
    //  this.newClient.contacts.phone2.countryCode = this.listValue.get('phone2').get('countryCode').value;
    //  this.newClient.contacts.phone2.phoneNumber = this.listValue.get('phone2').get('phoneNumber').value;
    //  this.newClient.contacts.email = this.listValue.get('email').value;
    //  this.newClient.billingEmail = this.listValue.get('billingEmail').value;
    //  let storedForm: infoDeclarativaForm = JSON.parse(localStorage.getItem("info-declarativa")) ?? new infoDeclarativaForm();
    //  storedForm.client = this.newClient;
    //  localStorage.setItem("info-declarativa", JSON.stringify(storedForm));

    //  this.clientService.EditClient(localStorage.getItem("submissionId"), this.newClient).subscribe(result => {
    //    this.logger.debug("Resultado da chamada do edit do cliente " + result);
    //  });
    //}
    this.router.navigate(['/info-declarativa-stakeholder']);
  }



}
