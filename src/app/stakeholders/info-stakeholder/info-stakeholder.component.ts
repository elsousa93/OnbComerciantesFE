import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Validators, FormGroup, FormControl, AbstractControl, FormGroupDirective } from '@angular/forms';
import { IStakeholders } from '../IStakeholders.interface';
import { DataService } from '../../nav-menu-interna/data.service';
import { TableInfoService } from '../../table-info/table-info.service';
import { validPhoneNumber } from 'src/app/client/info-declarativa/info-declarativa.model';
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
  public emailRegex: string;

  //Informação de campos/tabelas
  internationalCallingCodes: CountryInformation[];

  @Output() nameEmitter = new EventEmitter<string>();

  constructor(private data: DataService, private tableInfo: TableInfoService, private rootFormGroup: FormGroupDirective) {

    this.tableInfo.GetAllCountries().subscribe(result => {
      this.internationalCallingCodes = result;
      this.internationalCallingCodes = this.internationalCallingCodes.sort(function (a, b) {
        return a.description.localeCompare(b.description, 'pt-PT');
      }); //ordenar resposta
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
    this.emailRegex = '^(([^<>()\\[\\]\\\.,;:\\s@"]+(\.[^<>()\\[\\]\\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\.[0-9]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$';
    this.formContactos = new FormGroup({
      phone: new FormGroup({
        countryCode: new FormControl((this.currentStakeholder != null) ? this.currentStakeholder.phone1?.countryCode : '', Validators.required),
        phoneNumber: new FormControl((this.currentStakeholder != null) ? this.currentStakeholder.phone1?.phoneNumber : '', Validators.required)
      }, { validators: [validPhoneNumber, Validators.required] }),
      email: new FormControl((this.currentStakeholder != null) ? this.currentStakeholder.email : '', Validators.pattern(this.emailRegex))
    })
    this.rootFormGroup.form.setControl('contacts', this.formContactos);
    this.phone = this.formContactos.get("phone");
  }

  get emailValid() {
    return this.formContactos.get('email');
  }

  changeListElement(string: string, e: any) {
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