import { Component, OnInit, ChangeDetectorRef, HostBinding, ViewChild, AfterViewInit, AfterViewChecked } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MediaMatcher } from '@angular/cdk/layout';
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
import { ReassingWorkQueue, State, WorkQueue } from '../queues-detail/IQueues.interface';
import { AppComponent } from '../app.component';
import { ProcessNumberService } from '../nav-menu-presencial/process-number.service';
import { QueuesService } from '../queues-detail/queues.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { TokenService } from '../token.service';
import * as CryptoJS from 'crypto-js';
import CryptoAES from 'crypto-js/aes';
import CryptoHex from 'crypto-js/enc-utf8';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  animations: [onSideNavChange, AutoHideSidenavAdjust]
})
export class DashboardComponent implements OnInit, AfterViewInit {

  deleteModalRef: BsModalRef | undefined;
  @ViewChild('deleteModal') deleteModal;
  userModalRef: BsModalRef | undefined;
  @ViewChild('userModal') userModal;

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
  @ViewChild('paginatorPage') set paginatorPage(pager: MatPaginator) {
    if (pager) {
      this.dataSourcePendentes.paginator = pager;
    }
  }
  @ViewChild('paginatorPageSize') set paginatorPageSize(pager: MatPaginator) {
    if (pager) {
      this.dataSourceTratamento.paginator = pager;
    }
  }
  @ViewChild('paginatorPageDevolvidos') set paginatorPageDevolvidos(pager: MatPaginator) {
    if (pager) {
      this.dataSourceDevolvidos.paginator = pager;
    }
  }
  @ViewChild('paginatorPageAceitacao') set paginatorPageAceitacao(pager: MatPaginator) {
    if (pager) {
      this.dataSourceAceitacao.paginator = pager;
    }
  }
  @ViewChild('paginatorPagePendingSent') set paginatorPagePendingSent(pager: MatPaginator) {
    if (pager) {
      this.dataSourcePendingSent.paginator = pager;
    }
  }
  @ViewChild('paginatorPagePendingEligibility') set paginatorPagePendingEligibility(pager: MatPaginator) {
    if (pager) {
      this.dataSourcePendingEligibility.paginator = pager;
    }
  }
  @ViewChild('paginatorPageMultipleClients') set paginatorPageMultipleClients(pager: MatPaginator) {
    if (pager) {
      this.dataSourceMultipleClients.paginator = pager;
    }
  }
  @ViewChild('paginatorPageDOValidation') set paginatorPageDOValidation(pager: MatPaginator) {
    if (pager) {
      this.dataSourceDOValidation.paginator = pager;
    }
  }
  @ViewChild('paginatorPageNegotiationAproval') set paginatorPageNegotiationAproval(pager: MatPaginator) {
    if (pager) {
      this.dataSourceNegotiationAproval.paginator = pager;
    }
  }
  @ViewChild('paginatorPageMCCTreatment') set paginatorPageMCCTreatment(pager: MatPaginator) {
    if (pager) {
      this.dataSourceMCCTreatment.paginator = pager;
    }
  }
  @ViewChild('paginatorPageValidationSIBS') set paginatorPageValidationSIBS(pager: MatPaginator) {
    if (pager) {
      this.dataSourceValidationSIBS.paginator = pager;
    }
  }
  @ViewChild('paginatorPageRiskOpinion') set paginatorPageRiskOpinion(pager: MatPaginator) {
    if (pager) {
      this.dataSourceRiskOpinion.paginator = pager;
    }
  }
  @ViewChild('paginatorPageComplianceDoubts') set paginatorPageComplianceDoubts(pager: MatPaginator) {
    if (pager) {
      this.dataSourceComplianceDoubts.paginator = pager;
    }
  }

  state = State;
  displayedColumns = ['processNumber', 'merchant.fiscalId', 'merchant.name', 'startedAt', 'state', 'buttons'];
  displayedColumnsQueues = ['processNumber', 'merchant.fiscalId', 'merchant.name', 'startedAt', 'state', 'assigned', 'buttons'];

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
  queueName: string = "";
  processToDelete: string = "";
  processQueueToDelete: ProcessList = null;
  timeout;
  processToAssign: string = "";
  queue: string = "";
  jobId: number = 0;
  workQueue: WorkQueue = null;
  existsUser: boolean;
  username: string = "";

