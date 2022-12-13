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

  //---------------------------

  state = State;

  displayedColumns = ['processNumber', 'merchant.fiscalId', 'merchant.name', 'startedAt', 'state', 'buttons'];
  displayedColumnsQueues = ['processNumber', 'merchant.fiscalId', 'merchant.name', 'startedAt', 'state', 'assigned', 'buttons'];

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

    this.ngOnInit(); //para obter inicialmente as permissões

    //Pendentes de envio
    if (this.FTPermissions?.pending) {
      this.processService.searchProcessByState('Incomplete', 0, 1).subscribe(result => {
        this.logger.debug('Pendentes de envio ' + result.items);
        this.incompleteCount = result.pagination.total;
      });
    }

    //Tratamento BackOffice
    if (this.FTPermissions?.backOffice) {
      this.processService.searchProcessByState('Ongoing', 0, 1).subscribe(result => {
        this.logger.debug('Tratamento BackOffice ' + result.items);
        this.ongoingCount = result.pagination.total;
      });
    }

    //Devolvido BackOffice
    if (this.FTPermissions?.returned) {
      this.processService.searchProcessByState('Returned', 0, 1).subscribe(result => {
        this.logger.debug('Devolvidos BackOffice ' + result.items);
        this.returnedCount = result.pagination.total;
      });
    }

    //Pendentes de Aceitação
    if (this.FTPermissions?.acceptance) {
      this.processService.searchProcessByState('ContractAcceptance', 0, 1).subscribe(result => {
        this.logger.debug('Pendentes de Aceitação' + result);
        this.contractAcceptanceCount = result.pagination.total;
      });
    }

    //Arquivo Fisico
    if (this.FTPermissions?.pendingSent) { 
      this.processService.searchProcessByState('Completed', 0, 1).subscribe(result => {
        this.logger.debug('Completos ' + result);
        this.pendingSentCount = result.pagination.total;
      });
    }

    //Pareceres de Eligibilidade
    if (this.FTPermissions?.pendingEligibility) { 
      this.processService.searchProcessByState('EligibilityAssessment', 0, 1).subscribe(result => {
        this.logger.debug('EligibilityAssessment ' + result);
        this.pendingEligibilityCount = result.pagination.total;
      });
    }

    //Múltiplos Clientes
    if (this.FTPermissions?.multipleClientes) { 
      this.processService.searchProcessByState('ClientChoice', 0, 1).subscribe(result => {
        this.logger.debug('ClientChoice ' + result);
        this.multipleClientesCount = result.pagination.total;
      });
    }

    //Valida DO
    if (this.FTPermissions?.DOValidation) { 
      this.processService.searchProcessByState('OperationsEvaluation', 0, 1).subscribe(result => {
        this.logger.debug('OperationsEvaluation ' + result);
        this.DOValidationCount = result.pagination.total;
      });
    }

    //Aprovação de Negociação
    if (this.FTPermissions?.negotiationAproval) { 
      this.processService.searchProcessByState('NegotiationApproval', 0, 1).subscribe(result => {
        this.logger.debug('NegotiationApproval ' + result);
        this.negotiationAprovalCount = result.pagination.total;
      });
    }

    //MCC
    if (this.FTPermissions?.MCCTreatment) { 
      this.processService.searchProcessByState('StandardIndustryClassificationChoice', 0, 1).subscribe(result => {
        this.logger.debug('StandardIndustryClassificationChoice ' + result);
        this.MCCTreatmentCount = result.pagination.total;
      });
    }

    if (this.FTPermissions?.validationSIBS) { //Validação SIBS
      this.processService.searchProcessByState('MerchantRegistration', 0, 1).subscribe(result => {
        this.logger.debug('MerchantRegistration ' + result);
        this.validationSIBSCount = result.pagination.total;
      });
    }

    //Parecer de Risco
    if (this.FTPermissions?.riskOpinion) { 
      this.processService.searchProcessByState('RiskAssessment', 0, 1).subscribe(result => {
        this.logger.debug('RiskAssessment ' + result);
        this.riskOpinionCount = result.pagination.total;
      });
    }

    //Dúvidas Compliance
    if (this.FTPermissions?.complianceDoubts) { 
      this.processService.searchProcessByState('ComplianceEvaluation', 0, 1).subscribe(result => {
        this.logger.debug('ComplianceEvaluation ' + result);
        this.complianceDoubtsCount = result.pagination.total;
      });
    }
  }

  callIncompleteCount() {
    if (this.incompleteCount > 0){
      this.processService.searchProcessByState('Incomplete', 0, this.incompleteCount).subscribe(resul => {
        this.incompleteProcessess = resul;
        this.incompleteProcessess.items.forEach(process => {
          process.startedAt = this.datePipe.transform(process.startedAt, 'dd-MM-yyyy');
  
          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'Incomplete') {
            process.state = this.translate.instant('searches.incompleted');
          }
        });
        this.orderProcesses(this.dataSourcePendentes, this.empTbSort);
      });
    }
  }

  callBackOfficeCount() {
    if (this.ongoingCount > 0) {
      this.processService.searchProcessByState('Ongoing', 0, this.ongoingCount).subscribe(resul => {
        this.ongoingProcessess = resul;
        this.ongoingProcessess.items.forEach(process => {
          process.startedAt = this.datePipe.transform(process.startedAt, 'dd-MM-yyyy');
  
          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'Ongoing') {
            process.state = this.translate.instant('searches.running');
          }
        });
        this.orderProcesses(this.dataSourceTratamento, this.empTbSortWithObject);
      });
    }
  }

  callReturnedCount() {
    if (this.returnedCount > 0) {
      this.processService.searchProcessByState('Returned', 0, this.returnedCount).subscribe(resul => {
        this.returnedProcessess = resul;
        this.returnedProcessess.items.forEach(process => {
          process.startedAt = this.datePipe.transform(process.startedAt, 'dd-MM-yyyy');
  
          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'Returned') {
            process.state = this.translate.instant('searches.returned');
          }
        });
        this.orderProcesses(this.dataSourceDevolvidos, this.empTbSortDevolvidos);
      });
    }
  }

  callAcceptanceCount() {
    if (this.contractAcceptanceCount > 0) {
      this.processService.searchProcessByState('ContractAcceptance', 0, this.contractAcceptanceCount).subscribe(resul => {
        this.contractAcceptanceProcessess = resul;
        this.contractAcceptanceProcessess.items.forEach(process => {
          process.startedAt = this.datePipe.transform(process.startedAt, 'dd-MM-yyyy');
  
          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'ContractAcceptance') {
            process.state = this.translate.instant('searches.contractAcceptance')
          }
        });
        this.orderProcesses(this.dataSourceAceitacao, this.empTbSortAceitacao);
      });
    }   
  }

  callPendingSentCount() {
    if (this.pendingSentCount > 0) {
      this.processService.searchProcessByState('Completed', 0, this.pendingSentCount).subscribe(resul => {
        this.pendingSentProcessess = resul;
        this.pendingSentProcessess.items.forEach(process => {
          process.startedAt = this.datePipe.transform(process.startedAt, 'dd-MM-yyyy');
  
          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'Completed') {
            process.state = this.translate.instant('searches.completed');
          } 
        });
        this.orderProcesses(this.dataSourcePendingSent, this.empTbSortPendingSent);
      });
    }
  }

  callPendingEligibilityCount() {
    if (this.pendingEligibilityCount > 0) {
      this.processService.searchProcessByState('EligibilityAssessment', 0, this.pendingEligibilityCount).subscribe(resul => {
        this.pendingEligibilityProcessess = resul;
        this.pendingEligibilityProcessess.items.forEach(process => {
          process.startedAt = this.datePipe.transform(process.startedAt, 'dd-MM-yyyy');
  
          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'EligibilityAssessment') {
            process.state = this.translate.instant('searches.eligibility');
          }
        });
        this.orderProcesses(this.dataSourcePendingEligibility, this.empTbSortPendingEligibility);
      });
    }
  }

  callMultipleClientsCount() {
    if (this.multipleClientesCount > 0) {
      this.processService.searchProcessByState('ClientChoice', 0, this.multipleClientesCount).subscribe(resul => {
        this.multipleClientesProcessess = resul;
        this.multipleClientesProcessess.items.forEach(process => {
          process.startedAt = this.datePipe.transform(process.startedAt, 'dd-MM-yyyy');
  
          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'ClientChoice') {
            process.state = this.translate.instant('searches.multipleClients');
          } 
        });
        this.orderProcesses(this.dataSourceMultipleClients, this.empTbSortMultipleClients);
      });
    }
  }

  callDOValidationCount() {
    if (this.DOValidationCount > 0) {
      this.processService.searchProcessByState('OperationsEvaluation', 0, this.DOValidationCount).subscribe(resul => {
        this.DOValidationProcessess = resul;
        this.DOValidationProcessess.items.forEach(process => {
          process.startedAt = this.datePipe.transform(process.startedAt, 'dd-MM-yyyy');
  
          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'OperationsEvaluation') {
            process.state = this.translate.instant('searches.DOValidation');
          } 
        });
        this.orderProcesses(this.dataSourceDOValidation, this.empTbSortDOValidation);
      });
    }
  }

  callNegotiationApprovalCount() {
    if (this.negotiationAprovalCount > 0) {
      this.processService.searchProcessByState('NegotiationApproval', 0, this.negotiationAprovalCount).subscribe(resul => {
        this.negotiationAprovalProcessess = resul;
        this.negotiationAprovalProcessess.items.forEach(process => {
          process.startedAt = this.datePipe.transform(process.startedAt, 'dd-MM-yyyy');
  
          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'NegotiationApproval') {
            process.state = this.translate.instant('searches.negotiationApproval');
          } 
        });
        this.orderProcesses(this.dataSourceNegotiationAproval, this.empTbSortNegotiationAproval);
      });
    }  
  }

  callMCCTreatmentCount() {
    if (this.MCCTreatmentCount > 0) {
      this.processService.searchProcessByState('StandardIndustryClassificationChoice', 0, this.MCCTreatmentCount).subscribe(resul => {
        this.MCCTreatmentProcessess = resul;
        this.MCCTreatmentProcessess.items.forEach(process => {
          process.startedAt = this.datePipe.transform(process.startedAt, 'dd-MM-yyyy');
  
          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'StandardIndustryClassificationChoice') {
            process.state = this.translate.instant('searches.MCCTreatment');
          } 
        });
        this.orderProcesses(this.dataSourceMCCTreatment, this.empTbSortMCCTreatment);
      });
    }
  }

  callValidationSIBSCount() {
    if (this.validationSIBSCount > 0) {
      this.processService.searchProcessByState('MerchantRegistration', 0, this.validationSIBSCount).subscribe(resul => {
        this.validationSIBSProcessess = resul;
        this.validationSIBSProcessess.items.forEach(process => {
          process.startedAt = this.datePipe.transform(process.startedAt, 'dd-MM-yyyy');
  
          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'MerchantRegistration') {
            process.state = this.translate.instant('searches.validationSIBS');
          } 
        });
        this.orderProcesses(this.dataSourceValidationSIBS, this.empTbSortValidationSIBS);
      });
    }
  }

  callRiskOpinionCount() {
    if (this.riskOpinionCount > 0) {
      this.processService.searchProcessByState('RiskAssessment', 0, this.riskOpinionCount).subscribe(resul => {
        this.riskOpinionProcessess = resul;
        this.riskOpinionProcessess.items.forEach(process => {
          process.startedAt = this.datePipe.transform(process.startedAt, 'dd-MM-yyyy');
  
          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'RiskAssessment') {
            process.state = this.translate.instant('searches.riskOpinion');
          } 
        });
        this.orderProcesses(this.dataSourceRiskOpinion, this.empTbSortRiskOpinion);
      });
    }
  }

  callComplianceDoubtsCount(){
    if (this.complianceDoubtsCount > 0) {
      this.processService.searchProcessByState('ComplianceEvaluation', 0, this.complianceDoubtsCount).subscribe(resul => {
        this.complianceDoubtsProcessess = resul;
        this.complianceDoubtsProcessess.items.forEach(process => {
          process.startedAt = this.datePipe.transform(process.startedAt, 'dd-MM-yyyy');
  
          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'ComplianceEvaluation') {
            process.state = this.translate.instant('searches.complianceDoubts');
          } 
        });
        this.orderProcesses(this.dataSourceComplianceDoubts, this.empTbSortComplianceDoubts);
      });
    }
  }

  orderProcesses(dataSource: MatTableDataSource<ProcessList>, sorter: MatSort) {
    dataSource.paginator._intl = new MatPaginatorIntl();
    dataSource.paginator._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');

    dataSource.data = this.incompleteProcessess.items;
    dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'merchant.fiscalId': return item.merchant?.fiscalId;

        case 'merchant.name': return item.merchant?.name?.toLocaleLowerCase();

        case 'startedAt': return new Date(item["startedAt"]);

        default: return item[property].toLocaleLowerCase();
      }
    }
    dataSource.sort = sorter;
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

  openProcess(process) {
    this.logger.debug(process);
    localStorage.setItem("processNumber", process.processNumber);
    localStorage.setItem("returned", 'consult');
    this.router.navigate(['/clientbyid']);
  }

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      var a = UserPermissions[this.currentUser.permissions];

      console.log("permissões: ", this.currentUser.permissions);
      console.log("userPermission tratada: ", a);

      this.FTPermissions = getFTPermissions(a);

    });
    this.dataService.reset();
    this.dataService.changeData(new Map());
    this.dataService.updateData(null, null, null);
    this.dataService.changeUpdatedComprovativos(false);
    this.processNrService.changeProcessNumber(null);

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

    console.log("VALORES DO USER ", this.currentUser);
    //this.tokenService.getLoginTokenInfo(this.currentUser.token).then(result => {
    //  console.log('RESULTADO DA CHAMADA AO NOSSO BACKEND PARA OBTER OS DADOS DO TOKEN ', result);
    //});
  }


  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  streamHistoryMenu() {
    this.dataService.historyStream$.next(true);
  }

  ngAfterViewInit() {

    this.dataSourcePendentes.sort = this.empTbSort;

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

}

