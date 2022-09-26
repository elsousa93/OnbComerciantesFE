import { Component, OnInit, Inject, AfterViewInit } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { IStakeholders } from '../IStakeholders.interface'
import { ActivatedRoute, Route, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ViewChild, EventEmitter, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { CountryInformation } from '../../table-info/ITable-info.interface';
import { TableInfoService } from '../../table-info/table-info.service';
import { DataService } from 'src/app/nav-menu-interna/data.service';
import { StakeholderService } from '../stakeholder.service';
import { Configuration, configurationToken } from 'src/app/configuration';
import { infoDeclarativaForm, validPhoneNumber } from 'src/app/client/info-declarativa/info-declarativa.model';
import { ConstantPool } from '@angular/compiler';
import { LoggerService } from 'src/app/logger.service';

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
  formContactos!: FormGroup;
  callingCodeStakeholder?: string = "";

  displayValueSearch = '';

  submissionStakeholders: IStakeholders[] = [];
  submissionId: string;
  processNumber: string;
  currentStakeholder: IStakeholders = null;


  //Informação de campos/tabelas
  internationalCallingCodes: CountryInformation[];

  public newStakeholder: IStakeholders = {} as IStakeholders;

  @Output() nameEmitter = new EventEmitter<string>();

  stakeholders: IStakeholders[] = [];
  displayedColumns: string[] = ['fiscalId', 'shortName', 'identificationDocumentId', 'elegible', 'valid'];

  selectedStakeholder = {
    
  } as IStakeholders;
  phone: AbstractControl;

  returned: string;
  currentIdx: number = 0;

  ngAfterViewInit() {
  }

  constructor(private logger : LoggerService, private formBuilder: FormBuilder, http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private route: Router, private data: DataService, private tableInfo: TableInfoService, private stakeholderService: StakeholderService) {
    this.baseUrl = configuration.baseUrl;


    this.ngOnInit();

    this.tableInfo.GetAllCountries().subscribe(result => {
      this.internationalCallingCodes = result;
    });

    var context = this;

    this.stakeholderService.GetAllStakeholdersFromSubmissionTest(this.submissionId).then(result => {

      var stakeholders = result.result;

      stakeholders.forEach(function (value, index) {
        context.stakeholderService.GetStakeholderFromSubmissionTest(context.submissionId, value.id).then(res => {
          console.log("stakeholder adicionado com sucesso");
          context.submissionStakeholders.push(res);
        }, error => {
          console.log("deu erro");
        });
      });
    }, error => {
    });

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
    this.processNumber = localStorage.getItem("processNumber");
  }

  initializeForm() {
    this.formContactos = this.formBuilder.group({
      listF: [''],
      phone: this.formBuilder.group({
        countryCode: new FormControl((this.currentStakeholder != null) ? this.currentStakeholder.phone1?.countryCode : this.newStakeholder.phone1?.countryCode),
        phoneNumber: new FormControl((this.currentStakeholder != null) ? this.currentStakeholder.phone1?.phoneNumber : this.newStakeholder.phone1?.phoneNumber)
      }, { validators: [validPhoneNumber] }),
      email: new FormControl((this.currentStakeholder != null) ? this.currentStakeholder.email : this.newStakeholder.email, Validators.required),
    })
  }

  getValueSearch(val: string) {
    console.warn("component recebeu: ", val)
    this.displayValueSearch = val;
  }

  changeListElement(varkjkiavel: string, e: any) {
    this.formContactos.get("phone").get("countryCode").setValue(e.target.value);
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

      this.stakeholderService.UpdateStakeholder(this.submissionId, this.newStakeholder["stakeholderAcquiring"]["id"], this.newStakeholder).subscribe(result => {
        if (this.currentIdx < (this.submissionStakeholders.length - 1)) {
          this.currentIdx = this.currentIdx + 1;
          this.selectStakeholder({ stakeholder: this.submissionStakeholders[this.currentIdx], info: this.currentIdx });
          //this.currentStakeholder = this.submissionStakeholders[this.currentIdx];
        } else {

          this.route.navigate(['/app-pep']);
        }

      }, error => {
      });
    } else {
      this.route.navigate(['/app-pep']);
    }
  }

  clickRow(stake: any) {
    this.selectedStakeholder = stake;
  }

  selectStakeholder(info /*stakeholder, idx*/) {
    this.currentStakeholder = info.stakeholder;
    this.currentIdx = info.idx;
    this.formContactos.get("phone").get("countryCode").setValue(this.currentStakeholder.phone1.countryCode);
    this.formContactos.get("phone").get("phoneNumber").setValue(this.currentStakeholder.phone1.phoneNumber);
    this.formContactos.get("email").setValue(this.currentStakeholder.email);
  }

}
