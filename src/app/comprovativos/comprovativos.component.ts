import { HttpClient } from '@angular/common/http';
import { AfterViewInit } from '@angular/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { Client } from '../client/Client.interface';
import { ClientService } from '../client/client.service';
import { DataService } from '../nav-menu-interna/data.service';
import { StakeholderService } from '../stakeholders/stakeholder.service';
import { PostDocument } from '../submission/document/ISubmission-document';
import { SubmissionDocumentService } from '../submission/document/submission-document.service';
import { SubmissionGetTemplate, SubmissionPutTemplate } from '../submission/ISubmission.interface';
import { SubmissionService } from '../submission/service/submission-service.service';
import { ComprovativosTemplate, DocumentPurpose, IComprovativos, PurposeDocument, RequiredDocumentPurpose, RequiredDocuments } from './IComprovativos.interface';
import { ComprovativosService } from './services/comprovativos.services';
import { LoggerService } from 'src/app/logger.service';
import { TableInfoService } from '../table-info/table-info.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../services/auth.service';
import { DatePipe } from '@angular/common';
import { DocumentSearchType, LegalNature } from '../table-info/ITable-info.interface';
import { StoreService } from '../store/store.service';
import { ShopDetailsAcquiring } from '../store/IStore.interface';
import { IStakeholders } from '../stakeholders/IStakeholders.interface';
import { ProcessNumberService } from '../nav-menu-presencial/process-number.service';
import { ProcessService } from '../process/process.service';
import { QueuesService } from '../queues-detail/queues.service';
import { FormGroup, FormControl } from '@angular/forms';
@Component({
  selector: 'app-comprovativos',
  templateUrl: './comprovativos.component.html',
  providers: [DatePipe]
})
export class ComprovativosComponent implements OnInit, AfterViewInit {
  public comprovativos: IComprovativos[] = [];
  public compToShow: { tipo: string, interveniente: string, dataValidade: string, dataEntrada: string, status: string };
  public compsToShow: ComprovativosTemplate[] = [];
  public client: Client;
  public result: any;
  public id: number = 0;
  public clientNr: number = 0;
  submissionId: string;
  fakeArray = new Array(9);
  crcCode: string = "";

  public subscription: Subscription;
  public currentPage: number;
  public map: Map<number, boolean>;

  pageName = "";
  file?: File;
  files?: File[] = [];
  fileToDelete?: any;
  localUrl: any;
  fileName: any;
  urlImage: string | any;
  mostrar: boolean = false;
  deleteModalRef: BsModalRef | undefined;
  checkListModalRef: BsModalRef | undefined;
  firstSubmissionModalRef: BsModalRef | undefined;
  compClientId;
  comerciante: string;
  comprovantes: string;
  intervenientes: string;
  lojas: string;
  oferta: string;
  info: string;
  filename: any;
  clientId: any;
  documentID: string;

  @ViewChild('deleteModal') deleteModal;
  @ViewChild('checkListDocs') checkListDocs;
  @ViewChild('firstSubmissionModal') firstSubmissionModal;

  validatedDocuments: boolean = false;
  submission: SubmissionGetTemplate = {};
  submissionClient: any = {};
  stakeholdersList: IStakeholders[] = [];
  shopList: ShopDetailsAcquiring[] = [];

  public returned: string;
  updatedComps: boolean;
  requiredDocuments: RequiredDocuments;
  documentPurposes: PurposeDocument[];
  legalNatures: LegalNature[];
  legalNature: string;
  mandatoryDocs: string;
  documents: DocumentSearchType[];
  wnd: any = window;
  queueName: string = "";
  title: string;
  merchantOutbound: any = null;
  stakeOutbound: any = null;
  shopOutbound: any = null;
  corporateOutbound: any = null;
  privateOutbound: any = null;
  processId: string;
  stakePurposeList: string[] = [];
  form: FormGroup;
  updateProcessId: string;
  processInfo: any;
  processType: string;
  @ViewChild('cancelModal') cancelModal;
  cancelModalRef: BsModalRef | undefined;
  documentListAux = [];

  b64toBlob(b64Data: any, contentType: string, sliceSize: number, download: boolean = false) {
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
    if (download) {
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'comprovativo';
      link.click();
    } else {
      window.open(blobUrl, '_blank',
        `margin: auto;
      width: 50%;
      padding: 10px;
      text-align: center;
      border: 3px solid green;` );
    }
  }

