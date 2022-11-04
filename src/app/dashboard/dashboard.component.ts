import { Component, OnInit, ChangeDetectorRef, HostBinding, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CookieService } from 'ngx-cookie-service'
import { MediaMatcher } from '@angular/cdk/layout';
import { HttpClient } from '@angular/common/http';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { onSideNavChange, AutoHideSidenavAdjust } from '../animation';
import { UserPermissions, FTPermissions, getFTPermissions } from '../userPermissions/user-permissions';
import { DataService } from '../nav-menu-interna/data.service';
import { ProcessGet, ProcessList, ProcessService, UpdateProcess } from '../process/process.service';
import { DatePipe } from '@angular/common';
import { LoggerService } from 'src/app/logger.service';
import { User } from '../userPermissions/user';
import { TranslateService } from '@ngx-translate/core';
import { State } from '../queues-detail/IQueues.interface';
import { AppComponent } from '../app.component';
import { ProcessNumberService } from '../nav-menu-presencial/process-number.service';
import { each } from 'jquery';
import { TokenService } from '../token.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  animations: [onSideNavChange, AutoHideSidenavAdjust]
})
export class DashboardComponent implements OnInit {

  dataSourcePendentes: MatTableDataSource<ProcessList> = new MatTableDataSource();
  dataSourceTratamento: MatTableDataSource<ProcessList> = new MatTableDataSource();
  dataSourceDevolvidos: MatTableDataSource<ProcessList> = new MatTableDataSource();
  dataSourceAceitacao: MatTableDataSource<ProcessList> = new MatTableDataSource();
  dataSourcePendingSent: MatTableDataSource<ProcessList> = new MatTableDataSource();
  dataSourcePendingEligibility: MatTableDataSource<ProcessList> = new MatTableDataSource();
  dataSourceMultipleClients: MatTableDataSource<ProcessList> = new MatTableDataSource();
  dataSourceDOValidation: MatTableDataSource<ProcessList> = new MatTableDataSource();
  dataSourceNegotiationAproval: MatTableDataSource<ProcessList> = new MatTableDataSource();
  dataSourceMCCTreatment: MatTableDataSource<ProcessList> = new MatTableDataSource();
  dataSourceValidationSIBS: MatTableDataSource<ProcessList> = new MatTableDataSource();
  dataSourceRiskOpinion: MatTableDataSource<ProcessList> = new MatTableDataSource();
  dataSourceComplianceDoubts: MatTableDataSource<ProcessList> = new MatTableDataSource();

