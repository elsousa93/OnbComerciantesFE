import { Component, OnInit, Inject } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { IStakeholders } from '../IStakeholders.interface'
import { ActivatedRoute, Route } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { codes } from './indicativo';
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

  displayValueSearch = '';

  public newStakeholder: IStakeholders = {



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

  submit(e) {
    console.log(e);
  }

}
