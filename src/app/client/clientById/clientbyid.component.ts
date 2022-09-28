import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Client, OutboundClient } from '../Client.interface';
import { TestScheduler } from 'rxjs/testing';
import { continents, countriesAndContinents } from '../countriesAndContinents';
import { CountryInformation, EconomicActivityInformation, LegalNature, SecondLegalNature } from '../../table-info/ITable-info.interface';
import { TableInfoService } from '../../table-info/table-info.service';
import { SubmissionService } from '../../submission/service/submission-service.service'
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormGroupDirective, ValidationErrors, Validators } from '@angular/forms';
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
import { LoggerService } from 'src/app/logger.service';
import { FileAndDetailsCC } from '../../readcard/fileAndDetailsCC.interface';
import { ClientContext } from './clientById.model';
import { ClientCharacterizationComponent } from '../clientCharacterization/clientcharacterization.component';
import { CountrysComponent } from 'src/app/countrys/countrys.component';
import { RepresentationPowerComponent } from '../representation-power/representation-power.component';
import { SubmissionDocumentService } from '../../submission/document/submission-document.service';
import { StakeholderService } from '../../stakeholders/stakeholder.service';
import { ProcessNumberService } from '../../nav-menu-presencial/process-number.service';
import { StoreService } from '../../store/store.service';
import { ShopDetailsAcquiring } from '../../store/IStore.interface';


@Component({
  selector: 'app-client',
  templateUrl: './clientbyid.component.html',
  providers: [DatePipe]
})

export class ClientByIdComponent implements OnInit {
  lastSize: number = 14;
  processId: string;
  tipologia: string;

  @ViewChild('searchInput') input: ElementRef;
  @ViewChild(ClientCharacterizationComponent) clientCharacterizationComponent: ClientCharacterizationComponent;
  @ViewChild(CountrysComponent) countriesComponent: ClientCharacterizationComponent;
  @ViewChild(RepresentationPowerComponent) representationPowerComponent: ClientCharacterizationComponent;

  /*Variable declaration*/
  form: FormGroup;
  myControl = new FormControl('');
  clientContext: ClientContext;

  errorMsg: string = "";

  public clientId: string;
  
  //client: Client = {} as Client;
  
  public client: OutboundClient = {
    "merchantId": null,
    "legalName": null,
    "commercialName": null,
    "shortName": null,
    "headquartersAddress": {},
    //"headquartersAddress": {
    //  "address": "",
    //  "postalCode": "",
    //  "postalArea": "",
    //  "country": ""
    //},
    "context": null,
    "contextId": null,
    "fiscalIdentification": {},
    "merchantType": "corporation",
    "legalNature": null,
    "legalNature2": null,
    "incorporationStatement": {},
    "incorporationDate": null,
    "shareCapital": null,
    "bylaws": null,
    "principalTaxCode": null,
    "otherTaxCodes": [],
    "principalEconomicActivity": null,
    "otherEconomicActivities": [],
    "sales": {
      "annualEstimatedRevenue": null,
      "productsOrServicesSold": [],
      "productsOrServicesCountries": [],
      "transactionsAverage": null
    },
    "documentationDeliveryMethod": null,
    "bankingInformation": {},
    "merchantRegistrationId": null,
    "contacts": {},
    "billingEmail": null,
    "documents": []
  };

  crcError: boolean = false;
  crcNotExists: boolean = false;
  crcIncorrect: boolean = false;

  //client: OutboundClient = {};

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
  dataCC = null;
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
  //CAEs
  CAEsList: EconomicActivityInformation[] = [];

  public map = new Map();
  public currentPage: number;
  public subscription: Subscription;
  public subs: Subscription[] = [];

    

  returned: string; //variável para saber se estamos a editar um processo
  merchantInfo: any;

  associatedWithGroupOrFranchise: boolean = false;
  isAssociatedWithFranchise: boolean;
  NIFNIPC: any;
  idClient: string;
  comprovativoCC: FileAndDetailsCC; 

  DisableNIFNIPC = null;
  collectCRC: boolean;
  lastExpandedTab: number;
  touchedTabs: boolean[] = new Array<boolean>(3).fill(false);
  

