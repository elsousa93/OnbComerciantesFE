import { Component, Inject, OnInit } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Client } from '../Client.interface'
import { ActivatedRoute, Route } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { codes } from './indicativo';
import { ViewChild, EventEmitter, Output } from '@angular/core';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

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
  callingCodeLandClient?: string = "";
  callingCodeMobileClient?: string = "";
  callingCodeFaxClient?: string = "";
  IndicativoFaxCliente?: string = "";

  displayValueSearch = '';
 
  public newClient: Client = {
    id: 0,
    newClientNr: 4,
     docType:"",
     docNr:1,
     flagAutCol: true,
     crcCode :"",
     socialDenomination :"",
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

  @Output() nameEmitter = new EventEmitter<string>();

  sendToParent() {
    this.nameEmitter.emit(this.displayValueSearch);
  }


  getValueSearch(val: string) {
    console.warn("component recebeu: ", val)
    this.displayValueSearch = val;

  }


  constructor(private formBuilder: FormBuilder) {

    this.ngOnInit();



   /** if (this.newClient.id != 0) {
      http.get<Client>(baseUrl + 'beclient/GetClientById/' + this.newClient.id).subscribe(result => {
        console.log(result);
        this.newClient = result;
      }, error => console.error(error));

    } **/


}
  ngOnInit(): void {
    this.listValue = this.formBuilder.group({
      listF: ['']
    })
  }


  changeListElement(variavel:string, e: any) {
    console.log(e.target.value)
    this.callingCodeFaxClient = e.target.value;

  }

  submit(e) {
    console.log(e);
  }

  

}
