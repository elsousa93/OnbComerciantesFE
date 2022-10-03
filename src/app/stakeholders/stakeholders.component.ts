import { Component, Inject, OnInit, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IStakeholders, StakeholdersCompleteInformation } from './IStakeholders.interface';
import { stakeTypeList } from './stakeholderType';
import { docTypeListP } from './docType';
import { docTypeListE } from './docType';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { FormGroup, FormControl, NgForm, Form, FormBuilder } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { DataService } from '../nav-menu-interna/data.service';
import { StakeholderService } from './stakeholder.service';
import { SubmissionService } from '../submission/service/submission-service.service';
import { TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, ModalModule } from 'ngx-bootstrap/modal';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { Configuration, configurationToken } from '../configuration';

import { readCC } from '../citizencard/CitizenCardController.js';
import { readCCAddress } from '../citizencard/CitizenCardController.js';

import { ReadcardService } from '../readcard/readcard.service';
import { BrowserModule } from '@angular/platform-browser';
import jsPDF from 'jspdf';
import { dataCC } from '../citizencard/dataCC.interface';
import { LoggerService } from '../logger.service';

/** Listagem Intervenientes / Intervenientes
 *
 */
@Component({
  selector: 'app-stakeholders',
  templateUrl: './stakeholders.component.html',
  styleUrls: ['./stakeholders.component.css']
})
export class StakeholdersComponent implements OnInit {

  UUIDAPI: string = "eefe0ecd-4986-4ceb-9171-99c0b1d14658";

  newStake: IStakeholders = {
    "fiscalId": "",
    "identificationDocument": {
      "type": "",
      "number": "",
      "country": "",
      "expirationDate": "",
    }
  }
  @ViewChild('newModal') newModal;

  insertStakeholderEvent: Observable<IStakeholders>;

  emitInsertedStake(stake) {
    this.insertStakeholderEvent = stake;
  }

  //newStake: IStakeholders = {

  //  "id": "22199900000051",
  //  "merchantType": null,
  //  "commercialName": "CAFE CENTRAL",
  //  "legalNature": "35",
  //  "legalNature2": null,
  //  "incorporationStatement": {
  //    "code": "0000-0000-0001",
  //    "validUntil": "2023-06-29T18:52:08.336+01:00"
  //  },
  //  "shareCapital": {
  //    "capital": 50000.2,
  //    "date": "2028-06-29T18:52:08.336+01:00"
  //  },
  //  "byLaws": "O Joao pode assinar tudo, like a boss",
  //  "mainEconomicActivity": "90010",
  //  "otherEconomicActivities": [
  //    "055111"
  //  ],
  //  "incorporationDate": "2020-03-01T17:52:08.336+00:00",
  //  "businessGroup": null,
  //  "knowYourSales": {
  //    "estimatedAnualRevenue": 1000000,
  //    "transactionsAverage": 30000,
  //    "servicesOrProductsSold": [
  //      "Cafe"
  //    ],
  //    "servicesOrProductsDestinations": [
  //      "PT"
  //    ]
  //  },
  //  "bankInformation": {
  //    "bank": "0033",
  //    "iban": "PT00333506518874499677629"
  //  },
  //  "contacts": {
  //    "email": "joao@silvestre.pt",
  //    "phone1": {
  //      "countryCode": "+351",
  //      "phoneNumber": "919654422"
  //    },
  //    "phone2": null
  //  },
  //  "fullName": "",
  //  "contactName": "",
  //  "shortName": ""
  //} as IStakeholders;

  currentStakeholder: StakeholdersCompleteInformation = {};
  currentIdx: number;
  allStakeholdersComprovativos = {}; 

  submissionId: string;

  processNumber: string;

//  submissionId: string = "83199e44-f089-471c-9588-f2a68e24b9ab";

  submissionStakeholders: IStakeholders[] = [];
  
  //Field "stakeholder type" for the search
  ListStakeholderType = stakeTypeList;
  TypeList;
  stakeholderType?: string = "";

  //Field "doc type" for the search
  ListDocTypeP = docTypeListP;
  ListDocTypeE = docTypeListE;
  documentType?: string = "";

