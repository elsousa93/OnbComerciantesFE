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

  //addNewClient: Client = {} as Client
  addNewClient: Client = {
    "clientId": "",
    "fiscalId": "",
    "companyName": "",
    "contactName": "",
    "shortName": "",
    "headquartersAddress": {
      "address": "",
      "postalCode": "",
      "postalArea": "",
      "country": ""
    },
    "merchantType": "",
    "legalNature": "",
    "legalNature2": "",
    "crc": {
      "code": "",
      "validUntil": ""
    },
    "shareCapital": {
      "capital": 0,
      "date": ""
    },
    "bylaws": "",
    "mainEconomicActivity": {
      "code": "",
      "branch": ""
    },
    "otherEconomicActivities": [
      {
        "code": "",
        "branch": ""
      },
      {
        "code": "",
        "branch": ""
      },
      {
        "code": "",
        "branch": ""
      }
    ],
    "mainOfficeAddress": {
      "address": "",
      "postalCode": "",
      "postalArea": "",
      "country": ""
    },
    "establishmentDate": "",
    "businessGroup": {
      "type": "",
      "fiscalId": ""
    },
    "sales": {
      "estimatedAnualRevenue": 0.0,
      "averageTransactions": 0.0,
      "servicesOrProductsSold": [
      ],
      "servicesOrProductsDestinations": [
        
      ]
    },
    "foreignFiscalInformation": {
      "issuerCountry": "",
      "issuanceIndicator": "",
      "fiscalId": "",
      "issuanceReason": ""
    },
    "bankInformation": {
      "bank": "",
      "branch": "",
      "iban": "",
      "accountOpenedAt": ""
    },
    "contacts": {
      "preferredMethod": "",
      "preferredPeriod": {
        "startsAt": "",
        "endsAt": ""
      },
      "phone1": {
        "countryCode": "",
        "phoneNumber": ""
      },
      "phone2": {
        "countryCode": "",
        "phoneNumber": ""
      },
      "fax": {
        "countryCode": "",
        "phoneNumber": ""
      },
      "email": ""
    },
    "documentationDeliveryMethod": "",
    "billingEmail": ""
  };

  stringJson: any;

  constructor(private router: ActivatedRoute, private http: HttpClient, @Inject('BASE_URL') private baseUrl: string, private route: Router) {
    console.log(this.addNewClient.clientId);
  }

  ngOnInit(): void {

  }

  obterComprovativos() {
    //this.route.navigate(['/nav-interna/', "COMPROVATIVOS"]);
    //this.route.navigate(['/comprovativos/', this.clientNr]);
  }

  submit(form: any) {
    console.log(this.addNewClient);
    //this.addNewClient.clientId = form.id;
    //this.addNewClient.merchantType = form.clientTypology;
    ////this.addNewClient.docNr = form.docNr;
    //this.addNewClient.crc.code = form.crcCode;
    //this.addNewClient.companyName = form.socialDenomination;
    //this.addNewClient.legalNature = form.natJuridicaN1;
    ////this.addNewClient.natJuridicaNIFNIPC = form.natJuridicaNIFNIPC;
    //this.addNewClient.legalNature2 = form.natJuridicaN2;
    //this.addNewClient.merchantType = form.categoriaComerciante;
    ////this.addNewClient.categoriaNIPC = form.categoriaNIPC;
    ////this.addNewClient.caePrincipal = form.caePrincipal;
    //this.addNewClient.mainEconomicActivity.code = form.caePrincipal
    //this.addNewClient.mainEconomicActivity.branch = form.categoriaNIPC;
    //this.addNewClient.otherEconomicActivities.push({ code: form.caeSecundario1, branch: form.ramoSecundario1 });
    //this.addNewClient.otherEconomicActivities.push({ code: form.caeSecundario2, branch: form.ramoSecundario2 });
    //this.addNewClient.otherEconomicActivities.push({ code: form.caeSecundario3, branch: form.ramoSecundario3 });
    //this.addNewClient.mainEconomicActivity.branch = form.ramoPrincipal;
    //this.addNewClient.shareCapital.date = form.dataConst;
    //this.addNewClient.mainOfficeAddress.country = form.paisSedeSocial;
    //this.addNewClient.mainOfficeAddress.postalArea = form.localidadeSedeSocial;
    //this.addNewClient.mainOfficeAddress.postalCode = form.cpSedeSocial;
    //this.addNewClient.mainOfficeAddress.address = form.moradaSedeSocial;
    //this.addNewClient.companyName = form.franchiseName;
    ////this.addNewClient.groupNIPC = form.groupNIPC;
    //this.addNewClient.sales.estimatedAnualRevenue = form.expectableAnualInvoicin;

    //console.log(this.addNewClient.sales.servicesOrProductsSold);
    //console.log(form.services);
    //this.addNewClient.sales.servicesOrProductsSold.push(form.services);

    //this.addNewClient.sales.averageTransactions = form.transactionsAverage;
    //this.addNewClient.documentationDeliveryMethod = form.preferenceDocuments;
    //this.addNewClient.contacts.preferredMethod = form.preferenceContacts;
    //this.addNewClient.sales.servicesOrProductsDestinations.push(form.destinationCountries);
    //this.addNewClient.shortName = form.nameClient;
    //this.addNewClient.contacts.phone1.countryCode = form.callingCodeLandClient;
    //this.addNewClient.contacts.phone1.phoneNumber = form.phoneLandClient;
    //this.addNewClient.contacts.phone2.countryCode = form.callingCodeMobileClient;
    //this.addNewClient.contacts.phone2.phoneNumber = form.mobilePhoneClient;
    //this.addNewClient.contacts.email = form.emailClient;
    //this.addNewClient.contacts.fax.countryCode = form.callingCodeFaxClient;
    //this.addNewClient.contacts.fax.phoneNumber = form.faxClient;
    //this.addNewClient.billingEmail = form.billingEmail;

    console.log(this.addNewClient);

    //Nao esta a ser usado
    this.stringJson = JSON.stringify(this.addNewClient);
    console.log("String json object :", this.stringJson);

    this.http.post<Client>(this.baseUrl + 'BEClients/',this.addNewClient).subscribe(result => {
      console.log(result);
    }, error => console.error(error));


  }
}
