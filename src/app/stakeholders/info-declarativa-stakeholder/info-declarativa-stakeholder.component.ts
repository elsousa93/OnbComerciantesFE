import { Component, OnInit, Inject, AfterViewInit } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
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
import { DataService } from 'src/app/nav-menu-interna/data.service';
import { StakeholderService } from '../stakeholder.service';
import { Configuration, configurationToken } from 'src/app/configuration';
import { infoDeclarativaForm } from 'src/app/client/info-declarativa/info-declarativa.model';

@Component({
  selector: 'app-info-declarativa-stakeholder',
  templateUrl: './info-declarativa-stakeholder.component.html',
  styleUrls: ['./info-declarativa-stakeholder.component.css']
})
/**
 * Nesta página há vários Form Groups
 * */
export class InfoDeclarativaStakeholderComponent implements OnInit, AfterViewInit {
  private baseUrl: string;


  //----------Ecrã Comerciante-----------
  ListaInd = codes;
  formContactos!: FormGroup;
  callingCodeStakeholder?: string = "";

  displayValueSearch = '';

  submissionStakeholders: IStakeholders[] = [];
  submissionId: string;
  currentStakeholder: IStakeholders = null;


  //Informação de campos/tabelas
  internationalCallingCodes: CountryInformation[];

  public newStakeholder: IStakeholders = {



  } as IStakeholders;

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
  phone: AbstractControl;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  constructor(private formBuilder: FormBuilder, http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private route: Router, private data: DataService, private tableInfo: TableInfoService, private stakeholderService: StakeholderService) {
    this.baseUrl = configuration.baseUrl;

    
    this.ngOnInit();
    
    http.get<IStakeholders[]>(this.baseUrl + 'bestakeholders/GetAllStakes').subscribe(result => {
      this.stakeholders = result;
      this.dataSource.data = this.stakeholders;
    }, error => console.error(error));

    this.tableInfo.GetAllCountries().subscribe(result => {
      this.internationalCallingCodes = result;
    });

    var context = this;
    this.submissionId = localStorage.getItem("submissionId");

    stakeholderService.GetAllStakeholdersFromSubmission(this.submissionId).subscribe(result => {
      result.forEach(function (value, index) {
        console.log(value);
        context.stakeholderService.GetStakeholderFromSubmission(context.submissionId, value.id).subscribe(result => {
          console.log(result);
          context.submissionStakeholders.push(result);
        }, error => {
          console.log(error);
        });
      });
    }, error => {
      console.log(error);
    });

    
    this.callingCodeStakeholder = tableInfo.GetAllCountries();

    /* this.formContactos.controls["countryCode"].valueChanges.subscribe(data => {
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
    }); */
  }

  validPhoneNumber(control: AbstractControl) : ValidationErrors | null {  
    let countryCodeExists = Validators.required(control.get("countryCode")) == null
    let phoneNumberExists = Validators.required(control.get("phoneNumber")) == null

    //Se nenhum existir, é valido
    if (!countryCodeExists && !phoneNumberExists){
      return null;
    }
    //Se só um existir, retorna erro
    if (!countryCodeExists || !phoneNumberExists){
      return {"missingValue" : countryCodeExists ? "phoneNumber" : "countryCode"};
    }
    //Se ambos existirem, proceder à validação do indicativo/numero
    let phoneNumber = control.get("phoneNumber").value;
    let countryCode = control.get("countryCode").value;
    if (countryCode == "+351") { //Indicativo de Portugal
      if (phoneNumber && phoneNumber.length == 9 && phoneNumber.startsWith('9')) {
        return null;
      } else {
        return {invalidNumber : true}
      }
    } else { // Indicativo não é de Portugal
      if (phoneNumber && phoneNumber.length <= 16) {
        return null;
      } else {
        return {invalidNumber : true}
      }
    }
  }

  ngOnInit(): void {
    this.data.updateData(false, 6, 2);
    this.newStakeholder = JSON.parse(localStorage.getItem("info-declarativa"))?.stakeholder ?? this.newStakeholder

    this.formContactos = this.formBuilder.group({
      listF: [''],
      phone: this.formBuilder.group({
        countryCode: new FormControl(this.newStakeholder.phone1?.countryCode),
        phoneNumber: new FormControl(this.newStakeholder.phone1?.phoneNumber)
      },{validators: [this.validPhoneNumber]}),
      email: new FormControl(this.newStakeholder.email, Validators.required),
    })
    this.phone = this.formContactos.get("phone");

  }

  getValueSearch(val: string) {
    console.warn("component recebeu: ", val)
    this.displayValueSearch = val;
  }

  changeListElement(varkjkiavel: string, e: any) {
    console.log(e.target.value)
    this.formContactos.get("phone").get("countryCode").setValue(e.target.value);
    console.log(this.formContactos.value.countryCode);
    console.log(this.formContactos.value.phoneNumber);
    console.log(this.formContactos.value.email);
    //update ao newStakeholder aqui?
    // this.newStakeholder.callingCodeStakeholder =  this.callingCodeStakeholder;
  }

  submit() {
    this.newStakeholder = this.currentStakeholder;
    this.newStakeholder = {
      email : this.formContactos.value.email,
      phone1: {
        countryCode : this.formContactos.value.countryCode,
        phoneNumber : this.formContactos.value.phoneNumber
      }
    };
    let storedForm: infoDeclarativaForm = JSON.parse(localStorage.getItem("info-declarativa")) ?? new infoDeclarativaForm();
    storedForm.stakeholder = this.newStakeholder
    localStorage.setItem("info-declarativa", JSON.stringify(storedForm));
    this.route.navigate(['/info-declarativa-lojas']);
  }

  clickRow(stake: any) {
    this.selectedStakeholder = stake;
  }

  selectStakeholder(stakeholder) {
    console.log(this.currentStakeholder);
    console.log(stakeholder);
    this.currentStakeholder = stakeholder;
    console.log(this.currentStakeholder);
    console.log(this.currentStakeholder === stakeholder);
    
  }

}