  stakeholdersToShow: any[] = [];

  ngForm!: FormGroup;
  public stakes: IStakeholders[] = [];
  public stakeShow: IStakeholders[] = [];
  public stakeType: boolean = false;
  public showFoundStake: boolean = null;
  public stakeDocType: boolean = null;
  public stakeholderId : number = 0;
  public fiscalId: number = 0;
  public clientNr: number = 8875;
  public totalUrl: string = "";
  public auxUrl: string = "";
  public stakeSearch: IStakeholders[] = [this.newStake];
  isShown: boolean = false;
  isFoundStakeholderShown: boolean = false;
  public flagRecolhaEletronica: boolean = true;
  public poppy?: any;

  formStakeholderSearch: FormGroup;

  public map: Map<number, boolean>;
  public currentPage: number;
  public subscription: Subscription;

  public isParticular: boolean = false;
  public isCC: boolean = false;
  public isNoDataReadable: boolean;

  public returned: string;

  editStakes: FormGroup;
  editStakeInfo: boolean;

  selectedStakeholderComprovativos = [];
  stakesLength: number;

  constructor(private router: ActivatedRoute, public modalService: BsModalService, private readCardService: ReadcardService,
      private http: HttpClient, private route: Router, private logger: LoggerService, private data: DataService, private fb: FormBuilder, private stakeholderService: StakeholderService, private submissionService: SubmissionService) {

    this.editStakes = this.fb.group({
      searchAddStakes: this.fb.group({
        searchStakes: this.fb.group({
          "type": [''],
          "documentType": [''],
          "documentNumber": [''],
        }),
        newStakes: this.fb.group({
          "nipc": [''],
          "socialDenomination": [''],
          "nif": [''],
          "name": ['']
        }),
      })
    });

  }

  redirectAddStakeholder() {
    this.editStakeInfo = false;
    console.log(this.editStakes);
    //this.route.navigate(['/create-stakeholder/']);
  }

  redirectInfoStakeholder() {
    //this.selectStake({ stakeholder: null, currentIdx: 0 });
    this.editStakeInfo = true;
    console.log(this.editStakes.get("stake"));
    //this.route.navigate(['/add-stakeholder/']);
  }

  refreshPage() {
    this.editStakeInfo = null;
  }

  changeDataReadable(readable: boolean) {
    this.isNoDataReadable = readable;
  }
  ngOnInit(): void {
    //Get Id from the store
   // this.clientNr = Number(this.router.snapshot.params['nif']);
   //this.form = new FormGroup({
   //   stakeholderType: new FormControl(''),
   //   tipoDocumento: new FormControl(''),
   //   stakeholderNif: new FormControl(''),
   // });
    //this.createForm();
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    this.data.updateData(false, 2, 1);
    this.submissionId = localStorage.getItem('submissionId');
    this.processNumber = localStorage.getItem("processNumber");
    this.returned = localStorage.getItem('returned');
    this.getStakesListLength(this.submissionStakeholders);

  }

  //Modal que pergunta se tem o PIN da Morada
  launchNewModal() {
    this.newModal = this.modalService.show(this.newModal, { class: 'modal-sm' })
    this.newModal.result.then(function (result: boolean): void {
      if (result) {
        this.Window.readCCAddress();
      } else {
        this.Window.readCC();

        this.closeModal();
      }
    }.bind(this));
  }

  createForm() {
    this.formStakeholderSearch = this.fb.group({
      stakeholderType: [''],
      docType: [''],
      docNumber: [''],
      flagAutCol: [''],
      identificationDocumentId: [''],
      documentType: ['']
    });
  }

  onClickSearch() {

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
  }
  changeListElementDocType(docType: string, e: any) {
    this.documentType = e.target.value;

    this.newStake.identificationDocument.type = this.documentType;

    if (this.documentType === 'Cartão do Cidadão') {
      this.isCC = true;
    } else {
      this.isCC = false;
    }
    this.stakeDocType = true;
  }

