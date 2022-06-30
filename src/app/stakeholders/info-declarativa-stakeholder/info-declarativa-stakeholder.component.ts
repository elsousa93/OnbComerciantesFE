import { Component, OnInit, Inject, AfterViewInit } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { IStakeholders } from '../IStakeholders.interface'
import { ActivatedRoute, Route, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { codes } from './indicativo';
import { ViewChild, EventEmitter, Output } from '@angular/core';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-info-declarativa-stakeholder',
  templateUrl: './info-declarativa-stakeholder.component.html',
  styleUrls: ['./info-declarativa-stakeholder.component.css']
})
/**
 * Nesta página há vários Form Groups
 * */
export class InfoDeclarativaStakeholderComponent implements OnInit, AfterViewInit {
  //----------Ecrã Comerciante-----------
  ListaInd = codes;
  formContactos!: FormGroup;
  callingCodeStakeholder?: string = "";

  displayValueSearch = '';

  public newStakeholder: IStakeholders = {



  } as unknown as IStakeholders;

  @Output() nameEmitter = new EventEmitter<string>();

  // sendToParent() {
  //   this.nameEmitter.emit(this.displayValueSearch);
  // }

  stakeholders: IStakeholders[] = [];
  displayedColumns: string[] = ['fiscalId', 'shortName', 'identificationDocumentId', 'elegible', 'valid'];
  dataSource = new MatTableDataSource<IStakeholders>(this.stakeholders);
  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  constructor(private formBuilder: FormBuilder, http: HttpClient, @Inject('BASE_URL') baseUrl: string, private route: Router) {
    this.ngOnInit();
    http.get<IStakeholders[]>(baseUrl + 'bestakeholders/GetAllStakes').subscribe(result => {
      this.stakeholders = result;
      this.dataSource.data = this.stakeholders;
    }, error => console.error(error));
  }

  ngOnInit(): void {
    this.formContactos = this.formBuilder.group({
      listF: [''],
      countryCode: new FormControl(''),
      phoneNumber: new FormControl(''),
      email: new FormControl(''),
    })
  }

  getValueSearch(val: string) {
    console.warn("component recebeu: ", val)
    this.displayValueSearch = val;
  }

  changeListElement(variavel: string, e: any) {
    console.log(e.target.value)
    this.callingCodeStakeholder = e.target.value;
    console.log(this.formContactos.value.countryCode);
    console.log(this.formContactos.value.phoneNumber);
    console.log(this.formContactos.value.email);
    //update ao newStakeholder aqui?
    // this.newStakeholder.callingCodeStakeholder =  this.callingCodeStakeholder;
  }

  submit(e) {
    console.log(e);
  }

  clickRow(id: number) {
    console.log('Carregou no stakeholder com o id: ' + id);
  }

}
