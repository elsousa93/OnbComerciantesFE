import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Client } from '../Client.interface';
import { TestScheduler } from 'rxjs/testing';
import { continents, countriesAndContinents } from '../countriesAndContinents';
import { LegalNature } from '../../table-info/ITable-info.interface';
import { TableInfoService } from '../../table-info/table-info.service';

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
  countryVal: string;

  legalNatureList: LegalNature[] = [];

  constructor(private router: ActivatedRoute, private http: HttpClient, @Inject('BASE_URL') private baseUrl: string, private route: Router, private tableInfo: TableInfoService) {
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

    //Chamada à API para obter as naturezas juridicas
    tableInfo.GetAllLegalNatures().subscribe(result => {
      console.log(result);
      this.legalNatureList = result;
    }, error => console.log(error));
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
      this.Countries.forEach(c => {
        if (event.target.id == c.continent && this.client.sales.servicesOrProductsDestinations.indexOf(c.country) > -1) {
          var index1 = this.client.sales.servicesOrProductsDestinations.indexOf(c.country);
          this.client.sales.servicesOrProductsDestinations.splice(index1, 1);
        }
      })
    } else {
      this.checkedContinents.push(event.target.id);
      this.Countries.forEach(c => {
        if (event.target.id == c.continent && this.client.sales.servicesOrProductsDestinations.indexOf(c.country) == -1) {
          this.client.sales.servicesOrProductsDestinations.push(c.country);
        }
      })
    }
  }

  onCountryChange(event) {
    if (this.client.sales.servicesOrProductsDestinations.indexOf(event.target.id) > -1) {
      var index = this.client.sales.servicesOrProductsDestinations.indexOf(event.target.id);
      this.client.sales.servicesOrProductsDestinations.splice(index, 1);
    } else {
      this.client.sales.servicesOrProductsDestinations.push(event.target.id);
    }
  }

  addCountryToList(country: string) {
    this.Countries.forEach(c => {
      if (this.client.sales.servicesOrProductsDestinations.indexOf(country) == -1) {
        if (c.country == country) {
          this.client.sales.servicesOrProductsDestinations.push(country);
          this.countryVal = "";
        }
      }
    })
  }
}