  toggleShow(stake: IStakeholders) {
    //clear the array
    this.stakeShow = [];
    this.isShown = !this.isShown;

    this.stakeShow.push(stake);
   // GetByid(StakeholderNif, 0)
       
  }

  selectStakeholder(stakeholder) {
    this.currentStakeholder = stakeholder;
    
  }

  //searchStakeholder(formStakeholderSearch) {
  //  this.logger.debug(formStakeholderSearch);
  //  this.http.get<IStakeholders>(this.baseUrl + 'BEStakeholders/StakeholderBySubmissionID/' + this.formStakeholderSearch.value.docNumber + "/submission/" + "1").subscribe(result => {
  //    this.logger.debug(result);
  //    this.toggleShow(result);
  //  }, error => console.error(error));
  //}

  searchStakeholder() {
    //this.formStakeholderSearch
    //this.logger.debug("ola");
    //this.stakeholderService.SearchStakeholderByQuery("000000002", "por mudar", this.UUIDAPI, "2").subscribe(o => {
    //  this.logger.debug(o);
    //});

    var context = this;

    /*this.onSearchSimulation(22181900000011);*/
    this.stakeholderService.SearchStakeholderByQuery("000000002", "por mudar", this.UUIDAPI, "2").subscribe(o => {
      var clients = o;

      var context2 = this;

      clients.forEach(function (value, index) {
        context2.stakeholderService.getStakeholderByID(value.stakeholderId, "por mudar", "por mudar").subscribe(c => {
          var stakeholder = {
            "stakeholderNumber": c.stakeholderId,
            "stakeholderName": c.shortName,
            "stakeholderNIF": c.fiscalIdentification.fiscalId,
            "elegible": "elegivel",
            "associated": "SIM"
          }

          context.stakeholdersToShow.push(stakeholder);
        }, error => {
          console.log("Erro ao obter informação de um stakeholder");
        });
      })
    }, error => {
      //context.showFoundClient = false;
      //this.logger.debug("entrou aqui no erro huajshudsj");
      //context.resultError = "Não existe Comerciante com esse número.";
      //this.searchDone = true;

    });
  }

  refreshDiv() {
    location.reload();
    this.ngOnInit();
  }

  deleteStakeholder(stakeholder) {
    if (this.returned !== 'consult') {
      this.stakeholderService.DeleteStakeholder(this.submissionId, stakeholder.id).subscribe(s => {
        this.route.navigateByUrl('stakeholders/');
        //this.ngOnInit();
        //const index = this.stakeholdersToShow.indexOf(this.currentStakeholder);
        //this.logger.debug(index);
        //if (index > -1) { // 
        //  this.stakeholdersToShow.splice(index, 1);
        //}
        //this.logger.debug("depois de apagar");
        //this.logger.debug(this.stakeholdersToShow);
        //for (var i = 0; i < this.stakeholdersToShow.length; i++) {
        //  if (this.stakeholdersToShow[i] === this.currentStakeholder)
        //    this.stakeholdersToShow.splice(i, 1);
        //}
      });
    } else {
    }
  }

