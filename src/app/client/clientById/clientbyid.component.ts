import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AcquiringClientPost, OutboundClient } from '../Client.interface';
import { continents, countriesAndContinents } from '../countriesAndContinents';
import { EconomicActivityInformation, LegalNature, SecondLegalNature } from '../../table-info/ITable-info.interface';
import { TableInfoService } from '../../table-info/table-info.service';
import { SubmissionService } from '../../submission/service/submission-service.service'
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DataService } from '../../nav-menu-interna/data.service';
import { ClientService } from '../client.service';
import { CRCService } from '../../CRC/crcservice.service';
import { CRCProcess } from '../../CRC/crcinterfaces';
import { DatePipe } from '@angular/common';
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
import { IStakeholders, OutboundDocument, StakeholdersProcess } from '../../stakeholders/IStakeholders.interface';
import { AuthService } from '../../services/auth.service';
import { ISubmissionDocument } from '../../submission/document/ISubmission-document';
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
  @ViewChild(CountrysComponent) countriesComponent: CountrysComponent;
  @ViewChild(RepresentationPowerComponent) representationPowerComponent: RepresentationPowerComponent;

  /*Variable declaration*/
  form: FormGroup;
  myControl = new FormControl('');
  clientContext: ClientContext;

  errorMsg: string = "";

  public clientId: string;

  socialDenomination: string;

  public client: OutboundClient = {
    "merchantId": null,
    "legalName": null,
    "commercialName": null,
    "shortName": null,
    "headquartersAddress": {},
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
  isClient: boolean;
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

  formIsValid: false;

  DisableNIFNIPC = null;
  collectCRC: boolean;
  lastExpandedTab: number;
  touchedTabs: boolean[] = new Array<boolean>(3).fill(false);
    formClientIsValid: boolean = false;
  formCountryIsValid: boolean = false;
  countriesListValid: boolean = false;

  clientDocs: OutboundDocument[] = null;

  submissionExists: boolean = false;
  isFromSearch: boolean = false;

  initializeTableInfo() {
    //Chamada à API para obter as naturezas juridicas
    //this.subs.push(this.tableInfo.GetAllLegalNatures().subscribe(result => {
    //  this.legalNatureList = result;
    //  this.logger.debug("FETCH LEGAL NATURES");
    //  this.logger.debug(result);
    //  this.logger.debug(this.legalNatureList);
    //  this.legalNatureList = this.legalNatureList.sort((a, b) => a.description > b.description ? 1 : -1);
    //}, error => this.logger.error(error)));
  }

  updateBasicForm() {
    this.form.get("clientCharacterizationForm").get("natJuridicaNIFNIPC").setValue(this.NIFNIPC);

  }

  initializeENI() {

    this.logger.debug("-------- NIFNIPC --------");
    this.logger.debug("intializeeniform");
    this.form = new FormGroup({
      natJuridicaNIFNIPC: new FormControl(this.NIFNIPC, Validators.required),
      socialDenomination: new FormControl((this.returned != null && this.returned != undefined) ? this.merchantInfo.legalName : localStorage.getItem("clientName"), Validators.required), //sim,
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
      crcCode: new FormControl((this.returned != null && this.merchantInfo.incorporationStatement != undefined) ? this.merchantInfo.incorporationStatement.code : '', [Validators.required]), //sim
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
      natJuridicaN1: new FormControl((this.returned != null) ? this.merchantInfo.legalNature : '', [Validators.required]), //sim
      natJuridicaN2: new FormControl((this.returned != null) ? this.merchantInfo.legalNature2 : ''), //sim
      socialDenomination: new FormControl({ value: (this.returned != null) ? this.merchantInfo.legalName : localStorage.getItem("clientName"), disabled: localStorage.getItem("clientName") !== null }, Validators.required), //sim
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
      natJuridicaN1: new FormControl({ value: this.processClient.legalNature, disabled: true/*, disabled: this.clientExists */ }, [Validators.required]), //sim
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
    this.initializeBasicFormControl();
  }


  constructor(private logger: LoggerService, private datepipe: DatePipe, @Inject(configurationToken) private configuration: Configuration, private formBuilder: FormBuilder,
    private route: Router, private clientService: ClientService, private tableInfo: TableInfoService, private submissionService: SubmissionService, private data: DataService, private crcService: CRCService,
    private documentService: SubmissionDocumentService, private processNrService: ProcessNumberService,
    private stakeholderService: StakeholderService, private storeService: StoreService, private authService: AuthService) {

    //Gets Tipologia from the Client component 
    if (this.route.getCurrentNavigation().extras.state) {
      this.tipologia = this.route.getCurrentNavigation().extras.state["tipologia"];
      this.clientExists = this.route.getCurrentNavigation().extras.state["clientExists"];
      this.NIFNIPC = this.route.getCurrentNavigation().extras.state["NIFNIPC"];
      this.comprovativoCC = this.route.getCurrentNavigation().extras.state["comprovativoCC"];
      this.clientId = this.route.getCurrentNavigation().extras.state["clientId"];
      this.dataCC = this.route.getCurrentNavigation().extras.state["dataCC"];
      this.isClient = this.route.getCurrentNavigation().extras.state["isClient"];
      this.isFromSearch = this.route.getCurrentNavigation().extras.state["isFromSearch"];
    }

    this.socialDenomination = localStorage.getItem("clientName");

    this.returned = localStorage.getItem("returned");

    this.countriesListValid = this.isClient;
    this.formCountryIsValid = this.isClient;

    this.form = formBuilder.group({
      clientCharacterizationForm: new FormGroup({
        natJuridicaNIFNIPC: new FormControl(this.NIFNIPC, Validators.required), //sim
        commercialSociety: new FormControl(this.isCommercialSociety, [Validators.required]), //sim
        crcCode: new FormControl((this.returned != null && this.merchantInfo?.incorporationStatement != undefined) ? this.merchantInfo?.incorporationStatement?.code : '', [Validators.required]), //sim
        collectCRC: new FormControl(this.collectCRC)
      }),
      countrysForm: new FormGroup({
        expectableAnualInvoicing: new FormControl('', Validators.required),/*this.client.sales.annualEstimatedRevenue, Validators.required),*/
        services: new FormControl('', Validators.required),
        transactionsAverage: new FormControl('', Validators.required/*this.client.sales.averageTransactions, Validators.required*/),
        associatedWithGroupOrFranchise: new FormControl(false, Validators.required),
        preferenceDocuments: new FormControl('Portal', Validators.required),
        inputEuropa: new FormControl(false),
        inputAfrica: new FormControl(false),
        inputAmerica: new FormControl(false),
        inputOceania: new FormControl(false),
        inputAsia: new FormControl(false),
        franchiseName: new FormControl(''),
        NIPCGroup: new FormControl('')
      }),
      powerRepresentationForm: formBuilder.group({}),
    })

    if (localStorage.getItem("submissionId") != null) {
      this.submissionExists = true;
    }

    console.log('Form do Clientbyid: ', this.form);

    var context = this;
    if (this.clientId !== "-1" && this.clientId != null && this.clientId != undefined) {

    } else {
      this.updateBasicForm();
    }
    //this.initializeTableInfo();

    if (this.returned != null) {
      this.getMerchantInfo().then(result => {
        console.log('Result do getMerchantInfo: ', result);
      });
    }
  }

  getMerchantInfo() {
    return new Promise((resolve, reject) => {
      this.submissionService.GetSubmissionByProcessNumber(localStorage.getItem("processNumber")).then(result => {
          this.clientService.GetClientByIdAcquiring(result.result[0].submissionId).then(res => {
            this.merchantInfo = res;
            resolve(this.merchantInfo);
            //if (this.clientExists == undefined || this.clientExists == null) {
            //  if (this.merchantInfo.clientId != "" && this.merchantInfo.clientId != null) {
            //    this.clientExists = true;
            //  } else {
            //    this.clientExists = false;
            //  }
            //}
            //if (this.NIFNIPC === undefined) {
            //  this.NIFNIPC = this.merchantInfo.fiscalId;
            //}
            //if (this.merchantInfo.incorporationStatement !== null) {
            //  this.isCommercialSociety = true;
            //  this.collectCRC = true;
            //} else {
            //  if (this.merchantInfo.legalNature !== "") {
            //    this.isCommercialSociety = false;
            //    this.collectCRC = false;
            //    this.tipologia === 'Company';
            //  } else {
            //    this.isCommercialSociety = false;
            //    this.collectCRC = false;
            //    this.tipologia === 'ENI';
            //  }
            //}
          });
      });
    });
  }


  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    this.data.updateData(false, 1, 2);

    this.clientContext = new ClientContext(
      this.tipologia,
      this.clientExists,
      this.comprovativoCC,
      this.idClient,
      this.clientId,
      this.dataCC,
      this.isClient
    );

    if (this.returned == null) {
      if (!this.submissionExists || this.isFromSearch) {
        if (this.dataCC !== undefined && this.dataCC !== null) {
          var client: AcquiringClientPost = {} as AcquiringClientPost;

          client.fiscalId = this.dataCC.nifCC;
          client.shortName = client.legalName = client.commercialName =  this.dataCC.nameCC;
          client.bankInformation = {};
          client.headquartersAddress = {};
          client.headquartersAddress.address = this.dataCC.addressCC;
          client.headquartersAddress.country = this.dataCC.countryCC;
          client.headquartersAddress.locality = this.dataCC.localityCC;
          client.headquartersAddress.postalCode = this.dataCC.postalCodeCC;

          client.otherEconomicActivities = [];

          client["knowYourSales"] = {};
          client["knowYourSales"]["servicesOrProductsDestinations"] = [];
          client["knowYourSales"]["servicesOrProductsSold"] = [];

          client.shareCapital = {};
          client.incorporationStatement = {};
          client.contacts = {};

          client.merchantType = this.tipologia;

          client.documentationDeliveryMethod = 'Portal';

          this.clientContext.setClient(client);
          this.NIFNIPC = client.fiscalId;
          this.clientContext.setNIFNIPC(client.fiscalId);
          this.updateBasicForm();

          this.createSubmission();
        } else {

          if (this.clientId !== "-1" && this.clientId != null && this.clientId != undefined) {
            this.clientService.GetClientByIdOutbound(this.clientId).then(result => {
              var client = result;
              console.log("pesquisa do cliente: ", result);

              var clientToInsert: AcquiringClientPost = {};
              clientToInsert.clientId = client.merchantId;
              clientToInsert.merchantRegistrationId = client.merchantRegistrationId;
              clientToInsert.legalName = client.legalName;
              clientToInsert.commercialName = client.commercialName;
              clientToInsert.shortName = client.shortName;
              clientToInsert.headquartersAddress = {
                address: client.headquartersAddress?.address,
                postalCode: client.headquartersAddress?.postalCode,
                postalArea: client.headquartersAddress?.postalArea,
                country: client.headquartersAddress?.country
              }
              clientToInsert.fiscalId = client.fiscalIdentification?.fiscalId;
              clientToInsert.knowYourSales = {
                estimatedAnualRevenue: client.sales?.annualEstimatedRevenue,
                servicesOrProductsSold: client.sales?.productsOrServicesSold,
                servicesOrProductsDestinations: client.sales?.productsOrServicesCountries,
                transactionsAverage: client.sales?.transactionsAverage
              };

              clientToInsert.legalNature = client.legalNature;
              clientToInsert.legalNature2 = client.legalNature2;

              clientToInsert.incorporationStatement = client.incorporationStatement;
              clientToInsert.shareCapital = client.shareCapital;
              clientToInsert.byLaws = client.bylaws;
              clientToInsert.incorporationDate = client.incorporationDate;
              clientToInsert.mainTaxCode = client.principalTaxCode;
              clientToInsert.otherTaxCodes = client.otherTaxCodes;
              clientToInsert.mainEconomicActivity = client.principalEconomicActivity;
              clientToInsert.otherEconomicActivities = client.otherEconomicActivities;
              clientToInsert.billingEmail = client.billingEmail;


              clientToInsert.documentationDeliveryMethod = client.documentationDeliveryMethod;
              clientToInsert.bankInformation = client.bankingInformation;
              clientToInsert.contacts = {
                email: client.contacts?.email,
                phone1: {
                  phoneNumber: client.contacts?.phone1?.phoneNumber,
                  countryCode: client.contacts?.phone1?.internationalIndicative
                },
                phone2: {
                  phoneNumber: client.contacts?.phone2?.phoneNumber,
                  countryCode: client.contacts?.phone2?.internationalIndicative
                },
              }

              clientToInsert.businessGroup = {
                type: client.context,
                branch: client.contextId
              }

              clientToInsert.merchantType = client.merchantType;

              clientToInsert["documents"] = client.documents;
              this.clientDocs = client.documents;

              console.log("CLIENTE QUE VAI SER INSERIDO ", clientToInsert);

              this.clientContext.clientExists = true;
              this.clientContext.setClient(clientToInsert);

              this.NIFNIPC = client.fiscalIdentification.fiscalId;
              this.clientContext.setNIFNIPC(client.fiscalIdentification.fiscalId);

              this.updateBasicForm();

            }).then(result => {
              if (!this.clientContext.isClient) {
                this.countriesComponent.getClientContextValues();
              }
              this.clientCharacterizationComponent.getClientContextValues();
              this.createSubmission();
            });
          } else {
            //criar cliente aqui
            var currentClient = this.clientContext.getClient();
            var clientToInsert: AcquiringClientPost = {};

            clientToInsert.fiscalId = this.NIFNIPC;
            clientToInsert.legalName = this.socialDenomination;
            clientToInsert.knowYourSales = {
              servicesOrProductsDestinations: [],
              servicesOrProductsSold: []
            }
            clientToInsert.bankInformation = {}
            clientToInsert.businessGroup = {}
            clientToInsert.contacts = {
              phone1: {},
              phone2: {}
            }
            clientToInsert.otherEconomicActivities = [];
            clientToInsert.otherTaxCodes = [];
            clientToInsert.incorporationStatement = {};
            clientToInsert.shareCapital = {};

            clientToInsert.merchantType = this.tipologia;
            clientToInsert.documentationDeliveryMethod = 'Portal';

            this.clientContext.setNIFNIPC(this.NIFNIPC);
            this.clientContext.setClient(clientToInsert);
            this.createSubmission();
          }
        }
      } else {
        this.clientService.GetClientByIdAcquiring(localStorage.getItem("submissionId")).then(result => {
          this.clientContext.tipologia = result.merchantType;
          this.NIFNIPC = result.fiscalId;
          this.clientContext.setNIFNIPC(result.fiscalId);
          this.clientContext.submissionID = localStorage.getItem("submissionId");
          this.clientContext.setClient(result);

          //dados necessários para a pesquisa feita anteriormente
          this.tipologia = result.merchantType;
          this.clientId = result.fiscalId;

        }).then(result => {
          if (!this.clientContext.isClient) {
            this.countriesComponent.getClientContextValues();
          }
          this.clientCharacterizationComponent.getClientContextValues();
        });
      }
    } else {
      this.clientContext.setMerchantInfo(this.merchantInfo);
      this.clientContext.setClient(this.merchantInfo);
      this.countriesComponent.getClientContextValues();
      this.clientCharacterizationComponent.getClientContextValues();
    }


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
        this.legalNatureList2 = this.legalNatureList2.sort((a, b) => a.description > b.description ? 1 : -1);
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
    this.crcService.getCRC(crcInserted, '001').subscribe(o => {
      if (o === undefined || o === null) {
        this.crcNotExists = true;
        this.crcFound = false;
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
  }
  getCrcCode() {
    return this.form.get('crcCode').value;
  }

  onExpand(index: number) {
    this.data.updateData(false, 1, index + 2);
    if (this.lastExpandedTab !== undefined) {
      this.touchedTabs[this.lastExpandedTab] = true;
      if (this.lastExpandedTab === 0)
        this.clientCharacterizationComponent.submit(); //updates the client context when leaving the first tab
    }
    this.lastExpandedTab = index;
  }

  submit() {
    if (this.returned != 'consult') {
      this.clientCharacterizationComponent.submit();

      if (!this.clientContext.isClient)
        this.countriesComponent.submit();

      if (this.returned === 'edit')
        this.representationPowerComponent.submit();
      this.updateSubmission();
    } else {
      this.route.navigateByUrl('/stakeholders');
    }
  }

  redirectBeginningClient() {
    let navigationExtras: NavigationExtras = {
      state: {
        tipologia: this.tipologia,
        clientExists: this.clientExists,
        dataCC: this.dataCC,
        isClient: this.isClient,
        comprovativoCC: this.comprovativoCC,
      }
    };

    this.route.navigate(["/client"], navigationExtras);
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
    if (this.returned != 'consult') { 
      var context = this;
      var newSubmission = this.clientContext.newSubmission;
      newSubmission.startedAt = new Date().toISOString();
      newSubmission.merchant = this.clientContext.getClient();

      var loginUser = this.authService.GetCurrentUser();

      newSubmission.submissionUser = {
        user: loginUser.userName,
        branch: loginUser.bankLocation,
        partner: loginUser.bankName
      }

      var documentDelivery = newSubmission.merchant.documentationDeliveryMethod;
      var merchantType = newSubmission.merchant.merchantType;

      if (documentDelivery === 'viaDigital' || documentDelivery === 'Portal')
        newSubmission.merchant.documentationDeliveryMethod = 'Portal';
      else
        newSubmission.merchant.documentationDeliveryMethod = 'Mail';
      

      if (merchantType === 'corporation' || merchantType === 'Corporate' || merchantType === 'Company')
        newSubmission.merchant.merchantType = '01'; //'Corporate'
      else
        newSubmission.merchant.merchantType = '02'; //'Entrepeneur'

      if (this.tipologia === 'Corporate' || this.tipologia === 'Company' || this.tipologia === '01' || this.tipologia === 'corporation')
        newSubmission.merchant.merchantType = '01';
        
      if (this.tipologia === 'ENI' || this.tipologia === 'Entrepeneur' || this.tipologia === '02') {
        newSubmission.merchant.merchantType = '02';
        var client = this.clientContext.getClient();

      var stakeholder: IStakeholders = client as IStakeholders; //Formato a ser enviado à API
        stakeholder.fiscalId = client.fiscalId;
        stakeholder.fullName = client.legalName;
        stakeholder.contactName = client.commercialName;
        stakeholder.shortName = client.legalName;
        stakeholder.fiscalAddress = client.headquartersAddress;
        console.log("CC Data: ", this.dataCC);
        if (this.dataCC !== undefined && this.dataCC !== null) {
          stakeholder.identificationDocument = {
            type: '1001',
            country: this.clientContext.dataCC.countryCC,
            number: this.clientContext.dataCC.nifCC,
            expirationDate: this.clientContext.dataCC.expiryDate
          }

          this.clientContext.setStakeholdersToInsert([stakeholder]);
        }

        var stakeholderToShow: StakeholdersProcess = client as StakeholdersProcess; //Formato a ser representado na tabela dos poderes
         stakeholderToShow.fiscalId = client.fiscalId;
         stakeholderToShow.name = client.legalName;

        newSubmission.stakeholders.push(stakeholderToShow);
      }

      this.clientContext.setClient(newSubmission.merchant);

      if (!this.submissionExists) { 
        this.submissionService.InsertSubmission(newSubmission).subscribe(result => {
          context.clientContext.submissionID = result.id;
          localStorage.setItem("submissionId", result.id);
          context.processNrService.changeProcessNumber(result.processNumber);
        });
      }
    }
  }

  updateSubmission() {

    if (this.returned != 'consult') {

      var context = this;
      var submissionID = this.clientContext.submissionID ?? localStorage.getItem("submissionId");

      var newSubmission = this.clientContext.newSubmission;

      if (this.returned == 'edit')
        newSubmission.processNumber = localStorage.getItem("processNumber");

      this.submissionService.EditSubmission(submissionID, newSubmission).subscribe(result => {
        this.data.updateData(true, 1);
        this.route.navigateByUrl('/stakeholders');
      });
      var client = this.clientContext.getClient();
      var merchant = this.clientContext.newSubmission.merchant;

      var clientToSubmit: OutboundClient

      //antes estava merchant 
      this.clientService.EditClient(submissionID, client).subscribe(res => {
        console.log("resultado: ", res);
      });

      var stakeholders = this.clientContext.newSubmission.stakeholders;


      stakeholders.forEach(function (value, idx) {
        var cont = this;
        if (context.clientContext.tipologia === 'ENI') {
          if (value.fiscalId === client.fiscalId) {
            var stakeholder: IStakeholders = client as IStakeholders; //Formato a ser enviado à API
            stakeholder.fiscalId = client.fiscalIdentification?.fiscalId;
            stakeholder.fullName = client.legalName;
            stakeholder.contactName = client.commercialName;
            stakeholder.shortName = client.shortName;
            stakeholder.fiscalAddress = client.headquartersAddress;
            stakeholder.clientId = client.clientId;
            context.stakeholderService.UpdateStakeholder(submissionID, value.id, stakeholder);
          } else {
            context.stakeholderService.CreateNewStakeholder(submissionID, value).subscribe(result => {
            });
          }
        } else {
          context.stakeholderService.CreateNewStakeholder(submissionID, value).subscribe(result => {
          });
        }
      });

      // var documents = this.clientContext.newSubmission.documents;
      context.clientDocs.forEach(function (value, idx) {
        context.documentService.SubmissionPostDocument(submissionID, value).subscribe(result => {
          console.log("adicionou documento: ", result);
        });
      });


      if (this.clientContext.isClient) { 
        this.storeService.getShopsListOutbound(newSubmission.merchant.merchantRegistrationId, "por mudar", "por mudar").subscribe(res => {
          res.forEach(value => {
            this.storeService.getShopInfoOutbound(newSubmission.merchant.merchantRegistrationId, value.shopId, "por mudar", "por mudar").subscribe(r => {
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
                //productCode: r.product,
                //subproductCode: r.subproduct,
                website: r.url,
                equipments: []
              }

              context.storeService.addShopToSubmission(submissionID, storeToAdd).subscribe(shop => {

              });
            });
          });
        });
      }

    } else {
      this.route.navigate(['/stakeholders']);
    }
  }

  b64toBlob(b64Data: any, contentType: string, sliceSize: number) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    const blobUrl = window.URL.createObjectURL(blob);
    window.open(blobUrl, '_blank',
      `margin: auto;
      width: 50%;
      padding: 10px;
      text-align: center;
      border: 3px solid green;` );
  }

  getClientDocumentImage(uniqueReference: string, format: string) {
    this.documentService.GetDocumentImageOutbound(uniqueReference, "por mudar", "por mudar", format).subscribe(result => {
      this.b64toBlob(result.binary, 'application/pdf', 512);
    });
  }

  formClientCharacterizationIsValid(formCharact) {
    console.log("formulario: ", formCharact);

    if (formCharact.valid) {
      this.formClientIsValid = true;
    }

    formCharact.statusChanges.subscribe(res => {
      console.log("Client Characterization estado: ", res);
      if (res === 'VALID') {
        console.log("client charac estado valido");
        this.formClientIsValid = true;
      }
      else {
        console.log("client charact estado invalido");
        this.formClientIsValid = false;
      }
    })

    //this.clientContext.formClientCharacterizationReady.subscribe(ready => {
    //  console.log("FORM CLIENT CHARACTERIZATION ESTÁ PRONTO");
    //  if (ready) {
    //    context.clientCharacterizationComponent.form.statusChanges.subscribe(res => {
    //      console.log("SOFREU ALTERACOES NO ESTADO: ", res);
    //      console.log("formulário do client characterization: ", context.clientCharacterizationComponent?.form);
    //      if (res === 'VALID') {
    //        this.formClientIsValid = true;
    //      }
    //      else
    //        this.formClientIsValid = false;
    //    });
    //  }

    //})

    //this.clientContext.formCountrysReady.subscribe(ready => {
    //  if (ready) {
    //    context.countriesComponent.form.statusChanges.subscribe(res => {
    //      console.log("formulário do countries: ", context.countriesComponent?.form);
    //      if (res === 'VALID')
    //        this.formCountryIsValid = true;
    //      else
    //        this.formCountryIsValid = false;
    //    });
    //  }

    //})

    //this.clientContext.formClientCharacterizationValid?.subscribe(res => {
    //  if (res !== 'VALID')
    //    this.formClientIsValid = false;
    //});

    //this.clientContext.formCountrysValid?.subscribe(res => {
    //  if (res !== 'VALID')
    //    this.formCountryIsValid = false;
    //})
  }

  formClientCountryIsValid(formCountry: AbstractControl) {
    console.log("form country: ", formCountry);

    if (formCountry.valid) {
      this.formCountryIsValid = true;
    }

    formCountry.statusChanges.subscribe(res => {
      console.log("client country estado: ", res);
      if (res === 'VALID') {
        console.log("client country valido");
        this.formCountryIsValid = true;
      }
      else {
        console.log("client country invalido");
        this.formCountryIsValid = false;
      }
    })

  }

  countryListValidator(valid) {
    this.countriesListValid = valid;
  }
}