  @ViewChild('empTbSort') empTbSort = new MatSort();
  @ViewChild('empTbSortWithObject') empTbSortWithObject = new MatSort();
  @ViewChild('empTbSortDevolvidos') empTbSortDevolvidos = new MatSort();
  @ViewChild('empTbSortAceitacao') empTbSortAceitacao = new MatSort();
  @ViewChild('empTbSortPendingSent') empTbSortPendingSent = new MatSort();
  @ViewChild('empTbSortPendingEligibility') empTbSortPendingEligibility = new MatSort();
  @ViewChild('empTbSortMultipleClients') empTbSortMultipleClients = new MatSort();
  @ViewChild('empTbSortDOValidation') empTbSortDOValidation = new MatSort();
  @ViewChild('empTbSortNegotiationAproval') empTbSortNegotiationAproval = new MatSort();
  @ViewChild('empTbSortMCCTreatment') empTbSortMCCTreatment = new MatSort();
  @ViewChild('empTbSortValidationSIBS') empTbSortValidationSIBS = new MatSort();
  @ViewChild('empTbSortRiskOpinion') empTbSortRiskOpinion = new MatSort();
  @ViewChild('empTbSortComplianceDoubts') empTbSortComplianceDoubts = new MatSort();
  @ViewChild('paginatorPage') set paginatorPage(pager:MatPaginator) {
    if (pager) {
      this.dataSourcePendentes.paginator = pager;
    }
  }
  @ViewChild('paginatorPageSize') set paginatorPageSize(pager:MatPaginator) {
    if (pager) {
      this.dataSourceTratamento.paginator = pager;
    }
  }
  @ViewChild('paginatorPageDevolvidos') set paginatorPageDevolvidos(pager:MatPaginator) {
    if (pager) {
      this.dataSourceDevolvidos.paginator = pager;
    }
  }
  @ViewChild('paginatorPageAceitacao') set paginatorPageAceitacao(pager:MatPaginator) {
    if (pager) {
      this.dataSourceAceitacao.paginator = pager;
    }
  }
  @ViewChild('paginatorPagePendingSent') set paginatorPagePendingSent(pager:MatPaginator) {
    if (pager) {
      this.dataSourcePendingSent.paginator = pager;
    }
  }
  @ViewChild('paginatorPagePendingEligibility') set paginatorPagePendingEligibility(pager:MatPaginator) {
    if (pager) {
      this.dataSourcePendingEligibility.paginator = pager;
    }
  }
  @ViewChild('paginatorPageMultipleClients') set paginatorPageMultipleClients(pager:MatPaginator) {
    if (pager) {
      this.dataSourceMultipleClients.paginator = pager;
    }
  }
  @ViewChild('paginatorPageDOValidation') set paginatorPageDOValidation(pager:MatPaginator) {
    if (pager) {
      this.dataSourceDOValidation.paginator = pager;
    }
  }
  @ViewChild('paginatorPageNegotiationAproval') set paginatorPageNegotiationAproval(pager:MatPaginator) {
    if (pager) {
      this.dataSourceNegotiationAproval.paginator = pager;
    }
  }
  @ViewChild('paginatorPageMCCTreatment') set paginatorPageMCCTreatment(pager:MatPaginator) {
    if (pager) {
      this.dataSourceMCCTreatment.paginator = pager;
    }
  }
  @ViewChild('paginatorPageValidationSIBS') set paginatorPageValidationSIBS(pager:MatPaginator) {
    if (pager) {
      this.dataSourceValidationSIBS.paginator = pager;
    }
  }
  @ViewChild('paginatorPageRiskOpinion') set paginatorPageRiskOpinion(pager:MatPaginator) {
    if (pager) {
      this.dataSourceRiskOpinion.paginator = pager;
    }
  }
  @ViewChild('paginatorPageComplianceDoubts') set paginatorPageComplianceDoubts(pager:MatPaginator) {
    if (pager) {
      this.dataSourceComplianceDoubts.paginator = pager;
    }
  }

  //---------------------------

  state = State;

  displayedColumns = ['processNumber', 'nipc', 'clientName', 'requestDate','state', 'buttons'];
  displayedColumnsQueues = ['processNumber', 'nipc', 'clientName', 'requestDate','state', 'assigned', 'buttons'];

  // @ViewChild(MatSort) sort: MatSort;
  // @ViewChild(MatPaginator) paginator: MatPaginator;

  pageSizes = [10, 25, 100];

  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  @HostBinding('style.--toptestexpto') public toptestexpto: string = '5px';

  FTPermissions: FTPermissions;
  currentUser: User = {};

  incompleteProcessess: ProcessGet;
  ongoingProcessess: ProcessGet;
  returnedProcessess: ProcessGet;
  contractAcceptanceProcessess: ProcessGet;
  pendingSentProcessess: ProcessGet;
  acceptanceProcessess: ProcessGet;
  pendingEligibilityProcessess: ProcessGet;
  multipleClientesProcessess: ProcessGet;
  DOValidationProcessess: ProcessGet;
  negotiationAprovalProcessess: ProcessGet;
  MCCTreatmentProcessess: ProcessGet;
  validationSIBSProcessess: ProcessGet;
  riskOpinionProcessess: ProcessGet;
  complianceDoubtsProcessess: ProcessGet;

  incompleteCount: number;
  ongoingCount: number;
  returnedCount: number;
  contractAcceptanceCount: number;
  pendingSentCount: number;
  pendingEligibilityCount: number;
  multipleClientesCount: number;
  DOValidationCount: number;
  negotiationAprovalCount: number;
  MCCTreatmentCount: number;
  validationSIBSCount: number;
  riskOpinionCount: number;
  complianceDoubtsCount: number;

  date: string;

  nipc: string;
  name: string;
  

