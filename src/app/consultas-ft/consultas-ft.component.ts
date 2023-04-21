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
import { ProcessNumberService } from '../nav-menu-presencial/process-number.service';
import { ReassingWorkQueue, WorkQueue } from '../queues-detail/IQueues.interface';
import { AuthService } from '../services/auth.service';
import { QueuesService } from '../queues-detail/queues.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
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
  processToAssign: string = "";
  workQueue: WorkQueue = {};
  username: string = "";
  jobId: number = 0;
  userModalRef: BsModalRef | undefined;
  @ViewChild('userModal') userModal;
  existsUser: boolean;
  incorrectCC: boolean = false;
  incorrectCCSize: boolean = false;
  incorrectCCFormat: boolean = false;

  constructor(private logger: LoggerService, private datePipe: DatePipe,
    private route: Router, private tableInfo: TableInfoService, private snackBar: MatSnackBar, private data: DataService, private processService: ProcessService, private translate: TranslateService, public appComponent: AppComponent, private configuration: AppConfigService, private processNrService: ProcessNumberService, private authService: AuthService, private queueService: QueuesService, private modalService: BsModalService) {
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
    if (this.form.get("documentType").value !== '1001') {
      var ASCIICode = (event.which) ? event.which : event.keyCode;

      if (ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57))
        return false;
      return true;
    }
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

    if (processStateToSearch != '' && processStateToSearch != null) {
      this.checkAdvancedSearch(this.search);
      this.url += 'state=' + processStateToSearch;
      this.search = true;
    } if (processNumber != '' && processNumber != null) {
      this.checkAdvancedSearch(this.search);
      this.url += 'number=' + encodedCode;
      this.search = true;
    } if (processDocType != '' && processDocNumber != '' && processDocType != null && processDocNumber != null) {
      this.checkAdvancedSearch(this.search);
      this.url += 'documentType=' + processDocType + '&documentNumber=' + processDocNumber;
      this.search = true;
    } if (processDateStart != '' && processDateStart != null) {
      this.checkAdvancedSearch(this.search);
      this.url += 'fromStartedAt=' + processDateStart;
      this.search = true;
    } if (processDateUntil != '' && processDateUntil != null) {
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
      return;
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
    this.processToAssign = process.processId;
    this.username = this.authService.GetCurrentUser().userName;
    this.queueService.getActiveWorkQueue(this.processToAssign).then(result => {
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

  assign() {
    let navigationExtras: NavigationExtras = {
      state: {
        queueName: this.queueName,
        processId: this.processToAssign
      }
    };
    var reassignWorkQueue: ReassingWorkQueue = {};
    reassignWorkQueue.forceReassign = true;
    reassignWorkQueue.jobId = this.workQueue.id;
    reassignWorkQueue.username = this.username;
    this.queueService.postReassignWorkQueue(this.processToAssign, reassignWorkQueue).then(res => {
      this.processNrService.changeProcessId(this.processToAssign);
      this.processNrService.changeQueueName(this.queueName);
      this.processToAssign = "";
      this.jobId = 0;
      this.userModalRef?.hide();
      this.logger.info('Redirecting to Queues Detail page');
      this.route.navigate(["/queues-detail"], navigationExtras);
    });
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

  closeUserModal() {
    this.userModalRef?.hide();
  }

  checkValidationType(str: string) {
    if (this.form.get("documentType").value === '1001')
      this.ValidateNumeroDocumentoCC(str);
  }

  ValidateNumeroDocumentoCC(numeroDocumento: string) {
    this.incorrectCC = false;
    this.incorrectCCSize = false;
    this.incorrectCCFormat = false;
    var sum = 0;
    var secondDigit = false;

    if (numeroDocumento.length != 12) {
      this.incorrectCCSize = true;
      return false;
    }

    var ccFormat = /^[\d]{8}?\d([A-Z]{2}\d)?$/g;
    if (!ccFormat.test(numeroDocumento)) {
      this.incorrectCCFormat = true;
      return false;
    }

    for (var i = numeroDocumento.length - 1; i >= 0; --i) {
      var valor = this.GetNumberFromChar(numeroDocumento[i]);
      if (secondDigit) {
        valor *= 2;
        if (valor > 9)
          valor -= 9;
      }
      sum += valor;
      secondDigit = !secondDigit;
    }

    if (sum % 10 != 0) {
      this.incorrectCC = true;
      return false;
    }

    return (sum % 10) == 0;
  }

  GetNumberFromChar(letter: string) {
    switch (letter) {
      case '0': return 0;
      case '1': return 1;
      case '2': return 2;
      case '3': return 3;
      case '4': return 4;
      case '5': return 5;
      case '6': return 6;
      case '7': return 7;
      case '8': return 8;
      case '9': return 9;
      case 'A': return 10;
      case 'B': return 11;
      case 'C': return 12;
      case 'D': return 13;
      case 'E': return 14;
      case 'F': return 15;
      case 'G': return 16;
      case 'H': return 17;
      case 'I': return 18;
      case 'J': return 19;
      case 'K': return 20;
      case 'L': return 21;
      case 'M': return 22;
      case 'N': return 23;
      case 'O': return 24;
      case 'P': return 25;
      case 'Q': return 26;
      case 'R': return 27;
      case 'S': return 28;
      case 'T': return 29;
      case 'U': return 30;
      case 'V': return 31;
      case 'W': return 32;
      case 'X': return 33;
      case 'Y': return 34;
      case 'Z': return 35;
    }
  }

  changeDocType() {
    this.form.get("documentNumber").setValue("");
    if (this.form.get("documentType").value != "1001") {
      this.incorrectCC = false;
      this.incorrectCCSize = false;
      this.incorrectCCFormat = false;
    }
  }
}
