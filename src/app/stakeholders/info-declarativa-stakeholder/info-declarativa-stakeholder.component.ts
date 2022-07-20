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
import { CountryInformation } from '../../table-info/ITable-info.interface';
import { TableInfoService } from '../../table-info/table-info.service';

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


  //Informação de campos/tabelas
  internationalCallingCodes: CountryInformation[];

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

  selectedStakeholder = {
    
  } as IStakeholders;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  constructor(private formBuilder: FormBuilder, http: HttpClient, @Inject('BASE_URL') baseUrl: string, private route: Router, private tableInfo: TableInfoService) {
    this.ngOnInit();
    http.get<IStakeholders[]>(baseUrl + 'bestakeholders/GetAllStakes').subscribe(result => {
      this.stakeholders = result;
      this.dataSource.data = this.stakeholders;
    }, error => console.error(error));

    this.callingCodeStakeholder = tableInfo.GetAllCountries();

    this.formContactos.controls["countryCode"].valueChanges.subscribe(data => {
      if (data !== '') {
        this.formContactos.controls["phoneNumber"].setValidators([Validators.required]);
      } else {
        this.formContactos.controls["phoneNumber"].clearValidators();
      }
      this.formContactos.controls["phoneNumber"].updateValueAndValidity();
    });

    this.formContactos.controls["phoneNumber"].valueChanges.subscribe(data => {
      if (data !== '') {
        this.formContactos.controls["countryCode"].setValidators([Validators.required]);
      } else {
        this.formContactos.controls["countryCode"].clearValidators();
      }
      this.formContactos.controls["countryCode"].updateValueAndValidity();
    });
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
    this.newStakeholder.email = this.formContactos.value.email;
    this.newStakeholder.phone1.countryCode = this.formContactos.value.countryCode;
    this.newStakeholder.phone1.phoneNumber = this.formContactos.value.phoneNumber;
    this.route.navigate(['/info-declarativa-lojas']);
  }

  clickRow(stake: any) {
    this.selectedStakeholder = stake;
  }

}
