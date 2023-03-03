import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AppComponent } from '../app.component';
import { Client } from '../client/Client.interface';
import { ClientService } from '../client/client.service';
import { LoggerService } from '../logger.service';
import { DataService } from '../nav-menu-interna/data.service';
import { BusinessIssueViewModel, ProcessList, ProcessService, SearchProcessHistory } from '../process/process.service';
import { ContractAcceptance, State } from '../queues-detail/IQueues.interface';
import { QueuesService } from '../queues-detail/queues.service';
import { IStakeholders } from '../stakeholders/IStakeholders.interface';
import { StakeholderService } from '../stakeholders/stakeholder.service';
import { StoreService } from '../store/store.service';

@Component({
  selector: 'app-aceitacao',
  templateUrl: './aceitacao.component.html',
  styleUrls: ['../stakeholders/stakeholders-list/stakeholders-list.component.css']
})

export class AceitacaoComponent implements OnInit {
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
  public ready: boolean = false;

  constructor(private logger: LoggerService,
    private route: Router, private data: DataService,
    private router: ActivatedRoute, private processService: ProcessService, private clientService: ClientService,
    private stakeholderService: StakeholderService, private storeService: StoreService, public translate: TranslateService, private datePipe: DatePipe, private queuesService: QueuesService, public appComponent: AppComponent, private queuesInfo: QueuesService) {
    this.appComponent.toggleSideNav(false);
  }

  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    this.data.historyStream$.next(true);
    this.processId = decodeURIComponent(this.router.snapshot.paramMap.get('id'));
    var context = this;
    this.getPageInfo();
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
        } else if (process.processState === 'ContractDigitalAcceptance') {
          process.processState = this.translate.instant('searches.contractDigitalAcceptance')
        } else if (process.processState === 'DigitalIdentification') {
          process.processState = this.translate.instant('searches.digitalIdentification')
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

  submit(state: string) {
    var externalState;
    var stateType;

    externalState = {} as ContractAcceptance;
    stateType = State.CONTRACT_ACCEPTANCE;
    externalState.$type = stateType;
    externalState.contractAcceptanceResult = state;

    externalState.userObservations = "";
    this.queuesInfo.postExternalState(this.processId, stateType, externalState).then(res => {
      console.log("Resultado: ", res);
      if (state == 'Cancel') {
        let navigationExtras = {
          state: {
            returnedFrontOffice: true
          }
        } as NavigationExtras;
        this.queuesInfo.markToCancel(this.processId).then(res => {
          this.route.navigate(['/info-declarativa'], navigationExtras);
        });
      }
    });
  }

}
