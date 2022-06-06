import { Component, OnInit, Inject, Output, EventEmitter  } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, NgForm, FormGroup } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StakeholdersComponent } from '../stakeholders.component';
import { IStakeholders } from '../IStakeholders.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { IReadCard } from './IReadCard.interface';

@Component({
  selector: 'app-new-stakeholder',
  templateUrl: './new-stakeholder.component.html',
  styleUrls: ['./new-stakeholder.component.css']
})

/**
 * Child component of Stakeholders Component
*/

export class NewStakeholderComponent implements OnInit {
  public foo = 0;
  public displayValueSearch = "";

  showBtnCC: boolean = false;
  readcard:IReadCard[]= [];
  showNoCC: boolean = true;
  showYesCC: boolean = false;

  // Variables that are not on YAML
  flagAssociado: boolean = true;
  flagProcurador: boolean = true;
  flagRecolhaEletronica: boolean = true;

  formNewStakeholder!: FormGroup;


  newStake: IStakeholders = {
    fiscalId: 0,
    fullName: '',
    identificationDocument: {
      identificationDocumentType: "",
      identificationDocumentId: "",
      identificationDocumentCountry: "nisi mollit",
    },
     fiscalAddress: {
      address: "ullamco minim fugiat veniam",
      postalCode: "sed nulla consequat et",
      postalArea: "commodo",
      country: "ex dolor "
    },
  } as IStakeholders

  constructor(private router: ActivatedRoute,
    private http: HttpClient, @Inject('BASE_URL')
    private baseUrl: string, private route: Router, private fb: FormBuilder ) {

    this.ngOnInit();
 
    console.log(this.newStake.fiscalId);

    if (this.newStake.fiscalId != 0) {
      http.get<IStakeholders>(baseUrl + 'bestakeholders/EditStakeholderById/' + this.newStake.fiscalId ).subscribe(result => {
        console.log(result);
        this.newStake = result;
      }, error => console.error(error));
    }
  }

   ngOnInit(): void {
     this.createForm();
  }

  //@Output()  newStakeholderAdded = new EventEmitter<any>();
    stringJson: any;

  createForm() {
    this.formNewStakeholder = this.fb.group({
      flagAssociado: [''],
      flagProcurador: [''],
      flagRecolhaEletronica: [''],
      fullName: [''],
      documentType: [''],
      identificationDocumentCountry: [''],
      identificationDocumentValidUntil: [''],
      fiscalId: [''],
      address: [''],
      postalCode: [''],
      postalArea: [''],
      country: [''],

    });
  }
  submit(formNewStakeholder) {
  
    //fazer isto para todos os campos --------------- TO DO
    this.newStake.fullName = formNewStakeholder.fullName;


    console.log(formNewStakeholder);
    console.log(typeof this.newStake);

    //Nao esta a ser usado
    this.stringJson = JSON.stringify(this.newStake);
    console.log("String json object :", this.stringJson);
    console.log("Type :", typeof this.stringJson);

    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }

    this.http.post<IStakeholders>(this.baseUrl + 'bestakeholders/PostNewStakeholder/'
      + this.newStake.fiscalId, this.newStake).subscribe(result => {
        console.log(result);
      }, error => console.error(error));

    //Edit EditStakeholderById
    this.http.post<IStakeholders>(this.baseUrl + 'bestakeholders/EditStakeholderById/'
      + this.newStake.fiscalId + '/edit', this.newStake).subscribe(result => {
        console.log("EditStakeholderById");
        console.log(result);
      }, error => console.error(error));


  }//Fim do submit

  onClickDelete(nif, clientNr) {
    this.http.delete<IStakeholders[]>(this.baseUrl + 'bestakeholders/DeleteStakeholderById/' +
      +this.newStake.fiscalId + '/' + this.newStake.fiscalId + '/delete').subscribe(result => {
      }, error => console.error(error));
    this.route.navigate(['stakeholders']);
  }

  validateCC(validate: boolean){
    if(validate == true){
      this.showBtnCC = true;
      this.showYesCC = true;
      this.showNoCC = false;
    }
    else{
      this.showBtnCC = false;
      this.showYesCC = false;
      this.showNoCC = true;
    }
      
    
  }

  selectCC(){
    this.http.get(this.baseUrl + `CitizenCard`).subscribe(result => {
      if(result != null){
        this.readcard = Object.keys(result).map(function (key) { return result[key]; });
        this.showNoCC = false;
        this.showYesCC = true;
        console.log(this.readcard);
      }else{
        alert("Insira o cartão cidadão")
      }
    }, error => console.error("error"));
  }
  
}
