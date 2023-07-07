import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DataService } from '../nav-menu-interna/data.service';
import { BusinessIssueViewModel, IssueTypeEnum, IssueViewModel, ProcessHistory, ProcessList, ProcessService, SearchProcessHistory } from '../process/process.service';
import { LoggerService } from 'src/app/logger.service';
import { QueuesService } from './queues.service';
import { IStakeholders } from '../stakeholders/IStakeholders.interface';
import { ShopActivities, ShopDetailsAcquiring, ShopEquipment, ShopSubActivities } from '../store/IStore.interface';
import { ClientChoice, ComplianceEvaluation, EligibilityAssessment, MerchantRegistration, NegotiationApproval, OperationsEvaluation, ReassingWorkQueue, RiskAssessment, StandardIndustryClassificationChoice, State, StateResultDiscriminatorEnum, WorkQueue } from './IQueues.interface';
import { PostDocument } from '../submission/document/ISubmission-document';
import { ComprovativosService } from '../comprovativos/services/comprovativos.services';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { Client, RiskAssessmentTenantViewModel } from '../client/Client.interface';
import { ClientService } from '../client/client.service';
import { MatSort } from '@angular/material/sort';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DocumentSearchType, UserTypes } from '../table-info/ITable-info.interface';
import { TableInfoService } from '../table-info/table-info.service';
import { AuthService } from '../services/auth.service';
import { StakeholderService } from '../stakeholders/stakeholder.service';
import { ProcessNumberService } from '../nav-menu-presencial/process-number.service';
import { User } from '../userPermissions/user';
import { UserPermissions } from '../userPermissions/user-permissions';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'queues-detail',
  templateUrl: './queues-detail.component.html',
  styleUrls: ['./queues-detail.component.css']
})

