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
import { CountryInformation } from '../../table-info/ITable-info.interface';
import { Configuration, configurationToken } from 'src/app/configuration';
import { SubmissionService } from '../../submission/service/submission-service.service';
import { error } from '@angular/compiler/src/util';
import { DatePipe } from '@angular/common';
import { docTypeENI } from '../../client/docType';

@Component({
  selector: 'app-new-stakeholder',
  templateUrl: './new-stakeholder.component.html',
  styleUrls: ['./new-stakeholder.component.css'],
  providers: [DatePipe]
})

/**
 * Child component of Stakeholders Component
*/

export class NewStakeholderComponent implements OnInit {
  private baseUrl: string;

  public foo = 0;
  public displayValueSearch = "";
  isSelected = false;

  stakeholderNumber: string;

  crcStakeholders: IStakeholders[] = [];

  submissionId: string;
  //submissionId: string = "83199e44-f089-471c-9588-f2a68e24b9ab";

  countries: CountryInformation[] = [];

  @Input() isCC: boolean;

  showBtnCC: boolean;
  readcard: IReadCard[] = [];
  showNoCC: boolean = false;
  showYesCC: boolean = false;

  // Variables that are not on YAML
  flagAssociado: boolean = true;
  flagProcurador: boolean = true;
  flagRecolhaEletronica: boolean = null;

  selectedStakeholderIsFromCRC = false;

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
  currentIdx: number = 0;

  submissionStakeholders: IStakeholders[] = [];

  returned: string;

  ListaDocTypeENI = docTypeENI;

  loadCountries() {
    this.tableData.GetAllCountries().subscribe(result => {
      this.countries = result;
    }, error => {
      console.log(error);
    })
  }

