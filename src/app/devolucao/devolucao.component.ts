import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Configuration, configurationToken } from '../configuration';
import { DataService } from '../nav-menu-interna/data.service';
import { BusinessIssueViewModel, ProcessGet, ProcessList, ProcessService } from '../process/process.service';
import { LoggerService } from 'src/app/logger.service';
import { ClientService } from '../client/client.service';
import { StakeholderService } from '../stakeholders/stakeholder.service';
import { StoreService } from '../store/store.service';


@Component({
  selector: 'app-devolucao',
  templateUrl: './devolucao.component.html'
})

export class DevolucaoComponent implements OnInit{
  form: FormGroup;

  public map = new Map();
  public currentPage: number;
  public subscription: Subscription;

  public processId: string;
  public processNumber: string;
  public process: ProcessList;

  public issues: BusinessIssueViewModel

  constructor(private logger : LoggerService, private http: HttpClient, @Inject(configurationToken) private configuration: Configuration,
    private route: Router, private data: DataService,
    private router: ActivatedRoute, private processService: ProcessService, private clientService: ClientService,
    private stakeholderService: StakeholderService, private storeService: StoreService) {

    this.logger.debug('Process Id ' + this.processId);

    this.data.updateData(true, 0);
    this.ngOnInit();

    this.processService.getProcessById(this.processId).subscribe(result => {
      this.process = result;
    });

    this.processService.getProcessIssuesById(this.processId).subscribe(result => {
      console.log('ISSUES ', result);
      this.issues = result;
    });

  }

  getEntityName(entity: string, id: string) {
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

  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    this.data.historyStream$.next(true);
    this.processId = decodeURIComponent(this.router.snapshot.paramMap.get('id'));
    console.log('Process id ', this.processId);
    var context = this;
  }


  nextPage() {
    this.logger.debug('Valor do returned ' + localStorage.getItem("returned"));
    if (localStorage.getItem("returned") != 'consult') {
      localStorage.setItem('returned', 'edit');
      this.logger.debug('Valor do returned' + localStorage.getItem("returned"));
    }
    localStorage.setItem('processNumber', this.process.processNumber);
    this.logger.debug('Valor do processNumber ' + localStorage.getItem("processNumber"));

    this.route.navigate(['/clientbyid']);
  }

}
