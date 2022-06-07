import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Client } from '../Client.interface';
import { TestScheduler } from 'rxjs/testing';
import { continents, countriesAndContinents } from '../countriesAndContinents';


@Component({
  selector: 'app-client',
  templateUrl: './clientbyid.component.html'
})

export class ClientByIdComponent implements OnInit {
  
  /*Variable declaration*/
  public clientId: string = "0";
  //client: Client = {} as Client;
  client: Client = {
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

  isCommercialSociety: boolean;
  isCompany: boolean;
  Countries = countriesAndContinents;
  Continents = continents;
  checkedContinents = [];

  constructor(private router: ActivatedRoute, private http: HttpClient, @Inject('BASE_URL') private baseUrl: string, private route: Router) {
    this.ngOnInit();
    if (this.clientId != "-1" || this.clientId != null || this.clientId != undefined) {
      http.get<Client>(baseUrl + 'BEClients/GetClientById/' + this.clientId).subscribe(result => {
        this.client = result;
        console.log(this.client)
      }, error => console.error(error));
    }
    if (this.route.getCurrentNavigation().extras.state) {
      this.isCompany = this.route.getCurrentNavigation().extras.state["isCompany"];
    }
  }
  
  ngOnInit(): void {
    this.clientId = String(this.router.snapshot.params['id']);
    
  }

  obterComprovativos(){
    //this.route.navigate(['/nav-interna/', "COMPROVATIVOS" ]);
    this.route.navigate(['/comprovativos/', this.clientId ]);
  }

  setCommercialSociety(id: boolean) {
    if (id == true) {
      this.isCommercialSociety = true
    } else {
      this.isCommercialSociety = false
    }
  }

  continentSelected(event) {
    if (this.checkedContinents.indexOf(event.target.id) > -1) {
      var index = this.checkedContinents.indexOf(event.target.id);
      this.checkedContinents.splice(index, 1);
    } else {
      this.checkedContinents.push(event.target.id);
    }
  }

  onCountryChange(event) {
    console.log(this.client);
    if (this.client.sales.servicesOrProductsDestinations.indexOf(event.target.id) > -1) {
      var index = this.client.sales.servicesOrProductsDestinations.indexOf(event.target.id);
      this.client.sales.servicesOrProductsDestinations.splice(index, 1);
    } else {
      this.client.sales.servicesOrProductsDestinations.push(event.target.id);
    }
    console.log(this.client.sales.servicesOrProductsDestinations);
  }
}
