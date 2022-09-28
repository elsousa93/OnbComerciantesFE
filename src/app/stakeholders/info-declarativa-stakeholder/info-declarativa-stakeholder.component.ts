import { Component, OnInit, Inject, AfterViewInit } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { IStakeholders } from '../IStakeholders.interface'
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
import { KindPep } from 'src/app/pep/IPep.interface';

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
  currentStakeholder: IStakeholders = null;

  @Output() nameEmitter = new EventEmitter<string>();

  stakeholders: IStakeholders[] = [];
  displayedColumns: string[] = ['fiscalId', 'shortName', 'identificationDocumentId', 'elegible', 'valid'];

  selectedStakeholder = {
    
  } as IStakeholders;


  returned: string;
  currentIdx: number = 0;
  infoStakeholders: FormGroup;

  ngAfterViewInit() {
  }

  constructor(private logger : LoggerService, private formBuilder: FormBuilder, http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private route: Router, private data: DataService, private tableInfo: TableInfoService, private stakeholderService: StakeholderService) {
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
          console.log("deu erro");
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
      this.currentStakeholder = info.store;
      this.currentIdx = info.idx;
      setTimeout(() => this.setFormData(), 500); //esperar um tempo para que os form seja criado e depois conseguir popular os campos com os dados certos
    }
  }

  setFormData(){
    var contacts = this.infoStakeholders.controls["contacts"];
    contacts.get("phone").get("countryCode").setValue(this.currentStakeholder.phone1.countryCode);
    contacts.get("phone").get("phoneNumber").setValue(this.currentStakeholder.phone1.phoneNumber);
    contacts.get("email").setValue(this.currentStakeholder.email);

    var pep = this.infoStakeholders.controls["pep"];
    if (pep.get("pep12months").value) {
      pep.get("pep12months").get("pepType").setValue(this.currentStakeholder.pep.pepType);
      pep.get("pep12months").get("pepCountry").setValue(this.currentStakeholder.pep.pepCountry);
      pep.get("pep12months").get("pepSinceWhen").setValue(this.currentStakeholder.pep.pepSince);
      pep.get("pep12months").get("kind").setValue(KindPep.PEP);
    } else if (pep.get("pepFamiliarOf").value){
      pep.get("pepRelations").get("pepType").setValue("RFAM"); // O Cliente é familiar de uma pessoa politicamente exposta
      pep.get("pepFamiliarOf").get("pepFamilyRelation").setValue(this.currentStakeholder.pep.degreeOfRelatedness);
      pep.get("pepFamiliarOf").get("kind").setValue(KindPep.FAMILY); 
    } else if (pep.get("pepRelations").value){
      pep.get("pepRelations").get("pepType").setValue("RSOC"); // O Cliente mantém estreitas relações de natureza societária ou comercial com uma pessoa politicamente exposta.
      pep.get("pepRelations").get("pepTypeOfRelation").setValue(this.currentStakeholder.pep.businessPartnership);
      pep.get("pepRelations").get("kind").setValue(KindPep.BUSINESS); 
    } else if (pep.get("pepPoliticalPublicJobs").value){
      pep.get("pepPoliticalPublicJobs").get("pepType").setValue(this.currentStakeholder.pep.pepType);
      pep.get("pepPoliticalPublicJobs").get("kind").setValue(KindPep.PEP); 
    } else {
      pep.get("pepType").setValue("R000"); // O Cliente não exerce qualquer cargo público em território nacional e paralelamente não é uma pessoa politicamente exposta
    }
  }

  submit(){
    if (this.infoStakeholders.valid){
      var contacts = this.infoStakeholders.get("contacts");

      this.currentStakeholder.phone1.countryCode = contacts.get("phone").get("countryCode").value;
      this.currentStakeholder.phone1.phoneNumber = contacts.get("phone").get("phoneNumber").value;
      this.currentStakeholder.email = contacts.get("email").value;

      var pep = this.infoStakeholders.get("pep");

      if (pep.get("pep12months").value) {
        this.currentStakeholder.pep.kind = pep.get("pep12months").get("kind").value;
        this.currentStakeholder.pep.pepType = pep.get("pep12months").get("pepType").value;
        this.currentStakeholder.pep.pepCountry = pep.get("pep12months").get("pepCountry").value;
        this.currentStakeholder.pep.pepSince = pep.get("pep12months").get("pepSince").value;
      } else if (pep.get("pepFamiliarOf").value) {
        this.currentStakeholder.pep.kind = pep.get("pepFamiliarOf").get("kind").value;
        this.currentStakeholder.pep.pepType = pep.get("pepFamiliarOf").get("pepType").value;
        this.currentStakeholder.pep.degreeOfRelatedness = pep.get("pepFamiliarOf").get("pepFamilyRelation").value;
      } else if (pep.get("pepRelations").value) {
        this.currentStakeholder.pep.kind = pep.get("pepRelations").get("kind").value;
        this.currentStakeholder.pep.pepType = pep.get("pepRelations").get("pepType").value;
        this.currentStakeholder.pep.businessPartnership = pep.get("pepRelations").get("pepTypeOfRelation").value;
      } else if (pep.get("pepPoliticalPublicJobs").value) {
        this.currentStakeholder.pep.kind = pep.get("pepPoliticalPublicJobs").get("kind").value;
        this.currentStakeholder.pep.pepType = pep.get("pepPoliticalPublicJobs").get("pepType").value;
      } else {
        this.currentStakeholder.pep.pepType = pep.get("pepType").value;
      }

    }

 }

//  submit() { PEP
//   if (this.isVisiblePep12months) {
//     this.newPep.kind = KindPep.PEP,
//     this.newPep.pepType = this.form.value.pepType;
//     this.newPep.pepCountry = this.form.value.pepCountry;
//     this.newPep.pepSince = this.form.value.pepSinceWhen;
//   } else if (this.isVisiblePepFamiliarOf) {
//     this.newPep.kind = KindPep.FAMILY;
//     this.newPep.pepType = "RFAM"; // O Cliente é familiar de uma pessoa politicamente exposta
//     this.newPep.degreeOfRelatedness = this.form.value.pepFamilyRelation;
//   } else if (this.isVisiblePepRelations) {
//     this.newPep.kind = KindPep.BUSINESS;
//     this.newPep.pepType = "RSOC";  // O Cliente mantém estreitas relações de natureza societária ou comercial com uma pessoa politicamente exposta.
//     this.newPep.businessPartnership = this.form.value.pepTypeOfRelation;
//   } else if (this.isVisiblePepPoliticalPublicJobs) {
//     this.newPep.kind = KindPep.PEP,
//     this.newPep.pepType = this.form.value.pepType;
//   } else {
//     this.newPep.pepType = "R000"; // O Cliente não exerce qualquer cargo público em território nacional e paralelamente não é uma pessoa politicamente exposta
//   }

//   this.logger.debug(this.newPep);

//   // this.stakeholderService.UpdateStakeholder(this.submissionId, this.newStakeholder["stakeholderAcquiring"]["id"], this.newStakeholder).subscribe(result => {
//   //     this.route.navigate(['/info-declarativa-lojas']);
//   // }, error => {
//   // });
// }

}
