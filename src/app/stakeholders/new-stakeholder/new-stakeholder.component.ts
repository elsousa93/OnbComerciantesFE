import { Component, OnInit, Inject, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, NgForm, FormGroup, FormControl } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StakeholdersComponent } from '../stakeholders.component';
import { IStakeholders } from '../IStakeholders.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { IReadCard } from './IReadCard.interface';
import { DataService } from '../../nav-menu-interna/data.service';
import { TableInfoService } from '../../table-info/table-info.service';

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

  @Input() isCC: boolean;

  showBtnCC: boolean;
  readcard: IReadCard[] = [];
  showNoCC: boolean = false;
  showYesCC: boolean = false;

  // Variables that are not on YAML
  flagAssociado: boolean = true;
  flagProcurador: boolean = true;
  flagRecolhaEletronica: boolean = null;

  formNewStakeholder!: FormGroup;
 
  newStake: IStakeholders = {
    fiscalId: 0,
    fullName: '',
    identificationDocument: {
      type: "",
      number: "",
      country: {
        code: "nisi mollit"
      },
    },
    fiscalAddress: {
      address: "ullamco minim fugiat veniam",
      postalCode: "sed nulla consequat et",
      postalArea: "commodo",
      country: "ex dolor "
    },
  } as unknown as IStakeholders

  constructor(private router: ActivatedRoute,
    private http: HttpClient, @Inject('BASE_URL')
    private baseUrl: string, private route: Router, private fb: FormBuilder, private data: TableInfoService) {

    this.ngOnInit();

    if (this.newStake.fiscalId != "0") {
      http.get<IStakeholders>(baseUrl + 'bestakeholders/EditStakeholderById/' + this.newStake.fiscalId).subscribe(result => {
        console.log(result);
        this.newStake = result;
      }, error => console.error(error));
    }
  }

  ngOnInit(): void {
    this.newStake.fiscalId = this.router.snapshot.params['nif'];
    // console.log(this.route.getCurrentNavigation().extras.state["isCC"]);
    
    this.createForm();
    console.log('value antes ', this.formNewStakeholder.get('flagRecolhaEletronica').value);
    this.showYesCC = this.route.getCurrentNavigation().extras.state["isCC"];
    this.formNewStakeholder.get('flagRecolhaEletronica').setValue(this.showYesCC);
    if (this.showYesCC) {
      this.flagRecolhaEletronica = this.showYesCC;
    }
    console.log('flag ', this.flagRecolhaEletronica);
    console.log('value depois ', this.formNewStakeholder.get('flagRecolhaEletronica').value);
  }

  //@Output()  newStakeholderAdded = new EventEmitter<any>();
  stringJson: any;

  createForm() {
    this.formNewStakeholder = this.fb.group({
      flagAssociado: [''],
      flagProcurador: [''],
      flagRecolhaEletronica: new FormControl(this.showYesCC),
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

  validateCC(validate: boolean) {
    if (validate == true) {
      this.showBtnCC = true;
      this.showYesCC = true;
      this.showNoCC = false;
    }
    else {
      this.showBtnCC = false;
      this.showYesCC = false;
      this.showNoCC = true;
    }


  }

  selectCC() {
    this.http.get(this.baseUrl + `CitizenCard`).subscribe(result => {
      if (result != null) {
        this.readcard = Object.keys(result).map(function (key) { return result[key]; });
        this.showNoCC = false;
        this.showYesCC = true;
        console.log(this.readcard);
      } else {
        alert("Insira o cartão cidadão")
      }
    }, error => console.error("error"));
  }


  getAll() {
    console.log(this.data.GetAllCountries());
    return this.data.GetAllCountries();
  }

  searchZipCode() {
    console.log("ola");
    var size = this.newStake.fiscalAddress.postalCode.length;
    var hasSlash = (this.newStake.fiscalAddress.postalCode.split('-').length - 1) == 1;

    //const replaced =
    //  this.newStake.fiscalAddress.postalCode.substring(0, 4) +
    //  '-' +
    //  this.newStake.fiscalAddress.postalCode.substring(4 + size);

    //console.log(hasSlash);

    //if (!hasSlash && size > 4)
    //  this.newStake.fiscalAddress.postalCode = replaced;

    if (!hasSlash) {
      console.log("entrou1");
      if (size > 3) {
        console.log("entrou2");
        this.newStake.fiscalAddress.postalCode += '-';
      }
    }

    if (size == 7 && hasSlash) {
      var zipCode = this.newStake.fiscalAddress.postalCode.split('-');
      var morada = this.data.GetAddressByZipCode(Number(zipCode[0]), Number(zipCode[1]));
      console.log("ja tou a pesquisar");
      console.log(morada);
    }
  }
}

