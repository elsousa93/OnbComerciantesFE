import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit,  EventEmitter } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { DataService } from '../../nav-menu-interna/data.service';
import { SubmissionService } from '../../submission/service/submission-service.service';
import { SubmissionDocumentService } from '../../submission/document/submission-document.service';
import { docTypeListE, docTypeListP } from '../docType';
import { IStakeholders } from '../IStakeholders.interface';
import { StakeholderService } from '../stakeholder.service';
import { stakeTypeList } from '../stakeholderType';
import { TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, ModalModule } from 'ngx-bootstrap/modal';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Configuration, configurationToken } from '../../configuration';

import { readCC } from '../../citizencard/CitizenCardController.js';
import { readCCAddress } from '../../citizencard/CitizenCardController.js';
import { ICCInfo } from '../../citizencard/ICCInfo.interface';
import { dataCC } from '../../citizencard/dataCC.interface';

import { ReadcardService } from '../../readcard/readcard.service';

import jsPDF from 'jspdf';
import { BrowserModule } from '@angular/platform-browser';
import { LoggerService } from 'src/app/logger.service';
import { FileAndDetailsCC } from '../../readcard/fileAndDetailsCC.interface';
import { TableInfoService } from 'src/app/table-info/table-info.service';
import { UserTypes } from 'src/app/table-info/ITable-info.interface';

@Component({
  selector: 'app-create-stakeholder',
  templateUrl: './create-stakeholder.component.html',
  styleUrls: ['./create-stakeholder.component.css']
})
export class CreateStakeholderComponent implements OnInit {
  UUIDAPI: string = "eefe0ecd-4986-4ceb-9171-99c0b1d14658"

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
    countryCC: null
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