  constructor(private logger: LoggerService, private router: Router,
    changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, private dataService: DataService, private processService: ProcessService,
    private datePipe: DatePipe, private authService: AuthService, private translate: TranslateService, public appComponent: AppComponent, private processNrService: ProcessNumberService, private queueService: QueuesService, private modalService: BsModalService, private tokenService: TokenService) {
    if (this.authService.GetToken() == "" || this.authService.GetToken() == null) {
      var split = window.location.href.split("=");
      if (split[1] != undefined) {
        var decode = decodeURIComponent(split[1]);
        var token = this.decryptData("Zq4t7w!z$C&F)J@N", decode);
        var user: User = {};
        user.token = token;
        this.tokenService.getLoginTokenInfo(user.token).then(res => {
          if (res.active == false) {
            this.authService.changeExpired(true);
            this.authService.reset();
          } else {
            user.userName = res.name;
            user.bankName = res["ext-bank"];
            user.bankLocation = res["ext-bankLocation"];
            user.permissions = UserPermissions.UNICRE;
            var newDate = new Date(res.exp * 1000);
            this.timeout = newDate.getTime() - new Date().getTime();
            this.expirationCounter(this.timeout);
            this.authService.changeUser(user);
            this.router.navigate(['/']);
          }
        });
      }
    }

    this.mobileQuery = media.matchMedia('(max-width: 850px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    localStorage.clear();
    this.date = this.datePipe.transform(new Date(), 'dd-MM-yyyy');

    this.appComponent.toggleSideNav(true);
    
    this.ngOnInit(); //para obter inicialmente as permissões

    //Pendentes de envio
    if (this.FTPermissions?.pending) {
      this.processService.searchProcessByState('Incomplete', 0, 1).subscribe(result => {
        this.logger.info('Pendentes de envio ' + JSON.stringify(result.items));
        this.incompleteCount = result.pagination.total;
      });
    }

    //Tratamento BackOffice
    if (this.FTPermissions?.backOffice) {
      this.processService.searchProcessByState('Ongoing', 0, 1).subscribe(result => {
        this.logger.info('Tratamento BackOffice ' + JSON.stringify(result.items));
        this.ongoingCount = result.pagination.total;
      });
    }

    //Devolvido BackOffice
    if (this.FTPermissions?.returned) {
      this.processService.searchProcessByState('Returned', 0, 1).subscribe(result => {
        this.logger.info('Devolvidos BackOffice ' + JSON.stringify(result.items));
        this.returnedCount = result.pagination.total;
      });
    }

    //Pendentes de Aceitação
    if (this.FTPermissions?.acceptance) {
      this.processService.searchProcessByState('ContractAcceptance', 0, 1).subscribe(result => {
        this.logger.info('Pendentes de Aceitação' + JSON.stringify(result));
        this.processService.searchProcessByState('ContractDigitalAcceptance', 0, 1).subscribe(res => {
          this.processService.searchProcessByState('DigitalIdentification', 0, 1).subscribe(r => {
            this.contractAcceptanceCount = result.pagination.total + res.pagination.total + r.pagination.total;
          });
        });
      });
    }

    //Arquivo Fisico
    if (this.FTPermissions?.pendingSent) {
      this.processService.searchProcessByState('Completed', 0, 1).subscribe(result => {
        this.logger.info('Completos ' + JSON.stringify(result));
        this.pendingSentCount = result.pagination.total;
      });
    }

    //Pareceres de Eligibilidade
    if (this.FTPermissions?.pendingEligibility) {
      this.processService.searchProcessByState('EligibilityAssessment', 0, 1).subscribe(result => {
        this.logger.info('EligibilityAssessment ' + JSON.stringify(result));
        this.pendingEligibilityCount = result.pagination.total;
      });
    }

    //Múltiplos Clientes
    if (this.FTPermissions?.multipleClientes) {
      this.processService.searchProcessByState('ClientChoice', 0, 1).subscribe(result => {
        this.logger.info('ClientChoice ' + JSON.stringify(result));
        this.multipleClientesCount = result.pagination.total;
      });
    }

    //Valida DO
    if (this.FTPermissions?.DOValidation) {
      this.processService.searchProcessByState('OperationsEvaluation', 0, 1).subscribe(result => {
        this.logger.info('OperationsEvaluation ' + JSON.stringify(result));
        this.DOValidationCount = result.pagination.total;
      });
    }

    //Aprovação de Negociação
    if (this.FTPermissions?.negotiationAproval) {
      this.processService.searchProcessByState('NegotiationApproval', 0, 1).subscribe(result => {
        this.logger.info('NegotiationApproval ' + JSON.stringify(result));
        this.negotiationAprovalCount = result.pagination.total;
      });
    }

    //MCC
    if (this.FTPermissions?.MCCTreatment) {
      this.processService.searchProcessByState('StandardIndustryClassificationChoice', 0, 1).subscribe(result => {
        this.logger.info('StandardIndustryClassificationChoice ' + JSON.stringify(result));
        this.MCCTreatmentCount = result.pagination.total;
      });
    }

    if (this.FTPermissions?.validationSIBS) { //Validação SIBS
      this.processService.searchProcessByState('MerchantRegistration', 0, 1).subscribe(result => {
        this.logger.info('MerchantRegistration ' + JSON.stringify(result));
        this.validationSIBSCount = result.pagination.total;
      });
    }

    //Parecer de Risco
    if (this.FTPermissions?.riskOpinion) {
      this.processService.searchProcessByState('RiskAssessment', 0, 1).subscribe(result => {
        this.logger.info('RiskAssessment ' + JSON.stringify(result));
        this.riskOpinionCount = result.pagination.total;
      });
    }

    //Dúvidas Compliance
    if (this.FTPermissions?.complianceDoubts) {
      this.processService.searchProcessByState('ComplianceEvaluation', 0, 1).subscribe(result => {
        this.logger.info('ComplianceEvaluation ' + JSON.stringify(result));
        this.complianceDoubtsCount = result.pagination.total;
      });
    }

    if (this.router?.getCurrentNavigation()?.extras?.state) {
      this.queueName = this.router.getCurrentNavigation().extras.state["queueName"];
    }
  }

  callIncompleteCount() {
    if (this.incompleteCount > 0) {
      this.processService.searchProcessByState('Incomplete', 0, this.incompleteCount).subscribe(resul => {
        this.logger.info('Search incomplete processes ' + JSON.stringify(resul));
        this.incompleteProcessess = resul;
        this.incompleteProcessess.items.forEach(process => {
          process.startedAt = this.datePipe.transform(process.startedAt, 'dd-MM-yyyy').toString();
          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'Incomplete') {
            process.state = this.translate.instant('searches.incompleted');
          }
        });
        this.orderProcesses(this.dataSourcePendentes, this.empTbSort, this.incompleteProcessess);
      });
    }
  }

