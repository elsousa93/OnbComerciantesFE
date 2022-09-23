import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CookieService } from 'ngx-cookie-service'
import { MediaMatcher } from '@angular/cdk/layout';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, HostBinding, Input, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { onSideNavChange, AutoHideSidenavAdjust } from '../animation';
import { UserPermissions, FTPermissions, getFTPermissions } from '../userPermissions/user-permissions';
import { DataService } from '../nav-menu-interna/data.service';
import { ProcessGet, ProcessList, ProcessService, UpdateProcess } from '../process/process.service';
import { DatePipe } from '@angular/common';
import { LoggerService } from 'src/app/logger.service';
import { User } from '../userPermissions/user';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  animations: [onSideNavChange, AutoHideSidenavAdjust]
})
export class DashboardComponent implements OnInit {
  displayedColumns1: string[] = ['id', 'name', 'progress', 'color', 'teste']

  displayedColumnsWithObject: string[] = [
    'id',
    'firstname',
    'lastname',
    'email',
    'gender',
    'jobtitle',
    'department',
    'project.name',
  ];

  dataSourcePendentes: MatTableDataSource<ProcessList>;
  dataSourceTratamento: MatTableDataSource<ProcessList>;
  dataSourceDevolvidos: MatTableDataSource<ProcessList>;
  dataSourceAceitacao: MatTableDataSource<ProcessList>;
  dataSourcePendingSent: MatTableDataSource<ProcessList>;
  dataSourcePendingEligibility: MatTableDataSource<ProcessList>;
  dataSourceMultipleClients: MatTableDataSource<ProcessList>;
  dataSourceDOValidation: MatTableDataSource<ProcessList>;
  dataSourceNegotiationAproval: MatTableDataSource<ProcessList>;
  dataSourceMCCTreatment: MatTableDataSource<ProcessList>;
  dataSourceValidationSIBS: MatTableDataSource<ProcessList>;
  dataSourceRiskOpinion: MatTableDataSource<ProcessList>;
  dataSourceComplianceDoubts: MatTableDataSource<ProcessList>;

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
  @ViewChild('paginatorPage') paginatorPage: MatPaginator;
  @ViewChild('paginatorPageSize') paginatorPageSize: MatPaginator;
  @ViewChild('paginatorPageDevolvidos') paginatorPageDevolvidos: MatPaginator;
  @ViewChild('paginatorPageAceitacao') paginatorPageAceitacao: MatPaginator;
  @ViewChild('paginatorPagePendingSent') paginatorPagePendingSent: MatPaginator;
  @ViewChild('paginatorPagePendingEligibility') paginatorPagePendingEligibility: MatPaginator;
  @ViewChild('paginatorPageMultipleClients') paginatorPageMultipleClients: MatPaginator;
  @ViewChild('paginatorPageDOValidation') paginatorPageDOValidation: MatPaginator;
  @ViewChild('paginatorPageNegotiationAproval') paginatorPageNegotiationAproval: MatPaginator;
  @ViewChild('paginatorPageMCCTreatment') paginatorPageMCCTreatment: MatPaginator;
  @ViewChild('paginatorPageValidationSIBS') paginatorPageValidationSIBS: MatPaginator;
  @ViewChild('paginatorPageRiskOpinion') paginatorPageRiskOpinion: MatPaginator;
  @ViewChild('paginatorPageComplianceDoubts') paginatorPageComplianceDoubts: MatPaginator;

  //---------------------------

  @Input() isToggle: boolean = false;
  @Input() isAutoHide: boolean = false;

  displayedColumns = ['processNumber', 'contractNumber', 'requestDate', 'clientName', 'user', 'buttons'];

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

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

