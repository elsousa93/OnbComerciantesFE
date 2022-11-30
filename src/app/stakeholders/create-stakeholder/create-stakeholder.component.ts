import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { DataService } from '../../nav-menu-interna/data.service';
import { SubmissionService } from '../../submission/service/submission-service.service';
import { SubmissionDocumentService } from '../../submission/document/submission-document.service';
import { docTypeListE, docTypeListP } from '../docType';
import { IStakeholders, StakeholdersCompleteInformation } from '../IStakeholders.interface';
import { StakeholderService } from '../stakeholder.service';
import { stakeTypeList } from '../stakeholderType';
import { TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, ModalModule } from 'ngx-bootstrap/modal';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Configuration, configurationToken } from '../../configuration';

import { readCC } from '../../citizencard/CitizenCardController.js';
import { readCCAddress } from '../../citizencard/CitizenCardController.js';
import { ClearCCFields } from '../../citizencard/CitizenCardController.js';
import { ICCInfo } from '../../citizencard/ICCInfo.interface';
import { dataCC } from '../../citizencard/dataCC.interface';

import { ReadcardService } from '../../readcard/readcard.service';

import jsPDF from 'jspdf';
import { BrowserModule } from '@angular/platform-browser';
import { LoggerService } from 'src/app/logger.service';
import { FileAndDetailsCC } from '../../readcard/fileAndDetailsCC.interface';
import { TableInfoService } from 'src/app/table-info/table-info.service';
import { UserTypes } from 'src/app/table-info/ITable-info.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Client } from '../../client/Client.interface';
import { ClientService } from '../../client/client.service';
import { Address } from '../../pep/IPep.interface';
import { FocusMonitor } from '@angular/cdk/a11y';

@Component({
  selector: 'app-create-stakeholder',
  templateUrl: './create-stakeholder.component.html',
  styleUrls: ['./create-stakeholder.component.css']
})
export class CreateStakeholderComponent implements OnInit {
  UUIDAPI: string = "eefe0ecd-4986-4ceb-9171-99c0b1d14658"

  @Output() insertedStakeSubject = new EventEmitter<Subject<IStakeholders>>();

  emitInsertedStake(stake) {
    this.insertedStakeSubject.emit(stake);
  }

  @Input() parentFormGroup: FormGroup;

  modalRef: BsModalRef;

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
    this.logger.debug("okCC valor: " + this.okCC);
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
    if (this.dataCCcontents.localityCC == null) {
      this.dataCCcontents.localityCC = '';
    }
    this.dataCCcontents.countryCC = country;
    this.countryCC = countryIssuer; //HTML

    if (notes != null || notes != "") {
      var assinatura = "Sabe assinar";
      if (notes.toLowerCase().includes("não sabe assinar") || notes.toLowerCase().includes("não pode assinar")) {
        assinatura = "Não sabe assinar";
      }
    }

