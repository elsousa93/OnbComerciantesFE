import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AcquiringClientPost, OutboundClient } from '../Client.interface';
import { DocumentSearchType, EconomicActivityInformation, LegalNature, SecondLegalNature } from '../../table-info/ITable-info.interface';
import { TableInfoService } from '../../table-info/table-info.service';
import { SubmissionService } from '../../submission/service/submission-service.service'
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { catchError, Subscription } from 'rxjs';
import { DataService } from '../../nav-menu-interna/data.service';
import { ClientService } from '../client.service';
import { CRCService } from '../../CRC/crcservice.service';
import { CRCProcess } from '../../CRC/crcinterfaces';
import { DatePipe } from '@angular/common';
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
import { IStakeholders, OutboundDocument, PostCorporateEntity } from '../../stakeholders/IStakeholders.interface';
import { AuthService } from '../../services/auth.service';
import { ISubmissionDocument } from '../../submission/document/ISubmission-document';
import { SubmissionPostDocumentTemplate } from '../../submission/ISubmission.interface';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ProcessService } from '../../process/process.service';
import { QueuesService } from '../../queues-detail/queues.service';
import { AppConfigService } from '../../app-config.service';
import { MatSnackBar } from '@angular/material/snack-bar';
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
  @ViewChild('returnModal') returnModal;
  returnModalRef: BsModalRef | undefined;
  @ViewChild('cancelModal') cancelModal;
  cancelModalRef: BsModalRef | undefined;

  /*Variable declaration*/
  form: FormGroup;
  myControl = new FormControl('');
  clientContext: ClientContext;

  errorMsg: string = "";
  public clientId: string;
  socialDenomination: string;
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
  submissionType: string;

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
  submissionDocs: ISubmissionDocument[] = [];
  error: boolean = false;
  queueName: string = "";
  title: string;
  merchant: boolean;
  updateProcessId: string;
  processInfo: any;
  clientAux: any;

  updateBasicForm() {
    this.form.get("clientCharacterizationForm").get("natJuridicaNIFNIPC").setValue(this.NIFNIPC);
  }

  constructor(private logger: LoggerService, private datepipe: DatePipe, private formBuilder: FormBuilder,
    private route: Router, private clientService: ClientService, private tableInfo: TableInfoService, private submissionService: SubmissionService, private data: DataService, private crcService: CRCService,
    private documentService: SubmissionDocumentService, private processNrService: ProcessNumberService,
    private stakeholderService: StakeholderService, private storeService: StoreService, private authService: AuthService, private translate: TranslateService, private modalService: BsModalService, private processService: ProcessService, private queueService: QueuesService, private configuration: AppConfigService, private snackBar: MatSnackBar) {
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
      this.potentialClientIds = JSON.parse(this.route.getCurrentNavigation().extras.state["potentialClientIds"]);
    }

    if (localStorage.getItem("clientName") != null) {
      this.socialDenomination = localStorage.getItem("clientName");
      var nameArray = this.socialDenomination.split(" ").filter(element => element);
      this.shortName = nameArray?.length > 2 ? nameArray[0] + " " + nameArray[nameArray.length - 1] : this.socialDenomination;
      this.shortName.slice(0, 40);
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
        NIPCGroup: new FormControl(''),
        countries: new FormControl([]),
        continent: new FormControl('EUROPA')
      }),
      powerRepresentationForm: formBuilder.group({}),
    })

    if (localStorage.getItem("submissionId") != null) {
      this.submissionExists = true;
    }

    var context = this;
    if (this.clientId !== "-1" && this.clientId != null && this.clientId != undefined) {

    } else {
      this.updateBasicForm();
    }
  }

  ngAfterViewInit(): void {}

  async getMerchantInfo() {
    try {
      var context = this;
      return new Promise((resolve, reject) => {
        if (this.returned == 'consult') {
          context.processService.getMerchantFromProcess(context.processId).subscribe(res => {
            context.logger.info("Get process client by id result: " + JSON.stringify(res));
            context.merchantInfo = res;
            context.clientDocs = [];
            context.merchantInfo.documents.forEach(doc => {
              var docOutbound = {
                documentType: doc.documentType,
                uniqueReference: doc.id,
                validUntil: context.datepipe.transform(doc.validUntil, "yyyy-MM-dd"),
                purpose: doc.purposes[0],
              } as OutboundDocument;
              context.clientDocs.push(docOutbound);
            });
            this.fetchDocumentDescriptions();
            resolve(res);
            return res;
          });
        } else if (this.returned == 'edit' && this.processId != null && this.processId != '') {
          var updateProcessBody = {
            submissionUser: "",
            observation: "",
            contractPackLanguage: "",
            signType: "",
            isClientAwaiting: false
          };
          context.processService.getProcessById(context.processId).subscribe(result => {
            if (!result.updateProcessInformation.isInProgress) {
              updateProcessBody.submissionUser = context.authService.GetCurrentUser().userName;
              updateProcessBody.signType = result.contractSignature.signType;
              updateProcessBody.isClientAwaiting = result.isClientAwaiting;
              context.processService.updateProcess(context.processId, updateProcessBody).then(res => {
                context.updateProcessId = res.result.updateProcessId;
                context.processNrService.changeUpdateProcessId(context.updateProcessId);
                context.processService.getUpdateProcessInfo(context.processId, context.updateProcessId).then(r => {
                  context.processInfo = r.result;
                  context.merchantInfo = r.result.merchant;
                  context.clientDocs = [];
                  context.merchantInfo.documents.forEach(doc => {
                    var docOutbound = {
                      documentType: doc.documentType,
                      uniqueReference: doc.id,
                      validUntil: context.datepipe.transform(doc.validUntil, "yyyy-MM-dd"),
                      purpose: doc.purposes[0],
                    } as OutboundDocument;
                    context.clientDocs.push(docOutbound);
                  });
                  this.fetchDocumentDescriptions();
                  context.merchantInfo.documents = null;
                  context.merchantInfo.id = null;
                  context.merchantInfo.riskAssessment = null;
                  context.merchantInfo.updateProcessAction = null;
                  if (context.merchantInfo.contacts.phone1 != null) {
                    context.merchantInfo.contacts.phone1.phoneIndicative = null;
                  }
                  if (context.merchantInfo.contacts.phone2 != null) {
                    context.merchantInfo.contacts.phone2.phoneIndicative = null;
                  }
                  context.merchantInfo = Object.fromEntries(Object.entries(context.processInfo.merchant).filter(([_, v]) => v != null));
                  resolve(r.result.merchant);
                  return r.result.merchant;
                });
              });
            } else {
              context.updateProcessId = result.updateProcessInformation.id;
              context.processNrService.changeUpdateProcessId(context.updateProcessId);
              context.processService.getUpdateProcessInfo(context.processId, context.updateProcessId).then(r => {
                context.processInfo = r.result;
                context.merchantInfo = r.result.merchant;
                context.clientDocs = [];
                context.merchantInfo.documents.forEach(doc => {
                  var docOutbound = {
                    documentType: doc.documentType,
                    uniqueReference: doc.id,
                    validUntil: doc.validUntil,
                    purpose: doc.purposes[0],
                  } as OutboundDocument;
                  context.clientDocs.push(docOutbound);
                });
                context.merchantInfo.documents = null;
                context.merchantInfo.id = null;
                context.merchantInfo.riskAssessment = null;
                context.merchantInfo.updateProcessAction = null;
                if (context.merchantInfo.contacts.phone1 != null) {
                  context.merchantInfo.contacts.phone1.phoneIndicative = null;
                }
                if (context.merchantInfo.contacts.phone2 != null) {
                  context.merchantInfo.contacts.phone2.phoneIndicative = null;
                }
                context.merchantInfo = Object.fromEntries(Object.entries(context.processInfo.merchant).filter(([_, v]) => v != null));
                resolve(r.result.merchant);
                return r.result.merchant;
              });
            }
          });
        } else {
          context.submissionService.GetSubmissionByProcessNumber(localStorage.getItem("processNumber")).then(function (result) {
            context.logger.info("Get submission by process number result: " + JSON.stringify(result));
            context.submissionType = result?.result[0]?.submissionType;
            localStorage.setItem("submissionId", result?.result[0]?.submissionId);
            return result;
          }).then(function (resul) {
            context.clientService.GetClientByIdAcquiring(resul?.result[0]?.submissionId).then(function (res) {
              context.logger.info("Get client by id result: " + JSON.stringify(res));
              context.merchantInfo = res;
              context.clientDocs = [];
              context.merchantInfo.documents.forEach(doc => {
                var docOutbound = {
                  documentType: doc.documentType,
                  uniqueReference: doc.id,
                  validUntil: context.datepipe.transform(doc.validUntil, "yyyy-MM-dd"),
                  purpose: doc.purposes[0],
                } as OutboundDocument;
                context.clientDocs.push(docOutbound);
              });
              context.fetchDocumentDescriptions();
              return context.merchantInfo;
            }).then(function (r) {
              resolve(r);
              return r;
            });
          });
        }
      });
    } catch (err) {
      this.logger.error(err);
    }
  }

  async ngOnInit() {
    var context = this;
    this.subscription = this.processNrService.processId.subscribe(id => this.processId = id);
    this.subscription = this.processNrService.updateProcessId.subscribe(id => this.updateProcessId = id);
    if (this.returned != null) {
      let promise = await context.getMerchantInfo();
      if (context.merchantInfo.clientId != null) {
        context.isClient = true;
      } else {
        context.isClient = false;
      }
    }
    this.subscription = this.data.currentMerchant.subscribe(merchant => this.merchant = merchant);
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    this.subscription = this.data.historyStream.subscribe(historyStream => this.historyStream = historyStream);
    this.subscription = this.data.updatedClient.subscribe(updateClient => this.updateClient = updateClient);
    this.subscription = this.data.currentQueueName.subscribe(queueName => {
      if (queueName != null) { 
        this.translate.get('homepage.diaryPerformance').subscribe((translated: string) => {
          this.queueName = this.translate.instant('homepage.' + queueName);
          this.title = this.translate.instant('client.title');
        });
      }
    });


    if (this.isClient == null) {
      this.subscription = this.data.currentIsClient.subscribe(isClient => this.isClient = isClient); 
    }
    if (this.dataCC == null) {
      this.subscription = this.data.currentDataCC.subscribe(dataCC => this.dataCC = dataCC);
    }

    if (!this.merchant) {
      this.data.updateData(false, 1, 2);
    } else {
      this.data.updateData(true, 1, 2);
    }

    this.clientContext = new ClientContext(
      this.tipologia,
      this.clientExists,
      this.comprovativoCC,
      this.idClient,
      this.clientId,
      this.dataCC,
      this.isClient
    );

    if (this.submissionExists || this.returned == 'edit' && (this.processId == '' || this.processId == null) ) {
      this.stakeholderService.GetAllStakeholdersFromSubmission(localStorage.getItem("submissionId")).then(result => {
        context.logger.info("Get all stakeholders from submission result: " + JSON.stringify(result));
        var stakeholders = result.result;
        stakeholders.forEach(function (value, index) {
          context.stakeholderService.GetStakeholderFromSubmission(localStorage.getItem("submissionId"), value.id).then(res => {
            context.logger.info("Get stakeholder from submission result: " + JSON.stringify(res));
            context.submissionStakeholders.push(res.result);
            var stakeholdersToInsert = context.clientContext.getStakeholdersToInsert();
            stakeholdersToInsert.push(res.result);
            context.clientContext.setStakeholdersToInsert(stakeholdersToInsert);
          }, error => {
            context.logger.error(error);
          }).then(r => {


          });
        });
      }, error => {
        context.logger.error(error);
      }).then(res => {
        //var stakeholdersToInsert = context.clientContext.getStakeholdersToInsert();
        //stakeholdersToInsert.push(...context.submissionStakeholders);
        //context.clientContext.setStakeholdersToInsert(stakeholdersToInsert);
      });

      this.documentService.GetSubmissionDocuments(localStorage.getItem("submissionId")).subscribe(result => {
        context.logger.info("Get submission documents result: " + JSON.stringify(result));
        if (result.length > 0) {
          result.forEach(doc => {
            this.documentService.GetSubmissionDocumentById(localStorage.getItem("submissionId"), doc.id).subscribe(res => {
              context.logger.info("Get submission document result: " + JSON.stringify(res));
              this.submissionDocs.push(res);
            });
          });
        }
      });
    }

    if ((this.processId != '' && this.processId != null) && this.returned != null) {
      var queueName = "";
      this.processNrService.queueName.subscribe(name => queueName = name);
      if (queueName == "devolucao") {
        this.submissionType = 'DigitalComplete';
      }
      if (this.returned == 'consult') {
        this.queueService.GetProcessStakeholders(this.processId).then(result => {
          context.logger.info("Get all stakeholders from submission result: " + JSON.stringify(result));
          var stakeholders = result;
          let length = 0;
          stakeholders.forEach(function (value, index) {
            length++;
            context.processService.getStakeholderByIdFromProcess(context.processId, value.id).subscribe(res => {
              context.logger.info("Get stakeholder from submission result: " + JSON.stringify(res));
              context.submissionStakeholders.push(res);
              if (length == stakeholders.length) {
                context.clientContext.setStakeholdersToInsert([...context.submissionStakeholders]);
              }
            }, error => {
              context.logger.error(error);
            })
          });
        }, error => {
          context.logger.error(error);
        }).then(res => {
          context.clientContext.setStakeholdersToInsert([...context.submissionStakeholders]);
        });

        this.processService.getDocumentFromProcess(this.processId).subscribe(result => {
          context.logger.info("Get submission documents result: " + JSON.stringify(result));
          if (result.length > 0) {
            result.forEach(doc => {
              this.processService.getDocumentDetailsFromProcess(this.processId, doc.id).subscribe(res => {
                context.logger.info("Get submission document result: " + JSON.stringify(res));
                this.submissionDocs.push(res);
              });
            });
          }
        })
      } else {
        if (this.processInfo.stakeholders.length > 0) {
          this.processInfo.stakeholders.forEach(stake => {
            if (stake.updateProcessAction != "Delete") {
              stake.documents = null;
              if (stake.phone1 != null) {
                stake.phone1.phoneIndicative = null;
              }
              if (stake.phone2 != null) {
                stake.phone2.phoneIndicative = null;
              }
              let o = Object.fromEntries(Object.entries(stake).filter(([_, v]) => v != null));
              this.submissionStakeholders.push(o);
            }
          });
          this.clientContext.setStakeholdersToInsert([...this.submissionStakeholders]);
        }

        if (this.processInfo.documents.length > 0) {
          this.processInfo.documents.forEach(doc => {
            if (doc.updateProcessAction != "Delete") {
              this.submissionDocs.push(doc);
            }
          });
        }
      }

    }

    if (this.returned == null) {
      if (!this.submissionExists || this.isFromSearch) {
        if (this.dataCC?.nifCC != null) {
          this.data.changeCurrentDataCC(this.dataCC);
          var client: AcquiringClientPost = {} as AcquiringClientPost;

          this.clientService.SearchClientByQuery(this.dataCC.nifCC, "0501", "", "").subscribe(res => {
            context.logger.info("Search client by query result: " + JSON.stringify(res));
            if (res.length > 0) {
              this.clientService.getClientByID(res[0].merchantId, "por mudar", "por mudar").then(result => {
                context.logger.info("Get client by id outbound result: " + JSON.stringify(result));
                client.clientId = result.result.merchantId;
                client.merchantRegistrationId = result.result.merchantRegistrationId;
                if ((this.dataCC.addressCC != " " && this.dataCC.addressCC != null) || (this.dataCC.countryCC != " " && this.dataCC.countryCC != null) || (this.dataCC.localityCC != " " && this.dataCC.localityCC != null) || (this.dataCC.postalCodeCC != " " && this.dataCC.postalCodeCC != null)) {
                  client.headquartersAddress = {};
                  client.headquartersAddress.address = this.dataCC.addressCC;
                  client.headquartersAddress.country = this.dataCC.countryCC;
                  client.headquartersAddress.postalArea = this.dataCC.localityCC;
                  client.headquartersAddress.postalCode = this.dataCC.postalCodeCC.split(" ")[0]; // 
                } else {
                  client.headquartersAddress = {
                    address: result.result.headquartersAddress?.address,
                    postalCode: result.result.headquartersAddress?.postalCode,
                    postalArea: result.result.headquartersAddress?.postalArea,
                    country: result.result.headquartersAddress?.country
                  }
                }
                client.fiscalId = result.result.fiscalIdentification?.fiscalId;
                client.knowYourSales = {
                  estimatedAnualRevenue: result.result.sales?.annualEstimatedRevenue,
                  servicesOrProductsSold: result.result.sales?.productsOrServicesSold,
                  servicesOrProductsDestinations: result.result.sales?.productsOrServicesCountries,
                  transactionsAverage: result.result.sales?.transactionsAverage
                };

                client.legalNature = result.result.legalNature;
                client.legalNature2 = result.result.legalNature2;
                client.incorporationStatement = result.result.incorporationStatement;
                client.shareCapital = result.result.shareCapital;
                client.byLaws = result.result.bylaws;
                client.incorporationDate = result.result.incorporationDate;
                client.mainTaxCode = result.result.principalTaxCode;
                client.otherTaxCodes = result.result.otherTaxCodes;
                client.mainEconomicActivity = result.result.principalEconomicActivity;
                client.otherEconomicActivities = result.result.otherEconomicActivities;
                client.billingEmail = result.result.billingEmail;
                client.documentationDeliveryMethod = result.result.documentationDeliveryMethod;
                client.bankInformation = result.result.bankingInformation;
                client.contacts = {
                  email: result.result.contacts?.email,
                  phone1: {
                    phoneNumber: result.result.contacts?.phone1?.phoneNumber,
                    countryCode: result.result.contacts?.phone1?.country
                  },
                  phone2: {
                    phoneNumber: result.result.contacts?.phone2?.phoneNumber,
                    countryCode: result.result.contacts?.phone2?.country
                  },
                }

                client.businessGroup = {
                  type: result.result.context,
                  branch: result.result.contextId
                }

                client.merchantType = result.result.merchantType;
                client["documents"] = result.result.documents;
                this.clientDocs = result.result.documents;

                this.clientDocs.forEach(doc => {
                  doc.validUntil = this.datepipe.transform(doc.validUntil, "yyyy-MM-dd");
                  doc.receivedAt = this.datepipe.transform(doc.receivedAt, "yyyy-MM-dd");
                });
                this.fetchDocumentDescriptions();
                this.clientContext.clientExists = true;
                this.clientContext.setClient(client);
                this.NIFNIPC = client.fiscalId;
                this.clientContext.setNIFNIPC(client.fiscalId);
              }, error => {
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
                if (this.clientContext.isClient == false) { // !
                  this.countriesComponent.getClientContextValues();
                }
                this.clientCharacterizationComponent.getClientContextValues();
                this.updateBasicForm();
                this.createSubmission();
              });
            } else {
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
              this.createSubmission();
            }
          }, error => {
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
            this.createSubmission();
          });
        } else {
          if (this.clientId !== "-1" && this.clientId != null && this.clientId != undefined) {
            this.clientService.GetClientByIdOutbound(this.clientId).then(result => {
              context.logger.info("Get client by id outbound result: " + JSON.stringify(result));
              var client = result;
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
              if (client.incorporationStatement != null) {
                clientToInsert.incorporationStatement = {
                  code: client.incorporationStatement.code,
                  validUntil: client.incorporationStatement.validUntil
                }
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
                  countryCode: client.contacts?.phone1?.country
                },
                phone2: {
                  phoneNumber: client.contacts?.phone2?.phoneNumber,
                  countryCode: client.contacts?.phone2?.country
                },
              }
              clientToInsert.businessGroup = {
                type: client.context,
                branch: client.contextId
              }
              clientToInsert.merchantType = client.merchantType;
              clientToInsert["documents"] = client.documents;
              this.clientDocs = client.documents;
              this.clientDocs.forEach(doc => {
                doc.validUntil = this.datepipe.transform(doc.validUntil, "yyyy-MM-dd");
                doc.receivedAt = this.datepipe.transform(doc.receivedAt, "yyyy-MM-dd");
              });
              this.fetchDocumentDescriptions();
              this.clientContext.clientExists = true;
              this.clientContext.setClient(clientToInsert);
              this.NIFNIPC = client.fiscalIdentification.fiscalId;
              this.clientContext.setNIFNIPC(client.fiscalIdentification.fiscalId);
              this.updateBasicForm();
            }, error => {
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
              this.clientContext.isClient = false; 
              this.clientContext.setNIFNIPC(this.NIFNIPC);
            }).then(result => {
              if (this.clientContext.isClient == false) {
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
            this.clientContext.isClient = false;
            this.clientContext.setNIFNIPC(this.NIFNIPC);
            this.clientContext.setClient(clientToInsert);
            this.createSubmission();
            if (this.submissionExists) {
              this.clientService.GetClientByIdAcquiring(localStorage.getItem("submissionId")).then(result => {
                this.submissionDocs.push(...result.documents);
              });
            }
          }
        }
      } else {
        this.clientService.GetClientByIdAcquiring(localStorage.getItem("submissionId")).then(result => {
          context.logger.info("Get client by id result: " + JSON.stringify(result));
          this.clientAux = result.incorporationStatement?.code;
          this.clientContext.tipologia = result.merchantType;
          this.NIFNIPC = result.fiscalId;
          this.clientContext.setNIFNIPC(result.fiscalId);
          this.clientContext.submissionID = localStorage.getItem("submissionId");
          this.clientContext.setClient(result);
          this.clientContext.isClient = this.isClient;
          //dados necessários para a pesquisa feita anteriormente
          this.tipologia = result.merchantType;
          this.clientId = result.fiscalId;
          this.submissionDocs.push(...result.documents);
          context.documentService.GetSubmissionDocuments(localStorage.getItem("submissionId")).subscribe(res => {
            context.logger.info("Get submission documents result: " + JSON.stringify(res));
            if (res.length > 0) {
              res.forEach(doc => {
                context.documentService.GetSubmissionDocumentById(localStorage.getItem("submissionId"), doc.id).subscribe(r => {
                  context.logger.info("Get submission document result: " + JSON.stringify(r));
                  if (doc.type === '0001') {
                    var file = {
                      documentType: '0001',
                      receivedAt: this.datepipe.transform(r.receivedAt, "yyyy-MM-dd"),
                      validUntil: this.datepipe.transform(r.validUntil, "yyyy-MM-dd"),
                      uniqueReference: r.id,
                      archiveSource: null,
                    } as OutboundDocument;
                    this.clientDocs = [];
                    this.clientDocs.push(file);
                    var acquiringFile = {
                      documentType: "0001",
                      data: null,
                      validUntil: r.validUntil
                    } as SubmissionPostDocumentTemplate;
                    this.clientContext.newSubmission.documents.push(acquiringFile);
                    this.fetchDocumentDescriptions();
                  } else {
                    if(doc.type !== '0034')
                      this.clientContext.newSubmission.documents.push(r);
                  }
                });
              });
            }
          });
        }).then(result => {
          if (this.clientContext.isClient == false) { // !
            this.countriesComponent.getClientContextValues();
          }
          this.clientCharacterizationComponent.getClientContextValues();
          this.createSubmission();
        });
      }
    } else { 
      this.clientContext.isClient = this.isClient;
      if (this.returned == 'consult') {
        this.clientContext.isClient = false;
        this.isClient = false;
      }
      if (this.clientContext.isClient) {
        this.formCountryIsValid = true;
        this.countriesListValid = true;
      }
      this.clientContext.setMerchantInfo(this.merchantInfo);
      this.clientContext.setClient(this.merchantInfo);
      this.clientContext.setNIFNIPC(this.merchantInfo.fiscalId);
      this.clientContext.tipologia = this.merchantInfo.merchantType;
      this.clientContext.submissionID = localStorage.getItem("submissionId");
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub?.unsubscribe);
  }

  getDocumentDescription(documentType: string) {
    var desc = "";
    if (documentType != null) {
        desc = this.documents?.find(document => document.code == documentType)?.description;
      }
    return desc;
  }

  submit() {
    if (this.returned != 'consult') {
      if (this.formClientIsValid && this.formCountryIsValid && this.countriesListValid) {
        this.clientCharacterizationComponent.submit();
        if (this.clientContext.isClient == false) // !
          this.countriesComponent.submit();
        if (this.submissionType === 'DigitalComplete')
          this.representationPowerComponent.submit();
        this.updateSubmission();
      } else {
        this.openAccordeons();
        this.form.markAllAsTouched();
        this.snackBar.open(this.translate.instant('generalKeywords.formInvalid'), '', {
          duration: 15000,
          panelClass: ['snack-bar']
        });
      }
    } else {
      this.logger.info("Redirecting to Stakeholders page");
      this.data.changeMerchant(true);
      this.data.updateData(true, 1);
      this.route.navigateByUrl('/stakeholders');
    }
  }

  openAccordeons() {
    document.getElementById("flush-collapseOne").className = "accordion-collapse collapse show";
    document.getElementById("accordionButton1").className = "accordion1-button";
    if (document.getElementById("flush-collapseTwo") != null) {
      document.getElementById("flush-collapseTwo").className = "accordion-collapse collapse show";
      document.getElementById("accordionButton2").className = "accordion1-button";
    }
  }

  openReturnPopup() {
    if (!this.historyStream) {
      if (this.returned == null) {
        this.returnModalRef = this.modalService.show(this.returnModal);
      } else {
        this.redirectBeginningClient();
      }
    } else {
      this.redirectBeginningClient();
    }
  }

  closeReturnPopup() {
    this.returnModalRef?.hide();
  }

  redirectBeginningClient() {
    this.returnModalRef?.hide();
    if (!this.historyStream) {
      let navigationExtras: NavigationExtras = {
        state: {
          tipologia: this.tipologia,
          clientExists: this.clientExists,
          dataCC: this.dataCC,
          isClient: this.clientContext?.isClient ?? false,
          comprovativoCC: this.comprovativoCC,
        }
      };
      if (this.returned == null) {
        //if (this.clientContext.tipologia === 'ENI' || this.clientContext.tipologia === 'Entrepeneur' || this.clientContext.tipologia === '02') {
        var context = this;
        var client = this.clientContext.getClient();
        var stakeholders = this.clientContext.newSubmission.stakeholders;
        //eliminar dados aqui
        if (this.submissionStakeholders.length > 0) {
          this.submissionStakeholders.forEach(stake => {
            //if (client.fiscalId == stake.fiscalId) {
              context.stakeholderService.DeleteStakeholder(localStorage.getItem("submissionId"), stake.id).subscribe(result => {
                context.logger.info("Deleted stakeholder result: " + JSON.stringify(result));
              });
            //}
          });
        }

        this.storeService.getSubmissionShopsList(localStorage.getItem("submissionId")).then(result => {
          var shops = result.result;
          if (shops.length > 0) {
            shops.forEach(val => {
              context.storeService.deleteSubmissionShop(localStorage.getItem("submissionId"), val.id).subscribe(res => {
                context.logger.info("Deleted store result: " + JSON.stringify(res));
              });
            });
          }
        });

        this.documentService.GetSubmissionDocuments(localStorage.getItem("submissionId")).subscribe(docs => {
          if (docs.length > 0) {
            docs.forEach(val => {
              context.documentService.DeleteDocumentFromSubmission(localStorage.getItem("submissionId"), val.id).subscribe(res => {
                context.logger.info("Deleted document result: " + JSON.stringify(res));
              });
            });
          }
        });

        //}
        this.data.changeData(new Map().set(0, undefined)
          .set(1, undefined)
          .set(2, undefined)
          .set(3, undefined)
          .set(4, undefined)
          .set(5, undefined)
          .set(6, undefined));
        this.logger.info("Redirecting to Client page");
        this.route.navigate(["/client"], navigationExtras);
      }
      if (this.returned == 'consult') {
        this.logger.info("Redirecting to Consultas page");
        this.route.navigate(["/app-consultas"]);
      }
    } else {
      var queueName = "";
      this.subscription = this.processNrService.queueName.subscribe(name => queueName = name);
      if (queueName == "devolucao") {
        this.logger.info("Redirecting to Devolucao page");
        this.route.navigate(["/app-devolucao/", this.processId]);
      } else if (queueName == 'aceitacao') {
        this.logger.info("Redirecting to Aceitacao page");
        this.route.navigate(['/app-aceitacao/', this.processId]);
      } else if (queueName == 'history') {
        this.logger.info("Redirecting to History page");
        this.route.navigate(['/app-history/', this.processId]);
      } else {
        let navigationExtras: NavigationExtras = {
          state: {
            queueName: queueName,
            processId: this.processId
          }
        };
        this.logger.info('Redirecting to Queues Detail page');
        this.route.navigate(["/queues-detail"], navigationExtras);
      }
    }
  }

  createSubmission() {
    if (this.returned != 'consult') {
      var context = this;
      var newSubmission = this.clientContext.newSubmission;
      newSubmission.startedAt = new Date().toISOString();
      newSubmission.merchant = this.clientContext.getClient();
      newSubmission.merchant.potentialClientIds = this.potentialClientIds;
      newSubmission.merchant.commercialName = newSubmission.merchant?.commercialName;
      newSubmission.merchant.legalName = newSubmission.merchant?.legalName?.slice(0, 100);
      newSubmission.merchant.shortName = newSubmission.merchant?.shortName;
      var loginUser = this.authService.GetCurrentUser();
      var stakeholder: IStakeholders = {} as IStakeholders;

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
        stakeholder.clientId = client.clientId;
        stakeholder.fiscalId = client.fiscalId;
        stakeholder.fullName = client.legalName;
        stakeholder.contactName = client.commercialName?.slice(0, 100);
        stakeholder.shortName = client.legalName?.slice(0, 40);
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
        if (this.dataCC?.nifCC != undefined && this.dataCC?.nifCC != null) {
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
      }

      this.clientContext.newSubmission = newSubmission;
      this.clientContext.setClient(newSubmission.merchant);

      if (!this.submissionExists) {
        this.submissionService.InsertSubmission(newSubmission).subscribe(result => {
          context.logger.info("Create submission result: " + JSON.stringify(result));
          context.clientContext.submissionID = result.id;
          localStorage.setItem("submissionId", result.id);
          context.processNrService.changeProcessNumber(result.processNumber);
        });
      }
      //adicionar o stakeholder após criar a submissão para que este não seja imediatamente criado
      newSubmission.stakeholders.push(stakeholder);
    }
  }

  async updateSubmission() {
    if (this.returned != 'consult') {
      this.error = false;
      let navigationExtras: NavigationExtras = {
        state: {
          isClient: this.clientContext.isClient
        }
      };

      this.data.changeCurrentIsClient(this.clientContext.isClient);
      var context = this;
      var submissionID = this.clientContext.submissionID ?? localStorage.getItem("submissionId");
      var newSubmission = this.clientContext.newSubmission;

      if (this.returned == 'edit' && this.processId != null && this.processId != '') {
        //newSubmission.processNumber = localStorage.getItem("processNumber");
        //this.processService.updateProcess(this.processId, newSubmission).then(result => {
        //  context.logger.info("Updated submission result: " + JSON.stringify(result.result));
        //  this.data.changeUpdatedClient(true);
        //}, error => {
        //  this.error = true;
        //});
      } else {
        context.logger.info("Submission to create: " + JSON.stringify(newSubmission));
        this.submissionService.EditSubmission(submissionID, newSubmission).subscribe(result => {
          context.logger.info("Updated submission result: " + JSON.stringify(result));
          this.data.changeUpdatedClient(true);
        }, error => {
          this.error = true;
        });
      }
        

      var client = this.clientContext.getClient();
      var merchant = this.clientContext.newSubmission.merchant;
      var clientToSubmit: OutboundClient

      //antes estava merchant
      if (this.returned == 'edit' && this.processId != null && this.processId != '') {
        await this.processService.updateMerchantProcess(this.processId, client).then(res => {
          this.logger.info("Update client: " + JSON.stringify(res));
        }, error => {
          this.error = true;
        });
      } else {
        await this.clientService.EditClient(submissionID, client).toPromise().then(res => {
          this.logger.info("Update client: " + JSON.stringify(res));
        }, error => {
          this.error = true;
        });
      }


      if (!this.compareArraysStakes(this.submissionStakeholders, this.clientContext.newSubmission.stakeholders)) {
        var stakeholders = this.clientContext.newSubmission.stakeholders;
        if (stakeholders.length == 0) {
          this.submissionStakeholders.forEach((val, index) => {
            if (context.returned == null) {
              context.stakeholderService.DeleteStakeholder(submissionID, val.id).subscribe(result => {
                context.logger.info("Deleted stakeholder result: " + JSON.stringify(result));
              });
            } else {
              context.processService.deleteStakeholderProcess(context.processId, val.id).then(result => {
                context.logger.info("Deleted stakeholder result: " + JSON.stringify(result));
              });
            }
          });
          this.submissionStakeholders = [];
          this.clientContext.setStakeholdersToInsert([]);
          this.processClient.stakeholders = [];
        } else {
          if ((client?.incorporationStatement != null && client?.incorporationStatement?.code != this?.clientAux) || (client?.incorporationStatement == null && this?.clientAux != null) || !this.submissionExists || this.isFromSearch) {
            if (client?.incorporationStatement == null && this?.clientAux != null) {
              this.submissionStakeholders.forEach(stake => {
                var found = stakeholders.find(val => val.fiscalId == stake.fiscalId && val?.fullName == stake?.fullName);
                if (found == undefined) {
                  if (context.returned == null) {
                    context.stakeholderService.DeleteStakeholder(submissionID, stake.id).subscribe(result => {
                      context.logger.info("Deleted stakeholder result: " + JSON.stringify(result));
                    });
                  } else {
                    context.processService.deleteStakeholderProcess(context.processId, stake.id).then(result => {
                      context.logger.info("Deleted stakeholder result: " + JSON.stringify(result));
                    });
                  }
                } else {
                  if (found.clientId != null && found.clientId != "" && stake.clientId != null && stake.clientId != "" && found.clientId != stake.clientId) {
                    if (context.returned == null) {
                      context.stakeholderService.DeleteStakeholder(submissionID, stake.id).subscribe(result => {
                        context.logger.info("Deleted stakeholder result: " + JSON.stringify(result));
                      });
                    } else {
                      context.processService.deleteStakeholderProcess(context.processId, stake.id).then(result => {
                        context.logger.info("Deleted stakeholder result: " + JSON.stringify(result));
                      });
                    }

                  } else {
                    stakeholders = stakeholders.filter(item => item.fiscalId !== found.fiscalId && item.fullName !== found.fullName);
                  }
                }
              });
            }

            stakeholders.forEach(function (value, idx) {
              if (context.clientContext.tipologia === 'ENI' || context.clientContext.tipologia === 'Entrepeneur' || context.clientContext.tipologia === '02') {
                if (value.fiscalId !== client.fiscalId) {
                  if (context.returned == null || context.returned == 'edit' && (context.processId == '' || context.processId == null)) {
                    if (['5', '6', '8', '9'].includes(value.fiscalId.substr(0, 1))) {
                      var corp = {
                        fiscalId: value.fiscalId,
                        headquartersAddress: value.fiscalAddress,
                        legalName: value.fullName,
                        shortName: value.shortName
                      } as PostCorporateEntity;
                      context.stakeholderService.AddNewCorporateEntity(submissionID, corp).then(result => {
                        context.logger.info("Created corporate entity result: " + JSON.stringify(result));
                      });
                    } else {
                      context.stakeholderService.CreateNewStakeholder(submissionID, value).subscribe(result => {
                        context.logger.info("Created stakeholder result: " + JSON.stringify(result));
                      });
                    }
                  } else {
                    if (['5', '6', '8', '9'].includes(value.fiscalId.substr(0, 1))) {
                      var corp = {
                        fiscalId: value.fiscalId,
                        headquartersAddress: value.fiscalAddress,
                        legalName: value.fullName,
                        shortName: value.shortName
                      } as PostCorporateEntity;
                      context.processService.addCorporateEntityToProcess(context.processId, corp).then(result => {
                        context.logger.info("Created corporate entity result: " + JSON.stringify(result));
                      });
                    } else {
                      context.processService.addStakeholderToProcess(context.processId, value).then(result => {
                        context.logger.info("Created stakeholder result: " + JSON.stringify(result));
                      });
                    }
                  }
                } else {
                  if (localStorage.getItem("documentType") == "0501") {
                    value.signType = "CitizenCard";
                  }
                  if (localStorage.getItem("documentType") == "1001") {
                    value.signType = "DigitalCitizenCard";
                  }
                  if (localStorage.getItem("documentType") == "0101") {
                    value.signType = "CitizenCard";
                  }
                  if (localStorage.getItem("documentType") == "0302") {
                    value.signType = "CitizenCard";
                  }

                  if (context.returned == null) {
                    context.stakeholderService.CreateNewStakeholder(submissionID, value).subscribe(result => {
                      context.logger.info("Created stakeholder result: " + JSON.stringify(result));
                      value.id = result.id;
                      var found = newSubmission.documents.find(doc => doc.documentType == '0018');
                      if (found != undefined) {
                        context.stakeholderService.AddNewDocumentStakeholder(submissionID, value.id, found).subscribe(res => {

                        });
                      }
                    });
                  } else {
                    //context.processService.addStakeholderToProcess(context.processId, value).then(result => {
                    //  context.logger.info("Created stakeholder result: " + JSON.stringify(result));
                    //  value.id = result.result.id;
                    //  var found = newSubmission.documents.find(doc => doc.documentType == '0018');
                    //  if (found != undefined) {
                    //    context.processService.addDocumentToStakeholderProcess(context.processId, value.id, found).then(res => {

                    //    });
                    //  }
                    //});
                  }
                }
              } else {
                if (context.returned == null || context.returned == 'edit' && (context.processId == '' || context.processId == null)) {
                  if (['5', '6', '8', '9'].includes(value.fiscalId.substr(0, 1))) {
                    var corp = {
                      fiscalId: value.fiscalId,
                      headquartersAddress: value.fiscalAddress,
                      legalName: value.fullName,
                      shortName: value.shortName
                    } as PostCorporateEntity;
                    context.stakeholderService.AddNewCorporateEntity(submissionID, corp).then(result => {
                      context.logger.info("Created corporate entity result: " + JSON.stringify(result));
                    });
                  } else {
                    context.stakeholderService.CreateNewStakeholder(submissionID, value).subscribe(result => {
                      context.logger.info("Created stakeholder result: " + JSON.stringify(result));
                    });
                  }
                } else {
                  if (['5', '6', '8', '9'].includes(value.fiscalId.substr(0, 1))) {
                    var corp = {
                      fiscalId: value.fiscalId,
                      headquartersAddress: value.fiscalAddress,
                      legalName: value.fullName,
                      shortName: value.shortName
                    } as PostCorporateEntity;
                    context.processService.addCorporateEntityToProcess(context.processId, corp).then(result => {
                      context.logger.info("Created corporate entity result: " + JSON.stringify(result));
                    });
                  } else {
                    context.processService.addStakeholderToProcess(context.processId, value).then(result => {
                      context.logger.info("Created stakeholder result: " + JSON.stringify(result));
                    });
                  }
                }
              }
            });
          }
        }
      }

      if (this.returned == null) {
        if (!this.compareArraysDocs(this.submissionDocs, this.clientContext.newSubmission.documents)) {
          var documents = this.clientContext.newSubmission.documents;
          if (documents.length == 0) {
            this.submissionDocs.forEach((val, index) => {

              context.documentService.DeleteDocumentFromSubmission(submissionID, val.id).subscribe(result => {
                context.logger.info("Deleted document result: " + JSON.stringify(result));
              });

            });
            this.submissionDocs = [];
          } else {
            this.submissionDocs.forEach(val => {
              var found = documents.find(doc => doc.documentType === val.documentType);
              if (found == undefined) {
                context.documentService.DeleteDocumentFromSubmission(submissionID, val.id).subscribe(result => {
                  context.logger.info("Deleted document result: " + JSON.stringify(result));
                });
              } else {
                if (found.documentType !== '0034')
                  documents = documents.filter(item => item.documentType !== found.documentType);
                else
                  context.documentService.DeleteDocumentFromSubmission(submissionID, val.id).subscribe(result => {
                    context.logger.info("Deleted document result: " + JSON.stringify(result));
                  });
              }
            });

            if (documents.length > 0) {
              documents.forEach(doc => {
                if (doc.documentType !== '0001') {
                  context.clientService.merchantPostDocument(submissionID, doc).subscribe(result => {
                    context.logger.info('Added document to submission: ' + JSON.stringify(result));
                  });

                }
              });
            }

          }
        }
      }

      if (!this.updateClient) {
        if (this.clientContext.isClient) {
          if (newSubmission?.merchant?.merchantRegistrationId != null && newSubmission?.merchant?.merchantRegistrationId != "") {
            this.storeService.getShopsListOutbound(newSubmission.merchant.merchantRegistrationId, "por mudar", "por mudar").subscribe(res => {
              context.logger.info("Get shops list outbound result: " + JSON.stringify(res));
              res.forEach(value => {
                this.storeService.getShopInfoOutbound(newSubmission.merchant.merchantRegistrationId, value.shopId, "por mudar", "por mudar").then(r => {
                  context.logger.info("Get shop outbound result: " + JSON.stringify(r));
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
                    website: r.result.url,
                    equipments: []
                  }

                  context.storeService.addShopToSubmission(submissionID, storeToAdd).subscribe(shop => {
                    context.logger.info("Added shop result: " + JSON.stringify(shop));
                  });
                });
              });
            });
          }
        }
      }
      if (!this.error) {
        this.data.changeMerchant(true);
        this.data.updateData(true, 1);
        this.logger.info("Redirecting to Stakeholders page");
        setTimeout(() => this.route.navigateByUrl('/stakeholders', navigationExtras), 500);
      }
    } else {
      this.data.changeMerchant(true);
      this.data.updateData(true, 1);
      this.logger.info("Redirecting to Stakeholders page");
      this.route.navigate(['/stakeholders']);
    }
  }

  compareArraysStakes(a1, a2) {
    if (a1.length !== a2.length) return false;
    var arr1 = a1.map(function (item) {
      return item.fiscalId;
    });
    var arr2 = a2.map(function (item) {
      return item.fiscalId;
    });
    const elements = new Set([...arr1, ...arr2]);
    for (const x of elements) {
      const count1 = a1.filter(e => e.fiscalId === x).length;
      const count2 = a2.filter(e => e.fiscalId === x).length;
      if (count1 !== count2) return false;

      const filter = a1.filter(e => e.fiscalId === x)[0];
      const filter2 = a2.filter(e => e.fiscalId === x)[0];
      if (filter.clientId !== filter2.clientId) return false;
    }
    return true;
  }

  compareArraysDocs(a1, a2) {
    if (a1.length !== a2.length) return false;
    var arr1 = a1.map(function (item) {
      return item.documentType;
    });
    var arr2 = a2.map(function (item) {
      return item.documentType;
    });
    const elements = new Set([...arr1, ...arr2]);
    for (const x of elements) {
      const count1 = a1.filter(e => e.documentType === x).length;
      const count2 = a2.filter(e => e.documentType === x).length;
      if (count1 !== count2)
        return false;
      //else
      //  if (x === '0034')
      //    return false;
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
        this.logger.info("Get document image outbound result: " + JSON.stringify(result));
        this.b64toBlob(result.binary, 'application/pdf', 512);
      });
    } else {
      if (this.returned == null || this.returned == 'edit' && (this.processId == '' || this.processId == null)) {
        this.documentService.GetDocumentImage(localStorage.getItem("submissionId"), uniqueReference).then(async result => {
          this.logger.info("Get document image outbound: " + JSON.stringify(result));
          result.blob().then(data => {
            var blob = new Blob([data], { type: 'application/pdf' });
            let url = window.URL.createObjectURL(blob);
            window.open(url, '_blank',
              `margin: auto;
              width: 50%;
              padding: 10px;
              text-align: center;
              border: 3px solid green;`);
            });
        });
      } else {
        this.processService.getDocumentImageFromProcess(this.processId, uniqueReference).then(async result => {
          this.logger.info("Get document image result: " + JSON.stringify(result));
          result.blob().then(data => {
            var blob = new Blob([data], { type: 'application/pdf' });
            let url = window.URL.createObjectURL(blob);
            window.open(url, '_blank',
              `margin: auto;
              width: 50%;
              padding: 10px;
              text-align: center;
              border: 3px solid green;`);
          });
        });
      }


    }
  }

  formClientCharacterizationIsValid(formCharact) {

    if (formCharact.valid) {
      this.formClientIsValid = true;
    }

    formCharact.statusChanges.subscribe(res => {
      if (res === 'VALID') {
        this.formClientIsValid = true;
      }
      else {
        this.formClientIsValid = false;
      }
    })
  }

  formClientCountryIsValid(formCountry: AbstractControl) {

    if (formCountry.valid) {
      this.formCountryIsValid = true;
    }

    formCountry.statusChanges.subscribe(res => {
      if (res === 'VALID') {
        this.formCountryIsValid = true;
      }
      else {
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

  fetchDocumentDescriptions() {
    this.subs.push(this.tableInfo.GetDocumentsDescription().subscribe(result => {
      this.logger.info("Get all documents description result: " + JSON.stringify(result));
      this.documents = result;
    }));
  }

  openCancelPopup() {
    this.cancelModalRef = this.modalService.show(this.cancelModal);
  }

  closeCancelPopup() {
    this.cancelModalRef?.hide();
  }

  confirmCancel() {
    if (this.returned != 'consult') {
      var context = this;
      var processNumber = "";
      this.processNrService.processNumber.subscribe(res => processNumber = res);
      var encodedCode = encodeURIComponent(processNumber);
      if (this.returned == null || (this.returned == 'edit' && (this.processId == '' || this.processId == null))) {
        this.submissionService.GetSubmissionByProcessNumber(encodedCode).then(result => {
          context.queueService.markToCancel(result.result[0].processId, context.authService.GetCurrentUser().userName).then(res => {
            context.closeCancelPopup();
            context.route.navigate(['/']);
          });
        });
      } else {
        context.queueService.markToCancel(context.processId, context.authService.GetCurrentUser().userName).then(res => {
          context.closeCancelPopup();
          context.route.navigate(['/']);
        });
      }
    }
  }

  scroll(el: HTMLElement) {
    el.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'center' });
  }
}
