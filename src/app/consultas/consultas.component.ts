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

interface Process {
  processNumber: string;
  nipc: number;
  nome: string;
  estado: string;
}

@Component({
  selector: 'app-consultas',
  templateUrl: './consultas.component.html',
  styleUrls: ['./consultas.component.css']
})

export class ConsultasComponent implements OnInit{
  processes: MatTableDataSource<Process> = new MatTableDataSource();

  displayedColumns = ['processNumber', 'nipc', 'nome', 'estado', 'abrirProcesso'];
  @ViewChild('paginatorConsultas') set paginatorConsultas(pager:MatPaginator) {
    if (pager) {
      this.processes.paginator = pager;
      this.processes.paginator._intl = new MatPaginatorIntl();
      this.processes.paginator._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');
      this.processes.paginator.pageSizeOptions = [10, 25, 50, 100];
      this.processes.paginator.length = 10;
    }
  }
  @ViewChild(MatSort) sort: MatSort;


  //////////////////////
  navbarProcessNumberSearch: string = '';
  form: FormGroup;
  availableStates = [];

  //////////////////////
  public map = new Map();
  public currentPage: number;
  public subscription: Subscription;
  public subs: Subscription[] = [];

  ListaDocType;

  
  constructor(private logger: LoggerService, private route: Router, public modalService: BsModalService, private data: DataService, private processService: ProcessService, private tableInfo: TableInfoService, private translate: TranslateService, public appComponent: AppComponent) {

    this.appComponent.toggleSideNav(false);


    this.subs.push(this.tableInfo.GetAllDocumentTypes().subscribe(result => {
      this.ListaDocType = result;
      this.ListaDocType = this.ListaDocType.sort((a, b) => a.description> b.description? 1 : -1); //ordenar resposta
    }));


    this.initializeForm();    
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
            let processesArray: Process[] = resul.items.map<Process>((process) => {
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
            let processesArray: Process[] = resul.items.map<Process>((process) => {
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
            let processesArray: Process[] = resul.items.map<Process>((process) => {
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
            let processesArray: Process[] = resul.items.map<Process>((process) => {
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
            let processesArray: Process[] = resul.items.map<Process>((process) => {
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
    this.logger.debug(process);
    localStorage.setItem("processNumber", process.processNumber);
    localStorage.setItem("returned", 'consult');

    this.route.navigate(['/clientbyid']);
  }

  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
  }

  ngAfterViewInit(){
  }

  loadProcesses(processValues: Process[]){
    this.processes.data = processValues;
  }
}
