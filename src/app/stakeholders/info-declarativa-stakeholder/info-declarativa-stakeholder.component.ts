import { Component, OnInit, Inject } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { IStakeholders } from '../IStakeholders.interface'
import { ActivatedRoute, Route } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { codes } from './indicativo';
import { SchoolingData } from './schooling';
import { maritalstatus } from './maritalstatus';
import { ViewChild, EventEmitter, Output } from '@angular/core';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-info-declarativa-stakeholder',
  templateUrl: './info-declarativa-stakeholder.component.html',
  styleUrls: ['./info-declarativa-stakeholder.component.css']
})
  /**
   * Nesta página há vários Form Groups
   * */
export class InfoDeclarativaStakeholderComponent implements OnInit {
  //----------Ecrã Comerciante-----------
  ListaInd = codes;
  formContactos!: FormGroup;
  callingCodeStakeholder?: string = "";


  //----------Ecrã Intervenientes---------
  ListaSchoolingStatus = SchoolingData;
  formSchooling!: FormGroup;
  schoolingStakeholder?: string = "";

  ListaMaritalStatus = maritalstatus;
  formMarital!: FormGroup;
  maritalStatusStakeholder?: string = "";

  displayValueSearch = '';

  public newStakeholder: IStakeholders = {

    flagElectableStakeholder: true,
    flagValidStakeholder: true,
    callingCodeStakeholder: "1",
    phoneStakeholder: 453,
    emailStakeholder: "",
    hourContractStart: 9,
    hourContractEnd: 23,
    schoolingStakeholder: "",
    maritalStatusStakeholder: "",
    finEstateStakeholder: 5000,
    monthlyEarnsStakeholder: 1234,

  } as unknown as IStakeholders;

  @Output() nameEmitter = new EventEmitter<string>();

 // sendToParent() {
 //   this.nameEmitter.emit(this.displayValueSearch);
 // }

  constructor(private formBuilder: FormBuilder) {
    this.ngOnInit();
  }

  ngOnInit(): void {
    this.formContactos = this.formBuilder.group({
      listF: ['']
    })
  }

  getValueSearch(val: string) {
    console.warn("component recebeu: ", val)
    this.displayValueSearch = val;
  }

  changeListElement(variavel: string, e: any) {
    console.log(e.target.value)
    this.callingCodeStakeholder = e.target.value;
    //update ao newStakeholder aqui?
      // this.newStakeholder.callingCodeStakeholder =  this.callingCodeStakeholder;
  }
  changeListElementSchool(variavel: string, e: any) {
    console.log(e.target.value)
    this.schoolingStakeholder = e.target.value;
    //update ao newStakeholder aqui?
      // this.newStakeholder.schoolingStakeholder =  this.schoolingStakeholder;
  }
  changeListElementMarital(variavel: string, e: any) {
    console.log(e.target.value)
    this.maritalStatusStakeholder = e.target.value;
    //update ao newStakeholder aqui?
    // this.newStakeholder.maritalStatusStakeholder =  this.maritalStatusStakeholder;
  }
  submit(e) {
    console.log(e);
  }

}