  initializeTableInfo() {
    //Chamada à API para obter as naturezas juridicas
    this.subs.push(this.tableInfo.GetAllLegalNatures().subscribe(result => {
      this.legalNatureList = result;
      this.logger.debug("FETCH LEGAL NATURES");
      this.logger.debug(result);
      this.logger.debug(this.legalNatureList);
      this.legalNatureList = this.legalNatureList.sort((a, b) => a.description> b.description? 1 : -1);
    }, error => this.logger.error(error)));


    //Chamada à API para obter a lista de CAEs
    //this.tableInfo.GetAllCAEs().subscribe(result => {
    //  this.CAEsList = result;
    //  this.logger.debug("FETCH OS CAEs");
    //});

    //Chamada à API para obter a lista de CAEs
    //this.tableInfo.GetAllCAEs().subscribe(result => {
    //  this.CAEsList = result;
    //});
  }

  updateBasicForm() {
    this.form.get("clientCharacterizationForm").get("natJuridicaNIFNIPC").setValue(this.NIFNIPC);
    
  }

  //updateFormControls() {

  //  this.logger.debug("durante");
  //  this.logger.debug(this.processClient);
  //  var crcCodeInput = this.form.get('crcCode').value;
  //  this.form = new FormGroup({
  //    commercialSociety: new FormControl(null, Validators.required), //sim
  //    franchiseName: new FormControl(this.processClient.companyName), //sim
  //    natJuridicaNIFNIPC: new FormControl(this.NIFNIPC, Validators.required), //sim
  //    //expectableAnualInvoicing: new FormControl(this.client.sales.estimatedAnualRevenue, Validators.required),
  //    //preferenceDocuments: new FormControl(this.client.documentationDeliveryMethod, Validators.required),
  //    //Pretende associar a grupo/franchise
  //    //services: new FormControl('', Validators.required),
  //    //transactionsAverage: new FormControl(this.client.sales.averageTransactions, Validators.required),
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

  //  this.logger.debug("pos");
  //  //var a = this.form.get('CAE1Branch').validato
  //}

  initializeENI() {
    
    this.logger.debug("-------- NIFNIPC --------");
    this.logger.debug("intializeeniform");
    console.log("now NIFNIPC is " + this.NIFNIPC)
    this.form = new FormGroup({
      natJuridicaNIFNIPC: new FormControl(this.NIFNIPC, Validators.required),
      socialDenomination: new FormControl((this.returned !== null && this.returned !== undefined) ? this.merchantInfo.legalName : localStorage.getItem("clientName"), Validators.required), //sim,
      commercialSociety: new FormControl(false, [Validators.required]), //sim
      collectCRC: new FormControl(this.collectCRC)
    });

  }

  initializeBasicCRCFormControl() {
    this.logger.debug("intializebasiccrcform");
    this.NIFNIPC = this.form.get("natJuridicaNIFNIPC").value;
    this.form = new FormGroup({
      natJuridicaNIFNIPC: new FormControl(this.NIFNIPC, Validators.required), //sim
      commercialSociety: new FormControl(this.isCommercialSociety, [Validators.required]), //sim
      crcCode: new FormControl((this.returned != null && this.merchantInfo.incorporationStatement !== undefined) ? this.merchantInfo.incorporationStatement.code : '', [Validators.required]), //sim
      collectCRC: new FormControl(this.collectCRC)
    });
  }

  initializeBasicFormControl() {
      this.form = new FormGroup({
        natJuridicaNIFNIPC: new FormControl(this.NIFNIPC, [Validators.required]), //sim
        commercialSociety: new FormControl(this.isCommercialSociety, [Validators.required]), //sim
        collectCRC: new FormControl(this.collectCRC, [Validators.required])
        //crcCode: new FormControl((this.returned != null && this.merchantInfo.incorporationStatement !== undefined) ? this.merchantInfo.incorporationStatement.code : '', [Validators.required]), //sim
      });

    if (this.tipologia === 'ENI') {
      this.setCommercialSociety(false);
    }
      
    //this.form.get("commercialSociety").valueChanges.subscribe(data => {
    //  this.logger.debug("valor mudou commercial society");
    //  this.logger.debug(data);
    //  if (data == 'true') {
    //    this.logger.debug("true entrou");
    //    this.initializeFormControlCRC();
    //  } else {
    //    this.logger.debug("false entrou");
    //    this.initializeFormControlOther();
    //  }
    //});
  }