  constructor(private logger: LoggerService, private http: HttpClient, private cookie: CookieService, private router: Router,
    changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, private dataService: DataService, private processService: ProcessService,
    private datePipe: DatePipe, private authService: AuthService, private translate: TranslateService, public appComponent: AppComponent, private processNrService: ProcessNumberService, private tokenService: TokenService) {
    this.mobileQuery = media.matchMedia('(max-width: 850px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    localStorage.clear();
    this.date = this.datePipe.transform(new Date(), 'dd-MM-yyyy');

    this.appComponent.toggleSideNav(true);

    //Pendentes de envio
    this.processService.searchProcessByState('Incomplete', 0, 1).subscribe(result => {
      this.logger.debug('Pendentes de envio ' + result.items);
      this.processService.searchProcessByState('Incomplete', 0, result.pagination.total).subscribe(resul => {
        this.incompleteProcessess = resul;
        this.incompleteProcessess.items.forEach(process => {

          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'Incomplete'){
            process.state = this.translate.instant('searches.incompleted');
          } else if (process.state === 'Ongoing'){
            process.state = this.translate.instant('searches.running');
          } else if (process.state === 'Completed') {
            process.state = this.translate.instant('searches.completed');
          } else if (process.state === 'Returned') {
            process.state = this.translate.instant('searches.returned');
          } else if (process.state === 'Cancelled') {
            process.state = this.translate.instant('searches.cancelled');
          } else if (process.state === 'ContractAcceptance'){
            process.state = this.translate.instant('searches.contractAcceptance')
          }
          
        });
        this.dataSourcePendentes.paginator._intl = new MatPaginatorIntl();
        this.dataSourcePendentes.paginator._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');
        
        this.dataSourcePendentes.data = this.incompleteProcessess.items;
        this.dataSourcePendentes.sort = this.empTbSort;
        this.incompleteCount = result.pagination.total;
      });
    });

    //Tratamento BackOffice
    this.processService.searchProcessByState('Ongoing', 0, 1).subscribe(result => {
      this.logger.debug('Tratamento BackOffice ' + result);
      this.processService.searchProcessByState('Ongoing', 0, result.pagination.total).subscribe(resul => {
        this.ongoingProcessess = resul;
        this.ongoingProcessess.items.forEach(process => {

          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'Incomplete'){
            process.state = this.translate.instant('searches.incompleted');
          } else if (process.state === 'Ongoing'){
            process.state = this.translate.instant('searches.running');
          } else if (process.state === 'Completed') {
            process.state = this.translate.instant('searches.completed');
          } else if (process.state === 'Returned') {
            process.state = this.translate.instant('searches.returned');
          } else if (process.state === 'Cancelled') {
            process.state = this.translate.instant('searches.cancelled');
          } else if (process.state === 'ContractAcceptance'){
            process.state = this.translate.instant('searches.contractAcceptance')
          }
        });
        this.dataSourceTratamento.paginator._intl = new MatPaginatorIntl();
        this.dataSourceTratamento.paginator._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');

        this.dataSourceTratamento.data = this.ongoingProcessess.items;
        this.dataSourceTratamento.sort = this.empTbSortWithObject;
        this.ongoingCount = result.pagination.total;
      });
    });


