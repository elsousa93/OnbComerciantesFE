import { Component, OnInit, Inject, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, NgForm, FormGroup, FormControl } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StakeholdersComponent } from '../stakeholders.component';
import { IStakeholders } from '../IStakeholders.interface';
import { ActivatedRoute, Router } from '@angular/router';
//import { IReadCard } from '..//IReadCard.interface';
import { DataService } from '../../nav-menu-interna/data.service';
import { TableInfoService } from '../../table-info/table-info.service';
import { StakeholderService } from '../stakeholder.service';

@Component({
  selector: 'app-info-stakeholder',
  templateUrl: './info-stakeholder.component.html',
  styleUrls: ['./info-stakeholder.component.css']
})
export class InfoStakeholderComponent implements OnInit {

  public foo = 0;
  public displayValueSearch = "";

  stakeholderNumber: string;
  submissionId: string = "83199e44-f089-471c-9588-f2a68e24b9ab";

  @Input() isCC: boolean;

  showBtnCC: boolean;
  //readcard: IReadCard[] = [];
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

  currentStakeholder: IStakeholders = {};

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


    this.currentStakeholder = {
      fiscalId: '162243839',
      id: '1032',
      shortName: "Bijal de canela",
      fiscalAddress: {
        address: '',
        country: '',
        locality: '',
        postalArea: '',
        postalCode: ''
      }
    }

    //this.stakeholderNumber = "999";

    //stakeService.getStakeholderByID(this.stakeholderNumber, "", "").subscribe(success => {
    //  console.log(success);
    //  this.newStake = success;
    //}, error => {
    //  console.log(error);
    //});

    //Tirar o comentário depois de confirmar a página anterior (por enquanto usar um valor predefinido)
    //if (this.route.getCurrentNavigation().extras.state) {
    //  //this.isCompany = this.route.getCurrentNavigation().extras.state["isCompany"];
    //  this.stakeholderNumber = this.route.getCurrentNavigation().extras.state["stakeholderNumber"];
    //}
  }

  initializeFormWithoutCC() {
    this.formNewStakeholder = new FormGroup({
      contractAssociation: new FormControl('false', Validators.required),
      proxy: new FormControl(this.currentStakeholder.isProxy !== undefined ? this.currentStakeholder.isProxy : false, Validators.required),
      NIF: new FormControl({ value: this.currentStakeholder.fiscalId, disabled: true }, Validators.required),
      Role: new FormControl('', Validators.required),
      Country: new FormControl('', Validators.required),
      ZIPCode: new FormControl('', Validators.required),
      Locality: new FormControl('', Validators.required),
      Address: new FormControl('', Validators.required)
    })
  }


  ngOnInit(): void {
    this.newStake.fiscalId = this.router.snapshot.params['nif'];
    console.log(this.newStake.fiscalId);
    // console.log(this.route.getCurrentNavigation().extras.state["isCC"]);
    this.initializeFormWithoutCC();
    //this.createForm();
    //console.log('value antes ', this.formNewStakeholder.get('flagRecolhaEletronica').value);

    //Tirar o comentario
    //this.showYesCC = this.route.getCurrentNavigation().extras.state["isCC"];
    this.showYesCC = false;

    //this.formNewStakeholder.get('flagRecolhaEletronica').setValue(this.showYesCC);
    if (this.showYesCC) {
      this.flagRecolhaEletronica = this.showYesCC;
    }
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

  submit() {
    console.log(this.formNewStakeholder);

    if (this.formNewStakeholder.valid) {
      this.currentStakeholder.fiscalAddress.address = this.formNewStakeholder.get("Address").value;
      this.currentStakeholder.fiscalAddress.country = this.formNewStakeholder.get("Country").value;
      this.currentStakeholder.fiscalAddress.locality = this.formNewStakeholder.get("Locality").value;
      this.currentStakeholder.fiscalAddress.postalCode = this.formNewStakeholder.get("ZIPCode").value;
      this.currentStakeholder.isProxy = JSON.parse(this.formNewStakeholder.get("proxy").value);


      this.stakeService.CreateNewStakeholder(this.submissionId, this.currentStakeholder).subscribe(result => {
        console.log("Resultado de criar um stakeholder a uma submissão existente");
        console.log(result);
      }, error => {
        console.log(error);
      });
    }
  }

  //submit(formNewStakeholder) {

  //  //fazer isto para todos os campos --------------- TO DO
  //  this.newStake.fullName = formNewStakeholder.fullName;


  //  console.log(formNewStakeholder);
  //  console.log(typeof this.newStake);

  //  //Nao esta a ser usado
  //  this.stringJson = JSON.stringify(this.newStake);
  //  console.log("String json object :", this.stringJson);
  //  console.log("Type :", typeof this.stringJson);

  //  const httpOptions = {
  //    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  //  }

  //  this.http.post<IStakeholders>(this.baseUrl + 'bestakeholders/PostNewStakeholder/'
  //    + this.newStake.fiscalId, this.newStake).subscribe(result => {
  //      console.log(result);
  //    }, error => console.error(error));

  //  //Edit EditStakeholderById
  //  this.http.post<IStakeholders>(this.baseUrl + 'bestakeholders/EditStakeholderById/'
  //    + this.newStake.fiscalId + '/edit', this.newStake).subscribe(result => {
  //      console.log("EditStakeholderById");
  //      console.log(result);
  //    }, error => console.error(error));


  //}//Fim do submit

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
        //this.readcard = Object.keys(result).map(function (key) { return result[key]; });
        this.showNoCC = false;
        this.showYesCC = true;
        //console.log(this.readcard);
      } else {
        alert("Insira o cartão cidadão")
      }
    }, error => console.error("error"));
  }


  getAll() {
    console.log(this.data.GetAllCountries());
    return this.data.GetAllCountries();
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

  GetCountryByZipCode() {
    var zipcode = this.formNewStakeholder.value['ZIPCode'];
    if (zipcode.length === 8) {
      var zipCode = zipcode.split('-');

      this.data.GetAddressByZipCode(Number(zipCode[0]), Number(zipCode[1])).subscribe(address => {

        var addressToShow = address[0];

        this.formNewStakeholder.get('Address').setValue(addressToShow.address);
        this.formNewStakeholder.get('Country').setValue(addressToShow.country);
        this.formNewStakeholder.get('Locality').setValue(addressToShow.postalArea);
      });
    }
  }

}
