import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DataService } from '../nav-menu-interna/data.service';
import { ProcessService } from '../process/process.service';
import { LoggerService } from 'src/app/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { AppComponent } from '../app.component';
import { TableInfoService } from '../table-info/table-info.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppConfigService } from '../app-config.service';
import { DatePipe } from '@angular/common';
interface ProcessFT {
  processId: string;
  processNumber: string;
  nipc: string;
  nome: string;
  estado: string;
}
@Component({
  selector: 'app-consultas-ft',
  templateUrl: './consultas-ft.component.html',
  styleUrls: ['./consultas-ft.component.css']
})

export class ConsultasFTComponent implements OnInit {
  processes: MatTableDataSource<ProcessFT> = new MatTableDataSource();

  displayedColumns = ['processNumber', 'nipc', 'nome', 'estado', 'abrirProcesso'];
  @ViewChild('paginator') set paginator(pager: MatPaginator) {
    if (pager) {
      this.processes.paginator = pager;
      this.processes.paginator._intl = new MatPaginatorIntl();
      this.processes.paginator._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');
      this.processes.paginator.pageSizeOptions = [10, 25, 50, 100];
      this.processes.paginator.length = 10;
    }
  }
  @ViewChild(MatSort) sort: MatSort;

  @Input() queueName: string;

  navbarProcessNumberSearch: string = '';
  form: FormGroup;
  availableStates = [];

  public map = new Map();
  public currentPage: number;
  public subscription: Subscription;
  public subs: Subscription[] = [];
  public state: string;
  public search: boolean;
  public url: string;
  public endDate: string = "";
  public date: string;

  baseUrl = '';

  ListaDocType;

  constructor(private logger: LoggerService, private datePipe: DatePipe,
    private route: Router, private tableInfo: TableInfoService, private snackBar: MatSnackBar, private data: DataService, private processService: ProcessService, private translate: TranslateService, public appComponent: AppComponent, private configuration: AppConfigService) {
    this.baseUrl = configuration.getConfig().acquiringAPIUrl;
    this.appComponent.toggleSideNav(false);
    this.date = this.datePipe.transform(new Date(), 'yyyy-MM-dd');

    //Gets Queue Name from the Dashboard component 
    if (this.route.getCurrentNavigation().extras.state) {
      this.queueName = this.route.getCurrentNavigation().extras.state["queueName"];
    }

    this.subs.push(this.tableInfo.GetAllDocumentTypes().subscribe(result => {
      this.ListaDocType = result;
      this.ListaDocType = this.ListaDocType.sort((a, b) => a.description > b.description ? 1 : -1); //ordenar resposta
    }));
    this.chooseState();
    this.initializeForm();
  }

  callEndDate() {
    this.endDate = this.form.get('processDateStart').value;
  }

  chooseState() {
    switch (this.queueName) {
      case "MCCTreatment":
        this.state = "StandardIndustryClassificationChoice"
        break;
      case "eligibility":
        this.state = "EligibilityAssessment"
        break;
      case "risk":
        this.state = "RiskAssessment"
        break;
      case "negotiationAproval":
        this.state = "NegotiationApproval"
        break;
      case "compliance":
        this.state = "ComplianceEvaluation"
        break;
      case "DOValidation":
        this.state = "OperationsEvaluation"
        break;
      case "validationSIBS":
        this.state = "MerchantRegistration"
        break;
    }
  }