    if (this.addressReading == false) {

      //Without address
      console.log("Without Address PDF");
      this.dataCCcontents.addressCC = "Sem PIN de morada";
      this.dataCCcontents.postalCodeCC = " ";
      this.dataCCcontents.countryCC = " ";

      var ccArrayData: Array<string> = [name, gender, height, nationality, birthDate, cardNumber, expiryDate,
        emissonLocal, nameFather, nameMother, nif, nss, sns, assinatura, this.dataCCcontents.addressCC, this.dataCCcontents.postalCodeCC, this.dataCCcontents.countryCC];

      //Send to PDF without address -- type base64
      this.readCardService.formatPDF(ccArrayData).then(resolve => {
        this.prettyPDF = resolve;
      });
      console.log("PRETTY PDF DEPOIS DO SET: ", this.prettyPDF)

    } else {

      //WITH ADDRESS
      console.log("With Address PDF");
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
  // IntervenientsTableSearch: Array<IClientResult>;
  HasInsolventIntervenients: boolean;
  BlockClientName: boolean;
  BlockNIF: boolean;
  Validations: boolean;
  DisableButtons: boolean;
  //  DocumentTypes: Array<IRefData>;
  IsInsolventCantPass: boolean;
  CCReaderPresent: boolean;
  CCReaderCCID: number;
  CCID: ICCInfo;

  @ViewChild('newModal') newModal;

  //-------------- fim do CC ------------


  submissionId: string;
  // submissionId: string = "83199e44-f089-471c-9588-f2a68e24b9ab";

  submissionStakeholders: IStakeholders[] = [];

  //Field "stakeholder type" for the search
  ListStakeholderType = stakeTypeList;
  stakeholderType?: string = "";

  //Field "doc type" for the search
  // ListDocTypeP = docTypeListP;
  // ListDocTypeE = docTypeListE;
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
  // public isParticularSearched: boolean = false;
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
  submissionClient: Client;
  sameNIPC: boolean = false;

  constructor(private logger: LoggerService, private readCardService: ReadcardService, public modalService: BsModalService,
    private route: Router, private data: DataService, private snackBar: MatSnackBar, private translate: TranslateService, 
    private stakeholderService: StakeholderService, private tableInfo: TableInfoService,
    private submissionDocumentService: SubmissionDocumentService, private rootFormGroup: FormGroupDirective, private clientService: ClientService) {

    this.subs.push(this.tableInfo.GetAllSearchTypes(UserTypes.MERCHANT).subscribe(result => {
      this.ListDocTypeE = result;
      this.ListDocTypeE = this.ListDocTypeE.sort((a, b) => a.description> b.description? 1 : -1); //ordenar resposta
    }), (this.tableInfo.GetAllSearchTypes(UserTypes.STAKEHOLDER).subscribe(result => {
      this.ListDocTypeP = result;
      this.ListDocTypeP = this.ListDocTypeP.sort((a, b) => a.description> b.description? 1 : -1); //ordenar resposta
    })));

    this.initializeForm();

    //this.ngOnInit();

  }

  initializeNotFoundForm() {
    console.log('Não encontrou um stake ');
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
        console.log('FORM APOS NÃO ENCONTRAR STAKE NIPC', this.formNewStakeholder);
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
        console.log('FORM APOS NÃO ENCONTRAR STAKE NIF', this.formNewStakeholder);
        break;

    }
    this.foundStakeholders = false;
  }

