import { Component, Inject, OnInit, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IPep } from './IPep.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, NgForm } from '@angular/forms';
import { TableInfoService } from '../table-info/table-info.service';
import { CountryInformation, PEPTypes } from '../table-info/ITable-info.interface';
import { Configuration, configurationToken } from '../configuration';
import { NGXLogger } from 'ngx-logger';

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

  constructor(private logger : NGXLogger, private router: ActivatedRoute,
    private http: HttpClient,
    private formBuilder: FormBuilder,
    @Inject(configurationToken) private configuration: Configuration, private route: Router,
    private tableInfo: TableInfoService) {      
      this.baseUrl = configuration.baseUrl;

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


  ngOnInit(): void {
  }

  loadDataFromBE() {
    this.tableInfo.GetAllPEPTypes().subscribe(res => {
      this.PEPTypes = res;
    });

    this.tableInfo.GetAllCountries().subscribe(res => {
      this.Countries = res;
    })
  }

  form = new FormGroup({
    id: new FormControl(''),
    pep12months: new FormControl('', [Validators.required]),
    //pepType: new FormControl(''),
    //pepCountry: new FormControl('', [Validators.required, Validators.minLength(4)]),
    //pepSinceWhen: new FormControl(''),
    //pepFamiliarOf: new FormControl(''),
    //pepFamilyRelation: new FormControl(''),
    //pepRelations: new FormControl(''),
    //pepTypeOfRelation: new FormControl(''),
    //pepPoliticalPublicJobs: new FormControl(''),
    //pepPoliticalPublicJobDesignation: new FormControl(''),
    //relatedPep_type: new FormControl(''),
    //relatedPep_country: new FormControl(''),
    //relatedPep_sinceWhen: new FormControl(''),
    //relatedPep_nif: new FormControl(''),
    //relatedPep_name: new FormControl(''),
    //relatedPep_idNumber: new FormControl(''),
    //relatedPep_idDocumentType: new FormControl(''),
    //relatedPep_idDocumentValidity: new FormControl(''),
    //relatedPep_idDocumentCountry: new FormControl(''),
    //relatedPep_address: new FormControl(''),
    //relatedPep_addressLocation: new FormControl(''),
    //relatedPep_postalCode: new FormControl(''),
    //relatedPep_addressCountry: new FormControl(''),
  });



  get f() {
    return this.form.controls;
  }

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
        if (this.isVisiblePepFamiliarOf) {
          this.form.removeControl('pepFamilyRelation');
          this.removeRelatedPepFormControl();
        }
        if (this.isVisiblePepRelations) {
          this.form.removeControl('pepTypeOfRelation');
          this.removeRelatedPepFormControl();
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
        if (this.isVisiblePepRelations) {
          this.form.removeControl('pepTypeOfRelation');
          this.removeRelatedPepFormControl();
        }
        if (this.isVisiblePepPoliticalPublicJobs) {
          this.form.removeControl('pepPoliticalPublicJobDesignation');
        }

        this.isVisiblePepRelations = undefined;
        this.isVisiblePepPoliticalPublicJobs = undefined;
        this.form.removeControl('pepRelations');
        this.form.removeControl('pepPoliticalPublicJobs');
        this.form.addControl('pepFamilyRelation', new FormControl('', [Validators.required]));

        this.addRelatedPepFormControl();

        
      } else {
        this.form.addControl('pepRelations', new FormControl('', [Validators.required]));
        this.form.removeControl('pepFamilyRelation');

        this.removeRelatedPepFormControl();

      }
    }
    if (event.target.name == 'pepRelations') {
      this.isVisiblePepRelations = stringToBool;
      if (stringToBool) {

        //se algum dos valores das perguntas a baixo estava assinalado como "Sim" e depois selecionamos
        //alguma das opções anteriores como "Sim",
        //temos de garantir que removemos os forms que foram criados e que já não vão ser utilizados
        if (this.isVisiblePepPoliticalPublicJobs) {
          this.form.removeControl('pepPoliticalPublicJobDesignation');
        }

        this.isVisiblePepPoliticalPublicJobs = undefined;
        this.form.removeControl('pepPoliticalPublicJobs');
        this.form.addControl('pepTypeOfRelation', new FormControl('', [Validators.required]));

        this.addRelatedPepFormControl();
      } else {
        this.form.addControl('pepPoliticalPublicJobs', new FormControl('', [Validators.required]));
        this.form.removeControl('pepTypeOfRelation');

        this.removeRelatedPepFormControl();
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

  addRelatedPepFormControl() {
    this.form.addControl('relatedPep_type', new FormControl('', [Validators.required]));
    this.form.addControl('relatedPep_country', new FormControl('', [Validators.required]));
    this.form.addControl('relatedPep_sinceWhen', new FormControl('', [Validators.required]));
    this.form.addControl('relatedPep_nif', new FormControl('', [Validators.required]));
    this.form.addControl('relatedPep_name', new FormControl('', [Validators.required]));
    this.form.addControl('relatedPep_idNumber', new FormControl('', [Validators.required]));
    this.form.addControl('relatedPep_idDocumentType', new FormControl('', [Validators.required]));
    this.form.addControl('relatedPep_idDocumentValidity', new FormControl('', [Validators.required]));
    this.form.addControl('relatedPep_idDocumentCountry', new FormControl('', [Validators.required]));
    this.form.addControl('relatedPep_address', new FormControl('', [Validators.required]));
    this.form.addControl('relatedPep_addressLocation', new FormControl('', [Validators.required]));
    this.form.addControl('relatedPep_postalCode', new FormControl('', [Validators.required]));
    this.form.addControl('relatedPep_addressCountry', new FormControl('', [Validators.required]));
  }

  removeRelatedPepFormControl() {
    this.form.removeControl('relatedPep_type');
    this.form.removeControl('relatedPep_country');
    this.form.removeControl('relatedPep_sinceWhen');
    this.form.removeControl('relatedPep_nif');
    this.form.removeControl('relatedPep_name');
    this.form.removeControl('relatedPep_idNumber');
    this.form.removeControl('relatedPep_idDocumentType');
    this.form.removeControl('relatedPep_idDocumentValidity');
    this.form.removeControl('relatedPep_idDocumentCountry');
    this.form.removeControl('relatedPep_address');
    this.form.removeControl('relatedPep_addressLocation');
    this.form.removeControl('relatedPep_postalCode');
    this.form.removeControl('relatedPep_addressCountry');
  }
}