export class QueuesDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  form: FormGroup;
  @Input() queueName: string;
  @Input() processId: string;

  @ViewChild('sortStore') sortStore: MatSort;
  displayedColumnsStore: string[] = ['name', 'activity', 'subActivity'];
  storesMat = new MatTableDataSource<ShopDetailsAcquiring>();
  @ViewChild('paginatorStore') set paginatorStore(pager: MatPaginator) {
    if (pager) {
      this.storesMat.paginator = pager;
      this.storesMat.paginator._intl = new MatPaginatorIntl();
      this.storesMat.paginator._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');
    }
  }

  historyMat = new MatTableDataSource<ProcessHistory>();
  historyColumns: string[] = ['processNumber', 'processState', 'whenStarted', 'whoFinished', 'observations'];
  @ViewChild('historySort') historySort = new MatSort();
  @ViewChild('paginatorHistory') set paginatorHistory(pager: MatPaginator) {
    if (pager) {
      this.historyMat.paginator = pager;
      this.historyMat.paginator._intl = new MatPaginatorIntl();
      this.historyMat.paginator._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');
    }
  }

  returnMat = new MatTableDataSource<IssueViewModel>();
  returnColumns: string[] = ['name', 'type', 'issueDescription'];
  @ViewChild('returnSort') returnSort = new MatSort();
  @ViewChild('paginatorReturn') set paginatorReturn(pager: MatPaginator) {
    if (pager) {
      this.returnMat.paginator = pager;
      this.returnMat.paginator._intl = new MatPaginatorIntl();
      this.returnMat.paginator._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');
    }
  }

  returnSelectedMat = new MatTableDataSource<IssueViewModel>();
  returnSelectedColumns: string[] = ['name', 'type', 'issueDescription'];
  @ViewChild('returnSelectedSort') returnSelectedSort = new MatSort();
  @ViewChild('paginatorSelectedReturn') set paginatorSelectedReturn(pager: MatPaginator) {
    if (pager) {
      this.returnSelectedMat.paginator = pager;
      this.returnSelectedMat.paginator._intl = new MatPaginatorIntl();
      this.returnSelectedMat.paginator._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');
    }
  }

  multipleStakeMat = new MatTableDataSource<any>();
  multipleStakeColumns: string[] = ['shortName', 'fiscalId', 'clientId'];
  @ViewChild('multipleStakeSort') multipleStakeSort = new MatSort();
  @ViewChild('paginatorMultipleStake') set paginatorMultipleStake(pager: MatPaginator) {
    if (pager) {
      this.multipleStakeMat.paginator = pager;
      this.multipleStakeMat.paginator._intl = new MatPaginatorIntl();
      this.multipleStakeMat.paginator._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');
    }
  }

  currentStore: ShopDetailsAcquiring = null;
  currentIdx: number;
  selectedStake: any = null;
  multipleStakeCurrentIdx: number;

  private baseUrl;
  localUrl: any;
  public map = new Map();
  public currentPage: number;
  public subscription: Subscription;
  public process: ProcessList;
  public type: string;

  files?: File[] = [];

  public attach: { tipo: string, dataDocumento: string };
  public result: any;
  public fillComments: string;
  public enrollmentMerchantNumber: string;
  public enrollmentStoreNumber: string;
  public enrollmentTerminalNumber: string;
  public elegibilityStatus: string;
  public subs: Subscription[] = [];
  public riskRequest;
  public checkButton: boolean = false;

  stakesList: IStakeholders[] = [];
  shopsList: ShopDetailsAcquiring[] = [];
  equipmentList: ShopEquipment[] = [];

  public state: State;
  merchant: Client;

  //public process: ProcessList;
  public processNumber: string;
  public issues: BusinessIssueViewModel = {
    "process": [], "merchant": { "merchant": { "id": "23068900001791", "href": "/UpcServicesAcquiringAPI/api/process/4b73474e-fa7d-4e9e-ad5d-930501931bd5/merchant" }, "issues": [{ "issueType": IssueTypeEnum.AUTOMATIC_RULE, "originCode": "RD_Merchant_BankAccount", "issueCode": "RD_Merchant_BankAccount", "issueDescription": "Não existe documento comprovativo de Informação Bancária." }, { "issueType": IssueTypeEnum.AUTOMATIC_RULE, "originCode": "RD_Merchant_Beneficiaries", "issueCode": "RD_Merchant_Beneficiaries", "issueDescription": "Não existe documento comprovativo de Beneficiários." }, { "issueType": IssueTypeEnum.AUTOMATIC_RULE, "originCode": "RD_Merchant_CorporateBody", "issueCode": "RD_Merchant_CorporateBody", "issueDescription": "Não existe documento comprovativo de Sociedade." }, { "issueType": IssueTypeEnum.AUTOMATIC_RULE, "originCode": "RD_Merchant_FiscalIdentification", "issueCode": "RD_Merchant_FiscalIdentification", "issueDescription": "Não existe documento comprovativo de identificação fiscal." }, { "issueType": IssueTypeEnum.AUTOMATIC_RULE, "originCode": "RD_Merchant_Incorporation", "issueCode": "RD_Merchant_Incorporation", "issueDescription": "Não existe documento comprovativo de ENI/Profissional Liberal." }, { "issueType": IssueTypeEnum.AUTOMATIC_RULE, "originCode": "RD_Merchant_TaxStatement", "issueCode": "RD_Merchant_TaxStatement", "issueDescription": "Não existe documento Declaração de IRS." }, { "issueType": IssueTypeEnum.AUTOMATIC_RULE, "originCode": "RD_Merchant_BankAccount", "issueCode": "RD_Merchant_BankAccount", "issueDescription": "Não existe documento comprovativo de Informação Bancária." }, { "issueType": IssueTypeEnum.AUTOMATIC_RULE, "originCode": "RD_Merchant_Beneficiaries", "issueCode": "RD_Merchant_Beneficiaries", "issueDescription": "Não existe documento comprovativo de Beneficiários." }, { "issueType": IssueTypeEnum.AUTOMATIC_RULE, "originCode": "RD_Merchant_CorporateBody", "issueCode": "RD_Merchant_CorporateBody", "issueDescription": "Não existe documento comprovativo de Sociedade." }, { "issueType": IssueTypeEnum.AUTOMATIC_RULE, "originCode": "RD_Merchant_FiscalIdentification", "issueCode": "RD_Merchant_FiscalIdentification", "issueDescription": "Não existe documento comprovativo de identificação fiscal." }, { "issueType": IssueTypeEnum.AUTOMATIC_RULE, "originCode": "RD_Merchant_Incorporation", "issueCode": "RD_Merchant_Incorporation", "issueDescription": "Não existe documento comprovativo de ENI/Profissional Liberal." }, { "issueType": IssueTypeEnum.AUTOMATIC_RULE, "originCode": "RD_Merchant_TaxStatement", "issueCode": "RD_Merchant_TaxStatement", "issueDescription": "Não existe documento Declaração de IRS." }, { "issueType": IssueTypeEnum.AUTOMATIC_RULE, "originCode": "BR_Merchant_PrivateNonInterveningWithProxyProcess", "issueCode": "BR_Merchant_PrivateNonInterveningWithProxyProcess", "issueDescription": "A natureza jurídica da sociedade não permite a existência de procuradores." }] },
    "stakeholders":
      [{
        "stakeholder":
        {
          "id": "12310081234502",
          "href": "/UpcServicesAcquiringAPI/api/process/4b73474e-fa7d-4e9e-ad5d-930501931bd5/stakeholder/23068900001811"
        },
        "issues":
          [{
            "issueType": IssueTypeEnum.AUTOMATIC_RULE,
            "originCode": "RD_Stakeholder_FiscalIdentificationDocument", "issueCode": "RD_Stakeholder_FiscalIdentificationDocument", "issueDescription": "Não existe documento de identificação fiscal."
          }, { "issueType": IssueTypeEnum.AUTOMATIC_RULE, "originCode": "RD_Stakeholder_IdentificationDocument", "issueCode": "RD_Stakeholder_IdentificationDocument", "issueDescription": "Não existe documento de identificação." }, { "issueType": IssueTypeEnum.AUTOMATIC_RULE, "originCode": "RD_Stakeholder_PowerOfAttorney", "issueCode": "RD_Stakeholder_PowerOfAttorney", "issueDescription": "Não existe documento comprovativo de procuração." }, { "issueType": IssueTypeEnum.AUTOMATIC_RULE, "originCode": "RD_Stakeholder_FiscalIdentificationDocument", "issueCode": "RD_Stakeholder_FiscalIdentificationDocument", "issueDescription": "Não existe documento de identificação fiscal." }, { "issueType": IssueTypeEnum.AUTOMATIC_RULE, "originCode": "RD_Stakeholder_IdentificationDocument", "issueCode": "RD_Stakeholder_IdentificationDocument", "issueDescription": "Não existe documento de identificação." }, { "issueType": IssueTypeEnum.AUTOMATIC_RULE, "originCode": "RD_Stakeholder_PowerOfAttorney", "issueCode": "RD_Stakeholder_PowerOfAttorney", "issueDescription": "Não existe documento comprovativo de procuração." }]
      },
        {
          "stakeholder":
          {
            "id": "12310081234503",
            "href": "/UpcServicesAcquiringAPI/api/process/4b73474e-fa7d-4e9e-ad5d-930501931bd5/stakeholder/23068900001811"
          },
          "issues":
            [{
              "issueType": IssueTypeEnum.AUTOMATIC_RULE,
              "originCode": "RD_Stakeholder_FiscalIdentificationDocument", "issueCode": "RD_Stakeholder_FiscalIdentificationDocument", "issueDescription": "Não existe documento de identificação fiscal."
            }, { "issueType": IssueTypeEnum.AUTOMATIC_RULE, "originCode": "RD_Stakeholder_IdentificationDocument", "issueCode": "RD_Stakeholder_IdentificationDocument", "issueDescription": "Não existe documento de identificação." }, { "issueType": IssueTypeEnum.AUTOMATIC_RULE, "originCode": "RD_Stakeholder_PowerOfAttorney", "issueCode": "RD_Stakeholder_PowerOfAttorney", "issueDescription": "Não existe documento comprovativo de procuração." }, { "issueType": IssueTypeEnum.AUTOMATIC_RULE, "originCode": "RD_Stakeholder_FiscalIdentificationDocument", "issueCode": "RD_Stakeholder_FiscalIdentificationDocument", "issueDescription": "Não existe documento de identificação fiscal." }, { "issueType": IssueTypeEnum.AUTOMATIC_RULE, "originCode": "RD_Stakeholder_IdentificationDocument", "issueCode": "RD_Stakeholder_IdentificationDocument", "issueDescription": "Não existe documento de identificação." }, { "issueType": IssueTypeEnum.AUTOMATIC_RULE, "originCode": "RD_Stakeholder_PowerOfAttorney", "issueCode": "RD_Stakeholder_PowerOfAttorney", "issueDescription": "Não existe documento comprovativo de procuração." }]
        }
      ], "shops": [{ "shop": { "id": "12310081234504", "href": "/UpcServicesAcquiringAPI/api/process/4b73474e-fa7d-4e9e-ad5d-930501931bd5/merchant/shop/23068900001841" }, "issues": [{ "issueType": IssueTypeEnum.AUTOMATIC_RULE, "originCode": "RD_Shop_BankAccount", "issueCode": "RD_Shop_BankAccount", "issueDescription": "Não existe documento comprovativo de informação bancária." }, { "issueType": IssueTypeEnum.AUTOMATIC_RULE, "originCode": "RD_Shop_BankAccount", "issueCode": "RD_Shop_BankAccount", "issueDescription": "Não existe documento comprovativo de informação bancária." }] }], "documents": [{ "document": { "id": "23068900001831", "type": "0034", "href": "/UpcServicesAcquiringAPI/api/process/4b73474e-fa7d-4e9e-ad5d-930501931bd5/document/23068900001831" }, "issues": [] }, { "document": { "id": "23068900001851", "type": "0000", "href": "/UpcServicesAcquiringAPI/api/process/4b73474e-fa7d-4e9e-ad5d-930501931bd5/document/23068900001851" }, "issues": [] }, {
      "document":
        { "id": "23068900001861", "type": "0000", "href": "/UpcServicesAcquiringAPI/api/process/4b73474e-fa7d-4e9e-ad5d-930501931bd5/document/23068900001861" }, "issues": []
    }, { "document": { "id": "23068900001871", "type": "0000", "href": "/UpcServicesAcquiringAPI/api/process/4b73474e-fa7d-4e9e-ad5d-930501931bd5/document/23068900001871" }, "issues": [] }]
  }
  public processHistoryItems: SearchProcessHistory;
  public selectedIssue: BusinessIssueViewModel;
  public selectedHistoryGuid: string;
  //public merchant: Client;
  public stakeholdersList: IStakeholders[] = [];
  public ready: boolean = false;
  canSearch: boolean = true;
  notFound: boolean = false;
  showFoundClient: boolean = false;
  clientsToShow: Client[] = [];
  @ViewChild(MatSort) sort: MatSort;
  displayedColumns: string[] = ['clientId', 'commercialName', 'fiscalId', 'documentType', 'documentNumber'];
  ListaDocType;
  ListaDocTypeENI;
  activities: ShopActivities[];
  subActivities: ShopSubActivities[];
  clientsMat = new MatTableDataSource<any>();
  documentType: string = "";
  docTypes: DocumentSearchType[] = [];
  @ViewChild('paginator') set paginator(pager: MatPaginator) {
    if (pager) {
      this.clientsMat.paginator = pager;
      this.clientsMat.paginator._intl = new MatPaginatorIntl();
      this.clientsMat.paginator._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');
    }
  }
  incorrectNIF: boolean = false;
  incorrectNIFSize: boolean = false;
  incorrectNIPC: boolean = false;
  incorrectNIPCSize: boolean = false;
  incorrectCC: boolean = false;
  incorrectCCSize: boolean = false;
  incorrectCCFormat: boolean = false;
  finished: boolean = false;
  firstTime: boolean = true;
  shopIssuesList: ShopDetailsAcquiring[] = [];
  stakeIssuesList: IStakeholders[] = [];
  filterIssues: IssueViewModel[] = [];
  MCCFinished: boolean = false;
  multipleStakeList: any = [];
  allStakesSearched: boolean = false;
  isCompany: boolean;
  riskFinished: boolean = false;
  currentUser: User = {};
  readonly UserPermissions = UserPermissions;
  observationLength: number;
  @ViewChild('exitModal') exitModal;
  exitModalRef: BsModalRef | undefined;
  edit: boolean = true;

  constructor(private logger: LoggerService, private translate: TranslateService, private snackBar: MatSnackBar, private http: HttpClient,
    private route: Router, private data: DataService, private queuesInfo: QueuesService, private documentService: ComprovativosService,
    private datePipe: DatePipe, private queuesService: QueuesService, private processService: ProcessService, private clientService: ClientService, private tableInfo: TableInfoService, private authService: AuthService, private stakeholderService: StakeholderService, private processNrService: ProcessNumberService, private modalService: BsModalService) {

    //Gets Queue Name and processId from the Dashboard component 
    if (this.route.getCurrentNavigation().extras.state) {
      this.queueName = this.route.getCurrentNavigation().extras.state["queueName"];
      this.processId = this.route.getCurrentNavigation().extras.state["processId"];
    }

    authService.currentUser.subscribe(user => this.currentUser = user);
    
    // Preencher os dados da fila de trabalho consoante o processId recebido
    this.fetchStartingInfo();
    this.data.updateData(true, 0);

    if (localStorage.getItem("documents") != null) {
      var context = this;
      var fileBinaries = JSON.parse(localStorage.getItem("documents"));;
      fileBinaries.forEach(value => {
        var blob = context.b64toBlob(value, 'application/pdf', 512);
        context.selectFile({ target: { files: [blob] } });
      });
    }

    this.subs.push(this.tableInfo.GetAllSearchTypes(UserTypes.MERCHANT).subscribe(result => {
      this.ListaDocType = result;
      this.ListaDocType = this.ListaDocType.sort((a, b) => a.description > b.description ? 1 : -1); //ordenar resposta
    }), (this.tableInfo.GetAllSearchTypes(UserTypes.STAKEHOLDER).subscribe(result => {
      this.ListaDocTypeENI = result;
      this.ListaDocTypeENI = this.ListaDocTypeENI.sort((a, b) => a.description > b.description ? 1 : -1); //ordenar resposta
    })));
  }

  ngOnDestroy(): void {
    var context = this;
    if (this.route.routerState.snapshot.url == "/" || this.route.routerState.snapshot.url == "/app-consultas" || this.route.routerState.snapshot.url == "/app-consultas-ft") {
      if (this.state == null) {
        if (this.edit) {
          this.queuesService.getActiveWorkQueue(this.processId).then(result => {
            var workQueue = result.result as WorkQueue;
            if (workQueue.status == "InProgress") { // voltar a meter == 
              var reassignWorkQueue: ReassingWorkQueue = {};
              reassignWorkQueue.jobId = workQueue.id;
              reassignWorkQueue.username = this.authService.GetCurrentUser().userName;
              reassignWorkQueue.onHold = true;
              reassignWorkQueue.forceReassign = false;
              context.queuesService.postReassignWorkQueue(context.processId, reassignWorkQueue).then(res => {

              });
            }
          });
        }
      }
    }

    if (this.queueName == "eligibility") {
      var observation = this.form.get('observation').value;
      var merchantAccepted = this.form.get("merchantEligibility").value; //this.merchant.id
      var stakeholders = this.form.get("stakeholdersEligibility") as FormGroup;
      var stakes = [];
      for (const cont in stakeholders.controls) {
        const control = this.form.get("stakeholdersEligibility").get(cont);
        stakes.push({
          stakeholderId: cont,
          accepted: control.value
        })
      }

      this.processNrService.changeObservation(observation);
      this.processNrService.changeMerchant(merchantAccepted);
      this.processNrService.changeList(stakes);


    } else if (this.queueName == "risk") {
      var observation = this.form.get('observation').value;
      var merchantAccepted = this.form.get("merchantEligibility").value; //this.merchant.id
      var stakeholders = this.form.get("stakeholdersEligibility") as FormGroup;
      var stakes = [];
      for (const cont in stakeholders.controls) {
        const control = this.form.get("stakeholdersEligibility").get(cont);
        stakes.push({
          stakeholderId: cont,
          accepted: control.value
        })
      }

      this.processNrService.changeObservation(observation);
      this.processNrService.changeMerchant(merchantAccepted);
      this.processNrService.changeList(stakes);

    } else if (this.queueName == "compliance") {
      var observation = this.form.get('observation').value;
      this.processNrService.changeObservation(observation);
    } else if (this.queueName == "DOValidation") {
      var observation = this.form.get('observation').value;
      this.processNrService.changeObservation(observation);
    } else if (this.queueName == "validationSIBS") {
      var observation = this.form.get('observation').value;
      var merchantRegistrationId = this.form.get("enrollmentMerchantNumber").value;
      let shops = [];
      this.shopsList.forEach(shop => {
        var equips = [];
        this.equipmentList.forEach(equip => {
          if (shop.id === equip["shopId"]) {
            equips.push({
              equipmentId: equip.shopEquipmentId,
              equipmentRegistrationId: context.form.get("equipments")?.get(equip.shopEquipmentId)?.value
            });
          }
        });
        var model = {
          shopId: shop.id,
          shopRegistrationId: context.form.get("shops").get(shop.id).value,
          equipments: equips
        };
        shops.push(model);
      });

      this.processNrService.changeObservation(observation);
      this.processNrService.changeMerchant(merchantRegistrationId);
      this.processNrService.changeList(shops);

    } else if (this.queueName == "negotiationAproval") {
      var observation = this.form.get('observation').value;
      this.processNrService.changeObservation(observation);
    } else if (this.queueName == "multipleClients") {
      var observation = this.form.get('observation').value;
      var merchantChoice = {};
      var found = context.multipleStakeList.find(value => value.id == this.merchant.id);
      if (found != undefined) {
        merchantChoice = {
          id: found.id,
          clientNumber: found["clientNumber"]
        };
      }
      let stakeholdersChoice = [];
      context.multipleStakeList.forEach(value => {
        if (value["type"] == "Particular") {
          stakeholdersChoice.push({
            id: value.id,
            clientNumber: value["clientNumber"]
          });
        }
      });

      this.processNrService.changeObservation(observation);
      this.processNrService.changeMerchant(merchantChoice);
      this.processNrService.changeList(stakeholdersChoice);

    } else if (this.queueName == "MCCTreatment") {
      let shopsClassification = [];
      this.shopsList.forEach(shop => {
        let schemaClassifications = [];
        shop.industryClassifications.forEach(industry => {
          var classification = "";
          if (industry.industryClassificationCode == null || industry.industryClassificationCode == '' || industry.industryClassificationPotentialCodes?.length > 0) {
            classification = context.form.get("shopsMCC").get(shop.id + industry.paymentSchemeAttributeId + industry.subPaymentSchemeAttributeId).value;
            schemaClassifications.push({
              paymentSchemeId: industry.paymentSchemeAttributeId,
              subPaymentSchemaId: industry.subPaymentSchemeAttributeId,
              classification: classification
            });
          }
        });
        shopsClassification.push({
          shopId: shop.id,
          schemaClassifications: schemaClassifications
        });
      });
      this.processNrService.changeList(shopsClassification);
    }

  }

  initializeElegibilityForm() {
    this.form = new FormGroup({
      observation: new FormControl(''),
      stakeholdersEligibility: new FormGroup({}),
      merchantEligibility: new FormControl('', Validators.required)
    });
    if (!this.edit || (this.queueName == "risk" && this.currentUser.permissions != UserPermissions.COMPLIANCEOFFICE) || this.queueName == "eligibility" && (this.currentUser.permissions != UserPermissions.UNICRE && this.currentUser.permissions != UserPermissions.COMERCIAL)) { //relativamente ao eligibility -> && this.currentUser.permissions != UserPermissions.CALLCENTER
      this.form.disable();
    }
  }

  initializeMCCForm() {
    this.form = new FormGroup({
      shopsMCC: new FormGroup({})
    });
    if (!this.edit || this.currentUser.permissions != UserPermissions.DO) {
      this.form.disable();
    }
  }

  initializeComplianceForm() {
    this.form = new FormGroup({
      observation: new FormControl('', Validators.required)
    });
    var observation = "";
    this.processNrService.observation.subscribe(obs => observation = obs);
    if (observation != null && observation != "") {
      this.form.get("observation").setValue(observation);
      this.form.updateValueAndValidity();
    }
    if (!this.edit || (this.queueName == "DOValidation" && this.currentUser.permissions != UserPermissions.DO) || (this.queueName == "negotiationAproval" && this.currentUser.permissions != UserPermissions.UNICRE) || (this.queueName == "compliance" && this.currentUser.permissions != UserPermissions.COMPLIANCEOFFICE)) {
      this.form.disable();
    }
  }

  initializeMultipleClientsForm() {
    this.form = new FormGroup({
      documentType: new FormControl(''),
      documentNumber: new FormControl(''),
      observation: new FormControl('')
    });
    var observation = "";
    this.processNrService.observation.subscribe(obs => observation = obs);
    if (observation != null && observation != "") {
      this.form.get("observation").setValue(observation);
      this.form.updateValueAndValidity();
    }
    if (!this.edit || this.currentUser.permissions != UserPermissions.DO) {
      this.form.disable();
    }
  }

  initializeValidationSIBSForm() {
    this.form = new FormGroup({
      observation: new FormControl(''),
      enrollmentMerchantNumber: new FormControl(this.merchant?.merchantRegistrationId, Validators.required),
      shops: new FormGroup({}),
      equipments: new FormGroup({})
    });
    if (!this.edit || this.currentUser.permissions != UserPermissions.DO) {
      this.form.disable();
    }
  }

  updateStakeForm() {
    var context = this;
    var formGroupStakeholdersEligibility = new FormGroup({});
    this.stakesList.forEach(function (value, idx) {
      if (context.queueName == 'risk' && value.riskAssessmentTenant?.hasRisk == 'RequireComplianceEvaluation') {
        formGroupStakeholdersEligibility.addControl(value.id, new FormControl('', Validators.required));
      }
      if (context.queueName == 'eligibility' && value.eligibilityAssessmentTenant == 'RequiresManualAssessment') {
        formGroupStakeholdersEligibility.addControl(value.id, new FormControl('', Validators.required));
      }
    });
    this.form.setControl("stakeholdersEligibility", formGroupStakeholdersEligibility);
    this.riskFinished = true;

    var observation = "";
    var merchant;
    var stakes = [];
    this.processNrService.observation.subscribe(obs => observation = obs);
    if (observation != null && observation != "") {
      this.form.get("observation").setValue(observation);
    }
    this.processNrService.merchant.subscribe(m => merchant = m);
    if (merchant != null && merchant != "") {
      this.form.get("merchantEligibility").setValue(merchant);
    }
    this.processNrService.list.subscribe(value => stakes = value);
    if (stakes != null && stakes.length > 0) {
      stakes.forEach(val => {
        if (this.form.get("stakeholdersEligibility").get(val.stakeholderId)) { 
          this.form.get("stakeholdersEligibility").get(val.stakeholderId).setValue(val.accepted);
        }
      });
    }
    this.form.updateValueAndValidity();
    if (!this.edit || (this.queueName == "risk" && this.currentUser.permissions != UserPermissions.COMPLIANCEOFFICE) || this.queueName == "eligibility" && (this.currentUser.permissions != UserPermissions.UNICRE && this.currentUser.permissions != UserPermissions.COMERCIAL)) { //this.currentUser.permissions != UserPermissions.CALLCENTER
      this.form.disable();
    }
  }

  updateShopForm() {
    var formGroupShop = new FormGroup({});
    this.shopsList.forEach(function (value, idx) {
      value.industryClassifications.forEach(val => {
        if (val.industryClassificationCode == null || val.industryClassificationCode == '') {
          formGroupShop.addControl(value.id + val.paymentSchemeAttributeId + val.subPaymentSchemeAttributeId, new FormControl('', Validators.required)); 
        } else {
          formGroupShop.addControl(value.id + val.industryClassificationCode, new FormControl(val.industryClassificationCode, Validators.required));
        }
      });
    });
    this.form.setControl("shopsMCC", formGroupShop);
    this.MCCFinished = true;

    var context = this;
    var shops = [];
    this.processNrService.list.subscribe(value => shops = value);
    if (shops != null && shops.length > 0) {
      shops.forEach(val => {
        val.schemaClassifications.forEach(v => {
          if (context.form.get("shopsMCC").get(val.shopId + v.paymentSchemeId + v.subPaymentSchemaId)) {
            context.form.get("shopsMCC").get(val.shopId + v.paymentSchemeId + v.subPaymentSchemaId).setValue(v.classification);
          }
        });
      });
      this.form.updateValueAndValidity();
    }
    if (!this.edit || this.currentUser.permissions != UserPermissions.DO) {
      this.form.disable();
    }
  }

  updateShopValidationForm() {
    var context = this;
    var formGroupShop = new FormGroup({});
    this.shopsList = this.shopsList.filter(shop => shop.supportEntity == 'Other');
    this.equipmentList.forEach(equip => {
      var found = context.shopsList.find(shop => shop.id == equip["shopId"]);
      if (found == undefined) {
        var index = context.equipmentList.indexOf(equip);
        context.equipmentList.splice(index, 1);
      }
    });

    this.shopsList.forEach(function (value, idx) {
      formGroupShop.addControl(value.id, new FormControl(value.registrationId, Validators.required));
      var formGroupEquip = new FormGroup({});
      context.equipmentList.forEach(equip => {
        if (equip["shopId"] === value.id) {
          formGroupEquip.addControl(equip.shopEquipmentId, new FormControl(equip.registrationId, Validators.required));
        }
      });
      context.form.setControl("equipments", formGroupEquip);
    });
    this.form.setControl("shops", formGroupShop);
    this.form.get("enrollmentMerchantNumber").setValue(this.merchant.merchantRegistrationId);
    this.finished = true;

    var context = this;
    var shops = [];
    var merchant;
    var observation = "";
    this.processNrService.observation.subscribe(obs => observation = obs);
    if (observation != null && observation != "") {
      this.form.get("observation").setValue(observation);
    }
    this.processNrService.merchant.subscribe(m => merchant = m);
    if (merchant != null && merchant != "") {
      this.form.get("enrollmentMerchantNumber").setValue(merchant);
    }
    this.processNrService.list.subscribe(value => shops = value);
    if (shops != null && shops.length > 0) {
      shops.forEach(val => {
        if (context.form.get("shops").get(val.shopId)) {
          context.form.get("shops").get(val.shopId).setValue(val.shopRegistrationId);
        }
        val.equipments.forEach(v => {
          if (context.form.get("equipments").get(v.equipmentId)) {
            context.form.get("equipments").get(v.equipmentId).setValue(v.equipmentRegistrationId);
          }
        });
      });
      this.form.updateValueAndValidity();
    }
    if (!this.edit || this.currentUser.permissions != UserPermissions.DO) {
      this.form.disable();
    }
  }

  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    this.subscription = this.processNrService.edit.subscribe(edit => this.edit = edit);
    this.data.historyStream$.next(true);
    if (this.queueName === 'eligibility' || this.queueName === 'risk') {
      this.initializeElegibilityForm();
    }
    if (this.queueName === 'negotiationAproval' || this.queueName === 'MCCTreatment' || this.queueName === 'validationSIBS') {
      if (this.queueName === 'negotiationAproval') 
        this.initializeComplianceForm();
      
      if (this.queueName === 'MCCTreatment')
        this.initializeMCCForm();

      if (this.queueName === 'validationSIBS')
        this.initializeValidationSIBSForm();

      this.subs.push(this.tableInfo.GetAllShopActivities().subscribe(result => {
        this.logger.info("Get all shop activities result: " + JSON.stringify(result));
        this.activities = result;
      }, error => {
        this.logger.error(error, "", "Error getting all shop activities");
      }));

    }
    if (this.queueName === 'compliance' || this.queueName === 'DOValidation') {
      this.initializeComplianceForm();
    }
    if (this.queueName === 'multipleClients') {
      this.initializeMultipleClientsForm();

    }
  }

  getStakeholderInfo(processId, stakeholderId) {
    return new Promise((resolve, reject) => {
      this.queuesInfo.getProcessStakeholderDetails(processId, stakeholderId).then(res => {
        var stakeholder = res.result;
        var stakeholderGroup = this.form.get('stakeholdersEligibility') as FormGroup;
        stakeholderGroup.addControl(stakeholderId, new FormControl('', Validators.required));
        this.stakesList.push(stakeholder);
        resolve;
      })
    });
  }

  loadStakeholdersFromProcess() {
    //Listar os stakeholders do processo
    return new Promise((resolve, reject) => {
      this.queuesInfo.getProcessStakeholdersList(this.processId).then(result => {
        this.logger.info("Get stakeholders list from process result: " + JSON.stringify(result));
        var stakeholders = result.result;
        var totalLength = stakeholders.length;

        var stakeholderInfoPromises = [];

        stakeholders.forEach(value => {
          // Obter o detalhe dos stakeholders
          stakeholderInfoPromises.push(this.getStakeholderInfo(this.processId, value.id));
        });

        Promise.all(stakeholderInfoPromises).then(res => {
          resolve;
        });
      });
    });
  }

  getShopEquipmentInfo(processId, shopId, shopEquipmentId) {
    var context = this;

    return new Promise((resolve, reject) => {
      this.queuesInfo.getProcessShopEquipmentDetails(processId, shopId, shopEquipmentId).then(r => {
        this.logger.info("Get shop equipment list from process result: " + JSON.stringify(r));
        var equipment = r.result;
        equipment.shopEquipmentId = shopEquipmentId;
        equipment["shopId"] = shopId;
        this.equipmentList.push(equipment);
        resolve(equipment);
      });
    });
  }

  getShopInfo(processId, shopId) {
    var context = this;

    return new Promise((resolve, reject) => {
      this.queuesInfo.getProcessShopDetails(processId, shopId).then(result => {
        this.logger.info("Get shop from process result: " + JSON.stringify(result));
        var shop = result.result;
        if (this.queueName == 'negotiationAproval') {
          if (shop?.pack != null && shop?.pack?.commission != null && shop?.pack?.commission?.attributes?.length > 0) {
            shop.pack.commission.attributes.forEach(value => {
              var originalVal = (value.percentageValue.originalValue * 100).toFixed(3);
              if (originalVal.includes(".")) {
                var split = originalVal.split(".");
                if (split[1].length < 3) {
                  var decimal = split[1].length == 0 ? "000" : split[1].length == 1 ? "00" + split[1] : "0" + split[1];
                } else {
                  var decimal = split[1].substring(0, 3);
                }
                originalVal = split[0] + "." + decimal;
              }
              if (originalVal.includes(",")) {
                var split = originalVal.split(",");
                if (split[1].length < 3) {
                  var decimal = split[1].length == 0 ? "000" : split[1].length == 1 ? "00" + split[1] : "0" + split[1];
                } else {
                  var decimal = split[1].substring(0, 3);
                }
                originalVal = split[0] + "," + decimal;
              }
              if (!originalVal.includes(".") && !originalVal.includes(",")) {
                originalVal = originalVal + "." + "000";
              }

              value.percentageValue.originalValue = Number(originalVal);

              var finalVal = (value.percentageValue.finalValue * 100).toFixed(3);
              if (finalVal.includes(".")) {
                var split = finalVal.split(".");
                if (split[1].length < 3) {
                  var decimal = split[1].length == 0 ? "000" : split[1].length == 1 ? "00" + split[1] : "0" + split[1];
                } else {
                  var decimal = split[1].substring(0, 3);
                }
                finalVal = split[0] + "." + decimal;
              }
              if (finalVal.includes(",")) {
                var split = finalVal.split(",");
                if (split[1].length < 3) {
                  var decimal = split[1].length == 0 ? "000" : split[1].length == 1 ? "00" + split[1] : "0" + split[1];
                } else {
                  var decimal = split[1].substring(0, 3);
                }
                finalVal = split[0] + "," + decimal;
              }
              if (!finalVal.includes(".") && !finalVal.includes(",")) {
                finalVal = finalVal + "." + "000";
              }

              value.percentageValue.finalValue = Number(finalVal);
            });
          }
        }
        this.shopsList.push(shop);
        context.shopIssuesList.push(shop);
        context.loadStores(context.shopsList);
        context.emitSelectedStore(context.shopsList[0], 0);
        var found = context.issues.shops.find(store => store.shop.id == shop.id);
        if (found != undefined) {
          found.shop["name"] = shop.name;
        }
        this.queuesInfo.getShopEquipmentConfigurationsFromProcess(this.processId, shop.id).then(eq => {
          this.logger.info("Get shop equipments list from process result: " + JSON.stringify(result));
          var equipments = eq.result;
          var shopEquipmentPromisses = [];
          equipments.forEach(val => {
            // Obter o detalhe dos equipamentos das lojas
            shopEquipmentPromisses.push(context.getShopEquipmentInfo(processId, shop.id, val.id));
          })

          Promise.all(shopEquipmentPromisses).then(res => {
            //se o código estiver todo OK, a chamada deve ser feita AQUI
            if (this.queueName === 'MCCTreatment') {
              this.updateShopForm();
            }
            if (this.queueName === 'validationSIBS') {
              this.updateShopValidationForm();
            }
            resolve(processId);
          })
        });
      })
    });
  }

  loadShopsFromProcess() {
    var context = this;
    var subPromisses = [];
    return new Promise((resolve, reject) => {
      this.queuesInfo.getProcessShopsList(this.processId).then(result => {
        this.logger.info("Get shops list from process result: " + JSON.stringify(result));
        var shops = result.result;
        shops.forEach(value => {
          subPromisses.push(context.getShopInfo(this.processId, value.id));
        });
        Promise.all(subPromisses).then(success => {
          resolve;
        });
      });
    })
  }

  async getNames(issues: BusinessIssueViewModel, isSelected: boolean) {
    var context = this;
    var lengthStake = 0;
    var lengthStore = 0;
    var finishedStake = false;
    var finishedStore = false;
    context.filterIssues = [];

    let promise = new Promise((resolve, reject) => {

      if (issues.shops.length == 0) {
        finishedStore = true;
      }
      if (issues.stakeholders.length == 0) {
        finishedStake = true;
      }

      issues.documents.forEach(val => {
        var found = context.docTypes.find(doc => doc.code == val.document.type);
        if (found != undefined)
          val.document.type = found.description;
      });
      //issues.documents.forEach(value => {
      //  value.issues.forEach(val => {
      //    if (val.issueDescription != null && val.issueDescription != "") {
      //      val["name"] = value.document.type;
      //      context.filterIssues.push(val);
      //    }
      //  });
      //});
      issues.process.forEach(value => {
        if (value.issueDescription != null && value.issueDescription != "") {
          value["name"] = "Processo";
          context.filterIssues.push(value);
        }
      });
      if (this.merchant == null) {
        this.queuesService.getProcessMerchant(this.processId).then(res => {
          this.merchant = res.result;
          issues.merchant.merchant["name"] = res.result.legalName;
          issues.merchant.issues.forEach(value => {
            if (value.issueDescription != null && value.issueDescription != "") {
              value["name"] = issues.merchant.merchant["name"];
              context.filterIssues.push(value);
            }
          });
        });
      } else {
        issues.merchant.merchant["name"] = this.merchant.legalName;
        issues.merchant.issues.forEach(value => {
          if (value.issueDescription != null && value.issueDescription != "") {
            value["name"] = this.merchant.legalName;
            context.filterIssues.push(value);
          }
        });
      }
      if (this.queueName === 'eligibility' || this.queueName === 'risk' || this.queueName === 'compliance' || this.queueName === 'multipleClients' || this.queueName === 'DOValidation') {
        issues.shops.forEach(val => {
          var index = context.shopIssuesList.findIndex(shop => shop.id == val?.shop?.id);
          if (index == -1) {
            context.queuesService.getProcessShopDetails(context.processId, val?.shop?.id).then(res => {
              lengthStore++;
              val.shop["name"] = res.result.name;
              context.shopIssuesList.push(res.result);
              val.issues.forEach(v => {
                if (v.issueDescription != null && v.issueDescription != "") {
                  v["name"] = val.shop["name"];
                  context.filterIssues.push(v);
                }
              });
              if (lengthStore == issues.shops.length) {
                finishedStore = true;
                if (finishedStake) {
                  resolve(true);
                }
              }
            });
          } else {
            lengthStore++;
            val.shop["name"] = context.shopIssuesList[index].name;
            val.issues.forEach(v => {
              if (v.issueDescription != null && v.issueDescription != "") {
                v["name"] = val.shop["name"];
                context.filterIssues.push(v);
              }
            });
            if (lengthStore == issues.shops.length) {
              finishedStore = true;
              if (finishedStake) {
                resolve(true);
              }
            }
          }

        });
      }
      if (this.queueName === 'negotiationAproval' || this.queueName === 'MCCTreatment' || this.queueName === 'validationSIBS' || this.queueName === 'DOValidation') {
        issues.stakeholders.forEach(val => {
          var index1 = context.stakeIssuesList.findIndex(stake => stake.id == val?.stakeholder?.id);
          if (index1 == -1) {
            context.queuesService.getProcessStakeholderDetails(context.processId, val?.stakeholder?.id).then(res => {
              lengthStake++;
              val.stakeholder["name"] = res.result.shortName;
              context.stakeIssuesList.push(res.result);
              val.issues.forEach(v => {
                if (v.issueDescription != null && v.issueDescription != "") {
                  v["name"] = val.stakeholder["name"];
                  context.filterIssues.push(v);
                }
              });
              if (lengthStake == issues.stakeholders.length) {
                finishedStake = true;
                if (finishedStore) {
                  resolve(true);
                }
              }
            });
          } else {
            lengthStake++;
            val.stakeholder["name"] = context.stakeIssuesList[index1].shortName;
            val.issues.forEach(v => {
              if (v.issueDescription != null && v.issueDescription != "") {
                v["name"] = val.stakeholder["name"];
                context.filterIssues.push(v);
              }
            });
            if (lengthStake == issues.stakeholders.length) {
              finishedStake = true;
              if (finishedStore) {
                resolve(true);
              }
            }
          }

        });
      }

    }).finally(() => {
      issues.documents.forEach(value => {
        value.issues.forEach(val => {
          if (val.issueDescription != null && val.issueDescription != "") {
            val["type"] = value.document.type;

            var found = context.merchant.documents.find(doc => doc["id"] == value.document.id);
            if (found != undefined)
              val["name"] = context.merchant.legalName;

            context.stakeholdersList.forEach(stake => {
              var foundStake = stake.documents.find(doc => doc.id == value.document.id);
              if (foundStake != undefined)
                val["name"] = stake.shortName;
            });
            context.shopIssuesList.forEach(shop => {
              var foundShop = shop.documents.find(doc => doc.id == value.document.id);
              if (foundShop != undefined)
                val["name"] = shop.name;
            });
            context.filterIssues.push(val);
          }
        });
      });
      if (isSelected) {
        this.loadSelectedReturnReasons(context.filterIssues);
      } else {
        this.loadReturnReasons(context.filterIssues);
      }
    });
  }


  fetchStartingInfo() {
    var context = this;
    this.tableInfo.GetDocumentsDescription().subscribe(result => {
      this.docTypes = result;
    });

    this.processService.getProcessById(this.processId).subscribe(result => {
      this.logger.info("Get process by id result: " + JSON.stringify(result));
      this.process = result;
      this.processNumber = result.processNumber;
      localStorage.setItem('processNumber', this.processNumber);
      this.processNrService.changeProcessNumber(this.processNumber);
      this.data.updateData(true, 0);
      this.processService.getProcessIssuesById(this.processId).subscribe(res => {
        this.logger.info("Get process issues result: " + JSON.stringify(result));
        this.issues = res;
        this.getNames(this.issues, false);
      });
    });

    this.processService.getProcessHistory(this.processId).then(result => {
      this.logger.info("Get process history result: " + JSON.stringify(result));
      this.processHistoryItems = result.result;
      if (this.processHistoryItems.items.length > 2) {
        this.observationLength = this.processHistoryItems.items.length - 2;
      } else {
        this.observationLength = 0;
      }
      this.processHistoryItems.items.sort((b, a) => new Date(b.whenStarted).getTime() - new Date(a.whenStarted).getTime());
      this.processHistoryItems.items.forEach(process => {
        process.whenStarted = this.datePipe.transform(process.whenStarted, 'yyyy-MM-dd HH:mm').toString();
        if (process.processState === 'Incomplete') {
          process.processState = this.translate.instant('searches.incompleted');
        } else if (process.processState === 'Ongoing') {
          process.processState = this.translate.instant('searches.running');
        } else if (process.processState === 'Completed') {
          process.processState = this.translate.instant('searches.completed');
        } else if (process.processState === 'Returned') {
          process.processState = this.translate.instant('searches.returned');
        } else if (process.processState === 'Cancelled') {
          process.processState = this.translate.instant('searches.cancelled');
        } else if (process.processState === 'ContractAcceptance') {
          process.processState = this.translate.instant('searches.contractAcceptance')
        } else if (process.processState === 'AwaitingCompletion') {
          process.processState = this.translate.instant('searches.awaitingCompletion')
        } else if (process.processState === 'StandardIndustryClassificationChoice') {
          process.processState = this.translate.instant('searches.MCCTreatment');
        } else if (process.processState === 'RiskAssessment') {
          process.processState = this.translate.instant('searches.riskOpinion');
        } else if (process.processState === 'EligibilityAssessment') {
          process.processState = this.translate.instant('searches.eligibility');
        } else if (process.processState === 'ClientChoice') {
          process.processState = this.translate.instant('searches.multipleClients');
        } else if (process.processState === 'NegotiationApproval') {
          process.processState = this.translate.instant('searches.negotiationApproval');
        } else if (process.processState === 'MerchantRegistration') {
          process.processState = this.translate.instant('searches.merchantRegistration');
        } else if (process.processState === 'OperationsEvaluation') {
          process.processState = this.translate.instant('searches.DOValidation');
        } else if (process.processState === 'ComplianceEvaluation') {
          process.processState = this.translate.instant('searches.complianceDoubts');
        } else if (process.processState === 'ContractDigitalAcceptance') {
          process.processState = this.translate.instant('searches.contractDigitalAcceptance');
        } else if (process.processState === 'DigitalIdentification') {
          process.processState = this.translate.instant('searches.digitalIdentification');
        }
        this.ready = true;
      });
      this.loadHistory(this.processHistoryItems.items);
    });

    this.queuesInfo.getProcessMerchant(this.processId).then(res => {
      this.merchant = res.result;
      if (this.merchant.potentialClientIds != null && this.merchant.potentialClientIds.length > 0) {
        this.merchant["type"] = "Empresa";
        this.multipleStakeList.push(this.merchant);
      }
    })
    if (this.queueName === 'eligibility' || this.queueName === 'risk' || this.queueName === 'compliance' || this.queueName === 'multipleClients') {
      this.processService.getStakeholdersFromProcess(this.processId).then(success => {
        if (success.result.length > 0) {
          let length = 0;
          success.result.forEach((stake, index) => {
            context.processService.getStakeholderByIdFromProcess(context.processId, stake.id).subscribe(res => {
              length++;
              context.stakesList.push(res);
              context.stakeIssuesList.push(res);

              if (res.potentialClientIds != null && res.potentialClientIds.length > 0) {
                res["type"] = "Particular";
                context.multipleStakeList.push(res);
              }
              var found = context.issues.stakeholders.find(stake => stake.stakeholder.id == res.id);
              if (found != undefined) {
                found.stakeholder["name"] = res.shortName;
              }
              if (length == success.result.length) {
                if (this.queueName !== 'compliance' && this.queueName !== 'multipleClients') {
                  this.updateStakeForm();
                }
                if (context.multipleStakeList.length > 0) {
                  context.loadMultipleStake(context.multipleStakeList);
                }
              }
            });
          });
        }
      });
    }
    if (this.queueName === 'negotiationAproval' || this.queueName === 'MCCTreatment' || this.queueName === 'validationSIBS') {
      this.loadShopsFromProcess().then(next => {
      }, reject => {
      });
    }
    if (this.queueName === 'DOValidation') {

    }
  }

  getHistoryIssueDetails(historyGuid: string) {
    this.selectedHistoryGuid = historyGuid;
    this.processService.getProcessIssuesById(this.processId, historyGuid).subscribe(res => {
      this.logger.info("Get process issues result: " + JSON.stringify(res));
      this.selectedIssue = res;
      this.getNames(this.selectedIssue, true);
    });
  }

  emitSelectedStore(store, idx) {
    this.currentStore = store;
    this.currentIdx = idx;
  }

  selectStake(stake, idx) {
    this.selectedStake = stake;
    this.multipleStakeCurrentIdx = idx;

    this.showFoundClient = false;
    this.canSearch = true;
    this.notFound = false;
    this.clientsToShow = [];
    this.clientsMat.data = this.clientsToShow;

    if (stake["type"] == "Empresa") { //corporateEntity e empresa
      this.isCompany = true;
      this.form.get("documentType").setValue("0502");
      this.form.get("documentNumber").setValue(stake.fiscalId);
    }
    if (stake["type"] == "Particular") { //privateEntity e stakeholders
      this.isCompany = false;
      this.form.get("documentType").setValue("0501");
      this.form.get("documentNumber").setValue(stake.fiscalId);
    }
    
  }

  loadStores(storesValues: ShopDetailsAcquiring[]) {
    this.storesMat.data = storesValues;
    this.storesMat.sort = this.sortStore;
  }

  loadHistory(history: ProcessHistory[]) {
    this.historyMat.data = history;
    this.historyMat.sort = this.historySort;
  }

  loadReturnReasons(reasons: IssueViewModel[]) {
    this.returnMat.data = reasons;
    this.returnMat.sort = this.returnSort;
  }

  loadSelectedReturnReasons(reasons: IssueViewModel[]) {
    this.returnSelectedMat.data = reasons;
    this.returnSelectedMat.sort = this.returnSelectedSort;
  }

  loadMultipleStake(stakes: any[]) {
    this.multipleStakeMat.data = stakes;
    this.multipleStakeMat.sort = this.multipleStakeSort;
  }

  ngAfterViewInit(): void {
    this.storesMat.sort = this.sortStore;
    this.historyMat.sort = this.historySort;
    this.returnMat.sort = this.returnSort;
    this.returnSelectedMat.sort = this.returnSelectedSort;
    this.multipleStakeMat.sort = this.multipleStakeSort;
  }

  nextPage() {
    var context = this;
    if (this.queueName == "eligibility") {
      var observation = this.form.get('observation').value;
      var merchantAccepted = this.form.get("merchantEligibility").value; //this.merchant.id
      var stakeholders = this.form.get("stakeholdersEligibility") as FormGroup;
      var stakes = [];
      for (const cont in stakeholders.controls) {
        const control = this.form.get("stakeholdersEligibility").get(cont);
        stakes.push({
          stakeholderId: cont,
          accepted: control.value
        })
      }

      this.processNrService.changeObservation(observation);
      this.processNrService.changeMerchant(merchantAccepted);
      this.processNrService.changeList(stakes);


    } else if (this.queueName == "risk") {
      var observation = this.form.get('observation').value;
      var merchantAccepted = this.form.get("merchantEligibility").value; //this.merchant.id
      var stakeholders = this.form.get("stakeholdersEligibility") as FormGroup;
      var stakes = [];
      for (const cont in stakeholders.controls) {
        const control = this.form.get("stakeholdersEligibility").get(cont);
        stakes.push({
          stakeholderId: cont,
          accepted: control.value
        })
      }

      this.processNrService.changeObservation(observation);
      this.processNrService.changeMerchant(merchantAccepted);
      this.processNrService.changeList(stakes);

    } else if (this.queueName == "compliance") {
      var observation = this.form.get('observation').value;
      this.processNrService.changeObservation(observation);
    } else if (this.queueName == "DOValidation") {
      var observation = this.form.get('observation').value;
      this.processNrService.changeObservation(observation);
    } else if (this.queueName == "validationSIBS") {
      var observation = this.form.get('observation').value;
      var merchantRegistrationId = this.form.get("enrollmentMerchantNumber").value;
      let shops = [];
      this.shopsList.forEach(shop => {
        var equips = [];
        this.equipmentList.forEach(equip => {
          if (shop.id === equip["shopId"]) {
            equips.push({
              equipmentId: equip.shopEquipmentId,
              equipmentRegistrationId: context.form.get("equipments")?.get(equip.shopEquipmentId)?.value
            });
          }
        });
        var model = {
          shopId: shop.id,
          shopRegistrationId: context.form.get("shops").get(shop.id).value,
          equipments: equips
        };
        shops.push(model);
      });

      this.processNrService.changeObservation(observation);
      this.processNrService.changeMerchant(merchantRegistrationId);
      this.processNrService.changeList(shops);

    } else if (this.queueName == "negotiationAproval") {
      var observation = this.form.get('observation').value;
      this.processNrService.changeObservation(observation);
    }  else if (this.queueName == "multipleClients") {
      var observation = this.form.get('observation').value;
      var merchantChoice = {};
      var found = context.multipleStakeList.find(value => value.id == this.merchant.id);
      if (found != undefined) {
        merchantChoice = {
          id: found.id,
          clientNumber: found["clientNumber"]
        };
      }
      let stakeholdersChoice = [];
      context.multipleStakeList.forEach(value => {
        if (value["type"] == "Particular") {
          stakeholdersChoice.push({
            id: value.id,
            clientNumber: value["clientNumber"]
          });
        }
      });

      this.processNrService.changeObservation(observation);
      this.processNrService.changeMerchant(merchantChoice);
      this.processNrService.changeList(stakeholdersChoice);

    } else if (this.queueName == "MCCTreatment") {
      let shopsClassification = [];
      this.shopsList.forEach(shop => {
        let schemaClassifications = [];
        shop.industryClassifications.forEach(industry => {
          var classification = "";
          if (industry.industryClassificationCode == null || industry.industryClassificationCode == '' || industry.industryClassificationPotentialCodes?.length > 0) {
            classification = context.form.get("shopsMCC").get(shop.id + industry.paymentSchemeAttributeId + industry.subPaymentSchemeAttributeId).value;
            schemaClassifications.push({
              paymentSchemeId: industry.paymentSchemeAttributeId,
              subPaymentSchemaId: industry.subPaymentSchemeAttributeId,
              classification: classification
            });
          }
        });
        shopsClassification.push({
          shopId: shop.id,
          schemaClassifications: schemaClassifications
        });
      });
      this.processNrService.changeList(shopsClassification);
    }

    localStorage.setItem('returned', 'consult');
    this.data.changeQueueName(this.queueName);
    localStorage.setItem("processNumber", this.process.processNumber);
    this.processNrService.changeProcessId(this.process.processId);
    this.processNrService.changeQueueName(this.queueName);
    this.logger.info("Redirecting to Client By Id page");
    this.route.navigate(['/clientbyid']);
  }

  getHits(riskAssessmentTenant: RiskAssessmentTenantViewModel) {
    var str = "";
    riskAssessmentTenant?.hits?.forEach(hit => {
      str += hit.code + "-" + hit.value + ";"
    });
    return str;
  }

  selectFile(event: any) {
    var context = this;
    if (this.queueName === "eligibility") {
      this.type = "queues.attach.eligibility"
    } else if (this.queueName === "compliance") {
      this.type = "queues.attach.compliance"
    } else if (this.queueName === "DOValidation") {
      this.type = "queues.attach.DOValidation"
    } else if (this.queueName === "risk") {
      this.type = "queues.attach.risk"
    } else if (this.queueName === "negotiationAproval") {
      this.type = "queues.attach.negotiationApproval"
    }
    this.attach = { tipo: this.type, dataDocumento: this.datePipe.transform(new Date(), 'dd-MM-yyyy') };
    const files = <File[]>event.target.files;
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      if (file.type == "application/pdf") {
        const sizeFile = file.size / (1024 * 1024);
        var extensoesPermitidas = /(.pdf)$/i;
        const limSize = 10;
        this.result = this.http.put(this.baseUrl + 'ServicesComprovativos/', 1);
        if (this.result != null) {
          if ((sizeFile <= limSize)) {
            if (event.target.files && files[i]) {
              var reader = new FileReader();
              reader.onload = (event: any) => {
                this.localUrl = event.target.result;
              }
              reader.readAsDataURL(files[i]);
              this.files.push(file);
              this.snackBar.open(this.translate.instant('queues.attach.success'), '', {
                duration: 4000,
                panelClass: ['snack-bar']
              });
            } else {
              alert("Verifique o tipo / tamanho do ficheiro");
            }
          }
        }
      } else {
        this.snackBar.open(this.translate.instant('queues.attach.pdfOnly'), '', {
          duration: 4000,
          panelClass: ['snack-bar']
        });
      }
    }
    var fileBinaries = [];
    let length = 0;
    this.files.forEach(function (value, idx) {
      length++;
      context.documentService.readBase64(value).then(data => {
        fileBinaries.push(data.split(',')[1]);
        if (length == context.files.length) {
          localStorage.setItem("documents", JSON.stringify(fileBinaries));
        }
      });
    });
  }

  openFile(/*url: any, imgName: any*/ file: File) {
    let blob = new Blob([file], { type: file.type });
    let url = window.URL.createObjectURL(blob);

    window.open(url, '_blank',
      `margin: auto;
      width: 50%;
      padding: 10px;
      text-align: center;
      border: 3px solid green;
      `);
  }

  deleteFile(fileToDelete: File) {
    let index = this.files.findIndex(f => f.lastModified === fileToDelete.lastModified);
    if (index > -1)
      this.files.splice(index, 1);
    if (this.files.length == 0)
      this.attach = undefined;
  }

  check() {
    console.log('Form favorável ', this.form);
    this.checkButton = true;
  }

  uncheck() {
    console.log('Form não favorável ', this.form);
    this.checkButton = false;
  }

  getActivityDescription(activityCode) {
    this.activities.forEach(act => {
      if (activityCode == act.activityCode) {
        this.subActivities = act.subActivities;
      }
    })
    return this.activities?.find(a => a.activityCode == activityCode)?.activityDescription;
  }

  getSubActivityDescription(subActivityCode) {
    return this.subActivities?.find(s => s.subActivityCode == subActivityCode)?.subActivityDescription;
  }

  searchClient() {
    var context = this;
    if (this.canSearch) {
      this.canSearch = false;
      var documentNumber = this.form.get("documentNumber").value;
      var documentType = this.form.get("documentType").value;
      if (this.isCompany) {
        this.clientService.SearchClientByQuery(documentNumber, documentType, "por mudar", "por mudar").subscribe(o => {
          this.logger.info("Search client by ID result: " + JSON.stringify(o));
          this.showFoundClient = true;
          var clients = o;
          var context2 = this;
          context.clientsToShow = [];
          context.clientsMat.data = context.clientsToShow;
          if (clients.length > 0) {
            if (clients.length === 1) {
              context.snackBar.open(context.translate.instant('client.find'), '', {
                duration: 4000,
                panelClass: ['snack-bar']
              });
            } else {
              context.snackBar.open(context.translate.instant('client.multipleClients'), '', {
                duration: 4000,
                panelClass: ['snack-bar']
              });
            }
            clients.forEach(function (value, index) {
              context2.clientService.getClientByID(value.merchantId, "por mudar", "por mudar").then(c => {
                context.logger.info("Get Merchant Outbound result: " + JSON.stringify(c));
                var client = {
                  "clientId": c.result.merchantId,
                  "commercialName": c.result.commercialName,
                  "fiscalId": c.result.fiscalIdentification.fiscalId,
                  "documentType": context.ListaDocType.find(val => val.code == documentType).description,
                  "documentNumber": documentNumber
                }
                context.clientsToShow.push(client);
                context.logger.info("Clients found from search: " + JSON.stringify(context.clientsToShow));
                context.clientsMat.data = context.clientsToShow;
                if (clients.length == 1) {
                  var index = context.multipleStakeList.findIndex(val => val.id == context.selectedStake.id);
                  context.multipleStakeList[index]["clientNumber"] = client.clientId;
                  context.loadMultipleStake(context.multipleStakeList);
                  var found = context.multipleStakeList.find(val => val["clientNumber"] == null || val["clientNumber"] == "");
                  if (found == undefined) {
                    context.allStakesSearched = true;
                  }
                }
              }).then(res => {
                context.notFound = false;
                context.canSearch = true;
              });
            });
          } else {
            this.showFoundClient = false;
            this.notFound = true;
            this.canSearch = true;
            context.snackBar.open(context.translate.instant('client.notFound'), '', {
              duration: 4000,
              panelClass: ['snack-bar']
            });
          }
        }, error => {
          context.showFoundClient = false;
          this.notFound = true;
          this.canSearch = true;
          context.snackBar.open(context.translate.instant('client.notFound'), '', {
            duration: 4000,
            panelClass: ['snack-bar']
          });
        });

      } else {
        this.stakeholderService.SearchStakeholderByQuery(documentNumber, documentType, "", "").then(res => {
          this.logger.info("Search stakeholder by query result: " + JSON.stringify(res));
          this.showFoundClient = true;
          var clients = res.result;
          if (clients.length > 0) {
            context.clientsToShow = [];
            context.clientsMat.data = context.clientsToShow;
            var subpromises = [];
            clients.forEach(function (value, index) {
              subpromises.push(context.stakeholderService.getStakeholderByID(value.stakeholderId, "por mudar", "por mudar"));
            });
            const allPromisesWithErrorHandler = subpromises.map(promise =>
              promise.catch(error => null)
            );

            Promise.all(allPromisesWithErrorHandler).then(res => {
              var stake = res;

              stake.forEach(function (value, idx) {
                if (value != null) {
                  var stakeInfo = value.result;
                  var client = {
                    "clientId": stakeInfo.stakeholderId,
                    "commercialName": stakeInfo.shortName,
                    "fiscalId": stakeInfo.fiscalIdentification.fiscalId,
                    "documentType": context.ListaDocTypeENI.find(val => val.code == documentType).description,
                    "documentNumber": documentNumber,
                  };

                  context.clientsToShow.push(client);
                  context.logger.info("Clients found from search: " + JSON.stringify(context.clientsToShow));
                  context.clientsMat.data = context.clientsToShow;
                  if (clients.length == 1) {
                    var index = context.multipleStakeList.findIndex(val => val.id == context.selectedStake.id);
                    context.multipleStakeList[index]["clientNumber"] = client.clientId;
                    context.loadMultipleStake(context.multipleStakeList);
                    var found = context.multipleStakeList.find(val => val["clientNumber"] == null || val["clientNumber"] == "");
                    if (found == undefined) {
                      context.allStakesSearched = true;
                    }
                  }
                }
              });
            }, error => {
              this.logger.error(error, "", "Error occured while searching stakeholder");
            }).then(res => {
              context.notFound = false;
              context.canSearch = true;
            });
          } else {
            this.showFoundClient = false;
            this.notFound = true;
            this.canSearch = true;
            context.snackBar.open(context.translate.instant('client.notFound'), '', {
              duration: 4000,
              panelClass: ['snack-bar']
            });

          }
        }, error => {
          context.showFoundClient = false;
          this.notFound = true;
          this.canSearch = true;
          context.snackBar.open(context.translate.instant('client.notFound'), '', {
            duration: 4000,
            panelClass: ['snack-bar']
          });
        });
      }

    }
  }

  goToHistoryTab() {
    if (this.selectedHistoryGuid == '' || this.selectedHistoryGuid == null) {
      this.getHistoryIssueDetails(this.processHistoryItems.items[this.processHistoryItems.items.length - 1].historyGuid);
    }
  }

  concludeOpinion(type?:string) {
    var context = this;
    var queueModel;
    if (this.queueName === 'eligibility') {
      this.state = State.ELIGIBILITY_ASSESSMENT;
      queueModel = {} as EligibilityAssessment;
      var observation = this.form.get('observation').value;
      queueModel.$type = StateResultDiscriminatorEnum.ELIGIBILITY_ASSESSMENT;
      queueModel.userObservations = observation;
      this.documentType = "0058";
      queueModel.merchantAssessment = {
        merchantId: this.merchant.id,
        accepted: this.form.get("merchantEligibility").value
      };

      var stakeholders = this.form.get("stakeholdersEligibility") as FormGroup;
      queueModel.stakeholdersAssessment = [];

      for (const cont in stakeholders.controls) {
        const control = this.form.get("stakeholdersEligibility").get(cont);
        queueModel.stakeholdersAssessment.push({
          stakeholderId: cont,
          accepted: control.value
        });
      }

    } else if (this.queueName === 'risk') {
      this.state = State.RISK_ASSESSMENT;
      queueModel = {} as RiskAssessment;

      var observation = this.form.get('observation').value;
      queueModel.$type = StateResultDiscriminatorEnum.RISK_ASSESSMENT;
      queueModel.userObservations = observation;
      this.documentType = "0059";
      var stakeholders = this.form.get("stakeholdersEligibility") as FormGroup;
      queueModel.stakeholdersAssessment = [];

      for (const cont in stakeholders.controls) {
        const control = this.form.get("stakeholdersEligibility").get(cont);
        queueModel.stakeholdersAssessment.push({
          stakeholderId: cont,
          accepted: control.value
        });
      }
      queueModel.merchantAssessment = {
        accepted: this.form.get("merchantEligibility").value,
        merchantId: this.merchant.id
      };

      if (queueModel.merchantAssessment.accepted == false) {
        context.queuesInfo.markToCancel(context.processId).then(res => {
          localStorage.removeItem("documents");
          context.route.navigate(['/']);
        });
      } else {
        queueModel.stakeholdersAssessment.forEach(stake => {
          if (stake.accepted == false) {
            context.queuesInfo.markToCancel(context.processId).then(res => {
              localStorage.removeItem("documents");
              context.route.navigate(['/']);
            });
          }
        });
      }

    } else if (this.queueName === 'compliance') {
      this.state = State.COMPLIANCE_EVALUATION;
      queueModel = {} as ComplianceEvaluation;

      var observation = this.form.get('observation').value;
      queueModel.$type = StateResultDiscriminatorEnum.COMPLIANCE_EVALUATION;
      queueModel.userObservations = observation;
      this.documentType = "0060";
    } else if (this.queueName === 'DOValidation') {
      this.state = State.OPERATIONS_EVALUATION;
      queueModel = {} as OperationsEvaluation;

      var observation = this.form.get('observation').value;
      queueModel.$type = StateResultDiscriminatorEnum.OPERATIONS_EVALUATION;
      queueModel.userObservations = observation;
      queueModel.decision = type;
      this.documentType = "0061";
    } else if (this.queueName === 'multipleClients') {
      this.state = State.CLIENT_CHOICE;
      queueModel = {} as ClientChoice;

      var observation = this.form.get('observation').value;
      queueModel.$type = StateResultDiscriminatorEnum.CLIENT_CHOICE;
      queueModel.userObservations = observation;
      queueModel.decision = type;
      var found = context.multipleStakeList.find(value => value.id == this.merchant.id);
      if (found != undefined) {
        queueModel.merchantChoice = {
          id: found.id,
          clientNumber: found["clientNumber"]
        };
      }

      queueModel.stakeholdersChoice = [];
      context.multipleStakeList.forEach(value => {
        if (value["type"] == "Particular") {
          queueModel.stakeholdersChoice.push({
            id: value.id,
            clientNumber: value["clientNumber"]
          });
        }
      });
      

    } else if (this.queueName === 'validationSIBS') {
      this.state = State.MERCHANT_REGISTRATION;
      queueModel = {} as MerchantRegistration;
      queueModel.$type = StateResultDiscriminatorEnum.MERCHANT_REGISTRATION;
      queueModel.shops = [];
      var observation = this.form.get('observation').value;
      queueModel.userObservations = observation;
      queueModel.decision = type;

      queueModel.merchantRegistrationId = this.form.get("enrollmentMerchantNumber").value;
      this.shopsList.forEach(shop => {
        var equips = [];

        this.equipmentList.forEach(equip => {
          if (shop.id === equip["shopId"]) {
            equips.push({
              equipmentId: equip.shopEquipmentId,
              equipmentRegistrationId: context.form.get("equipments")?.get(equip.shopEquipmentId)?.value
            });
          }
        });
        var model = {
          shopId: shop.id,
          shopRegistrationId: context.form.get("shops").get(shop.id).value,
          equipments: equips
        };
        queueModel.shops.push(model);
      });
    } else if (this.queueName === 'negotiationAproval') {
      this.state = State.NEGOTIATION_APPROVAL;
      queueModel = {} as NegotiationApproval;

      var observation = this.form.get('observation').value;
      queueModel.$type = StateResultDiscriminatorEnum.NEGOTIATION_APPROVAL;
      queueModel.userObservations = observation;
      queueModel.decision = type;
      this.documentType = "0062";
    } else if (this.queueName === 'MCCTreatment') {
      this.state = State.STANDARD_INDUSTRY_CLASSIFICATION_CHOICE;
      queueModel = {} as StandardIndustryClassificationChoice;
      queueModel.$type = StateResultDiscriminatorEnum.STANDARD_INDUSTRY_CLASSIFICATION_MODEL;
      queueModel.shopsClassification = [];
      this.shopsList.forEach(shop => {
        let schemaClassifications = [];
        shop.industryClassifications.forEach(industry => {
          var classification = "";
          if (industry.industryClassificationCode == null || industry.industryClassificationCode == '' || industry.industryClassificationPotentialCodes?.length > 0) {
            classification = context.form.get("shopsMCC").get(shop.id + industry.paymentSchemeAttributeId + industry.subPaymentSchemeAttributeId).value;
            schemaClassifications.push({
              paymentSchemeId: industry.paymentSchemeAttributeId,
              subPaymentSchemaId: industry.subPaymentSchemeAttributeId,
              classification: classification
            });
          }
        });
        queueModel.shopsClassification.push({
          shopId: shop.id,
          schemaClassifications: schemaClassifications
        });
      });
    }

    queueModel.submissionUser = this.authService.GetCurrentUser().userName;

    if (this.files.length > 0) {
      let length = 0;
      var documents = [];
      this.files.forEach(function (value, idx) {
        context.documentService.readBase64(value).then(data => {
          var document: PostDocument = {
            documentType: context.documentType,
            file: {
              fileType: "PDF",
              binary: data.split(',')[1]
            },
            validUntil: new Date().toISOString(),
            data: {}
          }
          documents.push(document);
          length++;
          if (context.files.length == length) {
            queueModel.documents = documents;
            context.queuesInfo.postExternalState(context.processId, context.state, queueModel).then(result => {
              context.logger.info("Queue post external state result: " + JSON.stringify(queueModel));
              let navigationExtras = {
                state: {
                  queueName: context.queueName
                }
              } as NavigationExtras;
              localStorage.removeItem("documents");
              context.queuesService.getActiveWorkQueue(context.processId).then(result => {
                var workQueue = result.result as WorkQueue;
                if (workQueue.status == "InProgress") {
                  var reassignWorkQueue: ReassingWorkQueue = {};
                  reassignWorkQueue.jobId = workQueue.id;
                  reassignWorkQueue.username = context.authService.GetCurrentUser().userName;
                  reassignWorkQueue.onHold = true;
                  reassignWorkQueue.forceReassign = false;
                  context.queuesService.postReassignWorkQueue(context.processId, reassignWorkQueue).then(res => {

                  });
                }
              });
              context.route.navigate(['/'], navigationExtras);
            });
          }
        });
      });
    } else {
      this.queuesInfo.postExternalState(this.processId, this.state, queueModel).then(result => {
        this.logger.info("Queue post external state result: " + JSON.stringify(queueModel));
        let navigationExtras = {
          state: {
            queueName: this.queueName
          }
        } as NavigationExtras;
        localStorage.removeItem("documents");
        context.queuesService.getActiveWorkQueue(context.processId).then(result => {
          var workQueue = result.result as WorkQueue;
          if (workQueue.status == "InProgress") {
            var reassignWorkQueue: ReassingWorkQueue = {};
            reassignWorkQueue.jobId = workQueue.id;
            reassignWorkQueue.username = context.authService.GetCurrentUser().userName;
            reassignWorkQueue.onHold = true;
            reassignWorkQueue.forceReassign = false;
            context.queuesService.postReassignWorkQueue(context.processId, reassignWorkQueue).then(res => {

            });
          }
        });
        this.route.navigate(['/'], navigationExtras);
      });
    }
  }

  changeDocType() {
    this.incorrectNIF = false;
    this.incorrectNIFSize = false;
    this.incorrectNIPC = false;
    this.incorrectNIPCSize = false;
    this.incorrectCC= false;
    this.incorrectCCSize = false;
    this.incorrectCCFormat = false;
    this.form.get("documentNumber").setValue("");
  }

  numericOnly(event): boolean {
    var docType = this.form.get("documentType").value;
    if (docType === '0501' || docType === '0502' || docType === '1010' || docType === '0101' || docType === '0302') {
      var ASCIICode = (event.which) ? event.which : event.keyCode;

      if (ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57))
        return false;
      return true;
    }
  }

  checkValidationType() {
    var docType = this.form.get("documentType").value;
    var str = this.form.get("documentNumber").value;
    if (docType === '1001')
      this.ValidateNumeroDocumentoCC(str);

    if (docType === '0501')
      this.validateNIF(str)

    if (docType === '0502')
      this.validateNIPC(str)
  }

  validateNIF(nif: string): boolean {
    this.incorrectNIFSize = false;
    this.incorrectNIF = false;
    if (nif != '') {
      if (nif.length != 9) {
        this.incorrectNIFSize = true;
        return false;
      }
      if (!['1', '2', '3'].includes(nif.substr(0, 1))) {
        this.incorrectNIF = true;
        return false;
      }

      const total = Number(nif[0]) * 9 + Number(nif[1]) * 8 + Number(nif[2]) * 7 + Number(nif[3]) * 6 + Number(nif[4]) * 5 + Number(nif[5]) * 4 + Number(nif[6]) * 3 + Number(nif[7]) * 2;
      const modulo11 = total - Math.trunc(total / 11) * 11;
      const comparador = modulo11 === 1 || modulo11 === 0 ? 0 : 11 - modulo11;

      if (Number(nif[8]) !== comparador) {
        this.incorrectNIF = true;
        return false;
      }
      return Number(nif[8]) === comparador;
    }
  }

  validateNIPC(nipc: string): boolean {
    this.incorrectNIPCSize = false;
    this.incorrectNIPC = false;
    if (nipc != '') {
      if (nipc.length != 9) {
        this.incorrectNIPCSize = true;
        return false;
      }
      if (!['5', '6', '8', '9'].includes(nipc.substr(0, 1))) {
        this.incorrectNIPC = true;
        return false;
      }

      const total = Number(nipc[0]) * 9 + Number(nipc[1]) * 8 + Number(nipc[2]) * 7 + Number(nipc[3]) * 6 + Number(nipc[4]) * 5 + Number(nipc[5]) * 4 + Number(nipc[6]) * 3 + Number(nipc[7]) * 2;
      const modulo11 = total - Math.trunc(total / 11) * 11;
      const comparador = modulo11 === 1 || modulo11 === 0 ? 0 : 11 - modulo11;

      if (Number(nipc[8]) !== comparador) {
        this.incorrectNIPC = true;
        return false;
      }

      return Number(nipc[8]) === comparador;
    }
  }

  ValidateNumeroDocumentoCC(numeroDocumento: string) {
    this.incorrectCC = false;
    this.incorrectCCSize = false;
    this.incorrectCCFormat = false;
    var sum = 0;
    var secondDigit = false;

    if (numeroDocumento.length != 12) {
      this.incorrectCCSize = true;
      return false;
    }

    var ccFormat = /^[\d]{8}?\d([A-Z]{2}\d)?$/g;
    if (!ccFormat.test(numeroDocumento)) {
      this.incorrectCCFormat = true;
      return false;
    }

    for (var i = numeroDocumento.length - 1; i >= 0; --i) {
      var valor = this.GetNumberFromChar(numeroDocumento[i]);
      if (secondDigit) {
        valor *= 2;
        if (valor > 9)
          valor -= 9;
      }
      sum += valor;
      secondDigit = !secondDigit;
    }

    if (sum % 10 != 0) {
      this.incorrectCC = true;
      return false;
    }

    return (sum % 10) == 0;
  }

  GetNumberFromChar(letter: string) {
    switch (letter) {
      case '0': return 0;
      case '1': return 1;
      case '2': return 2;
      case '3': return 3;
      case '4': return 4;
      case '5': return 5;
      case '6': return 6;
      case '7': return 7;
      case '8': return 8;
      case '9': return 9;
      case 'A': return 10;
      case 'B': return 11;
      case 'C': return 12;
      case 'D': return 13;
      case 'E': return 14;
      case 'F': return 15;
      case 'G': return 16;
      case 'H': return 17;
      case 'I': return 18;
      case 'J': return 19;
      case 'K': return 20;
      case 'L': return 21;
      case 'M': return 22;
      case 'N': return 23;
      case 'O': return 24;
      case 'P': return 25;
      case 'Q': return 26;
      case 'R': return 27;
      case 'S': return 28;
      case 'T': return 29;
      case 'U': return 30;
      case 'V': return 31;
      case 'W': return 32;
      case 'X': return 33;
      case 'Y': return 34;
      case 'Z': return 35;
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
    return blob;
  }

  openExitPopup() {
    if(this.edit)
      this.exitModalRef = this.modalService.show(this.exitModal);
    else
      this.route.navigate(['/']);
  }

  closeExitPopup() {
    this.exitModalRef?.hide();
  }

  confirmExit() {
    this.closeExitPopup();
    this.route.navigate(['/']);
  }
}
