import { Component, OnInit, Inject, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, NgForm, FormGroup, FormControl, AbstractControl, FormGroupDirective } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { IStakeholders } from '../IStakeholders.interface';
import { Router } from '@angular/router';
import { DataService } from '../../nav-menu-interna/data.service';
import { TableInfoService } from '../../table-info/table-info.service';
import { Configuration, configurationToken } from 'src/app/configuration';
import { infoDeclarativaForm, validEmail, validPhoneNumber } from 'src/app/client/info-declarativa/info-declarativa.model';
import { LoggerService } from 'src/app/logger.service';
import { CountryInformation } from 'src/app/table-info/ITable-info.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-info-stakeholder',
  templateUrl: './info-stakeholder.component.html',
  styleUrls: ['./info-stakeholder.component.css']
})
export class InfoStakeholderComponent implements OnInit {
  returned: string;
  currentStakeholder: IStakeholders = null;
  phone: AbstractControl;
  submissionId: string;
  formContactos!: FormGroup;
  public newStakeholder: IStakeholders = {} as IStakeholders;
  edit: boolean = false;
  public subscription: Subscription;
  public map: Map<number, boolean>;
  public currentPage: number;

  //Informação de campos/tabelas
  internationalCallingCodes: CountryInformation[];

  @Output() nameEmitter = new EventEmitter<string>();

  constructor(private logger : LoggerService, private formBuilder: FormBuilder, http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private route: Router, private data: DataService, private tableInfo: TableInfoService, private rootFormGroup: FormGroupDirective) {

    //this.ngOnInit();

    this.tableInfo.GetAllCountries().subscribe(result => {
      this.internationalCallingCodes = result;
      this.internationalCallingCodes = this.internationalCallingCodes.sort((a, b) => a.description> b.description? 1 : -1); //ordenar resposta
    });

  }

  ngOnInit(): void {
    this.initializeForm();
    if (this.rootFormGroup.form != null) {
      this.rootFormGroup.form.setControl('contacts', this.formContactos);
      this.edit = true;
      if (this.returned == 'consult') {
        this.formContactos.disable();
      }
    } else {
      this.subscription = this.data.currentData.subscribe(map => this.map = map);
      this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    }

    this.returned = localStorage.getItem("returned");
    this.submissionId = localStorage.getItem("submissionId");
    this.newStakeholder = JSON.parse(localStorage.getItem("info-declarativa"))?.stakeholder ?? this.newStakeholder;
  }

  initializeForm() {
    this.formContactos = new FormGroup({
      phone: new FormGroup({
        countryCode: new FormControl((this.currentStakeholder != null) ? this.currentStakeholder.phone1?.countryCode : '', Validators.required),
        phoneNumber: new FormControl((this.currentStakeholder != null) ? this.currentStakeholder.phone1?.phoneNumber : '', Validators.required)
      }, { validators: [validPhoneNumber] }),
      email: new FormControl((this.currentStakeholder != null) ? this.currentStakeholder.email : '', Validators.email)
    })
    this.rootFormGroup.form.setControl('contacts', this.formContactos);
    this.phone = this.formContactos.get("phone");
  }

    get emailValid() {
    return this.formContactos.get('email');
  }

  changeListElement(string:string,e: any) {
    this.formContactos.get("phone").get("countryCode").setValue(e.target.value);
  }

  numericOnly(event): boolean {
    var ASCIICode = (event.which) ? event.which : event.keyCode;

    if (ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57))
      return false;
    return true;
  }

  resetForm() {
    this.initializeForm();
  }
}
