import { Component, Inject, OnInit, ViewChild } from '@angular/core';
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
import { Configuration, configurationToken } from '../configuration';
import { MatSnackBar } from '@angular/material/snack-bar';

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

  public url: string;
  public search: boolean = false;

  baseUrl = '';

  ListaDocType;

  
  constructor(private logger: LoggerService, private snackBar: MatSnackBar, private route: Router, public modalService: BsModalService, private data: DataService, private processService: ProcessService, private tableInfo: TableInfoService, private translate: TranslateService, public appComponent: AppComponent, @Inject(configurationToken) private configuration: Configuration) {

    this.appComponent.toggleSideNav(false);

    this.baseUrl = configuration.baseUrl;

    //Gets ProcessNr when search on homepage does not return results 
    if (this.route.getCurrentNavigation().extras.state) {
      this.navbarProcessNumberSearch = this.route.getCurrentNavigation().extras.state["processNumber"];
      // se entrar aqui é pq a pesquisa não tem resultados
      this.snackBar.open(this.translate.instant('searches.emptyList'), '', {
        duration: 4000,
        panelClass: ['snack-bar']
      });
    }

    this.subs.push(this.tableInfo.GetAllDocumentTypes().subscribe(result => {
      this.ListaDocType = result;
      this.ListaDocType = this.ListaDocType.sort((a, b) => a.description> b.description? 1 : -1); //ordenar resposta
    }));


    this.initializeForm();    
  }

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

  submitSearch() {
    if (this.form.valid)
      this.searchProcess();
  }

  checkAdvancedSearch(search){
      if (search) {
        this.url += '&';
    }
  }

  searchProcess() {
    this.search = false;
    this.logger.debug(this.form);
    this.loadProcesses([]);
      var processStateToSearch = this.form.get("state").value;
      var processNumber = this.form.get('processNumber').value;
      var processDocType = this.form.get('documentType').value;
      var processDocNumber = this.form.get('documentNumber').value;
      var processDateStart = this.form.get('processDateStart').value;
      var processDateUntil = this.form.get('processDateEnd').value;

      var encodedCode = encodeURIComponent(processNumber);
      this.url = this.baseUrl + 'process?';

      if (processStateToSearch!='') {
        this.checkAdvancedSearch(this.search);
        this.url += 'state=' + processStateToSearch;
        this.search = true;
      } if (processNumber!='') {
        this.checkAdvancedSearch(this.search);
        this.url += 'number=' + encodedCode;
        this.search = true;
      } if (processDocType!='' && processDocNumber != '') {
        this.checkAdvancedSearch(this.search);
        this.url += 'documentType=' + processDocType + '&documentNumber=' + processDocNumber;
        this.search = true;
      } if (processDateStart!='') {
        this.checkAdvancedSearch(this.search);
        this.url += 'fromStartedAt=' + processDateStart;
        this.search = true;
      } if (processDateUntil!='') {
        this.checkAdvancedSearch(this.search);
        this.url += 'untilStartedAt=' + processDateUntil;
        this.search = true;
      }

      if (this.url == this.baseUrl + 'process?'){
        this.snackBar.open(this.translate.instant('searches.emptySearch'), '', {
          duration: 4000,
          panelClass: ['snack-bar']
        });
      }

      if (processDocType!='' && processDocNumber == '' || processDocType=='' && processDocNumber != ''){
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
        let processesArray: Process[] = result.items.map<Process>((process) => {
          return {
            processNumber: process.processNumber,
            nipc: 529463466,
            nome: "EMPRESA UNIPESSOAL TESTES",
            estado: process.state
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
        this.logger.debug("deu erro");
        this.logger.debug(error);
        this.loadProcesses([]);
      });
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

  loadProcesses(processValues: Process[]){
    this.processes.data = processValues;
  }
}
