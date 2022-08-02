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

interface Process {
  processNumber: string;
  nipc: number;
  nome: string;
  estado: string;
  estadoDeConclusao: string;
}

const testValues : Process[] = [
  {processNumber: "240370", nipc:529463466,nome: "EMPRESA UNIPESSOAL TESTES", estado: "PENDENTE DE ARQUIVO FÍSICO", estadoDeConclusao: "EM CURSO"},
  {processNumber: "240380", nipc:529463466,nome: "EMPRESA UNIPESSOAL TESTES", estado: "PENDENTE DE ARQUIVO FÍSICO", estadoDeConclusao: "EM CURSO"},
  {processNumber: "240390", nipc:529463466,nome: "EMPRESA UNIPESSOAL TESTES", estado: "PENDENTE DE ARQUIVO FÍSICO", estadoDeConclusao: "EM CURSO"},
  {processNumber: "240400", nipc:529463466,nome: "EMPRESA UNIPESSOAL TESTES", estado: "PENDENTE DE ARQUIVO FÍSICO", estadoDeConclusao: "EM CURSO"},
  {processNumber: "240400", nipc:529463466,nome: "EMPRESA UNIPESSOAL TESTES", estado: "PENDENTE DE ARQUIVO FÍSICO", estadoDeConclusao: "EM CURSO"},
  {processNumber: "240400", nipc:529463466,nome: "EMPRESA UNIPESSOAL TESTES", estado: "PENDENTE DE ARQUIVO FÍSICO", estadoDeConclusao: "EM CURSO"},
  {processNumber: "240400", nipc:529463466,nome: "EMPRESA UNIPESSOAL TESTES", estado: "PENDENTE DE ARQUIVO FÍSICO", estadoDeConclusao: "EM CURSO"},
  {processNumber: "240400", nipc:529463466,nome: "EMPRESA UNIPESSOAL TESTES", estado: "PENDENTE DE ARQUIVO FÍSICO", estadoDeConclusao: "EM CURSO"},
  {processNumber: "240380", nipc:529463466,nome: "EMPRESA UNIPESSOAL TESTES", estado: "PENDENTE DE ARQUIVO FÍSICO", estadoDeConclusao: "EM CURSO"},
  {processNumber: "240390", nipc:529463466,nome: "EMPRESA UNIPESSOAL TESTES", estado: "PENDENTE DE ARQUIVO FÍSICO", estadoDeConclusao: "EM CURSO"},
  {processNumber: "240400", nipc:529463466,nome: "EMPRESA UNIPESSOAL TESTES", estado: "PENDENTE DE ARQUIVO FÍSICO", estadoDeConclusao: "EM CURSO"},
  {processNumber: "240400", nipc:529463466,nome: "EMPRESA UNIPESSOAL TESTES", estado: "PENDENTE DE ARQUIVO FÍSICO", estadoDeConclusao: "EM CURSO"},
  {processNumber: "240400", nipc:529463466,nome: "EMPRESA UNIPESSOAL TESTES", estado: "PENDENTE DE ARQUIVO FÍSICO", estadoDeConclusao: "EM CURSO"},
  {processNumber: "240400", nipc:529463466,nome: "EMPRESA UNIPESSOAL TESTES", estado: "PENDENTE DE ARQUIVO FÍSICO", estadoDeConclusao: "EM CURSO"},
  {processNumber: "240400", nipc:529463466,nome: "EMPRESA UNIPESSOAL TESTES", estado: "PENDENTE DE ARQUIVO FÍSICO", estadoDeConclusao: "EM CURSO"},
  {processNumber: "240380", nipc:529463466,nome: "EMPRESA UNIPESSOAL TESTES", estado: "PENDENTE DE ARQUIVO FÍSICO", estadoDeConclusao: "EM CURSO"},
  {processNumber: "240390", nipc:529463466,nome: "EMPRESA UNIPESSOAL TESTES", estado: "PENDENTE DE ARQUIVO FÍSICO", estadoDeConclusao: "EM CURSO"},
  {processNumber: "240400", nipc:529463466,nome: "EMPRESA UNIPESSOAL TESTES", estado: "PENDENTE DE ARQUIVO FÍSICO", estadoDeConclusao: "EM CURSO"},
  {processNumber: "240400", nipc:529463466,nome: "EMPRESA UNIPESSOAL TESTES", estado: "PENDENTE DE ARQUIVO FÍSICO", estadoDeConclusao: "EM CURSO"},
  {processNumber: "240400", nipc:529463466,nome: "EMPRESA UNIPESSOAL TESTES", estado: "PENDENTE DE ARQUIVO FÍSICO", estadoDeConclusao: "EM CURSO"},
  {processNumber: "240400", nipc:529463466,nome: "EMPRESA UNIPESSOAL TESTES", estado: "PENDENTE DE ARQUIVO FÍSICO", estadoDeConclusao: "EM CURSO"},
  {processNumber: "240400", nipc:529463466,nome: "EMPRESA UNIPESSOAL TESTES", estado: "PENDENTE DE ARQUIVO FÍSICO", estadoDeConclusao: "EM CURSO"}
]
@Component({
  selector: 'app-consultas',
  templateUrl: './consultas.component.html',
  styleUrls: ['./consultas.component.css']
})

