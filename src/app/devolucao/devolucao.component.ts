import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DataService } from '../nav-menu-interna/data.service';
import { BusinessIssueViewModel, ProcessList, ProcessService, SearchProcessHistory } from '../process/process.service';
import { LoggerService } from 'src/app/logger.service';
import { ClientService } from '../client/client.service';
import { StakeholderService } from '../stakeholders/stakeholder.service';
import { StoreService } from '../store/store.service';
import { TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { QueuesService } from '../queues-detail/queues.service';
import { Client } from '../client/Client.interface';
import { IStakeholders } from '../stakeholders/IStakeholders.interface';

@Component({
  selector: 'app-devolucao',
  templateUrl: './devolucao.component.html'
})


export class DevolucaoComponent implements OnInit {
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
  public merchantFirstTime: boolean;
  public shopFirstTime: boolean;
  public stakeFirstTime: boolean;
  public docFirstTime: boolean;
  public merchant: Client;
  public stakeholdersList: IStakeholders[] = [];
  public ready: boolean = false;

  constructor(private logger: LoggerService,
    private route: Router, private data: DataService,
    private router: ActivatedRoute, private processService: ProcessService, private clientService: ClientService,
    private stakeholderService: StakeholderService, private storeService: StoreService, public translate: TranslateService, private datePipe: DatePipe, private queuesService: QueuesService) {

  }

  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    this.data.historyStream$.next(true);
    this.processId = decodeURIComponent(this.router.snapshot.paramMap.get('id'));
    var context = this;
    this.getPageInfo();
    if (localStorage.getItem("returned") != 'consult') {
      localStorage.setItem('returned', 'edit');
    }
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

  getPageInfo() {
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
    });
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
    this.logger.info("Redirecting to Client by id page");
    this.data.updateData(true, 0);
    this.route.navigate(['/clientbyid']);
  }
}