  constructor(private logger: LoggerService, private translate: TranslateService, private snackBar: MatSnackBar, public http: HttpClient, private route: Router, private router: ActivatedRoute,
    private modalService: BsModalService, private datepipe: DatePipe, private comprovativoService: ComprovativosService, private tableInfo: TableInfoService, private data: DataService, private submissionService: SubmissionService, private clientService: ClientService, private stakeholderService: StakeholderService, private documentService: SubmissionDocumentService, private authService: AuthService, private shopService: StoreService, private processNrService: ProcessNumberService, private processService: ProcessService, private queuesInfo: QueuesService) {
    var context = this;

    this.form = new FormGroup({
      observations: new FormControl('')
    });

    if (localStorage.getItem("documents") != null) {
      var context = this;
      var fileBinaries = JSON.parse(localStorage.getItem("documents"));;
      fileBinaries.forEach(value => {
        var blob = context.convertToBlob(value, 'application/pdf', 512);
        context.selectFile({ target: { files: [blob] } }, null);
      });
    }

    this.ngOnInit();
    const now = new Date();
    var latest_date = context.datepipe.transform(now, 'dd-MM-yyyy').toString();
    this.tableInfo.GetDocumentsDescription().subscribe(result => {
      this.logger.info('Get all documents description result: ' + JSON.stringify(result));
      this.documents = result;
    });

    this.tableInfo.GetAllLegalNatures().then(result => {
      this.logger.info('Get all legal natures result: ' + JSON.stringify(result));
      this.legalNatures = result.result;
    });

    this.tableInfo.GetAllDocumentPurposes().subscribe(result => {
      this.logger.info('Get all documents purposes result: ' + JSON.stringify(result));
      context.documentPurposes = result;
    });

    if (this.processId != '' && this.processId != null && this.returned != null) {
      if (this.returned == 'consult') {
        let promise = new Promise((resolve, reject) => {
          var storeLength = 0;
          var stakeLength = 0;
          var submissionDocLength = 0;
          var corporateLength = 0;
          var length = 0;
          this.processService.getDocumentFromProcess(this.processId).subscribe(result => {
            if (result.length > 0) {
              result.forEach(doc => {
                context.documentListAux.push(doc);
              });
            }
          this.processService.getMerchantFromProcess(this.processId).subscribe(c => {
            this.submissionClient = c;
            this.getLegalNatureDescription();
            this.logger.info('Get client: ' + JSON.stringify(c));
            this.submissionClient.documents.forEach(val => {
              var isAnnulled = context.documentListAux?.find(doc => doc.id == val.id)?.isAnnulled;
              var found = context.compsToShow.find(v => v.id == val.id);
              //if (found == undefined) {
              //  context.compsToShow.push({
              //    id: val.id,
              //    type: "pdf",
              //    expirationDate: context.datepipe.transform(val.validUntil, 'dd-MM-yyyy'),
              //    stakeholder: context.submissionClient.commercialName,
              //    status: isAnnulled ? 'Anulado' : "Ativo",
              //    uploadDate: latest_date,
              //    file: val?.id,
              //    documentPurpose: val.purposes[0],
              //    documentType: val.documentType
              //  });
              //} else {
              //  found.stakeholder = context.submissionClient.commercialName;
              //  found.status = isAnnulled ? 'Anulado' : "Ativo";
              //}
            });

            context.processService.getStakeholdersFromProcess(context.processId).then(result => {
              var stakes = result.result;
              stakeLength = stakes.length;
              stakes.forEach(stake => {
                context.processService.getStakeholderByIdFromProcess(context.processId, stake.id).subscribe(result => {
                  context.logger.info("Get stakeholder outbound: " + JSON.stringify(result));
                  var stake = result;
                  context.stakeholdersList.push(stake);
                  length++;
                  stake.documents.forEach(val => {
                    var isAnnulled = context.documentListAux?.find(doc => doc.id == val.id)?.isAnnulled;
                    var found = context.compsToShow.find(v => v.id == val.id);
                    //if (found == undefined) {
                    //  context.compsToShow.push({
                    //    id: val.id,
                    //    type: "pdf",
                    //    expirationDate: context.datepipe.transform(val.validUntil, 'dd-MM-yyyy'),
                    //    stakeholder: stake.fullName,
                    //    status: isAnnulled ? 'Anulado' : "Ativo",
                    //    uploadDate: latest_date,
                    //    file: val?.id as any,
                    //    documentPurpose: val.purposes[0],
                    //    documentType: val.documentType
                    //  });
                    //} else {
                    //  found.stakeholder = stake.fullName;
                    //  found.status = isAnnulled ? 'Anulado' : "Ativo";
                    //}
                  });
                  if (length === storeLength + stakeLength + submissionDocLength + corporateLength) {
                    resolve(null);
                  }
                }, error => {
                  this.logger.error(error, "", "Erro getting stakeholder");
                });
              });
            });

            context.queuesInfo.getProcessShopsList(context.processId).then(res => {
              var shops = res.result;
              storeLength = shops.length;
              shops.forEach(function (value, index) {
                context.queuesInfo.getProcessShopDetails(context.processId, value.id).then(shop => {
                  context.logger.info("Get shop from submission: " + JSON.stringify(shop));
                  context.shopList.push(shop.result);
                  length++;
                  if (shop.result.documents.length > 0) {
                    var found = context.compsToShow.find(val => val.id == shop?.result?.documents[0]?.id);
                    var isAnnulled = context.documentListAux?.find(doc => doc.id == shop?.result?.documents[0]?.id)?.isAnnulled;
                    //if (found == undefined) {
                    //  context.compsToShow.push({
                    //    id: shop.result.documents[0].id,
                    //    type: "pdf",
                    //    expirationDate: context.datepipe.transform(shop.result.documents[0].validUntil, 'dd-MM-yyyy'),
                    //    stakeholder: shop.result.name,
                    //    status: isAnnulled ? 'Anulado' : "Ativo",
                    //    uploadDate: latest_date,
                    //    file: shop.result.documents[0]?.id,
                    //    documentPurpose: shop.result.documents[0].purposes[0],
                    //    documentType: shop.result.documents[0].documentType
                    //  });
                    //} else {
                    //  found.stakeholder = shop.result.name;
                    //  found.status = isAnnulled ? 'Anulado' : "Ativo";
                    //}
                  }
                  if (length === storeLength + stakeLength + submissionDocLength + corporateLength) {
                    resolve(null);
                  }
                });
              });
            });

            context.processService.getProcessEntities(context.processId).then(corporate => {
              corporateLength = corporate.result.length;
              corporate.result.forEach(function (value, index) {
                if (value.entityType == 'CorporateEntity') {
                  context.processService.getProcessCorporateEntity(context.processId, value.id).then(r => {
                    var corp = r.result;
                    context.stakeholdersList.push(corp);
                    length++;
                    corp.documents.forEach(val => {
                      var isAnnulled = context.documentListAux?.find(doc => doc.id == val.id)?.isAnnulled;
                      var found = context.compsToShow.find(v => v.id == val.id);
                      //if (found == undefined) {
                      //  context.compsToShow.push({
                      //    id: val.id,
                      //    type: "pdf",
                      //    expirationDate: context.datepipe.transform(val.validUntil, 'dd-MM-yyyy'),
                      //    stakeholder: corp.legalName,
                      //    status: isAnnulled ? 'Anulado' : "Ativo",
                      //    uploadDate: latest_date,
                      //    file: val?.id as any,
                      //    documentPurpose: val.purposes[0],
                      //    documentType: val.documentType
                      //  });
                      //} else {
                      //  found.stakeholder = corp.legalName;
                      //  found.status = isAnnulled ? 'Anulado' : "Ativo";
                      //}
                    });
                    if (length === storeLength + stakeLength + submissionDocLength + corporateLength) {
                      resolve(null);
                    }

                  }, error => {
                    this.logger.error(error, "", "Erro getting corporate entity");
                  });
                }
                if (value.entityType == 'PrivateEntity') {
                  context.processService.getProcessPrivateEntity(context.processId, value.id).then(r => {
                    var priv = r.result;
                    context.stakeholdersList.push(priv);
                    length++;
                    priv.documents.forEach(val => {
                      var isAnnulled = context.documentListAux?.find(doc => doc.id == val.id)?.isAnnulled;
                      var found = context.compsToShow.find(v => v.id == val.id);
                      //if (found == undefined) {
                      //  context.compsToShow.push({
                      //    id: val.id,
                      //    type: "pdf",
                      //    expirationDate: context.datepipe.transform(val.validUntil, 'dd-MM-yyyy'),
                      //    stakeholder: corp.legalName,
                      //    status: isAnnulled ? 'Anulado' : "Ativo",
                      //    uploadDate: latest_date,
                      //    file: val?.id as any,
                      //    documentPurpose: val.purposes[0],
                      //    documentType: val.documentType
                      //  });
                      //} else {
                      //  found.stakeholder = corp.legalName;
                      //  found.status = isAnnulled ? 'Anulado' : "Ativo";
                      //}
                    });
                    if (length === storeLength + stakeLength + submissionDocLength + corporateLength) {
                      resolve(null);
                    }

                  }, error => {
                    this.logger.error(error, "", "Erro getting corporate entity");
                  });
                }
              });
            })

            context.processService.getDocumentFromProcess(context.processId).subscribe(document => {
              document.forEach(function (value, index) {
                context.processService.getDocumentDetailsFromProcess(context.processId, value.id).subscribe(doc => {
                  length++;
                  var found = context.compsToShow.find(val => val.id == doc.id);
                  if (found == undefined) {
                    context.compsToShow.push({
                      id: doc.id,
                      type: "pdf",
                      expirationDate: context.datepipe.transform(doc.validUntil, 'dd-MM-yyyy'),
                      stakeholder: value.entityName == null ? "desconhecido" : value.entityName,
                      status: value.isAnnulled ? 'Anulado' : "Ativo",
                      uploadDate: latest_date,
                      file: doc.id,
                      documentPurpose: null,
                      documentType: value.type
                    });
                  } else {
                    found.status = value.isAnnulled ? 'Anulado' : "Ativo";
                  }
                  if (length === storeLength + stakeLength + submissionDocLength + corporateLength) {
                    resolve(null);
                  }
                });
              });
            });
          });
        });
        }).finally(() => {
          context.comprovativoService.getProcessRequiredDocuments(context.processId).then(result => {
            context.logger.info("Get the submission's required documents: " + JSON.stringify(result));
            context.requiredDocuments = result.result;
            context.requiredDocuments.requiredDocumentPurposesStakeholders.forEach(value => {
              value.documentPurposes.forEach(val => {
                if (val.documentState !== 'NotApplicable') {
                  context.stakePurposeList.push(val.purpose);
                  context.stakePurposeList = Array.from(new Set(context.stakePurposeList));
                  if (val.documentState == 'NotExists')
                    val["existsOutbound"] = false;
                  else
                    val["existsOutbound"] = true;
                }
              });
            });

            context.requiredDocuments.requiredDocumentPurposesCorporateEntity.forEach(corporate => {
              corporate.documentPurposes.forEach(val => {
                if (val.documentState !== 'NotApplicable') {
                  context.stakePurposeList.push(val.purpose);
                  context.stakePurposeList = Array.from(new Set(context.stakePurposeList));
                  if (val.documentState == 'NotExists')
                    val["existsOutbound"] = false;
                  else
                    val["existsOutbound"] = true;
                }
              });
            });

            context.requiredDocuments.requiredDocumentPurposesPrivateEntity.forEach(value => {
              value.documentPurposes.forEach(val => {
                if (val.documentState !== 'NotApplicable') {
                  context.stakePurposeList.push(val.purpose);
                  context.stakePurposeList = Array.from(new Set(context.stakePurposeList));
                  if (val.documentState == 'NotExists')
                    val["existsOutbound"] = false;
                  else
                    val["existsOutbound"] = true;
                }
              });
            });

            context.requiredDocuments.requiredDocumentPurposesMerchants.forEach(value => {
              value.documentPurposes.forEach(val => {
                if (val.documentState !== 'NotApplicable') {
                  if (val.documentState == 'NotExists')
                    val["existsOutbound"] = false;
                  else
                    val["existsOutbound"] = true;
                }
              });
            });

            context.requiredDocuments.requiredDocumentPurposesShops.forEach(value => {
              value.documentPurposes.forEach(val => {
                if (val.documentState !== 'NotApplicable') {
                  if (val.documentState == 'NotExists')
                    val["existsOutbound"] = false;
                  else
                    val["existsOutbound"] = true;
                }
              });
            });
          });
        });
      } else {
        this.processService.getDocumentFromProcess(this.processId).subscribe(result => {
          if (result.length > 0) {
            result.forEach(function (value, index) {
              context.processService.getDocumentDetailsFromProcess(context.processId, value.id).subscribe(doc => {
                length++;
                var found = context.compsToShow.find(val => val.id == doc.id);
                if (found == undefined) {
                  context.compsToShow.push({
                    id: doc.id,
                    type: "pdf",
                    expirationDate: context.datepipe.transform(doc.validUntil, 'dd-MM-yyyy'),
                    stakeholder: value.entityName == null ? "desconhecido" : value.entityName,
                    status: value.isAnnulled ? 'Anulado' : "Ativo",
                    uploadDate: latest_date,
                    file: doc.id,
                    documentPurpose: null,
                    documentType: value.type
                  });
                } else {
                  found.status = value.isAnnulled ? 'Anulado' : "Ativo";
                }
              });
            });
            result.forEach(doc => {
              context.documentListAux.push(doc);
            });
          }
        this.processService.getUpdateProcessInfo(this.processId, this.updateProcessId).then(result => {
          this.processInfo = result.result;
          this.submissionClient = result.result.merchant;
          this.getLegalNatureDescription();
          this.logger.info('Get client: ' + JSON.stringify(result.result.merchant));
          this.submissionClient.documents.forEach(val => {
            if (val.updateProcessAction != "Delete") {
              var isAnnulled = context.documentListAux?.find(doc => doc.id == val.id)?.isAnnulled;
              var found = context.compsToShow.find(v => v.id == val.id);
              //if (found == undefined) {
              //  context.compsToShow.push({
              //    id: val.id,
              //    type: "pdf",
              //    expirationDate: context.datepipe.transform(val.validUntil, 'dd-MM-yyyy'),
              //    stakeholder: context.submissionClient.commercialName,
              //    status: isAnnulled ? 'Anulado' : "Ativo",
              //    uploadDate: latest_date,
              //    file: val?.id,
              //    documentPurpose: val.purposes[0],
              //    documentType: val.documentType
              //  });
              //} else {
              //  found.stakeholder = context.submissionClient.commercialName;
              //  found.status = isAnnulled ? 'Anulado' : "Ativo";
              //}
            }
          });

          this.processInfo.stakeholders.forEach(stake => {
            if (stake.updateProcessAction != "Delete") {
              context.stakeholdersList.push(stake);
              if (stake.documents.length > 0) {
                stake.documents.forEach(val => {
                  if (val.updateProcessAction != "Delete") {
                    var isAnnulled = context.documentListAux?.find(doc => doc.id == val.id)?.isAnnulled;
                    var found = context.compsToShow.find(v => v.id == val.id);
                    //if (found == undefined) {
                    //  context.compsToShow.push({
                    //    id: val.id,
                    //    type: "pdf",
                    //    expirationDate: context.datepipe.transform(val.validUntil, 'dd-MM-yyyy'),
                    //    stakeholder: stake.fullName,
                    //    status: isAnnulled ? 'Anulado' : "Ativo",
                    //    uploadDate: latest_date,
                    //    file: val?.id as any,
                    //    documentPurpose: val.purposes[0],
                    //    documentType: val.documentType
                    //  });
                    //} else {
                    //  found.stakeholder = stake.fullName;
                    //  found.status = isAnnulled ? 'Anulado' : "Ativo";
                    //}
                  }
                });
              }
            }
          });

          this.processInfo.shops.forEach(shop => {
            if (shop.updateProcessAction != "Delete") {
              context.shopList.push(shop);
              if (shop.documents.length > 0) {
                if (shop.updateProcessAction != "Delete") {
                  var isAnnulled = context.documentListAux?.find(doc => doc.id == shop?.documents[0]?.id)?.isAnnulled;
                  var found = context.compsToShow.find(v => v.id == shop?.documents[0]?.id);
                  //if (found == undefined) {
                  //  context.compsToShow.push({
                  //    id: shop.documents[0].id,
                  //    type: "pdf",
                  //    expirationDate: context.datepipe.transform(shop.documents[0].validUntil, 'dd-MM-yyyy'),
                  //    stakeholder: shop.name,
                  //    status: isAnnulled ? 'Anulado' : "Ativo",
                  //    uploadDate: latest_date,
                  //    file: shop.documents[0]?.id,
                  //    documentPurpose: shop.documents[0].purposes[0],
                  //    documentType: shop.documents[0].documentType
                  //  });
                  //} else {
                  //  found.stakeholder = shop?.name;
                  //  found.status = isAnnulled ? 'Anulado' : "Ativo";
                  //}
                }
              }
            }
          });

          this.processInfo.corporateEntities.forEach(corp => {
            if (corp.updateProcessAction != "Delete") {
              context.stakeholdersList.push(corp);
              if (corp.documents.length > 0) {
                corp.documents.forEach(val => {
                  if (val.updateProcessAction != "Delete") {
                    var isAnnulled = context.documentListAux?.find(doc => doc.id == val.id)?.isAnnulled;
                    var found = context.compsToShow.find(v => v.id == val.id);
                    //if (found == undefined) {
                    //  context.compsToShow.push({
                    //    id: val.id,
                    //    type: "pdf",
                    //    expirationDate: context.datepipe.transform(val.validUntil, 'dd-MM-yyyy'),
                    //    stakeholder: corp.legalName,
                    //    status: isAnnulled ? 'Anulado' : "Ativo",
                    //    uploadDate: latest_date,
                    //    file: val?.id as any,
                    //    documentPurpose: val.purposes[0],
                    //    documentType: val.documentType
                    //  });
                    //} else {
                    //  found.stakeholder = corp.legalName;
                    //  found.status = isAnnulled ? 'Anulado' : "Ativo";
                    //}
                  }
                });
              }
            }
          });

          this.processInfo.privateEntities.forEach(priv => {
            if (priv.updateProcessAction != "Delete") {
              context.stakeholdersList.push(priv);
              if (priv.documents.length > 0) {
                priv.documents.forEach(val => {
                  if (val.updateProcessAction != "Delete") {
                    var isAnnulled = context.documentListAux?.find(doc => doc.id == val.id)?.isAnnulled;
                    var found = context.compsToShow.find(v => v.id == val.id);
                    //if (found == undefined) {
                    //  context.compsToShow.push({
                    //    id: val.id,
                    //    type: "pdf",
                    //    expirationDate: context.datepipe.transform(val.validUntil, 'dd-MM-yyyy'),
                    //    stakeholder: corp.legalName,
                    //    status: isAnnulled ? 'Anulado' : "Ativo",
                    //    uploadDate: latest_date,
                    //    file: val?.id as any,
                    //    documentPurpose: val.purposes[0],
                    //    documentType: val.documentType
                    //  });
                    //} else {
                    //  found.stakeholder = corp.legalName;
                    //  found.status = isAnnulled ? 'Anulado' : "Ativo";
                    //}
                  }
                });
              }
            }
          })

          this.processInfo.documents.forEach(doc => {
            if (doc.updateProcessAction != "Delete") {
              //context.compsToShow.push({
              //  id: doc.id,
              //  type: "pdf",
              //  expirationDate: context.datepipe.transform(doc.validUntil, 'dd-MM-yyyy'),
              //  stakeholder: "desconhecido",
              //  status: doc.isAnnulled ? 'Anulado' : "Ativo",
              //  uploadDate: latest_date,
              //  file: doc.id,
              //  documentPurpose: null,
              //  documentType: doc.documentType
              //});
            }
          });


          context.comprovativoService.getUpdateProcessRequiredDocuments(context.processId, context.updateProcessId).then(result => {
            context.logger.info("Get the submission's required documents: " + JSON.stringify(result));
            context.requiredDocuments = result.result;
            context.requiredDocuments.requiredDocumentPurposesStakeholders.forEach(value => {
              value.documentPurposes.forEach(val => {
                if (val.documentState !== 'NotApplicable') {
                  context.stakePurposeList.push(val.purpose);
                  context.stakePurposeList = Array.from(new Set(context.stakePurposeList));
                  if (val.documentState == 'NotExists')
                    val["existsOutbound"] = false;
                  else
                    val["existsOutbound"] = true;
                }
              });
            });

            context.requiredDocuments.requiredDocumentPurposesCorporateEntity.forEach(corporate => {
              corporate.documentPurposes.forEach(val => {
                if (val.documentState !== 'NotApplicable') {
                  context.stakePurposeList.push(val.purpose);
                  context.stakePurposeList = Array.from(new Set(context.stakePurposeList));
                  if (val.documentState == 'NotExists')
                    val["existsOutbound"] = false;
                  else
                    val["existsOutbound"] = true;
                }
              });
            });

            context.requiredDocuments.requiredDocumentPurposesPrivateEntity.forEach(value => {
              value.documentPurposes.forEach(val => {
                if (val.documentState !== 'NotApplicable') {
                  context.stakePurposeList.push(val.purpose);
                  context.stakePurposeList = Array.from(new Set(context.stakePurposeList));
                  if (val.documentState == 'NotExists')
                    val["existsOutbound"] = false;
                  else
                    val["existsOutbound"] = true;
                }
              });
            });

            context.requiredDocuments.requiredDocumentPurposesMerchants.forEach(value => {
              value.documentPurposes.forEach(val => {
                if (val.documentState !== 'NotApplicable') {
                  if (val.documentState == 'NotExists')
                    val["existsOutbound"] = false;
                  else
                    val["existsOutbound"] = true;
                }
              });
            });

            context.requiredDocuments.requiredDocumentPurposesShops.forEach(value => {
              value.documentPurposes.forEach(val => {
                if (val.documentState !== 'NotApplicable') {
                  if (val.documentState == 'NotExists')
                    val["existsOutbound"] = false;
                  else
                    val["existsOutbound"] = true;
                }
              });
            });
          })


        });
        });
      }
    } else {
      let promise = new Promise((resolve, reject) => {
        this.documentService.GetSubmissionDocuments(this.submissionId).subscribe(res => {
          if (res.length > 0) {
            res.forEach(doc => {
              context.documentListAux.push(doc);
            });
          }
        this.submissionService.GetSubmissionByID(this.submissionId).then(result => {
          this.submission = result.result;

          if (this.submission.observation != null && this.submission.observation != "")
            this.form.get("observations").setValue(this.submission.observation);

          var storeLength = context.submission.shops.length;
          var stakeLength = context.submission.stakeholders.length;
          var submissionDocLength = context.submission.documents.length;
          var corporateLength = context.submission.corporateEntities.length;
          var privateLength = context.submission.privateEntities.length;
          var length = 0;
          this.logger.info('Get current submission: ' + JSON.stringify(result));

          this.clientService.GetClientByIdAcquiring(this.submissionId).then(c => {
            this.submissionClient = c;
            this.getLegalNatureDescription();
            this.logger.info('Get client: ' + JSON.stringify(c));
            this.submissionClient.documents.forEach(val => {
              var isAnnulled = context.documentListAux?.find(doc => doc.id == val.id)?.isAnnulled;
              var found = context.compsToShow.find(v => v.id == val.id);
              if (found == undefined) {
                context.compsToShow.push({
                  id: val.id,
                  type: "pdf",
                  expirationDate: context.datepipe.transform(val.validUntil, 'dd-MM-yyyy'),
                  stakeholder: context.submissionClient.commercialName,
                  status: isAnnulled ? "Anulado" : "Ativo",
                  uploadDate: latest_date,
                  file: val?.id,
                  documentPurpose: val.purposes[0],
                  documentType: val.documentType
                });
              } else {
                found.stakeholder = context.submissionClient.commercialName;
                found.status = isAnnulled ? 'Anulado' : "Ativo";
              }
            });

            context.submission.stakeholders.forEach(stake => {
              context.stakeholderService.GetStakeholderFromSubmission(context.submission.id, stake.id, /*"8ed4a062-b943-51ad-4ea9-392bb0a23bac", "22195900002451", "fQkRbjO+7kGqtbjwnDMAag=="*/).then(result => {
                context.logger.info("Get stakeholder outbound: " + JSON.stringify(result));
                var stake = result.result;
                context.stakeholdersList.push(stake);
                length++;
                stake.documents.forEach(val => {
                  var isAnnulled = context.documentListAux?.find(doc => doc.id == val.id)?.isAnnulled;
                  var found = context.compsToShow.find(v => v.id == val.id);
                  if (found == undefined) {
                    context.compsToShow.push({
                      id: val.id,
                      type: "pdf",
                      expirationDate: context.datepipe.transform(val.validUntil, 'dd-MM-yyyy'),
                      stakeholder: stake.fullName,
                      status: isAnnulled ? "Anulado" : "Ativo",
                      uploadDate: latest_date,
                      file: val?.id,
                      documentPurpose: val.purposes[0],
                      documentType: val.documentType
                    });
                  } else {
                    found.stakeholder = stake.fullName;
                    found.status = isAnnulled ? 'Anulado' : "Ativo";
                  }
                });
                if (length === storeLength + stakeLength + submissionDocLength + corporateLength + privateLength) {
                  resolve(null);
                }
              }, error => {
                this.logger.error(error, "", "Erro getting stakeholder");
              });
            });

            context.submission.shops.forEach(function (value, index) {
              context.shopService.getSubmissionShopDetails(context.submissionId, value.id).then(shop => {
                context.logger.info("Get shop from submission: " + JSON.stringify(shop));
                context.shopList.push(shop.result);
                length++;
                if (shop.result.documents.length > 0) {
                  var isAnnulled = context.documentListAux?.find(doc => doc.id == shop?.result?.documents[0]?.id)?.isAnnulled;
                  var found = context.compsToShow.find(v => v.id == shop?.result?.documents[0]?.id);
                  if (found == undefined) {
                    context.compsToShow.push({
                      id: shop.result.documents[0].id,
                      type: "pdf",
                      expirationDate: context.datepipe.transform(shop.result.documents[0].validUntil, 'dd-MM-yyyy'),
                      stakeholder: shop.result.name,
                      status: isAnnulled ? "Anulado" : "Ativo",
                      uploadDate: latest_date,
                      file: shop.result.documents[0]?.id,
                      documentPurpose: shop.result.documents[0].purposes[0],
                      documentType: shop.result.documents[0].documentType
                    });
                  } else {
                    found.stakeholder = shop?.result?.name;
                    found.status = isAnnulled ? 'Anulado' : "Ativo";
                  }
                }
                if (length === storeLength + stakeLength + submissionDocLength + corporateLength + privateLength) {
                  resolve(null);
                }
              });
            });

            context.submission.corporateEntities.forEach(corporate => {
              context.stakeholderService.GetCorporateEntityById(context.submission.id, corporate.id, /*"8ed4a062-b943-51ad-4ea9-392bb0a23bac", "22195900002451", "fQkRbjO+7kGqtbjwnDMAag=="*/).then(result => {
                context.logger.info("Get stakeholder outbound: " + JSON.stringify(result));
                var corp = result.result;
                context.stakeholdersList.push(corp);
                length++;
                corp.documents.forEach(val => {
                  var isAnnulled = context.documentListAux?.find(doc => doc.id == val.id)?.isAnnulled;
                  var found = context.compsToShow.find(v => v.id == val.id);
                  if (found == undefined) {
                    context.compsToShow.push({
                      id: val.id,
                      type: "pdf",
                      expirationDate: context.datepipe.transform(val.validUntil, 'dd-MM-yyyy'),
                      stakeholder: corp.legalName,
                      status: isAnnulled ? "Anulado" : "Ativo",
                      uploadDate: latest_date,
                      file: val?.id,
                      documentPurpose: val.purposes[0],
                      documentType: val.documentType
                    });
                  } else {
                    found.stakeholder = corp.legalName;
                    found.status = isAnnulled ? 'Anulado' : "Ativo";
                  }
                });
                if (length === storeLength + stakeLength + submissionDocLength + corporateLength + privateLength) {
                  resolve(null);
                }
              }, error => {
                this.logger.error(error, "", "Erro getting stakeholder");
              });
            });

            context.submission.privateEntities.forEach(privateEntity => {
              context.stakeholderService.GetPrivateEntityById(context.submission.id, privateEntity.id, /*"8ed4a062-b943-51ad-4ea9-392bb0a23bac", "22195900002451", "fQkRbjO+7kGqtbjwnDMAag=="*/).then(result => {
                context.logger.info("Get stakeholder outbound: " + JSON.stringify(result));
                var priv = result.result;
                context.stakeholdersList.push(priv);
                length++;
                priv.documents.forEach(val => {
                  var isAnnulled = context.documentListAux?.find(doc => doc.id == val.id)?.isAnnulled;
                  var found = context.compsToShow.find(v => v.id == val.id);
                  if (found == undefined) {
                    context.compsToShow.push({
                      id: val.id,
                      type: "pdf",
                      expirationDate: context.datepipe.transform(val.validUntil, 'dd-MM-yyyy'),
                      stakeholder: priv.shortName,
                      status: isAnnulled ? "Anulado" : "Ativo",
                      uploadDate: latest_date,
                      file: val?.id,
                      documentPurpose: val.purposes[0],
                      documentType: val.documentType
                    });
                  } else {
                    found.stakeholder = priv.shortName;
                    found.status = isAnnulled ? 'Anulado' : "Ativo";
                  }
                });
                if (length === storeLength + stakeLength + submissionDocLength + corporateLength + privateLength) {
                  resolve(null);
                }
              }, error => {
                this.logger.error(error, "", "Erro getting stakeholder");
              });
            });

            context.submission.documents.forEach(function (value, index) {
              context.documentService.GetSubmissionDocumentById(context.submissionId, value.id).subscribe(doc => {
                length++;
                context.compsToShow.push({
                  id: doc.id,
                  type: "pdf",
                  expirationDate: context.datepipe.transform(doc.validUntil, 'dd-MM-yyyy'),
                  stakeholder: "desconhecido",
                  status: value.isAnnulled ? "Anulado" : "Ativo",
                  uploadDate: latest_date,
                  file: doc.id,
                  documentPurpose: null,
                  documentType: doc.documentType
                });
                if (length === storeLength + stakeLength + submissionDocLength + corporateLength + privateLength) {
                  resolve(null);
                }
              });
            });

          });
        });
      });
      }).finally(() => {
        context.comprovativoService.getRequiredDocuments(context.submissionId).then(result => {
          context.logger.info("Get the submission's required documents: " + JSON.stringify(result));
          context.requiredDocuments = result.result;
          context.requiredDocuments.requiredDocumentPurposesMerchants.forEach(merchant => {
            context.merchantOutbound = null;
            context.findDocs(merchant, 'merchant');
          });

          context.requiredDocuments.requiredDocumentPurposesStakeholders.forEach(stakeholder => {
            stakeholder.documentPurposes.forEach(val => {
              if (val.documentState !== 'NotApplicable') {
                context.stakePurposeList.push(val.purpose);
                context.stakePurposeList = Array.from(new Set(context.stakePurposeList));
              }
            });
            context.stakeOutbound = null;
            context.findDocs(stakeholder, 'stakeholder');
          });

          context.requiredDocuments.requiredDocumentPurposesCorporateEntity.forEach(corporate => {
            context.merchantOutbound = null;
            corporate.documentPurposes.forEach(corporateDocPurposes => {
              if (corporateDocPurposes.documentState !== 'NotApplicable') {
                context.stakePurposeList.push(corporateDocPurposes.purpose);
                context.stakePurposeList = Array.from(new Set(context.stakePurposeList));
              }
              context.corporateOutbound = null;
              context.findDocs(corporate, 'corporate');
            });
          });

          context.requiredDocuments.requiredDocumentPurposesPrivateEntity.forEach(priv => {
            priv.documentPurposes.forEach(privateDocPurposes => {
              if (privateDocPurposes.documentState !== 'NotApplicable') {
                context.stakePurposeList.push(privateDocPurposes.purpose);
                context.stakePurposeList = Array.from(new Set(context.stakePurposeList));
              }
              context.privateOutbound = null;
              context.findDocs(priv, 'private');
            });
          });

          context.requiredDocuments.requiredDocumentPurposesShops.forEach(shop => {
            context.shopOutbound = null;
            context.findDocs(shop, 'shop');
          });
        });
      });
    }
  }

