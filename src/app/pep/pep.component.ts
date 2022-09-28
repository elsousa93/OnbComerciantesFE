import { Component, Inject, OnInit, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IPep, KindPep } from './IPep.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TableInfoService } from '../table-info/table-info.service';
import { CorporateRelations, CountryInformation, Kinship, PEPTypes, StakeholderRole } from '../table-info/ITable-info.interface';
import { Configuration, configurationToken } from '../configuration';
import { LoggerService } from 'src/app/logger.service';
import { DataService } from '../nav-menu-interna/data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pep',
  templateUrl: './pep.component.html',
  styleUrls: ['./pep.component.css']
})
export class PepComponent implements OnInit {
  private baseUrl: string;

  //REACTIVE FORM

  //Informação de campos/tabelas
  PEPTypesP: PEPTypes[] = [];
  PEPTypesC: PEPTypes[] = [];
  Countries: CountryInformation[] = [];
  stakeholdersRoles: StakeholderRole[] = [];
  stakeholdersKinships: Kinship[] = [];
  corporateRelations: CorporateRelations[] = [];
  public subs: Subscription[] = [];

  constructor(private logger : LoggerService, private router: ActivatedRoute, private data: DataService,
    private http: HttpClient,
    @Inject(configurationToken) private configuration: Configuration, private route: Router,
    private tableInfo: TableInfoService) {      
      this.baseUrl = configuration.baseUrl;

      this.subs.push(this.tableInfo.GetAllCountries().subscribe(result => {
        this.Countries = result;
        this.Countries = this.Countries.sort((a, b) => a.description> b.description? 1 : -1); //ordenar resposta
      }),this.tableInfo.GetAllPEPTypes().subscribe(result => {
        result.forEach(element => {
          if (element.code.startsWith('P')){
            this.PEPTypesP.push(element);
          } else if (element.code.startsWith('C')){
            this.PEPTypesC.push(element);
          }
        });
        
        this.PEPTypesP = this.PEPTypesP.sort((a, b) => a.description> b.description? 1 : -1); //ordenar resposta
        this.PEPTypesC = this.PEPTypesC.sort((a, b) => a.description> b.description? 1 : -1); //ordenar resposta
      }),this.tableInfo.GetAllStakeholderRoles().subscribe(result => {
        this.stakeholdersRoles = result;
        this.stakeholdersRoles = this.stakeholdersRoles.sort((a, b) => a.description> b.description? 1 : -1); //ordenar resposta
      }), this.tableInfo.GetAllKinships().subscribe(result => {
        this.stakeholdersKinships = result;
        this.stakeholdersKinships = this.stakeholdersKinships.sort((a, b) => a.description> b.description? 1 : -1); //ordenar resposta
      }));
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


  ngOnInit(): void {
    this.data.updateData(false, 6, 3);
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub?.unsubscribe);
  }

  form = new FormGroup({
    id: new FormControl(''),
    pep12months: new FormControl('')
  });

  submit() {
    if (this.isVisiblePep12months) {
      this.newPep.kind = KindPep.PEP,
      this.newPep.pepType = this.form.value.pepType;
      this.newPep.pepCountry = this.form.value.pepCountry;
      this.newPep.pepSince = this.form.value.pepSinceWhen;
    }

    if (this.isVisiblePepFamiliarOf) {
      this.newPep.kind = KindPep.FAMILY;
      this.newPep.degreeOfRelatedness = this.form.value.pepFamilyRelation;
    }

    if (this.isVisiblePepRelations) {
      this.newPep.kind = KindPep.BUSINESS;

      this.newPep.businessPartnership = this.form.value.pepTypeOfRelation;
    }

    if (this.isVisiblePepPoliticalPublicJobs) {
      this.newPep.kind = KindPep.PEP,
      this.newPep.pepType = this.form.value.pepType;
    }

    this.logger.debug(this.newPep);
    //Post a Pep
    // por enquanto deixei o id com o valor de 1, porque o newPep.id já n existe
    this.http.post<IPep>(this.baseUrl + 'BEPep/AddPep/'
      + 1, this.newPep).subscribe(result => {
        this.logger.debug("Enviado Pep");
        this.logger.debug(result);
      }, error => console.error(error));

    this.route.navigate(['/info-declarativa-lojas']);
  }

  //Altera os valores das variaveis de acordo com o que é selecionado em cada checkbox
  onChangeValues(event: any) {  
    var stringToBool = (event.target.value === 'true' ? true : false);
    if (event.target.name == 'pep12months') {
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
          this.form.removeControl('pepPoliticalPublicJobDesignation');
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
        this.form.addControl('pepFamiliarOf', new FormControl('', [Validators.required]));
      }
    }
    if (event.target.name == 'pepFamiliarOf') {
      this.isVisiblePepFamiliarOf = stringToBool;
      if (stringToBool) {
        //se algum dos valores das perguntas a baixo estava assinalado como "Sim" e depois selecionamos
        //alguma das opções anteriores como "Sim",
        //temos de garantir que removemos os forms que foram criados e que já não vão ser utilizados

        this.isPEPFamilyRelationSelected = false;
        this.isPEPRelationSelected = false;

        if (this.isVisiblePepRelations) {
          this.form.removeControl('pepTypeOfRelation');
        }
        if (this.isVisiblePepPoliticalPublicJobs) {
          this.form.removeControl('pepPoliticalPublicJobDesignation');
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
      this.isVisiblePepRelations = stringToBool;
      if (stringToBool) {

        //se algum dos valores das perguntas a baixo estava assinalado como "Sim" e depois selecionamos
        //alguma das opções anteriores como "Sim",
        //temos de garantir que removemos os forms que foram criados e que já não vão ser utilizados

        this.isPEPRelationSelected = false;

        if (this.isVisiblePepPoliticalPublicJobs) {
          this.form.removeControl('pepPoliticalPublicJobDesignation');
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
      this.isVisiblePepPoliticalPublicJobs = stringToBool;
      if (stringToBool) {
        this.form.addControl('pepPoliticalPublicJobDesignation', new FormControl('', [Validators.required]));
      } else {
        this.form.removeControl('pepPoliticalPublicJobDesignation');
      }
    }
    this.logger.debug(this.form);
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
}