  searchBranch(code) {
    return this.tableInfo.GetCAEByCode(code).toPromise();
  }

  initializeFormControlOther() {
    this.logger.debug("-------- NIFNIPC --------");
    this.logger.debug("initializeformcontrolother");
    this.NIFNIPC = this.form.get("natJuridicaNIFNIPC").value;

    this.form = new FormGroup({
      //commercialSociety: new FormControl('false', [Validators.required]), //sim
      natJuridicaNIFNIPC: new FormControl(this.NIFNIPC, Validators.required),
      natJuridicaN1: new FormControl((this.returned !== null) ? this.merchantInfo.legalNature : '', [Validators.required]), //sim
      natJuridicaN2: new FormControl((this.returned !== null) ? this.merchantInfo.legalNature2 : ''), //sim
      socialDenomination: new FormControl({value:(this.returned !== null) ? this.merchantInfo.legalName : localStorage.getItem("clientName"), disabled:localStorage.getItem("clientName")!==null}, Validators.required), //sim
      commercialSociety: new FormControl(this.isCommercialSociety, [Validators.required]), //sim
      collectCRC: new FormControl(this.collectCRC)
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
    this.logger.debug("intializecrcform");
    this.logger.debug("a");
    this.crcCode = this.form.get("crcCode").value;
    this.logger.debug(this.processClient.capitalStock.date);
    var b = this.datepipe.transform(this.processClient.capitalStock.date, 'MM-dd-yyyy').toString();
    this.logger.debug("data formatada");
    var separated = b.split('-');
    var formatedDate = separated[2] + "-" + separated[1] + "-" + separated[0];
    this.logger.debug(formatedDate);
    //var date = formatDate(this.processClient.capitalStock.date, 'MM-dd-yyyy', 'en-US');
    var branch1 = '';

    this.searchBranch(this.processClient.mainEconomicActivity.split("-")[0])
      .then((data) => {
        this.form.get("CAE1Branch").setValue(data.description);
      });

    if (this.processClient.secondaryEconomicActivity !== null) {
      this.searchBranch(this.processClient.secondaryEconomicActivity[0].split("-")[0])
        .then((data) => {
          this.form.get("CAESecondary1Branch").setValue(data.description);
        });
    }

    this.logger.debug("-------- NIFNIPC --------");
    this.logger.debug(this.NIFNIPC);
    this.logger.debug(this.form.get("natJuridicaNIFNIPC").value);
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
      collectCRC: new FormControl(this.collectCRC, [Validators.required])
    });
      

    this.logger.debug(this.form);
    this.form.get("CAE1").valueChanges.subscribe(data => {
      if (data !== '') {
        this.form.controls["CAE1Branch"].setValidators([Validators.required]);
      } else {
        this.form.controls["CAE1Branch"].clearValidators();
      }
      this.form.controls["CAE1Branch"].updateValueAndValidity();
    });
    this.logger.debug("c");
    this.form.get("CAESecondary1").valueChanges.subscribe(data => {
      if (data !== '') {
        this.form.controls["CAESecondary1Branch"].setValidators([Validators.required]);
      } else {
        this.form.controls["CAESecondary1Branch"].clearValidators();
      }
      this.form.controls["CAESecondary1Branch"].updateValueAndValidity();
    });
    this.logger.debug("d");
    this.form.get("CAESecondary2").valueChanges.subscribe(data => {
      if (data !== '') {
        this.form.controls["CAESecondary2Branch"].setValidators([Validators.required]);
      } else {
        this.form.controls["CAESecondary2Branch"].clearValidators();
      }
      this.form.controls["CAESecondary2Branch"].updateValueAndValidity();
    });
    this.logger.debug("e");
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
    this.logger.debug("inicializar form controls");
    this.logger.debug("i");
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
    //  expectableAnualInvoicing: new FormControl(this.client.sales.estimatedAnualRevenue, Validators.required),
    //  preferenceDocuments: new FormControl(this.client.documentationDeliveryMethod, Validators.required),
    //  //Pretende associar a grupo/franchise
    //  services: new FormControl('', Validators.required),
    //  transactionsAverage: new FormControl(this.client.sales.averageTransactions, Validators.required),
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

    //    this.logger.debug("CAESecondary1");
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

    //  this.logger.debug(this.form.get('CAE1Branch').errors);
    //  this.logger.debug(this.form.get('CAE1Branch').errors?.['required']);

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
    //  //      this.logger.debug('Key control: ' + key + ', keyError: ' + keyError + ', err value: ', controlErrors[keyError]);
    //  //    });
    //  //  }
    //  //});
    //}
  }


