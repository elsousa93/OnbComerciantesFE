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
import { ComprovativosTemplate, DocumentPurpose, IComprovativos, PurposeDocument, RequiredDocuments } from './IComprovativos.interface';
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
    private modalService: BsModalService, private datepipe: DatePipe, private comprovativoService: ComprovativosService, private tableInfo: TableInfoService, private data: DataService, private submissionService: SubmissionService, private clientService: ClientService, private stakeholderService: StakeholderService, private documentService: SubmissionDocumentService, private authService: AuthService, private shopService: StoreService) {
    var context = this;
    this.ngOnInit();

    this.tableInfo.GetDocumentsDescription().subscribe(result => {
      this.documents = result;
    });

    this.tableInfo.GetAllLegalNatures().then(result => {
      this.legalNatures = result.result;
    });

    this.tableInfo.GetAllDocumentPurposes().subscribe(result => {
      context.documentPurposes = result;
    });

    this.submissionService.GetSubmissionByID(this.submissionId).then(result => {
      this.submission = result.result;
      this.logger.info('Get current submission: ' + result);

      this.clientService.GetClientByIdAcquiring(this.submissionId).then(c => {
        this.submissionClient = c;
        this.getLegalNatureDescription();
        this.logger.info('Get client: ' + c);

        context.shopService.getSubmissionShopsList(context.submissionId).then(shops => {
          context.logger.info("Get all shops from submission: " + shops);
          shops.result.forEach(function (value, index) {
            context.shopService.getSubmissionShopDetails(context.submissionId, value.id).then(shop => {
              context.logger.info("Get shop from submission: " + shop);
              context.shopList.push(shop.result);
            });
          });

          this.documentService.GetSubmissionDocuments(this.submissionId).subscribe(res => {
            context.logger.info("Get all documents from submission: " + res);
            var documents = res;
            if (documents.length != 0) {
              documents.forEach(function (value, index) {
                var document = value;
                context.documentService.GetSubmissionDocumentById(context.submissionId, document.id).subscribe(val => {
                  context.logger.info("Get document from submission: " + val);
                  const now = new Date();
                  var latest_date = context.datepipe.transform(now, 'dd-MM-yyyy').toString();
                  var index = context.compsToShow.findIndex(value => value.id == document.id);
                  if (index == -1) {
                    var shopName = context.shopList?.find(shop => shop.bank.bank.iban === document.id)?.name;
                    context.compsToShow.push({
                      id: val.id,
                      type: "pdf",
                      expirationDate: context.datepipe.transform(val.validUntil, 'dd-MM-yyyy'),
                      stakeholder: shopName ?? context.submissionClient.fullName,
                      status: "não definido",
                      uploadDate: latest_date,
                      file: val?.id,
                      documentPurpose: val.documentPurpose,
                      documentType: val.documentType
                    });
                  }
                });
              });
            }
          });
        });
      });
    });

    this.comprovativoService.getRequiredDocuments(this.submissionId).then(result => {
      context.logger.info("Get the submission's required documents: " + result);
      context.requiredDocuments = result.result;
      context.requiredDocuments.requiredDocumentPurposesMerchants.forEach(merchant => {
        merchant.documentPurposes.forEach(merchantDocPurposes => {
          if (merchantDocPurposes.documentState === 'NotExists') {
            this.clientService.GetClientByIdAcquiring(context.submissionId).then(client => {
              context.logger.info("Get client: " + client);
              var exists = context.checkDocumentExists(client.clientId, merchantDocPurposes, 'merchant');
              merchantDocPurposes["existsOutbound"] = exists;
            });
          }
        });
      });

      context.requiredDocuments.requiredDocumentPurposesStakeholders.forEach(stakeholder => {
        stakeholder.documentPurposes.forEach(stakeholderDocPurposes => {
          if (stakeholderDocPurposes.documentState === 'NotExists') {
            context.stakeholderService.GetStakeholderFromSubmission(context.submissionId, stakeholder.entityId).then(result => {
              context.logger.info("Get stakeholder from submission: " + result);
              if ((result.result.stakeholderId == null || result.result.stakeholderId == "") && result.result.fiscalId != "") {
                context.stakeholderService.SearchStakeholderByQuery(result.result.fiscalId, "0501", "por mudar", "por mudar").then(stake => {
                  context.logger.info("Search stakeholder: " + stake);
                  var exists = context.checkDocumentExists(stake.result[0].stakeholderId, stakeholderDocPurposes, 'stakeholder');
                  stakeholderDocPurposes["existsOutbound"] = exists;
                }, error => {
                  context.logger.error(error, "", "Stakeholder doesn't exist");
                  var exists = context.checkDocumentExists(result.result.stakeholderId, stakeholderDocPurposes, 'stakeholder');
                  stakeholderDocPurposes["existsOutbound"] = exists;
                });
              } else {
                var exists = context.checkDocumentExists(result.result.stakeholderId, stakeholderDocPurposes, 'stakeholder');
                stakeholderDocPurposes["existsOutbound"] = exists;
              }
            });
          }
        });
      });

      context.requiredDocuments.requiredDocumentPurposesShops.forEach(shop => {
        shop.documentPurposes.forEach(shopDocPurposes => {
          if (shopDocPurposes.documentState === 'NotExists') {
            context.shopService.getSubmissionShopDetails(context.submissionId, shop.entityId).then(result => {
              context.logger.info("Get shop from submission: " + result);
              var exists = context.checkDocumentExists(result.result.shopId, shopDocPurposes, 'shop');
              shopDocPurposes["existsOutbound"] = exists;
            });
          }
        });
      });
    }).then(val => {
      this.logger.info("API call ended");
    });

    if (this.submission.stakeholders != null) {
      if (this.submission.stakeholders.length != 0) {
        this.submission.stakeholders.forEach(stake => {
          this.stakeholderService.getStakeholderByID(stake.id, "8ed4a062-b943-51ad-4ea9-392bb0a23bac", "22195900002451", "fQkRbjO+7kGqtbjwnDMAag==").then(result => {
            this.logger.info("Get stakeholder outbound: " + result);
            var stake = result.result;
            var index = this.stakeholdersList.findIndex(s => s.id == stake.id);
            if (index == -1)
              this.stakeholdersList.push(stake);
          }, error => {
            this.logger.error(error, "", "Erro ao obter informação de um stakeholder");
          });
        });
      }
    }
  }

  getDocumentPurposeDescription(purpose: string) {
    return this.documentPurposes?.find(doc => doc.code === purpose)?.description;
  }

  checkDocumentExists(entityId: string, purpose: DocumentPurpose, type: string) {
    var context = this;
    if (type === 'merchant') {
      var docMerchantExists = false;
      context.clientService.GetClientByIdOutbound(entityId).then(client => {
        this.logger.info("Get client outbound: " + client);
        if (client.documents != null && client.documents.length > 0) {
          docMerchantExists = purpose.documentsTypeCodeFulfillPurpose.some(type => {
            if (client.documents.find(elem => elem.documentType === type) == undefined) {
              return false;
            } else {
              return true;
            }
          });
        }
      }, error => {
        context.logger.error(error, "", "Client doesn't exist on outbound");
        return false;
      }).then(val => {

      });
      return docMerchantExists;
    }

    if (type === 'stakeholder') {
      var docStakeholderExists = false;
      if (entityId != undefined) {
        context.stakeholderService.getStakeholderByID(entityId, "", "").then(stake => {
          this.logger.info("Get stakeholder outbound: " + stake);
          var client = stake.result;
          if (client.documents != null && client.documents.length > 0) {
            docMerchantExists = purpose.documentsTypeCodeFulfillPurpose.some(type => {
              if (client.documents.find(elem => elem.documentType === type) == undefined) {
                return false;
              } else {
                return true;
              }
            });
          }
        }, error => {
          context.logger.error(error, "", "Stakeholder doesn't exist on outbound");
          return false;
        }).then(val => {

        });
      }
      return docStakeholderExists;
    }

    if (type === 'shop') {
      var docShopExists = false;
      context.shopService.getShopInfoOutbound(context.submissionClient.clientId, entityId, "", "").then(shop => {
        this.logger.info("Get shop outbound: " + shop);
        if (shop.result.supportingDocuments != null && shop.result.supportingDocuments.length > 0) {
          docShopExists = purpose.documentsTypeCodeFulfillPurpose.some(type => {
            if (shop.result.supportingDocuments.find(elem => elem.documentType === type) == undefined) {
              return false;
            } else {
              return true;
            }
          });
        }
      }, error => {
        context.logger.error(error, "", "Shop doesn't exist on outbound");
        return false;
      }).then(val => {

      });
      return docShopExists;
    }
  }


  ngOnInit(): void {
    this.clientNr = Number(this.router.snapshot.params['id']);
    this.pageName = String(this.router.snapshot.params['pageName']);
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    this.subscription = this.data.updatedComprovativos.subscribe(updatedComps => this.updatedComps = updatedComps);
    this.returned = localStorage.getItem("returned");
    this.submissionId = localStorage.getItem("submissionId");
    this.data.updateData(true, 4, 1);
  }

  getLegalNatureDescription() {
    var index = this.legalNatures?.findIndex(value => value.code == this.submissionClient.legalNature);
    this.legalNature = this.legalNatures[index]?.description;
    this.mandatoryDocs = this.legalNatures[index]?.mandatoryDocuments;
  }

  selectFile(event: any, comp: any) {
    this.compToShow = { tipo: "desconhecido", interveniente: "desconhecido", dataValidade: "desconhecido", dataEntrada: "desconhecido", status: "Ativo" }
    const files = <File[]>event.target.files;
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      const sizeFile = file.size / (1024 * 1024);
      var extensoesPermitidas = /(.pdf)$/i;
      const limSize = 10;
      if ((sizeFile <= limSize) && (extensoesPermitidas.exec(file.name))) {
        if (event.target.files && files[i]) {
          var reader = new FileReader();
          reader.readAsDataURL(files[i]);
          this.files.push(file);
          this.compsToShow.push({
            expirationDate: 'desconhecido',
            stakeholder: 'desconhecido',
            status: 'desconhecido',
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
      }
    }
    this.logger.debug(this.files);
  }

  load() {
    location.reload()
  }

  //mandamos uma lista dos ficheiros (for)  recebemos um ficheiro e transformamos esse ficheiro em blob e depois redirecionamos para essa página
  search(file: any, format?: string) {
    if (file instanceof File) {
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
      this.documentService.GetDocumentImageOutbound(file, "por mudar", "por mudar", format).subscribe(result => {
        this.logger.info("Get document image outbound: " + result);
        this.b64toBlob(result.binary, 'application/pdf', 512);
      });
    }
  }

  //mandar como parametro o ficheiro ou o nome do ficheiro
  download(file: any, format?: any) {
    if (file instanceof File) {
      let blob = new Blob([file], { type: file.type });
      let url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      link.click();
    } else {
      this.documentService.GetDocumentImageOutbound(file, "por mudar", "por mudar", format).subscribe(result => {
        this.logger.info("Get document image outbound: " + result);
        this.b64toBlob(result.binary, 'application/pdf', 512, true);
      });
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
      this.logger.info("Redirecting to Commercial Offer List page");
      this.data.updateData(true, 4);
      this.route.navigate(['/commercial-offert-list']);
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
        this.logger.info("Deleted document: " + sucess);
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
    "submissionType": "DigitalFirstHalf",
    "processKind": "MerchantOnboarding",
    "processType": "Standard",
    "isClientAwaiting": true,
    "startedAt": this.datepipe.transform(new Date(), "yyyy-MM-dd"),
    "id": localStorage.getItem("submissionId"), //uuid
    "bank": "0800",
    "state": "Incomplete"
  }

  continue() {
    this.firstSubmissionModalRef?.hide();
    this.files.forEach(doc => {
      this.comprovativoService.readBase64(doc).then((data) => {
        var docToSend: PostDocument = {
          "documentType": "0000", //antes estava "1001"
          "documentPurpose": "Identification",
          "file": {
            "fileType": "PDF",
            "binary": data.split(',')[1] //para retirar a parte inicial "data:application/pdf;base64"
          },
          "validUntil": "2022-07-20T11:03:13.001Z",
          "data": {}
        }
        this.logger.info("Sent document: " + docToSend);
        this.documentService.SubmissionPostDocument(localStorage.getItem("submissionId"), docToSend).subscribe(result => {
          this.logger.info('Document submitted ' + result);
        });
      })
    });

    var loginUser = this.authService.GetCurrentUser();
    this.submissionPut.submissionUser = {
      user: loginUser.userName,
      branch: loginUser.bankLocation,
      partner: loginUser.bankName
    }

    this.submissionPut.processNumber = localStorage.getItem("processNumber");
    this.logger.info('Submission data:  ' + this.submissionPut);
    this.submissionService.EditSubmission(localStorage.getItem("submissionId"), this.submissionPut).subscribe(result => {
      this.logger.info('Updated submission ' + result);
      this.data.updateData(true, 4);
      this.data.changeUpdatedComprovativos(true);
      this.logger.info("Redirecting to Commercial Offer List page");
      this.route.navigate(['/commercial-offert-list']);
    });
  }

  getDocumentDescription(documentType: string) {
    if (documentType == undefined) {
      return 'desconhecido';
    } else {
      return this.documents?.find(doc => doc.code === documentType).description;
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
    this.onCheckList();
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
}
