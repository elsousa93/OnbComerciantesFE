import { Component, OnInit } from '@angular/core';
import { IPep, KindPep } from './IPep.interface';
import { FormGroup, FormControl, Validators, FormGroupDirective } from '@angular/forms';
import { TableInfoService } from '../table-info/table-info.service';
import { CorporateRelations, CountryInformation, Kinship, PEPTypes } from '../table-info/ITable-info.interface';
import { LoggerService } from 'src/app/logger.service';
import { DataService } from '../nav-menu-interna/data.service';
import { Subscription } from 'rxjs';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-pep',
  templateUrl: './pep.component.html',
  styleUrls: ['./pep.component.css']
})
export class PepComponent implements OnInit {
  private submissionId: string;

  //Informação de campos/tabelas
  PEPTypesP: PEPTypes[] = [];
  PEPTypesC: PEPTypes[] = [];
  Countries: CountryInformation[] = [];
  stakeholdersKinships: Kinship[] = [];
  corporateRelations: CorporateRelations[] = [];
  public subs: Subscription[] = [];

  date: string;

  constructor(private logger: LoggerService, private data: DataService, private datePipe: DatePipe,
    private tableInfo: TableInfoService, private rootFormGroup: FormGroupDirective) {
    this.date = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    this.subs.push(this.tableInfo.GetAllCountries().subscribe(result => {
      this.logger.info("Get all countries result: " + JSON.stringify(result));
      this.Countries = result;
      this.Countries = this.Countries.sort(function (a, b) {
        return a.description.localeCompare(b.description, 'pt-PT');
      }); //ordenar resposta
    }, error => this.logger.error(error, "", "Error fetching all countries")), this.tableInfo.GetAllPEPTypes().subscribe(result => {
      this.logger.info("Get all PEP types result: " + JSON.stringify(result));
      result.forEach(element => {
        if (element.code.startsWith('P')) {
          this.PEPTypesP.push(element);
        } else if (element.code.startsWith('C')) {
          this.PEPTypesC.push(element);
        }
      });
      this.PEPTypesP = this.PEPTypesP.sort((a, b) => a.description > b.description ? 1 : -1); //ordenar resposta
      this.PEPTypesC = this.PEPTypesC.sort((a, b) => a.description > b.description ? 1 : -1); //ordenar resposta
    }, error => this.logger.error(error, "", "Error fetching all PEP types")), this.tableInfo.GetAllCorporateRelations().subscribe(result => {
      this.logger.info("Get all corporate relations result: " + JSON.stringify(result));
      this.corporateRelations = result;
      this.corporateRelations = this.corporateRelations.sort((a, b) => a.description > b.description ? 1 : -1); //ordenar resposta
    }, error => this.logger.error(error, "", "Error fetching all corporate relations")), this.tableInfo.GetAllKinships().subscribe(result => {
      this.logger.info("Get all stakeholders kinships result: " + JSON.stringify(result));
      this.stakeholdersKinships = result;
      this.stakeholdersKinships = this.stakeholdersKinships.sort((a, b) => a.description > b.description ? 1 : -1); //ordenar resposta
    }, error => this.logger.error(error, "", "Error fetching all stakeholders kinships")));
  }

  newPep: IPep = {
    kind: KindPep.PEP,
    pepType: "",
    pepCountry: "",
    pepSince: "",
    degreeOfRelatedness: "",
    businessPartnership: ""
  } as IPep;

  //Varibales for divs in HTML, when selected 
  isVisiblePep12months: any;
  isSelected: boolean = true;
  isVisiblePepFamiliarOf: any;
  isVisiblePepRelations: any;
  isVisiblePepPoliticalPublicJobs: any;

  isPEPTypeSelected: boolean = false;
  isPEPCountrySelected: boolean = false;
  isPEPSinceSelected: boolean = false;
  isPEPFamilyRelationSelected: boolean = false;
  isPEPRelationSelected: boolean = false;

  edit: boolean = false;
  public subscription: Subscription;
  public map: Map<number, boolean>;
  public currentPage: number;
  returned: string;
  form: FormGroup;


  ngOnInit(): void {
    this.submissionId = localStorage.getItem("submissionId");
    this.data.updateData(false, 6, 3);

    this.initForm();
    if (this.rootFormGroup.form != null) {
      this.rootFormGroup.form.setControl('pep', this.form);
      this.edit = true;
      if (this.returned == 'consult') {
        this.form.disable();
      }
    } else {
      this.subscription = this.data.currentData.subscribe(map => this.map = map);
      this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    }
  }

