import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Input } from '@angular/core';
import { Inject } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Client } from '../Client.interface';

@Component({
  selector: 'app-new-client',
  templateUrl: './new-client.component.html'
})
export class NewClientComponent implements OnInit {

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
      "date": "1966-08-30"
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
    "establishmentDate": "2009-12-16",
    "businessGroup": {
      "type": "",
      "fiscalId": ""
    },
    "sales": {
      "estimatedAnualRevenue": 0,
      "averageTransactions": 0,
      "servicesOrProductsSold": [
        "",
        ""
      ],
      "servicesOrProductsDestinations": [
        "",
        ""
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
      "accountOpenedAt": "2019-06-11"
    },
    "contacts": {
      "preferredMethod": "",
      "preferredPeriod": {
        "startsAt": "22:40:00.450Z",
        "endsAt": "15:42:54.722Z"
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
  lastIdClient: any;
  stringJson: any;

  form: FormGroup;

  //Comerciante cadastrado com sucesso!!
  constructor(public bsModalRef: BsModalRef, private router: ActivatedRoute, private http: HttpClient, @Inject('BASE_URL') private baseUrl: string, private route: Router) {
    console.log(this.addNewClient.clientId);
  }

  ngOnInit(): void {
    this.lastIdClient = Number(this.router.snapshot.params['id']);
    this.addNewClient.clientId = this.lastIdClient;
    console.log(this.lastIdClient);
  }

  submit(form: any) {

    this.addNewClient.clientId = form.clientId;
    this.addNewClient.crc.code = form.crcCode;
    this.addNewClient.companyName = form.socialDenomination;
    this.addNewClient.legalNature = form.natJuridicaN1;
    this.addNewClient.legalNature2 = form.natJuridicaN2;
    this.addNewClient.mainEconomicActivity.code = form.caePrincipal
    this.addNewClient.mainEconomicActivity.branch = form.categoriaNIPC;
    this.addNewClient.otherEconomicActivities.push({ code: form.caeSecundario1, branch: form.ramoSecundario1 });
    this.addNewClient.otherEconomicActivities.push({ code: form.caeSecundario2, branch: form.ramoSecundario2 });
    this.addNewClient.otherEconomicActivities.push({ code: form.caeSecundario3, branch: form.ramoSecundario3 });
    this.addNewClient.mainOfficeAddress.country = form.paisSedeSocial;
    this.addNewClient.mainOfficeAddress.postalArea = form.localidadeSedeSocial;
    this.addNewClient.mainOfficeAddress.postalCode = form.cpSedeSocial;
    this.addNewClient.mainOfficeAddress.address = form.moradaSedeSocial;
    this.addNewClient.sales.estimatedAnualRevenue = form.expectableAnualInvoicin;
    this.addNewClient.sales.averageTransactions = form.transactionsAverage;
    this.addNewClient.documentationDeliveryMethod = form.preferenceDocuments;
    this.addNewClient.contacts.preferredMethod = form.preferenceContacts;
    this.addNewClient.shortName = form.nameClient;
    this.addNewClient.contacts.phone1.countryCode = form.callingCodeLandClient;
    this.addNewClient.contacts.phone1.phoneNumber = form.phoneLandClient;
    this.addNewClient.contacts.phone2.countryCode = form.callingCodeMobileClient;
    this.addNewClient.contacts.phone2.phoneNumber = form.mobilePhoneClient;
    this.addNewClient.contacts.email = form.emailClient;
    this.addNewClient.contacts.fax.countryCode = form.callingCodeFaxClient;
    this.addNewClient.contacts.fax.phoneNumber = form.faxClient;
    this.addNewClient.billingEmail = form.billingEmail;
    this.addNewClient.merchantType = form.categoriaComerciante;

    this.addNewClient.mainEconomicActivity.branch = form.ramoPrincipal;
    this.addNewClient.shareCapital.date = form.dataConst;

    console.log(this.addNewClient);

    //this.http.post<Client>(this.baseUrl + 'BEClients/', this.addNewClient).subscribe(result => {
    //  console.log(result);
    //  alert("Comerciante cadastrado com sucesso!!!");
    //  this.route.navigate(['/comprovativos/', this.addNewClient.clientId ]);
    //}, error => console.error(error));

    this.route.navigate(['/comprovativos/', this.addNewClient.clientId]);
  }
}
