import { Component, OnInit } from '@angular/core';
import { IStakeholders, StakeholdersCompleteInformation } from './IStakeholders.interface';
import { stakeTypeList } from './stakeholderType';
import { docTypeListP } from './docType';
import { docTypeListE } from './docType';
import { NavigationExtras, Router } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { of, Subscription } from 'rxjs';
import { DataService } from '../nav-menu-interna/data.service';
import { StakeholderService } from './stakeholder.service';
import { ViewChild } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { ComprovativosService } from '../comprovativos/services/comprovativos.services';

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
  updatedStakeholderEvent: Observable<{ stake: IStakeholders, idx: number }>;
  previousStakeholderEvent: Observable<number>;
  sameNIFEvent: Observable<string>;

  emitUpdatedStakeholder(info) {
    this.updatedStakeholderEvent = info;
  }

  emitPreviousStakeholder(idx) {
    this.previousStakeholderEvent = idx;
  }

  emitInsertedStake(stake) {
    this.clickButton = true;
    this.insertStakeholderEvent = stake;
    this.editStakeInfo = null;
  }

  emitStakeNIF(nif) {
    this.sameNIFEvent = nif;
  }

  currentStakeholder: StakeholdersCompleteInformation = {};
  currentIdx: number;
  allStakeholdersComprovativos = {}; 

  submissionId: string;

  processNumber: string;
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
  public clickButton: boolean = true;

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
  stakesLength: number = null;

  crcStakeholders: IStakeholders[] = [];
  selectedStakeholderIsFromCRC: boolean = false;
  sameNIFStake: boolean = false;

  isClient: boolean;

  constructor(public modalService: BsModalService,
    private route: Router, private data: DataService, private fb: FormBuilder, private stakeholderService: StakeholderService, 
    private comprovativoService: ComprovativosService) {

    if (this.route.getCurrentNavigation().extras.state) {
      this.editStakeInfo = this.route.getCurrentNavigation().extras.state["editStakeInfo"];
      this.isClient = this.route.getCurrentNavigation().extras.state["isClient"];
    }

    this.crcStakeholders = JSON.parse(localStorage.getItem('crcStakeholders'));

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
      }),
      stake: this.fb.group({})
    });

  }

  redirectAddStakeholder() {
    this.clickButton = false;
    this.editStakeInfo = false;
  }

  redirectInfoStakeholder() {
    this.editStakeInfo = true;
  }

  refreshPage() {
    if ((this.currentIdx - 1) >= 0) {
      this.emitPreviousStakeholder(of(this.currentIdx));
    } else {
      this.editStakeInfo = null;
    }
  }

  changeDataReadable(readable: boolean) {
    this.isNoDataReadable = readable;
  }
  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    this.data.updateData(false, 2, 1);
    this.submissionId = localStorage.getItem('submissionId');
    this.processNumber = localStorage.getItem("processNumber");
    this.returned = localStorage.getItem('returned');
    this.clickButton = true;
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

  searchStakeholder() {
    var context = this;
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

    });
  }
  
  deleteStakeholder(stakeholder) {
    if (this.returned !== 'consult') {
      this.stakeholderService.DeleteStakeholder(this.submissionId, stakeholder.id).subscribe(s => {
        this.route.navigateByUrl('stakeholders/');
      });
    } else {
    }
  }

  setFormData() {
    var stakeForm = this.editStakes.get("stake");
    stakeForm.get("contractAssociation").setValue('true');
    stakeForm.get("proxy").setValue(this.currentStakeholder.stakeholderAcquiring.isProxy + '');

    if (stakeForm.get("documentType") == null) {
      stakeForm.get("flagRecolhaEletronica").setValue(false);
      stakeForm.get("NIF").setValue(this.currentStakeholder.stakeholderAcquiring.fiscalId);
      stakeForm.get("Role").setValue("");
      stakeForm.get("Country").setValue(this.currentStakeholder.stakeholderAcquiring.fiscalAddress.country);
      stakeForm.get("ZIPCode").setValue(this.currentStakeholder.stakeholderAcquiring.fiscalAddress.postalCode);
      stakeForm.get("Locality").setValue(this.currentStakeholder.stakeholderAcquiring.fiscalAddress.postalArea);
      stakeForm.get("Address").setValue(this.currentStakeholder.stakeholderAcquiring.fiscalAddress.address);
    } else {
      stakeForm.get("flagRecolhaEletronica").setValue(true);
      stakeForm.get("documentType").setValue(this.currentStakeholder.stakeholderAcquiring.identificationDocument.type);
      stakeForm.get("identificationDocumentCountry").setValue(this.currentStakeholder.stakeholderAcquiring.identificationDocument.country);
      stakeForm.get("identificationDocumentValidUntil").setValue(this.currentStakeholder.stakeholderAcquiring.identificationDocument.expirationDate);
      stakeForm.get("identificationDocumentId").setValue(this.currentStakeholder.stakeholderAcquiring.identificationDocument.number);
    }
  }

  selectStake(info) {
    if(info.stakeholder != null) {
      this.currentStakeholder = info.stakeholder;
      this.currentIdx = info.idx;
      if (this.currentStakeholder.stakeholderOutbound != undefined) {
        this.selectedStakeholderComprovativos = this.currentStakeholder.stakeholderOutbound.supportingDocuments;
      }
      setTimeout(() => this.setFormData(), 500);
    }
  }

  submit() {
    this.clickButton = null;
    var stakeForm = this.editStakes.controls["stake"];
    if (this.returned != 'consult') {
      if (this.editStakes.controls["stake"].valid) {

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
          if (this.currentIdx < (this.stakesLength - 1)) {
            this.emitUpdatedStakeholder(of({ stake: this.currentStakeholder, idx: this.currentIdx }));
          } else {
            this.data.updateData(true, 2);
            this.route.navigate(['store-comp']);
          }

        }, error => {
        });
      }
    }
  }

  getStakesListLength(value) {
    this.stakesLength = value;
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

  loadStakeholderDocument(documentReference) {
    this.comprovativoService.viewDocument(documentReference);
  }

  isStakeholderFromCRC(stakeholder) {
    this.selectedStakeholderIsFromCRC = false;
    var context = this;
    this.crcStakeholders?.forEach(function (value, idx) {
      var stakeholderFromCRC = value;
      if (stakeholder.fiscalId === stakeholderFromCRC.fiscalId) {
        context.selectedStakeholderIsFromCRC = true;
      }
    });
  }

  emitCanceledSearch(info) {
    this.clickButton = true;
    this.editStakeInfo = null;
  }

  isSameNIF(info) {
    this.sameNIFStake = false; //
    setTimeout(() => {
      this.sameNIFStake = info;
    }, 0);
  }

  goToClientById() {
    let navigationExtras: NavigationExtras = {
      state: {
        isClient: this.isClient
      }
    };

    this.route.navigate(['/clientbyid/'], navigationExtras);
  }
}