  initForm() {
    this.form = new FormGroup({
      id: new FormControl(''),
      pep12months: new FormControl('', [Validators.required])
    });
    this.rootFormGroup.form.setControl('pep', this.form);
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub?.unsubscribe);
  }

  //Altera os valores das variaveis de acordo com o que é selecionado em cada checkbox
  onChangeValues(event: any) {
    var stringToBool = (event.target.value === 'true' ? true : false);
    if (event.target.name == 'pep12months') {
      this.form.get("pep12months").setValue(event.target.value);
      this.isVisiblePep12months = stringToBool;
      if (stringToBool) {
        //se algum dos valores das perguntas a baixo estava assinalado como "Sim" e depois selecionamos
        //alguma das opções anteriores como "Sim",
        //temos de garantir que removemos os forms que foram criados e que já não vão ser utilizados

        this.isPEPTypeSelected = false;
        this.isPEPSinceSelected = false;
        this.isPEPCountrySelected = false;

        if (this.isVisiblePepFamiliarOf) {
          this.form.removeControl('pepFamilyRelation');
        }
        if (this.isVisiblePepRelations) {
          this.form.removeControl('pepTypeOfRelation');
        }
        if (this.isVisiblePepPoliticalPublicJobs) {
          this.form.removeControl('pepType');
        }

        this.isVisiblePepFamiliarOf = undefined;
        this.isVisiblePepRelations = undefined;
        this.isVisiblePepPoliticalPublicJobs = undefined;

        this.form.removeControl('pepFamiliarOf');
        this.form.removeControl('pepRelations');
        this.form.removeControl('pepPoliticalPublicJobs');

        this.form.addControl('pepType', new FormControl('', [Validators.required]));
        this.form.addControl('pepCountry', new FormControl('', [Validators.required]));
        this.form.addControl('pepSinceWhen', new FormControl('', [Validators.required]));
      } else {
        this.form.removeControl('pepType');
        this.form.removeControl('pepCountry');
        this.form.removeControl('pepSinceWhen');
        this.form.addControl('pepFamiliarOf', new FormControl('', [Validators.required]));
      }
    }
    if (event.target.name == 'pepFamiliarOf') {
      this.form.get("pepFamiliarOf").setValue(event.target.value);
      this.isVisiblePepFamiliarOf = stringToBool;
      if (stringToBool) {

        this.isPEPFamilyRelationSelected = false;
        this.isPEPRelationSelected = false;

        if (this.isVisiblePepRelations) {
          this.form.removeControl('pepTypeOfRelation');
        }
        if (this.isVisiblePepPoliticalPublicJobs) {
          this.form.removeControl('pepType');
        }

        this.isVisiblePepRelations = undefined;
        this.isVisiblePepPoliticalPublicJobs = undefined;
        this.form.removeControl('pepRelations');
        this.form.removeControl('pepPoliticalPublicJobs');
        this.form.addControl('pepFamilyRelation', new FormControl('', [Validators.required]));


      } else {
        this.form.addControl('pepRelations', new FormControl('', [Validators.required]));
        this.form.removeControl('pepFamilyRelation');
      }
    }
    if (event.target.name == 'pepRelations') {
      this.form.get("pepRelations").setValue(event.target.value);
      this.isVisiblePepRelations = stringToBool;
      if (stringToBool) {

        this.isPEPRelationSelected = false;

        if (this.isVisiblePepPoliticalPublicJobs) {
          this.form.removeControl('pepType');
        }

        this.isVisiblePepPoliticalPublicJobs = undefined;
        this.form.removeControl('pepPoliticalPublicJobs');
        this.form.addControl('pepTypeOfRelation', new FormControl('', [Validators.required]));

      } else {
        this.form.addControl('pepPoliticalPublicJobs', new FormControl('', [Validators.required]));
        this.form.removeControl('pepTypeOfRelation');
      }
    }
    if (event.target.name == 'pepPoliticalPublicJobs') {
      this.form.get("pepPoliticalPublicJobs").setValue(event.target.value);
      this.isVisiblePepPoliticalPublicJobs = stringToBool;
      if (stringToBool) {
        this.form.addControl('pepType', new FormControl('', [Validators.required]));
      } else {
        this.form.removeControl('pepType');
      }
    }
  }

  // check selected on 1st question
  checkSelectedPEP() {
    this.isPEPTypeSelected = false;
    this.isPEPSinceSelected = false;
    this.isPEPCountrySelected = false;
    this.isPEPFamilyRelationSelected = false;
    this.isPEPRelationSelected = false;
    var pepType = (<HTMLInputElement>document.getElementById("pepType")).value;
    var pepCountry = (<HTMLInputElement>document.getElementById("pepCountry")).value;
    var pepSince = (<HTMLInputElement>document.getElementById("pepSinceWhen")).value;

    if (pepType != "") {
      this.isPEPTypeSelected = true;
    }
    if (pepCountry != "") {
      this.isPEPCountrySelected = true;
    }
    if (pepSince != "") {
      this.isPEPSinceSelected = true;
    }
  }
  checkSelectedFamiliar() {
    this.isPEPFamilyRelationSelected = false;
    this.isPEPRelationSelected = false;
    var pepFamilyRelation = (<HTMLInputElement>document.getElementById("pepFamilyRelation")).value;

    if (pepFamilyRelation != "") {
      this.isPEPFamilyRelationSelected = true;
    }
  }
  checkSelectedRelations() {
    this.isPEPRelationSelected = false;
    var pepRelationType = (<HTMLInputElement>document.getElementById("pepTypeOfRelation")).value;

    if (pepRelationType != "") {
      this.isPEPRelationSelected = true;
    }
  }

  resetForm() {
    this.initForm();
    this.isVisiblePep12months = undefined;
    this.isVisiblePepFamiliarOf = undefined;
    this.isVisiblePepRelations = undefined;
    this.isVisiblePepPoliticalPublicJobs = undefined;
  }
}
