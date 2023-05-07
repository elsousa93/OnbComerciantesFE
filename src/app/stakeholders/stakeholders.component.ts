import { Component, OnInit } from '@angular/core';
import { IStakeholders, OutboundDocument, PostCorporateEntity, StakeholdersCompleteInformation } from './IStakeholders.interface';
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

  insertStakeholderEvent: Observable<IStakeholders>;
  updatedStakeholderEvent: Observable<{ stake: IStakeholders, idx: number }>;
  previousStakeholderEvent: Observable<number>;
  sameNIFEvent: Observable<string>;
  submissionClient: Client;
  existsStake: boolean = false;
  stakeholders: boolean;

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

  constructor(public modalService: BsModalService, private datePipe: DatePipe,
    private route: Router, private data: DataService, private fb: FormBuilder, private stakeholderService: StakeholderService,
    private comprovativoService: ComprovativosService, private tableInfo: TableInfoService, private clientService: ClientService, private logger: LoggerService, private translate: TranslateService, private processNrService: ProcessNumberService, private processService: ProcessService, private snackBar: MatSnackBar) {
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
    this.editStakeInfo = true;
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
    var stakeForm = this.editStakes.get("stake");
    var proxy = this.currentStakeholder.stakeholderAcquiring.isProxy != null ? this.currentStakeholder.stakeholderAcquiring.isProxy + '' : 'false';
    stakeForm.get("proxy").setValue(proxy);
    stakeForm.get("contractAssociation").setValue(this.currentStakeholder.stakeholderAcquiring.signType === 'CitizenCard' || this.currentStakeholder?.stakeholderAcquiring?.signType === 'DigitalCitizenCard' ? 'true' : 'false');

    if (this.currentStakeholder.stakeholderAcquiring.identificationDocument?.number == null) { //stakeForm.get("documentType") == null
      stakeForm.get("flagRecolhaEletronica").setValue(false);
      stakeForm.get("NIF").setValue(this.currentStakeholder.stakeholderAcquiring.fiscalId);

      if (this.currentStakeholder.stakeholderAcquiring.fiscalAddress?.country == null || this.currentStakeholder.stakeholderAcquiring.fiscalAddress?.country == "")
        stakeForm.get("Country").setValue("PT");
      else
        stakeForm.get("Country").setValue(this.currentStakeholder.stakeholderAcquiring.fiscalAddress?.country ?? this.currentStakeholder.stakeholderAcquiring["headquartersAddress"]["country"]);

      if (this.currentStakeholder.stakeholderAcquiring.fiscalAddress?.postalCode?.includes(" ")) {
        var arr = this.currentStakeholder.stakeholderAcquiring.fiscalAddress.postalCode.split(" ");
        stakeForm.get("ZIPCode").setValue(arr[0]);
      } else {
        stakeForm.get("ZIPCode").setValue(this.currentStakeholder.stakeholderAcquiring.fiscalAddress?.postalCode ?? this.currentStakeholder.stakeholderAcquiring["headquartersAddress"]["postalCode"] ?? '');
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
  }

  selectStake(info) {
    if (info.stakeholder != null) {
      if (info.clickedTable) {
        this.submit(true);
      }
      this.currentStakeholder = info.stakeholder;
      this.currentIdx = info.idx;
      this.logger.info("Selected stakeholder: " + JSON.stringify(this.currentStakeholder));
      this.logger.info("Selected stakeholder index: " + this.currentIdx);
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
        this.documents.forEach(doc => {
          if (docs[0]?.documentType === doc.code) {
            docs[0].documentType = doc.description;
          }
        });
      }));
    }
  }

  submit(clickedTable: boolean = false) {
    this.clickButton = null;
    var stakeForm = this.editStakes.controls["stake"];
    if (this.returned != 'consult') {
      if (this.editStakes.controls["stake"].valid) {
        if (this.currentStakeholder?.stakeholderAcquiring?.signType != null && this.currentStakeholder?.stakeholderAcquiring?.signType !== '') {
          this.currentStakeholder.stakeholderAcquiring.isProxy = (stakeForm.get("proxy").value === 'true');

          if (stakeForm.get("contractAssociation").value === 'true') {
            if (this.currentStakeholder?.stakeholderAcquiring?.signType !== 'DigitalCitizenCard') {
              this.currentStakeholder.stakeholderAcquiring.signType = 'CitizenCard';
            }
            this.contractAssociated = true;
          } else {
            this.currentStakeholder.stakeholderAcquiring.signType = 'NotSign';
          }

          if (this.currentStakeholder.stakeholderAcquiring.fiscalAddress === null || this.currentStakeholder.stakeholderAcquiring.fiscalAddress === undefined)
            this.currentStakeholder.stakeholderAcquiring.fiscalAddress = {};

          if (stakeForm.get("documentType") == null) {
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

          if (stakeForm.get("Country") == null) {
            if (this.currentStakeholder.stakeholderAcquiring.identificationDocument === null || this.currentStakeholder.stakeholderAcquiring.identificationDocument === undefined)
              this.currentStakeholder.stakeholderAcquiring.identificationDocument = {};
            this.currentStakeholder.stakeholderAcquiring.identificationDocument.type = stakeForm.get("documentType").value;
            this.currentStakeholder.stakeholderAcquiring.identificationDocument.number = stakeForm.get("identificationDocumentId").value;
            this.currentStakeholder.stakeholderAcquiring.identificationDocument.country = stakeForm.get("identificationDocumentCountry").value;
            this.currentStakeholder.stakeholderAcquiring.identificationDocument.expirationDate = stakeForm.get("documentCountry").value;
          }

          if (!this.editStakes.controls["stake"].pristine) {
            this.logger.info("Stakeholder data to update: " + JSON.stringify(this.currentStakeholder.stakeholderAcquiring));
            if (this.returned == null || (this.returned == 'edit' && (this.processId == null || this.processId == ''))) {
              this.stakeholderService.UpdateStakeholder(this.submissionId, this.currentStakeholder.stakeholderAcquiring.id, this.currentStakeholder.stakeholderAcquiring).subscribe(result => {
                this.logger.info("Updated stakeholder result: " + JSON.stringify(result));
                this.visitedStakes.push(this.currentStakeholder.stakeholderAcquiring.id);
                this.visitedStakes = Array.from(new Set(this.visitedStakes));
                if (!clickedTable) {
                  if (this.visitedStakes.length < (this.stakesLength)) {
                    this.emitUpdatedStakeholder(of({ stake: this.currentStakeholder, idx: this.currentIdx }));
                  } else {
                    if (this.contractAssociated) {
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
              this.processService.updateStakeholderProcess(this.processId, this.currentStakeholder.stakeholderAcquiring.id, this.currentStakeholder.stakeholderAcquiring).then(result => {
                this.logger.info("Updated stakeholder result: " + JSON.stringify(result.result));
                this.visitedStakes.push(this.currentStakeholder.stakeholderAcquiring.id);
                this.visitedStakes = Array.from(new Set(this.visitedStakes));
                if (!clickedTable) {
                  if (this.visitedStakes.length < (this.stakesLength)) {
                    this.emitUpdatedStakeholder(of({ stake: this.currentStakeholder, idx: this.currentIdx }));
                  } else {
                    if (this.contractAssociated) {
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
                if (this.contractAssociated) {
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
                this.visitedStakes.push(this.currentStakeholder.stakeholderAcquiring.id);
                this.visitedStakes = Array.from(new Set(this.visitedStakes));
                if (!clickedTable) {
                  if (this.visitedStakes.length < (this.stakesLength)) {
                    this.emitUpdatedStakeholder(of({ stake: this.currentStakeholder, idx: this.currentIdx }));
                  } else {
                    if (this.contractAssociated) {
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
                this.visitedStakes.push(this.currentStakeholder.stakeholderAcquiring.id);
                this.visitedStakes = Array.from(new Set(this.visitedStakes));
                if (!clickedTable) {
                  if (this.visitedStakes.length < (this.stakesLength)) {
                    this.emitUpdatedStakeholder(of({ stake: this.currentStakeholder, idx: this.currentIdx }));
                  } else {
                    if (this.contractAssociated) {
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
                if (this.contractAssociated) {
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

  loadStakeholderDocument(documentReference) {
    this.comprovativoService.viewDocument(documentReference);
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
}
