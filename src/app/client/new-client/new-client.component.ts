import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Input } from '@angular/core';
import { Inject } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Configuration, configurationToken } from 'src/app/configuration';
import { Client } from '../Client.interface';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-new-client',
  templateUrl: './new-client.component.html'
})
export class NewClientComponent implements OnInit {

  addNewClient: Client = {
    "clientId": "",
    "fiscalId": "",
    "companyName": "",
    "commercialName":"",
    "shortName": "",
    "headquartersAddress": {
      "address": "",
      "postalCode": "",
      "postalArea": "",
      "locality": "",
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
    "byLaws": "",
    "mainEconomicActivity": "",
    "otherEconomicActivities": [""],
    "mainOfficeAddress": {
      "address": "",
      "postalCode": "",
      "postalArea": "",
      "country": "",
      "locality": ""
    },
    "establishmentDate": "2009-12-16",
    "businessGroup": {
      "type": "",
      "branch": ""
    },
    "knowYourSales": {
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
  constructor(private logger : NGXLogger, public bsModalRef: BsModalRef, private router: ActivatedRoute, private http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private route: Router) {
    this.logger.debug(this.addNewClient.clientId);
  }

  ngOnInit(): void {
    this.lastIdClient = Number(this.router.snapshot.params['id']);
    this.addNewClient.clientId = this.lastIdClient;
    this.logger.debug(this.lastIdClient);
  }

  submit(form: any) {

    this.addNewClient.clientId = form.clientId;
    this.addNewClient.crc.code = form.crcCode;
    this.addNewClient.companyName = form.socialDenomination;
    this.addNewClient.legalNature = form.natJuridicaN1;
    this.addNewClient.legalNature2 = form.natJuridicaN2;
    this.addNewClient.mainEconomicActivity = form.caePrincipal;
    // this.addNewClient.mainEconomicActivity = form.categoriaNIPC;
    this.addNewClient.otherEconomicActivities.push(form.caeSecundario1);
    // this.addNewClient.otherEconomicActivities.push({ code: form.caeSecundario2, branch: form.ramoSecundario2 });
    // this.addNewClient.otherEconomicActivities.push({ code: form.caeSecundario3, branch: form.ramoSecundario3 });
    this.addNewClient.mainOfficeAddress.country = form.paisSedeSocial;
    this.addNewClient.mainOfficeAddress.postalArea = form.localidadeSedeSocial;
    this.addNewClient.mainOfficeAddress.postalCode = form.cpSedeSocial;
    this.addNewClient.mainOfficeAddress.address = form.moradaSedeSocial;
    this.addNewClient.knowYourSales.estimatedAnualRevenue = form.expectableAnualInvoicin;
    this.addNewClient.knowYourSales.averageTransactions = form.transactionsAverage;
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

    this.addNewClient.mainEconomicActivity = form.ramoPrincipal;
    this.addNewClient.shareCapital.date = form.dataConst;

    this.logger.debug(this.addNewClient);

    //this.http.post<Client>(this.baseUrl + 'BEClients/', this.addNewClient).subscribe(result => {
    //  this.logger.debug(result);
    //  alert("Comerciante cadastrado com sucesso!!!");
    //  this.route.navigate(['/comprovativos/', this.addNewClient.clientId ]);
    //}, error => console.error(error));

    this.route.navigate(['/comprovativos/', this.addNewClient.clientId]);
  }
}
