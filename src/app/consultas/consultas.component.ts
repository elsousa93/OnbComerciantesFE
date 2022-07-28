import { HttpClient } from '@angular/common/http';
import { StringMap } from '@angular/compiler/src/compiler_facade_interface';
import { AfterViewInit, Renderer2 } from '@angular/core';
import { Component, Inject, Input, OnInit, VERSION, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription, take } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { Client } from '../client/Client.interface';
import { DataService } from '../nav-menu-interna/data.service';

interface Process {
  processNumber: number;
  nipc: number;
  nome: string;
  estado: string;
  estadoDeConclusao: string;
}

const testValues : Process[] = [
  {processNumber: 240370, nipc:529463466,nome: "EMPRESA UNIPESSOAL TESTES", estado: "PENDENTE DE ARQUIVO FÍSICO", estadoDeConclusao: "EM CURSO"},
  {processNumber: 240380, nipc:529463466,nome: "EMPRESA UNIPESSOAL TESTES", estado: "PENDENTE DE ARQUIVO FÍSICO", estadoDeConclusao: "EM CURSO"},
  {processNumber: 240390, nipc:529463466,nome: "EMPRESA UNIPESSOAL TESTES", estado: "PENDENTE DE ARQUIVO FÍSICO", estadoDeConclusao: "EM CURSO"},
  {processNumber: 240400, nipc:529463466,nome: "EMPRESA UNIPESSOAL TESTES", estado: "PENDENTE DE ARQUIVO FÍSICO", estadoDeConclusao: "EM CURSO"},
  {processNumber: 240400, nipc:529463466,nome: "EMPRESA UNIPESSOAL TESTES", estado: "PENDENTE DE ARQUIVO FÍSICO", estadoDeConclusao: "EM CURSO"},
  {processNumber: 240400, nipc:529463466,nome: "EMPRESA UNIPESSOAL TESTES", estado: "PENDENTE DE ARQUIVO FÍSICO", estadoDeConclusao: "EM CURSO"},
  {processNumber: 240400, nipc:529463466,nome: "EMPRESA UNIPESSOAL TESTES", estado: "PENDENTE DE ARQUIVO FÍSICO", estadoDeConclusao: "EM CURSO"},
  {processNumber: 240400, nipc:529463466,nome: "EMPRESA UNIPESSOAL TESTES", estado: "PENDENTE DE ARQUIVO FÍSICO", estadoDeConclusao: "EM CURSO"},
  {processNumber: 240380, nipc:529463466,nome: "EMPRESA UNIPESSOAL TESTES", estado: "PENDENTE DE ARQUIVO FÍSICO", estadoDeConclusao: "EM CURSO"},
  {processNumber: 240390, nipc:529463466,nome: "EMPRESA UNIPESSOAL TESTES", estado: "PENDENTE DE ARQUIVO FÍSICO", estadoDeConclusao: "EM CURSO"},
  {processNumber: 240400, nipc:529463466,nome: "EMPRESA UNIPESSOAL TESTES", estado: "PENDENTE DE ARQUIVO FÍSICO", estadoDeConclusao: "EM CURSO"},
  {processNumber: 240400, nipc:529463466,nome: "EMPRESA UNIPESSOAL TESTES", estado: "PENDENTE DE ARQUIVO FÍSICO", estadoDeConclusao: "EM CURSO"},
  {processNumber: 240400, nipc:529463466,nome: "EMPRESA UNIPESSOAL TESTES", estado: "PENDENTE DE ARQUIVO FÍSICO", estadoDeConclusao: "EM CURSO"},
  {processNumber: 240400, nipc:529463466,nome: "EMPRESA UNIPESSOAL TESTES", estado: "PENDENTE DE ARQUIVO FÍSICO", estadoDeConclusao: "EM CURSO"},
  {processNumber: 240400, nipc:529463466,nome: "EMPRESA UNIPESSOAL TESTES", estado: "PENDENTE DE ARQUIVO FÍSICO", estadoDeConclusao: "EM CURSO"},
  {processNumber: 240380, nipc:529463466,nome: "EMPRESA UNIPESSOAL TESTES", estado: "PENDENTE DE ARQUIVO FÍSICO", estadoDeConclusao: "EM CURSO"},
  {processNumber: 240390, nipc:529463466,nome: "EMPRESA UNIPESSOAL TESTES", estado: "PENDENTE DE ARQUIVO FÍSICO", estadoDeConclusao: "EM CURSO"},
  {processNumber: 240400, nipc:529463466,nome: "EMPRESA UNIPESSOAL TESTES", estado: "PENDENTE DE ARQUIVO FÍSICO", estadoDeConclusao: "EM CURSO"},
  {processNumber: 240400, nipc:529463466,nome: "EMPRESA UNIPESSOAL TESTES", estado: "PENDENTE DE ARQUIVO FÍSICO", estadoDeConclusao: "EM CURSO"},
  {processNumber: 240400, nipc:529463466,nome: "EMPRESA UNIPESSOAL TESTES", estado: "PENDENTE DE ARQUIVO FÍSICO", estadoDeConclusao: "EM CURSO"},
  {processNumber: 240400, nipc:529463466,nome: "EMPRESA UNIPESSOAL TESTES", estado: "PENDENTE DE ARQUIVO FÍSICO", estadoDeConclusao: "EM CURSO"},
  {processNumber: 240400, nipc:529463466,nome: "EMPRESA UNIPESSOAL TESTES", estado: "PENDENTE DE ARQUIVO FÍSICO", estadoDeConclusao: "EM CURSO"}
]
@Component({
  selector: 'app-consultas',
  templateUrl: './consultas.component.html',
  styleUrls: ['./consultas.component.css']
})

export class ConsultasComponent implements OnInit{
  form: FormGroup;
  processes: MatTableDataSource<Process>;

  displayedColumns = ['processNumber', 'nipc', 'nome', 'estado', 'estadoDeConclusao'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;


  public map = new Map();
  public currentPage: number;
  public subscription: Subscription;

  
  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string,
  private route: Router, private data: DataService,
  private router: ActivatedRoute) {

    this.ngOnInit();
  
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

  loadProcesses(){
    this.processes = new MatTableDataSource(testValues);
  }

}