  constructor(private logger : LoggerService, private datepipe: DatePipe, private router: ActivatedRoute, private http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private formBuilder: FormBuilder,
    private route: Router, private clientService: ClientService, private tableInfo: TableInfoService, private submissionService: SubmissionService, private data: DataService, private crcService: CRCService, private processService: ProcessService,
    private documentService: SubmissionDocumentService, private processNrService: ProcessNumberService,
    private stakeholderService: StakeholderService, private storeService: StoreService, private rootFormDirective: FormGroupDirective  ) {


    
    //Gets Tipologia from the Client component 
    if (this.route.getCurrentNavigation().extras.state) {
      //this.isCompany = this.route.getCurrentNavigation().extras.state["isCompany"];
      this.tipologia = this.route.getCurrentNavigation().extras.state["tipologia"];
      //this.tipologia = "ENI";
      //this.tipologia = "Company";
      this.clientExists = this.route.getCurrentNavigation().extras.state["clientExists"];
      this.NIFNIPC = this.route.getCurrentNavigation().extras.state["NIFNIPC"];
      this.comprovativoCC = this.route.getCurrentNavigation().extras.state["comprovativoCC"];
      //this.NIFNIPC = this.router.snapshot.params["id"];
      this.clientId = this.route.getCurrentNavigation().extras.state["clientId"];

      this.dataCC = this.route.getCurrentNavigation().extras.state["dataCC"];

      

      
      

      console.log("Contexto acabado de ser criado: ", this.clientContext);

      this.logger.debug("------------");
      this.logger.debug(this.processId);
      this.logger.debug("------------");
      this.logger.debug("c");
    }
    this.form = formBuilder.group({
      clientCharacterizationForm: new FormGroup({
        natJuridicaNIFNIPC: new FormControl(this.NIFNIPC, Validators.required), //sim
        commercialSociety: new FormControl(this.isCommercialSociety, [Validators.required]), //sim
        crcCode: new FormControl((this.returned != null && this.merchantInfo.incorporationStatement !== undefined) ? this.merchantInfo.incorporationStatement.code : '', [Validators.required]), //sim
        collectCRC: new FormControl(this.collectCRC)
      }),
      countrysForm: formBuilder.group({}),
      powerRepresentationForm: formBuilder.group({}),
    })

    var context = this;
    if (this.clientId !== "-1" && this.clientId != null && this.clientId != undefined) {

      //this.clientService.getClientByID(this.clientId, "6db0b920-3de4-431a-92c7-2c476784ed9a", "2").subscribe(result => {

      //  this.clientContext.clientExists = true;
      //  this.clientContext.client = result;
      //  this.clientContext.NIFNIPC = this.client.fiscalIdentification.fiscalId;
      //  this.updateBasicForm();
      //});

      

      //this.initializeBasicFormControl();

    } else {
      //this.initializeFormControls();
      this.updateBasicForm();
    }
    this.initializeTableInfo();


    if (this.returned !== null) {
      this.submissionService.GetSubmissionByProcessNumber(localStorage.getItem("processNumber")).subscribe(result => {
        if (result[0] !== undefined) {
          this.submissionService.GetSubmissionByID(result[0].submissionId).subscribe(resul => {
            this.clientService.GetClientById(resul.id).subscribe(res => {
              this.merchantInfo = res;
              this.clientContext.setMerchantInfo(res);
              if (this.NIFNIPC === undefined) {
                this.NIFNIPC = this.merchantInfo.fiscalId;
                this.clientContext.setNIFNIPC(this.NIFNIPC);
              }
              if (this.merchantInfo.incorporationStatement !== null) {
                this.isCommercialSociety = true;
                this.collectCRC = true;
                this.initializeBasicCRCFormControl();
                this.searchByCRC();
              } else {
                if (this.merchantInfo.legalNature !== "") {
                  this.isCommercialSociety = false;
                  this.collectCRC = false;
                  this.tipologia === 'Company';
                  this.clientContext.tipologia = this.tipologia;
                  this.initializeFormControlOther();
                } else {
                  this.isCommercialSociety = false;
                  this.collectCRC = false;
                  this.tipologia === 'ENI';
                  this.clientContext.tipologia = this.tipologia;
                  this.initializeENI();
                }
              }
            });
          });
        }
      });
    }
    this.ngOnInit();  
  }