  getStakeFunction() {
    var context = this;
    this.stakeholderService.GetAllStakeholdersFromSubmission(this.submissionId).subscribe(result => {
      result.forEach(function (value, index) {
        context.stakeholderService.GetStakeholderFromSubmission(context.submissionId, value.id).subscribe(result => {
          context.submissionStakeholders.push(result);
          this.stakeService.getStakeholderByID(result.stakeholderId, 'faltarequestID', 'faltaAcquiringUserID').subscribe((result: { documents: any; stakeholderId: string | number; }) => {
            var documents = result.documents;
            context.allStakeholdersComprovativos[result.stakeholderId] = documents;
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

  setFormData() {
    var stakeForm = this.editStakes.get("stake");
    stakeForm.get("contractAssociation").setValue('false');
    stakeForm.get("flagRecolhaEletronica").setValue('true');
    stakeForm.get("proxy").setValue(this.currentStakeholder.stakeholderAcquiring.isProxy + '');

    if (stakeForm.get("documentType") == null) {
      stakeForm.get("NIF").setValue(this.currentStakeholder.stakeholderAcquiring.fiscalId);
      stakeForm.get("Role").setValue("");
      stakeForm.get("Country").setValue(this.currentStakeholder.stakeholderAcquiring.fiscalAddress.country);
      stakeForm.get("ZIPCode").setValue(this.currentStakeholder.stakeholderAcquiring.fiscalAddress.postalCode);
      stakeForm.get("Locality").setValue(this.currentStakeholder.stakeholderAcquiring.fiscalAddress.locality);
      stakeForm.get("Address").setValue(this.currentStakeholder.stakeholderAcquiring.fiscalAddress.address);
    } else {
      stakeForm.get("documentType").setValue(this.currentStakeholder.stakeholderAcquiring.identificationDocument.type);
      stakeForm.get("identificationDocumentCountry").setValue(this.currentStakeholder.stakeholderAcquiring.identificationDocument.country);
      stakeForm.get("identificationDocumentValidUntil").setValue(this.currentStakeholder.stakeholderAcquiring.identificationDocument.expirationDate);
      stakeForm.get("identificationDocumentId").setValue(this.currentStakeholder.stakeholderAcquiring.identificationDocument.number);
    }
    console.log('Form dos stakes depois de selecionar um stake ', stakeForm);
  }

  selectStake(info) {
    if(info.stakeholder != null) {
      this.currentStakeholder = info.stakeholder;
      this.currentIdx = info.idx;
      this.selectedStakeholderComprovativos = this.allStakeholdersComprovativos[this.currentStakeholder.stakeholderAcquiring.stakeholderId];
      setTimeout(() => this.setFormData(), 500);
    }
  }

  submit() {
    console.log("Chamada do submit principal ", this.editStakes.valid);
    if (this.returned !== 'consult') {
      if (this.editStakes.valid) {
        var stakeForm = this.editStakes.get("stake");

        this.currentStakeholder.stakeholderAcquiring.isProxy = (stakeForm.get("proxy").value === 'true');

        if (this.currentStakeholder.stakeholderAcquiring.fiscalAddress === null || this.currentStakeholder.stakeholderAcquiring.fiscalAddress === undefined)
          this.currentStakeholder.stakeholderAcquiring.fiscalAddress = {};

        if (stakeForm.get("documentType") == null) { 
          this.currentStakeholder.stakeholderAcquiring.fiscalAddress.address = stakeForm.get("Address").value;
          this.currentStakeholder.stakeholderAcquiring.fiscalAddress.country = stakeForm.get("Country").value;
          this.currentStakeholder.stakeholderAcquiring.fiscalAddress.locality = stakeForm.get("Locality").value;
          this.currentStakeholder.stakeholderAcquiring.fiscalAddress.postalCode = stakeForm.get("ZIPCode").value;
          this.currentStakeholder.stakeholderAcquiring.fiscalAddress.postalArea = stakeForm.get("Locality").value;
        }

        if (stakeForm.get("Country") == null) {
          if (this.currentStakeholder.stakeholderAcquiring.identificationDocument === null || this.currentStakeholder.stakeholderAcquiring.identificationDocument === undefined)
            this.currentStakeholder.stakeholderAcquiring.identificationDocument = {};
          this.currentStakeholder.stakeholderAcquiring.identificationDocument.type = stakeForm.get("documentType").value;
          this.currentStakeholder.stakeholderAcquiring.identificationDocument.number = stakeForm.get("identificationDocumentId").value;
          this.currentStakeholder.stakeholderAcquiring.identificationDocument.country = stakeForm.get("identificationDocumentCountry").value;
          this.currentStakeholder.stakeholderAcquiring.identificationDocument.expirationDate = stakeForm.get("documentCountry").value;
        }

        this.stakeholderService.UpdateStakeholder(this.submissionId, this.currentStakeholder.stakeholderAcquiring.id, this.currentStakeholder.stakeholderAcquiring).subscribe(result => {
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

  getStakesListLength(value) {
    console.log('Tamanho da lista dos stakeholders ', value.length);
    this.stakesLength = value.length;
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
}


