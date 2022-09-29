import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Client, OutboundClient } from '../Client.interface';
import { TestScheduler } from 'rxjs/testing';
import { continents, countriesAndContinents } from '../countriesAndContinents';
import { CountryInformation, EconomicActivityInformation, LegalNature, SecondLegalNature } from '../../table-info/ITable-info.interface';
import { TableInfoService } from '../../table-info/table-info.service';
import { SubmissionService } from '../../submission/service/submission-service.service'
import { AbstractControl, FormControl, FormGroup, FormGroupDirective, ValidationErrors, Validators } from '@angular/forms';
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
import { ClientContext } from '../clientById/clientById.model';


@Component({
  selector: 'app-client-characterization',
  templateUrl: './clientcharacterization.component.html',
  providers: [DatePipe]
})

export class ClientCharacterizationComponent implements OnInit {
  lastSize: number = 14;
  processId: string;

  tipologia: string;
  @Input() clientContext: ClientContext;
  @ViewChild('searchInput') input: ElementRef;

  /*Variable declaration*/
  form: AbstractControl;
  myControl = new FormControl('');

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
  rootForm: FormGroup;

  changeFormStructure(newForm: FormGroup){
    this.rootForm.setControl("clientCharacterizationForm", newForm);
    this.form = this.rootForm.get("clientCharacterizationForm");

    //this.form.updateValueAndValidity();
  }

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
    this.form.get("natJuridicaNIFNIPC").setValue(this.NIFNIPC);

  }

  //updateFormControls() {

  //  this.logger.debug("durante");
  //  this.logger.debug(this.processClient);
  //  var crcCodeInput = this.form.get('crcCode').value;
  //  this.changeFormStructure(new FormGroup({
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

  //  }));

  //  this.logger.debug("pos");
  //  //var a = this.form.get('CAE1Branch').validato
  //}

  initializeENI() {
    this.logger.debug("-------- NIFNIPC --------");
    this.logger.debug("intializeeniform");
    this.changeFormStructure(new FormGroup({
      natJuridicaNIFNIPC: new FormControl(this.NIFNIPC, Validators.required),
      socialDenomination: new FormControl((this.returned !== null && this.returned !== undefined) ? this.merchantInfo.legalName : localStorage.getItem("clientName"), Validators.required), //sim,
      commercialSociety: new FormControl(false, [Validators.required]), //sim
      collectCRC: new FormControl(this.collectCRC)
    }));

  }

  initializeBasicCRCFormControl() {
    this.logger.debug("intializebasiccrcform");
    this.NIFNIPC = this.form.get("natJuridicaNIFNIPC").value;
    this.changeFormStructure(new FormGroup({
      natJuridicaNIFNIPC: new FormControl(this.NIFNIPC, Validators.required), //sim
      commercialSociety: new FormControl(this.isCommercialSociety, [Validators.required]), //sim
      crcCode: new FormControl((this.returned != null && this.merchantInfo.incorporationStatement !== undefined) ? this.merchantInfo.incorporationStatement.code : '', [Validators.required]), //sim
      collectCRC: new FormControl(this.collectCRC)
    }));
  }

  initializeBasicFormControl() {
    console.log("Cliente Contexto: ", this.clientContext);
    console.log("NIFNIPC: ", this.NIFNIPC);
    
    this.form = new FormGroup({
      natJuridicaNIFNIPC: new FormControl(this.NIFNIPC , [Validators.required]), //sim
      commercialSociety: new FormControl(this.isCommercialSociety, [Validators.required]), //sim
      collectCRC: new FormControl(this.collectCRC, [Validators.required])
      //crcCode: new FormControl((this.returned != null && this.merchantInfo.incorporationStatement !== undefined) ? this.merchantInfo.incorporationStatement.code : '', [Validators.required]), //sim
    });

    //this.changeFormStructure(new FormGroup({
    //  natJuridicaNIFNIPC: new FormControl({ value: this.NIFNIPC }, [Validators.required]), //sim
    //  commercialSociety: new FormControl(this.isCommercialSociety, [Validators.required]), //sim
    //  collectCRC: new FormControl(this.collectCRC, [Validators.required])
    //  //crcCode: new FormControl((this.returned != null && this.merchantInfo.incorporationStatement !== undefined) ? this.merchantInfo.incorporationStatement.code : '', [Validators.required]), //sim
    //}));

    this.form.get("natJuridicaNIFNIPC").updateValueAndValidity();

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

    this.changeFormStructure(new FormGroup({
      //commercialSociety: new FormControl('false', [Validators.required]), //sim
      natJuridicaNIFNIPC: new FormControl(this.NIFNIPC, Validators.required),
      natJuridicaN1: new FormControl((this.returned !== null) ? this.merchantInfo.legalNature : ''), //sim
      natJuridicaN2: new FormControl((this.returned !== null) ? this.merchantInfo.legalNature2 : ''), //sim
      socialDenomination: new FormControl({value:(this.returned !== null) ? this.merchantInfo.legalName : localStorage.getItem("clientName"), disabled:localStorage.getItem("clientName")!==null}, Validators.required), //sim
      commercialSociety: new FormControl(this.isCommercialSociety, [Validators.required]), //sim
      collectCRC: new FormControl(this.collectCRC)
    }));

    this.form.get("natJuridicaN1").valueChanges.subscribe(data => {
      
      this.onLegalNatureSelected();

      if (this.legalNatureList2.length > 0)
        this.form.get("natJuridicaN2").setValidators([Validators.required]);
      else
        this.form.get("natJuridicaN2").clearValidators();
      this.form.get("natJuridicaN2").updateValueAndValidity();
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
    //this.logger.debug(formatedDate);
    //var date = formatDate(this.processClient.capitalStock.date, 'MM-dd-yyyy', 'en-US');
    var branch1 = '';

    

    //this.logger.debug("-------- NIFNIPC --------");
    //this.logger.debug(this.NIFNIPC);
    //this.logger.debug(this.form.get("natJuridicaNIFNIPC").value);
    this.NIFNIPC = this.form.get("natJuridicaNIFNIPC").value;

    //console.log("form: ", this.form);
    this.changeFormStructure(new FormGroup({
      //commercialSociety: new FormControl('true', [Validators.required]), //sim
      crcCode: new FormControl(this.crcCode, [Validators.required]), //sim
      natJuridicaN1: new FormControl({ value: this.processClient.legalNature, disabled: true/*, disabled: this.clientExists */}, [Validators.required]), //sim
      natJuridicaNIFNIPC: new FormControl(this.NIFNIPC, [Validators.required]), //sim
      natJuridicaN2: new FormControl({ value: '', disabled: true/*, disabled: this.clientExists*/ }), //sim
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
    }));
      

    //this.logger.debug(this.form);
    this.form.get("CAE1").valueChanges.subscribe(data => {
      if (data !== '') {
        this.form.get("CAE1Branch").setValidators([Validators.required]);
      } else {
        this.form.get("CAE1Branch").clearValidators();
      }
      this.form.get("CAE1Branch").updateValueAndValidity();
    });
    //this.logger.debug("c");
    this.form.get("CAESecondary1").valueChanges.subscribe(data => {
      if (data !== '') {
        this.form.get("CAESecondary1Branch").setValidators([Validators.required]);
      } else {
        this.form.get("CAESecondary1Branch").clearValidators();
      }
      this.form.get("CAESecondary1Branch").updateValueAndValidity();
    });
    //this.logger.debug("d");
    this.form.get("CAESecondary2").valueChanges.subscribe(data => {
      if (data !== '') {
        this.form.get("CAESecondary2Branch").setValidators([Validators.required]);
      } else {
        this.form.get("CAESecondary2Branch").clearValidators();
      }
      this.form.get("CAESecondary2Branch").updateValueAndValidity();
    });
    //this.logger.debug("e");
    this.form.get("CAESecondary3").valueChanges.subscribe(data => {
      if (data !== '') {
        this.form.get("CAESecondary3Branch").setValidators([Validators.required]);
      } else {
        this.form.get("CAESecondary3Branch").clearValidators();
      }
      this.form.get("CAESecondary3Branch").updateValueAndValidity();
    });

    this.searchBranch(this.processClient.mainEconomicActivity.split("-")[0])
      .then((data) => {
        console.log("procurou o branch: ", data);
        console.log(this.form);
        this.form.get("CAE1Branch").setValue(data.description);
      });

    if (this.processClient.secondaryEconomicActivity !== null) {
      this.searchBranch(this.processClient.secondaryEconomicActivity[0].split("-")[0])
        .then((data) => {
          console.log("procurou o branch2: ", data);
          console.log(this.form);
          this.form.get("CAESecondary1Branch").setValue(data.description);
        });
    }
  }

  initializeFormControls() {
    this.logger.debug("inicializar form controls");
    this.logger.debug("i");
    this.initializeBasicFormControl();
    //this.changeFormStructure(new FormGroup({
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

    //}));


    //changeFormStructure(new FormGroup({
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

  constructor(private logger : LoggerService, private datepipe: DatePipe, private router: ActivatedRoute, private http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private rootFormDirective: FormGroupDirective,
    private route: Router, private clientService: ClientService, private tableInfo: TableInfoService, private submissionService: SubmissionService, private data: DataService, private crcService: CRCService, private processService: ProcessService) {
      this.rootForm = this.rootFormDirective.form;
    this.form = this.rootForm.get("clientCharacterizationForm");
  }

   //fim do construtor

  ngOnInit(): void {
    // this.clientId = String(this.router.snapshot.params['id']);
  
    //Gets Tipologia from the Client component 
    this.tipologia = this.clientContext.tipologia;
    this.clientExists = this.clientContext.clientExists;
    this.comprovativoCC = this.clientContext.comprovativoCC;

    this.clientContext.currentNIFNIPC.subscribe(result => {
      this.NIFNIPC = result;
      console.log("resultado: ", result);

      this.form.get("natJuridicaNIFNIPC").setValue(this.NIFNIPC + '');
      this.form.get("natJuridicaNIFNIPC").updateValueAndValidity();

      console.log("form depois de encontrar o nif: ", this.form);
      this.initializeBasicFormControl();
    });



    //this.NIFNIPC = this.clientContext.NIFNIPC;
    if (this.NIFNIPC !== undefined && this.NIFNIPC !== null && this.NIFNIPC !== '') {
      this.DisableNIFNIPC = true;
    }
    else {
      this.DisableNIFNIPC = null;
    }

    

    this.clientId = this.clientContext.clientId;
    this.dataCC = this.clientContext.dataCC;
    this.logger.debug("------------");
    this.logger.debug(this.processId);
    this.logger.debug("------------");
    this.logger.debug("c");

    //this.initializeBasicFormControl();
    //this.updateBasicForm();

    this.initializeTableInfo();


    //if (this.returned !== null) {
    //  this.submissionService.GetSubmissionByProcessNumber(localStorage.getItem("processNumber")).subscribe(result => {
    //    if (result[0] !== undefined) {
    //      this.submissionService.GetSubmissionByID(result[0].submissionId).subscribe(resul => {
    //        this.clientService.GetClientById(resul.id).subscribe(res => {
    //          this.merchantInfo = res;
    //          if (this.NIFNIPC === undefined) {
    //            this.NIFNIPC = this.merchantInfo.fiscalId;
    //          }
    //          if (this.merchantInfo.incorporationStatement !== null) {
    //            this.isCommercialSociety = true;
    //            this.collectCRC = true;
    //            this.initializeBasicCRCFormControl();
    //            this.searchByCRC();
    //          } else {
    //            if (this.merchantInfo.legalNature !== "") {
    //              this.isCommercialSociety = false;
    //              this.collectCRC = false;
    //              this.tipologia = 'Company'; //FIXME dead code
    //              this.initializeFormControlOther();
    //            } else {
    //              this.isCommercialSociety = false;
    //              this.collectCRC = false; //FIXME dead code
    //              this.tipologia = 'ENI';
    //              this.initializeENI();
    //            }
    //          }
    //        });
    //      });
    //    }
    //  });
    //}
    this.returned = localStorage.getItem("returned");

    this.getClientContextValues();
  }

  getClientContextValues() {
    var context = this;

    this.clientContext.currentClient.subscribe(result => {
      console.log("CLIENTE CONTEXT current cliente: ", result);
      context.client = result;
      //this.updateBasicForm();

      console.log("CLIENTE INFO ATUALIZOU: ", context.client);
    });

    this.clientContext.currentMerchantInfo.subscribe(result => {
      console.log("CLIENTE CONTEXT merchant info: ", result);
      context.merchantInfo = result;
      //this.updateBasicForm();

      console.log("MERCHANT INFO ATUALIZOU: ", context.merchantInfo);

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
    this.crcService.getCRC(crcInserted, '001').subscribe({next: clientByCRC => {
      if (clientByCRC === undefined || clientByCRC === null) {
        this.crcNotExists = true;
        this.crcFound = false;
        //this.errorMsg = 'CRC inserido não foi encontrado';
      }
      

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

      this.clientContext.setStakeholdersToInsert(clientByCRC.stakeholders);

      this.processClient.pdf = clientByCRC.pdf;

      this.processClient.code = clientByCRC.code;
      this.processClient.requestId = clientByCRC.requestId;

      this.logger.debug("o crc chamou o initialize");
      this.initializeFormControlCRC();
      
    }, error: (error)=>{
        this.crcNotExists = true;
        this.crcFound = false;
    }});
    

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

  //getPaisSedeSocial() {
  //  this.logger.debug(this.form.get('headquartersAddress.country').value);
  //  this.logger.debug(this.form.get('headquartersAddress.country'));

  //  return this.form.get('headquartersAddress.country').value;
  //}


  submit() {
    var formValues = this.form.value;
    console.log("cliente a submeter: ", this.client);

    var delivery = this.client.documentationDeliveryMethod;

    if (delivery === 'viaDigital')
      this.client.documentationDeliveryMethod = 'Portal';
    else
      this.client.documentationDeliveryMethod = 'Mail';
    if (this.isCommercialSociety) {
      this.client.headquartersAddress = {
        address: this.form.value["address"],
        country: this.form.value["country"],
        postalCode: this.form.value["ZIPCode"],
        postalArea: this.form.value["location"]
      }
      // this.client.headquartersAddress.address = this.form.value["address"];
      // this.client.headquartersAddress.country = this.form.value["country"];
      // this.client.headquartersAddress.postalCode = this.form.value["ZIPCode"];
      // this.client.headquartersAddress.postalArea = this.form.value["location"];
      this.client.principalEconomicActivity = this.form.value["CAE1"];
      this.client.otherEconomicActivities = [];

      var CAESecondary1 = (this.form.value["CAESecondary1"]);
      var CAESecondary2 = (this.form.value["CAESecondary1"]);

      if (CAESecondary1 !== null)
        this.client.otherEconomicActivities.push(this.form.value["CAESecondary1"]);
      if (CAESecondary2 !== null)
        this.client.otherEconomicActivities.push(this.form.value["CAESecondary2"]);
      //Paises destino
      this.client.incorporationDate = this.form.value["constitutionDate"];
      //this.client.crc.code = this.form.value["crcCode"];
      this.client.incorporationStatement = {
        code: this.form.value["crcCode"]
      }
      this.client.legalNature = this.form.value["natJuridicaN1"];

      this.client.fiscalIdentification.fiscalId = this.form.value["natJuridicaNIFNIPC"];
      this.client.commercialName = this.form.value["socialDenomination"];

      if (this.client.merchantType === 'corporation')
        this.client.merchantType = 'Corporate';
      else
        this.client.merchantType = 'Entrepeneur';
    } else {
      
      this.client.fiscalIdentification.fiscalId = this.form.value["natJuridicaNIFNIPC"];

      if (this.tipologia === 'Company') {
        this.client.legalNature = this.form.value["natJuridicaN1"];

        var natJuridicaN2 = this.form.value["natJuridicaN2"];

        this.client.merchantType = 'Corporate';

        if (natJuridicaN2 !== null)
          this.client.legalNature2 = this.form.value["natJuridicaN2"];
      }
      this.client.commercialName = this.form.value["socialDenomination"];
    }
    if (this.tipologia === 'ENI') {
      this.client.legalName = this.form.value["socialDenomination"];
      this.client.merchantType = 'Entrepeneur';
      if (this.dataCC !== {}) {
        this.client.shortName = this.dataCC.nameCC;
       // this.client.cardNumber(?) = this.dataCC.value["cardNumberCC"]; Nº do CC não é guardado?
        this.client.fiscalIdentification.fiscalId = this.dataCC.nifCC;
      //  this.client.addressCC = this.dataCC.value["addressCC"];
       // this.client.postalCodeCC = this.dataCC.value["postalCodeCC"];


      }

    }


    ////Social Denomination

    //this.client.merchantType = this.tipologia;

    //if (this.associatedWithGroupOrFranchise) {
    //  this.client.companyName = this.form.value["franchiseName"];
    //  //this.client.businessGroup.fiscalId = this.form.value["NIPCGroup"]; //deve ter de ser alterado
    //}

    this.NIFNIPC = this.form.get("natJuridicaNIFNIPC").value;
    this.clientContext.clientExists = this.clientExists;
    this.clientContext.tipologia = this.tipologia;
    this.clientContext.NIFNIPC = this.NIFNIPC;
    //this.clientContext.client = this.client;
    this.clientContext.setClient(this.client);
    this.clientContext.clientId = this.clientId;
    this.clientContext.processId = this.processId;
    //this.clientContext.stakeholdersToInsert = (this.processClient.stakeholders === undefined || this.processClient.stakeholders === null || this.processClient.stakeholders.length < 1) ? this.processClient.stakeholders : [];
    this.clientContext.setMerchantInfo(this.merchantInfo);
    this.clientContext.crc =(this.crcFound) ? this.processClient : null;
    this.clientContext.comprovativoCC = this.comprovativoCC;
      
    //this.processService.createMerchant(this.client, this.processId, "por mudar", "por mudar").subscribe(o => {
    //  this.logger.debug("sucesso");
    //}, error => {
    //  this.logger.debug(error);
    //});

    console.log("Submeteu o clientCharacterization: ", this.clientContext);
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
}