  public okCC = false;
  public dadosCC: Array<string> = []; //apagar
  public addressReading = null;
  //---- Cartão de Cidadao - funcoes -----
  callreadCC() {
    readCC(this.SetNewCCData.bind(this));
    this.setOkCC();
  }
  callreadCCAddress() {
    readCCAddress(this.SetNewCCData.bind(this));
    this.setOkCC();
  }
  closeModal() {
    this.newModal.hide();
  }
  setOkCC() {
    this.okCC = true;
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
    nss, sns, address, postalCode, notes, emissonDate, emissonLocal, country, countryIssuer) {

    console.log("Name: ", name);

    this.dataCCcontents.nameCC = name;
    this.dataCCcontents.nationalityCC = nationality;
    // this.birthDateCC = birthDate;
    this.dataCCcontents.cardNumberCC = cardNumber; // Nº do CC
    this.dataCCcontents.nifCC = nif;
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

      console.log(ccArrayData);

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
      console.log("PRETTY PDF DEPOIS DO SET: ", this.prettyPDF)
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
  public isParticularSearched: boolean = false;
  public isCC: boolean = false;
  public isNoDataReadable: boolean;

  stakeholderNumber: string;

  foundStakeholders: boolean;
  errorMsg: string = "";

  currentStakeholder: IStakeholders = {};
  searchEvent: Subject<string> = new Subject<string>();
  testEvent = this.searchEvent.asObservable();

  public subs: Subscription[] = [];

  constructor(private logger : LoggerService, private router: ActivatedRoute, private readCardService: ReadcardService, public modalService: BsModalService,
    private http: HttpClient, private route: Router, private data: DataService, private fb: FormBuilder,
    private stakeholderService: StakeholderService, private submissionService: SubmissionService, private tableInfo: TableInfoService,
    private submissionDocumentService: SubmissionDocumentService  ) {

      this.subs.push(this.tableInfo.GetAllSearchTypes(UserTypes.MERCHANT).subscribe(result => {
        this.ListDocTypeP = result;
     }), (this.tableInfo.GetAllSearchTypes(UserTypes.STAKEHOLDER).subscribe(result => {
        this.ListDocTypeE = result;
     })));

    this.submissionId = localStorage.getItem('submissionId');

    //this.logger.debug("foi buscar bem ao localstorage?");
    //this.logger.debug(this.submissionId);
    this.ngOnInit();

    var context = this;
    this.initializeForm();
    //stakeholderService.GetAllStakeholdersFromSubmission(this.submissionId).subscribe(result => {
    //  result.forEach(function (value, index) {
    //    this.logger.debug(value);
    //    context.stakeholderService.GetStakeholderFromSubmission(context.submissionId, value.id).subscribe(result => {
    //      this.logger.debug(result);
    //      context.submissionStakeholders.push(result);
    //    }, error => {
    //      this.logger.debug(error);
    //    });
    //  });
    //}, error => {
    //  this.logger.debug(error);
    //});

  }

  initializeNotFoundForm() {
    switch (this.isParticularSearched){
      case false:
        let nipc = this.formStakeholderSearch.get("documentType").value === "Número de Identificação de Pessoa Colectiva" ? 
            this.formStakeholderSearch.get("documentNumber").value : ''
        this.formNewStakeholder.get("nipc").setValue(nipc);
        if (nipc !== ''){
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
        let nif = this.formStakeholderSearch.get("documentType").value === "Número de Identificação Fiscal" ? 
            this.formStakeholderSearch.get("documentNumber").value : ''
        this.formNewStakeholder.get("nif").setValue(nif);
        if (nif !== ''){
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
      if (data !== 'Cartão do Cidadão') {
        this.formStakeholderSearch.controls["documentNumber"].setValidators([Validators.required]);
        this.formStakeholderSearch.removeControl("flagAutCol");
      } else {
        this.formStakeholderSearch.controls["documentNumber"].clearValidators();
        this.formStakeholderSearch.addControl("flagAutCol", new FormControl('', Validators.required));
        this.formStakeholderSearch.get("flagAutCol").updateValueAndValidity();
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

  changeDataReadable(readable: boolean) {
    this.isNoDataReadable = readable;
    this.okCC = false;
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

  onClickNew() {
    let navigationExtras: NavigationExtras = {
      state: {
        isCC: this.isCC
      }
    };
    this.route.navigate(['/add-stakeholder'], navigationExtras);
  }

  onClickEdit(fiscalId) {
    this.route.navigate(['/update-stakeholder/', fiscalId]);
  }

  onClickDelete(fiscalId, clientNr) {
    this.route.navigate(['/add-stakeholder/', fiscalId, clientNr, 'delete']);
  }

  changeListElementStakeType(stakeType: string, e: any) {
    this.stakeholderType = e.target.value;
    if (this.stakeholderType === 'Particular') {
      this.isParticular = true;
    } else {
      this.isParticular = false;
    }
    this.stakeType = true;
    this.okCC = false;
  }
  changeListElementDocType(docType: string, e: any) {
    this.documentType = e.target.value;

    if (this.documentType === 'Cartão do Cidadão') {
      this.isCC = true;
    } else {
      this.isCC = false;
    }
    this.stakeDocType = true;
    this.okCC = false;
  }

  toggleShow(stake: IStakeholders) {
    //clear the array
    this.stakeShow = [];
    this.isShown = !this.isShown;

    this.stakeShow.push(stake);
    // GetByid(StakeholderNif, 0)
  }

  searchStakeholder() {
    if (this.formStakeholderSearch.invalid)
      return false;

    this.stakeholderNumber = this.formStakeholderSearch.get('documentNumber').value;
    this.isShown = true;
    this.searchEvent.next(this.stakeholderNumber);

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
    this.currentStakeholder = emittedStakeholder.stakeholder;

    console.log("current stakeholder: ", this.currentStakeholder);
  }

  searchResultNotifier(info) {
    console.log("Info: ", info);
    this.isParticularSearched = this.isParticular;

    if (!info.found)
      this.initializeNotFoundForm();
    else
      this.deactivateNotFoundForm();

    this.errorMsg = info.errorMsg;
  }
  addStakeholder() {
    console.log("por adicionar: ", this.currentStakeholder);
    if (this.foundStakeholders) {
      this.stakeholderService.getStakeholderByID(this.currentStakeholder["stakeholderNumber"], 'por mudar', 'por mudar').subscribe(stakeholder => {
        var stakeholderToInsert = stakeholder;
        this.stakeholderService.CreateNewStakeholder(this.submissionId, stakeholderToInsert).subscribe(result => {

          this.route.navigate(['/stakeholders/']);
        }, error => {
        });
      });
    } else {
      console.log("formstakeholder: ", this.formStakeholderSearch);
      var stakeholderToInsert: IStakeholders = {
        "fiscalId": this.formNewStakeholder.get("nif")?.value ?? this.formNewStakeholder.get("nipc")?.value,
        "identificationDocument": {
          "type": this.formStakeholderSearch.get("documentType").value,
          "number": this.formStakeholderSearch.get("documentNumber").value,
        },
        "phone1": {},
        "phone2": {},
        "shortName": this.formNewStakeholder.get("socialDenomination")?.value ?? this.formNewStakeholder.get("nome")?.value
      }
      this.stakeholderService.CreateNewStakeholder(this.submissionId, stakeholderToInsert).subscribe(result => {
        this.route.navigate(['/stakeholders/']);
      });
    }
  }
  /**
   * Add Stakeholder with CC: Only gets the Name and NIF from the stakeholder.
   * waiting for enums for identificationDocument "type" and "number".
   * date 23/08/22
   */
  addStakeholderWithCC() {
    //Colocar comprovativo d CC na Submissao 
    this.submissionDocumentService.SubmissionPostDocument(this.submissionId, this.prettyPDF);

    var stakeholderToInsert: IStakeholders = {
      "fiscalId": this.dataCCcontents.nifCC,
      "identificationDocument": {
        "type": "CC",         //FIXME
        "number": this.dataCCcontents.cardNumberCC, //FIXME
      },
      "phone1": {},
      "phone2": {},
      "shortName": this.dataCCcontents.nameCC
    }


    this.stakeholderService.CreateNewStakeholder(this.submissionId, stakeholderToInsert).subscribe(result => {
      this.route.navigate(['/stakeholders/']);
    }, error => {
      this.logger.error(error, "", "Erro ao adicionar stakeholder com o CC");
    });


  }
  

}
