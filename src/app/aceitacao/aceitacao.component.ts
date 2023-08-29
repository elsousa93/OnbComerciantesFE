import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AppComponent } from '../app.component';
import { Client } from '../client/Client.interface';
import { ClientService } from '../client/client.service';
import { LoggerService } from '../logger.service';
import { DataService } from '../nav-menu-interna/data.service';
import { ProcessNumberService } from '../nav-menu-presencial/process-number.service';
import { BusinessIssueViewModel, IssueViewModel, ProcessHistory, ProcessList, ProcessService, SearchProcessHistory } from '../process/process.service';
import { ContractAcceptance, ContractDigitalAcceptance, DigitalIdentification, State } from '../queues-detail/IQueues.interface';
import { QueuesService } from '../queues-detail/queues.service';
import { AuthService } from '../services/auth.service';
import { IStakeholders } from '../stakeholders/IStakeholders.interface';
import { StakeholderService } from '../stakeholders/stakeholder.service';
import { ShopDetailsAcquiring } from '../store/IStore.interface';
import { StoreService } from '../store/store.service';
import { DocumentSearchType } from '../table-info/ITable-info.interface';
import { TableInfoService } from '../table-info/table-info.service';

@Component({
  selector: 'app-aceitacao',
  templateUrl: './aceitacao.component.html',
  styleUrls: ['../stakeholders/stakeholders-list/stakeholders-list.component.css']
})

export class AceitacaoComponent implements OnInit, AfterViewInit {
  form: FormGroup;

  public map = new Map();
  public currentPage: number;
  public subscription: Subscription;
  public processId: string;
  public process: ProcessList;
  public processNumber: string;
  public issues: BusinessIssueViewModel
  public processHistoryItems: SearchProcessHistory;
  public selectedIssue: BusinessIssueViewModel;
  public selectedHistoryGuid: string;
  public merchant: Client;
  public stakeholdersList: IStakeholders[] = [];
  public stakeholdersNameList: IStakeholders[] = [];
  public ready: boolean = false;
  public shopIssueList: ShopDetailsAcquiring[] = [];
  docTypes: DocumentSearchType[] = [];
  observationLength: number;
  observation: string;

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
  filterIssues: IssueViewModel[] = [];

  constructor(private logger: LoggerService,
    private route: Router, private data: DataService,
    private router: ActivatedRoute, private processService: ProcessService, private clientService: ClientService,
    private stakeholderService: StakeholderService, private storeService: StoreService, public translate: TranslateService, private datePipe: DatePipe, private queuesService: QueuesService, public appComponent: AppComponent, private queuesInfo: QueuesService, private tableInfo: TableInfoService, private authService: AuthService, private processNrService: ProcessNumberService) {
    this.appComponent.toggleSideNav(false);
  }

  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    this.subscription = this.processNrService.observation.subscribe(obs => this.observation = obs);
    this.data.historyStream$.next(true);
    this.processId = decodeURIComponent(this.router.snapshot.paramMap.get('id'));
    var context = this;
    this.getPageInfo();
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
      issues.shops.forEach(val => {
        var index = context.shopIssueList.findIndex(shop => shop.id == val?.shop?.id);
        if (index == -1) {
          context.queuesService.getProcessShopDetails(context.processId, val?.shop?.id).then(res => {
            lengthStore++;
            val.shop["name"] = res.result.name;
            context.shopIssueList.push(res.result);
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
          val.shop["name"] = context.shopIssueList[index].name;
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
      
      issues.stakeholders.forEach(val => {
        var index1 = context.stakeholdersList.findIndex(stake => stake.id == val?.stakeholder?.id);
        if (index1 == -1) {
          context.queuesService.getProcessStakeholderDetails(context.processId, val?.stakeholder?.id).then(res => {
            lengthStake++;
            val.stakeholder["name"] = res.result.shortName;
            context.stakeholdersList.push(res.result);
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
          val.stakeholder["name"] = context.stakeholdersList[index1].shortName;
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
            context.shopIssueList.forEach(shop => {
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

  getPageInfo() {
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

    this.processService.getProcessEntities(this.processId).then(result => {
      result.result.forEach(value => {
        if (value.entityType === 'CorporateEntity') {
          context.processService.getProcessCorporateEntity(context.processId, value.id).then(res => {
            context.stakeholdersList.push(res.result);
          });
        }
        if (value.entityType === 'PrivateEntity') {
          context.processService.getProcessPrivateEntity(context.processId, value.id).then(res => {
            context.stakeholdersList.push(res.result);
          });
        }
      });
    });
  }

  getHistoryIssueDetails(historyGuid: string) {
    this.selectedHistoryGuid = historyGuid;
    this.processService.getProcessIssuesById(this.processId, historyGuid).subscribe(res => {
      this.logger.info("Get process issues result: " + JSON.stringify(res));
      this.selectedIssue = res;
      this.getNames(this.selectedIssue, true);
    });
  }

  submit(state: string) {
    var externalState;
    var stateType;
    if (this.process.state == "ContractAcceptance") {
      externalState = {} as ContractAcceptance;
      stateType = State.CONTRACT_ACCEPTANCE;
      externalState.$type = stateType;
      externalState.contractAcceptanceResult = state;
    } else if (this.process.state == "ContractDigitalAcceptance") {
      externalState = {} as ContractDigitalAcceptance;
      stateType = State.CONTRACT_DIGITAL_ACCEPTANCE;
      externalState.$type = stateType;
      if (state == "Cancel")
        state = "CancelDigitalSignature";
      externalState.contractDigitalAcceptanceResult = state;
    } else if (this.process.state == "DigitalIdentification"){
      externalState = {} as DigitalIdentification;
      stateType = State.DIGITAL_IDENTIFICATION;
      externalState.$type = stateType;
      if (state == "Cancel")
        state = "CancelDigitalIdentification";
      externalState.digitalIdentificationResult = state;
    }
    externalState.submissionUser = this.authService.GetCurrentUser().userName;
    externalState.userObservations = this.observation;
    this.queuesInfo.postExternalState(this.processId, stateType, externalState).then(res => {
      this.route.navigate(['/']);
    });
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

  ngAfterViewInit(): void {
    this.historyMat.sort = this.historySort;
    this.returnMat.sort = this.returnSort;
    this.returnSelectedMat.sort = this.returnSelectedSort;
  }

  nextPage() {
    let navigationExtras = {
      state: {
       state : this.process.state 
      }
    } as NavigationExtras;
    this.route.navigate(['/app-pack-contratual/', this.processId], navigationExtras);
  }

  goToHistoryTab() {
    if (this.selectedHistoryGuid == '' || this.selectedHistoryGuid == null) {
      this.getHistoryIssueDetails(this.processHistoryItems.items[this.processHistoryItems.items.length - 1].historyGuid);
    }
  }
}
