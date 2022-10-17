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
  }

  updateBasicForm() {
    this.form.get("natJuridicaNIFNIPC").setValue(this.NIFNIPC);

  }

  initializeENI() {
    this.logger.debug("-------- NIFNIPC --------");
    this.logger.debug("intializeeniform");
    this.changeFormStructure(new FormGroup({
      natJuridicaNIFNIPC: new FormControl(this.NIFNIPC, Validators.required),
      socialDenomination: new FormControl((this.returned != null && this.returned != undefined) ? this.merchantInfo.legalName : localStorage.getItem("clientName"), Validators.required), //sim,
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
      crcCode: new FormControl((this.returned != null && this.merchantInfo.incorporationStatement != undefined) ? this.merchantInfo.incorporationStatement.code : '', [Validators.required]), //sim
      collectCRC: new FormControl(this.collectCRC)
    }));
  }

  initializeBasicFormControl() {
   
    this.form = new FormGroup({
      natJuridicaNIFNIPC: new FormControl(this.NIFNIPC , [Validators.required]), //sim
      commercialSociety: new FormControl(this.isCommercialSociety, [Validators.required]), //sim
      collectCRC: new FormControl(this.collectCRC, [Validators.required])
    });
    this.form.get("natJuridicaNIFNIPC").updateValueAndValidity();

    if (this.tipologia === 'ENI') {
      this.setCommercialSociety(false);
    }
  }

  searchBranch(code) {
    return this.tableInfo.GetCAEByCode(code).toPromise();
  }

  initializeFormControlOther() {
    this.logger.debug("-------- NIFNIPC --------");
    this.logger.debug("initializeformcontrolother");
    this.NIFNIPC = this.form.get("natJuridicaNIFNIPC").value;

    this.changeFormStructure(new FormGroup({
      natJuridicaNIFNIPC: new FormControl(this.NIFNIPC, Validators.required),
      natJuridicaN1: new FormControl((this.returned != null) ? this.merchantInfo.legalNature : ''), //sim
      natJuridicaN2: new FormControl((this.returned != null) ? this.merchantInfo.legalNature2 : ''), //sim
      socialDenomination: new FormControl({value:(this.returned != null) ? this.merchantInfo.legalName : localStorage.getItem("clientName"), disabled:localStorage.getItem("clientName")!==null}, Validators.required), //sim
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
    var branch1 = '';

    this.NIFNIPC = this.form.get("natJuridicaNIFNIPC").value;

    this.changeFormStructure(new FormGroup({
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
      

    this.form.get("CAE1").valueChanges.subscribe(data => {
      if (data !== '') {
        this.form.get("CAE1Branch").setValidators([Validators.required]);
      } else {
        this.form.get("CAE1Branch").clearValidators();
      }
      this.form.get("CAE1Branch").updateValueAndValidity();
    });
    this.form.get("CAESecondary1").valueChanges.subscribe(data => {
      if (data !== '') {
        this.form.get("CAESecondary1Branch").setValidators([Validators.required]);
      } else {
        this.form.get("CAESecondary1Branch").clearValidators();
      }
      this.form.get("CAESecondary1Branch").updateValueAndValidity();
    });
    this.form.get("CAESecondary2").valueChanges.subscribe(data => {
      if (data !== '') {
        this.form.get("CAESecondary2Branch").setValidators([Validators.required]);
      } else {
        this.form.get("CAESecondary2Branch").clearValidators();
      }
      this.form.get("CAESecondary2Branch").updateValueAndValidity();
    });
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
        this.form.get("CAE1Branch").setValue(data.description);
      });

    if (this.processClient.secondaryEconomicActivity !== null) {
      this.searchBranch(this.processClient.secondaryEconomicActivity[0].split("-")[0])
        .then((data) => {
          this.form.get("CAESecondary1Branch").setValue(data.description);
        });
    }
  }

  initializeFormControls() {
    this.logger.debug("inicializar form controls");
    this.initializeBasicFormControl();
  }

  constructor(private logger : LoggerService, private datepipe: DatePipe, private router: ActivatedRoute, private http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private rootFormDirective: FormGroupDirective,
    private route: Router, private clientService: ClientService, private tableInfo: TableInfoService, private submissionService: SubmissionService, private data: DataService, private crcService: CRCService, private processService: ProcessService) {
      this.rootForm = this.rootFormDirective.form;
    this.form = this.rootForm.get("clientCharacterizationForm");
  }

  ngOnInit(): void {
    this.returned = localStorage.getItem("returned");
    this.tipologia = this.clientContext.tipologia;
    this.clientExists = this.clientContext.clientExists;
    this.comprovativoCC = this.clientContext.comprovativoCC;

    this.clientContext.currentNIFNIPC.subscribe(result => {
      this.NIFNIPC = result;
      this.form.get("natJuridicaNIFNIPC").setValue(this.NIFNIPC + '');
      this.form.get("natJuridicaNIFNIPC").updateValueAndValidity();

      this.initializeBasicFormControl();
    });

    if (this.NIFNIPC !== undefined && this.NIFNIPC !== null && this.NIFNIPC !== '') {
      this.DisableNIFNIPC = true;
    }
    else {
      this.DisableNIFNIPC = null;
    }

    this.clientId = this.clientContext.clientId;
    this.dataCC = this.clientContext.dataCC;


    this.initializeTableInfo();
    this.getClientContextValues();
  }

  getClientContextValues() {
    var context = this;

    this.clientExists = this.clientContext.clientExists;
    this.NIFNIPC = this.clientContext.getNIFNIPC();
    this.tipologia = this.clientContext.tipologia;

    this.clientContext.currentClient.subscribe(result => {
      context.client = result;
    });

    this.clientContext.currentMerchantInfo.subscribe(result => {
      context.merchantInfo = result;

      if (this.returned != null) {
        if (this.tipologia == 'Company') {
          this.isCommercialSociety = false;
          this.collectCRC = false;
          this.initializeFormControlOther();
        }
        if (this.tipologia == 'ENI') {
          this.isCommercialSociety = false;
          this.collectCRC = false;
          this.initializeENI();
        }
        if (this.merchantInfo.incorporationStatement != null) {
          this.isCommercialSociety = true;
          this.collectCRC = true;
          this.initializeBasicCRCFormControl();
          this.searchByCRC();
        }
      }
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

    var crcInserted = this.form.get('crcCode').value;
    var crcFormat = /(\b\d{4})-(\b\d{4})-(\b\d{4})/i;
    if (!crcFormat.test(crcInserted)) {
      this.crcIncorrect = true;
      this.crcFound = false;
      return;
    }
    this.crcIncorrect = false;
    this.crcService.getCRC(crcInserted, '001').subscribe({next: clientByCRC => {
      if (clientByCRC === undefined || clientByCRC === null) {
        this.crcNotExists = true;
        this.crcFound = false;
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
  }
  getCrcCode() {
    return this.form.get('crcCode').value;
  }

  submit() {
    var formValues = this.form.value;

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
        this.client.merchantType = '01';
      else
        this.client.merchantType = '02';
    } else {
      
      this.client.fiscalIdentification.fiscalId = this.form.value["natJuridicaNIFNIPC"];

      if (this.tipologia === 'Company') {
        this.client.legalNature = this.form.value["natJuridicaN1"];

        var natJuridicaN2 = this.form.value["natJuridicaN2"];

        this.client.merchantType = '01';

        if (natJuridicaN2 !== null)
          this.client.legalNature2 = this.form.value["natJuridicaN2"];
      }
      this.client.commercialName = this.form.value["socialDenomination"];
    }
    if (this.tipologia === 'ENI') {
      this.client.legalName = this.form.value["socialDenomination"];
      this.client.merchantType = '02';
      if (this.dataCC !== undefined && this.dataCC !== null) {
        this.client.shortName = this.dataCC.nameCC;
        this.client.fiscalIdentification.fiscalId = this.dataCC.nifCC;
      }

    }

    this.NIFNIPC = this.form.get("natJuridicaNIFNIPC").value;
    this.clientContext.clientExists = this.clientExists;
    this.clientContext.tipologia = this.tipologia;
    this.clientContext.NIFNIPC = this.NIFNIPC;
    this.clientContext.setClient(this.client);
    this.clientContext.clientId = this.clientId;
    this.clientContext.processId = this.processId;
    this.clientContext.setMerchantInfo(this.merchantInfo);
    this.clientContext.crc =(this.crcFound) ? this.processClient : null;
    this.clientContext.comprovativoCC = this.comprovativoCC;
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
