import { Component, OnInit, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { of, Subject, Subscription } from 'rxjs';
import { DataService } from '../../nav-menu-interna/data.service';
import { SubmissionDocumentService } from '../../submission/document/submission-document.service';
import { IStakeholders } from '../IStakeholders.interface';
import { StakeholderService } from '../stakeholder.service';
import { stakeTypeList } from '../stakeholderType';
import { TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { BsModalService } from 'ngx-bootstrap/modal';
import { readCC } from '../../citizencard/CitizenCardController.js';
import { readCCAddress } from '../../citizencard/CitizenCardController.js';
import { ClearCCFields } from '../../citizencard/CitizenCardController.js';
import { ICCInfo } from '../../citizencard/ICCInfo.interface';
import { dataCC } from '../../citizencard/dataCC.interface';
import { ReadcardService } from '../../readcard/readcard.service';
import { LoggerService } from 'src/app/logger.service';
import { FileAndDetailsCC } from '../../readcard/fileAndDetailsCC.interface';
import { TableInfoService } from 'src/app/table-info/table-info.service';
import { UserTypes } from 'src/app/table-info/ITable-info.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Client } from '../../client/Client.interface';
import { PostDocument } from '../../submission/document/ISubmission-document';

@Component({
  selector: 'app-create-stakeholder',
  templateUrl: './create-stakeholder.component.html',
  styleUrls: ['./create-stakeholder.component.css']
})
export class CreateStakeholderComponent implements OnInit, OnChanges {
  UUIDAPI: string = "eefe0ecd-4986-4ceb-9171-99c0b1d14658"

  @Output() insertedStakeSubject = new EventEmitter<Subject<IStakeholders>>();
  @Output() canceledSearch = new EventEmitter<boolean>();
  @Output() sameNIF = new EventEmitter<string>();

  emitInsertedStake(stake) {
    this.insertedStakeSubject.emit(stake);
  }

  emitCanceledSearch(bool) {
    this.canceledSearch.emit(bool);
  }

  emitSameNIF(nif) {
    this.sameNIF.emit(nif);
  }

  @Input() parentFormGroup: FormGroup;
  @Input() sameNIFStake: boolean;
  @Input() submissionClient: Client;

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
    documentType: null
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
    this.foundStakeholders = true;
    this.selected = true;
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

    this.dataCCcontents.nameCC = name;
    this.dataCCcontents.nationalityCC = nationality;
    this.dataCCcontents.birthdateCC = birthDate;
    this.dataCCcontents.cardNumberCC = cardNumber; // Nº do CC
    this.dataCCcontents.expiricyDateCC = expiryDate;
    this.dataCCcontents.documentType = documentType;
    this.dataCCcontents.nifCC = nif;
    this.dataCCcontents.localityCC = postalCode.split(" ").pop();
    this.emitSameNIF(of(this.dataCCcontents.nifCC));
    this.dataCCcontents.countryCC = countryIssuer;
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
      this.dataCCcontents.countryCC = " ";

      var ccArrayData: Array<string> = [name, gender, height, nationality, birthDate, cardNumber, expiryDate,
        emissonLocal, nameFather, nameMother, nif, nss, sns, assinatura, this.dataCCcontents.addressCC, this.dataCCcontents.postalCodeCC, this.dataCCcontents.countryCC];

      //Send to PDF without address -- type base64
      this.readCardService.formatPDF(ccArrayData).then(resolve => {
        this.prettyPDF = resolve;
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
      });
    }
  }

  UibModal: BsModalRef | undefined;
  ShowSearchResults: boolean;
  SearchDone: boolean;
  ShowAddManual: boolean;
  ValidadeSearchAddIntervenient: boolean;
  HasInsolventIntervenients: boolean;
  BlockClientName: boolean;
  BlockNIF: boolean;
  Validations: boolean;
  DisableButtons: boolean;
  IsInsolventCantPass: boolean;
  CCReaderPresent: boolean;
  CCReaderCCID: number;
  CCID: ICCInfo;

  @ViewChild('newModal') newModal;

  submissionId: string;
  submissionStakeholders: IStakeholders[] = [];

  //Field "stakeholder type" for the search
  ListStakeholderType = stakeTypeList;
  stakeholderType?: string = "";
  documentType?: string = "";
  stakeholdersToShow: any[] = [];
  ngForm!: FormGroup;
  docType?: string = "";

  public stakes: IStakeholders[] = [];
  public stakeShow: IStakeholders[] = [];
  public stakeType: boolean = false;
  public showFoundStake: boolean = null;
  public stakeDocType: boolean = false;
  public stakeDocNumber: boolean = false;
  public stakeholderId: number = 0;
  public fiscalId: number = 0;
  public clientNr: number = 8875;
  public totalUrl: string = "";
  public auxUrl: string = "";
  public selected: boolean = false;
  isShown: boolean = false;
  isFoundStakeholderShown: boolean = false;
  public flagRecolhaEletronica: boolean = true;
  public poppy?: any;

  formStakeholderSearch: FormGroup;
  formNewStakeholder: FormGroup;

  ListDocTypeP;
  ListDocTypeE;

  public map: Map<number, boolean>;
  public currentPage: number;
  public subscription: Subscription;
  public isParticular: boolean = false;
  public isCC: boolean = false;
  public isNoDataReadable: boolean = true;
  public isSearch: boolean = false;

  stakeholderNumber: string;
  foundStakeholders: boolean = null;
  errorMsg: string = "";
  currentStakeholder: IStakeholders = {};
  searchEvent: Subject<string> = new Subject<string>();
  testEvent = this.searchEvent.asObservable();

  public subs: Subscription[] = [];
  returned: string;
  isClientNrSelected: boolean = false;
  incorrectNIFSize: boolean = false;
  incorrectNIF: boolean = false;
  incorrectNIPCSize: boolean = false;
  incorrectNIPC: boolean = false;
  incorrectCCSize: boolean = false;
  incorrectCC: boolean = false;
  incorrectCCFormat: boolean = false;
  sameNIPC: boolean = false;
  sameNIFMatch: boolean = false;

  stakesList: [] = [];
  potentialClientIds: string[] = [];
  showSameNIFErrorForm: boolean = false;

  constructor(private logger: LoggerService, private readCardService: ReadcardService, public modalService: BsModalService,
    private route: Router, private data: DataService, private snackBar: MatSnackBar, private translate: TranslateService,
    private stakeholderService: StakeholderService, private tableInfo: TableInfoService,
    private submissionDocumentService: SubmissionDocumentService, private rootFormGroup: FormGroupDirective) {

    this.subs.push(this.tableInfo.GetAllSearchTypes(UserTypes.MERCHANT).subscribe(result => {
      this.ListDocTypeE = result;
      this.ListDocTypeE = this.ListDocTypeE.sort((a, b) => a.description > b.description ? 1 : -1); //ordenar resposta
    }), (this.tableInfo.GetAllSearchTypes(UserTypes.STAKEHOLDER).subscribe(result => {
      this.ListDocTypeP = result;
      this.ListDocTypeP = this.ListDocTypeP.sort((a, b) => a.description > b.description ? 1 : -1); //ordenar resposta
    })));

    this.showSameNIFError = false;
    this.showSameNIFErrorForm = false;
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sameNIFStake'].currentValue === true) {
      if (this.isParticular && !this.isClientNrSelected) {
        this.showSameNIFErrorForm = true;
      } else {
        this.isShown = false;
        this.foundStakeholders = null;
        this.showSameNIFError = true;
        this.isCC = false;
        this.okCC = false;
        this.isNoDataReadable = true;
        this.selected = false;
        this.showSameNIFErrorForm = false;
      }
    } else {
      this.showSameNIFError = false;
      this.showSameNIFErrorForm = false;
    }
  }

  initializeNotFoundForm() {
    switch (this.isParticular) {
      case false:
        let nipc = this.formStakeholderSearch.get("documentType").value === "0502" ?
          this.formStakeholderSearch.get("documentNumber").value : ''
        this.formNewStakeholder.get("nipc").setValue(nipc);

        if (nipc !== '') {
          this.formNewStakeholder.get("nipc").disable();
        } else {
          this.formNewStakeholder.get("nipc").enable();
        }
        this.formNewStakeholder.get("socialDenomination").setValue('');

        this.formNewStakeholder.get("nif").clearValidators();
        this.formNewStakeholder.get("name").clearValidators();
        this.formNewStakeholder.get("nipc").addValidators(Validators.required);
        this.formNewStakeholder.get("socialDenomination").addValidators(Validators.required);
        this.formNewStakeholder.updateValueAndValidity();
        break;
      case true:
        let nif = this.formStakeholderSearch.get("documentType").value === "0501" ?
          this.formStakeholderSearch.get("documentNumber").value : ''
        this.formNewStakeholder.get("nif").setValue(nif);
        if (nif !== '') {
          this.formNewStakeholder.get("nif").disable();
        } else {
          this.formNewStakeholder.get("nif").enable();
        }
        this.formNewStakeholder.get("name").setValue('');

        this.formNewStakeholder.get("socialDenomination").clearValidators();
        this.formNewStakeholder.get("nipc").clearValidators();
        this.formNewStakeholder.get("name").addValidators(Validators.required);
        this.formNewStakeholder.get("nif").addValidators(Validators.required);
        this.formNewStakeholder.updateValueAndValidity();
        break;
    }
    this.foundStakeholders = false;
  }

  deactivateNotFoundForm() {
    this.foundStakeholders = true;
  }

  initializeForm() {
    this.formStakeholderSearch = new FormGroup({
      type: new FormControl('', Validators.required),
      documentType: new FormControl('', Validators.required),
      documentNumber: new FormControl('', Validators.required)
    });

    this.formNewStakeholder = new FormGroup({
      nipc: new FormControl(''),
      socialDenomination: new FormControl(''),
      nif: new FormControl(''),
      name: new FormControl(''),
    });

    this.formStakeholderSearch.get("documentType").valueChanges.subscribe(data => {
      if (data !== '1001') { // Cartão do Cidadão
        this.formStakeholderSearch.controls["documentNumber"].setValidators([Validators.required]);
        this.formStakeholderSearch.removeControl("flagAutCol");
      } else {
        this.formStakeholderSearch.controls["documentNumber"].clearValidators();
        this.formStakeholderSearch.addControl("flagAutCol", new FormControl(true, Validators.required));
        this.formStakeholderSearch.get("flagAutCol").updateValueAndValidity();

        let navigationExtras: NavigationExtras = {
          state: {
            flagAutCol: true,
          }
        };
      }
      this.formStakeholderSearch.controls["documentNumber"].updateValueAndValidity();
    });
  }

  /**
   * Recolha Automatica dos Dados do Cartão de Cidadão?
   * @param readable
   */
  changeDataReadable(readable: boolean) {
    if (readable) {
      this.stakeholderNumber = '';
      this.clearNewForm();
    }
    this.isNoDataReadable = readable;
    if (readable === false) {
      this.okCC = readable; //W
    }

  }

  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    this.submissionId = localStorage.getItem('submissionId');
    this.returned = localStorage.getItem("returned");
    //this.data.updateData(false, 2);

    if (this.rootFormGroup.form != null) {
      this.rootFormGroup.form.setControl('searchStakes', this.formStakeholderSearch);
      this.rootFormGroup.form.setControl('newStakes', this.formNewStakeholder);
      if (this.returned == 'consult') {
        this.formStakeholderSearch.disable();
        this.formNewStakeholder.disable();
      }
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub?.unsubscribe);
  }

  changeListElementStakeType(stakeType, e: any) {
    this.stakeholderType = e.target.value;
    if (this.stakeholderType === 'Particular') {
      this.isParticular = true;
      this.formStakeholderSearch.get("documentType").setValue("0501"); // NIF, por default
      this.changeListElementDocType(null, { target: { value: "0501" } });
    } else if (this.stakeholderType === 'Empresa') {
      this.isParticular = false;
      this.formStakeholderSearch.get("documentType").setValue("0502"); // Número de identificação fiscal, por default
      this.changeListElementDocType(null, { target: { value: "0502" } });
    }
    this.stakeType = true;
    this.okCC = false;
    this.resetSearchStakeholder(); //
  }

  changeListElementDocType(docType: string, e: any) {
    this.docType = e.target.value;
    if (this.docType === '1001') {
      this.isCC = true;
    } else {
      this.isCC = false;
    }
    if (this.docType === '1010') { // Nº de cliente
      this.isClientNrSelected = true;
    } else {
      this.isClientNrSelected = false;
    }
    this.stakeDocType = true;
    this.okCC = false;
    this.resetSearchStakeholder(); //
  }

  resetSearchStakeholder() {
    this.dataCCcontents = {
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
      documentType: null
    }
    this.isShown = false;
    this.foundStakeholders = null;
    this.incorrectCC = false;
    this.incorrectCCSize = false;
    this.incorrectNIF = false;
    this.incorrectNIFSize = false;
    this.incorrectCCFormat = false;
    this.incorrectNIPCSize = false;
    this.incorrectNIPC = false;
    this.sameNIPC = false;
    this.sameNIFMatch = false;
    this.formStakeholderSearch.get("documentNumber").setValue("");
    this.formStakeholderSearch.get("documentNumber").updateValueAndValidity();
  }

  searchStakeholder() {
    this.isSearch = false;
    this.sameNIPC = false;
    this.sameNIFMatch = false;

    if (this.formStakeholderSearch.invalid)
      return false;

    if (this.showSameNIFError)
      return false;

    this.stakeholderNumber = this.formStakeholderSearch.get('documentNumber').value;
    this.emitSameNIF(of(this.stakeholderNumber)); //evento que serve para comparar o NIF inserido com os stakeholders já existentes

    if (this.submissionClient.fiscalId === this.stakeholderNumber) {
      if (this.docType === '0501') {
        this.sameNIFMatch = true;
      }
      if (this.docType === '0502') {
        this.sameNIPC = true;
      }
      return false;
    }

    this.isShown = true;
    this.selected = false;

    setTimeout(() => {
      this.searchEvent.next(this.stakeholderNumber);
      this.isSearch = true;
    });
  }

  selectNewStakeholder(emittedStakeholder) {
    this.potentialClientIds = [];
    this.selected = true;
    this.currentStakeholder = emittedStakeholder.stakeholder;
    this.stakesList.forEach(val => {
      if (val["stakeholderNumber"] != emittedStakeholder.stakeholder.stakeholderNumber) {
        this.potentialClientIds.push(val["stakeholderNumber"]);
      }
    });
  }

  searchResultNotifier(info) {
    if (!info.found) {
      this.initializeNotFoundForm();
    }
    else {
      this.deactivateNotFoundForm();
      this.stakesList = info.stakesList;
    }
    this.errorMsg = info.errorMsg;
  }

  clearForm() {
    this.isShown = false;
    this.foundStakeholders = null;
    this.formNewStakeholder.reset();
    this.formStakeholderSearch.reset();
    this.initializeForm();
  }

  addStakeholder() {
    this.sameNIPC = false;
    this.sameNIFMatch = false;
    this.showSameNIFError = false;
    this.showSameNIFErrorForm = false;
    if (this.foundStakeholders && this.dataCCcontents.cardNumberCC == null) {
      this.stakeholderService.getStakeholderByID(this.currentStakeholder["stakeholderNumber"], this.docType, 'por mudar').then(stakeholder => {
        this.logger.info("Get stakeholder outbound: " + JSON.stringify(stakeholder));
        var stakeholderToInsert = stakeholder.result;
        stakeholderToInsert["fiscalId"] = this.currentStakeholder["stakeholderNIF"];
        stakeholderToInsert["stakeholderId"] = "";
        stakeholderToInsert["clientId"] = this.currentStakeholder["stakeholderNumber"];
        stakeholderToInsert["fiscalAddress"] = stakeholderToInsert["address"];
        stakeholderToInsert["phone1"] = {
          countryCode: stakeholderToInsert["contacts"]["phone1"]["country"],
          phoneNumber: stakeholderToInsert["contacts"]["phone1"]["phoneNumber"]
        }

        if (stakeholderToInsert["phone2"] != null)
        stakeholderToInsert["phone2"] = {
          countryCode: stakeholderToInsert["contacts"]["phone2"]["country"],
          phoneNumber: stakeholderToInsert["contacts"]["phone2"]["phoneNumber"]
        }

        stakeholderToInsert["email"] = stakeholderToInsert["contacts"]["email"];
        stakeholderToInsert["contacts"] = null;
        stakeholderToInsert["contactName"] = stakeholderToInsert["shortName"];

        if (stakeholderToInsert["identificationDocument"] != null) {
          stakeholderToInsert["identificationDocument"] = {
            type: stakeholderToInsert["identificationDocument"]["documentType"],
            number: stakeholderToInsert["identificationDocument"]["documentId"],
            country: stakeholderToInsert["identificationDocument"]["documentIssuer"],
            expirationDate: stakeholderToInsert["identificationDocument"]["validUntil"],
            checkDigit: stakeholderToInsert["identificationDocument"]["checkDigit"],
          }
        }
        
        stakeholderToInsert["potentialClientIds"] = this.potentialClientIds;
        if (stakeholderToInsert["signType"] == null) {
          stakeholderToInsert["signType"] = "CitizenCard";
        } else {
          stakeholderToInsert["signType"] = stakeholderToInsert["signType"];
        }
        this.logger.info("Stakeholder to add: " + JSON.stringify(stakeholderToInsert));
        this.stakeholderService.CreateNewStakeholder(this.submissionId, stakeholderToInsert).subscribe(result => {
          this.logger.info("Added stakeholder result: " + JSON.stringify(result));
          stakeholderToInsert.id = result["id"];
          this.snackBar.open(this.translate.instant('stakeholder.addSuccess'), '', {
            duration: 4000,
            panelClass: ['snack-bar']
          });
          this.emitInsertedStake(of(stakeholderToInsert));
          this.clearForm();
          this.route.navigate(['/stakeholders/']);
        }, error => {
        });
      }, error => {
        this.logger.error(error, "", "Error fetching stakeholder");
      });
    } else if (this.dataCCcontents.cardNumberCC != null || this.docType === '1001') {
      this.addStakeholderWithCC();
    }
    else {
      var fullName = (this.formNewStakeholder.get("name")?.value != '' && this.formNewStakeholder.get("name")?.value != null) ? this.formNewStakeholder.get("name")?.value : this.formNewStakeholder.get("socialDenomination")?.value
      var nameArray = fullName.split(" ").filter(element => element);
      var shortName = nameArray.length > 2 ? nameArray[0] + " " + nameArray[nameArray.length - 1] : fullName;
      var stakeholderToInsert: IStakeholders = {
        "fiscalId": (this.formNewStakeholder.get("nif")?.value != '' && this.formNewStakeholder.get("nif")?.value != null) ? this.formNewStakeholder.get("nif")?.value : this.formNewStakeholder.get("nipc")?.value,
        "phone1": {},
        "phone2": {},
        "fiscalAddress": null,
        "fullName": fullName,
        "shortName": shortName,
        "contactName": shortName,
        "isProxy": false,
        "signType": "CitizenCard"
      }
      if (this.submissionClient.fiscalId !== stakeholderToInsert.fiscalId) {
        this.logger.info("Stakeholder to add: " + JSON.stringify(stakeholderToInsert));
        this.stakeholderService.CreateNewStakeholder(this.submissionId, stakeholderToInsert).subscribe(result => {
          this.logger.info("Added stakeholder result: " + JSON.stringify(result));
          stakeholderToInsert.id = result["id"];
          this.snackBar.open(this.translate.instant('stakeholder.addSuccess'), '', {
            duration: 4000,
            panelClass: ['snack-bar']
          });
          this.emitInsertedStake(of(stakeholderToInsert));
          this.clearForm();
          this.route.navigate(['/stakeholders/']);
        });
      } else {
        if (this.docType === '0501') {
          this.sameNIFMatch = true;
        }
        if (this.docType === '0502') {
          this.sameNIPC = true;
        }
      }
    }
  }
  /**
   * Add Stakeholder with CC: Only gets the Name and NIF from the stakeholder.
   *  identificationDocument "type" vai ser uma configuracao da plataforma em q cada documento tem um codigo especifico
   *  ainda nao configurados. NULL por agora.
   *  email de 14/09
   */
  addStakeholderWithCC() {
    this.isCC = true;
    var dateCC = this.dataCCcontents.expiricyDateCC;
    var separated = dateCC?.split(' ');
    if (separated) {
      var formatedDate = separated[2] + "-" + separated[1] + "-" + separated[0];
    } else {
      var formatedDate = '2023-10-10';
    }

    if (this.prettyPDF != null) { 
      //Colocar comprovativo do CC na Submissao
      var documentCC: PostDocument = {
        documentType: '0018',
        documentPurpose: 'Identification',
        file: {
          binary: this.prettyPDF.file,
          fileType: 'PDF',
        },
        validUntil: new Date(this.prettyPDF?.expirationDate).toISOString(),
        data: null
      };
      this.logger.info("Document to add: " + JSON.stringify(documentCC));
      //this.submissionDocumentService.SubmissionPostDocument(this.submissionId, documentCC).subscribe(result => {
      //  this.logger.info('Added document: ' + JSON.stringify(result));
      //});
    }

    var fullName = this.dataCCcontents.nameCC ?? this.formNewStakeholder.get("name")?.value;
    var nameArray = fullName.split(" ").filter(element => element);
    var shortName = nameArray.length > 2 ? nameArray[0] + " " + nameArray[nameArray.length - 1] : fullName;
    

    var stakeholderToInsert: IStakeholders = {
      "fiscalId": this.dataCCcontents.nifCC ?? this.formNewStakeholder.get("nif")?.value,
      "fullName": fullName,
      "shortName": shortName,
      "contactName": shortName,
      "identificationDocument": {
        "type": '0018',
        "number": this.dataCCcontents.cardNumberCC ?? this.stakeholderNumber,
        "country": this.dataCCcontents.countryCC ?? 'PT',
        "expirationDate": new Date(formatedDate).toISOString(),
        "checkDigit": null     //FIXME
      },
      "fiscalAddress": {
        "address": this.dataCCcontents.addressCC,
        "postalCode": this.dataCCcontents?.postalCodeCC?.split(" ")[0], //
        "postalArea": this.dataCCcontents.localityCC,
        "country": this.dataCCcontents.countryCC,
      },
      "phone1": {},
      "phone2": {},
      "signType": "DigitalCitizenCard",
    }
    this.logger.info("Stakeholder to add: " + JSON.stringify(stakeholderToInsert));
    this.stakeholderService.CreateNewStakeholder(this.submissionId, stakeholderToInsert).subscribe(result => {
      this.logger.info("Added stakeholder result: " + JSON.stringify(result));
      stakeholderToInsert.id = result["id"];
      this.snackBar.open(this.translate.instant('stakeholder.addSuccess'), '', {
        duration: 4000,
        panelClass: ['snack-bar']
      });
      if (this.prettyPDF != null) {
        this.logger.info("Document to add " + JSON.stringify(documentCC));
        this.stakeholderService.AddNewDocumentStakeholder(this.submissionId, stakeholderToInsert.id, documentCC).subscribe(res => {
          this.logger.info("Added document to stakeholder " + JSON.stringify(res));
        });
      }
      this.emitInsertedStake(of(stakeholderToInsert));
      this.clearForm();
    }, error => {
      this.logger.error(error, "", "Error creating stakeholder with citizen card");
    });
  }

  cancelSearch() {
    this.emitCanceledSearch(true);
  }

  clearNewForm() {
    this.isShown = false;
    this.foundStakeholders = null;
    this.formNewStakeholder.reset();
  }

  numericOnly(event): boolean {
    if (this.docType === '0501' || this.docType === '0502') {
      var ASCIICode = (event.which) ? event.which : event.keyCode;

      if (ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57))
        return false;
      return true;
    }
  }

  checkValidationType(str: string) {
    if (this.docType === '1001')
      this.ValidateNumeroDocumentoCC(str);

    if (this.docType === '0501')
      this.validateNIF(str)

    if (this.docType === '0502')
      this.validateNIPC(str)

  }

  validateNIF(nif: string): boolean {
    this.incorrectNIFSize = false;
    this.incorrectNIF = false;
    this.sameNIPC = false;
    this.sameNIFMatch = false;
    this.showSameNIFError = false;
    this.showSameNIFErrorForm = false;
    if (nif != '') {
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

      if (this.submissionClient.fiscalId === nif) {
        this.sameNIFMatch = true;
        return false;
      }

      this.emitSameNIF(of(nif));

      return Number(nif[8]) === comparador;
    }
  }

  validateNIPC(nipc: string): boolean {
    this.incorrectNIPCSize = false;
    this.incorrectNIPC = false;
    this.sameNIPC = false;
    this.sameNIFMatch = false;
    this.showSameNIFError = false;
    this.showSameNIFErrorForm = false;
    if (nipc != '') {
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

      if (this.submissionClient.fiscalId === nipc) {
        this.sameNIPC = true;
        return false;
      } 
      return Number(nipc[8]) === comparador;
    }
  }

  ValidateNumeroDocumentoCC(numeroDocumento: string) {
    this.incorrectCC = false;
    this.incorrectCCSize = false;
    this.incorrectCCFormat = false;
    this.showSameNIFError = false;
    this.showSameNIFErrorForm = false;
    this.sameNIPC = false;
    this.sameNIFMatch = false;
    var sum = 0;
    var secondDigit = false;

    if (numeroDocumento.length != 12) {
      this.incorrectCCSize = true;
      return false;
    }

    var ccFormat = /^[\d]{8}?\d([A-Z]{2}\d)?$/g;
    if (!ccFormat.test(numeroDocumento)) {
      this.incorrectCCFormat = true;
      return false;
    }

    for (var i = numeroDocumento.length - 1; i >= 0; --i) {
      var valor = this.GetNumberFromChar(numeroDocumento[i]);
      if (secondDigit) {
        valor *= 2;
        if (valor > 9)
          valor -= 9;
      }
      sum += valor;
      secondDigit = !secondDigit;
    }

    if (sum % 10 != 0) {
      this.incorrectCC = true;
      return false;
    }

    return (sum % 10) == 0;
  }

  GetNumberFromChar(letter: string) {
    switch (letter) {
      case '0': return 0;
      case '1': return 1;
      case '2': return 2;
      case '3': return 3;
      case '4': return 4;
      case '5': return 5;
      case '6': return 6;
      case '7': return 7;
      case '8': return 8;
      case '9': return 9;
      case 'A': return 10;
      case 'B': return 11;
      case 'C': return 12;
      case 'D': return 13;
      case 'E': return 14;
      case 'F': return 15;
      case 'G': return 16;
      case 'H': return 17;
      case 'I': return 18;
      case 'J': return 19;
      case 'K': return 20;
      case 'L': return 21;
      case 'M': return 22;
      case 'N': return 23;
      case 'O': return 24;
      case 'P': return 25;
      case 'Q': return 26;
      case 'R': return 27;
      case 'S': return 28;
      case 'T': return 29;
      case 'U': return 30;
      case 'V': return 31;
      case 'W': return 32;
      case 'X': return 33;
      case 'Y': return 34;
      case 'Z': return 35;
    }
  }
}
