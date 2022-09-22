import { Component, OnInit, Inject, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, NgForm, FormGroup, FormControl } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StakeholdersComponent } from '../stakeholders.component';
import { IStakeholders, StakeholdersCompleteInformation } from '../IStakeholders.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { IReadCard } from './IReadCard.interface';
import { DataService } from '../../nav-menu-interna/data.service';
import { TableInfoService } from '../../table-info/table-info.service';
import { StakeholderService } from '../stakeholder.service';
import { CountryInformation, StakeholderRole } from '../../table-info/ITable-info.interface';
import { Configuration, configurationToken } from 'src/app/configuration';
import { SubmissionService } from '../../submission/service/submission-service.service';
import { error } from '@angular/compiler/src/util';
import { DatePipe } from '@angular/common';
import { docTypeENI } from '../../client/docType';
import { LoggerService } from 'src/app/logger.service';
import { Subscription } from 'rxjs';

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
  isSelected = false; //back to false

  allStakeholdersComprovativos = {};

  selectedStakeholderComprovativos = [];

  stakeholderNumber: string;

  crcStakeholders: IStakeholders[] = [];
  ccStakeholders: IStakeholders[] = [];

  submissionId: string;
  processNumber: string;
  //submissionId: string = "83199e44-f089-471c-9588-f2a68e24b9ab";

  countries: CountryInformation[] = [];

  @Input() isCC: boolean;

  lockLocality: boolean = false;
  showBtnCC: boolean;
  readcard: IReadCard[] = [];
  showNoCC: boolean = false;
  showYesCC: boolean = false;

  // Variables that are not on YAML
  flagAssociado: boolean = true;
  flagProcurador: boolean = true;
  flagRecolhaEletronica: boolean = null;

  selectedStakeholderIsFromCRC = false;
  selectedStakeholderIsFromCC = false;

  formNewStakeholder!: FormGroup;

  newStake: IStakeholders = {
    fiscalId: 0,
    fullName: '',
    identificationDocument: {
      type: "",
      number: "",
      country: "",
      code: ""

    },
    fiscalAddress: {
      address: "",
      postalCode: "",
      postalArea: "",
      country: ""
    },
  } as unknown as IStakeholders

  currentStakeholder: StakeholdersCompleteInformation = {};
  currentIdx: number = 0;

  submissionStakeholders: IStakeholders[] = [];

  stakeholdersRoles: StakeholderRole[] = [];

  returned: string;

  ListaDocTypeENI = docTypeENI;

  loadCountries() {
    this.subs.push(this.tableData.GetAllCountries().subscribe(result => {
      this.countries = result;
      this.countries = this.countries.sort((a, b) => a.description> b.description? 1 : -1); //ordenar resposta
    }, error => {
      this.logger.error(error);
    }))
  }

  loadStakeholdersRoles() {
    this.subs.push(this.tableData.GetAllStakeholderRoles().subscribe(result => {
      this.stakeholdersRoles = result;
      this.stakeholdersRoles = this.stakeholdersRoles.sort((a, b) => a.description> b.description? 1 : -1); //ordenar resposta
    }, error => {
      this.logger.error(error);
    }));
  }

  loadTableInfoData() {
    this.loadCountries();
    this.loadStakeholdersRoles();
  }

  public subs: Subscription[] = [];

  constructor(private logger: LoggerService, private router: ActivatedRoute, private http: HttpClient,
    @Inject(configurationToken) private configuration: Configuration, private route: Router, private fb: FormBuilder,
    private data: DataService, private tableData: TableInfoService, private stakeService: StakeholderService,
    private submissionService: SubmissionService, private datePipe: DatePipe) {

    this.loadTableInfoData();
    this.baseUrl = configuration.baseUrl;
    this.submissionId = localStorage.getItem('submissionId');
    this.processNumber = localStorage.getItem("processNumber");
    this.crcStakeholders = JSON.parse(localStorage.getItem('crcStakeholders'));

    this.ngOnInit();

    var context = this;

    if (this.returned != null) {
      this.submissionService.GetSubmissionByProcessNumber(localStorage.getItem("processNumber")).subscribe(result => {
        this.submissionService.GetSubmissionByID(result[0].submissionId).subscribe(resul => {
          this.stakeService.GetAllStakeholdersFromSubmission(result[0].submissionId).subscribe(res => {
            res.forEach(function (value, index) {
              context.stakeService.GetStakeholderFromSubmission(result[0].submissionId, value.id).subscribe(r => {
                context.submissionStakeholders.push(r);
              }, error => {
              });
            }, error => {
            });
          });
        });
      });
    }
    // this.updateForm(null); console.log("Update Form: Done");
    console.log("submissionId: ", this.submissionId);
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
    //  this.logger.debug(success);
    //  this.newStake = success;
    //}, error => {
    //  this.logger.debug(error);
    //});

    //Tirar o comentário depois de confirmar a página anterior (por enquanto usar um valor predefinido)
    //if (this.route.getCurrentNavigation().extras.state) {
    //  //this.isCompany = this.route.getCurrentNavigation().extras.state["isCompany"];
    //  this.stakeholderNumber = this.route.getCurrentNavigation().extras.state["stakeholderNumber"];
    //}
  }

  getStakeFunction() {
    this.stakeService.GetAllStakeholdersFromSubmission(this.submissionId).subscribe(result => {
      result.forEach(function (value, index) {
        this.stakeService.GetStakeholderFromSubmission(this.submissionId, value.id).subscribe(result => {
          this.submissionStakeholders.push(result);
          this.stakeService.getStakeholderByID(result.stakeholderId, 'faltarequestID', 'faltaAcquiringUserID').subscribe((result: { documents: any; stakeholderId: string | number; }) => {
            var documents = result.documents;
            this.allStakeholdersComprovativos[result.stakeholderId] = documents;
            console.log("get stake by id resposnse: ", result);
            //context.stakeholdersComprovativos.push(result);

          }, error => {
            console.log("Erro ao obter o Stakeholder pela Outbound API: ", error);
          });
        }, error => {
          console.log("Erro em GetStakeholderFromSubmission: ", error);
        });
      });
    }, error => {
      console.log("Erro na Get All: ", error);
    });
  }

  isStakeholderFromCC(stakeholder) {
    this.selectedStakeholderIsFromCC = false;
    var context = this;
    this.ccStakeholders.forEach(function (value, idx) {
      var stakeholderFromCC = value;
      if (stakeholder.fiscalId === stakeholderFromCC.fiscalId) {
        context.selectedStakeholderIsFromCC = true;
      }
    });
  }

  isStakeholderFromCRC(stakeholder) {
    this.selectedStakeholderIsFromCRC = false;
    var context = this;
    this.crcStakeholders.forEach(function (value, idx) {
      var stakeholderFromCRC = value;
      if (stakeholder.fiscalId === stakeholderFromCRC.fiscalId) {
        context.selectedStakeholderIsFromCRC = true;
      }
    });
  }

  updateForm(info/*, idx*/) {
    console.log(info);
    this.currentStakeholder = info.stakeholder;
    this.currentIdx = info.idx;
    this.isSelected = true;
    this.isStakeholderFromCRC(this.currentStakeholder);
    this.isStakeholderFromCC(this.currentStakeholder);

    this.selectedStakeholderComprovativos = this.allStakeholdersComprovativos[this.currentStakeholder.stakeholderAcquiring.stakeholderId];

    //this.initializeFormWithoutCC();
    if (this.returned !== null) {
      if (this.currentStakeholder.stakeholderAcquiring.identificationDocument != undefined || this.currentStakeholder.stakeholderAcquiring.identificationDocument != null) {
        if (this.currentStakeholder.stakeholderAcquiring.identificationDocument.number == '004') {
          this.logger.debug('Entrou cartão de cidadão');
          this.createFormCC();// mudei a ordem
          this.validateCC(true);
        } else {
          this.initializeFormWithoutCC();
          this.validateCC(false);
        }
        this.initializeFormWithoutCC();
        this.validateCC(false);
      } else {
        this.initializeFormWithoutCC();
        this.validateCC(false);
      }
    } else {
      this.initializeFormWithoutCC();
    }
  }

  initializeFormWithoutCC() {
    this.formNewStakeholder = new FormGroup({
      contractAssociation: new FormControl('false', Validators.required),
      flagRecolhaEletronica: new FormControl('true', Validators.required), //v
      proxy: new FormControl((this.currentStakeholder !== {} && this.currentStakeholder.stakeholderAcquiring !== undefined) ? this.currentStakeholder.stakeholderAcquiring.isProxy + '' : false, Validators.required),
      NIF: new FormControl((this.currentStakeholder !== {} && this.currentStakeholder.stakeholderAcquiring !== undefined) ? this.currentStakeholder.stakeholderAcquiring.fiscalId : '', Validators.required),
      Role: new FormControl(''),
      Country: new FormControl((this.returned !== null && this.currentStakeholder !== {} && this.currentStakeholder.stakeholderAcquiring !== undefined && this.currentStakeholder.stakeholderAcquiring.fiscalAddress !== undefined && this.currentStakeholder.stakeholderAcquiring.fiscalAddress !== null) ? this.currentStakeholder.stakeholderAcquiring.fiscalAddress.country : '', Validators.required),
      ZIPCode: new FormControl((this.returned !== null && this.currentStakeholder !== {} && this.currentStakeholder.stakeholderAcquiring !== undefined && this.currentStakeholder.stakeholderAcquiring.fiscalAddress !== undefined && this.currentStakeholder.stakeholderAcquiring.fiscalAddress !== null) ? this.currentStakeholder.stakeholderAcquiring.fiscalAddress.postalCode : '', Validators.required),
      Locality: new FormControl((this.returned !== null && this.currentStakeholder !== {} && this.currentStakeholder.stakeholderAcquiring !== undefined && this.currentStakeholder.stakeholderAcquiring.fiscalAddress !== undefined && this.currentStakeholder.stakeholderAcquiring.fiscalAddress !== null) ? this.currentStakeholder.stakeholderAcquiring.fiscalAddress.locality : '', Validators.required),
      Address: new FormControl((this.returned !== null && this.currentStakeholder !== {} && this.currentStakeholder.stakeholderAcquiring !== undefined && this.currentStakeholder.stakeholderAcquiring.fiscalAddress !== undefined && this.currentStakeholder.stakeholderAcquiring.fiscalAddress !== null) ? this.currentStakeholder.stakeholderAcquiring.fiscalAddress.address : '', Validators.required)
    });
    this.GetCountryByZipCode();
  }

  ngOnInit(): void {
    this.data.updateData(false, 2, 2);
    this.newStake.fiscalId = this.router.snapshot.params['nif'];
    // this.logger.debug(this.route.getCurrentNavigation().extras.state["isCC"]);
    this.initializeFormWithoutCC();
    //this.createForm();
    //this.logger.debug('value antes ', this.formNewStakeholder.get('flagRecolhaEletronica').value);

    //Tirar o comentario
    //this.showYesCC = this.route.getCurrentNavigation().extras.state["isCC"];
    this.showYesCC = false;

    //this.formNewStakeholder.get('flagRecolhaEletronica').setValue(this.showYesCC);
    if (this.showYesCC) {
      this.flagRecolhaEletronica = true;
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub?.unsubscribe);
  }

  //@Output()  newStakeholderAdded = new EventEmitter<any>();
  stringJson: any;

  createFormCC() {
    this.formNewStakeholder = this.fb.group({
      flagRecolhaEletronica: new FormControl('true', Validators.required), //v
      documentType: new FormControl((this.returned !== null && this.currentStakeholder.stakeholderAcquiring.identificationDocument !== undefined) ? this.currentStakeholder.stakeholderAcquiring.identificationDocument.type : ''),
      identificationDocumentCountry: new FormControl((this.returned !== null && this.currentStakeholder.stakeholderAcquiring.identificationDocument !== undefined) ? this.currentStakeholder.stakeholderAcquiring.identificationDocument.country : ''),
      identificationDocumentValidUntil: new FormControl((this.returned !== null && this.currentStakeholder.stakeholderAcquiring.identificationDocument !== undefined) ? this.datePipe.transform(this.currentStakeholder.stakeholderAcquiring.identificationDocument.expirationDate, 'dd-MM-yyyy') : ''),
      identificationDocumentId: new FormControl((this.returned !== null && this.currentStakeholder.stakeholderAcquiring.identificationDocument !== undefined) ? this.currentStakeholder.stakeholderAcquiring.identificationDocument.number : 'THIS'),
      contractAssociation: new FormControl('false', Validators.required),
      proxy: new FormControl(this.currentStakeholder.stakeholderAcquiring.isProxy !== undefined ? this.currentStakeholder.stakeholderAcquiring.isProxy + '' : false, Validators.required),
    });
  }

  submit() {
    if (this.returned !== 'consult') {
      if (this.formNewStakeholder.valid) {
        if (this.currentStakeholder.stakeholderAcquiring.fiscalAddress === null || this.currentStakeholder.stakeholderAcquiring.fiscalAddress === undefined)
          this.currentStakeholder.stakeholderAcquiring.fiscalAddress = {};
        this.currentStakeholder.stakeholderAcquiring.fiscalAddress.address = this.formNewStakeholder.get("Address").value;
        this.currentStakeholder.stakeholderAcquiring.fiscalAddress.country = this.formNewStakeholder.get("Country").value;
        this.currentStakeholder.stakeholderAcquiring.fiscalAddress.locality = this.formNewStakeholder.get("Locality").value;
        this.currentStakeholder.stakeholderAcquiring.fiscalAddress.postalCode = this.formNewStakeholder.get("ZIPCode").value;
        this.currentStakeholder.stakeholderAcquiring.fiscalAddress.postalArea = this.formNewStakeholder.get("Locality").value;

        this.currentStakeholder.stakeholderAcquiring.isProxy = (this.formNewStakeholder.get("proxy").value === 'true');

        if (this.showYesCC && !this.showNoCC) {
          if (this.currentStakeholder.stakeholderAcquiring.identificationDocument === null || this.currentStakeholder.stakeholderAcquiring.identificationDocument === undefined)
            this.currentStakeholder.stakeholderAcquiring.identificationDocument = {};
          this.currentStakeholder.stakeholderAcquiring.identificationDocument.type = this.formNewStakeholder.get("documentType").value;
          this.currentStakeholder.stakeholderAcquiring.identificationDocument.number = this.formNewStakeholder.get("identificationDocumentId").value;
          this.currentStakeholder.stakeholderAcquiring.identificationDocument.country = this.formNewStakeholder.get("identificationDocumentCountry").value;
          this.currentStakeholder.stakeholderAcquiring.identificationDocument.expirationDate = this.formNewStakeholder.get("documentCountry").value;
        }

        this.stakeService.UpdateStakeholder(this.submissionId, this.currentStakeholder.stakeholderAcquiring.id, this.currentStakeholder.stakeholderAcquiring).subscribe(result => {
          if (this.currentIdx < (this.submissionStakeholders.length - 1)) {
            this.currentIdx = this.currentIdx + 1;
            this.currentStakeholder.stakeholderAcquiring = this.submissionStakeholders[this.currentIdx];
          } else {
            this.data.updateData(true, 2);
            this.route.navigate(['/store-comp']);
          }

        }, error => {
        });
      }
    }
  }

  //submit(formNewStakeholder) {

  //  //fazer isto para todos os campos --------------- TO DO
  //  this.newStake.fullName = formNewStakeholder.fullName;


  //  this.logger.debug(formNewStakeholder);
  //  this.logger.debug(typeof this.newStake);

  //  //Nao esta a ser usado
  //  this.stringJson = JSON.stringify(this.newStake);
  //  this.logger.debug("String json object :", this.stringJson);
  //  this.logger.debug("Type :", typeof this.stringJson);

  //  const httpOptions = {
  //    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  //  }

  //  this.http.post<IStakeholders>(this.baseUrl + 'bestakeholders/PostNewStakeholder/'
  //    + this.newStake.fiscalId, this.newStake).subscribe(result => {
  //      this.logger.debug(result);
  //    }, error => console.error(error));

  //  //Edit EditStakeholderById
  //  this.http.post<IStakeholders>(this.baseUrl + 'bestakeholders/EditStakeholderById/'
  //    + this.newStake.fiscalId + '/edit', this.newStake).subscribe(result => {
  //      this.logger.debug("EditStakeholderById");
  //      this.logger.debug(result);
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
        this.logger.debug(this.readcard);
      } else {
        alert("Insira o cartão cidadão")
      }
    }, error => console.error("error"));
  }

  getAll() {
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
    });
  }

  GetCountryByZipCode() {
    var teste = 'consult'
    var teste1 = true;

    if ((teste === 'consult' ? true : null) || teste1)

      var currentCountry = this.formNewStakeholder.get('Country').value;

    var zipcode = this.formNewStakeholder.value['ZIPCode'];

    if (currentCountry === 'PT') {
      this.lockLocality = true;

      if (zipcode != null && zipcode.length >= 8) {
        var zipCode = zipcode.split('-');

        this.subs.push(this.tableData.GetAddressByZipCode(Number(zipCode[0]), Number(zipCode[1])).subscribe(address => {

          var addressToShow = address[0];

          this.formNewStakeholder.get('Address').setValue(addressToShow.address);
          this.formNewStakeholder.get('Country').setValue(addressToShow.country);
          this.formNewStakeholder.get('Locality').setValue(addressToShow.postalArea);


          this.formNewStakeholder.updateValueAndValidity();
        }));
      }
    } else {
      this.lockLocality = false;
      this.formNewStakeholder.updateValueAndValidity();
    }
  }

  goToStores() {
    this.route.navigate(['/store-comp']);

  }
  canEditLocality() {
    if (this.returned === 'consult')
      return false;
    if (this.lockLocality)
      return false;
    return true;
  }

  canEditRole() {
    if (this.returned === 'consult')
      return false;
    if (this.selectedStakeholderIsFromCRC)
      return false;
    return true;
  }
}

