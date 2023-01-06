import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AcquiringClientPost, OutboundClient } from '../Client.interface';
import { continents, countriesAndContinents } from '../countriesAndContinents';
import { DocumentSearchType, EconomicActivityInformation, LegalNature, SecondLegalNature } from '../../table-info/ITable-info.interface';
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

export class ClientByIdComponent implements OnInit, AfterViewInit {
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

  documents: DocumentSearchType[];

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
  submissionStakeholders: IStakeholders[] = [];
  isFromSearch: boolean = false;
  historyStream: boolean;
  updateClient: boolean;

  potentialClientIds: string[] = [];
  shortName: string;

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
      socialDenomination: new FormControl((this.returned != null && this.returned != undefined) ? this.merchantInfo.legalName : this.socialDenomination, Validators.required), //sim,
      commercialSociety: new FormControl(false, [Validators.required]), //sim
      collectCRC: new FormControl(this.collectCRC)
    });

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
      socialDenomination: new FormControl({ value: (this.returned != null) ? this.merchantInfo.legalName : this.socialDenomination, disabled: this.socialDenomination !== null }, Validators.required), //sim
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
    var formatedDate = separated[2] + "-" + separated[0] + "-" + separated[1];
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

  constructor(private logger: LoggerService, private datepipe: DatePipe, private formBuilder: FormBuilder,
    private route: Router, private clientService: ClientService, private tableInfo: TableInfoService, private submissionService: SubmissionService, private data: DataService, private crcService: CRCService,
    private documentService: SubmissionDocumentService, private processNrService: ProcessNumberService,
    private stakeholderService: StakeholderService, private storeService: StoreService, private authService: AuthService) {

    //Gets Tipologia from the Client component 
    if (this.route?.getCurrentNavigation()?.extras?.state) {
      this.tipologia = this.route.getCurrentNavigation().extras.state["tipologia"];
      this.clientExists = this.route.getCurrentNavigation().extras.state["clientExists"];
      this.NIFNIPC = this.route.getCurrentNavigation().extras.state["NIFNIPC"];
      this.comprovativoCC = this.route.getCurrentNavigation().extras.state["comprovativoCC"];
      this.clientId = this.route.getCurrentNavigation().extras.state["clientId"];
      this.dataCC = this.route.getCurrentNavigation().extras.state["dataCC"];
      this.isClient = this.route.getCurrentNavigation().extras.state["isClient"];
      this.isFromSearch = this.route.getCurrentNavigation().extras.state["isFromSearch"];
      this.potentialClientIds = this.route.getCurrentNavigation().extras.state["potentialClientIds"];
    }

    // check if, in return, there are changes in stakeholders list

    this.stakeholderService.GetAllStakeholdersFromSubmission(localStorage.getItem("submissionId")).then(result => {

      var stakeholders = result.result;

      stakeholders.forEach(function (value, index) {
        context.stakeholderService.GetStakeholderFromSubmission(localStorage.getItem("submissionId"), value.id).subscribe(res => {
          console.log("stakeholder adicionado com sucesso");
          context.form.addControl(index + "", new FormControl(null, Validators.required));
          context.submissionStakeholders.push(res);
        }, error => {
          console.log("Erro a adicionar stakeholder");
        });
      });
    }, error => {
    });

    if (localStorage.getItem("clientName") != null) {
      this.socialDenomination = localStorage.getItem("clientName");
      var nameArray = this.socialDenomination.split(" ").filter(element => element);
      this.shortName = nameArray?.length > 2 ? nameArray[0] + " " + nameArray[nameArray.length - 1] : this.socialDenomination;
    }


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
  }

  ngAfterViewInit(): void {
    console.log('VALOR DO CHARACTERIZATION ', this.clientCharacterizationComponent);

  }

  async getMerchantInfo() {
    try {
      var context = this;
      return new Promise((resolve, reject) => {
        context.submissionService.GetSubmissionByProcessNumber(localStorage.getItem("processNumber")).then(function (result) {
          console.log('GET DA SUBMISSION PROCESS NUMBER ', result);
          return result;
        }).then(function (resul) {
          context.clientService.GetClientByIdAcquiring(resul.result[0].submissionId).then(function (res) {
            console.log('GET DA SUBMISSION PELO ID ', res);
            context.merchantInfo = res;
            return context.merchantInfo;
          }).then(function (r) {
            resolve(r);
            return r;
          });
        });
      });
    } catch (err) {
      console.log(err);
    }
  }


  async ngOnInit() {
    var context = this;
    if (this.returned != null) {
      let promise = await context.getMerchantInfo();
      console.log('Promise ', promise);
      if (context.merchantInfo.clientId != null) {
        context.isClient = true;
      } else {
        context.isClient = false;
      }
    }

    console.log('VALOR DO IS CLIENT ', this.isClient);

    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    this.subscription = this.data.historyStream.subscribe(historyStream => this.historyStream = historyStream);
    this.subscription = this.data.updatedClient.subscribe(updateClient => this.updateClient = updateClient);
    this.data.updateData(false, 1, 2);

    //if (this.updateClient)
    //  this.clientId = localStorage.getItem("documentNumber");

    this.clientContext = new ClientContext(
      this.tipologia,
      this.clientExists,
      this.comprovativoCC,
      this.idClient,
      this.clientId,
      this.dataCC,
      this.isClient
    );

    console.log('VALOR DO IS CLIENT NO CLIENT CONTEXT ', this.clientContext.isClient);

    if (this.returned == null) {
      if (!this.submissionExists || this.isFromSearch) {
        if (this.dataCC !== undefined && this.dataCC !== null) {
          this.data.changeCurrentDataCC(this.dataCC);
          var client: AcquiringClientPost = {} as AcquiringClientPost;

          this.clientService.GetClientByIdOutbound(this.dataCC.nifCC).then(result => {
            console.log('RESULTADO ', result);
            client.clientId = result.merchantId;
            client.merchantRegistrationId = result.merchantRegistrationId;
            //client.legalName = result.legalName;
            //client.commercialName = result.commercialName;
            //client.shortName = result.shortName;
            if ((this.dataCC.addressCC != " " && this.dataCC.addressCC != null) || (this.dataCC.countryCC != " " && this.dataCC.countryCC != null) || (this.dataCC.localityCC != " " && this.dataCC.localityCC != null) || (this.dataCC.postalCodeCC != " " && this.dataCC.postalCodeCC != null)) {
              client.headquartersAddress.address = this.dataCC.addressCC;
              client.headquartersAddress.country = this.dataCC.countryCC;
              client.headquartersAddress.locality = this.dataCC.localityCC;
              client.headquartersAddress.postalCode = this.dataCC.postalCodeCC;
            } else {
              client.headquartersAddress = {
                address: result.headquartersAddress?.address,
                postalCode: result.headquartersAddress?.postalCode,
                postalArea: result.headquartersAddress?.postalArea,
                country: result.headquartersAddress?.country
              }
            }

            client.fiscalId = result.fiscalIdentification?.fiscalId;
            client.knowYourSales = {
              estimatedAnualRevenue: result.sales?.annualEstimatedRevenue,
              servicesOrProductsSold: result.sales?.productsOrServicesSold,
              servicesOrProductsDestinations: result.sales?.productsOrServicesCountries,
              transactionsAverage: result.sales?.transactionsAverage
            };

            client.legalNature = result.legalNature;
            client.legalNature2 = result.legalNature2;

            client.incorporationStatement = result.incorporationStatement;
            client.shareCapital = result.shareCapital;
            client.byLaws = result.bylaws;
            client.incorporationDate = result.incorporationDate;
            client.mainTaxCode = result.principalTaxCode;
            client.otherTaxCodes = result.otherTaxCodes;
            client.mainEconomicActivity = result.principalEconomicActivity;
            client.otherEconomicActivities = result.otherEconomicActivities;
            client.billingEmail = result.billingEmail;


            client.documentationDeliveryMethod = result.documentationDeliveryMethod;
            client.bankInformation = result.bankingInformation;
            client.contacts = {
              email: result.contacts?.email,
              phone1: {
                phoneNumber: result.contacts?.phone1?.phoneNumber,
                countryCode: result.contacts?.phone1?.internationalIndicative
              },
              phone2: {
                phoneNumber: result.contacts?.phone2?.phoneNumber,
                countryCode: result.contacts?.phone2?.internationalIndicative
              },
            }

            clientToInsert.businessGroup = {
              type: result.context,
              branch: result.contextId
            }

            client.merchantType = result.merchantType;

            client["documents"] = result.documents;
            this.clientDocs = result.documents;

            this.clientDocs.forEach(doc => {
              doc.validUntil = this.datepipe.transform(doc.validUntil, "yyyy-MM-dd");
              doc.receivedAt = this.datepipe.transform(doc.receivedAt, "yyyy-MM-dd");
            });

            this.getDocumentDescription(this.clientDocs);

            console.log("CLIENTE QUE VAI SER INSERIDO ", clientToInsert);

            this.clientContext.clientExists = true;
            this.clientContext.setClient(client);
            this.NIFNIPC = client.fiscalId;
            this.clientContext.setNIFNIPC(client.fiscalId);

          }, error => {
            //Promise.reject('não encontrou cliente');
            console.log('ERRO ', error);
            client.fiscalId = this.dataCC.nifCC;
            client.shortName = client.legalName = client.commercialName = this.dataCC.nameCC;
            client.bankInformation = {};
            client.headquartersAddress = {};
            client.otherEconomicActivities = [];
            client.businessGroup = {};

            client["knowYourSales"] = {};
            client["knowYourSales"]["servicesOrProductsDestinations"] = [];
            client["knowYourSales"]["servicesOrProductsSold"] = [];

            client.shareCapital = {};
            client.incorporationStatement = {};
            client.contacts = {};

            client.merchantType = this.tipologia;

            client.documentationDeliveryMethod = 'Portal';

            this.clientContext.setClient(client);
            this.clientContext.isClient = false;
            this.NIFNIPC = this.dataCC.nifCC;
            this.clientContext.setNIFNIPC(this.dataCC.nifCC);
          }).then(val => {
            if (!this.clientContext.isClient) {
              this.countriesComponent.getClientContextValues();
            }
            this.clientCharacterizationComponent.getClientContextValues();
            this.updateBasicForm();
            this.createSubmission();
          });

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

              clientToInsert.incorporationStatement = {
                code: client.incorporationStatement.code,
                validUntil: client.incorporationStatement.validUntil
              } 

              clientToInsert.shareCapital = client.shareCapital;
              clientToInsert.byLaws = client.bylaws;
              clientToInsert.incorporationDate = client.incorporationDate;
              clientToInsert.mainTaxCode = client.principalTaxCode; //
              clientToInsert.otherTaxCodes = client.otherTaxCodes;
              clientToInsert.mainEconomicActivity = client.principalEconomicActivity; //
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

              //clientToInsert.potentialClientIds = this.potentialClientIds;

              clientToInsert.merchantType = client.merchantType;

              clientToInsert["documents"] = client.documents;
              this.clientDocs = client.documents;

              this.clientDocs.forEach(doc => {
                doc.validUntil = this.datepipe.transform(doc.validUntil, "yyyy-MM-dd");
                doc.receivedAt = this.datepipe.transform(doc.receivedAt, "yyyy-MM-dd");
              });

              this.getDocumentDescription(this.clientDocs);

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
            clientToInsert.commercialName = this.socialDenomination;
            clientToInsert.shortName = this.shortName ?? this.socialDenomination;
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


          context.documentService.GetSubmissionDocuments(localStorage.getItem("submissionId")).subscribe(res => {
            if (res.length > 0) {
              res.forEach(doc => {
                if (doc.type === '0018') { 
                  context.documentService.GetSubmissionDocumentById(localStorage.getItem("submissionId"), doc.id).subscribe(r => {
                    var file = {
                      documentType: 'Cartão do Cidadão',
                      receivedAt: this.datepipe.transform(r.receivedAt, "yyyy-MM-dd"),
                      validUntil: this.datepipe.transform(r.validUntil, "yyyy-MM-dd"),
                      uniqueReference: r.id,
                      archiveSource: null,
                    } as OutboundDocument;
                    this.clientDocs = [];
                    this.clientDocs.push(file);
                  });
                }
              });
            }
          });


        }).then(result => {
          if (!this.clientContext.isClient) {
            this.countriesComponent.getClientContextValues();
          }
          this.clientCharacterizationComponent.getClientContextValues();
          this.createSubmission();
        });
      }
    } else {
      //this.clientContext.clientExists = false;
      this.clientContext.isClient = this.isClient;
      this.clientContext.setMerchantInfo(this.merchantInfo);
      this.clientContext.setClient(this.merchantInfo);
      this.clientContext.setNIFNIPC(this.merchantInfo.fiscalId);
      this.clientContext.tipologia = this.merchantInfo.merchantType;
      console.log('CLIENT CONTEXT ', this.clientContext.isClient);
      //if (!this.clientContext.isClient) {
      //  this.countriesComponent.getClientContextValues();
      //}
      //this.clientCharacterizationComponent.getClientContextValues();
    }

    //return null;
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub?.unsubscribe);
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

  getDocumentDescription(docs: OutboundDocument[]) {
    this.subs.push(this.tableInfo.GetDocumentsDescription().subscribe(result => {
      this.documents = result;
      this.documents.forEach(doc => {
        if (docs[0].documentType === doc.code) {
          docs[0].documentType = doc.description;
        }
      });
    }))
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

      var economicActivity = clientByCRC.economicActivity.main.split('-')[0];

      var clientByCRC = o;

      this.crcFound = true;
      this.crcNotExists = false;
      this.errorMsg = '';
      this.processClient.legalNature = clientByCRC.legalNature;
      this.processClient.mainEconomicActivity = economicActivity;
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
      this.data.updateData(true, 1);
      this.route.navigateByUrl('/stakeholders');
    }
  }

  redirectBeginningClient() {
    this.data.changeCurrentDataCC(this.dataCC);
    if (!this.historyStream) {
      let navigationExtras: NavigationExtras = {
        state: {
          tipologia: this.tipologia,
          clientExists: this.clientExists,
          dataCC: this.dataCC,
          isClient: this.isClient,
          comprovativoCC: this.comprovativoCC,
        }
      };

      if (this.returned == null)
        this.route.navigate(["/client"], navigationExtras);

    } else {
      this.route.navigate(["/app-devolucao/"]);
    }
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
      newSubmission.merchant.potentialClientIds = this.potentialClientIds;

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
        newSubmission.merchant.merchantType = 'Corporate'; 
      else
        newSubmission.merchant.merchantType = 'Entrepeneur'; 

      if (this.tipologia === 'Corporate' || this.tipologia === 'Company' || this.tipologia === '01' || this.tipologia === 'corporation')
        newSubmission.merchant.merchantType = 'Corporate';
        
      if (this.tipologia === 'ENI' || this.tipologia === 'Entrepeneur' || this.tipologia === '02') {
        newSubmission.merchant.merchantType = 'Entrepeneur';
        var client = this.clientContext.getClient();

        var stakeholder: IStakeholders = {} as IStakeholders; //Formato a ser enviado à API
        stakeholder.fiscalId = client.fiscalId;
        stakeholder.fullName = client.legalName;
        stakeholder.contactName = client.commercialName;
        stakeholder.shortName = client.legalName;
        stakeholder.fiscalAddress = client.headquartersAddress;
        stakeholder.phone1 = {
          countryCode: client.contacts?.phone1?.countryCode,
          phoneNumber: client.contacts?.phone1?.phoneNumber
        };
        stakeholder.phone2 = {
          countryCode: client.contacts?.phone2?.countryCode,
          phoneNumber: client.contacts?.phone2?.countryCode
        };
        stakeholder.email = client.contacts.email;
        console.log("CC Data: ", this.dataCC);
        if (this.dataCC !== undefined && this.dataCC !== null) {
          stakeholder.signType = "DigitalCitizenCard";
          var birthDate = this.clientContext.dataCC.birthdateCC.split(" ");
          stakeholder.birthDate = this.datepipe.transform(new Date(birthDate[2] + " " + birthDate[1] + " " + birthDate[0]), 'yyyy-MM-dd');
          stakeholder.identificationDocument = {
            type: '0018',
            country: this.clientContext.dataCC.countryCC,
            number: this.clientContext.dataCC.cardNumberCC,
            expirationDate: this.clientContext.dataCC.expiryDate
          }

        }
        this.clientContext.setStakeholdersToInsert([stakeholder]);
        //var stakeholderToShow: StakeholdersProcess = {} as StakeholdersProcess; //Formato a ser representado na tabela dos poderes
        //stakeholderToShow.fiscalId = client.fiscalId;
        //stakeholderToShow.name = client.legalName;

        newSubmission.stakeholders.push(stakeholder);
        //this.clientContext.newSubmission = newSubmission;
      }

      this.clientContext.newSubmission = newSubmission;
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



      let navigationExtras: NavigationExtras = {
        state: {
          isClient: this.isClient
        }
      };

      var context = this;
      var submissionID = this.clientContext.submissionID ?? localStorage.getItem("submissionId");

      var newSubmission = this.clientContext.newSubmission;

      if (this.returned == 'edit')
        newSubmission.processNumber = localStorage.getItem("processNumber");

      this.submissionService.EditSubmission(submissionID, newSubmission).subscribe(result => {
        this.data.changeUpdatedClient(true);
        this.data.updateData(true, 1);
        this.route.navigateByUrl('/stakeholders', navigationExtras);
      });
      var client = this.clientContext.getClient();
      var merchant = this.clientContext.newSubmission.merchant;

      var clientToSubmit: OutboundClient

      //antes estava merchant 
      this.clientService.EditClient(submissionID, client).subscribe(res => {
        console.log("resultado: ", res);
      });

      var stakeholder = this.clientContext.newSubmission.stakeholders;
      stakeholder.forEach(function (value, idx) {
        if (context.clientContext.tipologia === 'ENI' || context.clientContext.tipologia === 'Entrepeneur' || context.clientContext.tipologia === '02') {
          if (value.fiscalId === client.fiscalId) {
            //value.fiscalId = client.fiscalIdentification?.fiscalId;
            //value.fullName = client.legalName;
            //value.contactName = client.commercialName;
            //value.shortName = client.shortName;
            //value.fiscalAddress = client.headquartersAddress;
            //value.clientId = client.clientId;
            context.stakeholderService.UpdateStakeholder(submissionID, value.id, value);
          }
        }
      })

      if (!this.compareArrays(context.submissionStakeholders, this.clientContext.newSubmission.stakeholders)) {
        var stakeholders = this.clientContext.newSubmission.stakeholders;

        stakeholders.forEach(function (value, idx) {
          var cont = this;
          if (context.clientContext.tipologia === 'ENI' || context.clientContext.tipologia === 'Entrepeneur' || context.clientContext.tipologia === '02') {
            if (value.fiscalId !== client.fiscalId) {
              context.stakeholderService.CreateNewStakeholder(submissionID, value).subscribe(result => {
              });
            }
          } else {
            context.stakeholderService.CreateNewStakeholder(submissionID, value).subscribe(result => {
            });
          }
        });

        if (newSubmission.documents.length > 0) {
          newSubmission.documents.forEach(doc => {
            context.documentService.SubmissionPostDocument(submissionID, doc).subscribe(result => {
              console.log('documento adicionado: ', result);
            });
          });
        }

        // var documents = this.clientContext.newSubmission.documents;
        if (context.clientDocs != null) {
          context.clientDocs.forEach(function (value, idx) {
            context.documentService.SubmissionPostDocument(submissionID, value).subscribe(result => {
              console.log("adicionou documento: ", result);
            });
          });
        }




        if (this.clientContext.isClient) {
          this.storeService.getShopsListOutbound(newSubmission.merchant.merchantRegistrationId, "por mudar", "por mudar").subscribe(res => {
            res.forEach(value => {
              this.storeService.getShopInfoOutbound(newSubmission.merchant.merchantRegistrationId, value.shopId, "por mudar", "por mudar").then(r => {
                var storeToAdd: ShopDetailsAcquiring = {
                  activity: r.result.activity,
                  subActivity: r.result.secondaryActivity,
                  address: {
                    address: r.result.address.address,
                    isInsideShoppingCenter: r.result.address.isInsideShoppingCenter,
                    shoppingCenter: r.result.address.shoppingCenter,
                    useMerchantAddress: r.result.address.sameAsMerchantAddress
                  },
                  bank: {
                    bank: r.result.bankingInformation
                  },
                  name: r.result.name,
                  //productCode: r.product,
                  //subproductCode: r.subproduct,
                  website: r.result.url,
                  equipments: []
                }

                context.storeService.addShopToSubmission(submissionID, storeToAdd).subscribe(shop => {

                });
              });
            });
          });
        }
      }


    } else {
      this.data.updateData(true, 1);
      this.route.navigate(['/stakeholders']);
    }
  }
  compareArrays(a1, a2) {
    var l = Math.min(a1.length, a2.length);
    for (var i = 0; i < l; i++) {
        if (a1[i] !== a2[i]) {
            return false;
        }
    }
    return true;
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

  getClientDocumentImage(uniqueReference: string, format: string, archiveSource: string) {
    if (archiveSource != null) {
      this.documentService.GetDocumentImageOutbound(uniqueReference, "por mudar", "por mudar", format).subscribe(result => {
        this.b64toBlob(result.binary, 'application/pdf', 512);
      });
    } else {
      this.documentService.GetDocumentImage(localStorage.getItem("submissionId"), uniqueReference).subscribe(result => {
        this.b64toBlob(result.binary, 'application/pdf', 512);
      })
    }
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

  onActivate() {
    let scrollToTop = window.setInterval(() => {
      let pos = window.pageYOffset;
      if (pos > 0) {
        window.scrollTo(0, pos - 100); // how far to scroll on each step
      } else {
        window.clearInterval(scrollToTop);
      }
    }, 16);
  }

}