export class ConsultasComponent implements OnInit{
  processes: MatTableDataSource<Process>;

  displayedColumns = ['processNumber', 'nipc', 'nome', 'estado', 'estadoDeConclusao', 'abrirProcesso'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;


  //////////////////////
  navbarProcessNumberSearch: string = '';
  form: FormGroup;
  availableStates = [];

  //////////////////////
  public map = new Map();
  public currentPage: number;
  public subscription: Subscription;

  
  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string,
    private route: Router, private data: DataService, private processService: ProcessService, private tableInfo: TableInfoService,
    private router: ActivatedRoute, private submissionService: SubmissionService, private clientService: ClientService) {

    this.initializeForm();

   
      

    //Initialize Form
    
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
    console.log(this.form);

      var processNumber = this.form.get('processNumber').value;
      if (processNumber !== '') {
        console.log(processNumber);
        var encodedCode = encodeURIComponent(processNumber);
        this.processService.searchProcessByNumber(encodedCode, 0, 0).subscribe(result => {
          this.processService.searchProcessByNumber(encodedCode, 0, result.pagination.total).subscribe(resul => {
            let processesArray: Process[] = resul.items.map<Process>((process) => {
              return {
                processNumber: process.processId,
                nipc: 529463466,
                nome: "EMPRESA UNIPESSOAL TESTES",
                estado: process.state,
                estadoDeConclusao: "EM CURSO"
              };
            })
            this.loadProcesses(processesArray);

          }, error => {
            console.log("deu erro");
            console.log(error);
          });
          });
          
      } else {
        var processStateToSearch = this.form.get("state").value;
        this.processService.searchProcessByState(processStateToSearch, 0, 0).subscribe(result => {
          this.processService.searchProcessByState(processStateToSearch, 0, result.pagination.total).subscribe(resul => {
            let processesArray: Process[] = resul.items.map<Process>((process) => {
              return {
                processNumber: process.processId,
                nipc: 529463466,
                nome: "EMPRESA UNIPESSOAL TESTES",
                estado: process.state,
                estadoDeConclusao: "EM CURSO"
              };
            })
            this.loadProcesses(processesArray);
          }, error => {
            console.log(error);
          });
          });
      }
  }

  openProcess(process) {
    console.log(process);
    localStorage.setItem("processNumber", process.processNumber);
    localStorage.setItem("consult", 'true');

    this.submissionService.GetSubmissionByProcessNumber(localStorage.getItem("processNumber")).subscribe(result => {
      console.log('Submissão retornada quando pesquisada pelo número de processo', result);
      this.submissionService.GetSubmissionByID(result[0].submissionId).subscribe(resul => {
        console.log('Submissão com detalhes mais especificos ', resul);
        this.clientService.GetClientById(resul.id).subscribe(res => {
          this.route.navigate(['clientbyid/', res.fiscalId]);
        });
      });
    });

  }

  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    var context = this;

    this.loadProcesses();
  }
  ngAfterViewInit(){
    this.processes.paginator = this.paginator;
    this.processes.sort = this.sort;
  }

  loadProcesses(processValues: Process[] = testValues){
    this.processes = new MatTableDataSource(processValues);
  }

}