  constructor(private router: ActivatedRoute,
    private http: HttpClient,
    @Inject(configurationToken) private configuration: Configuration,
    private route: Router, private fb: FormBuilder, private data: DataService, private tableData: TableInfoService, private stakeService: StakeholderService, private submissionService: SubmissionService, private datePipe: DatePipe) {
    this.loadCountries();
    this.baseUrl = configuration.baseUrl;
    this.submissionId = localStorage.getItem('submissionId');
    this.crcStakeholders = JSON.parse(localStorage.getItem('crcStakeholders'));

    console.log("CRC STAKEHOLDERS");
    console.log(this.crcStakeholders);
    this.ngOnInit();

    var context = this;
    this.submissionService.GetSubmissionByProcessNumber(localStorage.getItem("processNumber")).subscribe(result => {
      console.log("Ir buscar submissão através do processNumber", result);
      this.submissionService.GetSubmissionByID(result[0].submissionId).subscribe(resul => {
        console.log("Ir buscar os detalhes da submissão com o seu ID ", resul);
        this.stakeService.GetAllStakeholdersFromSubmission(result[0].submissionId).subscribe(res => {
          console.log('Lista de stakeholders da submissão ', res);
          res.forEach(function (value, index) {
            console.log("Stake ", value);
            context.stakeService.GetStakeholderFromSubmission(result[0].submissionId, value.id).subscribe(r => {
              console.log("Info stakeholder ", r);
              context.submissionStakeholders.push(r);
            }, error => {
              console.log(error);
            });
          }, error => {
            console.log(error);
          });
        });
      });
    });

    console.log("Lista que fomos buscar à submissão antiga ", this.submissionStakeholders);

    stakeService.GetAllStakeholdersFromSubmission(this.submissionId).subscribe(result => {
      result.forEach(function (value, index) {
        console.log("Value ", value);
        context.stakeService.GetStakeholderFromSubmission(context.submissionId, value.id).subscribe(result => {
          console.log("Info stake ", result);
          context.submissionStakeholders.push(result);
        }, error => {
          console.log(error);
        });
      });
    }, error => {
      console.log(error);
    });

    console.log("Lista depois de irmos buscar stakeholders à submissao atual (CRC) ", this.submissionStakeholders);
    

    //this.currentStakeholder = {
    //  fiscalId: '162243839',
    //  id: '1032',
    //  shortName: "Bijal de canela",
    //  fiscalAddress: {
    //    address: '',
    //    country: '',
    //    locality: '',
    //    postalArea: '',
    //    postalCode: ''
    //  }
    //}

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

  isStakeholderFromCRC(stakeholder) {
    console.log("PERTENCE AO CRC??");
    console.log(stakeholder);
    this.selectedStakeholderIsFromCRC = false;
    var context = this;
    this.crcStakeholders.forEach(function (value, idx) {
      var stakeholderFromCRC = value;
      console.log(stakeholderFromCRC);
      console.log("----------------");
      if (stakeholder.fiscalId === stakeholderFromCRC.fiscalId) {
        console.log("sim");
        context.selectedStakeholderIsFromCRC = true;
      }
    });
    console.log("------ NÃO ENCONTROU --------");
  }

  updateForm(stakeholder, idx) {
    console.log("chegou aqui");
    console.log(stakeholder);
    this.currentStakeholder = stakeholder;
    this.currentIdx = idx;
    this.isSelected = true;
    this.isStakeholderFromCRC(this.currentStakeholder);
    console.log(this.selectedStakeholderIsFromCRC);
    //this.initializeFormWithoutCC();
    if (this.returned !== null) {
      if (this.currentStakeholder.identificationDocument != undefined || this.currentStakeholder.identificationDocument != null) {
        //if (this.currentStakeholder.identificationDocument.number == '004') {
        //  console.log('ENtrou cartão de cidadão');
        //  this.createFormCC();// mudei a ordem
        //  this.validateCC(true);
        //} else {
        //  this.initializeFormWithoutCC();
        //  this.validateCC(false);
        //}
        console.log('ENtrou cartão de cidadão');
          this.createFormCC();// mudei a ordem
          this.validateCC(true);
      } else {
        this.initializeFormWithoutCC();
        this.validateCC(false);
      }
    } else {
        this.initializeFormWithoutCC();
    }
  }

  initializeFormWithoutCC() {
    console.log("stakeholder a ir a informação: ", this.currentStakeholder);
    this.formNewStakeholder = new FormGroup({
      contractAssociation: new FormControl('false', Validators.required),
      proxy: new FormControl(this.currentStakeholder.isProxy !== undefined ? this.currentStakeholder.isProxy + '' : false, Validators.required),
      NIF: new FormControl({ value: this.currentStakeholder.fiscalId, disabled: this.selectedStakeholderIsFromCRC }, Validators.required),
      Role: new FormControl({ value: '', disabled: this.selectedStakeholderIsFromCRC }, Validators.required),
      Country: new FormControl((this.returned !== null && this.currentStakeholder.fiscalAddress !== undefined) ? this.currentStakeholder.fiscalAddress.country : '', Validators.required),
      ZIPCode: new FormControl((this.returned !== null && this.currentStakeholder.fiscalAddress !== undefined) ? this.currentStakeholder.fiscalAddress.postalCode : '', Validators.required),
      Locality: new FormControl((this.returned !== null && this.currentStakeholder.fiscalAddress !== undefined) ? this.currentStakeholder.fiscalAddress.locality : '', Validators.required),
      Address: new FormControl((this.returned !== null && this.currentStakeholder.fiscalAddress !== undefined) ? this.currentStakeholder.fiscalAddress.address : '', Validators.required)
    })
  }


  ngOnInit(): void {
    this.data.updateData(false,2,2);
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

  createFormCC() {
    this.formNewStakeholder = this.fb.group({
      flagRecolhaEletronica: new FormControl(this.showYesCC),
      documentType: new FormControl((this.returned !== null && this.currentStakeholder.identificationDocument !== undefined) ? this.currentStakeholder.identificationDocument.type : ''),
      identificationDocumentCountry: new FormControl((this.returned !== null && this.currentStakeholder.identificationDocument !== undefined) ? this.currentStakeholder.identificationDocument.country : ''),
      identificationDocumentValidUntil: new FormControl((this.returned !== null && this.currentStakeholder.identificationDocument !== undefined) ? this.datePipe.transform(this.currentStakeholder.identificationDocument.expirationDate, 'dd-MM-yyyy') : ''),
      identificationDocumentId: new FormControl((this.returned !== null && this.currentStakeholder.identificationDocument !== undefined) ? this.currentStakeholder.identificationDocument.number : ''),
      contractAssociation: new FormControl('false', Validators.required),
      proxy: new FormControl(this.currentStakeholder.isProxy !== undefined ? this.currentStakeholder.isProxy + '' : false, Validators.required),
    });
  }

  submit() {
    console.log(this.formNewStakeholder);
    if (this.returned !== 'consult') {
      console.log('Entrei no if do submit dos stakeholders');
      if (this.formNewStakeholder.valid) {
        this.currentStakeholder.fiscalAddress.address = this.formNewStakeholder.get("Address").value;
        this.currentStakeholder.fiscalAddress.country = this.formNewStakeholder.get("Country").value;
        this.currentStakeholder.fiscalAddress.locality = this.formNewStakeholder.get("Locality").value;
        this.currentStakeholder.fiscalAddress.postalCode = this.formNewStakeholder.get("ZIPCode").value;
        this.currentStakeholder.fiscalAddress.postalArea = this.formNewStakeholder.get("Locality").value;

        console.log(this.formNewStakeholder.get('proxy').value);
        console.log((this.formNewStakeholder.get("proxy").value === 'true'));
        this.currentStakeholder.isProxy = (this.formNewStakeholder.get("proxy").value === 'true');

        if (this.showYesCC && !this.showNoCC) {
          this.currentStakeholder.identificationDocument.type = this.formNewStakeholder.get("documentType").value;
          this.currentStakeholder.identificationDocument.number = this.formNewStakeholder.get("identificationDocumentId").value;
          this.currentStakeholder.identificationDocument.country = this.formNewStakeholder.get("identificationDocumentCountry").value;
          this.currentStakeholder.identificationDocument.expirationDate = this.formNewStakeholder.get("documentCountry").value;
        }

        console.log("current stakeholder");
        console.log(this.currentStakeholder);
        this.stakeService.UpdateStakeholder(this.submissionId, this.currentStakeholder.id, this.currentStakeholder).subscribe(result => {
          console.log("Resultado de criar um stakeholder a uma submissão existente");
          if (this.currentIdx < (this.submissionStakeholders.length - 1)) {
            this.currentIdx = this.currentIdx + 1;
            this.currentStakeholder = this.submissionStakeholders[this.currentIdx];
            console.log(this.currentStakeholder);
          }

        }, error => {
          console.log(error);
        });
      }
    } else {
      console.log("Não entrei no if do Submit dos stakeholders");
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
    console.log(this.tableData.GetAllCountries());
    return this.tableData.GetAllCountries();
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
      console.log("Stakeholder atual: ", this.currentStakeholder);
    });
  }

  GetCountryByZipCode() {
    var currentCountry = this.formNewStakeholder.get('Country').value;
    console.log("Pais escolhido atual");

    if (currentCountry === 'PT') {
      var zipcode = this.formNewStakeholder.value['ZIPCode'];
      if (zipcode.length === 8) {
        var zipCode = zipcode.split('-');

        this.tableData.GetAddressByZipCode(Number(zipCode[0]), Number(zipCode[1])).subscribe(address => {

          var addressToShow = address[0];

          this.formNewStakeholder.get('Address').setValue(addressToShow.address);
          this.formNewStakeholder.get('Country').setValue(addressToShow.country);
          this.formNewStakeholder.get('Locality').setValue(addressToShow.postalArea);

          this.formNewStakeholder.updateValueAndValidity();
        });
      }
    }
  }


}

