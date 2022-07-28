import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Renderer2 } from '@angular/core';
import { Component, Inject, Input, OnInit, VERSION, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription, take } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { Client } from '../client/Client.interface';
import { DataService } from '../nav-menu-interna/data.service';
import { ProcessGet, ProcessService } from '../process/process.service';
import { TableInfoService } from '../table-info/table-info.service';


@Component({
  selector: 'app-consultas',
  templateUrl: './consultas.component.html'
})

export class ConsultasComponent implements OnInit{

  //////////////////////
  navbarProcessNumberSearch: string = '';
  form: FormGroup;
  processToDisplay: ProcessGet[] = [];
  availableStates = [];

  //////////////////////
  public map = new Map();
  public currentPage: number;
  public subscription: Subscription;

  
  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string,
    private route: Router, private data: DataService, private processService: ProcessService, private tableInfo: TableInfoService,
              private router: ActivatedRoute) {

    if (this.router.snapshot.queryParams['id']) {
      this.navbarProcessNumberSearch = this.router.snapshot.paramMap.get('id');
      this.initializeForm();
      this.searchProcess();
    } else {
      this.initializeForm();
    }
   
      

    //Initialize Form
    
    this.ngOnInit();
    this.data.updateData(false, 0);
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
        this.processService.searchProcessByNumber(encodedCode).subscribe(result => {
          var processes = result;
          console.log(processes);
          this.processToDisplay = processes;
        }, error => {
          console.log("deu erro");
          console.log(error);
        });
      } else {
        var processStateToSearch = this.form.get("state").value;
        this.processService.searchProcessByState(processStateToSearch).subscribe(result => {
          var processes = result;
          console.log(processes);
          this.processToDisplay = processes;

        }, error => {
          console.log(error);
        });
      }
  }

  openProcess(process) {

  }

ngOnInit(): void {
  this.subscription = this.data.currentData.subscribe(map => this.map = map);
  this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);

  var context = this;
}

}
