import { HttpClient } from '@angular/common/http';
import { Component, Input, Output, EventEmitter, OnInit, Inject, OnChanges, SimpleChanges, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoggerService } from 'src/app/logger.service';
import { config, Observable, Subscription } from 'rxjs';
import { ClientService } from '../../client/client.service';
import { Configuration, configurationToken } from '../../configuration';
import { AuthService } from '../../services/auth.service';
import { IStakeholders, StakeholderOutbound } from '../IStakeholders.interface';
import { StakeholderService } from '../stakeholder.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-search-stakeholders',
  templateUrl: './search-stakeholders.component.html',
  styleUrls: ['./search-stakeholders.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchStakeholdersComponent implements OnInit {

  private eventsSubscription: Subscription;

  displayedColumns: string[] = ['select','stakeFiscalId', 'stakeName'];
  displayedColumnsFound: string[] = ['select', 'stakeID', 'stakeName', 'address', 'ZIPCode', 'locale', 'country'];

  //Variáveis de Input
  @Input() clientID: Observable<string>;
  @Input() searchType?: string;
  @Input() requestID?: string = "por mudar";
  //@Input() canEdit?: boolean = false; Pode vir a ser preciso
  @Input() canSelect?: boolean = true;
  @Input() currentIdx?: number;

  //Output
  @Output() selectedStakeholderEmitter = new EventEmitter<{
    stakeholder: IStakeholders
  }>();

  @Output() searchAditionalInfoEmitter = new EventEmitter<{
    found: boolean,
    errorMsg?: string
  }>();

  //Variáveis locais
  stakeholdersToShow: IStakeholders[] = [];
  UUIDAPI: string = "eefe0ecd-4986-4ceb-9171-99c0b1d14658";
  currentStakeholder: IStakeholders = {};

  foundStakeholders: boolean;

  constructor(private router: ActivatedRoute, private http: HttpClient, private logger: LoggerService,
    @Inject(configurationToken) private configuration: Configuration, 
    private route: Router, private stakeholderService: StakeholderService, private authService: AuthService, private translate: TranslateService) {
  }

  stakesMat = new MatTableDataSource<any>();
  @ViewChild('paginator') set paginator(pager:MatPaginator) {
    if (pager) {
      this.stakesMat.paginator = pager;
      this.stakesMat.paginator._intl = new MatPaginatorIntl();
      this.stakesMat.paginator._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');
    }
  }

  stakesFoundMat = new MatTableDataSource<any>();
  @ViewChild('paginator') set paginatorFound(pager:MatPaginator) {
    if (pager) {
      this.stakesFoundMat.paginator = pager;
      this.stakesFoundMat.paginator._intl = new MatPaginatorIntl();
      this.stakesFoundMat.paginator._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');
    }
  }

  ngOnInit() {
    var context = this;
    this.eventsSubscription = this.clientID.subscribe(result => {
      context.searchStakeholders(result);
    });
  }

  searchStakeholders(clientID) {
    console.log("A pesquisar um stakeholder");
    var context = this;
    var stakeholder = null;
    this.stakeholderService.SearchStakeholderByQuery(clientID, this.searchType, this.UUIDAPI, "2").then(res => {
      var clients = res.result;
      if (clients.length > 0) {
        context.stakeholdersToShow = [];
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
              stakeholder = {
                "stakeholderNumber": stakeInfo.stakeholderId,
                "stakeholderName": stakeInfo.shortName,
                "stakeholderNIF": stakeInfo.fiscalIdentification.fiscalId,
                "address": stakeInfo.address,
                "elegible": "elegivel",
                "associated": "SIM"
              } as IStakeholders;

              context.stakeholdersToShow.push(stakeholder);
              console.log('Lista de stakeholdersToShow depois de adicionar o stake ', context.stakeholdersToShow);
            }
          });
        }, error => {
          console.log('ocorreu um erro');
        }).then(res => {
          context.foundStakeholders = true;
          context.searchAditionalInfoEmitter.emit({
            found: true,
            errorMsg: ''
          });
          context.stakesFoundMat.data = context.stakeholdersToShow;
        });
      } else {
        console.log("sem resultados");
        context.stakeholdersToShow = [];
        context.foundStakeholders = false;
        context.searchAditionalInfoEmitter.emit({
          found: false,
          errorMsg: "Sem resultados"
        });
      }
    }, error => {
      console.log("deu erro");
      context.stakeholdersToShow = [];
      context.foundStakeholders = false;
      context.searchAditionalInfoEmitter.emit({
        found: false,
        errorMsg: "Sem resultados"
      });
    });

    console.log('Efetuou a pesquisa e o valor encontrado foi ', this.stakeholdersToShow);
  }

  aButtons(id: boolean, stake: StakeholderOutbound) {
    this.selectedStakeholderEmitter.emit({
      stakeholder: stake
    });
    if (id == true) {
      // this.showSeguinte = true
      this.currentStakeholder.id = stake.stakeholderId;
    } 
  }

  // selectStakeholder(stakeholder, index) {
  //   this.selectedStakeholderEmitter.emit({
  //     stakeholder: stakeholder,
  //     idx: index
  //   });

  //   this.currentStakeholder = stakeholder;
  //   console.log('Current stakeholder', this.currentStakeholder);
  // }
  
  ngOnChanges(){
    // this.ngOnInit();
  }

}
