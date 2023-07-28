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
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppConfigService } from '../app-config.service';
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
      //this.dataSourcePendentes.paginator = pager;
      this.translate.get('homepage.diaryPerformance').subscribe((translated: string) => {
        pager._intl = new MatPaginatorIntl();
        pager._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');
      });
    }
  }
  @ViewChild('paginatorPageSize') set paginatorPageSize(pager: MatPaginator) {
    if (pager) {
      //this.dataSourceTratamento.paginator = pager;
      this.translate.get('homepage.diaryPerformance').subscribe((translated: string) => {
        pager._intl = new MatPaginatorIntl();
        pager._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');
      });
    }
  }
  @ViewChild('paginatorPageDevolvidos') set paginatorPageDevolvidos(pager: MatPaginator) {
    if (pager) {
      //this.dataSourceDevolvidos.paginator = pager;
      this.translate.get('homepage.diaryPerformance').subscribe((translated: string) => {
        pager._intl = new MatPaginatorIntl();
        pager._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');
      });
    }
  }
  @ViewChild('paginatorPageAceitacao') set paginatorPageAceitacao(pager: MatPaginator) {
    if (pager) {
      //this.dataSourceAceitacao.paginator = pager;
      this.translate.get('homepage.diaryPerformance').subscribe((translated: string) => {
        pager._intl = new MatPaginatorIntl();
        pager._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');
      });
    }
  }
  @ViewChild('paginatorPagePendingSent') set paginatorPagePendingSent(pager: MatPaginator) {
    if (pager) {
      //this.dataSourcePendingSent.paginator = pager;
      this.translate.get('homepage.diaryPerformance').subscribe((translated: string) => {
        pager._intl = new MatPaginatorIntl();
        pager._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');
      });
    }
  }
  @ViewChild('paginatorPagePendingEligibility') set paginatorPagePendingEligibility(pager: MatPaginator) {
    if (pager) {
      //this.dataSourcePendingEligibility.paginator = pager;
      this.translate.get('homepage.diaryPerformance').subscribe((translated: string) => {
        pager._intl = new MatPaginatorIntl();
        pager._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');
      });
    }
  }
  @ViewChild('paginatorPageMultipleClients') set paginatorPageMultipleClients(pager: MatPaginator) {
    if (pager) {
      //this.dataSourceMultipleClients.paginator = pager;
      this.translate.get('homepage.diaryPerformance').subscribe((translated: string) => {
        pager._intl = new MatPaginatorIntl();
        pager._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');
      });
    }
  }
  @ViewChild('paginatorPageDOValidation') set paginatorPageDOValidation(pager: MatPaginator) {
    if (pager) {
      //this.dataSourceDOValidation.paginator = pager;
      this.translate.get('homepage.diaryPerformance').subscribe((translated: string) => {
        pager._intl = new MatPaginatorIntl();
        pager._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');
      });
    }
  }
  @ViewChild('paginatorPageNegotiationAproval') set paginatorPageNegotiationAproval(pager: MatPaginator) {
    if (pager) {
      //this.dataSourceNegotiationAproval.paginator = pager;
      this.translate.get('homepage.diaryPerformance').subscribe((translated: string) => {
        pager._intl = new MatPaginatorIntl();
        pager._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');
      });
    }
  }
  @ViewChild('paginatorPageMCCTreatment') set paginatorPageMCCTreatment(pager: MatPaginator) {
    if (pager) {
      //this.dataSourceMCCTreatment.paginator = pager;
      this.translate.get('homepage.diaryPerformance').subscribe((translated: string) => {
        pager._intl = new MatPaginatorIntl();
        pager._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');
      });
    }
  }
  @ViewChild('paginatorPageValidationSIBS') set paginatorPageValidationSIBS(pager: MatPaginator) {
    if (pager) {
      //this.dataSourceValidationSIBS.paginator = pager;
      this.translate.get('homepage.diaryPerformance').subscribe((translated: string) => {
        pager._intl = new MatPaginatorIntl();
        pager._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');
      });
    }
  }
  @ViewChild('paginatorPageRiskOpinion') set paginatorPageRiskOpinion(pager: MatPaginator) {
    if (pager) {
      //this.dataSourceRiskOpinion.paginator = pager;
      this.translate.get('homepage.diaryPerformance').subscribe((translated: string) => {
        pager._intl = new MatPaginatorIntl();
        pager._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');
      });
    }
  }
  @ViewChild('paginatorPageComplianceDoubts') set paginatorPageComplianceDoubts(pager: MatPaginator) {
    if (pager) {
      //this.dataSourceComplianceDoubts.paginator = pager;
      this.translate.get('homepage.diaryPerformance').subscribe((translated: string) => {
        pager._intl = new MatPaginatorIntl();
        pager._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');
      });
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
  pendingSentProcessess: ProcessGet; //arquivo fisico
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
  contractDigitalIdentificationCount: number;
  contractDigitalAcceptanceCount: number;
  contractTotal: number;
  pendingSentCount: number;
  pendingEligibilityCount: number;
  multipleClientesCount: number;
  DOValidationCount: number;
  negotiationAprovalCount: number;
  MCCTreatmentCount: number;
  validationSIBSCount: number;
  riskOpinionCount: number;
  complianceDoubtsCount: number;

  incompleteOpened: boolean = false;
  ongoingOpened: boolean = false;
  returnedOpened: boolean = false;
  contractAcceptanceOpened: boolean = false;
  pendingSentOpened: boolean = false;
  pendingEligibilityOpened: boolean = false;
  multipleClientesOpened: boolean = false;
  DOValidationOpened: boolean = false;
  negotiationAprovalOpened: boolean = false;
  MCCTreatmentOpened: boolean = false;
  validationSIBSOpened: boolean = false;
  riskOpinionOpened: boolean = false;
  complianceDoubtsOpened: boolean = false;

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
  interval: any;
  baseUrl: string;
  searchedId: string; 

  constructor(private logger: LoggerService, private router: Router,
    changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, private dataService: DataService, private processService: ProcessService,
    private datePipe: DatePipe, private authService: AuthService, private translate: TranslateService, public appComponent: AppComponent, private processNrService: ProcessNumberService, private queueService: QueuesService, private modalService: BsModalService, private tokenService: TokenService, private snackBar: MatSnackBar, private configuration: AppConfigService) {
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
            //user.userName = res.name;
            user.userName = res["ext-display_name"];
            user.bankName = res["ext-bank"];
            user.bankLocation = res["ext-bankLocation"];
            user.authTime = (new Date()).toLocaleString('pt-PT');
            //user.permissions = UserPermissions.UNICRE;
            user.permissions = res["ext-acquiring-profile"];
            user.tenant = res["ext-tenant"];
            var newDate = new Date(res.exp * 1000);
            this.timeout = newDate.getTime() - new Date().getTime();
            this.expirationCounter(this.timeout);
            this.authService.changeUser(user);
            this.router.navigate(['/']);
          }
        });
      }
    } else {
      this.router.navigate(['/']);
    }
    this.baseUrl = configuration.getConfig().acquiringAPIUrl;
    this.mobileQuery = media.matchMedia('(max-width: 850px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    localStorage.clear();
    this.date = this.datePipe.transform(new Date(), 'dd-MM-yyyy');

    this.appComponent.toggleSideNav(true);
    
    this.ngOnInit(); //para obter inicialmente as permissões

    this.callCounter();

    this.interval = setInterval(() => {
      this.callCounter();
    }, 30000);

    if (this.router?.getCurrentNavigation()?.extras?.state) {
      this.queueName = this.router.getCurrentNavigation().extras.state["queueName"];
    }
  }

  callCounter() {
    if (!this.complianceDoubtsOpened && !this.contractAcceptanceOpened && !this.DOValidationOpened && !this.incompleteOpened && !this.MCCTreatmentOpened && !this.multipleClientesOpened && !this.negotiationAprovalOpened && !this.ongoingOpened && !this.pendingEligibilityOpened && !this.pendingSentOpened && !this.returnedOpened && !this.riskOpinionOpened && !this.validationSIBSOpened) {
      //Pendentes de envio
      if (this.FTPermissions?.pending) {
        //this.processService.searchProcessByState('Incomplete', 0, 1).subscribe(result => {
        //  this.logger.info('Pendentes de envio ' + JSON.stringify(result.items));
        //  this.incompleteCount = result.pagination.total;
        //});
        this.processService.searchProcessByState('Incomplete', 0, 10).subscribe(resul => {
          this.logger.info('Search incomplete processes ' + JSON.stringify(resul));
          this.incompleteCount = resul.pagination.total;
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

      //Tratamento BackOffice
      if (this.FTPermissions?.backOffice) {
        this.processService.searchProcessByState('Ongoing', 0, 10).subscribe(resul => {
          this.logger.info('Search ongoing processes ' + JSON.stringify(resul));
          this.ongoingCount = resul.pagination.total;
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

      //Devolvido BackOffice
      if (this.FTPermissions?.returned) {
        //this.processService.searchProcessByState('Returned', 0, 1).subscribe(result => {
        //  this.logger.info('Devolvidos BackOffice ' + JSON.stringify(result.items));
        //  this.returnedCount = result.pagination.total;
        //});
        this.processService.searchProcessByState('Returned', 0, 10).subscribe(resul => {
          this.logger.info('Search returned processes ' + JSON.stringify(resul));
          this.returnedCount = resul.pagination.total;
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

      //Pendentes de Aceitação
      if (this.FTPermissions?.acceptance) {
        let promise = new Promise((resolve, reject) => {
          this.processService.searchProcessByState('ContractAcceptance', 0, 10).subscribe(resul => {
            this.logger.info('Search contract acceptance processes ' + JSON.stringify(resul));
            this.contractAcceptanceCount = resul.pagination.total;
            this.contractAcceptanceProcessess = resul;
            if (this.contractAcceptanceProcessess.items.length > 0) {
              this.contractAcceptanceProcessess.items.forEach(process => {
                process.startedAt = this.datePipe.transform(process.startedAt, 'dd-MM-yyyy').toString();
                // mapear os estados para aparecer em PT ou EN
                if (process.state === 'ContractAcceptance') {
                  process.state = this.translate.instant('searches.contractAcceptance')
                }
              });
            }
            resolve(null);
          });
        }).finally(() => {
          this.processService.searchProcessByState('ContractDigitalAcceptance', 0, 10).subscribe(resul => {
            this.logger.info('Search contract acceptance processes ' + JSON.stringify(resul));
            this.contractDigitalAcceptanceCount = resul.pagination.total;
            var contractAcceptanceProcessess = resul;
            contractAcceptanceProcessess.items.forEach(process => {
              process.startedAt = this.datePipe.transform(process.startedAt, 'dd-MM-yyyy').toString();
              // mapear os estados para aparecer em PT ou EN
              if (process.state === 'ContractDigitalAcceptance') {
                process.state = this.translate.instant('searches.contractDigitalAcceptance')
              }
            });
            this.contractAcceptanceProcessess.items.push(...contractAcceptanceProcessess.items);

            this.processService.searchProcessByState('DigitalIdentification', 0, 10).subscribe(res => {
              this.logger.info('Search contract acceptance processes ' + JSON.stringify(res));
              this.contractDigitalIdentificationCount = res.pagination.total;
              this.contractTotal = this.contractAcceptanceCount + this.contractDigitalAcceptanceCount + this.contractDigitalIdentificationCount;
              var contractAcceptanceProcessess = res;
              contractAcceptanceProcessess.items.forEach(process => {
                process.startedAt = this.datePipe.transform(process.startedAt, 'dd-MM-yyyy').toString();
                // mapear os estados para aparecer em PT ou EN
                if (process.state === 'DigitalIdentification') {
                  process.state = this.translate.instant('searches.digitalIdentification')
                }
              });
              this.contractAcceptanceProcessess.items.push(...contractAcceptanceProcessess.items); // entrou aqui
              this.orderProcesses(this.dataSourceAceitacao, this.empTbSortAceitacao, this.contractAcceptanceProcessess);
            });
          });
        });

      }

      //Arquivo Fisico
      if (this.FTPermissions?.pendingSent) {
        //this.processService.searchProcessByState('AwaitingCompletion', 0, 1).subscribe(result => {
        //  this.logger.info('Completos ' + JSON.stringify(result));
        //  this.pendingSentCount = result.pagination.total;
        //});
        this.processService.searchProcessByState('AwaitingCompletion', 0, 10).subscribe(resul => {
          this.logger.info('Search awaiting completion processes ' + JSON.stringify(resul));
          this.pendingSentCount = resul.pagination.total;
          this.pendingSentProcessess = resul;
          this.pendingSentProcessess.items.forEach(process => {
            process.startedAt = this.datePipe.transform(process.startedAt, 'dd-MM-yyyy').toString();

            // mapear os estados para aparecer em PT ou EN
            if (process.state === 'AwaitingCompletion') {
              process.state = this.translate.instant('searches.awaitingCompletion');
            }
          });
          this.orderProcesses(this.dataSourcePendingSent, this.empTbSortPendingSent, this.pendingSentProcessess);
        });
      }

      //Pareceres de Eligibilidade
      if (this.FTPermissions?.pendingEligibility) {
        //this.processService.searchProcessByState('EligibilityAssessment', 0, 1).subscribe(result => {
        //  this.logger.info('EligibilityAssessment ' + JSON.stringify(result));
        //  this.pendingEligibilityCount = result.pagination.total;
        //});
        this.processService.searchProcessByState('EligibilityAssessment', 0, 10).subscribe(resul => {
          this.logger.info('Search eligibility assessment processes ' + JSON.stringify(resul));
          this.pendingEligibilityCount = resul.pagination.total;
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

      //Múltiplos Clientes
      if (this.FTPermissions?.multipleClientes) {
        //this.processService.searchProcessByState('ClientChoice', 0, 1).subscribe(result => {
        //  this.logger.info('ClientChoice ' + JSON.stringify(result));
        //  this.multipleClientesCount = result.pagination.total;
        //});
        this.processService.searchProcessByState('ClientChoice', 0, 10).subscribe(resul => {
          this.logger.info('Search client choice processes ' + JSON.stringify(resul));
          this.multipleClientesCount = resul.pagination.total;
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

      //Valida DO
      if (this.FTPermissions?.DOValidation) {
        //this.processService.searchProcessByState('OperationsEvaluation', 0, 1).subscribe(result => {
        //  this.logger.info('OperationsEvaluation ' + JSON.stringify(result));
        //  this.DOValidationCount = result.pagination.total;
        //});
        this.processService.searchProcessByState('OperationsEvaluation', 0, 10).subscribe(resul => {
          this.logger.info('Search operations evaluation processes ' + JSON.stringify(resul));
          this.DOValidationCount = resul.pagination.total;
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

      //Aprovação de Negociação
      if (this.FTPermissions?.negotiationAproval) {
        //this.processService.searchProcessByState('NegotiationApproval', 0, 1).subscribe(result => {
        //  this.logger.info('NegotiationApproval ' + JSON.stringify(result));
        //  this.negotiationAprovalCount = result.pagination.total;
        //});
        this.processService.searchProcessByState('NegotiationApproval', 0, 10).subscribe(resul => {
          this.logger.info('Search negotiation approval processes ' + JSON.stringify(resul));
          this.negotiationAprovalCount = resul.pagination.total;
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

      //MCC
      if (this.FTPermissions?.MCCTreatment) {
        //this.processService.searchProcessByState('StandardIndustryClassificationChoice', 0, 1).subscribe(result => {
        //  this.logger.info('StandardIndustryClassificationChoice ' + JSON.stringify(result));
        //  this.MCCTreatmentCount = result.pagination.total;
        //});
        this.processService.searchProcessByState('StandardIndustryClassificationChoice', 0, 10).subscribe(resul => {
          this.logger.info('Search standard industry classification choice processes ' + JSON.stringify(resul));
          this.MCCTreatmentCount = resul.pagination.total;
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

      if (this.FTPermissions?.validationSIBS) { //Validação SIBS
        //this.processService.searchProcessByState('MerchantRegistration', 0, 1).subscribe(result => {
        //  this.logger.info('MerchantRegistration ' + JSON.stringify(result));
        //  this.validationSIBSCount = result.pagination.total;
        //});
        this.processService.searchProcessByState('MerchantRegistration', 0, 10).subscribe(resul => {
          this.logger.info('Search merchant registration processes ' + JSON.stringify(resul));
          this.validationSIBSCount = resul.pagination.total;
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

      //Parecer de Risco
      if (this.FTPermissions?.riskOpinion) {
        //this.processService.searchProcessByState('RiskAssessment', 0, 1).subscribe(result => {
        //  this.logger.info('RiskAssessment ' + JSON.stringify(result));
        //  this.riskOpinionCount = result.pagination.total;
        //});
        this.processService.searchProcessByState('RiskAssessment', 0, 10).subscribe(resul => {
          this.logger.info('Search risk assessment processes ' + JSON.stringify(resul));
          this.riskOpinionCount = resul.pagination.total;
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

      //Dúvidas Compliance
      if (this.FTPermissions?.complianceDoubts) {
        //this.processService.searchProcessByState('ComplianceEvaluation', 0, 1).subscribe(result => {
        //  this.logger.info('ComplianceEvaluation ' + JSON.stringify(result));
        //  this.complianceDoubtsCount = result.pagination.total;
        //});
        this.processService.searchProcessByState('ComplianceEvaluation', 0, 10).subscribe(resul => {
          this.logger.info('Search compliance evaluation processes ' + JSON.stringify(resul));
          this.complianceDoubtsCount = resul.pagination.total;
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
  }

  callIncompleteCount() {
    if (this.incompleteCount > 0 && !this.incompleteOpened) {
      this.resetOpened();
      this.incompleteOpened = true;
      //this.processService.searchProcessByState('Incomplete', 0, 10).subscribe(resul => {
      //  this.logger.info('Search incomplete processes ' + JSON.stringify(resul));
      //  this.incompleteProcessess = resul;
      //  this.incompleteProcessess.items.forEach(process => {
      //    process.startedAt = this.datePipe.transform(process.startedAt, 'dd-MM-yyyy').toString();
      //    // mapear os estados para aparecer em PT ou EN
      //    if (process.state === 'Incomplete') {
      //      process.state = this.translate.instant('searches.incompleted');
      //    }
      //  });
      //  this.orderProcesses(this.dataSourcePendentes, this.empTbSort, this.incompleteProcessess);
      //});
    } else {
      this.incompleteOpened = false;
    }
  }

  callBackOfficeCount() {
    if (this.ongoingCount > 0 && !this.ongoingOpened) {
      this.resetOpened();
      this.ongoingOpened = true;

    } else {
      this.ongoingOpened = false;
    }
  }

  callReturnedCount() {
    if (this.returnedCount > 0 && !this.returnedOpened) {
      this.resetOpened();
      this.returnedOpened = true;
      
    } else {
      this.returnedOpened = false;
    }
  }

  callAcceptanceCount() {
    if (this.contractAcceptanceCount + this.contractDigitalAcceptanceCount + this.contractDigitalIdentificationCount > 0 && !this.contractAcceptanceOpened) {
      this.resetOpened();
      this.contractAcceptanceOpened = true;

      
    } else {
      this.contractAcceptanceOpened = false;
    }
  }

  callPendingSentCount() {
    if (this.pendingSentCount > 0 && !this.pendingSentOpened) {
      this.resetOpened();
      this.pendingSentOpened = true;

    } else {
      this.pendingSentOpened = false;
    }
  }

  callPendingEligibilityCount() {
    if (this.pendingEligibilityCount > 0 && !this.pendingEligibilityOpened) {
      this.resetOpened();
      this.pendingEligibilityOpened = true;
      
    } else {
      this.pendingEligibilityOpened = false;
    }
  }

  callMultipleClientsCount() {
    if (this.multipleClientesCount > 0 && !this.multipleClientesOpened) {
      this.resetOpened();
      this.multipleClientesOpened = true;

    } else {
      this.multipleClientesOpened = false;
    }
  }

  callDOValidationCount() {
    if (this.DOValidationCount > 0 && !this.DOValidationOpened) {
      this.resetOpened();
      this.DOValidationOpened = true;

    } else {
      this.DOValidationOpened = false;
    }
  }

  callNegotiationApprovalCount() {
    if (this.negotiationAprovalCount > 0 && !this.negotiationAprovalOpened) {
      this.resetOpened();
      this.negotiationAprovalOpened = true;

    } else {
      this.negotiationAprovalOpened = false;
    }
  }

  callMCCTreatmentCount() {
    if (this.MCCTreatmentCount > 0 && !this.MCCTreatmentOpened) {
      this.resetOpened();
      this.MCCTreatmentOpened = true;

    } else {
      this.MCCTreatmentOpened = false;
    }
  }

  callValidationSIBSCount() {
    if (this.validationSIBSCount > 0 && !this.validationSIBSOpened) {
      this.resetOpened();
      this.validationSIBSOpened = true;

    } else {
      this.validationSIBSOpened = false;
    }
  }

  callRiskOpinionCount() {
    if (this.riskOpinionCount > 0 && !this.riskOpinionOpened) {
      this.resetOpened();
      this.riskOpinionOpened = true;

    } else {
      this.riskOpinionOpened = false;
    }
  }

  callComplianceDoubtsCount() {
    if (this.complianceDoubtsCount > 0 && !this.complianceDoubtsOpened) {
      this.resetOpened();
      this.complianceDoubtsOpened = true;
      
    } else {
      this.complianceDoubtsOpened = false;
    }
  }

  orderProcesses(dataSource: MatTableDataSource<ProcessList>, sorter: MatSort, list: ProcessGet) {
    //dataSource.paginator._intl = new MatPaginatorIntl();
    //dataSource.paginator._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');
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

  FTSearch(queue: string, processId: string, edit: boolean = true) {
    this.processToAssign = processId;
    this.queue = queue;
    if (edit) {
      this.username = this.authService.GetCurrentUser().userName;
      this.queueService.getActiveWorkQueue(processId).then(result => {
        this.workQueue = result.result;
        if (result.result.lockedBy != null && result.result.lockedBy != "") {
          if (result.result.status != "InProgress") {
            if (result.result.status == "UnLocked" || result.result.status == "Locked") {
              if (result.result.lockedBy.trim() != this.authService.GetCurrentUser().userName.trim()) {
                this.existsUser = true;
                this.userModalRef = this.modalService.show(this.userModal, { class: 'modal-lg' });
              } else {
                let navigationExtras: NavigationExtras = {
                  state: {
                    queueName: this.queue,
                    processId: this.processToAssign
                  }
                };
                var reassignWorkQueue: ReassingWorkQueue = {};
                reassignWorkQueue.jobId = this.workQueue.id;
                reassignWorkQueue.username = this.username;
                reassignWorkQueue.onHold = false;
                if (result.result.status == "UnLocked")
                  reassignWorkQueue.forceReassign = false;
                if (result.result.status == "Locked")
                  reassignWorkQueue.forceReassign = true;
                this.queueService.postReassignWorkQueue(this.processToAssign, reassignWorkQueue).then(res => {
                  this.processNrService.changeProcessId(this.processToAssign);
                  this.processNrService.changeQueueName(this.queue);
                  this.processToAssign = "";
                  this.jobId = 0;
                  this.queue = "";
                  this.logger.info('Redirecting to Queues Detail page');
                  this.router.navigate(["/queues-detail"], navigationExtras);
                });
              }
            }
          } else {
            if (result.result.lockedBy.trim() == this.authService.GetCurrentUser().userName.trim()) {
              let navigationExtras: NavigationExtras = {
                state: {
                  queueName: this.queue,
                  processId: this.processToAssign
                }
              };
              this.logger.info('Redirecting to Queues Detail page');
              this.router.navigate(["/queues-detail"], navigationExtras);
            } else {
              this.snackBar.open(this.translate.instant('queues.processInProgress') + ' ' + result.result.lockedBy.trim(), '', {
                duration: 4000,
                panelClass: ['snack-bar']
              });
            }
          }
        } else {
          this.existsUser = false;
          this.userModalRef = this.modalService.show(this.userModal, { class: 'modal-lg' });
        }
      }, error => {
        this.logger.error(error, "Error while searching for active work queue");
      });
    } else {
      this.processNrService.changeEdit(false);
      let navigationExtras: NavigationExtras = {
        state: {
          queueName: this.queue,
          processId: this.processToAssign
        }
      };
      this.logger.info('Redirecting to Queues Detail page');
      this.router.navigate(["/queues-detail"], navigationExtras);
    }
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
    this.processNrService.changeProcessId(process.processId);
    this.processNrService.changeQueueName("history");
    this.logger.info("Redirecting to History page");
    this.router.navigate(['/app-history', process.processId]);
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
    reassignWorkQueue.jobId = this.workQueue.id;
    reassignWorkQueue.username = this.username;
    reassignWorkQueue.onHold = false;
    if (this.workQueue.status == "UnLocked")
      reassignWorkQueue.forceReassign = false;
    if (this.workQueue.status == "Locked")
      reassignWorkQueue.forceReassign = true;
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
      this.queueService.markToCancel(this.processToDelete, this.authService.GetCurrentUser().userName).then(res => {
        if (this.pendingEligibilityProcessess != null) {
          var index = this.pendingEligibilityProcessess.items.findIndex(process => process.processId == this.processToDelete);
          this.pendingEligibilityProcessess.items.splice(index, 1);
          this.orderProcesses(this.dataSourcePendingEligibility, this.empTbSortPendingEligibility, this.pendingEligibilityProcessess);
        }
        if (this.returnedProcessess != null) {
          var index = this.returnedProcessess.items.findIndex(process => process.processId == this.processToDelete);
          this.returnedProcessess.items.splice(index, 1);
          this.orderProcesses(this.dataSourceDevolvidos, this.empTbSortDevolvidos, this.returnedProcessess);
        }
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
          contractDigitalAcceptanceResult: 'Cancel',
          submissionUser: this.authService.GetCurrentUser().userName
        };
      }
      if (this.processQueueToDelete["tenantState"] == "ContractAcceptance") {
        state = State.CONTRACT_ACCEPTANCE;
        queueModel = {
          $type: "ContractAcceptanceModel",
          contractAcceptanceResult: 'Cancel',
          submissionUser: this.authService.GetCurrentUser().userName
        };
      }
      if (this.processQueueToDelete["tenantState"] == "DigitalIdentification") {
        state = State.DIGITAL_IDENTIFICATION;
        queueModel = {
          $type: "DigitalIdentification",
          digitalIdentificationResult: 'Cancel',
          submissionUser: this.authService.GetCurrentUser().userName
        };
      }
      this.queueService.postExternalState(this.processQueueToDelete.processId, state, queueModel).then(result => {
        var index = this.contractAcceptanceProcessess.items.findIndex(value => value.processId == this.processQueueToDelete.processId);
        this.contractAcceptanceProcessess.items.splice(index, 1);
        this.orderProcesses(this.dataSourceAceitacao, this.empTbSortAceitacao, this.contractAcceptanceProcessess);
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
    this.dataService.changeContinent("EUROPA");
    this.dataService.changeMerchant(false);
    this.dataService.changeStakeholders(false);
    this.dataService.changeShops(false);
    this.dataService.changeEquips(false);
    this.dataService.updateStakeMap(new Map());
    this.dataService.changeSignType(true);
    this.processNrService.changeProcessNumber(null);
    this.processNrService.changeProcessId(null);
    this.processNrService.changeQueueName(null);
    this.processNrService.changeObservation('');
    this.processNrService.changeMerchant('');
    this.processNrService.changeList([]);
    this.processNrService.changeEdit(true);
    this.processNrService.changeHasChange(false);
    localStorage.removeItem("documents");

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
    if (this.interval)
      clearInterval(this.interval);
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
    this.searchProcess(filterValue, this.incompleteProcessess, this.dataSourcePendentes, 'Incomplete');
  }

  applyFilter1(filterValue: string) {
    this.dataSourceTratamento.filter = filterValue;
    this.searchProcess(filterValue, this.ongoingProcessess, this.dataSourceTratamento, 'Ongoing');
  }

  applyFilterDevolvidos(filterValue: string) {
    this.dataSourceDevolvidos.filter = filterValue;
    this.searchProcess(filterValue, this.returnedProcessess, this.dataSourceDevolvidos, 'Returned');
  }

  applyFilterAceitacao(filterValue: string) {
    this.dataSourceAceitacao.filter = filterValue;
    var found = this.contractAcceptanceProcessess.items.find(p => p.processNumber == filterValue);
    if (found == undefined) {
      if (filterValue.length == 18) {
        let url = this.baseUrl + 'process?state=ContractAcceptance&number=' + filterValue;
        this.processService.advancedSearch(url, 0, 1).subscribe(result => {
          if (result.items.length > 0) {
            var found = this.contractAcceptanceProcessess.items.find(p => p.processId == result.items[0].processId);
            if (found == undefined) {
              this.searchedId = filterValue;
              //data e estado corretamente formatados
              this.contractAcceptanceProcessess.items.push(...result.items);
              this.dataSourceAceitacao.data = this.contractAcceptanceProcessess.items;
            }
          } else {
            url = this.baseUrl + 'process?state=ContractDigitalAcceptance&number=' + filterValue;
            this.processService.advancedSearch(url, 0, 1).subscribe(res => {
              if (res.items.length > 0) {
                var found = this.contractAcceptanceProcessess.items.find(p => p.processId == res.items[0].processId);
                if (found == undefined) {
                  this.searchedId = filterValue;
                  //data e estado corretamente formatados
                  this.contractAcceptanceProcessess.items.push(...res.items);
                  this.dataSourceAceitacao.data = this.contractAcceptanceProcessess.items;
                }
              } else {
                url = this.baseUrl + 'process?state=DigitalIdentification&number=' + filterValue;
                this.processService.advancedSearch(url, 0, 1).subscribe(r => {
                  if (r.items.length > 0) {
                    var found = this.contractAcceptanceProcessess.items.find(p => p.processId == r.items[0].processId);
                    if (found == undefined) {
                      this.searchedId = filterValue;
                      //data e estado corretamente formatados
                      this.contractAcceptanceProcessess.items.push(...r.items);
                      this.dataSourceAceitacao.data = this.contractAcceptanceProcessess.items;
                    }
                  }
                });
              }
            });
          }
        });
      } else {
        if (this.searchedId != null && this.searchedId != "") {
          var index = this.contractAcceptanceProcessess.items.findIndex(p => p.processNumber == this.searchedId);
          if (index != -1) {
            this.contractAcceptanceProcessess.items.splice(index, 1);
            this.dataSourcePendentes.data = this.contractAcceptanceProcessess.items;
            this.searchedId = "";
          }
        }
      }
    }
  }

  applyFilterPendingSent(filterValue: string) {
    this.dataSourcePendingSent.filter = filterValue;
    this.searchProcess(filterValue, this.pendingSentProcessess, this.dataSourcePendingSent, 'AwaitingCompletion');
  }

  applyFilterPendingEligibility(filterValue: string) {
    this.dataSourcePendingEligibility.filter = filterValue;
    this.searchProcess(filterValue, this.pendingEligibilityProcessess, this.dataSourcePendingEligibility, 'EligibilityAssessment');
  }

  applyFilterMultipleClients(filterValue: string) {
    this.dataSourceMultipleClients.filter = filterValue;
    this.searchProcess(filterValue, this.multipleClientesProcessess, this.dataSourceMultipleClients, 'ClientChoice');
  }

  applyFilterDOValidation(filterValue: string) {
    this.dataSourceDOValidation.filter = filterValue;
    this.searchProcess(filterValue, this.DOValidationProcessess, this.dataSourceDOValidation, 'OperationsEvaluation');
  }

  applyFilterNegotiationAproval(filterValue: string) {
    this.dataSourceNegotiationAproval.filter = filterValue;
    this.searchProcess(filterValue, this.negotiationAprovalProcessess, this.dataSourceNegotiationAproval, 'NegotiationApproval');
  }

  applyFilterMCCTreatment(filterValue: string) {
    this.dataSourceMCCTreatment.filter = filterValue;
    this.searchProcess(filterValue, this.MCCTreatmentProcessess, this.dataSourceMCCTreatment, 'StandardIndustryClassificationChoice');
  }

  applyFilterValidationSIBS(filterValue: string) {
    this.dataSourceValidationSIBS.filter = filterValue;
    this.searchProcess(filterValue, this.validationSIBSProcessess, this.dataSourceValidationSIBS, 'MerchantRegistration');
  }

  applyFilterRiskOpinion(filterValue: string) {
    this.dataSourceRiskOpinion.filter = filterValue;
    this.searchProcess(filterValue, this.riskOpinionProcessess, this.dataSourceRiskOpinion, 'RiskAssessment');
  }

  applyFilterComplianceDoubts(filterValue: string) {
    this.dataSourceComplianceDoubts.filter = filterValue;
    this.searchProcess(filterValue, this.complianceDoubtsProcessess, this.dataSourceComplianceDoubts, 'ComplianceEvaluation');
  }

  changePage(event) {
    var currentPageIdx = event.pageIndex;
    var currentPageSize = event.pageSize;
    var to = currentPageIdx * currentPageSize;

    if (this.incompleteOpened) {
      this.processService.searchProcessByState('Incomplete', to, currentPageSize).subscribe(resul => {
          this.logger.info('Search incomplete processes ' + JSON.stringify(resul));
          this.incompleteProcessess.items = [];
          this.incompleteProcessess.items.push(...resul.items);
          this.incompleteProcessess.pagination = resul.pagination;
          this.incompleteProcessess.items.forEach(process => {
            process.startedAt = this.datePipe.transform(process.startedAt, 'dd-MM-yyyy').toString();
            // mapear os estados para aparecer em PT ou EN
            if (process.state === 'Incomplete') {
              process.state = this.translate.instant('searches.incompleted');
            }
          });
          this.orderProcesses(this.dataSourcePendentes, this.empTbSort, this.incompleteProcessess);
        });
    } else if (this.ongoingOpened) {
      this.processService.searchProcessByState('Ongoing', to, currentPageSize).subscribe(resul => {
        this.logger.info('Search ongoing processes ' + JSON.stringify(resul));
        this.ongoingProcessess.items = [];
        this.ongoingProcessess.items.push(...resul.items);
        this.ongoingProcessess.pagination = resul.pagination;
        this.ongoingProcessess.items.forEach(process => {
          process.startedAt = this.datePipe.transform(process.startedAt, 'dd-MM-yyyy').toString();
          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'Ongoing') {
            process.state = this.translate.instant('searches.running');
          }
        });
        this.orderProcesses(this.dataSourceTratamento, this.empTbSortWithObject, this.ongoingProcessess);
      });
    } else if (this.returnedOpened) {
      this.processService.searchProcessByState('Returned', to, currentPageSize).subscribe(resul => {
        this.logger.info('Search returned processes ' + JSON.stringify(resul));
        this.returnedProcessess.items = [];
        this.returnedProcessess.items.push(...resul.items);
        this.returnedProcessess.pagination = resul.pagination;
        this.returnedProcessess.items.forEach(process => {
          process.startedAt = this.datePipe.transform(process.startedAt, 'dd-MM-yyyy').toString();

          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'Returned') {
            process.state = this.translate.instant('searches.returned');
          }
        });
        this.orderProcesses(this.dataSourceDevolvidos, this.empTbSortDevolvidos, this.returnedProcessess);
      });
    } else if (this.contractAcceptanceOpened) {
      let promise = new Promise((resolve, reject) => {
        this.processService.searchProcessByState('ContractAcceptance', to, currentPageSize).subscribe(resul => {
          this.logger.info('Search contract acceptance processes ' + JSON.stringify(resul));
          this.contractAcceptanceProcessess.items = [];
          this.contractAcceptanceProcessess.items.push(...resul.items);
          this.contractAcceptanceProcessess.pagination = resul.pagination;
          if (this.contractAcceptanceProcessess.items.length > 0) {
            this.contractAcceptanceProcessess.items.forEach(process => {
              process.startedAt = this.datePipe.transform(process.startedAt, 'dd-MM-yyyy').toString();
              // mapear os estados para aparecer em PT ou EN
              if (process.state === 'ContractAcceptance') {
                process.state = this.translate.instant('searches.contractAcceptance')
              }
            });
          }
          resolve(null);
        });
      }).finally(() => {
        this.processService.searchProcessByState('ContractDigitalAcceptance', to, currentPageSize).subscribe(resul => {
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

        this.processService.searchProcessByState('DigitalIdentification', to, currentPageSize).subscribe(resul => {
          this.logger.info('Search contract acceptance processes ' + JSON.stringify(resul));
          var contractAcceptanceProcessess = resul;
          contractAcceptanceProcessess.items.forEach(process => {
            process.startedAt = this.datePipe.transform(process.startedAt, 'dd-MM-yyyy').toString();
            // mapear os estados para aparecer em PT ou EN
            if (process.state === 'DigitalIdentification') {
              process.state = this.translate.instant('searches.digitalIdentification')
            }
          });
          this.contractAcceptanceProcessess.items.push(...contractAcceptanceProcessess.items); // entrou aqui
          this.orderProcesses(this.dataSourceAceitacao, this.empTbSortAceitacao, this.contractAcceptanceProcessess);
        });
      });
    } else if (this.pendingSentOpened) {
      this.processService.searchProcessByState('AwaitingCompletion', to, currentPageSize).subscribe(resul => {
        this.logger.info('Search awaiting completion processes ' + JSON.stringify(resul));
        this.pendingSentProcessess.items = [];
        this.pendingSentProcessess.items.push(...resul.items);
        this.pendingSentProcessess.pagination = resul.pagination;
        this.pendingSentProcessess.items.forEach(process => {
          process.startedAt = this.datePipe.transform(process.startedAt, 'dd-MM-yyyy').toString();
          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'AwaitingCompletion') {
            process.state = this.translate.instant('searches.awaitingCompletion');
          }
        });
        this.orderProcesses(this.dataSourcePendingSent, this.empTbSortPendingSent, this.pendingSentProcessess);
      });
    } else if (this.pendingEligibilityOpened) {
      this.processService.searchProcessByState('EligibilityAssessment', to, currentPageSize).subscribe(resul => {
        this.logger.info('Search eligibility assessment processes ' + JSON.stringify(resul));
        this.pendingEligibilityProcessess.items = [];
        this.pendingEligibilityProcessess.items.push(...resul.items);
        this.pendingEligibilityProcessess.pagination = resul.pagination;
        this.pendingEligibilityProcessess.items.forEach(process => {
          process.startedAt = this.datePipe.transform(process.startedAt, 'dd-MM-yyyy').toString();

          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'EligibilityAssessment') {
            process.state = this.translate.instant('searches.eligibility');
          }
        });
        this.orderProcesses(this.dataSourcePendingEligibility, this.empTbSortPendingEligibility, this.pendingEligibilityProcessess);
      });
    } else if (this.multipleClientesOpened) {
      this.processService.searchProcessByState('ClientChoice', to, currentPageSize).subscribe(resul => {
        this.logger.info('Search client choice processes ' + JSON.stringify(resul));
        this.multipleClientesProcessess.items = [];
        this.multipleClientesProcessess.items.push(...resul.items);
        this.multipleClientesProcessess.pagination = resul.pagination;
        this.multipleClientesProcessess.items.forEach(process => {
            process.startedAt = this.datePipe.transform(process.startedAt, 'dd-MM-yyyy').toString();
          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'ClientChoice') {
            process.state = this.translate.instant('searches.multipleClients');
          }
        });
        this.orderProcesses(this.dataSourceMultipleClients, this.empTbSortMultipleClients, this.multipleClientesProcessess);
      });
    } else if (this.DOValidationOpened) {
      this.processService.searchProcessByState('OperationsEvaluation', to, currentPageSize).subscribe(resul => {
        this.logger.info('Search operations evaluation processes ' + JSON.stringify(resul));
        this.DOValidationProcessess.items = [];
        this.DOValidationProcessess.items.push(...resul.items);
        this.DOValidationProcessess.pagination = resul.pagination;
        
        this.DOValidationProcessess.items.forEach(process => {
            process.startedAt = this.datePipe.transform(process.startedAt, 'dd-MM-yyyy').toString();

          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'OperationsEvaluation') {
            process.state = this.translate.instant('searches.DOValidation');
          }
        });
        this.orderProcesses(this.dataSourceDOValidation, this.empTbSortDOValidation, this.DOValidationProcessess);
      });
    } else if (this.negotiationAprovalOpened) {
      this.processService.searchProcessByState('NegotiationApproval', to, currentPageSize).subscribe(resul => {
        this.logger.info('Search negotiation approval processes ' + JSON.stringify(resul));
        this.negotiationAprovalProcessess.items = [];
        this.negotiationAprovalProcessess.items.push(...resul.items);
        this.negotiationAprovalProcessess.pagination = resul.pagination;
        this.negotiationAprovalProcessess.items.forEach(process => {
          process.startedAt = this.datePipe.transform(process.startedAt, 'dd-MM-yyyy').toString();
          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'NegotiationApproval') {
            process.state = this.translate.instant('searches.negotiationApproval');
          }
        });
        this.orderProcesses(this.dataSourceNegotiationAproval, this.empTbSortNegotiationAproval, this.negotiationAprovalProcessess);
      });
    } else if (this.MCCTreatmentOpened) {
      this.processService.searchProcessByState('StandardIndustryClassificationChoice', to, currentPageSize).subscribe(resul => {
        this.logger.info('Search standard industry classification choice processes ' + JSON.stringify(resul));
        this.MCCTreatmentProcessess.items = [];
        this.MCCTreatmentProcessess.items.push(...resul.items);
        this.MCCTreatmentProcessess.pagination = resul.pagination;
        this.MCCTreatmentProcessess.items.forEach(process => {
          process.startedAt = this.datePipe.transform(process.startedAt, 'dd-MM-yyyy').toString();
          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'StandardIndustryClassificationChoice') {
            process.state = this.translate.instant('searches.MCCTreatment');
          }
        });
        this.orderProcesses(this.dataSourceMCCTreatment, this.empTbSortMCCTreatment, this.MCCTreatmentProcessess);
      });
    } else if (this.validationSIBSOpened) {
      this.processService.searchProcessByState('MerchantRegistration', to, currentPageSize).subscribe(resul => {
        this.logger.info('Search merchant registration processes ' + JSON.stringify(resul));
        this.validationSIBSProcessess.items = [];
        this.validationSIBSProcessess.items.push(...resul.items);
        this.validationSIBSProcessess.pagination = resul.pagination;
        this.validationSIBSProcessess.items.forEach(process => {
          process.startedAt = this.datePipe.transform(process.startedAt, 'dd-MM-yyyy').toString();
          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'MerchantRegistration') {
            process.state = this.translate.instant('searches.validationSIBS');
          }
        });
        this.orderProcesses(this.dataSourceValidationSIBS, this.empTbSortValidationSIBS, this.validationSIBSProcessess);
      });
    } else if (this.riskOpinionOpened) {
      this.processService.searchProcessByState('RiskAssessment', to, currentPageSize).subscribe(resul => {
        this.logger.info('Search risk assessment processes ' + JSON.stringify(resul));
        this.riskOpinionProcessess.items.push(...resul.items);
        this.riskOpinionProcessess.pagination = resul.pagination;
        this.riskOpinionProcessess.items.forEach(process => {
          process.startedAt = this.datePipe.transform(process.startedAt, 'dd-MM-yyyy').toString();
          // mapear os estados para aparecer em PT ou EN
          if (process.state === 'RiskAssessment') {
            process.state = this.translate.instant('searches.riskOpinion');
          }
        });
        this.orderProcesses(this.dataSourceRiskOpinion, this.empTbSortRiskOpinion, this.riskOpinionProcessess);
      });
    } else if (this.complianceDoubtsOpened) {
      this.processService.searchProcessByState('ComplianceEvaluation', to, currentPageSize).subscribe(resul => {
        this.logger.info('Search compliance evaluation processes ' + JSON.stringify(resul));
        this.complianceDoubtsProcessess.items.push(...resul.items);
        this.complianceDoubtsProcessess.pagination = resul.pagination;
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

  searchProcess(filterValue: string, processes: ProcessGet, dataSource: MatTableDataSource<ProcessList>, state: string) {
    var found = processes.items.find(p => p.processNumber == filterValue);
    if (found == undefined) {
      if (filterValue.length == 18) {
        let url = this.baseUrl + 'process?state=' + state + '&number=' + filterValue;
        this.processService.advancedSearch(url, 0, 1).subscribe(result => {
          if (result.items.length > 0) {
            var found = processes.items.find(p => p.processId == result.items[0].processId);
            if (found == undefined) {
              this.searchedId = filterValue;
              //data e estado corretamente formatados
              result.items.forEach(process => {
                process.startedAt = this.datePipe.transform(process.startedAt, 'dd-MM-yyyy').toString();
                if (process.state === 'ClientChoice') {
                  process.state = this.translate.instant('searches.multipleClients');
                }
                if (process.state === 'Incomplete') {
                  process.state = this.translate.instant('searches.incompleted');
                }
                if (process.state === 'Ongoing') {
                  process.state = this.translate.instant('searches.running');
                }
                if (process.state === 'Returned') {
                  process.state = this.translate.instant('searches.returned');
                }
                if (process.state === 'ContractAcceptance') {
                  process.state = this.translate.instant('searches.contractAcceptance')
                }
                if (process.state === 'AwaitingCompletion') {
                  process.state = this.translate.instant('searches.awaitingCompletion');
                }
                if (process.state === 'EligibilityAssessment') {
                  process.state = this.translate.instant('searches.eligibility');
                }
                if (process.state === 'OperationsEvaluation') {
                  process.state = this.translate.instant('searches.DOValidation');
                }
                if (process.state === 'NegotiationApproval') {
                  process.state = this.translate.instant('searches.negotiationApproval');
                }
                if (process.state === 'StandardIndustryClassificationChoice') {
                  process.state = this.translate.instant('searches.MCCTreatment');
                }
                if (process.state === 'MerchantRegistration') {
                  process.state = this.translate.instant('searches.validationSIBS');
                }
                if (process.state === 'RiskAssessment') {
                  process.state = this.translate.instant('searches.riskOpinion');
                }
                if (process.state === 'ComplianceEvaluation') {
                  process.state = this.translate.instant('searches.complianceDoubts');
                }
              });
              processes.items.push(...result.items);
              dataSource.data = processes.items;
            }
          }
        });
      } else {
        if (this.searchedId != null && this.searchedId != "") {
          var index = processes.items.findIndex(p => p.processNumber == this.searchedId);
          if (index != -1) {
            processes.items.splice(index, 1);
            dataSource.data = processes.items;
            this.searchedId = "";
          }
        }
      }
    }
  }

  closeDeleteModal() {
    this.deleteModalRef?.hide();
  }

  closeUserModal() {
    this.userModalRef?.hide();
  }

  resetOpened() {
    this.incompleteOpened = false;
    this.ongoingOpened = false;
    this.returnedOpened = false;
    this.contractAcceptanceOpened = false;
    this.pendingSentOpened = false;
    this.pendingEligibilityOpened = false;
    this.multipleClientesOpened = false;
    this.DOValidationOpened = false;
    this.negotiationAprovalOpened = false;
    this.MCCTreatmentOpened = false;
    this.validationSIBSOpened = false;
    this.riskOpinionOpened = false ;
    this.complianceDoubtsOpened = false;
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
