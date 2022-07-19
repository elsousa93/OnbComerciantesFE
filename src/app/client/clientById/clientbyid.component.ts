import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Client } from '../Client.interface';
import { TestScheduler } from 'rxjs/testing';
import { continents, countriesAndContinents } from '../countriesAndContinents';
import { CountryInformation, EconomicActivityInformation, LegalNature, SecondLegalNature } from '../../table-info/ITable-info.interface';
import { TableInfoService } from '../../table-info/table-info.service';
import { SubmissionService } from '../../submission/service/submission-service.service'
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Observable, of, OperatorFunction, pipe, fromEvent, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, startWith, switchMap, tap } from 'rxjs/operators';
import { Country } from '../../stakeholders/IStakeholders.interface';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead/typeahead-match.class';
import { DataService } from '../../nav-menu-interna/data.service';

@Component({
  selector: 'app-client',
  templateUrl: './clientbyid.component.html'
})

export class ClientByIdComponent implements OnInit {
  lastSize: number = 14;

  @Input() tipologia: string;
  @ViewChild('searchInput') input: ElementRef;

  /*Variable declaration*/
  form: FormGroup;
  myControl = new FormControl('');

  public clientId: string = "0";
  
  //client: Client = {} as Client;
  public client: Client = {
    "clientId": "22181900000011",
    "fiscalId": "22181900000011",
    "companyName": "SILVESTRE LIMITADA",
    "commercialName":"CAFE CENTRAL",
    "shortName": "SILVESTRE LDA",
    "headquartersAddress": {
      "address": "Rua da Azoia 4",
      "postalCode": "2625-236",
      "postalArea": "Povoa de Santa Iria",
      "locality": "Lisboa",
      "country": "PT"
    },
    "merchantType": "Company",

    "legalNature": {
      "code": "06",
      "description": "Organismo de Administração Pública"
    },
    "legalNature2": "01",
    "crc": {
      "code": "123",
      "validUntil": "2023-06-29T17:52:08.336Z"
    },
    "shareCapital": {
      "capital": 0,
      "date": "1966-08-30"
    },
    "byLaws": "O Joao pode assinar tudo",
    "mainOfficeAddress": {
      "address": "Rua da Azoia 4",
      "postalCode": "2625-236",
      "postalArea": "Povoa de Santa Iria",
      "locality": "Lisboa",
      "country": "PT"
    },
    "otherEconomicActivities": [""],

    "establishmentDate": "2009-12-16",
    "businessGroup": {
      "type": "",
      "fiscalId": ""
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
  } as unknown as Client;
  tempClient: any;


  clientExists: boolean = true;
  crcFound: boolean = false;

  isCommercialSociety: boolean = null;
  isCompany: boolean;
  Countries = countriesAndContinents;
  Continents = continents;
  checkedContinents = []; // posso manter esta variavel para os continentes selecionados
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

  public map = new Map();
  public currentPage: number;
  public subscription: Subscription;

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

  associatedWithGroupOrFranchise: boolean = false;
  isAssociatedWithFranchise: boolean;

  NIFNIPC: any;

  initializeFormControls() {
    console.log("inicializar form controls");
    console.log(this.route.getCurrentNavigation().extras.state["NIFNIPC"]);
    this.form = new FormGroup({
      commercialSociety: new FormControl(null, Validators.required),
      franchiseName: new FormControl(this.client.companyName),
      natJuridicaNIFNIPC: new FormControl(this.route.getCurrentNavigation().extras.state["NIFNIPC"], Validators.required),
      expectableAnualInvoicing: new FormControl(this.client.knowYourSales.estimatedAnualRevenue, Validators.required),
      preferenceDocuments: new FormControl(this.client.documentationDeliveryMethod, Validators.required),
      //Pretende associar a grupo/franchise
      services: new FormControl('', Validators.required),
      transactionsAverage: new FormControl(this.client.knowYourSales.averageTransactions, Validators.required),
      destinationCountries: new FormControl('', Validators.required),
      CAE1: new FormControl(this.client.mainEconomicActivity, Validators.required),
      CAESecondary1: new FormControl(this.client.otherEconomicActivities[0]),
      CAESecondary2: new FormControl(this.client.otherEconomicActivities[1]),
      CAESecondary3: new FormControl(''),
      constitutionDate: new FormControl(this.client.establishmentDate),
      address: new FormControl(this.client.headquartersAddress.address, Validators.required),
      ZIPCode: new FormControl(this.client.headquartersAddress.postalCode, Validators.required),
      location: new FormControl(this.client.headquartersAddress.postalArea, Validators.required),
      country: new FormControl(this.client.headquartersAddress.country, Validators.required),
      preferenceContacts: new FormControl(this.client.contacts.preferredMethod, Validators.required),
      crcCode: new FormControl('', [Validators.required]),
      natJuridicaN1: new FormControl({ value: this.client.legalNature, disabled: this.clientExists }),
      natJuridicaN2: new FormControl({ value: this.client.legalNature2, disabled: this.clientExists }),
      socialDenomination: new FormControl(this.client.shortName, Validators.required),
      CAE1Branch: new FormControl(this.client.mainEconomicActivity),
      CAESecondary1Branch: new FormControl(this.client.otherEconomicActivities[0]),
      CAESecondary2Branch: new FormControl(this.client.otherEconomicActivities[1]),
      CAESecondary3Branch: new FormControl(this.client.otherEconomicActivities[2]),

      merchantType: new FormControl(this.client.merchantType),
      associatedWithGroupOrFranchise: new FormControl(this.associatedWithGroupOrFranchise),
      NIPCGroup: new FormControl(this.client.businessGroup.fiscalId),

    });
    //var a = this.form.get('CAE1Branch').validator({} as AbstractControl);
    this.form.updateValueAndValidity();

    this.form.get("crcCode").valueChanges.subscribe(v => {

      var times = v.split('-').length - 1;

      if (times != 2) {
        if (v.length == 4 || v.length == 9)
          this.form.get("crcCode").setValue(v + "-");
      }
    });

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

      console.log("CAESecondary1");
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
        //this.form.addControl('natJuridicaN1', new FormControl('', Validators.required));
      }

    })

    console.log(this.form.get('CAE1Branch').errors);
    console.log(this.form.get('CAE1Branch').errors?.['required']);

    this.form.get("franchiseName").valueChanges.subscribe(v => {
      if (v !== '') {
        this.isAssociatedWithFranchise = true;
      } else {
        this.isAssociatedWithFranchise = undefined;
      }
    })

    this.form.get("NIPCGroup").valueChanges.subscribe(v => {
      if (v !== null) {
        this.isAssociatedWithFranchise = false;
      } else {
        this.isAssociatedWithFranchise = undefined;
      }
    })
  }

  getFormValidationErrors() {
    //Object.keys(this.form.controls).forEach(key => {
    //  const controlErrors: ValidationErrors = this.form.get(key).errors;
    //  if (controlErrors != null) {
    //    Object.keys(controlErrors).forEach(keyError => {
    //      console.log('Key control: ' + key + ', keyError: ' + keyError + ', err value: ', controlErrors[keyError]);
    //    });
    //  }
    //});
  }

  constructor(private router: ActivatedRoute, private http: HttpClient, @Inject('BASE_URL') private baseUrl: string,
    private route: Router, private tableInfo: TableInfoService, private submissionService: SubmissionService, private data: DataService) {
    this.ngOnInit();
    if (this.clientId != "-1" || this.clientId != null || this.clientId != undefined) {
      http.get<Client>(baseUrl + 'BEClients/GetClientById/' + this.clientId).subscribe(result => {
        this.clientExists = true;
        this.client = result;
      }, error => console.error(error));
    }
    //Gets Tipologia from the Client component 
    if (this.route.getCurrentNavigation().extras.state) {
      //this.isCompany = this.route.getCurrentNavigation().extras.state["isCompany"];
      this.tipologia = this.route.getCurrentNavigation().extras.state["tipologia"];
      this.NIFNIPC = this.route.getCurrentNavigation().extras.state["NIFNIPC"]
      console.log(this.tipologia);
    }
    this.initializeDefaultClient();
    
    //Chamada à API para obter as naturezas juridicas
    this.tableInfo.GetAllLegalNatures().subscribe(result => {
      this.legalNatureList = result;
      console.log("FETCH LEGAL NATURES");
      console.log(result);
    }, error => console.log(error));

    //Chamada à API para receber todos os Paises
    this.tableInfo.GetAllCountries().subscribe(result => {
      this.countryList = result;
      console.log("FETCH PAISES");
    }, error => console.log(error));

    //Chamada à API para obter a lista de CAEs
    this.tableInfo.GetAllCAEs().subscribe(result => {
      this.CAEsList = result;
      console.log("FETCH OS CAEs");
    });
    this.createContinentsList();

    //Chamada à API para obter a lista de CAEs
    this.tableInfo.GetAllCAEs().subscribe(result => {
      this.CAEsList = result;
    });
    this.getFormValidationErrors();
    //this.createContinentsList();
  } //fim do construtor

  ngOnInit(): void {
    this.clientId = String(this.router.snapshot.params['id']);
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
    this.initializeFormControls();
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
  }

  //função que altera o valor do map e da currentPage
  updateData(value: boolean, currentPage: number) {
    this.map.set(currentPage, value);
    this.data.changeData(this.map);
    this.data.changeCurrentPage(currentPage);
  }

  setCommercialSociety(id: boolean) {
    this.crcFound = false;
    if (id == true) {
      this.isCommercialSociety = true
    } else {
      this.isCommercialSociety = false
    }
  }

  getCommercialSociety() {
    return this.isCommercialSociety;
  }
 
  continentSelected(event) {
    if (this.checkedContinents.indexOf(event.target.id) > -1) {
      var index = this.checkedContinents.indexOf(event.target.id);
      this.checkedContinents.splice(index, 1);
      this.countryList.forEach(c => {
        if (event.target.id == c.continent && this.client.knowYourSales.servicesOrProductsDestinations.indexOf(c.description) > -1) {
          var index1 = this.client.knowYourSales.servicesOrProductsDestinations.indexOf(c.description);
          this.client.knowYourSales.servicesOrProductsDestinations.splice(index1, 1);
        }
      })
    } else {
      this.checkedContinents.push(event.target.id);
      this.countryList.forEach(c => {
        if (event.target.id == c.continent && this.client.knowYourSales.servicesOrProductsDestinations.indexOf(c.description) == -1) {
          this.client.knowYourSales.servicesOrProductsDestinations.push(c.description);
        }
      })
    }
  }

  onCountryChange(event) {
    if (this.client.knowYourSales.servicesOrProductsDestinations.indexOf(event.target.id) > -1) {
      var index = this.client.knowYourSales.servicesOrProductsDestinations.indexOf(event.target.id);
      this.client.knowYourSales.servicesOrProductsDestinations.splice(index, 1);
    } else {
      this.client.knowYourSales.servicesOrProductsDestinations.push(event.target.id);
    }
  }

  addCountryToList(country: string) {
    this.countryList.forEach(c => {
      if (this.client.knowYourSales.servicesOrProductsDestinations.indexOf(country) == -1) {
        if (c.description == country) {
          this.client.knowYourSales.servicesOrProductsDestinations.push(country);
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
      if (this.continentsList.length == 0) {
        this.continentsList.push(country.continent);
      } else {
        if (this.continentsList.indexOf(country.continent) == -1) {
          this.continentsList.push(country.continent);
        }
        // else {
        //  var index = this.continentsList.indexOf(country.continent);
        //  this.continentsList.splice(index, 1);
        //}
      }
    })
  }

  searchByCRC() {
    var crcInserted = this.form.get('crcCode');
    console.log("codigo CRC:" , this.form.get('crcCode').value);
    console.log(crcInserted);

    //if (crcInserted === '123') {
    //  this.crcFound = true;
    //  console.log("-Crc true-: ", this.crcFound);
    //  console.log("-isCommercialSociety true-: ", this.isCommercialSociety);
    //} else {
    //  console.log("--");
    //}
  }
  getCrcCode() {
    return this.form.get('crcCode').value;
  }

  getPaisSedeSocial() {
    console.log(this.form.get('headquartersAddress.country').value);
    console.log(this.form.get('headquartersAddress.country'));

    return this.form.get('headquartersAddress.country').value;
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
    this.client.mainEconomicActivity = this.form.value["CAE1"];
    this.client.mainEconomicActivity = this.form.value["CAE1Branch"];
    this.client.otherEconomicActivities.push(this.form.value["CAESecondary1"], this.form.value["CAESecondary1Branch"]);
    this.client.otherEconomicActivities.push(this.form.value["CAESecondary2"], this.form.value["CAESecondary2Branch"]);
    this.client.companyName = this.form.value["franchiseName"];
    this.client.knowYourSales.estimatedAnualRevenue = this.form.value["expectableAnualInvoicing"];
    this.client.knowYourSales.averageTransactions = this.form.value["transactionsAverage"];
    this.client.knowYourSales.servicesOrProductsSold.push(this.form.value["services"]);
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

    if (this.associatedWithGroupOrFranchise) {
      this.client.companyName = this.form.value["franchiseName"];
      this.client.businessGroup.fiscalId = this.form.value["NIPCGroup"]; //deve ter de ser alterado
    }

    let navigationExtras: NavigationExtras = {
      state: {
        clientExists: this.clientExists,
        tipologia: this.tipologia,
        NIFNIPC :this.NIFNIPC
      }
    };

    this.route.navigate(["/client-additional-info/", this.router.snapshot.paramMap.get('id')], navigationExtras);
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

  setAssociatedWith(value: boolean) {
    if (value == true) {
      this.associatedWithGroupOrFranchise = true;
    } else {
      this.associatedWithGroupOrFranchise = false;
    }
  }
}