  async findDocs(requiredDocumentPurposes: RequiredDocumentPurpose, type: string) {
    var context = this;
    if (type == 'merchant') {
      for (let merchantDocPurposes of requiredDocumentPurposes.documentPurposes) {
        if (merchantDocPurposes.documentState === 'NotExists') {
          if (context.submissionClient.clientId != null && context.submissionClient.clientId != "") {
            if (context.merchantOutbound == null) {
              await context.clientService.GetClientByIdOutbound(context.submissionClient.clientId).then(client => {
                this.logger.info("Get client outbound: " + JSON.stringify(client));
                context.merchantOutbound = client;
                if (context.merchantOutbound.documents != null && context.merchantOutbound.documents.length > 0) {
                  merchantDocPurposes["existsOutbound"] = merchantDocPurposes.documentsTypeCodeFulfillPurpose
                    .some(type => context.merchantOutbound.documents.find(elem => elem.documentType === type) != undefined);
                }
              }, error => {
                context.logger.error(error, "", "Client doesn't exist on outbound");
                merchantDocPurposes["existsOutbound"] = false;
              });
            } else {
              if (context.merchantOutbound.documents != null && context.merchantOutbound.documents.length > 0) {
                merchantDocPurposes["existsOutbound"] = merchantDocPurposes.documentsTypeCodeFulfillPurpose
                  .some(type => context.merchantOutbound.documents.find(elem => elem.documentType === type) != undefined);
              }
            }
          } else {
            merchantDocPurposes["existsOutbound"] = false;
          }
        }
      }
    }
    if (type == 'stakeholder') {
      for (let stakeholderDocPurposes of requiredDocumentPurposes.documentPurposes) {
        if (stakeholderDocPurposes.documentState === 'NotExists') {
          var foundStake = context.stakeholdersList.find(s => s.id == requiredDocumentPurposes.entityId);
          if (foundStake.clientId != "" && foundStake.clientId != null) {
            if (context.stakeOutbound == null) {
              await context.stakeholderService.getStakeholderByID(foundStake.clientId, "", "").then(stake => {
                this.logger.info("Get stakeholder outbound: " + JSON.stringify(stake));
                context.stakeOutbound = stake.result;
                if (context.stakeOutbound.documents != null && context.stakeOutbound.documents.length > 0) {
                  stakeholderDocPurposes["existsOutbound"] = stakeholderDocPurposes.documentsTypeCodeFulfillPurpose
                    .some(type => context.stakeOutbound.documents.find(elem => elem.documentType === type) != undefined);
                }
              }, error => {
                //var exists = context.checkDocumentExists(null, stakeholderDocPurposes, 'stakeholder');
                stakeholderDocPurposes["existsOutbound"] = false;
              });
            } else {
              //var exists = context.checkDocumentExists(null, stakeholderDocPurposes, 'stakeholder');
              if (context.stakeOutbound.documents != null && context.stakeOutbound.documents.length > 0) {
                stakeholderDocPurposes["existsOutbound"] = stakeholderDocPurposes.documentsTypeCodeFulfillPurpose
                  .some(type => context.stakeOutbound.documents.find(elem => elem.documentType === type) != undefined);
              }
            }
          } else {
            stakeholderDocPurposes["existsOutbound"] = false;
          }
        }
      }
    }
    if (type == 'corporate') {
      for (let corporateDocPurposes of requiredDocumentPurposes.documentPurposes) {
        if (corporateDocPurposes.documentState === 'NotExists') {
          var foundCorporate = context.stakeholdersList.find(s => s.id == requiredDocumentPurposes.entityId);
          if (foundCorporate.clientId != null && foundCorporate.clientId != "") {
            if (context.corporateOutbound == null) {
              await context.clientService.GetClientByIdOutbound(foundCorporate.clientId).then(client => {
                this.logger.info("Get client outbound: " + JSON.stringify(client));
                context.corporateOutbound = client;
                if (context.corporateOutbound?.documents != null && context.corporateOutbound?.documents.length > 0) {
                  corporateDocPurposes["existsOutbound"] = corporateDocPurposes.documentsTypeCodeFulfillPurpose
                    .some(type => context.corporateOutbound?.documents?.find(elem => elem.documentType === type) != undefined);
                }
              }, error => {
                context.logger.error(error, "", "Corporate doesn't exist on outbound");
                corporateDocPurposes["existsOutbound"] = false;
              });
            } else {
              if (context.corporateOutbound?.documents != null && context.corporateOutbound?.documents.length > 0) {
                corporateDocPurposes["existsOutbound"] = corporateDocPurposes.documentsTypeCodeFulfillPurpose
                  .some(type => context.corporateOutbound?.documents?.find(elem => elem.documentType === type) != undefined);
              }
            }
          } else {
            corporateDocPurposes["existsOutbound"] = false;
          }
        }
      }
    }
    if (type == 'private') {
      for (let privateDocPurposes of requiredDocumentPurposes.documentPurposes) {
        if (privateDocPurposes.documentState === 'NotExists') {
          var foundStake = context.stakeholdersList.find(s => s.id == requiredDocumentPurposes.entityId);
          if (foundStake.clientId != "" && foundStake.clientId != null) {
            if (context.privateOutbound == null) {
              await context.stakeholderService.getStakeholderByID(foundStake.clientId, "", "").then(stake => {
                this.logger.info("Get stakeholder outbound: " + JSON.stringify(stake));
                context.privateOutbound = stake.result;
                if (context.privateOutbound?.documents != null && context.privateOutbound?.documents?.length > 0) {
                  privateDocPurposes["existsOutbound"] = privateDocPurposes.documentsTypeCodeFulfillPurpose
                    .some(type => context.privateOutbound?.documents?.find(elem => elem.documentType === type) != undefined);
                }
              }, error => {
                //var exists = context.checkDocumentExists(null, stakeholderDocPurposes, 'stakeholder');
                privateDocPurposes["existsOutbound"] = false;
              });
            } else {
              //var exists = context.checkDocumentExists(null, stakeholderDocPurposes, 'stakeholder');
              if (context.privateOutbound?.documents != null && context.privateOutbound?.documents?.length > 0) {
                privateDocPurposes["existsOutbound"] = privateDocPurposes.documentsTypeCodeFulfillPurpose
                  .some(type => context.privateOutbound?.documents?.find(elem => elem.documentType === type) != undefined);
              }
            }
          } else {
            privateDocPurposes["existsOutbound"] = false;
          }
        }
      }
    }
    if (type == 'shop') {
      for (let shopDocPurposes of requiredDocumentPurposes.documentPurposes) {
        if (shopDocPurposes.documentState === 'NotExists') {
          var foundShop = context.shopList.find(s => s.id == requiredDocumentPurposes.entityId);
          if (foundShop?.shopId != null && foundShop?.shopId != "") {
            if (context.shopOutbound == null) {
              await context.shopService.getShopInfoOutbound(context.submissionClient.clientId, foundShop.id, "", "").then(shop => {
                context.shopOutbound = shop.result;
                this.logger.info("Get shop outbound: " + JSON.stringify(shop.result));
                if (context.shopOutbound.supportingDocuments != null && context.shopOutbound.supportingDocuments.length > 0) {
                  shopDocPurposes["existsOutbound"] = shopDocPurposes.documentsTypeCodeFulfillPurpose
                    .some(type => context.shopOutbound.supportingDocuments.find(elem => elem.documentType === type) != undefined);
                }
              }, error => {
                context.logger.error(error, "", "Shop doesn't exist on outbound");
                shopDocPurposes["existsOutbound"] = false;
              });
            } else {
              if (context.shopOutbound.supportingDocuments != null && context.shopOutbound.supportingDocuments.length > 0) {
                shopDocPurposes["existsOutbound"] = shopDocPurposes.documentsTypeCodeFulfillPurpose
                  .some(type => context.shopOutbound.supportingDocuments.find(elem => elem.documentType === type) != undefined);
              }
            }
          } else {
            shopDocPurposes["existsOutbound"] = false;
          }
        }
      }
    }
  }

