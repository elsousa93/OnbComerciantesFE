import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DataService } from '../nav-menu-interna/data.service';
import { BusinessIssueViewModel, ProcessList, ProcessService, SearchProcessHistory } from '../process/process.service';
import { LoggerService } from 'src/app/logger.service';
import { QueuesService } from './queues.service';
import { IStakeholders } from '../stakeholders/IStakeholders.interface';
import { ShopActivities, ShopDetailsAcquiring, ShopEquipment, ShopSubActivities } from '../store/IStore.interface';
import { ClientChoice, ComplianceEvaluation, EligibilityAssessment, MerchantRegistration, NegotiationApproval, OperationsEvaluation, RiskAssessment, StandardIndustryClassificationChoice, State, StateResultDiscriminatorEnum } from './IQueues.interface';
import { PostDocument } from '../submission/document/ISubmission-document';
import { ComprovativosService } from '../comprovativos/services/comprovativos.services';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { Client } from '../client/Client.interface';
import { ClientService } from '../client/client.service';
import { MatSort } from '@angular/material/sort';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { UserTypes } from '../table-info/ITable-info.interface';
import { TableInfoService } from '../table-info/table-info.service';

@Component({
  selector: 'queues-detail',
  templateUrl: './queues-detail.component.html'
})

export class QueuesDetailComponent implements OnInit {
  form: FormGroup;

  @Input() queueName: string;
  @Input() processId: string;

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
  public issues: BusinessIssueViewModel
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
  @ViewChild('paginator') set paginator(pager: MatPaginator) {
    if (pager) {
      this.clientsMat.paginator = pager;
      this.clientsMat.paginator._intl = new MatPaginatorIntl();
      this.clientsMat.paginator._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');
    }
  }
  constructor(private logger: LoggerService, private translate: TranslateService, private snackBar: MatSnackBar, private http: HttpClient,
    private route: Router, private data: DataService, private queuesInfo: QueuesService, private documentService: ComprovativosService,
    private datePipe: DatePipe, private queuesService: QueuesService, private processService: ProcessService, private clientService: ClientService, private tableInfo: TableInfoService) {

    //Gets Queue Name and processId from the Dashboard component 
    if (this.route.getCurrentNavigation().extras.state) {
      this.queueName = this.route.getCurrentNavigation().extras.state["queueName"];
      this.processId = this.route.getCurrentNavigation().extras.state["processId"];
    }

    // Preencher os dados da fila de trabalho consoante o processId recebido
    this.fetchStartingInfo();
    this.data.updateData(true, 0);

    this.subs.push(this.tableInfo.GetAllSearchTypes(UserTypes.MERCHANT).subscribe(result => {
      this.ListaDocType = result;
      this.ListaDocType = this.ListaDocType.sort((a, b) => a.description > b.description ? 1 : -1); //ordenar resposta
    }), (this.tableInfo.GetAllSearchTypes(UserTypes.STAKEHOLDER).subscribe(result => {
      this.ListaDocTypeENI = result;
      this.ListaDocTypeENI = this.ListaDocTypeENI.sort((a, b) => a.description > b.description ? 1 : -1); //ordenar resposta
    })));
  }

  initializeElegibilityForm() {
    this.form = new FormGroup({
      observation: new FormControl(''),
      stakeholdersEligibility: new FormGroup({}, Validators.required),
      merchantEligibility: new FormControl('', Validators.required)
    });
  }

  initializeMCCForm() {
    this.form = new FormGroup({
      shopsMCC: new FormGroup({})
    });
  }

  initializeComplianceForm() {
    this.form = new FormGroup({
      observation: new FormControl('', Validators.required)
    });
  }

  initializeMultipleClientsForm() {
    this.form = new FormGroup({
      documentType: new FormControl(''),
      documentNumber: new FormControl(''),
      observation: new FormControl('')
    });
  }

  initializeValidationSIBSForm() {
    this.form = new FormGroup({
      observation: new FormControl(''),
      enrollmentMerchantNumber: new FormControl('', Validators.required),
      shops: new FormGroup({}),
      equipments: new FormGroup({})
    });
  }

  updateStakeForm() {
    var formGroupStakeholdersEligibility = new FormGroup({});
    this.stakesList.forEach(function (value, idx) {
      formGroupStakeholdersEligibility.addControl(value.id, new FormControl('', Validators.required));
    });
    this.form.setControl("stakeholdersEligibility", formGroupStakeholdersEligibility);
  }