   //fim do construtor

  ngOnInit(): void {
    // this.clientId = String(this.router.snapshot.params['id']);

    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    this.data.updateData(false, 1, 2);

    this.returned = localStorage.getItem("returned");

    this.clientContext = new ClientContext(
      this.route.getCurrentNavigation().extras.state["tipologia"],
      this.route.getCurrentNavigation().extras.state["clientExists"],
      this.route.getCurrentNavigation().extras.state["comprovativoCC"],
      this.router.snapshot.params["id"],
      this.route.getCurrentNavigation().extras.state["clientId"],
      this.route.getCurrentNavigation().extras.state["dataCC"],
    );

    console.log("antes da pesquisa");
    this.clientService.getClientById(this.clientId).then(result => {
      console.log("pesquisa do cliente: ", result);
      this.clientContext.clientExists = true;
      this.clientContext.setClient(result.result);
      this.clientContext.setNIFNIPC(result.result.fiscalIdentification.fiscalId);
      //this.clientContext.setMerchantInfo(result.result);
      this.updateBasicForm();
    });
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub?.unsubscribe);
  }

  setCommercialSociety(id: boolean) {
    this.crcFound = false;
    this.collectCRC = undefined;
    this.crcIncorrect = false;
    this.crcNotExists = false;
    this.form.get('collectCRC').setValue(undefined);
    if (id == true) {
      this.initializeBasicCRCFormControl();
      this.isCommercialSociety = true;
      this.form.get("commercialSociety").setValue(true);
    } else {
      if (this.tipologia === 'Company')
        this.initializeFormControlOther();
      else
        this.initializeENI();
      this.isCommercialSociety = false;
      this.form.get("commercialSociety").setValue(false);
      this.logger.debug("entrou no false");
    }
  }

  getCommercialSociety() {
    return this.isCommercialSociety;
  }
 
  onLegalNatureSelected() {
    var exists = false;
    this.logger.debug("entrou no legalnatureselected");

    this.logger.debug(this.legalNatureList);
    this.legalNatureList.forEach(legalNat => {
      var legalNatureToSearch = this.form.get('natJuridicaN1').value;
      if (legalNatureToSearch == legalNat.code) {
        exists = true;
        this.legalNatureList2 = legalNat.secondaryNatures;
        this.legalNatureList2 = this.legalNatureList2.sort((a, b) => a.description> b.description? 1 : -1);
      }
    })
    if (!exists) {
      this.legalNatureList2 = [];
    }
  }


   searchByCRC() {
    //var crcInserted = this.form.get('crcCode');
    //this.logger.debug("codigo CRC:" , this.form.get('crcCode').value);
    //this.logger.debug(crcInserted);
    //this.crcFound = true;
    

     var crcInserted = this.form.get('crcCode').value;
     var crcFormat = /(\b\d{4})-(\b\d{4})-(\b\d{4})/i;
     if (!crcFormat.test(crcInserted)) {
       this.crcIncorrect = true;
       this.crcFound = false;
       //this.errorMsg = 'CRC inserido não está com o formato correto'
       return;
     }
     this.crcIncorrect = false;
     this.crcService.getCRC(crcInserted, '001').subscribe(o => {
       if (o === {} || o === undefined || o === null) {
         this.crcNotExists = true;
         this.crcFound = false;
         //this.errorMsg = 'CRC inserido não foi encontrado';
       }

        var clientByCRC = o;

       this.crcFound = true;
       this.crcNotExists = false;
       this.errorMsg = '';
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
        this.processClient.headquartersAddress.postalArea = clientByCRC.headquartersAddress.postalArea;
        this.processClient.headquartersAddress.country = clientByCRC.headquartersAddress.country;

        this.processClient.expirationDate = clientByCRC.expirationDate;
        this.processClient.hasOutstandingFacts = clientByCRC.hasOutstandingFacts;

        this.processClient.stakeholders = clientByCRC.stakeholders;

        this.processClient.pdf = clientByCRC.pdf;

        this.processClient.code = clientByCRC.code;
        this.processClient.requestId = clientByCRC.requestId;

        this.logger.debug("o crc chamou o initialize");
        this.initializeFormControlCRC();
      });
    

    //if (crcInserted === '123') {
    //  this.crcFound = true;
    //  this.logger.debug("-Crc true-: ", this.crcFound);
    //  this.logger.debug("-isCommercialSociety true-: ", this.isCommercialSociety);
    //} else {
    //  this.logger.debug("--");
    //}
  }
  getCrcCode() {
    return this.form.get('crcCode').value;
  }

  onExpand(index: number){
    this.data.updateData(false, 1, index + 2);
    if(this.lastExpandedTab !== undefined){
      this.touchedTabs[this.lastExpandedTab] = true;
      if (this.lastExpandedTab === 0)
        this.clientCharacterizationComponent.submit(); //updates the client context when leaving the first tab
    }
    this.lastExpandedTab = index;
  }

  //getPaisSedeSocial() {
  //  this.logger.debug(this.form.get('headquartersAddress.country').value);
  //  this.logger.debug(this.form.get('headquartersAddress.country'));

  //  return this.form.get('headquartersAddress.country').value;
  //}


  submit() {

    console.log("form valido: ", this.form);
    this.clientCharacterizationComponent.submit();

    if (!this.clientContext.clientExists)
      this.countriesComponent.submit();

    this.representationPowerComponent.submit();

    console.log("submit| clientContext final: ", this.clientContext);

    this.createSubmission();
    
    this.route.navigate(["/stakeholders/"]);
  }


  redirectBeginningClient() {
    this.route.navigate(["/client"]);
  }

  redirectHomePage() {
    this.route.navigate(["/"]);
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

      this.subs.push(this.tableInfo.GetAddressByZipCode(Number(zipCode[0]), Number(zipCode[1])).subscribe(address => {
        
        var addressToShow = address[0];

        this.form.get('address').setValue(addressToShow.address);
        this.form.get('country').setValue(addressToShow.country);
        this.form.get('location').setValue(addressToShow.postalArea);
      }));
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

  setCollectCRC(value: boolean) {
    this.collectCRC = value;
    this.crcIncorrect = false;
    this.crcNotExists = false;
    if (value == false)
      this.initializeFormControlOther();
    else
      this.initializeBasicCRCFormControl();
  }

  canChangeCommercialSociety() {
    if (this.returned === 'consult')
      return false;
    if (this.tipologia === 'ENI')
      return false;

    return true;
  }

  createSubmission() {
    var context = this;
    var newSubmission = this.clientContext.newSubmission;
    newSubmission.startedAt = new Date().toISOString();
    newSubmission.merchant = this.clientContext.getClient();

    this.submissionService.InsertSubmission(newSubmission).subscribe(result => {
      localStorage.setItem("submissionId", result.id);
      this.processNrService.changeProcessNumber(result.processNumber);

      this.storeService.getShopsListOutbound(newSubmission.merchant.merchantId, "por mudar", "por mudar").subscribe(res => {
        res.forEach(value => {
          this.storeService.getShopInfoOutbound(newSubmission.merchant.merchantId, value.shopId, "por mudar", "por mudar").subscribe(r => {
            var storeToAdd: ShopDetailsAcquiring = {
              activity: r.activity,
              subActivity: r.secondaryActivity,
              address: {
                address: r.address.address,
                isInsideShoppingCenter: r.address.isInsideShoppingCenter,
                shoppingCenter: r.address.shoppingCenter,
                useMerchantAddress: r.address.sameAsMerchantAddress
              },
              bank: {
                bank: r.bankingInformation
              },
              name: r.name,
              productCode: r.product,
              subproductCode: r.subproduct,
              website: r.url,
              equipments: []
            }

            context.storeService.addShopToSubmission(result.id, storeToAdd).subscribe(shop => {

            });
          });
        });
      });

    });
  }
}
