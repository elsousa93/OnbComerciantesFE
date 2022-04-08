import { Component, OnInit, ViewChild, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms'
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LISTFILES } from './listFiles';


@Component({
  selector: 'app-drop-down',
  templateUrl: './drop-down.component.html',
  styleUrls: ['./drop-down.component.css']
})
export class DropDownComponent implements OnInit {

  listF = LISTFILES;
  listValue!: FormGroup;
  listCode?: string = "";
  displayValueSearch = '';

  @Output()  nameEmitter = new EventEmitter<string>();

  sendToParent() {
    this.nameEmitter.emit(this.displayValueSearch);
  }

  getValueSearch(val:string) {
    console.warn("drop-down.component recebeu: ",val)
    this.displayValueSearch = val;

  }
 

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.listValue = this.formBuilder.group({
      listF: ['']
    })
  }


  changeListElement(e: any) {
    console.log(e.target.value)
    this.listCode = e.target.value;

  }


}
