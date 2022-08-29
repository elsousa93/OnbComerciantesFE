import { Component, Inject, OnInit, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IPep } from './IPep.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, NgForm } from '@angular/forms';
import { TableInfoService } from '../table-info/table-info.service';
import { CountryInformation, PEPTypes, StakeholderRole } from '../table-info/ITable-info.interface';
import { Configuration, configurationToken } from '../configuration';
import { NGXLogger } from 'ngx-logger';
import { DataService } from '../nav-menu-interna/data.service';

@Component({
  selector: 'app-pep',
  templateUrl: './pep.component.html',
  styleUrls: ['./pep.component.css']
})
export class PepComponent implements OnInit {
  private baseUrl: string;

  //REACTIVE FORM

  //Informação de campos/tabelas
  PEPTypes: PEPTypes[] = [];
  Countries: CountryInformation[] = [];
  stakeholdersRoles: StakeholderRole[] = [];

  constructor(private logger : NGXLogger, private router: ActivatedRoute, private data: DataService,
    private http: HttpClient,
    private formBuilder: FormBuilder,
    @Inject(configurationToken) private configuration: Configuration, private route: Router,
    private tableInfo: TableInfoService) {      
      this.baseUrl = configuration.baseUrl;

      this.tableInfo.GetAllCountries().subscribe(result => {
        this.Countries = result;
      });

      this.tableInfo.GetAllPEPTypes().subscribe(result => {
        this.PEPTypes = result;
      });

      this.tableInfo.GetAllStakeholderRoles().subscribe(result => {
        this.stakeholdersRoles = result;
      });
  }

  newPep: IPep = {
    isPep: undefined,
    hasFamilyRelationship: undefined,
    familyRelationshipKind: 0,
    hasBusinessRelationship: undefined,
    businessRelationshipKind: 0,
    relatedPep: {
      id: "",
      url: ""
    },
    pepDetails: {
      fiscalId: "",
      identificationDocument: {
        type: "",
        number: "",
        country: "",
        expirationDate: ""
      },
      fullName: "",
      contactName: "",
      shortName: "",
      fiscalAddress: {
        address: "",
        postalCode: "",
        postalArea: "",
        locality: "",
        country: "",
      },
      sinceWhen: "",
      kind: ""
    }
  } as IPep; //CRIAR UM PEPDETAILS E RELATEDPEP

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

  form = new FormGroup({
    id: new FormControl('')
  });

  submit() {
    if (this.isVisiblePep12months) {
      this.newPep.isPep = (this.form.value.pep12months === 'true' ? true : false); //Transforming string into boolean
      this.newPep.pepDetails.kind = this.form.value.pepType;
      this.newPep.pepDetails.fiscalAddress.country = this.form.value.pepCountry;
      this.newPep.pepDetails.sinceWhen = this.form.value.pepSinceWhen;
    }

    if (this.isVisiblePepFamiliarOf) {
      this.newPep.hasFamilyRelationship = (this.form.value.pepFamiliarOf === 'true' ? true : false);

      this.newPep.familyRelationshipKind = Number(this.form.value.pepFamilyRelation);

      this.newPep.pepDetails.kind = this.form.value.relatedPep_type;
      this.newPep.pepDetails.fiscalAddress.country = this.form.value.relatedPep_country; // são iguais e n sei qual corresponde a qual
      this.newPep.pepDetails.sinceWhen = this.form.value.relatedPep_sinceWhen;
      this.newPep.pepDetails.fiscalId = this.form.value.relatedPep_nif;
      this.newPep.pepDetails.fullName = this.form.value.relatedPep_name;
      this.newPep.pepDetails.identificationDocument.number = this.form.value.relatedPep_idNumber;
      this.newPep.pepDetails.identificationDocument.type = this.form.value.relatedPep_idDocumentType;
      this.newPep.pepDetails.identificationDocument.expirationDate = this.form.value.relatedPep_idDocumentValidity;
      this.newPep.pepDetails.identificationDocument.country = this.form.value.relatedPep_idDocumentCountry;
      this.newPep.pepDetails.fiscalAddress.address = this.form.value.relatedPep_address;
      this.newPep.pepDetails.fiscalAddress.locality = this.form.value.relatedPep_addressLocation;
      this.newPep.pepDetails.fiscalAddress.postalCode = this.form.value.relatedPep_postalCode;
      this.newPep.pepDetails.fiscalAddress.country = this.form.value.relatedPep_addressCountry; // são iguais e n sei qual corresponde a qual
    }

    if (this.isVisiblePepRelations) {
      this.newPep.hasBusinessRelationship = (this.form.value.pepRelations === 'true' ? true : false);

      this.newPep.businessRelationshipKind = Number(this.form.value.pepTypeOfRelation);

      this.newPep.pepDetails.kind = this.form.value.relatedPep_type;
      this.newPep.pepDetails.fiscalAddress.country = this.form.value.relatedPep_country; // são iguais e n sei qual corresponde a qual
      this.newPep.pepDetails.sinceWhen = this.form.value.relatedPep_sinceWhen;
      this.newPep.pepDetails.fiscalId = this.form.value.relatedPep_nif;
      this.newPep.pepDetails.fullName = this.form.value.relatedPep_name;
      this.newPep.pepDetails.identificationDocument.number = this.form.value.relatedPep_idNumber;
      this.newPep.pepDetails.identificationDocument.type = this.form.value.relatedPep_idDocumentType;
      this.newPep.pepDetails.identificationDocument.expirationDate = this.form.value.relatedPep_idDocumentValidity;
      this.newPep.pepDetails.identificationDocument.country = this.form.value.relatedPep_idDocumentCountry;
      this.newPep.pepDetails.fiscalAddress.address = this.form.value.relatedPep_address;
      this.newPep.pepDetails.fiscalAddress.locality = this.form.value.relatedPep_addressLocation;
      this.newPep.pepDetails.fiscalAddress.postalCode = this.form.value.relatedPep_postalCode;
      this.newPep.pepDetails.fiscalAddress.country = this.form.value.relatedPep_addressCountry; // são iguais e n sei qual corresponde a qual
    }

    if (this.isVisiblePepPoliticalPublicJobs) {
      //this.newPep.pepPoliticalPublicJobs = (this.form.value.pepPoliticalPublicJobs === 'true' ? true : false);
      //this.newPep.pepPoliticalPublicJobDesignation = this.form.value.pepPoliticalPublicJobDesignation;
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
        this.form.removeControl('pepType');
        this.form.removeControl('pepCountry');
        this.form.removeControl('pepSinceWhen');
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

    this.form.addControl('pepFamiliarOf', new FormControl('', [Validators.required]));
  }
  checkSelectedFamiliar() {
    this.isPEPFamilyRelationSelected = false;
    this.isPEPRelationSelected = false;
    var pepFamilyRelation = (<HTMLInputElement>document.getElementById("pepFamilyRelation")).value;

    if (pepFamilyRelation != "") {
      this.isPEPFamilyRelationSelected = true;
    }

    this.form.addControl('pepRelations', new FormControl('', [Validators.required]));

  }
  checkSelectedRelations() {
    this.isPEPRelationSelected = false;
    var pepRelationType = (<HTMLInputElement>document.getElementById("pepTypeOfRelation")).value;

    if (pepRelationType != "") {
      this.isPEPRelationSelected = true;
    }

    this.form.addControl('pepPoliticalPublicJobs', new FormControl('', [Validators.required]));
    
  }
}