  updateShopForm() {
    var formGroupShop = new FormGroup({});
    this.shopsList.forEach(function (value, idx) {
      value.pack.paymentSchemes.attributes.forEach(attr => {
        formGroupShop.addControl(value.id + attr.id, new FormControl('', Validators.required));
      });
    });
    this.form.setControl("shopsMCC", formGroupShop);
  }

  updateShopValidationForm() {
    var context = this;
    var formGroupShop = new FormGroup({});
    this.shopsList.forEach(function (value, idx) {
      formGroupShop.addControl(value.id, new FormControl('', Validators.required));
      var formGroupEquip = new FormGroup({});
      context.equipmentList.forEach(equip => {
        if (equip["shopId"] === value.id) {
          formGroupEquip.addControl(equip.id, new FormControl('', Validators.required));
        }
      });
      context.form.setControl("equipments", formGroupEquip);
    });
    this.form.setControl("shops", formGroupShop);
    console.log('FORM STORE ', this.form);
  }

  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
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

        if (this.queueName === 'risk') {
          this.queuesInfo.getAssessmentRisk(stakeholder.fiscalId, "", null).then(res => {

          });
        }

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
        equipment["shopId"] = shopId;
        this.equipmentList.push(equipment);
        resolve;
      });
    });
  }

  getShopInfo(processId, shopId) {
    var context = this;

    return new Promise((resolve, reject) => {
      this.queuesInfo.getProcessShopDetails(processId, shopId).then(result => {
        this.logger.info("Get shop from process result: " + JSON.stringify(result));
        var shop = result.result;
        this.shopsList.push(shop);
        //if (this.queueName === 'MCCTreatment') {
        //  this.updateShopForm();
        //}
        //if (this.queueName === 'validationSIBS') {
        //  this.updateShopValidationForm();
        //}
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
            resolve;
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

  async getNames(issues: BusinessIssueViewModel) {
    await this.queuesService.getProcessMerchant(this.processId).then(res => {
      issues.merchant.merchant["name"] = res.result.legalName;
      this.merchant = res.result;
    });
    issues.shops.forEach(val => {
      this.queuesService.getProcessShopDetails(this.processId, val?.shop?.id).then(res => {
        val.shop["name"] = res.result.name;
      });
    });
    issues.stakeholders.forEach(val => {
      this.queuesService.getProcessStakeholderDetails(this.processId, val?.stakeholder?.id).then(res => {
        val.stakeholder["name"] = res.result.shortName;
        this.stakeholdersList.push(res.result);
      });
    });
  }


  fetchStartingInfo() {
    this.processService.getProcessById(this.processId).subscribe(result => {
      this.logger.info("Get process by id result: " + JSON.stringify(result));
      this.process = result;
      this.processNumber = result.processNumber;
      localStorage.setItem('processNumber', this.processNumber);
      this.data.updateData(true, 0);
      this.processService.getProcessIssuesById(this.processId).subscribe(res => {
        this.logger.info("Get process issues result: " + JSON.stringify(result));
        this.issues = res;
        this.getNames(this.issues);
      });
    });

    this.processService.getProcessHistory(this.processId).then(result => {
      this.logger.info("Get process history result: " + JSON.stringify(result));
      this.processHistoryItems = result.result;
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
        }
        this.ready = true;
      });
    });

    this.queuesInfo.getProcessMerchant(this.processId).then(res => {
      this.merchant =  res.result;
    })
    if (this.queueName === 'eligibility' || this.queueName === 'risk' || this.queueName === 'compliance' || this.queueName === 'multipleClients') {
      this.queuesInfo.GetProcessStakeholders(this.processId).then(success => {
        this.logger.info("Get stakeholders list from process result: " + JSON.stringify(success));
        var stakeholdersList = success;
        this.stakesList = stakeholdersList;
        if (this.queueName !== 'compliance')
          this.updateStakeForm();
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
      this.getNames(this.selectedIssue);
    });
  }

  nextPage() {
    localStorage.setItem('returned', 'consult');
    this.logger.info("Redirecting to Client By Id page");
    this.route.navigate(['/clientbyid']);
  }

  selectFile(event: any) {
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
      const sizeFile = file.size / (1024 * 1024);
      var extensoesPermitidas = /(.pdf)$/i;
      const limSize = 10;
      this.result = this.http.put(this.baseUrl + 'ServicesComprovativos/', 1);
      if (this.result != null) {
        if ((sizeFile <= limSize) && (extensoesPermitidas.exec(file.name))) {
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
    }
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
    return this.activities.find(a => a.activityCode == activityCode).activityDescription;
  }

  getSubActivityDescription(subActivityCode) {
    return this.subActivities.find(s => s.subActivityCode == subActivityCode).subActivityDescription;
  }

  searchClient() {
    var context = this;
    if (this.canSearch) {
      this.canSearch = false;
      var documentNumber = this.form.get("documentNumber").value;
      var documentType = this.form.get("documentType").value;
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
                "documentType": documentType,
                "documentNumber": documentNumber
              }
              context.clientsToShow.push(client);
              context.logger.info("Clients found from search: " + JSON.stringify(context.clientsToShow));
              context.clientsMat.data = context.clientsToShow;
            }).then(res => {
              context.notFound = false;
              context.canSearch = true;
            });
          });
        } else {
          this.showFoundClient = false;
          this.notFound = true;
          this.canSearch = true;
        }
      }, error => {
        context.showFoundClient = false;
        this.notFound = true;
        this.canSearch = true;
      });
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
      queueModel.stakeholderAssessment = [];

      for (const cont in stakeholders.controls) {
        const control = this.form.get("stakeholdersEligibility").get(cont);
        queueModel.stakeholderAssessment.push({
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
      queueModel.stakeholderAssessment = [];

      for (const cont in stakeholders.controls) {
        const control = this.form.get("stakeholdersEligibility").get(cont);
        queueModel.stakeholderAssessment.push({
          stakeholderId: cont,
          accepted: control.value
        });
      }
      queueModel.merchantAssessment = {
        accepted: true,
        merchantId: this.merchant.id
      };

      if (queueModel.merchantAssessment.accepted == false) {
        context.queuesInfo.markToCancel(context.processId).then(res => {
          context.route.navigate(['/']);
        });
      } else {
        queueModel.stakeholderAssessment.forEach(stake => {
          if (stake.accepted == false) {
            context.queuesInfo.markToCancel(context.processId).then(res => {
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
    } else if (this.queueName === 'MCC') {
      this.state = State.STANDARD_INDUSTRY_CLASSIFICATION_CHOICE;
      queueModel = {} as StandardIndustryClassificationChoice;

      var stakeholders = this.form.get("shopsMCC") as FormGroup;
      queueModel.shopClassifications = {
        shopId: null,
        schemaClassification: []
      }

      for (const cont in stakeholders.controls) {
        const control = this.form.get("shopsMCC").get(cont);

        queueModel.shopClassifications.schemaClassification.push({
          paymentSchemaId: null,
          classification: control.value
        });
      }
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
      queueModel.merchantChoice = {
        id: this.merchant.id,
        clientNumber: ""
      };

      queueModel.stakeholdersChoice = [];
      queueModel.stakeholdersChoice.push({
        id: "",
        clientNumber: ""
      })
    } else if (this.queueName === 'validationSIBS') {
      this.state = State.MERCHANT_REGISTRATION;
      queueModel = {} as MerchantRegistration;

      var observation = this.form.get('observation').value;
      queueModel.$type = StateResultDiscriminatorEnum.MERCHANT_REGISTRATION;
      queueModel.userObservations = observation;

      queueModel.decision = type;

      queueModel.merchantRegistrationId = this.form.get("enrollmentMerchantNumber").value;
      this.shopsList.forEach(shop => {
        var equips = [];

        this.equipmentList.forEach(equip => {
          if (shop.id === equip["shopId"]) {
            equips.push({
              equipmentId: equip.id,
              equipmentRegistrationId: context.form.get("equipments").get(equip.id).value
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
    }

    if (this.files.length > 0) {
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
          context.queuesInfo.postProcessDocuments(document, context.processId, context.state).then(res => { });
        });
      })
    }

    this.queuesInfo.postExternalState(this.processId, this.state, queueModel).then(result => {
      this.logger.info("Queue post external state result: " + JSON.stringify(queueModel));
    })
  }
}