  callBackOfficeCount() {
    if (this.ongoingCount > 0) {
      this.processService.searchProcessByState('Ongoing', 0, this.ongoingCount).subscribe(resul => {
        this.logger.info('Search ongoing processes ' + JSON.stringify(resul));
        this.ongoingProcessess = resul;
        this.ongoingProcessess.items.forEach(process => {
          process.startedAt = this.datePipe.transform(process.startedAt, 'dd-MM-yyyy').toString();

          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'Ongoing') {
            process.state = this.translate.instant('searches.running');
          }
        });
        this.orderProcesses(this.dataSourceTratamento, this.empTbSortWithObject, this.ongoingProcessess);
      });
    }
  }

  callReturnedCount() {
    if (this.returnedCount > 0) {
      this.processService.searchProcessByState('Returned', 0, this.returnedCount).subscribe(resul => {
        this.logger.info('Search returned processes ' + JSON.stringify(resul));
        this.returnedProcessess = resul;
        this.returnedProcessess.items.forEach(process => {
          process.startedAt = this.datePipe.transform(process.startedAt, 'dd-MM-yyyy').toString();

          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'Returned') {
            process.state = this.translate.instant('searches.returned');
          }
        });
        this.orderProcesses(this.dataSourceDevolvidos, this.empTbSortDevolvidos, this.returnedProcessess);
      });
    }
  }

  callAcceptanceCount() {
    if (this.contractAcceptanceCount > 0) {
      this.processService.searchProcessByState('ContractAcceptance', 0, this.contractAcceptanceCount).subscribe(resul => {
        this.logger.info('Search contract acceptance processes ' + JSON.stringify(resul));
        this.contractAcceptanceProcessess = resul;
        this.contractAcceptanceProcessess.items.forEach(process => {
          process.startedAt = this.datePipe.transform(process.startedAt, 'dd-MM-yyyy').toString();
          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'ContractAcceptance') {
            process.state = this.translate.instant('searches.contractAcceptance')
          }
        });
      });

      this.processService.searchProcessByState('ContractDigitalAcceptance', 0, this.contractAcceptanceCount).subscribe(resul => {
        this.logger.info('Search contract acceptance processes ' + JSON.stringify(resul));
        var contractAcceptanceProcessess = resul;
        contractAcceptanceProcessess.items.forEach(process => {
          process.startedAt = this.datePipe.transform(process.startedAt, 'dd-MM-yyyy').toString();
          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'ContractDigitalAcceptance') {
            process.state = this.translate.instant('searches.contractDigitalAcceptance')
          }
        });
        this.contractAcceptanceProcessess.items.push(...contractAcceptanceProcessess.items);
      });

      this.processService.searchProcessByState('DigitalIdentification', 0, this.contractAcceptanceCount).subscribe(resul => {
        this.logger.info('Search contract acceptance processes ' + JSON.stringify(resul));
        var contractAcceptanceProcessess = resul;
        contractAcceptanceProcessess.items.forEach(process => {
          process.startedAt = this.datePipe.transform(process.startedAt, 'dd-MM-yyyy').toString();
          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'DigitalIdentification') {
            process.state = this.translate.instant('searches.digitalIdentification')
          }
        });
        this.contractAcceptanceProcessess.items.push(...contractAcceptanceProcessess.items);
        this.orderProcesses(this.dataSourceAceitacao, this.empTbSortAceitacao, this.contractAcceptanceProcessess);
      });
    }
  }

  callPendingSentCount() {
    if (this.pendingSentCount > 0) {
      this.processService.searchProcessByState('Completed', 0, this.pendingSentCount).subscribe(resul => {
        this.logger.info('Search completed processes ' + JSON.stringify(resul));
        this.pendingSentProcessess = resul;
        this.pendingSentProcessess.items.forEach(process => {
          process.startedAt = this.datePipe.transform(process.startedAt, 'dd-MM-yyyy').toString();

          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'Completed') {
            process.state = this.translate.instant('searches.completed');
          }
        });
        this.orderProcesses(this.dataSourcePendingSent, this.empTbSortPendingSent, this.pendingSentProcessess);
      });
    }
  }

  callPendingEligibilityCount() {
    if (this.pendingEligibilityCount > 0) {
      this.processService.searchProcessByState('EligibilityAssessment', 0, this.pendingEligibilityCount).subscribe(resul => {
        this.logger.info('Search eligibility assessment processes ' + JSON.stringify(resul));
        this.pendingEligibilityProcessess = resul;
        this.pendingEligibilityProcessess.items.forEach(process => {
          process.startedAt = this.datePipe.transform(process.startedAt, 'dd-MM-yyyy').toString();

          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'EligibilityAssessment') {
            process.state = this.translate.instant('searches.eligibility');
          }
        });
        this.orderProcesses(this.dataSourcePendingEligibility, this.empTbSortPendingEligibility, this.pendingEligibilityProcessess);
      });
    }
  }

  callMultipleClientsCount() {
    if (this.multipleClientesCount > 0) {
      this.processService.searchProcessByState('ClientChoice', 0, this.multipleClientesCount).subscribe(resul => {
        this.logger.info('Search client choice processes ' + JSON.stringify(resul));
        this.multipleClientesProcessess = resul;
        this.multipleClientesProcessess.items.forEach(process => {
          process.startedAt = this.datePipe.transform(process.startedAt, 'dd-MM-yyyy').toString();

          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'ClientChoice') {
            process.state = this.translate.instant('searches.multipleClients');
          }
        });
        this.orderProcesses(this.dataSourceMultipleClients, this.empTbSortMultipleClients, this.multipleClientesProcessess);
      });
    }
  }

  callDOValidationCount() {
    if (this.DOValidationCount > 0) {
      this.processService.searchProcessByState('OperationsEvaluation', 0, this.DOValidationCount).subscribe(resul => {
        this.logger.info('Search operations evaluation processes ' + JSON.stringify(resul));
        this.DOValidationProcessess = resul;
        this.DOValidationProcessess.items.forEach(process => {
          process.startedAt = this.datePipe.transform(process.startedAt, 'dd-MM-yyyy').toString();

          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'OperationsEvaluation') {
            process.state = this.translate.instant('searches.DOValidation');
          }
        });
        this.orderProcesses(this.dataSourceDOValidation, this.empTbSortDOValidation, this.DOValidationProcessess);
      });
    }
  }

  callNegotiationApprovalCount() {
    if (this.negotiationAprovalCount > 0) {
      this.processService.searchProcessByState('NegotiationApproval', 0, this.negotiationAprovalCount).subscribe(resul => {
        this.logger.info('Search negotiation approval processes ' + JSON.stringify(resul));
        this.negotiationAprovalProcessess = resul;
        this.negotiationAprovalProcessess.items.forEach(process => {
          process.startedAt = this.datePipe.transform(process.startedAt, 'dd-MM-yyyy').toString();

          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'NegotiationApproval') {
            process.state = this.translate.instant('searches.negotiationApproval');
          }
        });
        this.orderProcesses(this.dataSourceNegotiationAproval, this.empTbSortNegotiationAproval, this.negotiationAprovalProcessess);
      });
    }
  }

  callMCCTreatmentCount() {
    if (this.MCCTreatmentCount > 0) {
      this.processService.searchProcessByState('StandardIndustryClassificationChoice', 0, this.MCCTreatmentCount).subscribe(resul => {
        this.logger.info('Search standard industry classification choice processes ' + JSON.stringify(resul));
        this.MCCTreatmentProcessess = resul;
        this.MCCTreatmentProcessess.items.forEach(process => {
          process.startedAt = this.datePipe.transform(process.startedAt, 'dd-MM-yyyy').toString();

          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'StandardIndustryClassificationChoice') {
            process.state = this.translate.instant('searches.MCCTreatment');
          }
        });
        this.orderProcesses(this.dataSourceMCCTreatment, this.empTbSortMCCTreatment, this.MCCTreatmentProcessess);
      });
    }
  }

  callValidationSIBSCount() {
    if (this.validationSIBSCount > 0) {
      this.processService.searchProcessByState('MerchantRegistration', 0, this.validationSIBSCount).subscribe(resul => {
        this.logger.info('Search merchant registration processes ' + JSON.stringify(resul));
        this.validationSIBSProcessess = resul;
        this.validationSIBSProcessess.items.forEach(process => {
          process.startedAt = this.datePipe.transform(process.startedAt, 'dd-MM-yyyy').toString();

          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'MerchantRegistration') {
            process.state = this.translate.instant('searches.validationSIBS');
          }
        });
        this.orderProcesses(this.dataSourceValidationSIBS, this.empTbSortValidationSIBS, this.validationSIBSProcessess);
      });
    }
  }

  callRiskOpinionCount() {
    if (this.riskOpinionCount > 0) {
      this.processService.searchProcessByState('RiskAssessment', 0, this.riskOpinionCount).subscribe(resul => {
        this.logger.info('Search risk assessment processes ' + JSON.stringify(resul));
        this.riskOpinionProcessess = resul;
        this.riskOpinionProcessess.items.forEach(process => {
          process.startedAt = this.datePipe.transform(process.startedAt, 'dd-MM-yyyy').toString();

          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'RiskAssessment') {
            process.state = this.translate.instant('searches.riskOpinion');
          }
        });
        this.orderProcesses(this.dataSourceRiskOpinion, this.empTbSortRiskOpinion, this.riskOpinionProcessess);
      });
    }
  }

  callComplianceDoubtsCount() {
    if (this.complianceDoubtsCount > 0) {
      this.processService.searchProcessByState('ComplianceEvaluation', 0, this.complianceDoubtsCount).subscribe(resul => {
        this.logger.info('Search compliance evaluation processes ' + JSON.stringify(resul));
        this.complianceDoubtsProcessess = resul;
        this.complianceDoubtsProcessess.items.forEach(process => {
          process.startedAt = this.datePipe.transform(process.startedAt, 'dd-MM-yyyy').toString();

          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'ComplianceEvaluation') {
            process.state = this.translate.instant('searches.complianceDoubts');
          }
        });
        this.orderProcesses(this.dataSourceComplianceDoubts, this.empTbSortComplianceDoubts, this.complianceDoubtsProcessess);
      });
    }
  }

  orderProcesses(dataSource: MatTableDataSource<ProcessList>, sorter: MatSort, list: ProcessGet) {
    dataSource.paginator._intl = new MatPaginatorIntl();
    dataSource.paginator._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');

    dataSource.data = list.items;
    dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'merchant.fiscalId': return item.merchant?.fiscalId;

        case 'merchant.name': return item.merchant?.name?.toLocaleLowerCase();

        case 'startedAt': {
          var split = item?.startedAt.split('-');
          var newDate = split[1] + "-" + split[0] + "-" + split[2];
          return new Date(newDate);
        }

        default: return item[property].toLocaleLowerCase();
      }
    }
    dataSource.sort = sorter;
  }

  FTSearch(queue: string, processId: string) {
    this.processToAssign = processId;
    this.queue = queue;
    this.username = this.authService.GetCurrentUser().userName;
    this.queueService.getActiveWorkQueue(processId).then(result => {
      this.workQueue = result.result;
      if (result.result.lockedBy == "" || result.result.lockedBy == null) {
        this.existsUser = false;
      } else {
        this.existsUser = true;
      }
      this.userModalRef = this.modalService.show(this.userModal, { class: 'modal-lg' });
    }, error => {
      this.logger.error(error, "Error while searching for active work queue");
    });
  }

  cancelProcess(processId: string) {
    var updateProcess: UpdateProcess = {
      state: "canceled",
      cancellationReason: "promptedByUser"
    }

    this.processService.UpdateProcess(processId, updateProcess, "fQkRbjO+7kGqtbjwnDMAag==", "8ed4a062-b943-51ad-4ea9-392bb0a23bac", "22195900002451", "fQkRbjO+7kGqtbjwnDMAag==").
      subscribe(result => {
        this.logger.info("Cancel process " + JSON.stringify(result));
      });
  }

  openProcess(process) {
    localStorage.setItem("processNumber", process.processNumber);
    localStorage.setItem("returned", 'consult');
    this.logger.info("Redirecting to Client by id page");
    this.router.navigate(['/clientbyid']);
  }

  openProcessAceitacao(process) {
    localStorage.setItem("processNumber", process.processNumber);
    this.processNrService.changeProcessId(process.processId);
    this.processNrService.changeQueueName("aceitacao");
    this.logger.info("Redirecting to Aceitacao page");
    this.router.navigate(['/app-aceitacao/', process.processId]);
  }

  redirectToProcessStart(process) {
    localStorage.setItem("processNumber", process.processNumber);
    localStorage.setItem("returned", 'edit');
    this.logger.info("Redirecting to Client by id page");
    this.router.navigate(['/clientbyid']);
  }

  deleteQueueProcess(process: ProcessList) {
    this.processQueueToDelete = null;
    this.deleteModalRef = this.modalService.show(this.deleteModal, { class: 'modal-lg' });
    this.processQueueToDelete = process;
  }

  deleteProcess(processId: string) {
    this.processToDelete = "";
    this.deleteModalRef = this.modalService.show(this.deleteModal, { class: 'modal-lg' });
    this.processToDelete = processId;
  }

  assign() {
    let navigationExtras: NavigationExtras = {
      state: {
        queueName: this.queue,
        processId: this.processToAssign
      }
    };
    var reassignWorkQueue: ReassingWorkQueue = {};
    reassignWorkQueue.forceReassign = true;
    reassignWorkQueue.jobId = this.workQueue.id;
    reassignWorkQueue.username = this.username;
    this.queueService.postReassignWorkQueue(this.processToAssign, reassignWorkQueue).then(res => {
      this.processNrService.changeProcessId(this.processToAssign);
      this.processNrService.changeQueueName(this.queue);
      this.processToAssign = "";
      this.jobId = 0;
      this.queue = "";
      this.userModalRef?.hide();
      this.logger.info('Redirecting to Queues Detail page');
      this.router.navigate(["/queues-detail"], navigationExtras);
    });
  }

  delete() {
    if (this.processToDelete != "") {
      this.deleteModalRef?.hide();
      this.queueService.markToCancel(this.processToDelete).then(res => {
        
      });
    }
    if (this.processQueueToDelete != null) {
      this.deleteModalRef?.hide();
      var state: State;
      var queueModel;
      if (this.processQueueToDelete["tenantState"] == "ContractDigitalAcceptance") {
        state = State.CONTRACT_DIGITAL_ACCEPTANCE;
        queueModel = {
          $type: "ContractDigitalAcceptance",
          contractDigitalAcceptanceResult: 'Cancel'
        };
      }
      if (this.processQueueToDelete["tenantState"] == "ContractAcceptance") {
        state = State.CONTRACT_ACCEPTANCE;
        queueModel = {
          $type: "ContractAcceptanceModel",
          contractAcceptanceResult: 'Cancel'
        };
      }
      if (this.processQueueToDelete["tenantState"] == "DigitalIdentification") {
        state = State.DIGITAL_IDENTIFICATION;
        queueModel = {
          $type: "DigitalIdentification",
          digitalIdentificationResult: 'Cancel'
        };
      }
      this.queueService.postExternalState(this.processQueueToDelete.processId, state, queueModel).then(result => {
        
      });
    }
  }

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      var a = UserPermissions[this.currentUser.permissions];

      this.FTPermissions = getFTPermissions(a);

    });
    this.dataService.reset();
    this.dataService.changeData(new Map());
    this.dataService.updateData(null, null, null);
    this.dataService.changeUpdatedComprovativos(false);
    this.dataService.changeUpdatedClient(false);
    this.dataService.changeCurrentFirstTimeStake(true);
    this.dataService.changeQueueName(null);
    this.processNrService.changeProcessNumber(null);
    this.processNrService.changeProcessId(null);
    this.processNrService.changeQueueName(null);

    this.dataSourcePendentes.filterPredicate = function (record, filterValue) {
      return record.processNumber.trim().toLowerCase().includes(filterValue.trim().toLowerCase());
    }

    this.dataSourceTratamento.filterPredicate = function (record, filterValue) {
      return record.processNumber.trim().toLowerCase().includes(filterValue.trim().toLowerCase());
    }

    this.dataSourceDevolvidos.filterPredicate = function (record, filterValue) {
      return record.processNumber.trim().toLowerCase().includes(filterValue.trim().toLowerCase());
    }

    this.dataSourceAceitacao.filterPredicate = function (record, filterValue) {
      return record.processNumber.trim().toLowerCase().includes(filterValue.trim().toLowerCase());
    }

    this.dataSourcePendingSent.filterPredicate = function (record, filterValue) {
      return record.processNumber.trim().toLowerCase().includes(filterValue.trim().toLowerCase());
    }

    this.dataSourcePendingEligibility.filterPredicate = function (record, filterValue) {
      return record.processNumber.trim().toLowerCase().includes(filterValue.trim().toLowerCase());
    }

    this.dataSourceMultipleClients.filterPredicate = function (record, filterValue) {
      return record.processNumber.trim().toLowerCase().includes(filterValue.trim().toLowerCase());
    }

    this.dataSourceDOValidation.filterPredicate = function (record, filterValue) {
      return record.processNumber.trim().toLowerCase().includes(filterValue.trim().toLowerCase());
    }

    this.dataSourceNegotiationAproval.filterPredicate = function (record, filterValue) {
      return record.processNumber.trim().toLowerCase().includes(filterValue.trim().toLowerCase());
    }

    this.dataSourceMCCTreatment.filterPredicate = function (record, filterValue) {
      return record.processNumber.trim().toLowerCase().includes(filterValue.trim().toLowerCase());
    }

    this.dataSourceValidationSIBS.filterPredicate = function (record, filterValue) {
      return record.processNumber.trim().toLowerCase().includes(filterValue.trim().toLowerCase());
    }

    this.dataSourceRiskOpinion.filterPredicate = function (record, filterValue) {
      return record.processNumber.trim().toLowerCase().includes(filterValue.trim().toLowerCase());
    }

    this.dataSourceComplianceDoubts.filterPredicate = function (record, filterValue) {
      return record.processNumber.trim().toLowerCase().includes(filterValue.trim().toLowerCase());
    }
  }

  ngAfterViewInit() {
    if (this.queueName != undefined && this.queueName != null && this.queueName != "") {
      if (this.queueName == "eligibility") {
        document.getElementById("flush-collapsePendingEligibility").className = "accordion-collapse collapse show";
        document.getElementById("accordionButton6").className = "accordion1-button";
        this.pendingEligibilityCount = 100;
        this.callPendingEligibilityCount();
      } else if (this.queueName == "multipleClients") {
        document.getElementById("flush-collapseMultipleClients").className = "accordion-collapse collapse show";
        document.getElementById("accordionButton7").className = "accordion1-button";
        this.multipleClientesCount = 100;
        this.callMultipleClientsCount();
      } else if (this.queueName == "DOValidation") {
        document.getElementById("flush-collapseDOValidation").className = "accordion-collapse collapse show";
        document.getElementById("accordionButton8").className = "accordion1-button";
        this.DOValidationCount = 100;
        this.callDOValidationCount();
      } else if (this.queueName == "negotiationAproval") {
        document.getElementById("flush-collapseNegotiationAproval").className = "accordion-collapse collapse show";
        document.getElementById("accordionButton9").className = "accordion1-button";
        this.negotiationAprovalCount = 100;
        this.callNegotiationApprovalCount();
      } else if (this.queueName == "MCCTreatment") {
        document.getElementById("flush-collapseMCCTreatment").className = "accordion-collapse collapse show";
        document.getElementById("accordionButton10").className = "accordion1-button";
        this.MCCTreatmentCount = 100;
        this.callMCCTreatmentCount();
      } else if (this.queueName == "validationSIBS") {
        document.getElementById("flush-collapseValidationSIBS").className = "accordion-collapse collapse show";
        document.getElementById("accordionButton11").className = "accordion1-button";
        this.validationSIBSCount = 100;
        this.callValidationSIBSCount();
      } else if (this.queueName == "risk") {
        document.getElementById("flush-collapseRiskOpinion").className = "accordion-collapse collapse show";
        document.getElementById("accordionButton12").className = "accordion1-button";
        this.riskOpinionCount = 100;
        this.callRiskOpinionCount();
      } else if (this.queueName == "compliance") {
        document.getElementById("flush-collapseComplianceDoubts").className = "accordion-collapse collapse show";
        document.getElementById("accordionButton13").className = "accordion1-button";
        this.complianceDoubtsCount = 100;
        this.callComplianceDoubtsCount();
      }
    }
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  streamHistoryMenu(process) {
    this.dataService.historyStream$.next(true);
    this.processNrService.changeProcessId(process.processId);
    this.processNrService.changeQueueName("devolucao");
    this.logger.info('Redirecting to Devolucao page');
    this.router.navigate(['/app-devolucao/', process.processId]);
  }

  applyFilter(filterValue: string) {
    this.dataSourcePendentes.filter = filterValue;
  }

  applyFilter1(filterValue: string) {
    this.dataSourceTratamento.filter = filterValue;
  }

  applyFilterDevolvidos(filterValue: string) {
    this.dataSourceDevolvidos.filter = filterValue;
  }

  applyFilterAceitacao(filterValue: string) {
    this.dataSourceAceitacao.filter = filterValue;
  }

  applyFilterPendingSent(filterValue: string) {
    this.dataSourcePendingSent.filter = filterValue;
  }

  applyFilterPendingEligibility(filterValue: string) {
    this.dataSourcePendingEligibility.filter = filterValue;
  }

  applyFilterMultipleClients(filterValue: string) {
    this.dataSourceMultipleClients.filter = filterValue;
  }

  applyFilterDOValidation(filterValue: string) {
    this.dataSourceDOValidation.filter = filterValue;
  }

  applyFilterNegotiationAproval(filterValue: string) {
    this.dataSourceNegotiationAproval.filter = filterValue;
  }

  applyFilterMCCTreatment(filterValue: string) {
    this.dataSourceMCCTreatment.filter = filterValue;
  }

  applyFilterValidationSIBS(filterValue: string) {
    this.dataSourceValidationSIBS.filter = filterValue;
  }

  applyFilterRiskOpinion(filterValue: string) {
    this.dataSourceRiskOpinion.filter = filterValue;
  }

  applyFilterComplianceDoubts(filterValue: string) {
    this.dataSourceComplianceDoubts.filter = filterValue;
  }

  closeDeleteModal() {
    this.deleteModalRef?.hide();
  }

  closeUserModal() {
    this.userModalRef?.hide();
  }

  expirationCounter(timeout) {
    setTimeout(() => {
      this.logger.info('Token expired');
      this.logout();
    }, timeout)
  }

  logout() {
    localStorage.removeItem('auth');
    this.authService.reset();
  }

  decryptData(key, ciphertextB64) {// Base64 encoded ciphertext, 32 bytes string as key
    var key = CryptoHex.parse(key);                             // Convert into WordArray (using Utf8)
    var iv = CryptoJS.lib.WordArray.create([0x00, 0x00, 0x00, 0x00]);  // Use zero vector as IV
    var decrypted = CryptoAES.decrypt(ciphertextB64.toString(), key, { iv : iv }); // By default: CBC, PKCS7 
    return decrypted.toString(CryptoHex);                       // Convert into string (using Utf8)
}
}
