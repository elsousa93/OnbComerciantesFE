import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Client } from '../Client.interface'
import { FormBuilder } from '@angular/forms';
import { codes } from './indicativo';
import { EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../nav-menu-interna/data.service';
import { Subscription } from 'rxjs';
import { TableInfoService } from '../../table-info/table-info.service';
import { CountryInformation } from '../../table-info/ITable-info.interface';


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

  sendToParent() {
    this.nameEmitter.emit(this.displayValueSearch);
  }


  getValueSearch(val: string) {
    console.warn("component recebeu: ", val)
    this.displayValueSearch = val;

  }


  constructor(private formBuilder: FormBuilder, private router: Router, private data: DataService, private tableInfo: TableInfoService) {
    this.ngOnInit();
    this.updateData(true, 6);
    this.internationalCallingCodes = tableInfo.GetAllCountries();


   /** if (this.newClient.id != 0) {
      http.get<Client>(baseUrl + 'beclient/GetClientById/' + this.newClient.id).subscribe(result => {
        console.log(result);
        this.newClient = result;
      }, error => console.error(error));

    } **/
}
  ngOnInit(): void {
    this.listValue = this.formBuilder.group({
      phone1CountryCode: [''],
      phone2CountryCode: [''],
      faxCountryCode: [''],
    })
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
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

  submit(e) {
    console.log(e);
    this.newClient.contacts.phone1.countryCode = this.listValue.get('phone1CountryCode').value;
    this.newClient.contacts.phone2.countryCode = this.listValue.get('phone2CountryCode').value;
    this.newClient.contacts.fax.countryCode = this.listValue.get('faxCountryCode').value;
    console.log(this.newClient);
  }

  //função que altera o valor do map e da currentPage
  updateData(value: boolean, currentPage: number) {
    this.map.set(currentPage, value);
    this.data.changeData(this.map);
    this.data.changeCurrentPage(currentPage);
  }

}
