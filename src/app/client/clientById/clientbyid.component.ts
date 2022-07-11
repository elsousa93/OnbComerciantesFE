import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, OnInit, Output, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Client } from '../Client.interface';
import { TestScheduler } from 'rxjs/testing';
import { continents, countriesAndContinents } from '../countriesAndContinents';
import { CountryInformation, EconomicActivityInformation, LegalNature, SecondLegalNature } from '../../table-info/ITable-info.interface';
import { TableInfoService } from '../../table-info/table-info.service';
import { SubmissionService } from '../../submission/service/submission-service.service'
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
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
  form: FormGroup;
  myControl = new FormControl('');

  public clientId: string = "0";
  
  //client: Client = {} as Client;
  client: Client = {
    "clientId": "444",
    "fiscalId": "444",
    "observations":"nenhuma",
    "companyName": "company",
    "contactName": "manuel",
    "shortName": "comp",
    "headquartersAddress": {
      "address": "Rua António Rebelo",
      "postalCode": "2091-205",
      "postalArea": "UIJKL",
      "locality": "GTYHUJ",
      "country": "Portugal"
    },
    "merchantType": "yhj",
    "legalNature": "teste",
    "legalNature2": "jj",
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
        "code": "3212",
        "branch": ""
    },
    "otherEconomicActivities": [
    {
    "code": "921",
    "branch": ""
    },
    {
    "code": "812",
    "branch": ""
    }
    ],
    "mainOfficeAddress": {
    "address": "jkm",
    "postalCode": "9102-102",
    "postalArea": "hnjkds",
    "country": "Espanha"
    },
    "establishmentDate": "28-05-2015",
    "businessGroup": {
    "type": "uyhujk",
    "fiscalId": "5678"
    },
    "sales": {
    "estimatedAnualRevenue": 1490,
    "averageTransactions": 921,
    "servicesOrProductsSold": [
    "neve",
    ""
    ],
    "servicesOrProductsDestinations": [
    "tyhuj",
    ""
    ]
    },
    "foreignFiscalInformation": {
    "issuerCountry": "iijik",
    "issuanceIndicator": "klklk",
    "fiscalId": "92182",
    "issuanceReason": "jklj"
    },
    "bankInformation": {
    "bank": "kjkj",
    "branch": "lklkkl",
    "iban": "lklk",
    "accountOpenedAt": "09-10-2019"
    },
    "contacts": {
    "preferredMethod": "hjnk",
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
  tempClient: any;

  tipologia: string;

  clientExists: boolean = true;
  crcFound: boolean = false;

  isCommercialSociety: boolean = true;
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

  //TEMPORARIO!!!!
  initializeDefaultClient() {
    this.tempClient = {
      "fiscalId": "585597928",
      "companyName": "SILVESTRE LIMITADA",
      "commercialName": "CAFE CENTRAL",
      "shortName": "SILVESTRE LDA",
      "headquartersAddress": {
        "address": "Rua da Azoia 4",
        "postalCode": "2625-236",
        "postalArea": "Povoa de Santa Iria",
        "locality": "string",
        "country": "PT"
      },
      "merchantType": "COMPANY",
      "legalNature": "35",
      "crc": {
        "code": "0000-0000-0001",
        "validUntil": "2023-06-29T17:52:08.336Z"
      },
      "shareCapital": {
        "capital": 50000.20,
        "date": "2028-06-29T17:52:08.336Z"
      },
      "byLaws": "O Joao pode assinar tudo, like a boss",
      "mainEconomicActivity": "90010",
      "otherEconomicActivities": ["055111"],
      "mainOfficeAddress": {
        "address": "Rua da Azoia 4",
        "postalCode": "2625-236",
        "postalArea": "Povoa de Santa Iria",
        "locality": "string",
        "country": "PT"
      },
      "establishmentDate": "2020-03-01T17:52:08.336Z",
      "knowYourSales": {
        "estimatedAnualRevenue": 1000000,
        "averageTransactions": 30000,
        "servicesOrProductsSold": ["Cafe"],
        "servicesOrProductsDestinations": ["PT"]
      },
      "bankInformation": {
        "bank": "0033",
        "branch": "0000",
        "iban": "PT00333506518874499677629",
        "accountOpenedAt": "2020-06-29T17:52:08.336Z"
      },
      "contacts": {
        "email": "joao@silvestre.pt",
        "phone1": {
          "countryCode": "+351",
          "phoneNumber": "919654422"
        }
      },
      "documentationDeliveryMethod": "MAIL",
      "billingEmail": "joao@silvestre.pt"
    }

  }

  initializeFormControls() {
    console.log("inicializar form controls");
    console.log(this.route.getCurrentNavigation().extras.state["NIFNIPC"]);
    this.form = new FormGroup({
      commercialSociety: new FormControl(true, Validators.required),
      franchiseName: new FormControl(this.client.companyName),
      natJuridicaNIFNIPC: new FormControl(this.route.getCurrentNavigation().extras.state["NIFNIPC"], Validators.required),
      expectableAnualInvoicing: new FormControl(this.client.sales.estimatedAnualRevenue, Validators.required),
      preferenceDocuments: new FormControl(this.client.documentationDeliveryMethod, Validators.required),
      //Pretende associar a grupo/franchise
      services: new FormControl('', Validators.required),
      transactionsAverage: new FormControl(this.client.sales.averageTransactions, Validators.required),
      destinationCountries: new FormControl('', Validators.required),
      CAE1: new FormControl(this.client.mainEconomicActivity.code, Validators.required),
      CAESecondary1: new FormControl(this.client.otherEconomicActivities[0].code),
      CAESecondary2: new FormControl(this.client.otherEconomicActivities[1].code),
      CAESecondary3: new FormControl(''),
      constitutionDate: new FormControl(this.client.establishmentDate),
      address: new FormControl(this.client.mainOfficeAddress.address, Validators.required),
      ZIPCode: new FormControl(this.client.mainOfficeAddress.postalCode, Validators.required),
      location: new FormControl(this.client.mainOfficeAddress.postalArea, Validators.required),
      country: new FormControl(this.client.mainOfficeAddress.country, Validators.required),
      preferenceContacts: new FormControl(this.client.contacts.preferredMethod, Validators.required),
      crcCode: new FormControl('', Validators.required),
      natJuridicaN1: new FormControl({ value: this.client.legalNature, disabled: this.clientExists }),
      natJuridicaN2: new FormControl({ value: this.client.legalNature2, disabled: this.clientExists }),
      socialDenomination: new FormControl(''),
      CAE1Branch: new FormControl(this.client.mainEconomicActivity.branch),
      CAESecondary1Branch: new FormControl(this.client.otherEconomicActivities[0].branch),
      CAESecondary2Branch: new FormControl(this.client.otherEconomicActivities[1].branch),

    });

    //var a = this.form.get('CAE1Branch').validator({} as AbstractControl);
    this.form.updateValueAndValidity();
    

    this.form.get("CAE1").valueChanges.subscribe(v => {
      if (v !== '') {
        this.form.updateValueAndValidity();
      } else {
        this.form.updateValueAndValidity();
      }
    });

    this.form.get("CAESecondary1").valueChanges.subscribe(v => {
      if (v !== '') {
        //this.form.addControl('CAESecondary1Branch', new FormControl('', Validators.required));
        this.form.get('CAESecondary1Branch').addValidators(Validators.required);
      } else {
        this.form.get('CAESecondary1Branch').setErrors({ 'required': false });

      }

      console.log("CAESecondary1 uajnsjnsjnasnbasna");
    });

    this.form.get("CAESecondary2").valueChanges.subscribe(v => {
      if (v !== '') {
        this.form.get('CAESecondary2Branch').addValidators(Validators.required);
      } else {
        this.form.get('CAESecondary2Branch').setErrors({ 'required': false });
      }
    });

    this.form.get("commercialSociety").valueChanges.subscribe(v => {
      if (v === 'true') {
        this.form.get('crcCode').addValidators(Validators.required);
        this.form.get('socialDenomination').setErrors({ 'required': false });
        this.form.get('natJuridicaN1').setErrors({'required': false});
      } else {
        this.form.get('crcCode').setErrors({ 'required': false });
        this.form.get('socialDenomination').setValidators(Validators.required);
        this.form.get('natJuridicaN1').setValidators([Validators.required]);        
        //this.form.addControl('socialDenomination', new FormControl('', Validators.required));
      //  this.form.addControl('natJuridicaN1', new FormControl('', Validators.required));
      }

    })

    console.log(this.form.get('CAE1Branch').errors);
    console.log(this.form.get('CAE1Branch').errors?.['required']);

  }

  getFormValidationErrors() {
    Object.keys(this.form.controls).forEach(key => {
      const controlErrors: ValidationErrors = this.form.get(key).errors;
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach(keyError => {
          console.log('Key control: ' + key + ', keyError: ' + keyError + ', err value: ', controlErrors[keyError]);
        });
      }
    });
  }

  constructor(private router: ActivatedRoute, private http: HttpClient, @Inject('BASE_URL') private baseUrl: string, private route: Router, private tableInfo: TableInfoService, private submissionService: SubmissionService) {
    this.ngOnInit();
    this.initializeFormControls();
    if (this.clientId != "-1" || this.clientId != null || this.clientId != undefined) {
      http.get<Client>(baseUrl + 'BEClients/GetClientById/' + this.clientId).subscribe(result => {
        this.clientExists = true;
        this.client = result;
      }, error => console.error(error));
    }
    if (this.route.getCurrentNavigation().extras.state) {
      //this.isCompany = this.route.getCurrentNavigation().extras.state["isCompany"];
      this.tipologia = this.route.getCurrentNavigation().extras.state["tipologia"];
      console.log(this.tipologia);
    }

    this.initializeDefaultClient();

    
    //Chamada à API para obter as naturezas juridicas
    this.tableInfo.GetAllLegalNatures().subscribe(result => {
      this.legalNatureList = result;
      console.log("JA FOI BUSCAR AS LEGAL NATURES");
    }, error => console.log(error));

    //Chamada à API para
    this.tableInfo.GetAllCountries().subscribe(result => {
      this.countryList = result;
      console.log("JA FOI BUSCAR OS PAISES");
    }, error => console.log(error));

    //Chamada à API para obter a lista de CAEs
    this.tableInfo.GetAllCAEs().subscribe(result => {
      this.CAEsList = result;
      console.log("JA FOI BUSCAR OS CAES");
    });

    this.createContinentsList();

    //Chamada à API para obter a lista de CAEs
    this.tableInfo.GetAllCAEs().subscribe(result => {
      this.CAEsList = result;
    });

    this.getFormValidationErrors();


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

  searchByCRC() {
    var crcInserted = this.form.get('crcCode').value;
    console.log(this.form.get('crcCode'));
    console.log(crcInserted);

    if (crcInserted === '123') {
      this.crcFound = true;
    } else {
      this.crcFound = false;
      console.log("nao encontrado");
    }
  }

  submit() {
    console.log("chegou aqui");
    var formValues = this.form.value;

    this.client.contacts.preferredMethod = this.form.value["preferenceContacts"];
    this.client.documentationDeliveryMethod = this.form.value["preferenceDocuments"];

    this.client.headquartersAddress.address = this.form.value["address"];
    this.client.headquartersAddress.country = this.form.value["country"];
    this.client.headquartersAddress.postalCode = this.form.value["ZIPCode"];
    this.client.headquartersAddress.postalArea = this.form.value["location"];
    this.client.mainEconomicActivity.code = this.form.value["CAE1"];
    this.client.mainEconomicActivity.branch = this.form.value["CAE1Branch"];
    this.client.otherEconomicActivities.push({ code: this.form.value["CAESecondary1"], branch: this.form.value["CAESecondary1Branch"] });
    this.client.otherEconomicActivities.push({ code: this.form.value["CAESecondary2"], branch: this.form.value["CAESecondary2Branch"] });
    this.client.companyName = this.form.value["franchiseName"];
    this.client.sales.estimatedAnualRevenue = this.form.value["expectableAnualInvoicing"];
    this.client.sales.averageTransactions = this.form.value["transactionsAverage"];
    this.client.sales.servicesOrProductsSold.push(this.form.value["services"]);
    //Paises destino
    this.client.establishmentDate = this.form.value["constitutionDate"];
    this.client.crc = this.form.value["crcCode"];
    this.client.legalNature = this.form.value["natJuridicaN1"];

    this.client.fiscalId = this.form.value["natJuridicaNIFNIPC"];
    this.client.companyName = this.form.value["socialDenomination"];
    //Social Denomination


    //this.client.mainEconomicActivity.branch = this.form.value[""];

    console.log(this.client);
    //console.log(this.form.valid);
    //for (const c in this.form.controls) {
    //  console.log(c + "|" + this.form.controls[c].invalid);
    //}

    this.route.navigate(["/comprovativos"]);

  }

  redirectBeginningClient() {
    this.route.navigate(["/client"]);
  }

  redirectHomePage() {
    this.route.navigate(["/"]);
  }

  _filter(value: string): CountryInformation[] {
    const filterValue = value.toLowerCase();

    return this.countryList.filter(option => option.description.toLowerCase().includes(filterValue));
  }
}
