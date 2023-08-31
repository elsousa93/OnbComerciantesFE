import { Component, OnInit, Input, ElementRef, ViewChild, OnChanges, SimpleChanges, TemplateRef, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl, FormGroupDirective } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { IStakeholders, StakeholdersCompleteInformation } from '../IStakeholders.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { IReadCard } from './IReadCard.interface';
import { DataService } from '../../nav-menu-interna/data.service';
import { TableInfoService } from '../../table-info/table-info.service';
import { StakeholderService } from '../stakeholder.service';
import { CountryInformation, DocumentSearchType } from '../../table-info/ITable-info.interface';
import { SubmissionService } from '../../submission/service/submission-service.service';
import { DatePipe } from '@angular/common';
import { docTypeENI } from '../../client/docType';
import { LoggerService } from 'src/app/logger.service';
import { distinctUntilChanged, Subscription } from 'rxjs';
import { ProcessNumberService } from '../../nav-menu-presencial/process-number.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { dataCC } from '../../citizencard/dataCC.interface';
import { FileAndDetailsCC } from '../../readcard/fileAndDetailsCC.interface';
import { readCC } from '../../citizencard/CitizenCardController.js';
import { readCCAddress } from '../../citizencard/CitizenCardController.js';
import { ClearCCFields } from '../../citizencard/CitizenCardController.js';
import { ReadcardService } from '../../readcard/readcard.service';
import { PostDocument } from '../../submission/document/ISubmission-document';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

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

  modalRef: BsModalRef;
  showSameNIFError: boolean = false;
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  //---- Cartão de Cidadao - vars ------
  public dataCCcontents: dataCC = {
    cardNumberCC: null,
    nameCC: null,
    sexCC: null,
    heightCC: null,
    nationalityCC: null,
    birthdateCC: null,
    expiricyDateCC: null,
    localOfEmissionCC: null,
    fathersNameCC: null,
    mothersNameCC: null,
    nifCC: null,
    socialSecurityCC: null,
    healthNumberCC: null,
    signatureCC: null,
    addressCC: null,
    postalCodeCC: null,
    localityCC: null,
    countryCC: null,
    documentType: null,
    gender: null
  };
  public prettyPDF: FileAndDetailsCC = null;

  //Variaveis para imprimir no html
  public nameCC = null;
  public nationalityCC = null;
  public birthDateCC = null;
  public cardNumberCC = null;
  public nifCC = null;
  public addressCC = null;
  public postalCodeCC = null;
  public countryCC = null;
  public localityCC = null;

  public okCC = false;
  public dadosCC: Array<string> = []; //apagar
  public addressReading = null;
  //---- Cartão de Cidadao - funcoes -----
  callreadCC() {
    ClearCCFields();
    readCC(this.SetNewCCData.bind(this));
    this.setOkCC();
  }
  callreadCCAddress() {
    ClearCCFields();
    readCCAddress(this.SetNewCCData.bind(this));
    this.setOkCC();
  }
  closeModal() {
    this.newModal.hide();
  }
  setOkCC() {
    this.okCC = true;
    //this.foundStakeholders = true;
    //this.selected = true;
  }
  setAddressFalse() {
    this.addressReading = false;
  }

  /**
   * Information from the Citizen Card will be associated to the client structure
   * em "create-stakeholder"
   * 
   * */
  SetNewCCData(name, cardNumber, nif, birthDate, imgSrc, cardIsExpired,
    gender, height, nationality, expiryDate, nameFather, nameMother,
    nss, sns, address, postalCode, notes, emissonDate, emissonLocal, country, countryIssuer, documentType) {

    if (this.currentStakeholder?.stakeholderAcquiring?.fiscalId == nif) {
      this.dataCCcontents.nameCC = name; 
      this.dataCCcontents.nationalityCC = nationality;
      this.dataCCcontents.birthdateCC = birthDate;
      this.dataCCcontents.cardNumberCC = cardNumber.replace(/\s/g, ""); // Nº do CC
      this.dataCCcontents.expiricyDateCC = expiryDate;
      this.dataCCcontents.documentType = documentType;
      this.dataCCcontents.nifCC = nif;
      this.dataCCcontents.localityCC = postalCode.split(" ").pop();
      //this.emitSameNIF(of(this.dataCCcontents.nifCC));
      this.dataCCcontents.countryCC = countryIssuer;
      this.dataCCcontents.gender = gender;
      this.countryCC = countryIssuer; //HTML

      if (notes != null || notes != "") {
        var assinatura = "Sabe assinar";
        if (notes.toLowerCase().includes("não sabe assinar") || notes.toLowerCase().includes("não pode assinar")) {
          assinatura = "Não sabe assinar";
        }
      }

      if (this.addressReading == false) {

        //Without address
        this.dataCCcontents.addressCC = " ";
        this.dataCCcontents.postalCodeCC = " ";
        this.dataCCcontents.countryCC = "PT";

        var ccArrayData: Array<string> = [name, gender, height, nationality, birthDate, cardNumber, expiryDate,
          emissonLocal, nameFather, nameMother, nif, nss, sns, assinatura, this.dataCCcontents.addressCC, this.dataCCcontents.postalCodeCC, this.dataCCcontents.countryCC];

        //Send to PDF without address -- type base64
        this.readCardService.formatPDF(ccArrayData).then(resolve => {
          this.prettyPDF = resolve;
          this.emitCCInfo({ dataCCContents: this.dataCCcontents, prettyPDF: this.prettyPDF });
        });

      } else {

        //WITH ADDRESS
        this.dataCCcontents.addressCC = address;
        this.dataCCcontents.postalCodeCC = postalCode;

        var ccArrayData: Array<string> = [name, gender, height, nationality, birthDate, cardNumber, expiryDate,
          emissonLocal, nameFather, nameMother, nif, nss, sns, assinatura, address, postalCode, country];

        //Send to PDF
        this.readCardService.formatPDF(ccArrayData).then(resolve => {
          this.prettyPDF = resolve;
          this.emitCCInfo({ dataCCContents: this.dataCCcontents, prettyPDF: this.prettyPDF });
        });
      }
      this.updateForm();
    } else {
      this.okCC = false;
      this.addressReading = null;
      this.snackBar.open(this.translate.instant('stakeholder.differentNIFCC'), '', {
        duration: 10000,
        panelClass: ['snack-bar']
      });
    }
  }

  /**
  * Recolha Automatica dos Dados do Cartão de Cidadão?
  * @param readable
  */
  changeDataReadable(readable: boolean) {
    if (readable) {
      this.stakeholderNumber = '';
      //this.clearNewForm();
    }
    //this.isNoDataReadable = readable;
    if (readable === false) {
      this.okCC = readable; //W
    }

  }

  @ViewChild('newModal') newModal;
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
  currentIdx: number = 0;
  submissionStakeholders: IStakeholders[] = [];
  //stakeholdersRoles: StakeholderRole[] = [];
  returned: string;
  ListaDocTypeENI = docTypeENI;
  documents: DocumentSearchType[];
  processId: string;
  sameZIPCode: boolean = false;
  @Output() CCInfo = new EventEmitter<{ dataCCcontents: dataCC, prettyPDF: FileAndDetailsCC }>();
  incorrectNIF: boolean = false;
  incorrectNIFSize: boolean = false;
  incorrectNIPC: boolean = false;
  incorrectNIPCSize: boolean = false;

  emitCCInfo(CCInfo) {
    this.CCInfo.emit(CCInfo);
  }

  loadCountries() {
    this.subs.push(this.tableData.GetAllCountries().subscribe(result => {
      this.logger.info("Get all countries result: "+ JSON.stringify(result));
      this.countries = result;
      this.countries = this.countries.sort((a, b) => a.description> b.description? 1 : -1); //ordenar resposta
    }, error => {
      this.logger.error(error);
    }))
  }

  loadDocumentDescriptions() {
    this.subs.push(this.tableData.GetDocumentsDescription().subscribe(result => {
      this.logger.info("Get documents description result: " + JSON.stringify(result));
      this.documents = result;
      var desc = this.documents?.find(document => document.code == this.currentStakeholder?.stakeholderAcquiring?.identificationDocument?.type)?.description;
      this.formNewStakeholder?.get("documentType")?.setValue(desc);
    }));
  }

  getDocumentDescription(documentType: string) {
    var desc = "";
    if (documentType != null) {
      desc = this.documents?.find(document => document.code == documentType)?.description;
    }
    return desc;
  }

  loadTableInfoData() {
    this.loadCountries();
    this.loadDocumentDescriptions();
  }

  public subs: Subscription[] = [];

  constructor(private logger: LoggerService, private router: ActivatedRoute, private http: HttpClient, private route: Router, private fb: FormBuilder,
    private data: DataService, private tableData: TableInfoService, private stakeService: StakeholderService,
    private submissionService: SubmissionService, private datePipe: DatePipe, private rootFormGroup: FormGroupDirective, private processNrService: ProcessNumberService, public modalService: BsModalService, private readCardService: ReadcardService, private snackBar: MatSnackBar, private translate: TranslateService) {

    this.loadTableInfoData();
    this.submissionId = localStorage.getItem('submissionId');
    this.processNumber = localStorage.getItem("processNumber");
    this.crcStakeholders = JSON.parse(localStorage.getItem('crcStakeholders'));
    this.processNrService.processId.subscribe(id => this.processId = id);

  }

  ngOnChanges(changes: SimpleChanges): void {
    var identificationDocument = this.currentStakeholder.stakeholderAcquiring?.identificationDocument;
    if (changes["currentStakeholder"]) {
      this.isStakeholderFromCC(this.currentStakeholder);
      this.isStakeholderFromCRC(this.currentStakeholder);
      if (identificationDocument != undefined && (identificationDocument?.type === '0018' || identificationDocument?.type === 'Cartão do Cidadão' || identificationDocument?.type === '0001')) {
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
    var zipcode = this.currentStakeholder?.stakeholderAcquiring?.fiscalAddress?.postalCode?.replace(/\s/g, "");
    this.formNewStakeholder = new FormGroup({
      contractAssociation: new FormControl(this.currentStakeholder?.stakeholderAcquiring?.signType === 'CitizenCard' || this.currentStakeholder?.stakeholderAcquiring?.signType === 'DigitalCitizenCard' ? 'true' : 'false', Validators.required),
      flagRecolhaEletronica: new FormControl(false), //tava a false
      proxy: new FormControl((this.currentStakeholder?.stakeholderAcquiring != null && this.currentStakeholder?.stakeholderAcquiring?.isProxy != null) ? this.currentStakeholder?.stakeholderAcquiring?.isProxy+'' : 'false', Validators.required),
      NIF: new FormControl((this.currentStakeholder?.stakeholderAcquiring != null) ? this.currentStakeholder?.stakeholderAcquiring?.fiscalId : '', Validators.required),
      //Role: new FormControl(''),
      Country: new FormControl((this.currentStakeholder?.stakeholderAcquiring != null && this.currentStakeholder?.stakeholderAcquiring?.fiscalAddress != null) ? this.currentStakeholder?.stakeholderAcquiring?.fiscalAddress?.country : 'PT', Validators.required), // tirei do if (this.returned != null)
      ZIPCode: new FormControl((this.currentStakeholder?.stakeholderAcquiring != null && this.currentStakeholder?.stakeholderAcquiring?.fiscalAddress != null) ? zipcode : '', [Validators.required, Validators.maxLength(8), Validators.minLength(8)]), //
      Locality: new FormControl((this.currentStakeholder?.stakeholderAcquiring != null && this.currentStakeholder?.stakeholderAcquiring?.fiscalAddress != null) ? this.currentStakeholder?.stakeholderAcquiring?.fiscalAddress?.postalArea : '', Validators.required), //
      Address: new FormControl((this.currentStakeholder?.stakeholderAcquiring != null && this.currentStakeholder?.stakeholderAcquiring?.fiscalAddress != null) ? this.currentStakeholder?.stakeholderAcquiring?.fiscalAddress?.address : '', Validators.required) //
    });
    this.rootFormGroup.form.setControl('stake', this.formNewStakeholder);
    //this.GetCountryByZipCode();
    this.flagRecolhaEletronica = false;
    this.showNoCC = true;
    this.showYesCC = false;
    this.isCC = false;
    this.okCC = false;
    this.validate(this.currentStakeholder?.stakeholderAcquiring?.fiscalId);
    this.formNewStakeholder.get("Country").valueChanges.pipe(distinctUntilChanged()).subscribe(val => {
      if (val == "PT") {
        this.formNewStakeholder.get('ZIPCode').setValidators([Validators.required, Validators.minLength(8), Validators.maxLength(8)]);
        this.formNewStakeholder.get('Address').setValidators(Validators.required);
        this.formNewStakeholder.get('Locality').setValidators(Validators.required);
      } else {
        this.formNewStakeholder.get('Address').setValidators(null);
        this.formNewStakeholder.get('ZIPCode').setValidators(null);
        this.formNewStakeholder.get('Locality').setValidators(null);
      }
      this.formNewStakeholder.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    //this.data.updateData(false, 2, 2);
    this.data.changeCurrentSubPage(2);
    //this.initializeFormWithoutCC();
    this.returned = localStorage.getItem("returned");
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
    var zipcode = this.currentStakeholder?.stakeholderAcquiring?.fiscalAddress?.postalCode?.replace(/\s/g, "");
    this.formNewStakeholder = this.fb.group({
      flagRecolhaEletronica: new FormControl(this.isCC ? true: false), //estava a true
      documentType: new FormControl(''),
      identificationDocumentCountry: new FormControl((this.currentStakeholder?.stakeholderAcquiring?.identificationDocument != undefined) ? this.currentStakeholder?.stakeholderAcquiring?.identificationDocument?.country : ''), //
      identificationDocumentValidUntil: new FormControl((this.currentStakeholder?.stakeholderAcquiring?.identificationDocument != undefined) ? this.datePipe.transform(this.currentStakeholder?.stakeholderAcquiring?.identificationDocument?.expirationDate, 'dd-MM-yyyy') : ''), //
      identificationDocumentId: new FormControl((this.currentStakeholder?.stakeholderAcquiring?.identificationDocument != undefined) ? this.currentStakeholder?.stakeholderAcquiring?.identificationDocument?.number : ''), //
      contractAssociation: new FormControl(this.currentStakeholder?.stakeholderAcquiring?.signType === 'CitizenCard' || this.currentStakeholder?.stakeholderAcquiring?.signType === 'DigitalCitizenCard' ? 'true' : 'false', Validators.required),
      proxy: new FormControl(this.currentStakeholder?.stakeholderAcquiring?.isProxy != null ? this.currentStakeholder?.stakeholderAcquiring?.isProxy + '' : 'false', Validators.required),
      NIF: new FormControl((this.currentStakeholder?.stakeholderAcquiring != undefined) ? this.currentStakeholder?.stakeholderAcquiring.fiscalId : '', Validators.required),
      Country: new FormControl((this.currentStakeholder?.stakeholderAcquiring != null && this.currentStakeholder?.stakeholderAcquiring?.fiscalAddress != null && this.currentStakeholder?.stakeholderAcquiring?.fiscalAddress?.country != null && this.currentStakeholder?.stakeholderAcquiring?.fiscalAddress?.country != "") ? this.currentStakeholder?.stakeholderAcquiring?.fiscalAddress?.country : 'PT', Validators.required), // tirei do if (this.returned != null)
      ZIPCode: new FormControl((this.currentStakeholder?.stakeholderAcquiring != null && this.currentStakeholder?.stakeholderAcquiring.fiscalAddress != null) ? zipcode : ''), //
      Locality: new FormControl((this.currentStakeholder?.stakeholderAcquiring != null && this.currentStakeholder?.stakeholderAcquiring.fiscalAddress != null) ? this.currentStakeholder.stakeholderAcquiring.fiscalAddress.postalArea : ''), //
      Address: new FormControl((this.currentStakeholder?.stakeholderAcquiring != null && this.currentStakeholder?.stakeholderAcquiring.fiscalAddress != null) ? this.currentStakeholder.stakeholderAcquiring.fiscalAddress.address : '') //
    });
    this.rootFormGroup.form.setControl('stake', this.formNewStakeholder);
    this.showYesCC = true;
    this.showNoCC = false;
    this.okCC = false;
    if (!this.isCC) {
      this.isCC = false;
      this.formNewStakeholder.get('flagRecolhaEletronica').setValue(false);
    } else {
      this.formNewStakeholder.get('flagRecolhaEletronica').setValue(true);
    }
    this.changeValueCC();
    this.validate(this.currentStakeholder?.stakeholderAcquiring?.fiscalId);
    //this.GetCountryByZipCode();
    //this.formNewStakeholder.get("Country").valueChanges.pipe(distinctUntilChanged()).subscribe(val => {
    //  if (val == "PT") {
    //    this.formNewStakeholder.get('ZIPCode').setValidators([Validators.required, Validators.minLength(8), Validators.maxLength(8)]);
    //    this.formNewStakeholder.get('Address').setValidators(Validators.required);
    //    this.formNewStakeholder.get('Locality').setValidators(Validators.required);
    //  } else {
    //    this.formNewStakeholder.get('Address').setValidators(null);
    //    this.formNewStakeholder.get('ZIPCode').setValidators(null);
    //    this.formNewStakeholder.get('Locality').setValidators(null);
    //  }
    //  this.formNewStakeholder.updateValueAndValidity();
    //});
  }

  changeValueCC(){
    if (this.currentStakeholder?.stakeholderAcquiring?.identificationDocument != undefined && (this.currentStakeholder?.stakeholderAcquiring?.identificationDocument?.type === '0018' || this.currentStakeholder?.stakeholderAcquiring?.identificationDocument?.type === '0001')) {
      //this.currentStakeholder.stakeholderAcquiring.identificationDocument.type = '0018';
      var desc = this.documents?.find(document => document.code == this.currentStakeholder.stakeholderAcquiring.identificationDocument.type)?.description;
      this.formNewStakeholder.get("documentType").setValue(desc);
    }
  }

  submit() {
    if (this.returned !== 'consult') {
      if (this.formNewStakeholder.valid) {
        if (this.currentStakeholder?.stakeholderAcquiring?.signType != null && this.currentStakeholder?.stakeholderAcquiring?.signType !== '') {
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
          this.logger.info("Stakeholder to update: " + JSON.stringify(this.currentStakeholder.stakeholderAcquiring));
          this.stakeService.UpdateStakeholder(this.submissionId, this.currentStakeholder.stakeholderAcquiring.id, this.currentStakeholder.stakeholderAcquiring).subscribe(result => {
            this.logger.info("Updated stakeholder result: " + JSON.stringify(result));
            if (this.currentIdx < (this.submissionStakeholders.length - 1)) {
              this.currentIdx = this.currentIdx + 1;
              this.currentStakeholder.stakeholderAcquiring = this.submissionStakeholders[this.currentIdx];
            } else {
              this.data.updateData(true, 2);
              this.logger.info("Redirecting to Store Comp page");
              this.route.navigate(['/store-comp']);
            }
          }, error => {
          });
        } else {
          if (this.currentStakeholder.stakeholderAcquiring["headquartersAddress"] === null || this.currentStakeholder.stakeholderAcquiring["headquartersAddress"] === undefined)
            this.currentStakeholder.stakeholderAcquiring["headquartersAddress"] = {};
          this.currentStakeholder.stakeholderAcquiring["headquartersAddress"].address = this.formNewStakeholder.get("Address").value;
          this.currentStakeholder.stakeholderAcquiring["headquartersAddress"].country = this.formNewStakeholder.get("Country").value;
          this.currentStakeholder.stakeholderAcquiring["headquartersAddress"].postalCode = this.formNewStakeholder.get("ZIPCode").value;
          this.currentStakeholder.stakeholderAcquiring["headquartersAddress"].postalArea = this.formNewStakeholder.get("Locality").value;

          this.logger.info("Stakeholder to update: " + JSON.stringify(this.currentStakeholder.stakeholderAcquiring));
          this.stakeService.UpdateCorporateEntity(this.submissionId, this.currentStakeholder.stakeholderAcquiring.id, this.currentStakeholder.stakeholderAcquiring).then(result => {
            this.logger.info("Updated stakeholder result: " + JSON.stringify(result.result));
            if (this.currentIdx < (this.submissionStakeholders.length - 1)) {
              this.currentIdx = this.currentIdx + 1;
              this.currentStakeholder.stakeholderAcquiring = this.submissionStakeholders[this.currentIdx];
            } else {
              this.data.updateData(true, 2);
              this.logger.info("Redirecting to Store Comp page");
              this.route.navigate(['/store-comp']);
            }
          }, error => {
          });
        }
      }
    }
  }

  validateCC(validate: boolean) {
    this.formNewStakeholder?.get("Country")?.setValidators(Validators.required);
    this.formNewStakeholder?.get("ZIPCode")?.setValidators([Validators.required, Validators.maxLength(8), Validators.minLength(8)]);
    this.formNewStakeholder?.get("Locality")?.setValidators(Validators.required);
    this.formNewStakeholder?.get("Address")?.setValidators(Validators.required);
    this.formNewStakeholder?.updateValueAndValidity();
    if (validate == true) { //sim
      this.showBtnCC = true; // false
      this.showYesCC = true; // false
      this.showNoCC = false; // true
      this.isCC = true; //mostrar o módulo CC
      this.createFormCC();
    } else { // não
        this.showBtnCC = true;
        this.showYesCC = true;
        this.showNoCC = false;
        this.isCC = false; //retirar o módulo CC
        this.okCC = false;
      if (this.currentStakeholder?.stakeholderAcquiring?.identificationDocument?.type == '0018' || this.currentStakeholder?.stakeholderAcquiring?.identificationDocument?.type == '0001') {
        this.createFormCC();
      } else {
        this.initializeFormWithoutCC();
      }
    }
  }

  updateForm() {
    var dateCC = this.dataCCcontents.expiricyDateCC;
    var separated = dateCC?.split(' ');
    if (separated) {
      var formatedDate = separated[2] + "-" + separated[1] + "-" + separated[0] as any;
    } else {
      var formatedDate = null;
    }

    var fullName = this.dataCCcontents.nameCC ?? this.formNewStakeholder.get("name")?.value;
    var nameArray = fullName.split(" ").filter(element => element);
    var shortName = nameArray.length > 2 ? nameArray[0] + " " + nameArray[nameArray.length - 1] : fullName;
    shortName.slice(0, 40);
    this.currentStakeholder.stakeholderAcquiring.fiscalId = this.dataCCcontents.nifCC;
    this.currentStakeholder.stakeholderAcquiring.fullName = fullName;
    this.currentStakeholder.stakeholderAcquiring.shortName = shortName;
    this.currentStakeholder.stakeholderAcquiring.contactName = shortName;
    this.currentStakeholder.stakeholderAcquiring.identificationDocument = {
      type: '0018',
      number: this.dataCCcontents?.cardNumberCC?.replace(/\s/g, ""),
      country: this.dataCCcontents.countryCC ?? 'PT',
      expirationDate: formatedDate != null ? new Date(formatedDate).toISOString() : null,
      checkDigit: null
    };
    this.currentStakeholder.stakeholderAcquiring.fiscalAddress = {
      address: this.dataCCcontents.addressCC,
      postalCode: this.dataCCcontents.postalCodeCC.split(" ")[0],
      postalArea: this.dataCCcontents.localityCC,
      locality: this.dataCCcontents.localityCC,
      country: this.dataCCcontents.countryCC ?? "PT"
    };
    this.currentStakeholder.stakeholderAcquiring.signType = "DigitalCitizenCard";

    this.formNewStakeholder.get("identificationDocumentCountry").setValue(this.currentStakeholder?.stakeholderAcquiring?.identificationDocument?.country);
    this.formNewStakeholder.get("identificationDocumentValidUntil").setValue(this.datePipe.transform(this.currentStakeholder?.stakeholderAcquiring?.identificationDocument?.expirationDate, 'dd-MM-yyyy'));
    this.formNewStakeholder.get("identificationDocumentId").setValue(this.currentStakeholder?.stakeholderAcquiring?.identificationDocument?.number);
    this.formNewStakeholder.get("contractAssociation").setValue("true");
    this.formNewStakeholder.get("NIF").setValue(this.currentStakeholder.stakeholderAcquiring.fiscalId);
    this.formNewStakeholder.get("Country").setValue(this.currentStakeholder.stakeholderAcquiring.fiscalAddress.country);
    this.formNewStakeholder.get("ZIPCode").setValue(this.currentStakeholder.stakeholderAcquiring.fiscalAddress.postalCode);
    this.formNewStakeholder.get("Locality").setValue(this.currentStakeholder.stakeholderAcquiring.fiscalAddress.postalArea);
    this.formNewStakeholder.get("Address").setValue(this.currentStakeholder.stakeholderAcquiring.fiscalAddress.address);
    var desc = this.documents?.find(document => document.code == this.currentStakeholder?.stakeholderAcquiring?.identificationDocument?.type)?.description;
    this.formNewStakeholder?.get("documentType")?.setValue(desc);
    this.formNewStakeholder?.get("Country")?.setValidators(null);
    this.formNewStakeholder?.get("ZIPCode")?.setValidators(null);
    this.formNewStakeholder?.get("Locality")?.setValidators(null);
    this.formNewStakeholder?.get("Address")?.setValidators(null);
    this.formNewStakeholder?.updateValueAndValidity();
  }

  selectCC() {
    this.http.get(this.baseUrl + `CitizenCard`).subscribe(result => {
      if (result != null) {
        this.readcard = Object.keys(result).map(function (key) { return result[key]; });
        this.showNoCC = false;
        this.showYesCC = true;
      } else {
        alert("Insira o cartão cidadão")
      }
    }, error => this.logger.error(error, "", "Error reading citizen card"));
  }

  changeProxy(value: boolean) {
    this.currentStakeholder.stakeholderAcquiring.isProxy = value;
  }

  numericOnly(event): boolean {
    var ASCIICode = (event.which) ? event.which : event.keyCode;

    if (this.formNewStakeholder?.value['ZIPCode']?.length == 8)
      this.sameZIPCode = true;
    else
      this.sameZIPCode = false;

    let patt = /^([0-9-])$/;
    let result = patt.test(event.key);
    return result;

    /*if (ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57) && (ASCIICode < 96 || ASCIICode > 105) && ASCIICode != 45)
      return false;
    return true;*/
  }

  
  clean() {
    if (this.formNewStakeholder.get('Country').value !== 'PT') {
      this.lockLocality = false;
      this.formNewStakeholder.get('Address').setValidators(null);
      this.formNewStakeholder.get('ZIPCode').setValidators(null);
      this.formNewStakeholder.get('Locality').setValidators(null);
      this.formNewStakeholder.get('Address').setValue('');
      this.formNewStakeholder.get('ZIPCode').setValue('');
      this.formNewStakeholder.get('Locality').setValue('');
    }
  }

  GetCountryByZipCode(event?: any) {
    if (event != undefined) {
      const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab'];

      if (allowedKeys.indexOf(event?.key) === -1) {
        var zipcode = this.formNewStakeholder.value['ZIPCode'];
        if (zipcode.length <= 8) {
          zipcode = zipcode.replace(/\D/g, '');
          zipcode = zipcode.replace(/(\d{4})/g, '$1-');
        }
        if (zipcode.length > 8)
          zipcode = zipcode.substring(0, 8);

        this.formNewStakeholder.get('ZIPCode').setValue(zipcode);
      }

      //let patt = /^([0-9-])$/;
      //let result = patt.test(event.key);
      let patt = /(\b\d{4})-(\b\d{3})/i;
      let result = patt.test(zipcode);
      if (!result && allowedKeys.indexOf(event.key) === -1)
        return false;

    }

    var currentCountry = this.formNewStakeholder.get('Country').value;

    if (this.sameZIPCode && this.formNewStakeholder?.value['ZIPCode']?.length == 8 && currentCountry == "PT")
      return false;

    var zipcode = this.formNewStakeholder.value['ZIPCode'];
    this.formNewStakeholder.get('Address').setValue('');
    this.formNewStakeholder.get('Locality').setValue('');
    if (currentCountry === 'PT') {
      this.lockLocality = true;
      if (zipcode != null && zipcode.length >= 8) {

        var zipCode = zipcode.split('-');
        this.subs.push(this.tableData.GetAddressByZipCode(zipCode[0], zipCode[1]).subscribe(address => {
          this.logger.info("Get address by zip code result: " + JSON.stringify(address));
          var addressToShow = address[0];
          this.formNewStakeholder.get('Address').setValue(addressToShow.address);
          this.formNewStakeholder.get('Country').setValue(addressToShow.country);
          this.formNewStakeholder.get('Locality').setValue(addressToShow.postalArea);
        }));

      }
    } else {
      this.lockLocality = false;
      if (currentCountry != "") {
        this.formNewStakeholder.get('Address').setValidators(null);
        this.formNewStakeholder.get('ZIPCode').setValidators(null);
        this.formNewStakeholder.get('Locality').setValidators(null);
      }
      
    }
  }

  canEditLocality() {
    if (this.returned === 'consult')
      return false;
    if (this.lockLocality)
      return false;
    return true;
  }

  validate(value: string) {
    if (this.currentStakeholder?.stakeholderAcquiring?.signType != null && this.currentStakeholder?.stakeholderAcquiring?.signType !== '') {
      this.validateNIF(value);
    } else {
      this.validateNIPC(value);
    }
  }

  validateNIF(nif: string): boolean {
    this.incorrectNIFSize = false;
    this.incorrectNIF = false;
    if (nif != '' && nif != null) {
      if (nif.length != 9) {
        this.incorrectNIFSize = true;
        return false;
      }
      if (!['1', '2', '3'].includes(nif.substr(0, 1))) {
        this.incorrectNIF = true;
        return false;
      }

      const total = Number(nif[0]) * 9 + Number(nif[1]) * 8 + Number(nif[2]) * 7 + Number(nif[3]) * 6 + Number(nif[4]) * 5 + Number(nif[5]) * 4 + Number(nif[6]) * 3 + Number(nif[7]) * 2;
      const modulo11 = total - Math.trunc(total / 11) * 11;
      const comparador = modulo11 === 1 || modulo11 === 0 ? 0 : 11 - modulo11;

      if (Number(nif[8]) !== comparador) {
        this.incorrectNIF = true;
        return false;
      }
      return Number(nif[8]) === comparador;
    }
  }

  validateNIPC(nipc: string): boolean {
    this.incorrectNIPCSize = false;
    this.incorrectNIPC = false;
    if (nipc != '' && nipc != null) {
      if (nipc.length != 9) {
        this.incorrectNIPCSize = true;
        return false;
      }
      if (!['5', '6', '8', '9'].includes(nipc.substr(0, 1))) {
        this.incorrectNIPC = true;
        return false;
      }

      const total = Number(nipc[0]) * 9 + Number(nipc[1]) * 8 + Number(nipc[2]) * 7 + Number(nipc[3]) * 6 + Number(nipc[4]) * 5 + Number(nipc[5]) * 4 + Number(nipc[6]) * 3 + Number(nipc[7]) * 2;
      const modulo11 = total - Math.trunc(total / 11) * 11;
      const comparador = modulo11 === 1 || modulo11 === 0 ? 0 : 11 - modulo11;

      if (Number(nipc[8]) !== comparador) {
        this.incorrectNIPC = true;
        return false;
      }

      return Number(nipc[8]) === comparador;
    }
  }

  numericOnlyNIF(event): boolean {
    var ASCIICode = (event.which) ? event.which : event.keyCode;

    if (ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57) || ASCIICode == 86)
      return false;

    return true;
  }

  onFocusOut() {
    var currentCountry = this.formNewStakeholder.get('Country').value;
    var zipcode = this.formNewStakeholder.value['ZIPCode'];
    var regex = /^(\d{4}[\-]{1}\d{3})$/gm;
    if (!regex.test(zipcode) && currentCountry == "PT")
      this.snackBar.open(this.translate.instant('errorMessages.404.postalCode'), '', { duration: 4000, panelClass: ['snack-bar'] });
  }
}