  numericOnly(event): boolean {
    var ASCIICode = (event.which) ? event.which : event.keyCode;

    if (ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57))
      return false;
    return true;
  }

  initializeForm() {
    this.form = new FormGroup({
      processNumber: new FormControl(this.navbarProcessNumberSearch),
      documentType: new FormControl(''), //Não é obrigatorio por enquanto
      state: new FormControl(''), //Não é diretamente obrigatório
      documentNumber: new FormControl(''), //Não é obrigatorio por enquanto
      processDateStart: new FormControl(''), //Não é obrigatorio por enquanto
      processDateEnd: new FormControl('') //Não é obrigatorio por enquanto
    });
  }

  submitSearch() {
    if (this.form.valid)
      this.searchProcess();
  }

  checkAdvancedSearch(search) {
    if (search) {
      this.url += '&';
    }
  }

  searchProcess() {
    this.search = false;
    this.loadProcesses([]);
    var processStateToSearch = this.state;
    var processNumber = this.form.get('processNumber').value;
    var processDocType = this.form.get('documentType').value;
    var processDocNumber = this.form.get('documentNumber').value;
    var processDateStart = this.form.get('processDateStart').value;
    var processDateUntil = this.form.get('processDateEnd').value;
    var encodedCode = encodeURIComponent(processNumber);
    this.url = this.baseUrl + 'process?';

    if (processStateToSearch != '') {
      this.checkAdvancedSearch(this.search);
      this.url += 'state=' + processStateToSearch;
      this.search = true;
    } if (processNumber != '') {
      this.checkAdvancedSearch(this.search);
      this.url += 'number=' + encodedCode;
      this.search = true;
    } if (processDocType != '' && processDocNumber != '') {
      this.checkAdvancedSearch(this.search);
      this.url += 'documentType=' + processDocType + '&documentNumber=' + processDocNumber;
      this.search = true;
    } if (processDateStart != '') {
      this.checkAdvancedSearch(this.search);
      this.url += 'fromStartedAt=' + processDateStart;
      this.search = true;
    } if (processDateUntil != '') {
      this.checkAdvancedSearch(this.search);
      this.url += 'untilStartedAt=' + processDateUntil;
      this.search = true;
    }

    if (this.url == this.baseUrl + 'process?') {
      this.snackBar.open(this.translate.instant('searches.emptySearch'), '', {
        duration: 4000,
        panelClass: ['snack-bar']
      });
    }

    if (processDocType != '' && processDocNumber == '' || processDocType == '' && processDocNumber != '') {
      this.snackBar.open(this.translate.instant('searches.errorDocs'), '', {
        duration: 4000,
        panelClass: ['snack-bar']
      });
    }

    this.processService.advancedSearch(this.url, 0, this.processes.paginator.pageSize).subscribe(result => {
      if (result.pagination.count > 300) {
        this.snackBar.open(this.translate.instant('searches.search300'), '', {
          duration: 4000,
          panelClass: ['snack-bar']
        });
      }
      let processesArray: ProcessFT[] = result.items.map<ProcessFT>((process) => {

        if (process.state === 'Incomplete') {
          process.state = this.translate.instant('searches.incompleted');
        } else if (process.state === 'Ongoing') {
          process.state = this.translate.instant('searches.running');
        } else if (process.state === 'Completed') {
          process.state = this.translate.instant('searches.completed');
        } else if (process.state === 'Returned') {
          process.state = this.translate.instant('searches.returned');
        } else if (process.state === 'Cancelled') {
          process.state = this.translate.instant('searches.cancelled');
        } else if (process.state === 'ContractAcceptance') {
          process.state = this.translate.instant('searches.contractAcceptance')
        } else if (process.state === 'StandardIndustryClassificationChoice') {
          process.state = this.translate.instant('searches.MCCTreatment')
        } else if (process.state === 'RiskAssessment') {
          process.state = this.translate.instant('searches.riskOpinion')
        } else if (process.state === 'EligibilityAssessment') {
          process.state = this.translate.instant('searches.eligibility')
        } else if (process.state === 'ClientChoice') {
          process.state = this.translate.instant('searches.multipleClients')
        } else if (process.state === 'NegotiationApproval') {
          process.state = this.translate.instant('searches.negotiationApproval')
        } else if (process.state === 'MerchantRegistration') {
          process.state = this.translate.instant('searches.merchantRegistration')
        } else if (process.state === 'OperationsEvaluation') {
          process.state = this.translate.instant('searches.DOValidation')
        } else if (process.state === 'ContractDigitalAcceptance') {
          process.state = this.translate.instant('searches.contractDigitalAcceptance')
        } else if (process.state === 'DigitalIdentification') {
          process.state = this.translate.instant('searches.digitalIdentification')
        } else if (process.state === 'ComplianceEvaluation') {
          process.state = this.translate.instant('searches.complianceDoubts')
        }

        return {
          processId: process.processId,
          processNumber: process.processNumber,
          nipc: this.datePipe.transform(process?.startedAt, 'dd/MM/yyyy'),
          nome: process?.merchant?.name,
          estado: process?.startedBy?.user
        };
      })

      if (processesArray.length == 0) {
        this.snackBar.open(this.translate.instant('searches.emptyList'), '', {
          duration: 4000,
          panelClass: ['snack-bar']
        });
      }
      this.loadProcesses(processesArray);
    }, error => {
      this.logger.error(error, "", "Error when searching processes");
      this.loadProcesses([]);
    });
  }

  openProcess(process) {
    if (localStorage.getItem("returned") != 'consult') {
      localStorage.setItem('returned', 'edit');
    }
    localStorage.setItem("processNumber", process.processNumber);
    let navigationExtras: NavigationExtras = {
      state: {
        queueName: this.queueName,
        processId: process.processId
      }
    };
    this.logger.info("Redirecting to Queues Detail page");
    this.route.navigate(['/queues-detail'], navigationExtras);
  }

  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    var context = this;
  }
  ngAfterViewInit() {

  }

  loadProcesses(processValues: ProcessFT[]) {
    this.processes.data = processValues;
  }
}