  constructor(private logger: LoggerService, private http: HttpClient, private cookie: CookieService, private router: Router,
    changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, private dataService: DataService, private processService: ProcessService,
    private datePipe: DatePipe, private authService: AuthService) {
    this.mobileQuery = media.matchMedia('(max-width: 850px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    localStorage.clear();
    this.date = this.datePipe.transform(new Date(), 'dd-MM-yyyy');
    //const users: UserData[] = [];
    //for (let i = 1; i <= 100; i++) {
    //  users.push(createNewUser(i));
    //}

    // Assign the data to the data source for the table to render

    //Pendentes de envio
    this.processService.searchProcessByState('Incomplete', 0, 1).subscribe(result => {
      this.logger.debug('Pendentes de envio ' + result.items);
      this.processService.searchProcessByState('Incomplete', 0, result.pagination.total).subscribe(resul => {
        this.incompleteProcessess = resul;
        this.dataSourcePendentes = new MatTableDataSource(this.incompleteProcessess.items);

        this.dataSourcePendentes.paginator = this.paginator;
        this.dataSourcePendentes.sort = this.sort;
        this.incompleteCount = result.pagination.total;
      });
    });

    //Tratamento BackOffice
    this.processService.searchProcessByState('Ongoing', 0, 1).subscribe(result => {
      this.logger.debug('Tratamento BackOffice ' + result);
      this.processService.searchProcessByState('Ongoing', 0, result.pagination.total).subscribe(resul => {
        this.ongoingProcessess = resul;
        this.dataSourceTratamento = new MatTableDataSource(this.ongoingProcessess.items);

        // this.empTbSortWithObject.disableClear = true;
        this.dataSourceTratamento.sort = this.empTbSortWithObject;
        this.dataSourceTratamento.paginator = this.paginatorPageSize;
        this.ongoingCount = result.pagination.total;
      });
    });


    //Devolvido BackOffice
    this.processService.searchProcessByState('Returned', 0, 1).subscribe(result => {
      this.logger.debug('Devolvidos BackOffice ' + result);
      this.processService.searchProcessByState('Returned', 0, result.pagination.total).subscribe(resul => {
        this.returnedProcessess = resul;
        this.dataSourceDevolvidos = new MatTableDataSource(this.returnedProcessess.items);

        this.dataSourceDevolvidos.paginator = this.paginatorPageDevolvidos;
        this.dataSourceDevolvidos.sort = this.empTbSortDevolvidos;
        this.returnedCount = result.pagination.total;
      });
    });

    //Pendentes de Aceitação
    this.processService.searchProcessByState('contractAcceptance', 0, 1).subscribe(result => {
      this.logger.debug('Pendentes de Aceitação' + result);
      this.processService.searchProcessByState('contractAcceptance', 0, result.pagination.total).subscribe(resul => {
        this.contractAcceptanceProcessess = resul;
        this.dataSourceAceitacao = new MatTableDataSource(this.contractAcceptanceProcessess.items);

        this.dataSourceAceitacao.paginator = this.paginatorPageAceitacao;
        this.dataSourceAceitacao.sort = this.empTbSortAceitacao;
        this.contractAcceptanceCount = result.pagination.total;
      });
    });

    //Arquivo Fisico
    this.processService.searchProcessByState('Completed', 0, 1).subscribe(result => {
      this.logger.debug('Completos ' + result);
      this.processService.searchProcessByState('Completed', 0, result.pagination.total).subscribe(resul => {
        this.pendingSentProcessess = resul;
        this.dataSourcePendingSent = new MatTableDataSource(this.pendingSentProcessess.items);

        this.dataSourcePendingSent.paginator = this.paginatorPagePendingSent;
        this.dataSourcePendingSent.sort = this.empTbSortPendingSent;
        this.pendingSentCount = result.pagination.total;
      });
    });

    //Pareceres de Eligibilidade
    this.processService.searchProcessByState('Completed', 0, 1).subscribe(result => {
      this.logger.debug('Completos ' + result);
      this.processService.searchProcessByState('Completed', 0, result.pagination.total).subscribe(resul => {
        this.pendingEligibilityProcessess = resul;
        this.dataSourcePendingEligibility = new MatTableDataSource(this.pendingEligibilityProcessess.items);

        this.dataSourcePendingEligibility.paginator = this.paginatorPagePendingEligibility;
        this.dataSourcePendingEligibility.sort = this.empTbSortPendingEligibility;
        this.pendingEligibilityCount = result.pagination.total;
      });
    });

    //Múltiplos Clientes
    this.processService.searchProcessByState('Completed', 0, 1).subscribe(result => {
      this.logger.debug('Completos ' + result);
      this.processService.searchProcessByState('Completed', 0, result.pagination.total).subscribe(resul => {
        this.multipleClientesProcessess = resul;
        this.dataSourceMultipleClients = new MatTableDataSource(this.multipleClientesProcessess.items);

        this.dataSourceMultipleClients.paginator = this.paginatorPageMultipleClients;
        this.dataSourceMultipleClients.sort = this.empTbSortMultipleClients;
        this.multipleClientesCount = result.pagination.total;
      });
    });

    //Valida DO
    this.processService.searchProcessByState('Completed', 0, 1).subscribe(result => {
      this.logger.debug('Completos ' + result);
      this.processService.searchProcessByState('Completed', 0, result.pagination.total).subscribe(resul => {
        this.DOValidationProcessess = resul;
        this.dataSourceDOValidation = new MatTableDataSource(this.DOValidationProcessess.items);

        this.dataSourceDOValidation.paginator = this.paginatorPageDOValidation;
        this.dataSourceDOValidation.sort = this.empTbSortDOValidation;
        this.DOValidationCount = result.pagination.total;
      });
    });

    //Aprovação de Negociação
    this.processService.searchProcessByState('Completed', 0, 1).subscribe(result => {
      this.logger.debug('Completos ' + result);
      this.processService.searchProcessByState('Completed', 0, result.pagination.total).subscribe(resul => {
        this.negotiationAprovalProcessess = resul;
        this.dataSourceNegotiationAproval = new MatTableDataSource(this.negotiationAprovalProcessess.items);

        this.dataSourceNegotiationAproval.paginator = this.paginatorPageNegotiationAproval;
        this.dataSourceNegotiationAproval.sort = this.empTbSortNegotiationAproval;
        this.negotiationAprovalCount = result.pagination.total;
      });
    });

    //MCC
    this.processService.searchProcessByState('Completed', 0, 1).subscribe(result => {
      this.logger.debug('Completos ' + result);
      this.processService.searchProcessByState('Completed', 0, result.pagination.total).subscribe(resul => {
        this.MCCTreatmentProcessess = resul;
        this.dataSourceMCCTreatment = new MatTableDataSource(this.MCCTreatmentProcessess.items);

        this.dataSourceMCCTreatment.paginator = this.paginatorPageMCCTreatment;
        this.dataSourceMCCTreatment.sort = this.empTbSortMCCTreatment;
        this.MCCTreatmentCount = result.pagination.total;
      });
    });

    //Vaidação SIBS
    this.processService.searchProcessByState('Completed', 0, 1).subscribe(result => {
      this.logger.debug('Completos ' + result);
      this.processService.searchProcessByState('Completed', 0, result.pagination.total).subscribe(resul => {
        this.validationSIBSProcessess = resul;
        this.dataSourceValidationSIBS = new MatTableDataSource(this.validationSIBSProcessess.items);

        this.dataSourceValidationSIBS.paginator = this.paginatorPageValidationSIBS;
        this.dataSourceValidationSIBS.sort = this.empTbSortValidationSIBS;
        this.validationSIBSCount = result.pagination.total;
      });
    });

    //Parecer de Risco
    this.processService.searchProcessByState('Completed', 0, 1).subscribe(result => {
      this.logger.debug('Completos ' + result);
      this.processService.searchProcessByState('Completed', 0, result.pagination.total).subscribe(resul => {
        this.riskOpinionProcessess = resul;
        this.dataSourceRiskOpinion = new MatTableDataSource(this.riskOpinionProcessess.items);

        this.dataSourceRiskOpinion.paginator = this.paginatorPageRiskOpinion;
        this.dataSourceRiskOpinion.sort = this.empTbSortRiskOpinion;
        this.riskOpinionCount = result.pagination.total;
      });
    });

    //Dúvidas Compliance
    this.processService.searchProcessByState('Completed', 0, 1).subscribe(result => {
      this.logger.debug('Completos ' + result);
      this.processService.searchProcessByState('Completed', 0, result.pagination.total).subscribe(resul => {
        this.complianceDoubtsProcessess = resul;
        this.dataSourceComplianceDoubts = new MatTableDataSource(this.complianceDoubtsProcessess.items);

        this.dataSourceComplianceDoubts.paginator = this.paginatorPageComplianceDoubts;
        this.dataSourceComplianceDoubts.sort = this.empTbSortComplianceDoubts;
        this.complianceDoubtsCount = result.pagination.total;
      });
    });
  }

  FTSearch(queue: string) {
    let navigationExtras: NavigationExtras = {
      state: {
        queueName: queue
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
  }

  public toggleSideNav(toggled: boolean) {
    this.isToggle = toggled;
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  streamHistoryMenu() {
    this.dataService.historyStream$.next(true);
  }

  ngAfterViewInit() {
    //this.dataSourcePendentes.paginator = this.paginator;
    //this.dataSourcePendentes.sort = this.sort;

    ////-------------------------------------
    //this.empTbSortWithObject.disableClear = true;
    //this.dataSourceTratamento.sort = this.empTbSortWithObject;
    //this.dataSourceTratamento.paginator = this.paginatorPageSize;

    //this.dataSourceDevolvidos.paginator = this.paginatorPageDevolvidos;
    //this.dataSourceDevolvidos.sort = this.empTbSortDevolvidos;

    //this.dataSourceAceitacao.paginator = this.paginatorPageAceitacao;
    //this.dataSourceAceitacao.sort = this.empTbSortAceitacao;

    //this.dataSourceArquivoFisico.paginator = this.paginatorPageArquivoFisico;
    //this.dataSourceArquivoFisico.sort = this.empTbSortArquivoFisico;

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

