import { Component, OnInit, Inject, Input, ElementRef, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl, FormGroupDirective } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { IStakeholders, StakeholdersCompleteInformation } from '../IStakeholders.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { IReadCard } from './IReadCard.interface';
import { DataService } from '../../nav-menu-interna/data.service';
import { TableInfoService } from '../../table-info/table-info.service';
import { StakeholderService } from '../stakeholder.service';
import { CountryInformation, StakeholderRole } from '../../table-info/ITable-info.interface';
import { Configuration, configurationToken } from 'src/app/configuration';
import { SubmissionService } from '../../submission/service/submission-service.service';
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

export class NewStakeholderComponent implements OnInit, OnChanges {

  @ViewChild('selectedBlueDiv') selectedBlueDiv: ElementRef<HTMLElement>;

  private baseUrl: string;
  public foo = 0;
  public displayValueSearch = "";
  isSelected = false; 


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
  @Input() parentFormGroup: FormGroup;
  @Input() currentStakeholder: StakeholdersCompleteInformation;

  lockLocality: boolean = false;
  showBtnCC: boolean;
  readcard: IReadCard[] = [];
  showNoCC: boolean = false;
  showYesCC: boolean = false;

  // Variables that are not on YAML
  flagAssociado: boolean = true;
  flagProcurador: boolean = true;
  flagRecolhaEletronica: boolean = null;

  @Input() selectedStakeholderIsFromCRC = false;
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

  //currentStakeholder: StakeholdersCompleteInformation = {};
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

  triggerFalseClick() {
    let el: HTMLElement = this.selectedBlueDiv.nativeElement;
    el.click();
  }


  public subs: Subscription[] = [];

  constructor(private logger: LoggerService, private router: ActivatedRoute, private http: HttpClient,
    @Inject(configurationToken) private configuration: Configuration, private route: Router, private fb: FormBuilder,
    private data: DataService, private tableData: TableInfoService, private stakeService: StakeholderService,
    private submissionService: SubmissionService, private datePipe: DatePipe, private rootFormGroup: FormGroupDirective) {

    this.loadTableInfoData();
    this.baseUrl = configuration.baseUrl;
    this.submissionId = localStorage.getItem('submissionId');
    this.processNumber = localStorage.getItem("processNumber");
    this.crcStakeholders = JSON.parse(localStorage.getItem('crcStakeholders'));
    var context = this;

    this.getProcessStakeholders();
    
    console.log("submissionId: ", this.submissionId);

  }

  ngOnChanges(changes: SimpleChanges): void {
    var identificationDocument = this.currentStakeholder.stakeholderAcquiring.identificationDocument;
    if (changes["currentStakeholder"]) {
      this.isStakeholderFromCC(this.currentStakeholder);
      this.isStakeholderFromCRC(this.currentStakeholder);
      if (identificationDocument.type === '1001') {
        this.createFormCC();
      } else {
        this.initializeFormWithoutCC();
      }
    }
  }

  isStakeholderFromCRC(stakeholder) {
    this.selectedStakeholderIsFromCRC = false;
    var context = this;
    this.crcStakeholders?.forEach(function (value, idx) {
      var stakeholderFromCRC = value;
      if (stakeholder.stakeholderAcquiring.fiscalId === stakeholderFromCRC.fiscalId) {
        context.selectedStakeholderIsFromCRC = true;
      }
    });
  }

  getProcessStakeholders() {
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
  }

  isStakeholderFromCC(stakeholder) {
    this.selectedStakeholderIsFromCC = false;
    var context = this;
    this.ccStakeholders?.forEach(function (value, idx) {
      var stakeholderFromCC = value;
      if (stakeholder.fiscalId === stakeholderFromCC.fiscalId) {
        context.selectedStakeholderIsFromCC = true;
      }
    });
  }