  getDocumentPurposeDescription(purpose: string) {
    return this.documentPurposes?.find(doc => doc.code === purpose)?.description;
  }

  checkDocumentExists(entityId: string, purpose: DocumentPurpose, type: string) {
    var context = this;
    if (entityId != null) {
      if (type === 'merchant') {
        var docMerchantExists = false;
        if (context.merchantOutbound == null) {
          context.clientService.GetClientByIdOutbound(entityId).then(client => {
            this.logger.info("Get client outbound: " + JSON.stringify(client));
            context.merchantOutbound = client;
            if (context.merchantOutbound.documents != null && context.merchantOutbound.documents.length > 0) {
              docMerchantExists = purpose.documentsTypeCodeFulfillPurpose.some(type => {
                if (context.merchantOutbound.documents.find(elem => elem.documentType === type) == undefined) {
                  return false;
                } else {
                  return true;
                }
              });
            }
          }, error => {
            context.logger.error(error, "", "Client doesn't exist on outbound");
            return false;
          });
          return docMerchantExists;
        } else {
          if (context.merchantOutbound.documents != null && context.merchantOutbound.documents.length > 0) {
            docMerchantExists = purpose.documentsTypeCodeFulfillPurpose.some(type => {
              if (context.merchantOutbound.documents.find(elem => elem.documentType === type) == undefined) {
                return false;
              } else {
                return true;
              }
            });
          }
          return docMerchantExists;
        }
      }

      if (type === 'stakeholder') {
        var docStakeholderExists = false;
        if (entityId != undefined) {
          if (context.stakeOutbound == null) {
            context.stakeholderService.getStakeholderByID(entityId, "", "").then(stake => {
              this.logger.info("Get stakeholder outbound: " + JSON.stringify(stake));
              context.stakeOutbound = stake.result;
              if (context.stakeOutbound.documents != null && context.stakeOutbound.documents.length > 0) {
                docMerchantExists = purpose.documentsTypeCodeFulfillPurpose.some(type => {
                  if (context.stakeOutbound.documents.find(elem => elem.documentType === type) == undefined) {
                    return false;
                  } else {
                    return true;
                  }
                });
              }
            }, error => {
              context.logger.error(error, "", "Stakeholder doesn't exist on outbound");
              return false;
            });
          } else {
            if (context.stakeOutbound.documents != null && context.stakeOutbound.documents.length > 0) {
              docMerchantExists = purpose.documentsTypeCodeFulfillPurpose.some(type => {
                if (context.stakeOutbound.documents.find(elem => elem.documentType === type) == undefined) {
                  return false;
                } else {
                  return true;
                }
              });
            }
          }

        }
        return docStakeholderExists;
      }

      if (type === 'shop') {
        var docShopExists = false;
        if (context.shopOutbound == null) {
          context.shopService.getShopInfoOutbound(context.submissionClient.clientId, entityId, "", "").then(shop => {
            context.shopOutbound = shop.result;
            this.logger.info("Get shop outbound: " + JSON.stringify(shop.result));
            if (context.shopOutbound.supportingDocuments != null && context.shopOutbound.supportingDocuments.length > 0) {
              docShopExists = purpose.documentsTypeCodeFulfillPurpose.some(type => {
                if (context.shopOutbound.supportingDocuments.find(elem => elem.documentType === type) == undefined) {
                  return false;
                } else {
                  return true;
                }
              });
            }
          }, error => {
            context.logger.error(error, "", "Shop doesn't exist on outbound");
            return false;
          });
          return docShopExists;
        } else {
          if (context.shopOutbound.supportingDocuments != null && context.shopOutbound.supportingDocuments.length > 0) {
            docShopExists = purpose.documentsTypeCodeFulfillPurpose.some(type => {
              if (context.shopOutbound.supportingDocuments.find(elem => elem.documentType === type) == undefined) {
                return false;
              } else {
                return true;
              }
            });
          }
          return docShopExists;
        }
      }

      if (type === 'corporateEntity') {
        var docCorporateExists = false;
        if (context.merchantOutbound == null) {
          context.clientService.GetClientByIdOutbound(entityId).then(client => {
            this.logger.info("Get client outbound: " + JSON.stringify(client));
            context.merchantOutbound = client;
            if (context.merchantOutbound.documents != null && context.merchantOutbound.documents.length > 0) {
              docCorporateExists = purpose.documentsTypeCodeFulfillPurpose.some(type => {
                if (context.merchantOutbound.documents.find(elem => elem.documentType === type) == undefined) {
                  return false;
                } else {
                  return true;
                }
              });
            }
          }, error => {
            context.logger.error(error, "", "Client doesn't exist on outbound");
            return false;
          });
          return docCorporateExists;
        } else {
          if (context.merchantOutbound.documents != null && context.merchantOutbound.documents.length > 0) {
            docCorporateExists = purpose.documentsTypeCodeFulfillPurpose.some(type => {
              if (context.merchantOutbound.documents.find(elem => elem.documentType === type) == undefined) {
                return false;
              } else {
                return true;
              }
            });
          }
          return docCorporateExists;
        }
      }

    } else {
      return false;
    }
  }


