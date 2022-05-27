import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Inject } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Client } from '../Client.interface';

@Component({
  selector: 'app-new-client',
  templateUrl: './new-client.component.html'
})
export class NewClientComponent implements OnInit {

  addNewClient: Client = {} as Client
  stringJson: any;

  constructor(private router: ActivatedRoute, private http: HttpClient, @Inject('BASE_URL') private baseUrl: string, private route: Router) {
    console.log(this.addNewClient.id);
  }

  ngOnInit(): void {

  }

  obterComprovativos() {
    //this.route.navigate(['/nav-interna/', "COMPROVATIVOS"]);
    //this.route.navigate(['/comprovativos/', this.clientNr]);
  }

  submit(form: any) {

    this.addNewClient.id = form.id;
    this.addNewClient.clientTypology = form.clientTypology;
    //this.addNewClient.newClientNr = form.newClientNr;
    this.addNewClient.docType = form.docType;
    this.addNewClient.docNr = form.docNr;
    this.addNewClient.flagAutCol = form.flagAutCol;
    this.addNewClient.crcCode = form.crcCode;
    this.addNewClient.socialDenomination = form.socialDenomination;
    this.addNewClient.natJuridicaN1 = form.natJuridicaN1;
    this.addNewClient.natJuridicaNIFNIPC = form.natJuridicaNIFNIPC;
    this.addNewClient.natJuridicaN2 = form.natJuridicaN2;
    this.addNewClient.categoriaComerciante = form.categoriaComerciante;
    this.addNewClient.categoriaNIPC = form.categoriaNIPC;
    this.addNewClient.caePrincipal = form.caePrincipal;
    this.addNewClient.caeSecundario1 = form.caeSecundario1;
    this.addNewClient.caeSecundario2 = form.caeSecundario2;
    this.addNewClient.caeSecundario3 = form.caeSecundario3;
    this.addNewClient.ramoPrincipal = form.ramoPrincipal;
    this.addNewClient.ramoSecundario1 = form.ramoSecundario1;
    this.addNewClient.ramoSecundario2 = form.ramoSecundario2;
    this.addNewClient.ramoSecundario3 = form.ramoSecundario3;
    this.addNewClient.dataConst = form.dataConst;
    this.addNewClient.paisSedeSocial = form.paisSedeSocial;
    this.addNewClient.localidadeSedeSocial = form.localidadeSedeSocial;
    this.addNewClient.cpSedeSocial = form.cpSedeSocial;
    this.addNewClient.moradaSedeSocial = form.moradaSedeSocial;
    this.addNewClient.franchiseName = form.franchiseName;
    this.addNewClient.groupNIPC = form.groupNIPC;
    this.addNewClient.expectableAnualInvoicing = form.expectableAnualInvoicin;
    this.addNewClient.services = form.services;
    this.addNewClient.transactionsAverage = form.transactionsAverage;
    this.addNewClient.preferenceDocuments = form.preferenceDocuments;
    this.addNewClient.preferenceContacts = form.preferenceContacts;
    this.addNewClient.destinationCountries = form.destinationCountries;
    this.addNewClient.nameClient = form.nameClient;
    this.addNewClient.callingCodeLandClient = form.callingCodeLandClient;
    this.addNewClient.phoneLandClient = form.phoneLandClient;
    this.addNewClient.callingCodeMobileClient = form.callingCodeMobileClient;
    this.addNewClient.mobilePhoneClient = form.mobilePhoneClient;
    this.addNewClient.emailClient = form.emailClient;
    this.addNewClient.callingCodeFaxClient = form.callingCodeFaxClient;
    this.addNewClient.faxClient = form.faxClient;
    this.addNewClient.billingEmail = form.billingEmail;

    console.log(this.addNewClient);

    //Nao esta a ser usado
    this.stringJson = JSON.stringify(this.addNewClient);
    console.log("String json object :", this.stringJson);

    this.http.post<Client>(this.baseUrl + 'BEClients/'+ this.stringJson,this.stringJson).subscribe(result => {
      console.log(result);
    }, error => console.error(error));


  }
}