  deactivateNotFoundForm() {
    console.log('Encontrou um stake ');
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

  redirectAddStakeholder() {
    this.route.navigate(['/add-stakeholder/']);
  }

  redirectInfoStakeholder() {
    this.route.navigate(['/add-stakeholder/']);
  }
  /**
   * Recolha Automatica dos Dados do Cartão de Cidadão?
   * @param readable
   */
  changeDataReadable(readable: boolean) {
    this.isNoDataReadable = readable;
    if (readable === false) {
      this.okCC = readable; //W
    }
    
  }

  //Modal que pergunta se tem o PIN da Morada
  launchNewModal() {
    this.newModal = this.modalService.show(this.newModal, { class: 'modal-sm' })
    this.newModal.result.then(function (result: boolean): void {
      if (result) {
        this.Window.readCCAddress();
      } else {
        this.Window.readCC();
        this.newModal.hide();
      }
    }); // }.bind(this));
  }

  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    this.submissionId = localStorage.getItem('submissionId');
    this.returned = localStorage.getItem("returned");
    this.data.updateData(false, 2);

    if (this.rootFormGroup.form != null) {
      this.rootFormGroup.form.setControl('searchStakes', this.formStakeholderSearch);
      this.rootFormGroup.form.setControl('newStakes', this.formNewStakeholder);
      if (this.returned == 'consult') {
        this.formStakeholderSearch.disable();
        this.formNewStakeholder.disable();
      }
    }

    this.clientService.GetClientByIdAcquiring(localStorage.getItem("submissionId")).then(client => {
      this.submissionClient = client;
    });
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub?.unsubscribe);
  }

  onClickSearch() {
    this.logger.debug("pesq");
  }

  //When canceling the create new store feature the user must navigate back to store list
  onClickCancel() {
    this.route.navigate(['stakeholders']);
  }



  onClickEdit(fiscalId) {
    this.route.navigate(['/update-stakeholder/', fiscalId]);
  }

  onClickDelete(fiscalId, clientNr) {
    this.route.navigate(['/add-stakeholder/', fiscalId, clientNr, 'delete']);
  }

  changeListElementStakeType(stakeType, e: any) {
    this.stakeholderType = e.target.value;
    if (this.stakeholderType === 'Particular') {
      this.isParticular = true;
    } else {
      this.isParticular = false;
    }
    this.stakeType = true;
    this.okCC = false;
    this.resetSearchStakeholder(); //
    if (this.stakeholderType === 'Particular') {
      this.formStakeholderSearch.get("documentType").setValue("0501"); // NIF, por default
    } else {
      this.formStakeholderSearch.get("documentType").setValue("0502"); // Número de identificação fiscal, por default
    }
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
    this.formStakeholderSearch.get("documentNumber").setValue("");
    this.formStakeholderSearch.get("documentNumber").updateValueAndValidity();
  }

  toggleShow(stake: IStakeholders) {
    //clear the array
    this.resetSearchStakeholder();
    this.stakeShow = [];
    this.isShown = !this.isShown;

    this.stakeShow.push(stake);
    // GetByid(StakeholderNif, 0)
  }

  searchStakeholder() {
    this.isSearch = false;
    this.sameNIPC = false;
    if (this.formStakeholderSearch.invalid)
      return false;

    this.stakeholderNumber = this.formStakeholderSearch.get('documentNumber').value;

    if (this.submissionClient.fiscalId === this.stakeholderNumber) { 
      console.log('Stake tem o mesmo id na pesquisa');
      this.sameNIPC = true;
      return false;
    }

    this.isShown = true;
    this.selected = false;


    setTimeout(() => {
      this.searchEvent.next(this.stakeholderNumber);
      this.isSearch = true;
    });

    //var context = this;

    //var documentNumberToSearch = this.formStakeholderSearch.get('documentNumber').value;

    //this.stakeholderService.SearchStakeholderByQuery(documentNumberToSearch, "por mudar", this.UUIDAPI, "2").subscribe(o => {
    //  var clients = o;

    //  context.isShown = true;

    //  if (clients.length > 0) {
    //    context.deactivateNotFoundForm();
    //    context.foundStakeholders = true;
    //    context.stakeholdersToShow = [];
    //    clients.forEach(function (value, index) {
    //      context.stakeholderService.getStakeholderByID(value.stakeholderId, "por mudar", "por mudar").subscribe(c => {
    //        var stakeholder = {
    //          "stakeholderNumber": c.stakeholderId,
    //          "stakeholderName": c.shortName,
    //          "stakeholderNIF": c.fiscalIdentification.fiscalId,
    //          "elegible": "elegivel",
    //          "associated": "SIM"
    //        }
    //        context.stakeholdersToShow.push(stakeholder);
    //      });
    //    })
    //  } else {
    //    context.initializeNotFoundForm();
    //    context.stakeholdersToShow = [];
    //    context.foundStakeholders = false;
    //  }
    //}, error => {
    //});
  }

  refreshDiv() {
    location.reload();
    this.ngOnInit();
  }

  selectNewStakeholder(emittedStakeholder) {
    this.selected = true;
    this.currentStakeholder = emittedStakeholder.stakeholder;

    console.log("current stakeholder: ", this.currentStakeholder);
  }

  searchResultNotifier(info) {
    if (!info.found)
      this.initializeNotFoundForm();
    else
      this.deactivateNotFoundForm();

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
    console.log("por adicionar: ", this.currentStakeholder);
    if (this.foundStakeholders && this.dataCCcontents.cardNumberCC == null) {
      this.stakeholderService.getStakeholderByID(this.currentStakeholder["stakeholderNumber"], 'por mudar', 'por mudar').then(stakeholder => {
        var stakeholderToInsert = stakeholder.result;
        stakeholderToInsert["fiscalId"] = this.currentStakeholder["stakeholderNIF"];
        stakeholderToInsert["stakeholderId"] = this.currentStakeholder["stakeholderNumber"];
        stakeholderToInsert["clientId"] = this.currentStakeholder["stakeholderNumber"];

        stakeholderToInsert["fiscalAddress"] = stakeholderToInsert["address"];
        stakeholderToInsert["phone1"] = {
          countryCode: stakeholderToInsert["contacts"]["phone1"]["country"],
          phoneNumber: stakeholderToInsert["contacts"]["phone1"]["phoneNumber"]
        }
        stakeholderToInsert["email"] = stakeholderToInsert["contacts"]["email"];

        this.stakeholderService.CreateNewStakeholder(this.submissionId, stakeholderToInsert).subscribe(result => {
          //this.currentStakeholder.id = result["id"];
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
        this.logger.error(error, "", "Erro ao obter informação de um stakeholder");
      });
    } else if (this.dataCCcontents.cardNumberCC != null) {
      this.addStakeholderWithCC();
    }
    else {
      console.log("formstakeholder: ", this.formStakeholderSearch);
      var stakeholderToInsert: IStakeholders = {
        "fiscalId": this.formNewStakeholder.get("nif")?.value!='' ? this.formNewStakeholder.get("nif")?.value : this.formNewStakeholder.get("nipc")?.value,
        "identificationDocument": {
          "type": this.formStakeholderSearch.get("documentType").value,
          "number": this.formStakeholderSearch.get("documentNumber").value,
        },
        "phone1": {},
        "phone2": {},
        "shortName": this.formNewStakeholder.get("name")?.value!='' ? this.formNewStakeholder.get("name")?.value : this.formNewStakeholder.get("socialDenomination")?.value
      }
      if (this.submissionClient.fiscalId !== stakeholderToInsert.fiscalId) {
        this.stakeholderService.CreateNewStakeholder(this.submissionId, stakeholderToInsert).subscribe(result => {
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
        this.sameNIPC = true;
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
    //Colocar comprovativo do CC na Submissao 
    this.submissionDocumentService.SubmissionPostDocument(this.submissionId, this.prettyPDF);
    this.isCC = true;

    var dateCC = this.dataCCcontents.expiricyDateCC;
    var separated = dateCC.split(' ');
    var formatedDate = separated[2] + "-" + separated[1] + "-" + separated[0];

    if (this.dataCCcontents.addressCC === "Sem PIN de morada") {
      this.dataCCcontents.addressCC = "";
    }

    var stakeholderToInsert: IStakeholders = {
      "fiscalId": this.dataCCcontents.nifCC,
      "fullName": this.dataCCcontents.nameCC,
      "shortName": this.dataCCcontents.nameCC,
      "identificationDocument": {
        "type": '1001',           //FIXME "CC"
        "number": this.dataCCcontents.cardNumberCC,
        "country": this.dataCCcontents.countryCC,
        "expirationDate": new Date(formatedDate).toISOString(),
        "checkDigit": null     //FIXME
      },
      "fiscalAddress": {
        "address": this.dataCCcontents.addressCC,
        "postalCode": this.dataCCcontents.postalCodeCC,
        "postalArea": this.dataCCcontents.localityCC,
        "country": this.dataCCcontents.countryCC,
      },
      "phone1": {},
      "phone2": {}
    }

    let navigationExtras: NavigationExtras = {
      state: {
        isCC: this.isCC
      }
    };

    this.stakeholderService.CreateNewStakeholder(this.submissionId, stakeholderToInsert).subscribe(result => {
      stakeholderToInsert.id = result["id"];
      this.snackBar.open(this.translate.instant('stakeholder.addSuccess'), '', {
        duration: 4000,
        panelClass: ['snack-bar']
      });
      this.emitInsertedStake(of(stakeholderToInsert));
      this.clearForm();
      this.route.navigate(['/stakeholders/']); 
    }, error => {
      this.logger.error(error, "", "Erro ao adicionar stakeholder com o CC");
    });
  }


  numericOnly(event): boolean {
    if (this.docType === '0501' || this.docType === '0502') {
      var ASCIICode = (event.which) ? event.which : event.keyCode;

      if (ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57))
        return false;
      return true;
    }
    //return false;
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

      return Number(nif[8]) === comparador;
    }
  }

  validateNIPC(nipc: string): boolean {
    this.incorrectNIPCSize = false;
    this.incorrectNIPC = false;
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

      return Number(nipc[8]) === comparador;
    }
  }

  ValidateNumeroDocumentoCC(numeroDocumento: string) {
    this.incorrectCC = false;
    this.incorrectCCSize = false;
    this.incorrectCCFormat = false;
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