  ngOnInit(): void {
    this.subscription = this.processNrService.queueName.subscribe(name => this.processType = name);
    this.clientNr = Number(this.router.snapshot.params['id']);
    this.pageName = String(this.router.snapshot.params['pageName']);
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    this.subscription = this.processNrService.processId.subscribe(id => this.processId = id);
    this.subscription = this.processNrService.updateProcessId.subscribe(id => this.updateProcessId = id);
    this.subscription = this.data.currentQueueName.subscribe(queueName => {
      if (queueName != null) {
        this.translate.get('homepage.diaryPerformance').subscribe((translated: string) => {
          this.queueName = this.translate.instant('homepage.' + queueName);
          this.title = this.translate.instant('supportingDocuments.title');
        });
      }
    });
    this.returned = localStorage.getItem("returned");
    this.submissionId = localStorage.getItem("submissionId");
    this.data.updateData(true, 4, 1);
    if (this.returned == 'consult') {
      this.validatedDocuments = true;
      this.updatedComps = true;
    } else {
      this.subscription = this.data.updatedComprovativos.subscribe(updatedComps => this.updatedComps = updatedComps);
    }
  }

  getLegalNatureDescription() {
    var index = this.legalNatures?.findIndex(value => value.code == this.submissionClient.legalNature);
    this.legalNature = this.legalNatures[index]?.description;
    this.mandatoryDocs = this.legalNatures[index]?.mandatoryDocuments;
  }