  initializeFormWithoutCC() {
    this.formNewStakeholder = new FormGroup({
      contractAssociation: new FormControl('false', Validators.required),
      flagRecolhaEletronica: new FormControl(false), //v
      proxy: new FormControl((this.currentStakeholder?.stakeholderAcquiring != undefined) ? this.currentStakeholder?.stakeholderAcquiring.isProxy + '' : false, Validators.required),
      NIF: new FormControl((this.currentStakeholder?.stakeholderAcquiring != undefined) ? this.currentStakeholder?.stakeholderAcquiring.fiscalId : '', Validators.required),
      Role: new FormControl(''),
      Country: new FormControl((this.currentStakeholder?.stakeholderAcquiring != undefined && this.currentStakeholder?.stakeholderAcquiring.fiscalAddress != undefined) ? this.currentStakeholder.stakeholderAcquiring.fiscalAddress.country : '', Validators.required), // tirei do if (this.returned != null)
      ZIPCode: new FormControl((this.currentStakeholder?.stakeholderAcquiring != undefined && this.currentStakeholder?.stakeholderAcquiring.fiscalAddress != undefined) ? this.currentStakeholder.stakeholderAcquiring.fiscalAddress.postalCode : '', Validators.required), //
      Locality: new FormControl((this.currentStakeholder?.stakeholderAcquiring != undefined && this.currentStakeholder?.stakeholderAcquiring.fiscalAddress != undefined) ? this.currentStakeholder.stakeholderAcquiring.fiscalAddress.locality : '', Validators.required), //
      Address: new FormControl((this.currentStakeholder?.stakeholderAcquiring != undefined && this.currentStakeholder?.stakeholderAcquiring.fiscalAddress != undefined) ? this.currentStakeholder.stakeholderAcquiring.fiscalAddress.address : '', Validators.required) //
    });
    this.rootFormGroup.form.setControl('stake', this.formNewStakeholder);
    this.GetCountryByZipCode();
    this.flagRecolhaEletronica = false;
    this.showNoCC = true;
    this.showYesCC = false;
  }

