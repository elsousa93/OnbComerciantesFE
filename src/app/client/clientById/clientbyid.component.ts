import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Client } from '../Client.interface';
import { TestScheduler } from 'rxjs/testing';
import { continents, countriesAndContinents } from '../countriesAndContinents';
import { CountryInformation, EconomicActivityInformation, LegalNature, SecondLegalNature } from '../../table-info/ITable-info.interface';
import { TableInfoService } from '../../table-info/table-info.service';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-client',
  templateUrl: './clientbyid.component.html'
})

export class ClientByIdComponent implements OnInit {
  
  /*Variable declaration*/
  form: FormGroup;
  myControl = new FormControl('');

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

  clientExists: boolean = false;
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

  initializeFormControls() {
    this.form = new FormGroup({
      commercialSociety: new FormControl('', Validators.required),
      franchiseName: new FormControl(this.client.companyName),
      natJuridicaNIFNIPC: new FormControl('', Validators.required),
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
      natJuridicaN1: new FormControl(this.client.legalNature),
      natJuridicaN2: new FormControl(this.client.legalNature2),
      socialDenomination: new FormControl(''),
      CAE1Branch: new FormControl(this.client.mainEconomicActivity.branch),
      CAESecondary1Branch: new FormControl(this.client.otherEconomicActivities[0].branch),
      CAESecondary2Branch: new FormControl(this.client.otherEconomicActivities[1].branch),

    }); 


    this.form.get("CAE1").valueChanges.subscribe(v => {
      if (v !== '') {
        console.log("cae1 entrou uhjaskaj ;)");
        //this.form.addControl('CAE1Branch', new FormControl('', Validators.required));
        this.form.get('CAE1Branch').addValidators(Validators.required);
      } else {
        console.log("nooooo ujakmskjans ;(");
        //this.form.removeControl('CAE1Branch');
        this.form.get('CAE1Branch').removeValidators(Validators.required);
      }
    });

    this.form.get("CAESecondary1").valueChanges.subscribe(v => {
      if (v !== '') {
        //this.form.addControl('CAESecondary1Branch', new FormControl('', Validators.required));
        this.form.get('CAESecondary1Branch').addValidators(Validators.required);
      } else {
        this.form.removeControl('CAESecondary1Branch');
        this.form.get('CAESecondary1Branch').removeValidators(Validators.required);
      }

      console.log("CAESecondary1 uajnsjnsjnasnbasna");
    });

    this.form.get("CAESecondary2").valueChanges.subscribe(v => {
      if (v !== '') {
        //this.form.addControl('CAESecondary2Branch', new FormControl('', Validators.required));
        this.form.get('CAESecondary2Branch').addValidators(Validators.required);
        
      } else {
        //this.form.removeControl('CAESecondary2Branch');
        this.form.get('CAESecondary2Branch').removeValidators(Validators.required);

      }

      console.log("CAESecondary2 mnsdmsnd,m");
    });

    //this.form.get("CAESecondary3").valueChanges.subscribe(v => {
    //  if (v !== '') {
    //    this.form.addControl('CAESecondary3Branch', new FormControl('', Validators.required));
    //  } else {
    //    this.form.removeControl('CAESecondary3Branch');
    //  }
    //  console.log("CAESecondary3 hbsdhjbsadoqijwoiqjsms");
    //});

    this.form.get("commercialSociety").valueChanges.subscribe(v => {
      if (v === 'true') {
        console.log("entrei");
        this.form.get('crcCode').addValidators(Validators.required);
        this.form.get('socialDenomination').removeValidators(Validators.required);
        this.form.get('natJuridicaN1').removeValidators(Validators.required);
        var a = this.form.get('natJuridicaN1').validator({} as AbstractControl);
        console.log(a);
      } else {
        console.log("false");
        this.form.get('crcCode').removeValidators(Validators.required);
        this.form.get('socialDenomination').setValidators(Validators.required);
        this.form.get('natJuridicaN1').setValidators(Validators.required);
        
        //this.form.addControl('socialDenomination', new FormControl('', Validators.required));
      //  this.form.addControl('natJuridicaN1', new FormControl('', Validators.required));
      }

      console.log("comercial society UASHUASUHASHUAHUS");
    })
  }

  constructor(private router: ActivatedRoute, private http: HttpClient, @Inject('BASE_URL') private baseUrl: string, private route: Router, private tableInfo: TableInfoService) {
    this.ngOnInit();
    this.initializeFormControls();
    if (this.clientId != "-1" || this.clientId != null || this.clientId != undefined) {
      http.get<Client>(baseUrl + 'BEClients/GetClientById/' + this.clientId).subscribe(result => {
        this.clientExists = true;
        this.client = result;
      }, error => console.error(error));
    }
    if (this.route.getCurrentNavigation().extras.state) {
      this.isCompany = this.route.getCurrentNavigation().extras.state["isCompany"];
    }

    //Chamada à API para obter as naturezas juridicas
    this.tableInfo.GetAllLegalNatures().subscribe(result => {
      this.legalNatureList = result;
    }, error => console.log(error));

    //Chamada à API para
    this.tableInfo.GetAllCountries().subscribe(result => {
      this.countryList = result;
    }, error => console.log(error));

    //Chamada à API para obter a lista de CAEs
    this.tableInfo.GetAllCAEs().subscribe(result => {
      this.CAEsList = result;
    });

    //this.createContinentsList();
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



  submit() {
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


    this.client.mainEconomicActivity.branch = this.form.value[""];
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
}
