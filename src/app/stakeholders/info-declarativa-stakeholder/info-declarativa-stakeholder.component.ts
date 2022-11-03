import { Component, OnInit, Inject, AfterViewInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { IStakeholders, StakeholdersCompleteInformation } from '../IStakeholders.interface'
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { EventEmitter, Output } from '@angular/core';
import { CountryInformation } from '../../table-info/ITable-info.interface';
import { TableInfoService } from '../../table-info/table-info.service';
import { DataService } from 'src/app/nav-menu-interna/data.service';
import { StakeholderService } from '../stakeholder.service';
import { Configuration, configurationToken } from 'src/app/configuration';
import { infoDeclarativaForm, validPhoneNumber } from 'src/app/client/info-declarativa/info-declarativa.model';
import { LoggerService } from 'src/app/logger.service';
import { IPep, KindPep } from 'src/app/pep/IPep.interface';
import { PepComponent } from '../../pep/pep.component';
import { Observable, of } from 'rxjs';

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

  callingCodeStakeholder?: string = "";

  displayValueSearch = '';

  submissionStakeholders: IStakeholders[] = [];
  submissionId: string;
  processNumber: string;
  currentStakeholder: StakeholdersCompleteInformation;

  @Output() nameEmitter = new EventEmitter<string>();

  stakeholders: IStakeholders[] = [];
  displayedColumns: string[] = ['fiscalId', 'shortName', 'identificationDocumentId', 'elegible', 'valid'];

  selectedStakeholder = {

  } as IStakeholders;


  returned: string;
  currentIdx: number = 0;
  infoStakeholders: FormGroup;
  stakesLength: number;

  @ViewChild(PepComponent) pepComponent: PepComponent;

  updatedStakeholderEvent: Observable<{ stake: IStakeholders, idx: number }>;
  previousStakeholderEvent: Observable<number>;

  emitPreviousStakeholder(idx) {
    this.previousStakeholderEvent = idx;
  }

  emitUpdatedStakeholder(info) {
    this.updatedStakeholderEvent = info;
  }

  ngAfterViewInit() {
  }

  constructor(private logger: LoggerService, private formBuilder: FormBuilder, http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private route: Router, private data: DataService, private tableInfo: TableInfoService, private stakeholderService: StakeholderService) {
    this.baseUrl = configuration.baseUrl;


    this.ngOnInit();
    this.infoStakeholders = this.formBuilder.group({
      contacts: this.formBuilder.group({
      }),
      pep: this.formBuilder.group({
      })
    });

    var context = this;

    this.stakeholderService.GetAllStakeholdersFromSubmissionTest(this.submissionId).then(result => {

      var stakeholders = result.result;

      stakeholders.forEach(function (value, index) {
        context.stakeholderService.GetStakeholderFromSubmissionTest(context.submissionId, value.id).then(res => {
          console.log("stakeholder adicionado com sucesso");
          context.submissionStakeholders.push(res);
        }, error => {
          console.log("Erro a adicionar stakeholder");
        });
      });
    }, error => {
    });

  }

  ngOnInit(): void {
    this.data.updateData(false, 6, 2);
    this.returned = localStorage.getItem("returned");
    this.submissionId = localStorage.getItem("submissionId");
    this.processNumber = localStorage.getItem("processNumber");
  }

  getValueSearch(val: string) {
    console.warn("component recebeu: ", val)
    this.displayValueSearch = val;
  }

  clickRow(stake: any) {
    this.selectedStakeholder = stake;
  }

  selectStakeholder(info) {
    if (info !== null) {
      this.currentStakeholder = info.stakeholder;
      this.currentIdx = info.idx;
      this.infoStakeholders.reset();
      this.pepComponent.resetForm();
      setTimeout(() => this.setFormData(), 500); //esperar um tempo para que os form seja criado e depois conseguir popular os campos com os dados certos
    }
  }

  //resetPepForm() {
  //  this.infoStakeholders.setControl('pep', new FormGroup({
  //    id: new FormControl(''),
  //    pep12months: new FormControl('', [Validators.required])
  //  }));
  //}

  //resetContacts(){
  //  this.infoStakeholders.setControl('contacts', new FormGroup({
  //    phone: new FormGroup({
  //      countryCode: new FormControl((this.currentStakeholder != null) ? this.currentStakeholder.stakeholderAcquiring.phone1?.countryCode : '', Validators.required),
  //      phoneNumber: new FormControl((this.currentStakeholder != null) ? this.currentStakeholder.stakeholderAcquiring.phone1?.phoneNumber : '', Validators.required)
  //    }, { validators: [validPhoneNumber] }),
  //    email: new FormControl((this.currentStakeholder != null) ? this.currentStakeholder.stakeholderAcquiring.email : '', Validators.required),
  //  }));
  //}

  setFormData() {
    this.pepComponent.resetForm();
    this.infoStakeholders.reset();

    var contacts = this.infoStakeholders.controls["contacts"];
    if (contacts != undefined || contacts != null) {
      if (contacts.get("phone").value) {
        contacts.get("phone").get("countryCode").setValue(this.currentStakeholder.stakeholderAcquiring.phone1?.countryCode);
        contacts.get("phone").get("phoneNumber").setValue(this.currentStakeholder.stakeholderAcquiring.phone1?.phoneNumber);
      }
      if (contacts.get("email").value) {
        contacts.get("email").setValue(this.currentStakeholder.stakeholderAcquiring.email);
      }
    }

    var pep = this.infoStakeholders.controls["pep"];
    if (pep != undefined || pep != null) {
      if (pep.get("pep12months").value) {
        pep.get("pep12months")?.get("pepType").setValue(this.currentStakeholder.stakeholderAcquiring.pep?.pepType);
        pep.get("pep12months")?.get("pepCountry").setValue(this.currentStakeholder.stakeholderAcquiring.pep?.pepCountry);
        pep.get("pep12months")?.get("pepSinceWhen").setValue(this.currentStakeholder.stakeholderAcquiring.pep?.pepSince);
        pep.get("pep12months")?.get("kind").setValue(KindPep.PEP);
      } else if (pep.get("pepFamiliarOf").value) {
        pep.get("pepRelations")?.get("pepType").setValue("RFAM"); // O Cliente é familiar de uma pessoa politicamente exposta
        pep.get("pepFamiliarOf")?.get("pepFamilyRelation").setValue(this.currentStakeholder.stakeholderAcquiring.pep?.degreeOfRelatedness);
        pep.get("pepFamiliarOf")?.get("kind").setValue(KindPep.FAMILY);
      } else if (pep.get("pepRelations").value) {
        pep.get("pepRelations")?.get("pepType").setValue("RSOC"); // O Cliente mantém estreitas relações de natureza societária ou comercial com uma pessoa politicamente exposta.
        pep.get("pepRelations")?.get("pepTypeOfRelation").setValue(this.currentStakeholder.stakeholderAcquiring.pep?.businessPartnership);
        pep.get("pepRelations")?.get("kind").setValue(KindPep.BUSINESS);
      } else if (pep.get("pepPoliticalPublicJobs").value) {
        pep.get("pepPoliticalPublicJobs")?.get("pepType").setValue(this.currentStakeholder.stakeholderAcquiring.pep?.pepType);
        pep.get("pepPoliticalPublicJobs")?.get("kind").setValue(KindPep.PEP);
      } else {
        pep.get("pepType").setValue("R000"); // O Cliente não exerce qualquer cargo público em território nacional e paralelamente não é uma pessoa politicamente exposta
      }
    }
  }

  submit() {
    var contacts = this.infoStakeholders.get("contacts");

    if (contacts.get("phone").value) {
      if (this.currentStakeholder.stakeholderAcquiring.phone1 === null){
        this.currentStakeholder.stakeholderAcquiring.phone1 = {};
      }
      this.currentStakeholder.stakeholderAcquiring.phone1.countryCode = contacts.get("phone").get("countryCode").value;
      this.currentStakeholder.stakeholderAcquiring.phone1.phoneNumber = contacts.get("phone").get("phoneNumber").value;
    }

    if (contacts.get("email").value) {
      this.currentStakeholder.stakeholderAcquiring.email = contacts.get("email").value;
    }

    var pep = this.infoStakeholders.get("pep");
    this.currentStakeholder.stakeholderAcquiring.pep = new IPep();

    if (pep.get("pep12months").value == "true") {
      this.currentStakeholder.stakeholderAcquiring.pep.kind = KindPep.PEP;//pep.get("pep12months").get("kind").value;
      this.currentStakeholder.stakeholderAcquiring.pep.pepType = pep.get("pepType").value;
      this.currentStakeholder.stakeholderAcquiring.pep.pepCountry = pep.get("pepCountry").value;
      this.currentStakeholder.stakeholderAcquiring.pep.pepSince = pep.get("pepSinceWhen").value;
    } else if (pep.get("pepFamiliarOf").value == "true") {
      this.currentStakeholder.stakeholderAcquiring.pep.kind = KindPep.BUSINESS;//pep.get("pepFamiliarOf").get("kind").value;
      this.currentStakeholder.stakeholderAcquiring.pep.pepType = "RFAM";//pep.get("pepType").value;
      this.currentStakeholder.stakeholderAcquiring.pep.degreeOfRelatedness = pep.get("pepFamilyRelation").value;
      this.currentStakeholder.stakeholderAcquiring.pep.pepCountry = null;
    } else if (pep.get("pepRelations").value == "true") {
      this.currentStakeholder.stakeholderAcquiring.pep.kind = KindPep.BUSINESS//pep.get("pepRelations").get("kind").value;
      this.currentStakeholder.stakeholderAcquiring.pep.pepType = "RSOC";//pep.get("pepType").value;
      this.currentStakeholder.stakeholderAcquiring.pep.businessPartnership = pep.get("pepTypeOfRelation").value;
      this.currentStakeholder.stakeholderAcquiring.pep.pepCountry = null;
    } else if (pep.get("pepPoliticalPublicJobs").value == "true") {
      this.currentStakeholder.stakeholderAcquiring.pep.kind = KindPep.PEP;//pep.get("pepPoliticalPublicJobs").get("kind").value;
      this.currentStakeholder.stakeholderAcquiring.pep.pepType = pep.get("pepType").value;
      this.currentStakeholder.stakeholderAcquiring.pep.pepCountry = null;
    } else {
      this.currentStakeholder.stakeholderAcquiring.pep.pepType = "R000";
    }

    console.log('Valores do stakeholder ', this.currentStakeholder.stakeholderAcquiring);

    this.stakeholderService.UpdateStakeholder(this.submissionId, this.currentStakeholder.stakeholderAcquiring.id, this.currentStakeholder.stakeholderAcquiring).subscribe(result => {
      if (this.currentIdx < (this.stakesLength - 1)) {
        this.emitUpdatedStakeholder(of({ stake: this.currentStakeholder.stakeholderAcquiring, idx: this.currentIdx }));
        console.log("Stakeholder atualizado ", result);
      } else {
        this.data.updateData(false, 6, 3);
        this.route.navigate(['info-declarativa-lojas']);
      }
    });

    this.pepComponent.resetForm();
    this.infoStakeholders.reset();
  }

  getStakesListLength(value) {
    this.stakesLength = value;
  }

  goToInfoDeclarativa() {
    if ((this.currentIdx - 1) >= 0) {
      this.emitPreviousStakeholder(of(this.currentIdx));
    } else {
      this.route.navigate(['/info-declarativa']);
    }
  }
}
