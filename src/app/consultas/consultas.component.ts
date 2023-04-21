import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DataService } from '../nav-menu-interna/data.service';
import { ProcessService } from '../process/process.service';
import { LoggerService } from 'src/app/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { TableInfoService } from '../table-info/table-info.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { AppComponent } from '../app.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppConfigService } from '../app-config.service';
import { DatePipe } from '@angular/common';
import { ProcessNumberService } from '../nav-menu-presencial/process-number.service';

interface Process {
  processNumber: string;
  nipc: string;
  nome: string;
  estado: string;
}

@Component({
  selector: 'app-consultas',
  templateUrl: './consultas.component.html',
  styleUrls: ['./consultas.component.css']
})

export class ConsultasComponent implements OnInit {

  navbarProcessNumberSearch: string = '';
  form: FormGroup;
  availableStates = [];

  public map = new Map();
  public currentPage: number;
  public subscription: Subscription;
  public subs: Subscription[] = [];
  public url: string;
  public search: boolean = false;
  public endDate: string = "";
  public date: string;

  baseUrl = '';

  ListaDocType;
  isLengthOne: boolean = false;
  incorrectNIPC: boolean = false;
  incorrectNIPCSize: boolean = false;
  incorrectNIF: boolean = false;
  incorrectNIFSize: boolean = false;

  constructor(private logger: LoggerService, private datePipe: DatePipe, private snackBar: MatSnackBar, private route: Router, public modalService: BsModalService, private data: DataService, private processService: ProcessService, private tableInfo: TableInfoService, private translate: TranslateService, public appComponent: AppComponent, private configuration: AppConfigService, private processNrService: ProcessNumberService) {
    this.baseUrl = configuration.getConfig().acquiringAPIUrl;
    this.appComponent.toggleSideNav(false);
    this.date = this.datePipe.transform(new Date(), 'yyyy-MM-dd');

    //Gets ProcessNr when search on homepage does not return results 
    if (this.route.getCurrentNavigation().extras.state) {
      this.navbarProcessNumberSearch = this.route.getCurrentNavigation().extras.state["processNumber"];
      // se entrar aqui é pq a pesquisa não tem resultados
      this.snackBar.open(this.translate.instant('searches.emptyList'), '', {
        duration: 4000,
        panelClass: ['snack-bar']
      });
    }

    //this.subs.push(this.tableInfo.GetAllDocumentTypes().subscribe(result => {
    //  this.ListaDocType = result;
    //  this.ListaDocType = this.ListaDocType.sort((a, b) => a.description > b.description ? 1 : -1); //ordenar resposta
    //}));
    this.tableInfo.GetMerchantTypes().then(result => {
      this.ListaDocType = result.result;
    });
    this.initializeForm();
  }

  processes = new MatTableDataSource<Process>();

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

  initializeForm() {
    this.form = new FormGroup({
      processNumber: new FormControl(this.navbarProcessNumberSearch),
      documentType: new FormControl(''),
      state: new FormControl(''),
      documentNumber: new FormControl(''),
      processDateStart: new FormControl(''),
      processDateEnd: new FormControl('')
    });
  }