  selectFile(event: any, comp: any) {
    var context = this;
    this.compToShow = { tipo: "desconhecido", interveniente: "desconhecido", dataValidade: "desconhecido", dataEntrada: "desconhecido", status: "Ativo" }
    const files = <File[]>event.target.files;
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      if (file.type == "application/pdf") {
        const sizeFile = file.size / (1024 * 1024);
        var extensoesPermitidas = /(.pdf)$/i;
        const limSize = 10;
        if ((sizeFile <= limSize)) {
          if (event.target.files && files[i]) {
            var reader = new FileReader();
            reader.readAsDataURL(files[i]);
            this.files.push(file);
            this.compsToShow.push({
              expirationDate: 'desconhecido',
              stakeholder: 'desconhecido',
              status: 'Ativo',
              type: 'pdf',
              uploadDate: 'desconhecido',
              file: file
            });
            this.snackBar.open(this.translate.instant('queues.attach.success'), '', {
              duration: 4000,
              panelClass: ['snack-bar']
            });
          } else {
            alert("Verifique o tipo / tamanho do ficheiro");
          }
        } else {
          this.snackBar.open(this.translate.instant('queues.attach.fileSize'), '', {
            duration: 4000,
            panelClass: ['snack-bar']
          });
        }
      } else {
        this.snackBar.open(this.translate.instant('queues.attach.pdfOnly'), '', {
          duration: 4000,
          panelClass: ['snack-bar']
        });
      }
    }
    var fileBinaries = [];
    let length = 0;
    this.files.forEach(function (value, idx) {
      length++;
      context.comprovativoService.readBase64(value).then(data => {
        fileBinaries.push(data.split(',')[1]);
        if (length == context.files.length) {
          localStorage.setItem("documents", JSON.stringify(fileBinaries));
        }
      });
    });

  }

  load() {
    location.reload()
  }

  //mandamos uma lista dos ficheiros (for)  recebemos um ficheiro e transformamos esse ficheiro em blob e depois redirecionamos para essa página
  search(file: any, format?: string) {
    if (file instanceof File || file instanceof Blob) {
      let blob = new Blob([file], { type: file.type });
      let url = window.URL.createObjectURL(blob);

      window.open(url, '_blank',
        `margin: auto;
        width: 50%;
        padding: 10px;
        text-align: center;
        border: 3px solid green;
        `);
    } else {
      if (this.processId != '' && this.processId != null && this.returned != null) {
        this.processService.getDocumentImageFromProcess(this.processId, file).then(async result => {
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
        this.documentService.GetDocumentImage(this.submissionId, file).then(async result => {
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
      }
    }
  }

  //mandar como parametro o ficheiro ou o nome do ficheiro
  download(file: any, format?: any) {
    if (file instanceof File || file instanceof Blob) {
      let blob = new Blob([file], { type: file.type });
      let url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file["name"]; //file.name
      link.click();
    } else {
      if (this.processId != '' && this.processId != null && this.returned != null) {
        this.processService.getDocumentImageFromProcess(this.processId, file).then(async result => {
          this.logger.info("Get document image outbound: " + JSON.stringify(result));
          result.blob().then(data => {
            var blob = new Blob([data], { type: 'application/pdf' });
            let url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = file.name;
            link.click();
          });
        });
      } else {
        this.documentService.GetDocumentImage(this.submissionId, file).then(async result => {
          this.logger.info("Get document image outbound: " + JSON.stringify(result));
          result.blob().then(data => {
            var blob = new Blob([data], { type: 'application/pdf' });
            let url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = file.name;
            link.click();
          });
        });
      }
    }
  }

  onDelete(file: any, documentID) {
    this.deleteModalRef = this.modalService.show(this.deleteModal, { class: 'modal-lg' });
    this.fileToDelete = file;
    this.documentID = documentID;
  }
  
  firstSubmission() {
    if (!this.updatedComps) {
      this.firstSubmissionModalRef = this.modalService.show(this.firstSubmissionModal, { class: 'modal-lg' });
    } else {
      if (this.returned != 'consult') {
        this.compsToShow.forEach(doc => {
          if (doc.uploadDate == 'desconhecido') {
            this.comprovativoService.readBase64(doc.file).then((data) => {
              var docToSend: PostDocument = {
                "documentType": "0000",
                "file": {
                  "fileType": "PDF",
                  "binary": data.split(',')[1] //para retirar a parte inicial "data:application/pdf;base64"
                },
                "data": {}
              }
              this.logger.info("Sent document: " + JSON.stringify(docToSend));
              if (this.returned == null || (this.returned == 'edit' && (this.processId == null || this.processId == ''))) {
                this.documentService.SubmissionPostDocument(localStorage.getItem("submissionId"), docToSend).subscribe(result => {
                  this.logger.info('Document submitted ' + JSON.stringify(result));
                });
              } else {
                this.processService.addProcessDocument(this.processId, docToSend).then(result => {
                  this.logger.info('Document submitted ' + JSON.stringify(result.result));
                });
              }
            })
          }
        });
        localStorage.removeItem("documents");
        if (this.form.get("observations").value != null && this.form.get("observations").value != "" && this.submission.observation != this.form.get("observations").value) {
          var loginUser = this.authService.GetCurrentUser();
          this.submissionPut.submissionUser = {
            user: loginUser.userName,
            branch: loginUser.bankLocation,
            partner: loginUser.bankName
          }
          this.submissionPut.observation = this.form.get("observations").value;
          this.processPut.observation = this.form.get("observations").value;
          this.submissionPut.processNumber = localStorage.getItem("processNumber");
          this.processPut.submissionUser = loginUser.userName;
          this.logger.info('Submission data:  ' + JSON.stringify(this.submissionPut));
          if (this.returned == null || (this.returned == 'edit' && (this.processId == null || this.processId == ''))) {
            this.submissionService.EditSubmission(localStorage.getItem("submissionId"), this.submissionPut).subscribe(result => {
              this.logger.info('Updated submission ' + JSON.stringify(result));
              this.data.updateData(true, 4);
              this.data.changeUpdatedComprovativos(true);
              this.logger.info("Redirecting to Commercial Offer List page");
              this.route.navigate(['/commercial-offert-list']);
            });
          } else {
            this.processService.updateProcess(this.processId, this.processPut).then(result => {
              this.logger.info('Updated submission ' + JSON.stringify(result.result));
              this.data.updateData(true, 4);
              this.data.changeUpdatedComprovativos(true);
              this.logger.info("Redirecting to Commercial Offer List page");
              this.route.navigate(['/commercial-offert-list']);
            });
          }
        } else {
          this.logger.info("Redirecting to Commercial Offer List page");
          this.data.updateData(true, 4);
          this.route.navigate(['/commercial-offert-list']);
        }
      } else {
        this.logger.info("Redirecting to Commercial Offer List page");
        this.data.updateData(true, 4);
        this.route.navigate(['/commercial-offert-list']);
      }
    }
  }

  confirmDelete() {
    this.deleteModalRef?.hide();
    if (this.fileToDelete instanceof File) {
      let index = this.files.findIndex(f => f.lastModified === this.fileToDelete.lastModified);
      let index1 = this.compsToShow.findIndex(f => f.file.lastModified === this.fileToDelete.lastModified);

      if (index1 > -1)
        this.compsToShow.splice(index1, 1);

      if (index > -1)
        this.files.splice(index, 1);

      this.fileToDelete = null;
      this.documentID = "";

    } else {

      this.documentService.DeleteDocumentFromSubmission(this.submissionId, this.documentID).subscribe(sucess => {
        this.logger.info("Deleted document: " + JSON.stringify(sucess));
        let existsIndex = this.compsToShow.findIndex(f => f.id === this.documentID);
        if (existsIndex > -1)
          this.compsToShow.splice(existsIndex, 1);
        this.fileToDelete = null;
        this.documentID = "";
      }, error => {
        this.logger.error(error, "", error.msg);
      });

    }


  }

  onCheckList() {
    this.checkListModalRef = this.modalService.show(this.checkListDocs, { class: 'modal-xl' });
  }

  declineDelete() {
    this.deleteModalRef?.hide();
  }

  submissionPut: SubmissionPutTemplate = {
    "submissionType": "DigitalComplete",
    "processKind": "MerchantOnboarding",
    "processType": "Standard",
    "isClientAwaiting": true,
    "startedAt": this.datepipe.transform(new Date(), "yyyy-MM-dd"),
    "id": localStorage.getItem("submissionId"), //uuid
    "bank": "0800",
    "state": "Incomplete",
    "observation": ""
  }

  processPut = {
    submissionUser: "",
    observation: "",
    contractPackLanguage: "",
    signType: "Manual",
    isClientAwaiting: true
  };

  continue() {
    if (this.returned != 'consult') {
      this.firstSubmissionModalRef?.hide();
      this.files.forEach(doc => {
        this.comprovativoService.readBase64(doc).then((data) => {
          var docToSend: PostDocument = {
            "documentType": "0000", //antes estava "1001"
            //"documentPurpose": "Identification",
            "file": {
              "fileType": "PDF",
              "binary": data.split(',')[1] //para retirar a parte inicial "data:application/pdf;base64"
            },
            //"validUntil": "2022-07-20T11:03:13.001Z",
            "data": {}
          }
          this.logger.info("Sent document: " + JSON.stringify(docToSend));
          if (this.returned == null || (this.returned == 'edit' && (this.processId == null || this.processId == ''))) {
            this.documentService.SubmissionPostDocument(localStorage.getItem("submissionId"), docToSend).subscribe(result => {
              this.logger.info('Document submitted ' + JSON.stringify(result));
            });
          } else {
            this.processService.addProcessDocument(this.processId, docToSend).then(result => {
              this.logger.info('Document submitted ' + JSON.stringify(result.result));
            });
          }
        })
      });
      localStorage.removeItem("documents");
      var loginUser = this.authService.GetCurrentUser();
      this.submissionPut.submissionUser = {
        user: loginUser.userName,
        branch: loginUser.bankLocation,
        partner: loginUser.bankName
      }
      if (this.form.get("observations").value != null && this.form.get("observations").value != "") {
        this.submissionPut.observation = this.form.get("observations").value;
        this.processPut.observation = this.form.get("observations").value;
      }
      this.submissionPut.processNumber = localStorage.getItem("processNumber");
      this.processPut.submissionUser = loginUser.userName;
      this.logger.info('Submission data:  ' + JSON.stringify(this.submissionPut));
      if (this.returned == null || (this.returned == 'edit' && (this.processId == null || this.processId == ''))) {
        this.submissionService.EditSubmission(localStorage.getItem("submissionId"), this.submissionPut).subscribe(result => {
          this.logger.info('Updated submission ' + JSON.stringify(result));
          this.data.updateData(true, 4);
          this.data.changeUpdatedComprovativos(true);
          this.logger.info("Redirecting to Commercial Offer List page");
          this.route.navigate(['/commercial-offert-list']);
        });
      } else {
        this.processService.updateProcess(this.processId, this.processPut).then(result => {
          this.logger.info('Updated submission ' + JSON.stringify(result.result));
          this.data.updateData(true, 4);
          this.data.changeUpdatedComprovativos(true);
          this.logger.info("Redirecting to Commercial Offer List page");
          this.route.navigate(['/commercial-offert-list']);
        });
      }
    } else {
      this.data.updateData(true, 4);
      this.logger.info("Redirecting to Commercial Offer List page");
      this.route.navigate(['/commercial-offert-list']);
    }
  }

  getDocumentDescription(documentType: string) {
    if (documentType == undefined) {
      return 'desconhecido';
    } else {
      return this.documents?.find(doc => doc.code === documentType)?.description;
    }
  }

  back() {
    this.firstSubmissionModalRef?.hide();
  }

  declineCheckList() {
    this.checkListModalRef?.hide();
  }

  declineDeleteDoc() {
    this.deleteModalRef?.hide();
  }

  declineFirstSubmission() {
    this.firstSubmissionModalRef?.hide();
  }

  ngAfterViewInit() {
    if (this.returned != 'consult') {
      this.onCheckList();
    }
  }

  validatedDocumentsChange(value: boolean) {
    this.validatedDocuments = value;
  }

  private readBase64(file): Promise<any> {
    const reader = new FileReader();
    const future = new Promise((resolve, reject) => {
      reader.addEventListener('load', function () {
        resolve(reader.result);
      }, false);
      reader.addEventListener('error', function (event) {
        reject(event);
      }, false);

      reader.readAsDataURL(file);
    });
    return future;
  }

  readFile(file) {
    return new Promise((resolve, reject) => {
      // Create file reader
      let reader = new FileReader()

      // Register event listeners
      reader.addEventListener("loadend", e => resolve(e.target.result))
      reader.addEventListener("error", reject)

      // Read file
      reader.readAsArrayBuffer(file)
    })
  }

  convertToBlob(b64Data: any, contentType: string, sliceSize: number) {
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
    return blob;
  }

  getPurposeType(stakeholderPurpose: RequiredDocumentPurpose) {
    //descobrir todos os purposes do stakeholder em questão, de seguida comparar a lista que obtemos com a lista de purposes total e depois contar quantos purposes não existem e utilizar este valor para mostrar a quantidade de <td> que queremos
    var list = [];
    let length = 0;
    stakeholderPurpose.documentPurposes.forEach(value => {
      var found = list.find(v => value.purpose == v);
      if (found == undefined)
        list.push(value.purpose);
    });

    this.stakePurposeList.forEach(value => {
      var found1 = list.find(v => v == value);
      if (found1 == undefined)
        length++;
    });

    return length;
  }

  openCancelPopup() {
    this.cancelModalRef = this.modalService.show(this.cancelModal);
  }

  closeCancelPopup() {
    this.cancelModalRef?.hide();
  }

  confirmCancel() {
    if (this.returned != 'consult') {
      var context = this;
      var processNumber = "";
      this.processNrService.processNumber.subscribe(res => processNumber = res);
      var encodedCode = encodeURIComponent(processNumber);
      if (this.returned == null || (this.returned == 'edit' && (this.processId == '' || this.processId == null))) {
        this.submissionService.GetSubmissionByProcessNumber(encodedCode).then(result => {
          context.queuesInfo.markToCancel(result.result[0].processId, context.authService.GetCurrentUser().userName).then(res => {
            context.closeCancelPopup();
            context.route.navigate(['/']);
          });
        });
      } else {
        context.queuesInfo.markToCancel(context.processId, context.authService.GetCurrentUser().userName).then(res => {
          context.closeCancelPopup();
          context.route.navigate(['/']);
        });
      }
    }
  }
}


