import { HttpClient } from '@angular/common/http';
import { StringMap } from '@angular/compiler/src/compiler_facade_interface';
import { AfterViewInit, Renderer2 } from '@angular/core';
import { Component, Inject, Input, OnInit, VERSION, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription, take } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { Client } from '../client/Client.interface';
import { DataService } from '../nav-menu-interna/data.service';
import { ProcessGet, ProcessService } from '../process/process.service';
import { TableInfoService } from '../table-info/table-info.service';
import { SubmissionService } from '../submission/service/submission-service.service';
import { ClientService } from '../client/client.service';
import { Configuration, configurationToken } from '../configuration';
import { LoggerService } from 'src/app/logger.service';

interface ProcessFT {
  processNumber: string;
  contractNumber: string;
  processDate: string;
  nome: string;
  user: string;
}

@Component({
  selector: 'app-consultas-ft',
  templateUrl: './consultas-ft.component.html',
  styleUrls: ['./consultas-ft.component.css']
})

export class ConsultasFTComponent implements OnInit{
  processes: MatTableDataSource<ProcessFT> = new MatTableDataSource();

  displayedColumns = ['processNumber', 'contractNumber', 'processDate', 'nome', 'user', 'abrirProcesso'];
  @ViewChild('paginator') paginator: MatPaginator;
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
    private route: Router, private data: DataService, private processService: ProcessService, private tableInfo: TableInfoService,
    private router: ActivatedRoute, private submissionService: SubmissionService, private clientService: ClientService) {

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
      var processNumber = this.form.get('processNumber').value;
      if (processNumber !== '') {
        this.logger.debug(processNumber);
        var encodedCode = encodeURIComponent(processNumber);
        this.processService.searchProcessByNumber(encodedCode, 0, 1).subscribe(result => {
          this.processService.searchProcessByNumber(encodedCode, 0, result.pagination.total).subscribe(resul => {
            let processesArray: ProcessFT[] = resul.items.map<ProcessFT>((process) => {
              return {
                processNumber: process.processNumber,
                contractNumber: "123",
                processDate: "12-02-2022",
                nome: "EMPRESA UNIPESSOAL TESTES",
                user: "EMPRESA UNIPESSOAL TESTES",
              };
            })
            this.loadProcesses(processesArray);
          }, error => {
            this.logger.debug("deu erro");
            this.logger.debug(error);
            this.loadProcesses([]);
          });
          });
          
      } else {
        var processStateToSearch = this.form.get("state").value;
        this.processService.searchProcessByState(processStateToSearch, 0, 1).subscribe(result => {
          this.processService.searchProcessByState(processStateToSearch, 0, result.pagination.total).subscribe(resul => {
            let processesArray: ProcessFT[] = resul.items.map<ProcessFT>((process) => {
              return {
                processNumber: process.processNumber,
                contractNumber: "123",
                processDate: "12-02-2022",
                nome: "EMPRESA UNIPESSOAL TESTES",
                user: "EMPRESA UNIPESSOAL TESTES",
              };
            })
            this.loadProcesses(processesArray);
          }, error => {
            this.logger.debug(error);
            this.loadProcesses([]);
          });
          });
      }
  }

  openProcess(process) {
    this.logger.debug(process);
    localStorage.setItem("processNumber", process.processNumber);
    localStorage.setItem("returned", 'consult');

    this.route.navigate(['/client']);
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
    this.processes = new MatTableDataSource();
    this.processes.paginator = this.paginator;
  }

  loadProcesses(processValues: ProcessFT[]){
    this.processes = new MatTableDataSource(processValues);
    this.processes.paginator = this.paginator;
  }

}