  ngOnInit(): void {
    this.data.updateData(false, 2, 2);
    this.newStake.fiscalId = this.router.snapshot.params['nif'];

    

    this.initializeFormWithoutCC();

    if (this.rootFormGroup.form != null) {
      this.rootFormGroup.form.setControl('stake', this.formNewStakeholder);
      if (this.returned == 'consult') {
        this.formNewStakeholder.disable();
      }
    }


  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub?.unsubscribe);
  }

  stringJson: any;

  createFormCC() {
    this.formNewStakeholder = this.fb.group({
      flagRecolhaEletronica: new FormControl(true), //v
      documentType: new FormControl((this.currentStakeholder?.stakeholderAcquiring?.identificationDocument != undefined) ? this.currentStakeholder?.stakeholderAcquiring?.identificationDocument?.type : ''), //tirei o this.returned != null
      identificationDocumentCountry: new FormControl((this.currentStakeholder?.stakeholderAcquiring?.identificationDocument != undefined) ? this.currentStakeholder?.stakeholderAcquiring?.identificationDocument?.country : ''), //
      identificationDocumentValidUntil: new FormControl((this.currentStakeholder?.stakeholderAcquiring?.identificationDocument != undefined) ? this.datePipe.transform(this.currentStakeholder?.stakeholderAcquiring?.identificationDocument?.expirationDate, 'dd-MM-yyyy') : ''), //
      identificationDocumentId: new FormControl((this.currentStakeholder?.stakeholderAcquiring?.identificationDocument != undefined) ? this.currentStakeholder?.stakeholderAcquiring?.identificationDocument?.number : 'THIS'), //
      contractAssociation: new FormControl('false', Validators.required),
      proxy: new FormControl(this.currentStakeholder?.stakeholderAcquiring?.isProxy != undefined ? this.currentStakeholder?.stakeholderAcquiring?.isProxy + '' : false, Validators.required),
      NIF: new FormControl((this.currentStakeholder?.stakeholderAcquiring != undefined) ? this.currentStakeholder?.stakeholderAcquiring.fiscalId : '', Validators.required),
      Role: new FormControl(''),
      Country: new FormControl((this.currentStakeholder?.stakeholderAcquiring != undefined && this.currentStakeholder?.stakeholderAcquiring.fiscalAddress != undefined) ? this.currentStakeholder.stakeholderAcquiring.fiscalAddress.country : '', Validators.required), // tirei do if (this.returned != null)
      ZIPCode: new FormControl((this.currentStakeholder?.stakeholderAcquiring != undefined && this.currentStakeholder?.stakeholderAcquiring.fiscalAddress != undefined) ? this.currentStakeholder.stakeholderAcquiring.fiscalAddress.postalCode : '', Validators.required), //
      Locality: new FormControl((this.currentStakeholder?.stakeholderAcquiring != undefined && this.currentStakeholder?.stakeholderAcquiring.fiscalAddress != undefined) ? this.currentStakeholder.stakeholderAcquiring.fiscalAddress.locality : '', Validators.required), //
      Address: new FormControl((this.currentStakeholder?.stakeholderAcquiring != undefined && this.currentStakeholder?.stakeholderAcquiring.fiscalAddress != undefined) ? this.currentStakeholder.stakeholderAcquiring.fiscalAddress.address : '', Validators.required) //
    });
    this.rootFormGroup.form.setControl('stake', this.formNewStakeholder);
    this.showYesCC = true;
    this.showNoCC = false;
    this.flagRecolhaEletronica = true;

    this.changeValueCC();
  }

  changeValueCC(){
    if (this.currentStakeholder?.stakeholderAcquiring?.identificationDocument != undefined && this.currentStakeholder?.stakeholderAcquiring?.identificationDocument?.type === '1001') {
      this.currentStakeholder.stakeholderAcquiring.identificationDocument.type = 'Cartão do Cidadão'
    }
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
      this.createFormCC();
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

  chooseStakeholder(stake: any) {
    this.stakeService.getStakeholderByID(stake.stakeholderId, "8ed4a062-b943-51ad-4ea9-392bb0a23bac", "22195900002451", "fQkRbjO+7kGqtbjwnDMAag==").subscribe(result => {
      this.currentStakeholder = result;

    }, error => {
      this.logger.error(error, "", "Erro ao obter informação de um stakeholder");
    });
  }

  numericOnly(event): boolean {
    var ASCIICode = (event.which) ? event.which : event.keyCode;

    if (ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57) && ASCIICode!=45)
      return false;
    return true;
  }

  GetCountryByZipCode() {

    var currentCountry = this.formNewStakeholder.get('Country').value;

    var zipcode = this.formNewStakeholder.value['ZIPCode'];

    this.formNewStakeholder.get('Address').setValue('');
    this.formNewStakeholder.get('Locality').setValue('');
    this.formNewStakeholder.get('ZIPCode').setValue('');

    if (currentCountry === 'PT') {
      this.lockLocality = true;

      if (zipcode != null && zipcode.length >= 8) {
        var zipCode = zipcode.split('-');

        this.subs.push(this.tableData.GetAddressByZipCode(zipCode[0], zipCode[1]).subscribe(address => {

          var addressToShow = address[0];

          this.formNewStakeholder.get('Address').setValue(addressToShow.address);
          this.formNewStakeholder.get('Country').setValue(addressToShow.country);
          this.formNewStakeholder.get('Locality').setValue(addressToShow.postalArea);
        }));
      }
    } else {
      this.lockLocality = false;
      this.formNewStakeholder.get('Address').setValidators(null);
      this.formNewStakeholder.get('ZIPCode').setValidators(null);
      this.formNewStakeholder.get('Locality').setValidators(null);
    }
    console.log('Valor do form no new-stakeholder ', this.formNewStakeholder);
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

  //canEditRole() {
  //  if (this.returned == 'consult')
  //    return false;
  //  if (this.selectedStakeholderIsFromCRC)
  //    return false;
  //  return true;
  //}
}

