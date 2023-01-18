import { Component, OnInit } from '@angular/core';
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

  constructor(private logger: LoggerService,
    private route: Router, private data: DataService,
    private router: ActivatedRoute, private processService: ProcessService, private clientService: ClientService,
    private stakeholderService: StakeholderService, private storeService: StoreService, private translate: TranslateService, private datePipe: DatePipe) {

    this.logger.debug('Process Id ' + this.processId);
  }

  getEntityName(entity: string, id: string) {
    if (id != null) {
      if (entity == 'merchant') {
        this.clientService.GetClientByIdOutbound(id).then(res => {
          return res.legalName;
        });
      }
      if (entity == 'stake') {
        this.stakeholderService.getStakeholderByID(id, "por mudar", "por mudar").then(res => {
          return res.shortName;
        });
      }
      if (entity == 'shop') {
        this.storeService.getProcessShopDetails(this.processId, id).subscribe(res => {
          return res.name;
        });
      }
      if (entity == 'document') {
        return id;
      }
    }
  }

  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    this.data.historyStream$.next(true);
    this.processId = decodeURIComponent(this.router.snapshot.paramMap.get('id'));
    var context = this;
    this.getPageInfo();
    this.logger.debug('Valor do returned ' + localStorage.getItem("returned"));
    if (localStorage.getItem("returned") != 'consult') {
      localStorage.setItem('returned', 'edit');
      this.logger.debug('Valor do returned' + localStorage.getItem("returned"));
    }
  }

  getPageInfo() {
    this.processService.getProcessById(this.processId).subscribe(result => {
      this.process = result;
      this.processNumber = result.processNumber;
      localStorage.setItem('processNumber', this.processNumber);
      this.data.updateData(true, 0);
      this.processService.getProcessIssuesById(this.processId).subscribe(res => {
        if (res.process.length != 0) { // no caso em que as issues vêm a null está a entrar num erro infinito
          this.issues = res;
        }
      });
    });

    this.processService.getProcessHistory(this.processId).then(result => {
      this.processHistoryItems = result.result;
      this.processHistoryItems.items.sort((b, a) => new Date(b.whenStarted).getTime() - new Date(a.whenStarted).getTime());
      this.processHistoryItems.items.forEach(process => {
        process.whenStarted = this.datePipe.transform(process.whenStarted, 'dd-MM-yyyy').toString();
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
      });
    });
  }

  getHistoryIssueDetails(historyGuid: string) {
    this.selectedHistoryGuid = historyGuid;
    this.processService.getProcessIssuesById(this.processId, historyGuid).subscribe(res => {
      if (res.process.length != 0) {
        this.selectedIssue = res;
      }
    });
  }

  nextPage() {
    this.data.updateData(true, 0);
    this.route.navigate(['/clientbyid']);
  }
}