    //Devolvido BackOffice
    this.processService.searchProcessByState('Returned', 0, 1).subscribe(result => {
      this.logger.debug('Devolvidos BackOffice ' + result);
      this.processService.searchProcessByState('Returned', 0, result.pagination.total).subscribe(resul => {
        this.returnedProcessess = resul;
        this.returnedProcessess.items.forEach(process => {

          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'Incomplete'){
            process.state = this.translate.instant('searches.incompleted');
          } else if (process.state === 'Ongoing'){
            process.state = this.translate.instant('searches.running');
          } else if (process.state === 'Completed') {
            process.state = this.translate.instant('searches.completed');
          } else if (process.state === 'Returned') {
            process.state = this.translate.instant('searches.returned');
          } else if (process.state === 'Cancelled') {
            process.state = this.translate.instant('searches.cancelled');
          } else if (process.state === 'ContractAcceptance'){
            process.state = this.translate.instant('searches.contractAcceptance')
          }
          
        });
        this.dataSourceDevolvidos.paginator._intl = new MatPaginatorIntl();
        this.dataSourceDevolvidos.paginator._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');

        this.dataSourceDevolvidos.data = this.returnedProcessess.items;
        this.dataSourceDevolvidos.sort = this.empTbSortDevolvidos;
        this.returnedCount = result.pagination.total;
      });
    });

    //Pendentes de Aceitação
    this.processService.searchProcessByState('contractAcceptance', 0, 1).subscribe(result => {
      this.logger.debug('Pendentes de Aceitação' + result);
      this.processService.searchProcessByState('contractAcceptance', 0, result.pagination.total).subscribe(resul => {
        this.contractAcceptanceProcessess = resul;
        this.contractAcceptanceProcessess.items.forEach(process => {

          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'Incomplete'){
            process.state = this.translate.instant('searches.incompleted');
          } else if (process.state === 'Ongoing'){
            process.state = this.translate.instant('searches.running');
          } else if (process.state === 'Completed') {
            process.state = this.translate.instant('searches.completed');
          } else if (process.state === 'Returned') {
            process.state = this.translate.instant('searches.returned');
          } else if (process.state === 'Cancelled') {
            process.state = this.translate.instant('searches.cancelled');
          } else if (process.state === 'ContractAcceptance'){
            process.state = this.translate.instant('searches.contractAcceptance')
          }
          
        });
        this.dataSourceAceitacao.paginator._intl = new MatPaginatorIntl();
        this.dataSourceAceitacao.paginator._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');

        this.dataSourceAceitacao.data = this.contractAcceptanceProcessess.items;
        this.dataSourceAceitacao.sort = this.empTbSortAceitacao;
        this.contractAcceptanceCount = result.pagination.total;
      });
    });

    //Arquivo Fisico
    this.processService.searchProcessByState('Completed', 0, 1).subscribe(result => {
      this.logger.debug('Completos ' + result);
      this.processService.searchProcessByState('Completed', 0, result.pagination.total).subscribe(resul => {
        this.pendingSentProcessess = resul;
        this.pendingSentProcessess.items.forEach(process => {

          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'Incomplete'){
            process.state = this.translate.instant('searches.incompleted');
          } else if (process.state === 'Ongoing'){
            process.state = this.translate.instant('searches.running');
          } else if (process.state === 'Completed') {
            process.state = this.translate.instant('searches.completed');
          } else if (process.state === 'Returned') {
            process.state = this.translate.instant('searches.returned');
          } else if (process.state === 'Cancelled') {
            process.state = this.translate.instant('searches.cancelled');
          } else if (process.state === 'ContractAcceptance'){
            process.state = this.translate.instant('searches.contractAcceptance')
          }
          
        });
        this.dataSourcePendingSent.paginator._intl = new MatPaginatorIntl();
        this.dataSourcePendingSent.paginator._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');

        this.dataSourcePendingSent.data = this.pendingSentProcessess.items;
        this.dataSourcePendingSent.sort = this.empTbSortPendingSent;
        this.pendingSentCount = result.pagination.total;
      });
    });

    //Pareceres de Eligibilidade
    this.processService.searchProcessByState('Completed', 0, 1).subscribe(result => {
      this.logger.debug('Completos ' + result);
      this.processService.searchProcessByState('Completed', 0, result.pagination.total).subscribe(resul => {
        this.pendingEligibilityProcessess = resul;
        this.pendingEligibilityProcessess.items.forEach(process => {

          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'Incomplete'){
            process.state = this.translate.instant('searches.incompleted');
          } else if (process.state === 'Ongoing'){
            process.state = this.translate.instant('searches.running');
          } else if (process.state === 'Completed') {
            process.state = this.translate.instant('searches.completed');
          } else if (process.state === 'Returned') {
            process.state = this.translate.instant('searches.returned');
          } else if (process.state === 'Cancelled') {
            process.state = this.translate.instant('searches.cancelled');
          } else if (process.state === 'ContractAcceptance'){
            process.state = this.translate.instant('searches.contractAcceptance')
          }
          
        });
        this.dataSourcePendingEligibility.paginator._intl = new MatPaginatorIntl();
        this.dataSourcePendingEligibility.paginator._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');

        this.dataSourcePendingEligibility.data = this.pendingEligibilityProcessess.items;
        this.dataSourcePendingEligibility.sort = this.empTbSortPendingEligibility;
        this.pendingEligibilityCount = result.pagination.total;
      });
    });

    //Múltiplos Clientes
    this.processService.searchProcessByState('Completed', 0, 1).subscribe(result => {
      this.logger.debug('Completos ' + result);
      this.processService.searchProcessByState('Completed', 0, result.pagination.total).subscribe(resul => {
        this.multipleClientesProcessess = resul;
        this.multipleClientesProcessess.items.forEach(process => {

          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'Incomplete'){
            process.state = this.translate.instant('searches.incompleted');
          } else if (process.state === 'Ongoing'){
            process.state = this.translate.instant('searches.running');
          } else if (process.state === 'Completed') {
            process.state = this.translate.instant('searches.completed');
          } else if (process.state === 'Returned') {
            process.state = this.translate.instant('searches.returned');
          } else if (process.state === 'Cancelled') {
            process.state = this.translate.instant('searches.cancelled');
          } else if (process.state === 'ContractAcceptance'){
            process.state = this.translate.instant('searches.contractAcceptance')
          }
          
        });
        this.dataSourceMultipleClients.paginator._intl = new MatPaginatorIntl();
        this.dataSourceMultipleClients.paginator._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');

        this.dataSourceMultipleClients.data = this.multipleClientesProcessess.items;
        this.dataSourceMultipleClients.sort = this.empTbSortMultipleClients;
        this.multipleClientesCount = result.pagination.total;
      });
    });

    //Valida DO
    this.processService.searchProcessByState('Completed', 0, 1).subscribe(result => {
      this.logger.debug('Completos ' + result);
      this.processService.searchProcessByState('Completed', 0, result.pagination.total).subscribe(resul => {
        this.DOValidationProcessess = resul;
        this.DOValidationProcessess.items.forEach(process => {

          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'Incomplete'){
            process.state = this.translate.instant('searches.incompleted');
          } else if (process.state === 'Ongoing'){
            process.state = this.translate.instant('searches.running');
          } else if (process.state === 'Completed') {
            process.state = this.translate.instant('searches.completed');
          } else if (process.state === 'Returned') {
            process.state = this.translate.instant('searches.returned');
          } else if (process.state === 'Cancelled') {
            process.state = this.translate.instant('searches.cancelled');
          } else if (process.state === 'ContractAcceptance'){
            process.state = this.translate.instant('searches.contractAcceptance')
          }
          
        });
        this.dataSourceDOValidation.paginator._intl = new MatPaginatorIntl();
        this.dataSourceDOValidation.paginator._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');

        this.dataSourceDOValidation.data = this.DOValidationProcessess.items;
        this.dataSourceDOValidation.sort = this.empTbSortDOValidation;
        this.DOValidationCount = result.pagination.total;
      });
    });

    //Aprovação de Negociação
    this.processService.searchProcessByState('Completed', 0, 1).subscribe(result => {
      this.logger.debug('Completos ' + result);
      this.processService.searchProcessByState('Completed', 0, result.pagination.total).subscribe(resul => {
        this.negotiationAprovalProcessess = resul;
        this.negotiationAprovalProcessess.items.forEach(process => {

          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'Incomplete'){
            process.state = this.translate.instant('searches.incompleted');
          } else if (process.state === 'Ongoing'){
            process.state = this.translate.instant('searches.running');
          } else if (process.state === 'Completed') {
            process.state = this.translate.instant('searches.completed');
          } else if (process.state === 'Returned') {
            process.state = this.translate.instant('searches.returned');
          } else if (process.state === 'Cancelled') {
            process.state = this.translate.instant('searches.cancelled');
          } else if (process.state === 'ContractAcceptance'){
            process.state = this.translate.instant('searches.contractAcceptance')
          }
          
        });
        this.dataSourceNegotiationAproval.paginator._intl = new MatPaginatorIntl();
        this.dataSourceNegotiationAproval.paginator._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');

        this.dataSourceNegotiationAproval.data = this.negotiationAprovalProcessess.items;
        this.dataSourceNegotiationAproval.sort = this.empTbSortNegotiationAproval;
        this.negotiationAprovalCount = result.pagination.total;
      });
    });

    //MCC
    this.processService.searchProcessByState('Completed', 0, 1).subscribe(result => {
      this.logger.debug('Completos ' + result);
      this.processService.searchProcessByState('Completed', 0, result.pagination.total).subscribe(resul => {
        this.MCCTreatmentProcessess = resul;
        this.MCCTreatmentProcessess.items.forEach(process => {

          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'Incomplete'){
            process.state = this.translate.instant('searches.incompleted');
          } else if (process.state === 'Ongoing'){
            process.state = this.translate.instant('searches.running');
          } else if (process.state === 'Completed') {
            process.state = this.translate.instant('searches.completed');
          } else if (process.state === 'Returned') {
            process.state = this.translate.instant('searches.returned');
          } else if (process.state === 'Cancelled') {
            process.state = this.translate.instant('searches.cancelled');
          } else if (process.state === 'ContractAcceptance'){
            process.state = this.translate.instant('searches.contractAcceptance')
          }
          
        });
        this.dataSourceMCCTreatment.paginator._intl = new MatPaginatorIntl();
        this.dataSourceMCCTreatment.paginator._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');

        this.dataSourceMCCTreatment.data = this.MCCTreatmentProcessess.items;
        this.dataSourceMCCTreatment.sort = this.empTbSortMCCTreatment;
        this.MCCTreatmentCount = result.pagination.total;
      });
    });

    //Vaidação SIBS
    this.processService.searchProcessByState('Completed', 0, 1).subscribe(result => {
      this.logger.debug('Completos ' + result);
      this.processService.searchProcessByState('Completed', 0, result.pagination.total).subscribe(resul => {
        this.validationSIBSProcessess = resul;
        this.validationSIBSProcessess.items.forEach(process => {

          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'Incomplete'){
            process.state = this.translate.instant('searches.incompleted');
          } else if (process.state === 'Ongoing'){
            process.state = this.translate.instant('searches.running');
          } else if (process.state === 'Completed') {
            process.state = this.translate.instant('searches.completed');
          } else if (process.state === 'Returned') {
            process.state = this.translate.instant('searches.returned');
          } else if (process.state === 'Cancelled') {
            process.state = this.translate.instant('searches.cancelled');
          } else if (process.state === 'ContractAcceptance'){
            process.state = this.translate.instant('searches.contractAcceptance')
          }
          
        });
        this.dataSourceValidationSIBS.paginator._intl = new MatPaginatorIntl();
        this.dataSourceValidationSIBS.paginator._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');

        this.dataSourceValidationSIBS.data = this.validationSIBSProcessess.items;
        this.dataSourceValidationSIBS.sort = this.empTbSortValidationSIBS;
        this.validationSIBSCount = result.pagination.total;
      });
    });

    //Parecer de Risco
    this.processService.searchProcessByState('Completed', 0, 1).subscribe(result => {
      this.logger.debug('Completos ' + result);
      this.processService.searchProcessByState('Completed', 0, result.pagination.total).subscribe(resul => {
        this.riskOpinionProcessess = resul;
        this.riskOpinionProcessess.items.forEach(process => {

          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'Incomplete'){
            process.state = this.translate.instant('searches.incompleted');
          } else if (process.state === 'Ongoing'){
            process.state = this.translate.instant('searches.running');
          } else if (process.state === 'Completed') {
            process.state = this.translate.instant('searches.completed');
          } else if (process.state === 'Returned') {
            process.state = this.translate.instant('searches.returned');
          } else if (process.state === 'Cancelled') {
            process.state = this.translate.instant('searches.cancelled');
          } else if (process.state === 'ContractAcceptance'){
            process.state = this.translate.instant('searches.contractAcceptance')
          }
          
        });
        this.dataSourceRiskOpinion.paginator._intl = new MatPaginatorIntl();
        this.dataSourceRiskOpinion.paginator._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');

        this.dataSourceRiskOpinion.data = this.riskOpinionProcessess.items;
        this.dataSourceRiskOpinion.sort = this.empTbSortRiskOpinion;
        this.riskOpinionCount = result.pagination.total;
      });
    });

    //Dúvidas Compliance
    this.processService.searchProcessByState('Completed', 0, 1).subscribe(result => {
      this.logger.debug('Completos ' + result);
      this.processService.searchProcessByState('Completed', 0, result.pagination.total).subscribe(resul => {
        this.complianceDoubtsProcessess = resul;
        this.complianceDoubtsProcessess.items.forEach(process => {

          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'Incomplete'){
            process.state = this.translate.instant('searches.incompleted');
          } else if (process.state === 'Ongoing'){
            process.state = this.translate.instant('searches.running');
          } else if (process.state === 'Completed') {
            process.state = this.translate.instant('searches.completed');
          } else if (process.state === 'Returned') {
            process.state = this.translate.instant('searches.returned');
          } else if (process.state === 'Cancelled') {
            process.state = this.translate.instant('searches.cancelled');
          } else if (process.state === 'ContractAcceptance'){
            process.state = this.translate.instant('searches.contractAcceptance')
          }
          
        });
        this.dataSourceComplianceDoubts.paginator._intl = new MatPaginatorIntl();
        this.dataSourceComplianceDoubts.paginator._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');

        this.dataSourceComplianceDoubts.data = this.complianceDoubtsProcessess.items;
        this.dataSourceComplianceDoubts.sort = this.empTbSortComplianceDoubts;
        this.complianceDoubtsCount = result.pagination.total;
      });
    });
  }

  FTSearch(queue: string, processId: string) {
    let navigationExtras: NavigationExtras = {
      state: {
        queueName: queue,
        processId: processId
      }
    };
    this.router.navigate(["/queues-detail"], navigationExtras);
  }

  cancelProcess(processId: string) {
    var updateProcess: UpdateProcess = {
      state: "canceled",
      cancellationReason: "promptedByUser"
    }

    this.processService.UpdateProcess(processId, updateProcess, "fQkRbjO+7kGqtbjwnDMAag==", "8ed4a062-b943-51ad-4ea9-392bb0a23bac", "22195900002451", "fQkRbjO+7kGqtbjwnDMAag==").
      subscribe(result => {
        this.logger.debug("Processo cancelado " + result);
      });
  }

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      var a = UserPermissions[this.currentUser.permissions];

      console.log("permissões: ", this.currentUser.permissions);
      console.log("userPermission tratada: ", a);

      this.FTPermissions = getFTPermissions(a);

    });
    this.dataService.changeData(new Map());
    this.dataService.updateData(null, null, null);
    this.processNrService.changeProcessNumber(null);

    this.tokenService.getLoginTokenInfo(this.currentUser.token).then(result => {
      console.log('RESULTADO DA CHAMADA AO NOSSO BACKEND PARA OBTER OS DADOS DO TOKEN ', result);
    });
  }


  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  streamHistoryMenu() {
    this.dataService.historyStream$.next(true);
  }

  ngAfterViewInit() {
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSourcePendentes.filter = filterValue;
  }

  applyFilter1(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSourceTratamento.filter = filterValue;
  }

  applyFilterDevolvidos(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSourceDevolvidos.filter = filterValue;
  }

  applyFilterAceitacao(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSourceAceitacao.filter = filterValue;
  }

  applyFilterPendingSent(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSourcePendingSent.filter = filterValue;
  }

  applyFilterPendingEligibility(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSourcePendingEligibility.filter = filterValue;
  }

  applyFilterMultipleClients(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSourceMultipleClients.filter = filterValue;
  }

  applyFilterDOValidation(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSourceDOValidation.filter = filterValue;
  }

  applyFilterNegotiationAproval(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSourceNegotiationAproval.filter = filterValue;
  }

  applyFilterMCCTreatment(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSourceMCCTreatment.filter = filterValue;
  }

  applyFilterValidationSIBS(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSourceValidationSIBS.filter = filterValue;
  }

  applyFilterRiskOpinion(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSourceRiskOpinion.filter = filterValue;
  }

  applyFilterComplianceDoubts(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSourceComplianceDoubts.filter = filterValue;
  }

}


/** Builds and returns a new User. */
function createNewUser(id: number): UserData {
  const name =
    NAMES[Math.round(Math.random() * (NAMES.length - 1))] + ' ' +
    NAMES[Math.round(Math.random() * (NAMES.length - 1))].charAt(0) + '.';

  return {
    id: id.toString(),
    name: name,
    progress: Math.round(Math.random() * 100).toString(),
    color: COLORS[Math.round(Math.random() * (COLORS.length - 1))],
    teste: ''
  };
}



/** Constants used to fill up our data base. */
const COLORS = ['maroon', 'red', 'orange', 'yellow', 'olive', 'green', 'purple',
  'fuchsia', 'lime', 'teal', 'aqua', 'blue', 'navy', 'black', 'gray'];
const NAMES = ['Maia', 'Asher', 'Olivia', 'Atticus', 'Amelia', 'Jack',
  'Charlotte', 'Theodore', 'Isla', 'Oliver', 'Isabella', 'Jasper',
  'Cora', 'Levi', 'Violet', 'Arthur', 'Mia', 'Thomas', 'Elizabeth'];

export interface UserData {
  id: string;
  name: string;
  progress: string;
  color: string;
  teste: string;
}

