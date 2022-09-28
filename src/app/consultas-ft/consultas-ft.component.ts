import { HttpClient } from '@angular/common/http';
import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DataService } from '../nav-menu-interna/data.service';
import { ProcessService } from '../process/process.service';
import { Configuration, configurationToken } from '../configuration';
import { LoggerService } from 'src/app/logger.service';
import { TranslateService } from '@ngx-translate/core';

interface ProcessFT {
  processNumber: string;
  nipc: number;
  nome: string;
  estado: string;
}

@Component({
  selector: 'app-consultas-ft',
  templateUrl: './consultas-ft.component.html',
  styleUrls: ['./consultas-ft.component.css']
})

export class ConsultasFTComponent implements OnInit{
  processes: MatTableDataSource<ProcessFT> = new MatTableDataSource();

  displayedColumns = ['processNumber', 'contractNumber', 'processDate', 'nome', 'user', 'abrirProcesso'];
  @ViewChild('paginator') set paginator(pager:MatPaginator) {
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

  //////////////////////
  navbarProcessNumberSearch: string = '';
  form: FormGroup;
  availableStates = [];

  //////////////////////
  public map = new Map();
  public currentPage: number;
  public subscription: Subscription;

  
  constructor(private logger : LoggerService, private http: HttpClient, @Inject(configurationToken) private configuration: Configuration,
    private route: Router, private data: DataService, private processService: ProcessService, private translate: TranslateService) {

    this.initializeForm();

    //Gets Queue Name from the Dashboard component 
    if (this.route.getCurrentNavigation().extras.state) {
      this.queueName = this.route.getCurrentNavigation().extras.state["queueName"];
    }
    this.ngOnInit();
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

    //this.form.get("processNumber").valueChanges.subscribe(data => {
    //  if (data === '') {
    //    this.form.controls["state"].setValidators([Validators.required]);
    //  } else {
    //    this.form.controls["state"].clearValidators();
    //  }
    //  this.form.controls["state"].updateValueAndValidity();
    //});

    //this.form.get("state").valueChanges.subscribe(data => {
    //  if (data === '') {
    //    this.form.controls["processNumber"].setValidators([Validators.required]);
    //  } else {
    //    this.form.controls["processNumber"].clearValidators();
    //  }
    //  this.form.controls["processNumber"].updateValueAndValidity();
    //});
  }

  submitSearch() {
    if (this.form.valid)
      this.searchProcess();
  }

  searchProcess() {
    this.logger.debug(this.form);
    this.loadProcesses([]);
      var processStateToSearch = this.form.get("state").value;
      var processNumber = this.form.get('processNumber').value;
      var processDocType = this.form.get('documentType').value;
      var processDocNumber = this.form.get('documentNumber').value;
      var processDateStart = this.form.get('processDateStart').value;
      var processDateUntil = this.form.get('processDateEnd').value;
      if (processNumber !== '') {
        this.logger.debug(processNumber);
        var encodedCode = encodeURIComponent(processNumber);
          this.processService.searchProcessByNumber(encodedCode, 0, this.processes.paginator.pageSize).subscribe(resul => {
            let processesArray: ProcessFT[] = resul.items.map<ProcessFT>((process) => {
              return {
                processNumber: process.processNumber,
                nipc: 529463466,
                nome: "EMPRESA UNIPESSOAL TESTES",
                estado: process.state
              };
            })
            this.loadProcesses(processesArray);
          }, error => {
            this.logger.debug("deu erro");
            this.logger.debug(error);
            this.loadProcesses([]);
          });
          
      } else if (processStateToSearch!=''){  
          this.processService.searchProcessByState(processStateToSearch, 0, this.processes.paginator.pageSize).subscribe(resul => {
            let processesArray: ProcessFT[] = resul.items.map<ProcessFT>((process) => {
              return {
                processNumber: process.processNumber,
                nipc: 529463466,
                nome: "EMPRESA UNIPESSOAL TESTES",
                estado: process.state
              };
            })
            this.loadProcesses(processesArray);
          }, error => {
            this.logger.debug(error);
            this.loadProcesses([]);
          });
      } else if (processDocNumber != '' && processDocType != '') {

          this.processService.searchProcessByDoc(processDocType,processDocNumber, 0, this.processes.paginator.pageSize).subscribe(resul => {
            let processesArray: ProcessFT[] = resul.items.map<ProcessFT>((process) => {
              return {
                processNumber: process.processNumber,
                nipc: 529463466,
                nome: "EMPRESA UNIPESSOAL TESTES",
                estado: process.state
              };
            })
            this.loadProcesses(processesArray);
          }, error => {
            this.logger.debug(error);
            this.loadProcesses([]);
          });
       
      } else if (processDateStart != '') {
          this.processService.searchProcessByStartedDate(processDateStart, 0, this.processes.paginator.pageSize).subscribe(resul => {
            let processesArray: ProcessFT[] = resul.items.map<ProcessFT>((process) => {
              return {
                processNumber: process.processNumber,
                nipc: 529463466,
                nome: "EMPRESA UNIPESSOAL TESTES",
                estado: process.state
              };
            })
            this.loadProcesses(processesArray);
          }, error => {
            this.logger.debug(error);
            this.loadProcesses([]);
          });
      } else if (processDateUntil != '') {
          this.processService.searchProcessByUntilDate(processDateUntil, 0, this.processes.paginator.pageSize).subscribe(resul => {
            let processesArray: ProcessFT[] = resul.items.map<ProcessFT>((process) => {
              return {
                processNumber: process.processNumber,
                nipc: 529463466,
                nome: "EMPRESA UNIPESSOAL TESTES",
                estado: process.state
              };
            })
            this.loadProcesses(processesArray);
          }, error => {
            this.logger.debug(error);
            this.loadProcesses([]);
          });
      }
  }

  openProcess(process) {
    if (localStorage.getItem("returned") != 'consult') {
      localStorage.setItem('returned', 'edit');
      this.logger.debug('Valor do returned' + localStorage.getItem("returned"));
    }
    localStorage.setItem("processNumber", process.processNumber);
    this.logger.debug('Valor do processNumber ' + localStorage.getItem("processNumber"));

    let navigationExtras: NavigationExtras = {
      state: {
        queueName: this.queueName
      }
    };

    this.route.navigate(['/queues-detail'], navigationExtras);
    //this.submissionService.GetSubmissionByProcessNumber(localStorage.getItem("processNumber")).subscribe(result => {
    //  this.logger.debug('Submissão retornada quando pesquisada pelo número de processo', result);
    //  this.submissionService.GetSubmissionByID(result[0].submissionId).subscribe(resul => {
    //    this.logger.debug('Submissão com detalhes mais especificos ', resul);
    //    this.clientService.GetClientById(resul.id).subscribe(res => {
    //      this.route.navigate(['/client']);
    //    });
    //  });
    //});
  }

  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    var context = this;
  }
  ngAfterViewInit(){
    // this.processes = new MatTableDataSource();
    // this.processes.paginator = this.paginator;
  }

  loadProcesses(processValues: ProcessFT[]){
    this.processes.data = processValues;
    // this.processes.paginator = this.paginator;
  }

}
