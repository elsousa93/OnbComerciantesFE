import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators,  AbstractControl } from '@angular/forms';
import { Client, Contacts, Phone } from '../Client.interface'
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
import { infoDeclarativaForm, validPhoneNumber, validEmail } from 'src/app/client/info-declarativa/info-declarativa.model';
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

  //Informação de campos/tabelas
  internationalCallingCodes: CountryInformation[];

  public newClient: Client = null;

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
    this.listValue.get("comercialName").setValue(client?.commercialName);
    this.listValue.get("phone1").get("countryCode").setValue(client?.contacts?.phone1?.countryCode)
    this.listValue.get("phone1").get("phoneNumber").setValue(client?.contacts?.phone1?.phoneNumber);
    this.listValue.get("phone2").get("countryCode").setValue(client?.contacts?.phone2?.countryCode);
    this.listValue.get("phone2").get("phoneNumber").setValue(client?.contacts?.phone2?.phoneNumber);
    this.listValue.get("email").setValue(client?.contacts?.email);
    if (client.billingEmail == null || client.billingEmail == "") {
      this.listValue.get("billingEmail").setValue(client?.contacts?.email);
    } else {
      this.listValue.get("billingEmail").setValue(client?.billingEmail);
    }
  }

  public subs: Subscription[] = [];

  constructor(private logger : LoggerService, private formBuilder: FormBuilder, 
    @Inject(configurationToken) private configuration: Configuration, private router: Router, private data: DataService, private tableInfo: TableInfoService, private submissionService: SubmissionService, private clientService: ClientService) {
    this.ngOnInit();


    this.subs.push(this.tableInfo.GetAllCountries().subscribe(result => {
      this.internationalCallingCodes = result;
      this.internationalCallingCodes = this.internationalCallingCodes.sort((a, b) => a.description> b.description? 1 : -1); //ordenar resposta
    }));

    this.listValue = this.formBuilder.group({
      comercialName: new FormControl(this.newClient?.commercialName, Validators.required),
      phone1: this.formBuilder.group({
        countryCode: new FormControl(this.newClient?.contacts?.phone1?.countryCode),
        phoneNumber: new FormControl(this.newClient?.contacts?.phone1?.phoneNumber),
      },{validators: [validPhoneNumber]}),
      phone2: this.formBuilder.group({
        countryCode: new FormControl(this.newClient?.contacts?.phone2?.countryCode),
        phoneNumber: new FormControl(this.newClient?.contacts?.phone2?.phoneNumber),
      },{validators: [validPhoneNumber]}),
      email: new FormControl(this.newClient?.contacts?.email, [Validators.required, Validators.email]),
      billingEmail: new FormControl((this.newClient?.billingEmail != null || this.newClient?.billingEmail != "") ? this.newClient?.billingEmail : this.newClient?.contacts?.email, [Validators.email])
    });
    
    this.phone1 = this.listValue.get("phone1");
    this.phone2 = this.listValue.get("phone2");

    if (!this.newClient) {
      if (this.returned != null) {
        this.submissionService.GetSubmissionByProcessNumber(localStorage.getItem("processNumber")).subscribe(result => {
          this.logger.debug('Submissão retornada quando pesquisada pelo número de processo' + result);
          this.submissionService.GetSubmissionByID(result[0].submissionId).subscribe(resul => {
            this.logger.debug('Submissão com detalhes mais especificos ' + resul);
            this.clientService.GetClientByIdAcquiring(resul.id).then(res => {
              this.setForm(res); // n sei se aqui é res.res
            });
          });
        });
      } else {
          this.clientService.GetClientByIdAcquiring(localStorage.getItem("submissionId")).then(res => {
              this.logger.debug("Foi buscar o merchant da submission " + res);
              this.setForm(res);
          });
        }
    } else {
      this.logger.debug("Foi buscar o merchant da localStorage " + this.newClient);
    }

}
  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    this.data.updateData(false, 6, 1);
    this.returned = localStorage.getItem("returned");
    this.newClient = JSON.parse(localStorage.getItem("info-declarativa"))?.client ?? this.newClient;
  }

  get emailValid() {
    return this.listValue.get('email');
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub?.unsubscribe);
  }

  changeListElement(variavel:string, e: any) {
    if (e.target.id == 'phone1CountryCode') {
      this.listValue.get("phone1").get("countryCode").setValue(e.target.value);
    }
    if (e.target.id == 'phone2CountryCode') {
      this.listValue.get("phone2").get("countryCode").setValue(e.target.value);
    }
    if (e.target.id == 'faxCountryCode') {
      this.listValue.get("faxCountryCode").setValue(e.target.value);
    }
  }

  submit() {
    if (this.returned != 'consult') {

      this.newClient.contacts = new Contacts();

      this.newClient.contacts.phone1 = new Phone();
      this.newClient.contacts.phone2 = new Phone();

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
        this.logger.debug("Resultado da chamada do edit do cliente " + result);
      });
    }
    this.router.navigate(['/info-declarativa-stakeholder']);
  }

  numericOnly(event): boolean {
    var ASCIICode = (event.which) ? event.which : event.keyCode;

    if (ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57))
      return false;
    return true;
  }
}
