import { Component, OnInit } from '@angular/core';
import { IStakeholders, OutboundDocument, PostCorporateEntity, StakeholdersCompleteInformation } from './IStakeholders.interface';
import { stakeTypeList } from './stakeholderType';
import { docTypeListP } from './docType';
import { docTypeListE } from './docType';
import { NavigationExtras, Router } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { distinctUntilChanged, of, Subscription } from 'rxjs';
import { DataService } from '../nav-menu-interna/data.service';
import { StakeholderService } from './stakeholder.service';
import { ViewChild } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { ComprovativosService } from '../comprovativos/services/comprovativos.services';
import { DatePipe } from '@angular/common';
import { TableInfoService } from '../table-info/table-info.service';
import { DocumentSearchType } from '../table-info/ITable-info.interface';
import { Client } from '../client/Client.interface';
import { ClientService } from '../client/client.service';
import { LoggerService } from '../logger.service';
import { TranslateService } from '@ngx-translate/core';
import { ProcessNumberService } from '../nav-menu-presencial/process-number.service';
import { ProcessService } from '../process/process.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { dataCC } from '../citizencard/dataCC.interface';
import { FileAndDetailsCC } from '../readcard/fileAndDetailsCC.interface';
import { PostDocument } from '../submission/document/ISubmission-document';
import { SubmissionDocumentService } from '../submission/document/submission-document.service';

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
  @ViewChild('newModal') newModal;

  stakeholderList: StakeholdersCompleteInformation[] = [];
  insertStakeholderEvent: Observable<IStakeholders>;
  updatedStakeholderEvent: Observable<{ stake: IStakeholders, idx: number }>;
  previousStakeholderEvent: Observable<number>;
  sameNIFEvent: Observable<string>;
  submissionClient: Client;
  existsStake: boolean = false;
  stakeholders: boolean;
  incorrectNIF: boolean = false;
  incorrectNIFSize: boolean = false;
  incorrectNIPC: boolean = false;
  incorrectNIPCSize: boolean = false;

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

  stakeExists(bool) {
    this.existsStake = bool;
  }

  checkVisitedStakes(visitedStakes) {
    this.visitedStakes = visitedStakes;
  }

  checkContractAssociation(contractAssociation) {
    this.stakeholderList = contractAssociation;
    //this.contractAssociated = contractAssociation;
  }

  emitCCInfo(CCInfo) {
    this.dataCCcontents = CCInfo.dataCCContents;
    this.prettyPDF = CCInfo.prettyPDF;
  }

  currentStakeholder: StakeholdersCompleteInformation = {};
  currentIdx: number;
  allStakeholdersComprovativos = {}; 
  submissionId: string;
  processNumber: string;
  submissionStakeholders: IStakeholders[] = [];
  ListStakeholderType = stakeTypeList;
  TypeList;
  stakeholderType?: string = "";

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
  public visitedStakes: string[] = [];
  public returned: string;
  public subs: Subscription[] = [];

  editStakes: FormGroup;
  editStakeInfo: boolean;

  selectedStakeholderComprovativos: OutboundDocument[] = [];
  stakesLength: number = 0;
  documents: DocumentSearchType[];

  crcStakeholders: IStakeholders[] = [];
  selectedStakeholderIsFromCRC: boolean = false;
  sameNIFStake: boolean = false;

  isClient: boolean;
  contractAssociated: boolean = false;
  queueName: string = "";
  title: string;
  processId: string;
  updateProcessId: string;
  public prettyPDF: FileAndDetailsCC = null;
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
    notes: null,
    gender: null
  };

  constructor(public modalService: BsModalService, private datePipe: DatePipe,
    private route: Router, private data: DataService, private fb: FormBuilder, private stakeholderService: StakeholderService,
    private comprovativoService: ComprovativosService, private tableInfo: TableInfoService, private clientService: ClientService, private logger: LoggerService, private translate: TranslateService, private processNrService: ProcessNumberService, private processService: ProcessService, private snackBar: MatSnackBar, private documentService: SubmissionDocumentService) {
    this.subscription = this.processNrService.processId.subscribe(id => this.processId = id);
    this.subscription = this.processNrService.updateProcessId.subscribe(id => this.updateProcessId = id);
    if (this.route.getCurrentNavigation().extras.state) {
      this.editStakeInfo = this.route.getCurrentNavigation().extras.state["editStakeInfo"];
      this.isClient = this.route.getCurrentNavigation().extras.state["isClient"];
    }
    this.crcStakeholders = JSON.parse(localStorage.getItem('crcStakeholders'));
    this.returned = localStorage.getItem('returned');
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

    if (this.returned == 'consult') {
      this.processService.getMerchantFromProcess(this.processId).subscribe(res => {
        this.logger.info("Get process client by id result: " + JSON.stringify(res));
        this.submissionClient = res;
      });
    } else if (this.returned == 'edit' && this.processId != '' && this.processId != null) {
      this.processService.getUpdateProcessInfo(this.processId, this.updateProcessId).then(result => {
        this.submissionClient = result.result.merchant;
      });
    } else {
      this.clientService.GetClientByIdAcquiring(localStorage.getItem("submissionId")).then(client => {
        this.logger.info("Get client by id result: " + JSON.stringify(client));
        this.submissionClient = client;
      });
    }
  }

  redirectAddStakeholder() {
    this.clickButton = false;
    this.editStakeInfo = false;
  }

  redirectInfoStakeholder() {
    if (this.existsStake) {
      this.editStakeInfo = true;
    } else {
      this.snackBar.open(this.translate.instant('stakeholder.stakeExistsError'), '', {
        duration: 15000,
        panelClass: ['snack-bar']
      });
    }

  }

  refreshPage() {
    if ((this.currentIdx - 1) >= 0) {
      this.emitPreviousStakeholder(of(this.currentIdx));
    } else {
      this.editStakeInfo = null;
    }
  }

  ngOnInit(): void {
    this.subscription = this.data.currentStakeholders.subscribe(stakeholders => this.stakeholders = stakeholders);
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    this.subscription = this.data.currentQueueName.subscribe(queueName => {
      if (queueName != null) {
        this.translate.get('homepage.diaryPerformance').subscribe((translated: string) => {
          this.queueName = this.translate.instant('homepage.' + queueName);
          this.title = this.translate.instant('stakeholder.title');
        });
      }
    });
    if (!this.stakeholders) {
      this.data.updateData(false, 2, 1);
    } else {
      this.data.updateData(true, 2, 1);
    }
    this.submissionId = localStorage.getItem('submissionId');
    this.processNumber = localStorage.getItem("processNumber");
    this.getDocumentDescription([]);
    this.clickButton = true;
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

  selectStakeholder(stakeholder) {
    this.currentStakeholder = stakeholder;
    
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
    this.incorrectNIF = false;
    this.incorrectNIFSize = false;
    this.incorrectNIPC = false;
    this.incorrectNIPCSize = false;
    var stakeForm = this.editStakes.get("stake");
    var proxy = this.currentStakeholder.stakeholderAcquiring.isProxy != null ? this.currentStakeholder.stakeholderAcquiring.isProxy + '' : 'false';
    stakeForm.get("proxy").setValue(proxy);
    stakeForm.get("contractAssociation").setValue(this.currentStakeholder.stakeholderAcquiring.signType === 'CitizenCard' || this.currentStakeholder?.stakeholderAcquiring?.signType === 'DigitalCitizenCard' ? 'true' : 'false');

    stakeForm.get("NIF").valueChanges.pipe(distinctUntilChanged()).subscribe(val => {
      if (this.currentStakeholder?.stakeholderAcquiring?.signType != null && this.currentStakeholder?.stakeholderAcquiring?.signType !== '') {
        this.validateNIF(val);
      } else {
        this.validateNIPC(val);
      }
    });

    if (this.currentStakeholder.stakeholderAcquiring.identificationDocument?.number == null) { //stakeForm.get("documentType") == null
      stakeForm.get("flagRecolhaEletronica").setValue(false);
      stakeForm.get("NIF").setValue(this.currentStakeholder.stakeholderAcquiring.fiscalId);

      if ((this.currentStakeholder.stakeholderAcquiring.fiscalAddress?.country == null || this.currentStakeholder.stakeholderAcquiring.fiscalAddress?.country == "") && this.currentStakeholder?.stakeholderAcquiring["headquartersAddress"] == null)
        stakeForm.get("Country").setValue("PT");
      else
        stakeForm.get("Country").setValue(this.currentStakeholder.stakeholderAcquiring.fiscalAddress?.country ?? this.currentStakeholder.stakeholderAcquiring["headquartersAddress"]["country"]);

      if (this.currentStakeholder.stakeholderAcquiring.fiscalAddress?.postalCode?.includes(" ")) {
        var zipcode = this.currentStakeholder?.stakeholderAcquiring?.fiscalAddress?.postalCode?.replace(/\s/g, "");
        stakeForm.get("ZIPCode").setValue(zipcode);
      } else {
        stakeForm.get("ZIPCode").setValue(this.currentStakeholder.stakeholderAcquiring.fiscalAddress?.postalCode ?? this.currentStakeholder?.stakeholderAcquiring["headquartersAddress"]["postalCode"] ?? '');
      }

      stakeForm.get("Locality").setValue(this.currentStakeholder.stakeholderAcquiring.fiscalAddress?.postalArea ?? this.currentStakeholder.stakeholderAcquiring["headquartersAddress"]["postalArea"]);
      stakeForm.get("Address").setValue(this.currentStakeholder.stakeholderAcquiring.fiscalAddress?.address ?? this.currentStakeholder.stakeholderAcquiring["headquartersAddress"]["address"]);
    } else {
      stakeForm.get("flagRecolhaEletronica").setValue(false);
      if (stakeForm.get("identificationDocumentCountry")) {
        stakeForm.get("identificationDocumentCountry").setValue(this.currentStakeholder.stakeholderAcquiring.identificationDocument.country);
      }
      if (stakeForm.get("identificationDocumentValidUntil")) {
        stakeForm.get("identificationDocumentValidUntil").setValue(this.datePipe.transform(this.currentStakeholder?.stakeholderAcquiring?.identificationDocument?.expirationDate, 'dd-MM-yyyy'));
      }
      if (stakeForm.get("identificationDocumentValidUntil")) {
        stakeForm.get("identificationDocumentId").setValue(this.currentStakeholder.stakeholderAcquiring.identificationDocument.number);
      }
    }

    if (this.returned == 'consult') {
      this.editStakes.get("stake").disable();
    }
  }

  selectStake(info) {
    var context = this;
    if (info.stakeholder != null) {
      if (info.clickedTable) {
        this.submit(true);
      }
      context.selectedStakeholderComprovativos = [];
      this.currentStakeholder = info.stakeholder;
      this.currentIdx = info.idx;
      this.logger.info("Selected stakeholder: " + JSON.stringify(this.currentStakeholder));
      this.logger.info("Selected stakeholder index: " + this.currentIdx);
      if (this.currentStakeholder?.stakeholderAcquiring?.documents?.length > 0) {
        this.currentStakeholder.stakeholderAcquiring.documents.forEach(doc => {
          doc["uniqueReference"] = doc.id;
          doc["archiveSource"] = null;
          context.selectedStakeholderComprovativos.push(doc);
        });
        this.getDocumentDescription(this.selectedStakeholderComprovativos);
      }
      if (this.currentStakeholder.stakeholderOutbound != undefined) {
        this.selectedStakeholderComprovativos = this.currentStakeholder.stakeholderOutbound.supportingDocuments;
        this.getDocumentDescription(this.selectedStakeholderComprovativos);
      }
      setTimeout(() => this.setFormData(), 500);
    }
  }

  getDocumentDescription(docs: OutboundDocument[]) {
    if (docs != undefined) { 
      this.subs.push(this.tableInfo.GetDocumentsDescription().subscribe(result => {
        this.logger.info("Get documents description result: " + JSON.stringify(result));
        this.documents = result;
        if (docs.length > 0) {
          this.documents.forEach(doc => {
            docs.forEach(d => {
              if (doc.code == d.documentType)
                d.documentType = doc.description;
            });
          });
        }
      }));
    }
  }

  submit(clickedTable: boolean = false) {
    let updateAction = null;
    this.clickButton = null;
    var stakeForm = this.editStakes.controls["stake"];
    if (this.returned != 'consult') {
      if (this.editStakes.controls["stake"].valid && this.stakesLength > 0 && !this.incorrectNIF && !this.incorrectNIFSize && !this.incorrectNIPC && !this.incorrectNIPCSize) {
        if (this.currentStakeholder?.stakeholderAcquiring?.signType != null && this.currentStakeholder?.stakeholderAcquiring?.signType !== '') {
          this.currentStakeholder.stakeholderAcquiring.isProxy = (stakeForm.get("proxy").value === 'true');

          if (this.currentStakeholder.stakeholderAcquiring.fiscalId == null || this.currentStakeholder.stakeholderAcquiring.fiscalId == '')
            this.currentStakeholder.stakeholderAcquiring.fiscalId = stakeForm.get("NIF").value;

          if (stakeForm.get("contractAssociation").value === 'true') {
            if (this.currentStakeholder?.stakeholderAcquiring?.signType !== 'DigitalCitizenCard') {
              this.currentStakeholder.stakeholderAcquiring.signType = 'CitizenCard';
            }
          } else {
            this.currentStakeholder.stakeholderAcquiring.signType = 'NotSign';
          }

          if (this.currentStakeholder.stakeholderAcquiring.fiscalAddress === null || this.currentStakeholder.stakeholderAcquiring.fiscalAddress === undefined)
            this.currentStakeholder.stakeholderAcquiring.fiscalAddress = {};

          if (stakeForm.get("ZIPCode").value != null && stakeForm.get("ZIPCode").value != "") { //stakeForm.get("documentType") == null
            this.currentStakeholder.stakeholderAcquiring.fiscalAddress.address = stakeForm.get("Address").value;
            this.currentStakeholder.stakeholderAcquiring.fiscalAddress.country = stakeForm.get("Country").value;
            if (stakeForm.get("ZIPCode").value?.includes(" ")) {
              var arr = stakeForm.get("ZIPCode").value.split(" ");
              this.currentStakeholder.stakeholderAcquiring.fiscalAddress.postalCode = arr[0];
            } else {
              this.currentStakeholder.stakeholderAcquiring.fiscalAddress.postalCode = stakeForm.get("ZIPCode").value;
            }
            this.currentStakeholder.stakeholderAcquiring.fiscalAddress.postalArea = stakeForm.get("Locality").value;
            if (this.submissionClient.merchantType.toLocaleLowerCase() === 'entrepeneur' || this.submissionClient.merchantType === '02') {
              this.submissionClient.headquartersAddress.address = stakeForm.get("Address").value;
              this.submissionClient.headquartersAddress.country = stakeForm.get("Country").value;
              if (stakeForm.get("ZIPCode").value.includes(" ")) {
                var arr = stakeForm.get("ZIPCode").value.split(" ");
                this.submissionClient.headquartersAddress.postalCode = arr[0];
              } else {
                this.submissionClient.headquartersAddress.postalCode = stakeForm.get("ZIPCode").value;
              }
              this.submissionClient.headquartersAddress.postalArea = stakeForm.get("Locality").value;
              this.clientService.EditClient(this.submissionId, this.submissionClient).subscribe(result => { });
            }
          }

          if (stakeForm.get("identificationDocumentId")) { // stakeForm.get("Country") == null
            if (this.currentStakeholder.stakeholderAcquiring.identificationDocument === null || this.currentStakeholder.stakeholderAcquiring.identificationDocument === undefined)
              this.currentStakeholder.stakeholderAcquiring.identificationDocument = {};
            this.currentStakeholder.stakeholderAcquiring.identificationDocument.type = (stakeForm.get("documentType").value == "" || stakeForm.get("documentType").value == null) ? null : stakeForm.get("documentType").value; 
            if (this.currentStakeholder.stakeholderAcquiring.identificationDocument.type != '0018' && this.currentStakeholder.stakeholderAcquiring.identificationDocument.type != '0001') {
              this.currentStakeholder.stakeholderAcquiring.identificationDocument.type = this.documents.find(doc => doc.description == this.currentStakeholder.stakeholderAcquiring.identificationDocument.type).code;
            }
            this.currentStakeholder.stakeholderAcquiring.identificationDocument.number = (stakeForm.get("identificationDocumentId").value == "" || stakeForm.get("identificationDocumentId").value == null) ? null : stakeForm.get("identificationDocumentId").value;
            this.currentStakeholder.stakeholderAcquiring.identificationDocument.country = (stakeForm.get("identificationDocumentCountry").value == "" || stakeForm.get("identificationDocumentCountry").value == null) ? "PT" : stakeForm.get("identificationDocumentCountry").value;
            this.currentStakeholder.stakeholderAcquiring.identificationDocument.expirationDate = (stakeForm.get("identificationDocumentValidUntil").value == "" || stakeForm.get("identificationDocumentValidUntil").value == null) ? null : stakeForm.get("identificationDocumentValidUntil").value;
            if (this.currentStakeholder?.stakeholderAcquiring?.identificationDocument?.expirationDate?.includes("-") && this.currentStakeholder?.stakeholderAcquiring?.identificationDocument?.expirationDate?.split("-")[0].length == 2) {
              var split = this.currentStakeholder.stakeholderAcquiring.identificationDocument.expirationDate.split("-");
              this.currentStakeholder.stakeholderAcquiring.identificationDocument.expirationDate = this.datePipe.transform(split[1] + '-' + split[0] + '-' + split[2], 'yyyy-MM-dd');
            }
            //adicionar documento
            if (this.prettyPDF != null) {
              if (this.dataCCcontents?.notes != null || this.dataCCcontents?.notes != "") {
                var assinatura = "Sabe assinar";
                if (this.dataCCcontents?.notes?.toLowerCase().includes("não sabe assinar") || this.dataCCcontents?.notes?.toLowerCase().includes("não pode assinar")) {
                  assinatura = "Não sabe assinar";
                }
              }
              //Colocar comprovativo do CC na Submissao
              var documentCC: PostDocument = {
                documentType: '0001',
                documentPurpose: 'Identification',
                file: {
                  binary: this.prettyPDF?.file,
                  fileType: 'PDF',
                },
                validUntil: new Date(this.prettyPDF?.expirationDate).toISOString(),
                data: {
                  fullName: this.dataCCcontents?.nameCC,
                  documentNumber: this.dataCCcontents?.cardNumberCC?.replace(/\s/g, ""),
                  fiscalNumber: this.dataCCcontents?.nifCC,
                  gender: this.dataCCcontents?.gender,
                  birthDate: this.dataCCcontents?.birthdateCC,
                  validUntil: this.dataCCcontents?.expiricyDateCC,
                  canSign: assinatura == "Sabe assinar" ? true : false,
                  country: this.dataCCcontents?.countryCC,
                  address: this.dataCCcontents?.addressCC,
                  postalArea: this.dataCCcontents?.localityCC,
                  postalCode: this.dataCCcontents?.postalCodeCC
                }
              };
              this.logger.info("Document to add: " + JSON.stringify(documentCC));
              this.stakeholderService.AddNewDocumentStakeholder(this.submissionId, this.currentStakeholder.stakeholderAcquiring.id, documentCC).subscribe(res => {
                this.logger.info("Added document to stakeholder " + JSON.stringify(res));
                this.prettyPDF = null;
                this.dataCCcontents = null;
              });
            }
          }

          if (!this.editStakes.controls["stake"].pristine) {
            this.logger.info("Stakeholder data to update: " + JSON.stringify(this.currentStakeholder.stakeholderAcquiring));
            if (this.returned == null || (this.returned == 'edit' && (this.processId == null || this.processId == ''))) {
              this.stakeholderService.UpdateStakeholder(this.submissionId, this.currentStakeholder.stakeholderAcquiring.id, this.currentStakeholder.stakeholderAcquiring).subscribe(result => {
                this.logger.info("Updated stakeholder result: " + JSON.stringify(result));
                this.visitedStakes.push(result.id);
                this.visitedStakes = Array.from(new Set(this.visitedStakes));
                if (!clickedTable) {
                  if (this.visitedStakes.length < (this.stakesLength)) {
                    this.emitUpdatedStakeholder(of({ stake: this.currentStakeholder, idx: this.currentIdx }));
                  } else {
                    var contractAssociated = this.stakeholderList.find(value => value?.stakeholderAcquiring?.signType == "DigitalCitizenCard" || value?.stakeholderAcquiring?.signType == "CitizenCard")
                    if (contractAssociated != undefined) {
                      this.data.changeStakeholders(true);
                      this.data.updateData(true, 2);
                      this.logger.info("Redirecting to Store Comp page");
                      this.route.navigate(['store-comp']);
                    } else {
                      this.snackBar.open(this.translate.instant('stakeholder.signError'), '', {
                        duration: 15000,
                        panelClass: ['snack-bar']
                      });
                    }
                  }
                }
              }, error => {
                this.logger.error(error, "", "Error updating stakeholder");
              });
            } else {
              if (this.updateProcessId != null && this.updateProcessId != "") {
                updateAction = this.currentStakeholder.stakeholderAcquiring["updateProcessAction"];
                this.currentStakeholder.stakeholderAcquiring["updateProcessAction"] = null;
              }
              let o = Object.fromEntries(Object.entries(this.currentStakeholder.stakeholderAcquiring).filter(([_, v]) => v != null));
              this.processService.updateStakeholderProcess(this.processId, this.currentStakeholder.stakeholderAcquiring.id, o).then(result => {
                this.logger.info("Updated stakeholder result: " + JSON.stringify(result.result));
                this.visitedStakes.push(result.result.id);
                this.visitedStakes = Array.from(new Set(this.visitedStakes));
                if (this.updateProcessId != null && this.updateProcessId != "") {
                  this.currentStakeholder.stakeholderAcquiring["updateProcessAction"] = updateAction;
                }
                if (!clickedTable) {
                  if (this.visitedStakes.length < (this.stakesLength)) {
                    this.emitUpdatedStakeholder(of({ stake: this.currentStakeholder, idx: this.currentIdx }));
                  } else {
                    var contractAssociated = this.stakeholderList.find(value => value?.stakeholderAcquiring?.signType == "DigitalCitizenCard" || value?.stakeholderAcquiring?.signType == "CitizenCard")
                    if (contractAssociated != undefined) {
                      this.data.changeStakeholders(true);
                      this.data.updateData(true, 2);
                      this.logger.info("Redirecting to Store Comp page");
                      this.route.navigate(['store-comp']);
                    } else {
                      this.snackBar.open(this.translate.instant('stakeholder.signError'), '', {
                        duration: 15000,
                        panelClass: ['snack-bar']
                      });
                    }
                  }
                }
              }, error => {
                this.logger.error(error, "", "Error updating stakeholder");
              });
            }
          } else {
            this.visitedStakes.push(this.currentStakeholder.stakeholderAcquiring.id);
            this.visitedStakes = Array.from(new Set(this.visitedStakes));
            if (!clickedTable) {
              if (this.visitedStakes.length < (this.stakesLength)) {
                this.emitUpdatedStakeholder(of({ stake: this.currentStakeholder, idx: this.currentIdx }));
              } else {
                var contractAssociated = this.stakeholderList.find(value => value?.stakeholderAcquiring?.signType == "DigitalCitizenCard" || value?.stakeholderAcquiring?.signType == "CitizenCard")
                if (contractAssociated != undefined) {
                  this.data.changeStakeholders(true);
                  this.data.updateData(true, 2);
                  this.logger.info("Redirecting to Store Comp page");
                  this.route.navigate(['store-comp']);
                } else {
                  this.snackBar.open(this.translate.instant('stakeholder.signError'), '', {
                    duration: 15000,
                    panelClass: ['snack-bar']
                  });
                }
              }
            }
          }
        } else {
          var corporateEntity: PostCorporateEntity = {};
          if (this.currentStakeholder.stakeholderAcquiring["headquartersAddress"] === null || this.currentStakeholder.stakeholderAcquiring["headquartersAddress"] === undefined)
            this.currentStakeholder.stakeholderAcquiring["headquartersAddress"] = {};
          this.currentStakeholder.stakeholderAcquiring["headquartersAddress"]["address"] = stakeForm.get("Address").value;
          this.currentStakeholder.stakeholderAcquiring["headquartersAddress"]["country"] = stakeForm.get("Country").value;
          this.currentStakeholder.stakeholderAcquiring["headquartersAddress"]["postalArea"] = stakeForm.get("Locality").value;
          this.currentStakeholder.stakeholderAcquiring["headquartersAddress"]["postalCode"] = stakeForm.get("ZIPCode").value;
          corporateEntity.headquartersAddress = {};
          corporateEntity.headquartersAddress.address = stakeForm.get("Address").value;
          corporateEntity.headquartersAddress.country = stakeForm.get("Country").value;
          corporateEntity.headquartersAddress.postalArea = stakeForm.get("Locality").value;
          corporateEntity.headquartersAddress.postalCode = stakeForm.get("ZIPCode").value;
          corporateEntity.clientId = this.currentStakeholder.stakeholderAcquiring.clientId;
          corporateEntity.fiscalId = this.currentStakeholder.stakeholderAcquiring.fiscalId;
          corporateEntity.legalName = this.currentStakeholder.stakeholderAcquiring["legalName"];
          corporateEntity.shortName = this.currentStakeholder.stakeholderAcquiring.shortName;

          if (!this.editStakes.controls["stake"].pristine) {
            this.logger.info("Stakeholder data to update: " + JSON.stringify(this.currentStakeholder.stakeholderAcquiring));
            if (this.returned == null || (this.returned == 'edit' && (this.processId == null || this.processId == ''))) {
              this.stakeholderService.UpdateCorporateEntity(this.submissionId, this.currentStakeholder.stakeholderAcquiring.id, corporateEntity).then(result => {
                this.logger.info("Updated stakeholder result: " + JSON.stringify(result));
                this.visitedStakes.push(result.result.id);
                this.visitedStakes = Array.from(new Set(this.visitedStakes));
                if (!clickedTable) {
                  if (this.visitedStakes.length < (this.stakesLength)) {
                    this.emitUpdatedStakeholder(of({ stake: this.currentStakeholder, idx: this.currentIdx }));
                  } else {
                    var contractAssociated = this.stakeholderList.find(value => value?.stakeholderAcquiring?.signType == "DigitalCitizenCard" || value?.stakeholderAcquiring?.signType == "CitizenCard")
                    if (contractAssociated != undefined) {
                      this.data.changeStakeholders(true);
                      this.data.updateData(true, 2);
                      this.logger.info("Redirecting to Store Comp page");
                      this.route.navigate(['store-comp']);
                    } else {
                      this.snackBar.open(this.translate.instant('stakeholder.signError'), '', {
                        duration: 15000,
                        panelClass: ['snack-bar']
                      });
                    }
                  }
                }
              }, error => {
                this.logger.error(error, "", "Error updating stakeholder");
              });
            } else {

              this.processService.updateCorporateEntity(this.processId, this.currentStakeholder.stakeholderAcquiring.id, corporateEntity).then(result => {
                this.logger.info("Updated stakeholder result: " + JSON.stringify(result.result));
                this.visitedStakes.push(result.result.id);
                this.visitedStakes = Array.from(new Set(this.visitedStakes));
                if (!clickedTable) {
                  if (this.visitedStakes.length < (this.stakesLength)) {
                    this.emitUpdatedStakeholder(of({ stake: this.currentStakeholder, idx: this.currentIdx }));
                  } else {
                    var contractAssociated = this.stakeholderList.find(value => value?.stakeholderAcquiring?.signType == "DigitalCitizenCard" || value?.stakeholderAcquiring?.signType == "CitizenCard")
                    if (contractAssociated != undefined) {
                      this.data.changeStakeholders(true);
                      this.data.updateData(true, 2);
                      this.logger.info("Redirecting to Store Comp page");
                      this.route.navigate(['store-comp']);
                    } else {
                      this.snackBar.open(this.translate.instant('stakeholder.signError'), '', {
                        duration: 15000,
                        panelClass: ['snack-bar']
                      });
                    }
                  }
                }
              }, error => {
                this.logger.error(error, "", "Error updating stakeholder");
              });
            }
          } else {
            this.visitedStakes.push(this.currentStakeholder.stakeholderAcquiring.id);
            this.visitedStakes = Array.from(new Set(this.visitedStakes));
            if (!clickedTable) {
              if (this.visitedStakes.length < (this.stakesLength)) {
                this.emitUpdatedStakeholder(of({ stake: this.currentStakeholder, idx: this.currentIdx }));
              } else {
                var contractAssociated = this.stakeholderList.find(value => value?.stakeholderAcquiring?.signType == "DigitalCitizenCard" || value?.stakeholderAcquiring?.signType == "CitizenCard")
                if (contractAssociated != undefined) {
                  this.data.changeStakeholders(true);
                  this.data.updateData(true, 2);
                  this.logger.info("Redirecting to Store Comp page");
                  this.route.navigate(['store-comp']);
                } else {
                  this.snackBar.open(this.translate.instant('stakeholder.signError'), '', {
                    duration: 15000,
                    panelClass: ['snack-bar']
                  });
                }
              }
            }
          }
        }
      } else {
        this.openAccordeons();
        this.editStakes.markAllAsTouched();
        this.snackBar.open(this.translate.instant('generalKeywords.formInvalid'), '', {
          duration: 15000,
          panelClass: ['snack-bar']
        });
      }
    } else {
      if (!clickedTable) {
        this.data.changeStakeholders(true);
        this.data.updateData(true, 2);
        this.logger.info("Redirecting to Store Comp page");
        this.route.navigate(['store-comp']);
      }
    }
    this.editStakes.controls["stake"].markAsPristine();
  }

  openAccordeons() {
    document.getElementById("flush-collapseTwo").className = "accordion-collapse collapse show";
    document.getElementById("accordionButton2").className = "accordion1-button";
  }

  getStakesListLength(value) {
    if (this.stakesLength != 0 && value != 1) {
      this.stakesLength = value;
      if (this.stakesLength == 0) {
        this.data.changeStakeholders(false);
        this.data.updateData(false, 2);
      } else {
        this.data.changeStakeholders(true);
        this.data.updateData(true, 2);
      }
    } else {
      this.stakesLength = value;
    }
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

  loadStakeholderDocument(documentReference, archiveSource) {
    if (archiveSource != null) {
      this.documentService.GetDocumentImageOutbound(documentReference, "por mudar", "por mudar", 'pdf').subscribe(result => {
        this.logger.info("Get document image outbound result: " + JSON.stringify(result));
        this.b64toBlob(result.binary, 'application/pdf', 512);
      });
    } else {
      if (this.returned == null || this.returned == 'edit' && (this.processId == '' || this.processId == null)) {
        this.documentService.GetDocumentImage(localStorage.getItem("submissionId"), documentReference).then(async result => {
          this.logger.info("Get document image outbound: " + JSON.stringify(result));
          result.blob().then(data => {
            var blob = new Blob([data], { type: 'application/pdf' });
            let url = window.URL.createObjectURL(blob);
            window.open(url, '_blank',
              `margin: auto;
              width: 50%;
              padding: 10px;
              text-align: center;
              border: 3px solid green;`);
          });
        });
      } else {
        this.processService.getDocumentImageFromProcess(this.processId, documentReference).then(async result => {
          this.logger.info("Get document image result: " + JSON.stringify(result));
          result.blob().then(data => {
            var blob = new Blob([data], { type: 'application/pdf' });
            let url = window.URL.createObjectURL(blob);
            window.open(url, '_blank',
              `margin: auto;
              width: 50%;
              padding: 10px;
              text-align: center;
              border: 3px solid green;`);
          });
        });
      }
    }
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
    this.logger.info("Redirecting to Client by id page");
    this.route.navigate(['/clientbyid/']);
  }

  openCancelPopup() {
    //this.cancelModalRef = this.modalService.show(this.cancelModal);
    this.route.navigate(['/']);
  }

  closeCancelPopup() {
    //this.cancelModalRef?.hide();
  }

  confirmCancel() {
    //var context = this;
    //var processNumber = "";
    //this.processNrService.processNumber.subscribe(res => processNumber = res);
    //var encodedCode = encodeURIComponent(processNumber);
    //var baseUrl = this.configuration.getConfig().acquiringAPIUrl;
    //var url = baseUrl + 'process?number=' + encodedCode;
    //this.processService.advancedSearch(url, 0, 1).subscribe(result => {
    //  context.queueService.markToCancel(result.items[0].processId, context.authService.GetCurrentUser().userName).then(res => {
    //    context.closeCancelPopup();
    //    context.route.navigate(['/']);
    //  });
    //});
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
}
