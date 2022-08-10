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
import { infoDeclarativaForm, validPhoneNumber } from 'src/app/client/info-declarativa/info-declarativa.model';
import { ConstantPool } from '@angular/compiler';
import { NGXLogger } from 'ngx-logger';

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

  returned: string;
  currentIdx: number = 0;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  constructor(private logger : NGXLogger, private formBuilder: FormBuilder, http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private route: Router, private data: DataService, private tableInfo: TableInfoService, private stakeholderService: StakeholderService) {
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


    this.stakeholderService.GetAllStakeholdersFromSubmission(this.submissionId).subscribe(result => {
      result.forEach(function (value, index) {
        this.logger.debug(value);
        context.stakeholderService.GetStakeholderFromSubmission(context.submissionId, value.id).subscribe(res => {
          this.logger.debug(res);
          context.submissionStakeholders.push(res);
        }, error => {
          this.logger.debug(error);
        });
      });
    }, error => {
      this.logger.debug(error);
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



  ngOnInit(): void {
    this.data.updateData(false, 6, 2);
    this.newStakeholder = JSON.parse(localStorage.getItem("info-declarativa"))?.stakeholder ?? this.newStakeholder

    this.formContactos = this.formBuilder.group({
      listF: [''],
      phone: this.formBuilder.group({
        countryCode: new FormControl(this.newStakeholder.phone1?.countryCode),
        phoneNumber: new FormControl(this.newStakeholder.phone1?.phoneNumber)
      },{validators: [validPhoneNumber]}),
      email: new FormControl(this.newStakeholder.email, Validators.required),
    })
    this.phone = this.formContactos.get("phone");
    this.returned = localStorage.getItem("returned");
    this.submissionId = localStorage.getItem("submissionId");
  }

  initializeForm() {
    this.formContactos = this.formBuilder.group({
      listF: [''],
      phone: this.formBuilder.group({
        countryCode: new FormControl((this.currentStakeholder !== null) ? this.currentStakeholder.phone1?.countryCode : this.newStakeholder.phone1?.countryCode),
        phoneNumber: new FormControl((this.currentStakeholder !== null) ? this.currentStakeholder.phone1?.phoneNumber : this.newStakeholder.phone1?.phoneNumber)
      }, { validators: [validPhoneNumber] }),
      email: new FormControl((this.currentStakeholder !== null) ? this.currentStakeholder.email : this.newStakeholder.email, Validators.required),
    })
  }

  getValueSearch(val: string) {
    console.warn("component recebeu: ", val)
    this.displayValueSearch = val;
  }

  changeListElement(varkjkiavel: string, e: any) {
    this.logger.debug(e.target.value)
    this.formContactos.get("phone").get("countryCode").setValue(e.target.value);
    this.logger.debug(this.formContactos.value.countryCode);
    this.logger.debug(this.formContactos.value.phoneNumber);
    this.logger.debug(this.formContactos.value.email);
    //update ao newStakeholder aqui?
    // this.newStakeholder.callingCodeStakeholder =  this.callingCodeStakeholder;
  }

  submit() {
    if (this.returned !== 'consult') {
      this.newStakeholder = this.currentStakeholder;
      this.newStakeholder.email = this.formContactos.value.email;
      this.newStakeholder.phone1 = {
        countryCode: this.formContactos.get('phone').get('countryCode').value,
        phoneNumber: this.formContactos.get('phone').get('phoneNumber').value
      };
       
      let storedForm: infoDeclarativaForm = JSON.parse(localStorage.getItem("info-declarativa")) ?? new infoDeclarativaForm();
      storedForm.stakeholder = this.newStakeholder
      localStorage.setItem("info-declarativa", JSON.stringify(storedForm));

      this.logger.debug("Stakeholder id", this.newStakeholder.id);
      this.logger.debug("Dados updated do stakeholder ", this.newStakeholder);
      this.stakeholderService.UpdateStakeholder(this.submissionId, this.newStakeholder.id, this.newStakeholder).subscribe(result => {
        this.logger.debug("Resultado de criar um stakeholder a uma submissão existente", result);
        if (this.currentIdx < (this.submissionStakeholders.length - 1)) {
          this.logger.debug("CUrrent index ", this.currentIdx);
          this.logger.debug("Submission stakeholders length ", this.submissionStakeholders);
          this.currentIdx = this.currentIdx + 1;
          this.currentStakeholder = this.submissionStakeholders[this.currentIdx];
          this.logger.debug(this.currentStakeholder);
        } else {
          this.logger.debug("Current index é maior do que lenght");
          this.logger.debug("CUrrent index ", this.currentIdx);
          this.logger.debug("Submission stakeholders length ", this.submissionStakeholders);
          this.route.navigate(['/info-declarativa-lojas']);
        }

      }, error => {
        this.logger.debug(error);
      });
    } else {
      this.route.navigate(['/info-declarativa-lojas']);
    }
  }

  clickRow(stake: any) {
    this.selectedStakeholder = stake;
  }

  selectStakeholder(stakeholder, idx) {
    this.logger.debug(this.currentStakeholder);
    this.logger.debug(stakeholder);
    this.currentStakeholder = stakeholder;
    this.currentIdx = idx;
    this.logger.debug(this.currentStakeholder);
    this.logger.debug(this.currentStakeholder === stakeholder);
    this.initializeForm();
  }

}
