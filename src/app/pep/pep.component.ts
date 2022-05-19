import { Component, Inject, OnInit, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IPep } from './IPep.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, NgForm } from '@angular/forms';

@Component({
  selector: 'app-pep',
  templateUrl: './pep.component.html',
  styleUrls: ['./pep.component.css']
})
export class PepComponent implements OnInit {

  //REACTIVE FORM

  constructor(private router: ActivatedRoute,
    private http: HttpClient,
    private formBuilder: FormBuilder,
    @Inject('BASE_URL')
    private baseUrl: string, private route: Router) {
  }
  newPep: IPep = { } as IPep;

  //Varibales for divs in HTML, when selected 
  isVisiblePep12months: any;
  isSelected: boolean = true;
  isVisiblePepFamiliarOf: any;
  isVisiblePepRelations: any;
  isVisiblePepPoliticalPublicJobs: any;


  ngOnInit(): void {

  }

  form = new FormGroup({
    id: new FormControl(''),
    pep12months: new FormControl(''),
    pepType: new FormControl(''),
    pepCountry: new FormControl(''),
    pepSinceWhen: new FormControl(''),
    pepFamiliarOf: new FormControl(''),
    pepFamilyRelation: new FormControl(''),
    pepRelations: new FormControl(''),
    pepTypeOfRelation: new FormControl(''),
    pepPoliticalPublicJobs: new FormControl(''),
    pepPoliticalPublicJobDesignation: new FormControl(''),
    relatedPep_type: new FormControl(''),
    relatedPep_country: new FormControl(''),
    relatedPep_sinceWhen: new FormControl(''),
    relatedPep_nif: new FormControl(''),
    relatedPep_name: new FormControl(''),
    relatedPep_idNumber: new FormControl(''),
    relatedPep_idDocumentType: new FormControl(''),
    relatedPep_idDocumentValidity: new FormControl(''),
    relatedPep_idDocumentCountry: new FormControl(''),
    relatedPep_address: new FormControl(''),
    relatedPep_addressLocation: new FormControl(''),
    relatedPep_postalCode: new FormControl(''),
    relatedPep_addressCountry: new FormControl(''),

  });



  get f() {
    return this.form.controls;
  }

  submit() {
    console.log(this.form.value);
    console.log(this.form.value.pep12months);
    console.log(typeof this.form.value.pep12months);

    this.newPep.id = this.form.value.id;
    this.newPep.pep12months = (this.form.value.pep12months === 'true' ? true : false); //Transforming string into boolean
    this.newPep.pepType = this.form.value.pepType;

    this.newPep.pepCountry = this.form.value.pepCountry;
    this.newPep.pepSinceWhen = this.form.value.pepSinceWhen;

    this.newPep.pepFamiliarOf = (this.form.value.pepFamiliarOf === 'true' ? true : false);
    this.newPep.pepFamilyRelation = this.form.value.pepFamilyRelation;
    this.newPep.pepRelations = (this.form.value.pepRelations  === 'true' ? true : false);
    this.newPep.pepTypeOfRelation = this.form.value.pepTypeOfRelation;

    this.newPep.pepPoliticalPublicJobs = (this.form.value.pepPoliticalPublicJobs === 'true' ? true : false);
    this.newPep.pepPoliticalPublicJobDesignation = this.form.value.pepPoliticalPublicJobDesignation;
  
    this.newPep.relatedPep_type = this.form.value.relatedPep_type;
    this.newPep.relatedPep_country = this.form.value.relatedPep_country;
    this.newPep.relatedPep_sinceWhen = this.form.value.relatedPep_sinceWhen;
    this.newPep.relatedPep_nif = this.form.value.relatedPep_nif;
    this.newPep.relatedPep_name = this.form.value.relatedPep_name;
    this.newPep.relatedPep_idNumber = this.form.value.relatedPep_idNumber;
    this.newPep.relatedPep_idDocumentType = this.form.value.relatedPep_idDocumentType;
    this.newPep.relatedPep_idDocumentValidity = this.form.value.relatedPep_idDocumentValidity;
    this.newPep.relatedPep_idDocumentCountry = this.form.value.relatedPep_idDocumentCountry;
    this.newPep.relatedPep_address = this.form.value.relatedPep_address;
    this.newPep.relatedPep_addressLocation = this.form.value.relatedPep_addressLocation;
    this.newPep.relatedPep_postalCode = this.form.value.relatedPep_postalCode;
    this.newPep.relatedPep_addressCountry = this.form.value.relatedPep_addressCountry;

    //Post a Pep 
    this.http.post<IPep>(this.baseUrl + 'bepep/AddPep/'
      + this.newPep.id, this.newPep).subscribe(result => {
        console.log("Enviado Pep");
        console.log(result);
      }, error => console.error(error));
  }
}
