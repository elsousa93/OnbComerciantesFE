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
import { ClientService } from '../client.service';
import { CRCService } from '../../CRC/crcservice.service';
import { CRCProcess } from '../../CRC/crcinterfaces';
import { ProcessService } from '../../process/process.service';
import { DatePipe, formatDate } from '@angular/common';
import { Configuration, configurationToken } from 'src/app/configuration';

@Component({
  selector: 'app-client',
  templateUrl: './clientbyid.component.html',
  providers: [DatePipe]
})

export class ClientByIdComponent implements OnInit {
  lastSize: number = 14;
  processId: string;

  @Input() tipologia: string;
  @ViewChild('searchInput') input: ElementRef;

  /*Variable declaration*/
  form: FormGroup;
  myControl = new FormControl('');

  public clientId: string;
  
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
    "merchantType": "",

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
      "phone1": {
        "countryCode": "",
        "phoneNumber": ""
      },
      "phone2": {
        "countryCode": "",
        "phoneNumber": ""
      },
      "email": ""
    },
    "documentationDeliveryMethod": "",
    "billingEmail": ""
  } as unknown as Client;

  processClient: CRCProcess = {
    capitalStock: {},
    code: '',
    companyName: '',
    mainEconomicActivity: '',
    secondaryEconomicActivity: [],
    expirationDate: '',
    fiscalId: '',
    hasOutstandingFacts: false,
    headquartersAddress: {},
    legalNature: '',
    pdf: '',
    requestId: '',
    stakeholders: []
  };

  tempClient: any;

  crcCode: string;

  clientExists: boolean;
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

  returned: string; //variável para saber se estamos a editar um processo
  merchantInfo: any;
  consult: string; //variavel para saber se estamos a consultar um processo

  associatedWithGroupOrFranchise: boolean = false;
  isAssociatedWithFranchise: boolean;
  NIFNIPC: any;
  idClient: string;

  initializeTableInfo() {
    //Chamada à API para obter as naturezas juridicas
    this.tableInfo.GetAllLegalNatures().subscribe(result => {
      this.legalNatureList = result;
      console.log("FETCH LEGAL NATURES");
      console.log(result);
      console.log(this.legalNatureList);
    }, error => console.log(error));

    //Chamada à API para receber todos os Paises
    this.tableInfo.GetAllCountries().subscribe(result => {
      this.countryList = result;
      console.log("FETCH PAISES");
    }, error => console.log(error));

    //Chamada à API para obter a lista de CAEs
    //this.tableInfo.GetAllCAEs().subscribe(result => {
    //  this.CAEsList = result;
    //  console.log("FETCH OS CAEs");
    //});

    //Chamada à API para obter a lista de CAEs
    //this.tableInfo.GetAllCAEs().subscribe(result => {
    //  this.CAEsList = result;
    //});
  }

  //updateFormControls() {

  //  console.log("durante");
  //  console.log(this.processClient);
  //  var crcCodeInput = this.form.get('crcCode').value;
  //  this.form = new FormGroup({
  //    commercialSociety: new FormControl(null, Validators.required), //sim
  //    franchiseName: new FormControl(this.processClient.companyName), //sim
  //    natJuridicaNIFNIPC: new FormControl(this.NIFNIPC, Validators.required), //sim
  //    //expectableAnualInvoicing: new FormControl(this.client.knowYourSales.estimatedAnualRevenue, Validators.required),
  //    //preferenceDocuments: new FormControl(this.client.documentationDeliveryMethod, Validators.required),
  //    //Pretende associar a grupo/franchise
  //    //services: new FormControl('', Validators.required),
  //    //transactionsAverage: new FormControl(this.client.knowYourSales.averageTransactions, Validators.required),
  //    //destinationCountries: new FormControl('', Validators.required),
  //    CAE1: new FormControl(this.processClient.mainEconomicActivity, Validators.required), //sim
  //    CAESecondary1: new FormControl((this.processClient.secondaryEconomicActivity !== null) ? this.processClient.secondaryEconomicActivity[0] : ''), //sim
  //    CAESecondary2: new FormControl((this.processClient.secondaryEconomicActivity !== null) ? this.processClient.secondaryEconomicActivity[1] : ''), //sim
  //    CAESecondary3: new FormControl((this.processClient.secondaryEconomicActivity !== null) ? this.processClient.secondaryEconomicActivity[2] : ''), //sim
  //    constitutionDate: new FormControl(this.client.establishmentDate), //sim
  //    address: new FormControl(this.processClient.headquartersAddress.address, Validators.required), //sim
  //    ZIPCode: new FormControl(this.processClient.headquartersAddress.postalCode, Validators.required), //sim
  //    location: new FormControl(this.processClient.headquartersAddress.postalArea, Validators.required), //sim
  //    country: new FormControl(this.processClient.headquartersAddress.country, Validators.required), //sim
  //    preferenceContacts: new FormControl(this.client.contacts.preferredMethod, Validators.required),
  //    crcCode: new FormControl(crcCodeInput, [Validators.required]), //sim
  //    natJuridicaN1: new FormControl({ value: this.processClient.legalNature, disabled: this.clientExists }), //sim
  //    natJuridicaN2: new FormControl({ value: this.client.legalNature2, disabled: this.clientExists }), //sim
  //    socialDenomination: new FormControl(this.processClient.companyName, Validators.required), //sim
  //    CAE1Branch: new FormControl(''), //talvez
  //    CAESecondary1Branch: new FormControl(''), //talvez
  //    CAESecondary2Branch: new FormControl(''), //talvez
  //    CAESecondary3Branch: new FormControl(''), //talvez

  //    //merchantType: new FormControl(this.client.merchantType), //talvez
  //    //associatedWithGroupOrFranchise: new FormControl(this.associatedWithGroupOrFranchise), //talvez

  //  });

  //  console.log("pos");
  //  //var a = this.form.get('CAE1Branch').validato
  //}

  initializeENI() {
    console.log("-------- NIFNIPC --------");
    console.log(this.NIFNIPC);
    console.log(this.form.get("natJuridicaNIFNIPC").value);
    this.NIFNIPC = this.form.get("natJuridicaNIFNIPC").value;
    this.form = new FormGroup({
      natJuridicaNIFNIPC: new FormControl({ value: this.NIFNIPC, disabled: (this.NIFNIPC !== '') }, Validators.required),
      socialDenomination: new FormControl((this.returned !== null) ? this.merchantInfo.legalName : '', Validators.required), //sim,
      commercialSociety: new FormControl(this.isCommercialSociety, [Validators.required]), //sim
    });
  }

  initializeBasicCRCFormControl() {
    this.NIFNIPC = this.form.get("natJuridicaNIFNIPC").value;
    this.form = new FormGroup({
      natJuridicaNIFNIPC: new FormControl({ value: this.NIFNIPC, disabled: (this.NIFNIPC !== '') }, Validators.required), //sim
      commercialSociety: new FormControl(this.isCommercialSociety, [Validators.required]), //sim
      crcCode: new FormControl((this.returned != null && this.merchantInfo.incorporationStatement !== undefined) ? this.merchantInfo.incorporationStatement.code : '', [Validators.required]), //sim
    });
  }

  initializeBasicFormControl() {
    this.form = new FormGroup({
      natJuridicaNIFNIPC: new FormControl({ value: this.NIFNIPC, disabled: (this.NIFNIPC !== '') }, Validators.required), //sim
      commercialSociety: new FormControl(this.isCommercialSociety, [Validators.required]), //sim
      //crcCode: new FormControl((this.returned != null && this.merchantInfo.incorporationStatement !== undefined) ? this.merchantInfo.incorporationStatement.code : '', [Validators.required]), //sim
    });

    

    //this.form.get("commercialSociety").valueChanges.subscribe(data => {
    //  console.log("valor mudou commercial society");
    //  console.log(data);
    //  if (data == 'true') {
    //    console.log("true entrou");
    //    this.initializeFormControlCRC();
    //  } else {
    //    console.log("false entrou");
    //    this.initializeFormControlOther();
    //  }
    //});
  }

  searchBranch(code) {
    return this.tableInfo.GetCAEByCode(code).toPromise();
  }

  initializeFormControlOther() {
    console.log("-------- NIFNIPC --------");
    console.log(this.NIFNIPC);
    console.log(this.form.get("natJuridicaNIFNIPC").value);
    this.NIFNIPC = this.form.get("natJuridicaNIFNIPC").value;

    this.form = new FormGroup({
      //commercialSociety: new FormControl('false', [Validators.required]), //sim
      natJuridicaNIFNIPC: new FormControl({ value: this.NIFNIPC, disabled: (this.NIFNIPC !== '') }, Validators.required),
      natJuridicaN1: new FormControl((this.returned !== null) ? this.merchantInfo.legalNature : '', [Validators.required]), //sim
      natJuridicaN2: new FormControl((this.returned !== null) ? this.merchantInfo.legalNature2 : ''), //sim
      socialDenomination: new FormControl((this.returned !== null) ? this.merchantInfo.legalName : '', Validators.required), //sim
      commercialSociety: new FormControl(this.isCommercialSociety, [Validators.required]), //sim
    });

    this.form.get("natJuridicaN1").valueChanges.subscribe(data => {
      
      this.onLegalNatureSelected();

      if (this.legalNatureList2.length > 0)
        this.form.controls["natJuridicaN2"].setValidators([Validators.required]);
      else
        this.form.controls["natJuridicaN2"].clearValidators();
      this.form.controls["natJuridicaN2"].updateValueAndValidity();
    });
  }

  initializeFormControlCRC() {
    console.log("a");
    this.crcCode = this.form.get("crcCode").value;
    console.log(this.processClient.capitalStock.date);
    var b = this.datepipe.transform(this.processClient.capitalStock.date, 'MM-dd-yyyy').toString();
    console.log("data formatada");
    var separated = b.split('-');
    var formatedDate = separated[2] + "-" + separated[1] + "-" + separated[0];
    console.log(formatedDate);
    //var date = formatDate(this.processClient.capitalStock.date, 'MM-dd-yyyy', 'en-US');
    var branch1 = '';

    this.searchBranch(this.processClient.mainEconomicActivity.split("-")[0])
      .then((data) => {
        console.log(data);
        this.form.get("CAE1Branch").setValue(data.description);
      });

    if (this.processClient.secondaryEconomicActivity !== null) {
      this.searchBranch(this.processClient.secondaryEconomicActivity[0].split("-")[0])
        .then((data) => {
          console.log(data);
          this.form.get("CAESecondary1Branch").setValue(data.description);
        });
    }

    console.log("-------- NIFNIPC --------");
    console.log(this.NIFNIPC);
    console.log(this.form.get("natJuridicaNIFNIPC").value);
    this.NIFNIPC = this.form.get("natJuridicaNIFNIPC").value;


    this.form = new FormGroup({
      //commercialSociety: new FormControl('true', [Validators.required]), //sim
      crcCode: new FormControl(this.crcCode, [Validators.required]), //sim
      natJuridicaN1: new FormControl({ value: this.processClient.legalNature, disabled: true/*, disabled: this.clientExists */}, [Validators.required]), //sim
      natJuridicaNIFNIPC: new FormControl(this.NIFNIPC, [Validators.required]), //sim
      natJuridicaN2: new FormControl({ value: this.client.legalNature2, disabled: true/*, disabled: this.clientExists*/ }), //sim
      socialDenomination: new FormControl(this.processClient.companyName, Validators.required), //sim
      CAE1: new FormControl(this.processClient.mainEconomicActivity, Validators.required), //sim
      CAE1Branch: new FormControl(branch1), //talvez
      CAESecondary1: new FormControl((this.processClient.secondaryEconomicActivity !== null) ? this.processClient.secondaryEconomicActivity[0] : ''), //sim
      CAESecondary1Branch: new FormControl(''), //talvez
      CAESecondary2: new FormControl((this.processClient.secondaryEconomicActivity !== null) ? this.processClient.secondaryEconomicActivity[1] : ''), //sim
      CAESecondary2Branch: new FormControl(''), //talvez
      CAESecondary3: new FormControl((this.processClient.secondaryEconomicActivity !== null) ? this.processClient.secondaryEconomicActivity[2] : ''), //sim
      CAESecondary3Branch: new FormControl(''), //talvez
      constitutionDate: new FormControl(formatedDate), //sim this.processClient.capitalStock.date + ''
      country: new FormControl(this.processClient.headquartersAddress.country, Validators.required), //sim
      location: new FormControl(this.processClient.headquartersAddress.postalArea, Validators.required), //sim
      ZIPCode: new FormControl(this.processClient.headquartersAddress.postalCode, Validators.required), //sim
      address: new FormControl(this.processClient.headquartersAddress.address, Validators.required), //sim
      commercialSociety: new FormControl(this.isCommercialSociety, [Validators.required]), //sim
    });
      

    console.log(this.form);
    this.form.get("CAE1").valueChanges.subscribe(data => {
      if (data !== '') {
        this.form.controls["CAE1Branch"].setValidators([Validators.required]);
      } else {
        this.form.controls["CAE1Branch"].clearValidators();
      }
      this.form.controls["CAE1Branch"].updateValueAndValidity();
    });
    console.log("c");
    this.form.get("CAESecondary1").valueChanges.subscribe(data => {
      if (data !== '') {
        this.form.controls["CAESecondary1Branch"].setValidators([Validators.required]);
      } else {
        this.form.controls["CAESecondary1Branch"].clearValidators();
      }
      this.form.controls["CAESecondary1Branch"].updateValueAndValidity();
    });
    console.log("d");
    this.form.get("CAESecondary2").valueChanges.subscribe(data => {
      if (data !== '') {
        this.form.controls["CAESecondary2Branch"].setValidators([Validators.required]);
      } else {
        this.form.controls["CAESecondary2Branch"].clearValidators();
      }
      this.form.controls["CAESecondary2Branch"].updateValueAndValidity();
    });
    console.log("e");
    this.form.get("CAESecondary3").valueChanges.subscribe(data => {
      if (data !== '') {
        this.form.controls["CAESecondary3Branch"].setValidators([Validators.required]);
      } else {
        this.form.controls["CAESecondary3Branch"].clearValidators();
      }
      this.form.controls["CAESecondary3Branch"].updateValueAndValidity();
    });

  }

  initializeFormControls() {
    console.log("inicializar form controls");
    this.initializeBasicFormControl();
    //this.form = new FormGroup({
    //  commercialSociety: new FormControl(null, Validators.required), //sim
    //  franchiseName: new FormControl(this.processClient.companyName), //sim
    //  natJuridicaNIFNIPC: new FormControl(this.NIFNIPC, Validators.required), //sim
    //  CAE1: new FormControl(this.processClient.mainEconomicActivity, Validators.required), //sim
    //  CAESecondary1: new FormControl((this.processClient.secondaryEconomicActivity !== null) ? this.processClient.secondaryEconomicActivity[0] : ''), //sim
    //  CAESecondary2: new FormControl((this.processClient.secondaryEconomicActivity !== null) ? this.processClient.secondaryEconomicActivity[1] : ''), //sim
    //  CAESecondary3: new FormControl((this.processClient.secondaryEconomicActivity !== null) ? this.processClient.secondaryEconomicActivity[2] : ''), //sim
    //  constitutionDate: new FormControl(this.client.establishmentDate), //sim
    //  address: new FormControl(this.processClient.headquartersAddress.address, Validators.required), //sim
    //  ZIPCode: new FormControl(this.processClient.headquartersAddress.postalCode, Validators.required), //sim
    //  location: new FormControl(this.processClient.headquartersAddress.postalArea, Validators.required), //sim
    //  country: new FormControl(this.processClient.headquartersAddress.country, Validators.required), //sim
    //  preferenceContacts: new FormControl(this.client.contacts.preferredMethod, Validators.required),
    //  crcCode: new FormControl('', [Validators.required]), //sim
    //  natJuridicaN1: new FormControl({ value: this.processClient.legalNature, disabled: this.clientExists }), //sim
    //  natJuridicaN2: new FormControl({ value: this.client.legalNature2, disabled: this.clientExists }), //sim
    //  socialDenomination: new FormControl(this.processClient.companyName, Validators.required), //sim
    //  CAE1Branch: new FormControl(''), //talvez
    //  CAESecondary1Branch: new FormControl(''), //talvez
    //  CAESecondary2Branch: new FormControl(''), //talvez
    //  CAESecondary3Branch: new FormControl(''), //talvez

    //  //merchantType: new FormControl(this.client.merchantType), //talvez
    //  //associatedWithGroupOrFranchise: new FormControl(this.associatedWithGroupOrFranchise), //talvez

    //});


    //this.form = new FormGroup({
    //  commercialSociety: new FormControl(null, Validators.required),
    //  franchiseName: new FormControl(''),
    //  natJuridicaNIFNIPC: new FormControl(this.NIFNIPC, Validators.required),
    //  expectableAnualInvoicing: new FormControl(this.client.knowYourSales.estimatedAnualRevenue, Validators.required),
    //  preferenceDocuments: new FormControl(this.client.documentationDeliveryMethod, Validators.required),
    //  //Pretende associar a grupo/franchise
    //  services: new FormControl('', Validators.required),
    //  transactionsAverage: new FormControl(this.client.knowYourSales.averageTransactions, Validators.required),
    //  destinationCountries: new FormControl('', Validators.required),
    //  CAE1: new FormControl('', Validators.required),
    //  CAESecondary1: new FormControl(this.client.otherEconomicActivities[0]),
    //  CAESecondary2: new FormControl(this.client.otherEconomicActivities[1]),
    //  CAESecondary3: new FormControl(''),
    //  constitutionDate: new FormControl(this.client.establishmentDate),
    //  address: new FormControl('', Validators.required),
    //  ZIPCode: new FormControl('', Validators.required),
    //  location: new FormControl('', Validators.required),
    //  country: new FormControl('', Validators.required),
    //  preferenceContacts: new FormControl(this.client.contacts.preferredMethod, Validators.required),
    //  crcCode: new FormControl('', [Validators.required]),
    //  natJuridicaN1: new FormControl({ value: this.client.legalNature, disabled: this.clientExists }),
    //  natJuridicaN2: new FormControl({ value: this.client.legalNature2, disabled: this.clientExists }),
    //  socialDenomination: new FormControl(this.client.shortName, Validators.required),
    //  CAE1Branch: new FormControl(this.client.mainEconomicActivity),
    //  CAESecondary1Branch: new FormControl(this.client.otherEconomicActivities[0]),
    //  CAESecondary2Branch: new FormControl(this.client.otherEconomicActivities[1]),
    //  CAESecondary3Branch: new FormControl(this.client.otherEconomicActivities[2]),

    //  merchantType: new FormControl(this.client.merchantType),
    //  associatedWithGroupOrFranchise: new FormControl(this.associatedWithGroupOrFranchise),
    //  NIPCGroup: new FormControl(/*this.client.businessGroup.fiscalId*/),
    //});
    //var a = this.form.get('CAE1Branch').validator({} as AbstractControl);
    //  this.form.updateValueAndValidity();

    //  this.form.get("crcCode").valueChanges.subscribe(v => {

    //    //var times = v.split('-').length - 1;

    //    //if (times != 2) {
    //    //  if (v.length == 4 || v.length == 9)
    //    //    this.form.get("crcCode").setValue(v + "-");
    //    //}
    //  });

    //  this.form.get("CAE1").valueChanges.subscribe(v => {
    //    if (v !== '') {
    //      this.form.updateValueAndValidity();
    //    } else {
    //      this.form.updateValueAndValidity();
    //    }
    //  });

    //  this.form.get("CAESecondary1").valueChanges.subscribe(v => {
    //    if (v !== '') {
    //      //this.form.addControl('CAESecondary1Branch', new FormControl('', Validators.required));
    //      this.form.get('CAESecondary1Branch').addValidators(Validators.required);
    //    } else {
    //      this.form.get('CAESecondary1Branch').setErrors({ 'required': false });

    //    }

    //    console.log("CAESecondary1");
    //  });

    //  this.form.get("CAESecondary2").valueChanges.subscribe(v => {
    //    if (v !== '') {
    //      this.form.get('CAESecondary2Branch').addValidators(Validators.required);
    //    } else {
    //      this.form.get('CAESecondary2Branch').setErrors({ 'required': false });
    //    }
    //  });

    //  this.form.get("commercialSociety").valueChanges.subscribe(v => {
    //    if (v === 'true') {
    //      this.form.get('crcCode').addValidators(Validators.required);
    //      this.form.get('socialDenomination').setErrors({ 'required': false });
    //      this.form.get('natJuridicaN1').setErrors({'required': false});
    //    } else {
    //      this.form.get('crcCode').setErrors({ 'required': false });
    //      this.form.get('socialDenomination').setValidators(Validators.required);
    //      this.form.get('natJuridicaN1').setValidators([Validators.required]);
    //      //this.form.addControl('socialDenomination', new FormControl('', Validators.required));
    //      //this.form.addControl('natJuridicaN1', new FormControl('', Validators.required));
    //    }

    //  })

    //  console.log(this.form.get('CAE1Branch').errors);
    //  console.log(this.form.get('CAE1Branch').errors?.['required']);

    //  this.form.get("franchiseName").valueChanges.subscribe(v => {
    //    if (v !== '') {
    //      this.isAssociatedWithFranchise = true;
    //    } else {
    //      this.isAssociatedWithFranchise = undefined;
    //    }
    //  })

    //  this.form.get("NIPCGroup").valueChanges.subscribe(v => {
    //    if (v !== null) {
    //      this.isAssociatedWithFranchise = false;
    //    } else {
    //      this.isAssociatedWithFranchise = undefined;
    //    }
    //  })
    //}

    //getFormValidationErrors() {
    //  //Object.keys(this.form.controls).forEach(key => {
    //  //  const controlErrors: ValidationErrors = this.form.get(key).errors;
    //  //  if (controlErrors != null) {
    //  //    Object.keys(controlErrors).forEach(keyError => {
    //  //      console.log('Key control: ' + key + ', keyError: ' + keyError + ', err value: ', controlErrors[keyError]);
    //  //    });
    //  //  }
    //  //});
    //}
  }

  constructor(private datepipe: DatePipe, private router: ActivatedRoute, private http: HttpClient, @Inject(configurationToken) private configuration: Configuration,
    private route: Router, private clientService: ClientService, private tableInfo: TableInfoService, private submissionService: SubmissionService, private data: DataService, private crcService: CRCService, private processService: ProcessService) {
    this.ngOnInit();

    
    //Gets Tipologia from the Client component 
    if (this.route.getCurrentNavigation().extras.state) {
      //this.isCompany = this.route.getCurrentNavigation().extras.state["isCompany"];
      this.tipologia = this.route.getCurrentNavigation().extras.state["tipologia"];
      this.clientExists = this.route.getCurrentNavigation().extras.state["clientExists"];
      this.NIFNIPC = this.route.getCurrentNavigation().extras.state["NIFNIPC"];
      this.clientId = this.route.getCurrentNavigation().extras.state["clientId"];
      console.log("------------");
      console.log(this.processId);
      console.log("------------");
    }

    if (this.clientId != "-1" || this.clientId != null || this.clientId != undefined) {
      clientService.getClientByID(this.clientId, "6db0b920-3de4-431a-92c7-2c476784ed9a", "2").subscribe(result => {
        this.clientExists = true;
        this.client = result;
        console.log(this.client);
      })
    }

    
    this.initializeTableInfo();
    //this.createContinentsList();

    console.log(this.clientExists);

    if (this.returned !== null) {
      this.submissionService.GetSubmissionByProcessNumber(localStorage.getItem("processNumber")).subscribe(result => {
        console.log('Submissão retornada quando pesquisada pelo número de processo', result);
        this.submissionService.GetSubmissionByID(result[0].submissionId).subscribe(resul => {
          console.log('Submissão com detalhes mais especificos ', resul);
          this.clientService.GetClientById(resul.id).subscribe(res => {
            this.merchantInfo = res;
            console.log(this.merchantInfo);
            console.log("antes do log dno nifnipc undefined");
            console.log(this.NIFNIPC);
            if (this.NIFNIPC === undefined) {
              this.NIFNIPC = this.merchantInfo.fiscalId;
              console.log("NIFNIPC estava undefined");
              console.log(this.NIFNIPC);
            }
            console.log("O valor do NIFNIPC quando estamos no consult ", this.NIFNIPC);
              if (this.merchantInfo.incorporationStatement !== null) {
                console.log("O merchantInfo tem uma crc com valor ", this.merchantInfo.incorporationStatement.code);
                this.isCommercialSociety = true;
                this.initializeBasicCRCFormControl();
                this.searchByCRC(); 
              } else {
                if (this.merchantInfo.legalNature !== "") {
                  console.log("O merchant tem uma legal nature ", this.merchantInfo.legalNature);
                  this.isCommercialSociety = false;
                  this.tipologia === 'Company';
                  this.initializeFormControlOther();
                } else {
                  console.log("O merchant não tem uma legal nature");
                  this.isCommercialSociety = false;
                  this.tipologia === 'ENI';
                  this.initializeENI();
                }
              }
          });
        });
      });
    }


      
    }

   //fim do construtor

  ngOnInit(): void {
    // this.clientId = String(this.router.snapshot.params['id']);

    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
    this.initializeFormControls();

    console.log(this.form);
    console.log(this.form.errors);
    console.log(this.form.validator);
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    this.data.updateData(false, 1, 2);

    this.returned = localStorage.getItem("returned");
  }


  setCommercialSociety(id: boolean) {
    this.crcFound = false;
    if (id == true) {
      this.initializeBasicCRCFormControl();
      this.isCommercialSociety = true;
      this.form.get("commercialSociety").setValue(true);
      console.log("entrou no true");
    } else {
      if (this.tipologia === 'Company')
        this.initializeFormControlOther();
      else
        this.initializeENI();
      this.isCommercialSociety = false;
      this.form.get("commercialSociety").setValue(false);
      console.log("entrou no false");
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
    console.log("entrou no legalnatureselected");

    console.log(this.legalNatureList);
    this.legalNatureList.forEach(legalNat => {
      var legalNatureToSearch = this.form.get('natJuridicaN1').value;
      console.log(legalNatureToSearch);
      if (legalNatureToSearch == legalNat.code) {
        console.log("chegou aqui");
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
    //var crcInserted = this.form.get('crcCode');
    //console.log("codigo CRC:" , this.form.get('crcCode').value);
    //console.log(crcInserted);
    //this.crcFound = true;
    console.log("crc search inserido");
    var crcInserted = this.form.get('crcCode').value;
    console.log(crcInserted);
     console.log("---- teste ----");
     this.crcService.getCRC(crcInserted, '001').subscribe(o => {
        console.log("get crc!!!!");
        console.log(o);
        console.log("obtido");
        var clientByCRC = o;

        this.crcFound = true;
        this.processClient.legalNature = clientByCRC.legalNature;
        this.processClient.mainEconomicActivity = clientByCRC.economicActivity.main;
        this.processClient.secondaryEconomicActivity = clientByCRC.economicActivity.secondary;

        this.processClient.fiscalId = clientByCRC.fiscalId;
        this.processClient.companyName = clientByCRC.companyName;

        this.processClient.capitalStock.date = clientByCRC.capitalStock.date;
        this.processClient.capitalStock.capital = clientByCRC.capitalStock.amount;

        this.processClient.headquartersAddress.address = clientByCRC.headquartersAddress.fullAddress;
        this.processClient.headquartersAddress.locality = clientByCRC.headquartersAddress.parish;
        this.processClient.headquartersAddress.postalCode = clientByCRC.headquartersAddress.postalCode;
        this.processClient.headquartersAddress.postalArea = clientByCRC.headquartersAddress.district;
        this.processClient.headquartersAddress.country = clientByCRC.headquartersAddress.country;

        this.processClient.expirationDate = clientByCRC.expirationDate;
        this.processClient.hasOutstandingFacts = clientByCRC.hasOutstandingFacts;

        this.processClient.stakeholders = clientByCRC.stakeholders;

        this.processClient.pdf = clientByCRC.pdf;

        this.processClient.code = clientByCRC.code;
        this.processClient.requestId = clientByCRC.requestId;

        console.log("o crc chamou o initialize");
        this.initializeFormControlCRC();
      });
    

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

  //getPaisSedeSocial() {
  //  console.log(this.form.get('headquartersAddress.country').value);
  //  console.log(this.form.get('headquartersAddress.country'));

  //  return this.form.get('headquartersAddress.country').value;
  //}


  submit() {

    var formValues = this.form.value;
    if (this.isCommercialSociety) {
      this.client.headquartersAddress = {
        address: this.form.value["address"],
        country: this.form.value["country"],
        postalCode: this.form.value["ZIPCode"],
        postalArea: this.form.value["location"]
      }
      //this.client.headquartersAddress.address = this.form.value["address"];
      //this.client.headquartersAddress.country = this.form.value["country"];
      //this.client.headquartersAddress.postalCode = this.form.value["ZIPCode"];
      //this.client.headquartersAddress.postalArea = this.form.value["location"];
      this.client.mainEconomicActivity = this.form.value["CAE1"];
      this.client.otherEconomicActivities.push(this.form.value["CAESecondary1"], this.form.value["CAESecondary1Branch"]);
      this.client.otherEconomicActivities.push(this.form.value["CAESecondary2"], this.form.value["CAESecondary2Branch"]);
      //Paises destino
      this.client.establishmentDate = this.form.value["constitutionDate"];
      //this.client.crc.code = this.form.value["crcCode"];
      this.client.crc = {
        code: this.form.value["crcCode"]
      }
      this.client.legalNature = this.form.value["natJuridicaN1"];

      this.client.fiscalId = this.form.value["natJuridicaNIFNIPC"];
      this.client.companyName = this.form.value["socialDenomination"];
    } else {
      if (this.tipologia === 'Company') {
        this.client.legalNature = this.form.value["natJuridicaN1"];
        this.client.legalNature2 = this.form.value["natJuridicaN2"];
      }
      this.client.companyName = this.form.value["socialDenomination"];
    }

    ////Social Denomination

    //this.client.merchantType = this.tipologia;

    //if (this.associatedWithGroupOrFranchise) {
    //  this.client.companyName = this.form.value["franchiseName"];
    //  //this.client.businessGroup.fiscalId = this.form.value["NIPCGroup"]; //deve ter de ser alterado
    //}
    console.log("Stakeholders a passar!! ");
    console.log(this.processClient.stakeholders);
    let navigationExtras: NavigationExtras = {
      state: {
        clientExists: this.clientExists,
        tipologia: this.tipologia,
        NIFNIPC: this.NIFNIPC,
        client: this.client,
        clientId: this.idClient,
        processId: this.processId,
        stakeholders: this.processClient.stakeholders,
        merchantInfo: this.merchantInfo,
        crc: (this.crcFound) ? this.processClient : null,
        crcCode: this.processClient.code
      }
    };

    
    //this.processService.createMerchant(this.client, this.processId, "por mudar", "por mudar").subscribe(o => {
    //  console.log("sucesso");
    //}, error => {
    //  console.log(error);
    //});


    if(this.form.valid)
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

  GetCountryByZipCode() {
    var zipcode = this.form.value['ZIPCode'];
    if (zipcode.length === 8) {
      var zipCode = zipcode.split('-');

      this.tableInfo.GetAddressByZipCode(Number(zipCode[0]), Number(zipCode[1])).subscribe(address => {
        
        var addressToShow = address[0];

        this.form.get('address').setValue(addressToShow.address);
        this.form.get('country').setValue(addressToShow.country);
        this.form.get('location').setValue(addressToShow.postalArea);
      });
    }
  }

  GetCAEByCode() {
    var cae = this.form.value["CAE1"];

    //var caeResult = this.tableInfo.GetCAEByCode(cae);
  }

  GetLegalNatureByCode(code: string) {
    var legalNature = this.legalNatureList.find(element => {
      if (element.code == code) {
        return true;
      } else {
        return false;
      }
    });
    return legalNature.description;
  }
}