  callEndDate() {
    this.endDate = this.form.get('processDateStart').value;
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
    this.isLengthOne = false;
    this.search = false;
    this.loadProcesses([]);
    var processStateToSearch = this.form.get("state").value;
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
    this.processService.advancedSearch(this.url, 0, 1).subscribe(r => {
      this.logger.info("Search one process result: " + JSON.stringify(r));

      if (r.pagination.total > 300) {
        this.snackBar.open(this.translate.instant('searches.search300'), '', {
          duration: 4000,
          panelClass: ['snack-bar']
        });
        r.pagination.total = 300;
      }

      if (processStateToSearch === 'ContractAcceptance') {
        let processes: Process[] = [];
        if (r.pagination.total == 1) {
          this.isLengthOne = true;
          let processesArray: Process[] = r.items.map<Process>((process) => {
            // mapear os estados para aparecer em PT ou EN
            process.state = this.translate.instant('searches.contractAcceptance')
            return {
              processNumber: process?.processNumber,
              nipc: process?.merchant?.fiscalId,
              nome: process?.merchant?.name,
              estado: process?.state,
              processId: process?.processId
            };
          });
          processes.push(...processesArray);
        }

        if (!this.isLengthOne) {
          this.processService.advancedSearch(this.url, 0, r.pagination.total).subscribe(result => {
            this.logger.info("Search total processes result: " + JSON.stringify(result));

            let processesArray: Process[] = result.items.map<Process>((process) => {

              // mapear os estados para aparecer em PT ou EN
              process.state = this.translate.instant('searches.contractAcceptance');

              return {
                processNumber: process?.processNumber,
                nipc: process?.merchant?.fiscalId,
                nome: process?.merchant?.name,
                estado: process?.state,
                processId: process?.processId
              };
            });
            processes.push(...processesArray);
          }, error => {
            this.logger.error(error, "", "Error when searching for processes");
            this.loadProcesses([]);
          });
        }


        this.url = this.baseUrl + 'process?';
        //this.checkAdvancedSearch(this.search);
        this.url += 'state=ContractDigitalAcceptance';
        this.search = true;
        if (processNumber != '' && processNumber != null) {
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

        this.processService.advancedSearch(this.url, 0, 1).subscribe(r => {
          if (r.pagination.total == 1) {
            this.isLengthOne = true;
            let processesArray: Process[] = r.items.map<Process>((process) => {
              // mapear os estados para aparecer em PT ou EN
              process.state = this.translate.instant('searches.contractDigitalAcceptance')
              return {
                processNumber: process?.processNumber,
                nipc: process?.merchant?.fiscalId,
                nome: process?.merchant?.name,
                estado: process?.state,
                processId: process?.processId
              };
            });
            processes.push(...processesArray);
          }

          if (!this.isLengthOne) {
            this.processService.advancedSearch(this.url, 0, r.pagination.total).subscribe(result => {
              this.logger.info("Search total processes result: " + JSON.stringify(result));

              let processesArray: Process[] = result.items.map<Process>((process) => {

                // mapear os estados para aparecer em PT ou EN
                process.state = this.translate.instant('searches.contractDigitalAcceptance');

                return {
                  processNumber: process?.processNumber,
                  nipc: process?.merchant?.fiscalId,
                  nome: process?.merchant?.name,
                  estado: process?.state,
                  processId: process?.processId
                };
              });
              processes.push(...processesArray);
            }, error => {
              this.logger.error(error, "", "Error when searching for processes");
              this.loadProcesses([]);
            });
          }
        });

        this.url = this.baseUrl + 'process?';
        //this.checkAdvancedSearch(this.search);
        this.url += 'state=DigitalIdentification';
        this.search = true;
        if (processNumber != '' && processNumber != null) {
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

        this.processService.advancedSearch(this.url, 0, 1).subscribe(r => {
          if (r.pagination.total == 1) {
            this.isLengthOne = true;

            let processesArray: Process[] = r.items.map<Process>((process) => {
              // mapear os estados para aparecer em PT ou EN
              process.state = this.translate.instant('searches.digitalIdentification')

              return {
                processNumber: process?.processNumber,
                nipc: process?.merchant?.fiscalId,
                nome: process?.merchant?.name,
                estado: process?.state,
                processId: process?.processId
              };
            })
            processes.push(...processesArray);
          }

          if (!this.isLengthOne) {
            this.processService.advancedSearch(this.url, 0, r.pagination.total).subscribe(result => {
              this.logger.info("Search total processes result: " + JSON.stringify(result));

              let processesArray: Process[] = result.items.map<Process>((process) => {
                // mapear os estados para aparecer em PT ou EN
                process.state = this.translate.instant('searches.digitalIdentification')

                return {
                  processNumber: process?.processNumber,
                  nipc: process?.merchant?.fiscalId,
                  nome: process?.merchant?.name,
                  estado: process?.state,
                  processId: process?.processId
                };
              })
              processes.push(...processesArray);
              this.loadProcesses(processes);
              if (processes.length == 0) {
                this.snackBar.open(this.translate.instant('searches.emptyList'), '', {
                  duration: 4000,
                  panelClass: ['snack-bar']
                });
              }
            }, error => {
              this.logger.error(error, "", "Error when searching for processes");
              this.loadProcesses([]);
            });
          }
        });

      } else {
        if (r.pagination.total == 1) {
          this.isLengthOne = true;

          let processesArray: Process[] = r.items.map<Process>((process) => {
            // mapear os estados para aparecer em PT ou EN
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
              processNumber: process?.processNumber,
              nipc: process?.merchant?.fiscalId,
              nome: process?.merchant?.name,
              estado: process?.state,
              processId: process?.processId
            };
          })
          if (processesArray.length == 0) {
            this.snackBar.open(this.translate.instant('searches.emptyList'), '', {
              duration: 4000,
              panelClass: ['snack-bar']
            });
          }
          this.loadProcesses(processesArray);
        }

        if (!this.isLengthOne) {
          this.processService.advancedSearch(this.url, 0, r.pagination.total).subscribe(result => {
            this.logger.info("Search total processes result: " + JSON.stringify(result));

            let processesArray: Process[] = result.items.map<Process>((process) => {

              // mapear os estados para aparecer em PT ou EN
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
                processNumber: process?.processNumber,
                nipc: process?.merchant?.fiscalId,
                nome: process?.merchant?.name,
                estado: process?.state,
                processId: process?.processId
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
            this.logger.error(error, "", "Error when searching for processes");
            this.loadProcesses([]);
          });
        }
      }

      
    }, error => {
      this.logger.error(error, "", "Error when searching for processes");
      this.loadProcesses([]);
    });
  }

  numericOnly(event): boolean {
    if (this.form.get("documentType").value !== '1001') {
      var ASCIICode = (event.which) ? event.which : event.keyCode;

      if (ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57))
        return false;
      return true;
    }
  }

  openProcess(process) {
    localStorage.setItem("processNumber", process.processNumber);
    this.processNrService.changeProcessId(process.processId);
    localStorage.setItem("returned", 'consult');
    this.logger.info("Redirecting to Client By Id page");
    this.route.navigate(['/clientbyid']);
  }

  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
  }

  ngAfterViewInit(): void {
    this.processes.sort = this.sort;
  }

  loadProcesses(processValues: Process[]) {
    this.processes.data = processValues;
    this.processes.sort = this.sort;
  }

  checkValidationType(str: string) {
    if (this.form.get("documentType").value === '01')
      this.validateNIPC(str);
    if (this.form.get("documentType").value === '02')
      this.validateNIF(str)
  }

  validateNIF(nif: string): boolean {
    this.incorrectNIFSize = false;
    this.incorrectNIF = false;
    if (nif != '') {
      if (nif.length != 9) {
        this.incorrectNIFSize = true;
        return false;
      }
      if (!['1', '2', '3'].includes(nif.substr(0, 1))) {
        this.incorrectNIF = true;
        return false;
      }

      const total = Number(nif[0]) * 9 + Number(nif[1]) * 8 + Number(nif[2]) * 7 + Number(nif[3]) * 6 + Number(nif[4]) * 5 + Number(nif[5]) * 4 + Number(nif[6]) * 3 + Number(nif[7]) * 2;
      const modulo11 = total - Math.trunc(total / 11) * 11;
      const comparador = modulo11 === 1 || modulo11 === 0 ? 0 : 11 - modulo11;

      if (Number(nif[8]) !== comparador) {
        this.incorrectNIF = true;
        return false;
      }
      return Number(nif[8]) === comparador;
    }
  }

  validateNIPC(nipc: string): boolean {
    this.incorrectNIPCSize = false;
    this.incorrectNIPC = false;
    if (nipc != '') {
      if (nipc.length != 9) {
        this.incorrectNIPCSize = true;
        return false;
      }
      if (!['5', '6', '8', '9'].includes(nipc.substr(0, 1))) {
        this.incorrectNIPC = true;
        return false;
      }

      const total = Number(nipc[0]) * 9 + Number(nipc[1]) * 8 + Number(nipc[2]) * 7 + Number(nipc[3]) * 6 + Number(nipc[4]) * 5 + Number(nipc[5]) * 4 + Number(nipc[6]) * 3 + Number(nipc[7]) * 2;
      const modulo11 = total - Math.trunc(total / 11) * 11;
      const comparador = modulo11 === 1 || modulo11 === 0 ? 0 : 11 - modulo11;

      if (Number(nipc[8]) !== comparador) {
        this.incorrectNIPC = true;
        return false;
      }

      return Number(nipc[8]) === comparador;
    }
  }

  changeDocType() {
    this.form.get("documentNumber").setValue("");
    this.incorrectNIF = false;
    this.incorrectNIFSize = false;
    this.incorrectNIPC = false;
    this.incorrectNIPCSize = false;
  }
}
