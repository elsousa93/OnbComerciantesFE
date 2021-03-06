import { Component, OnInit, Inject, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, NgForm, FormGroup, FormControl } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StakeholdersComponent } from '../stakeholders.component';
import { IStakeholders } from '../IStakeholders.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { IReadCard } from './IReadCard.interface';
import { DataService } from '../../nav-menu-interna/data.service';
import { TableInfoService } from '../../table-info/table-info.service';
import { StakeholderService } from '../stakeholder.service';

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
        code: ""
      },
    },
    fiscalAddress: {
      address: "",
      postalCode: "",
      postalArea: "",
      country: ""
    },
  } as unknown as IStakeholders

  currentStakeholder: any;

  constructor(private router: ActivatedRoute,
    private http: HttpClient, @Inject('BASE_URL')
    private baseUrl: string, private route: Router, private fb: FormBuilder, private data: TableInfoService, private stakeService: StakeholderService) {

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
        alert("Insira o cart??o cidad??o")
      }
    }, error => console.error("error"));
  }


  getAll() {
    console.log(this.data.GetAllCountries());
    return this.data.GetAllCountries();
  }

  searchZipCode() {
    var size = this.newStake.fiscalAddress.postalCode.length;
    var hasSlash = (this.newStake.fiscalAddress.postalCode.split('-').length - 1) == 1;

    //const replaced =
    //  this.newStake.fiscalAddress.postalCode.substring(0, 4) +
    //  '-' +
    //  this.newStake.fiscalAddress.postalCode.substring(4 + size);

    //console.log(hasSlash);

    //if (!hasSlash && size > 4)
    //  this.newStake.fiscalAddress.postalCode = replaced;

    //if (!hasSlash) {
    //  console.log("entrou1");
    //  if (size > 3) {
    //    console.log("entrou2");
    //    this.newStake.fiscalAddress.postalCode += '-';
    //  }
    //}

    /*if (size === 8 && hasSlash) {*/
    if (size > 7) {
      console.log("Ola");
      var zipCode = this.newStake.fiscalAddress.postalCode.split('-');
      this.data.GetAddressByZipCode(Number(zipCode[0]), Number(zipCode[1])).subscribe(address => {
        var addressToShow = address[0];
        this.newStake.fiscalAddress.address = addressToShow.address;
        this.newStake.fiscalAddress.country = addressToShow.country;
        this.newStake.fiscalAddress.postalArea = addressToShow.postalArea;
        this.newStake.fiscalAddress.postalCode = addressToShow.postalCode;
      });
      console.log("ja tou a pesquisar");
    }
    //  console.log(morada);
    //}
  }

  b64toBlob(b64Data: any, contentType: string, sliceSize: number) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    const blobUrl = window.URL.createObjectURL(blob);
    window.open(blobUrl, '_blank',
      `margin: auto;
      width: 50%;
      padding: 10px;
      text-align: center;
      border: 3px solid green;` );
  }

  chooseStakeholder(stake: any) {
    this.stakeService.getStakeholderByID(stake.stakeholderId, "8ed4a062-b943-51ad-4ea9-392bb0a23bac", "22195900002451", "fQkRbjO+7kGqtbjwnDMAag==").subscribe(result => {
      this.currentStakeholder = result;
    });
  }
}

