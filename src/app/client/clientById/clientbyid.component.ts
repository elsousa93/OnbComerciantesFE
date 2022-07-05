import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, OnInit, Output, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Client } from '../Client.interface';
import { TestScheduler } from 'rxjs/testing';
import { continents, countriesAndContinents } from '../countriesAndContinents';
import { CountryInformation, EconomicActivityInformation, LegalNature, SecondLegalNature } from '../../table-info/ITable-info.interface';
import { TableInfoService } from '../../table-info/table-info.service';
import { FormControl } from '@angular/forms';
import { Observable, of, OperatorFunction, pipe, fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, startWith, switchMap, tap } from 'rxjs/operators';
import { Country } from '../../stakeholders/IStakeholders.interface';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead/typeahead-match.class';

@Component({
  selector: 'app-client',
  templateUrl: './clientbyid.component.html'
})

export class ClientByIdComponent implements OnInit {

  @ViewChild('searchInput') input: ElementRef;

  /*Variable declaration*/
  public clientId: string = "0";
  //client: Client = {} as Client;
  client: Client = {
    "clientId": "",
    "fiscalId": "",
    "observations":"",
    "companyName": "",
    "contactName": "",
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

  //Natureza Juridica N1
  legalNatureList: LegalNature[] = [];
  //Natureza Juridica N2
  legalNatureList2: SecondLegalNature[] = [];
  //Paises de destino
  countryList: CountryInformation[] = [];
  continentsList: string[] = [];
  //CAEs
  CAEsList: EconomicActivityInformation[] = [];

  filteredOptions: Observable<CountryInformation[]>;

  myControl = new FormControl('');

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

    
    ////Chamada à API para obter as naturezas juridicas
    //this.tableInfo.GetAllLegalNatures().subscribe(result => {
    //  this.legalNatureList = result;
    //}, error => console.log(error));

    ////Chamada à API para
    //this.tableInfo.GetAllCountries().subscribe(result => {
    //  this.countryList = result;
    //}, error => console.log(error));

    ////Chamada à API para obter a lista de CAEs
    //this.tableInfo.GetAllCAEs().subscribe(result => {
    //  this.CAEsList = result;
    //});

    //this.createContinentsList();

    
  }

  ngOnInit(): void {
    this.clientId = String(this.router.snapshot.params['id']);
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
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
      this.countryList.forEach(c => {
        if (event.target.id == c.continent && this.client.sales.servicesOrProductsDestinations.indexOf(c.description) > -1) {
          var index1 = this.client.sales.servicesOrProductsDestinations.indexOf(c.description);
          this.client.sales.servicesOrProductsDestinations.splice(index1, 1);
        }
      })
    } else {
      this.checkedContinents.push(event.target.id);
      this.countryList.forEach(c => {
        if (event.target.id == c.continent && this.client.sales.servicesOrProductsDestinations.indexOf(c.description) == -1) {
          this.client.sales.servicesOrProductsDestinations.push(c.description);
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
    this.countryList.forEach(c => {
      if (this.client.sales.servicesOrProductsDestinations.indexOf(country) == -1) {
        if (c.description == country) {
          this.client.sales.servicesOrProductsDestinations.push(country);
          this.countryVal = "";
        }
      }
    })
  }

  onLegalNatureSelected() {
    var exists = false;
    this.legalNatureList.forEach(legalNat => {
      if (this.client.legalNature == legalNat.code) {
        exists = true;
        this.legalNatureList2 = legalNat.secondaryNatures;
      }
    })
    if (!exists) {
      this.legalNatureList2 = [];
    }
  }

  createContinentsList() {
    this.countryList.forEach(country => {
      if (this.Continents.length == 0) {
        this.continentsList.push(country.continent);
      } else {
        if (this.continentsList.indexOf(country.continent) == -1) {
          this.continentsList.push(country.continent);
        } else {
          var index = this.continentsList.indexOf(country.continent);
          this.continentsList.splice(index, 1);
        }
      }
    })
  }

  //Fazer a pesquisa dos Paises
  _filter(value: string): CountryInformation[] {
    const filterValue = value.toLowerCase();

    return this.countryList.filter(option => option.description.toLowerCase().includes(filterValue));
  }
  
}
