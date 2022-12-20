import { HttpClient } from '@angular/common/http';
import { utf8Encode } from '@angular/compiler/src/util';
import { AfterViewInit, Renderer2 } from '@angular/core';
import { Component, Inject, Input, OnInit, VERSION, ViewChild } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { buffer, Subscription, take } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { Client } from '../client/Client.interface';
import { ClientService } from '../client/client.service';
import { Configuration, configurationToken } from '../configuration';
import { CRCService } from '../CRC/crcservice.service';
import { DataService } from '../nav-menu-interna/data.service';
import { ProcessService } from '../process/process.service';
import { StakeholderService } from '../stakeholders/stakeholder.service';
import { PostDocument } from '../submission/document/ISubmission-document';
import { SubmissionDocumentService } from '../submission/document/submission-document.service';
import { SubmissionGetTemplate, SubmissionPutTemplate } from '../submission/ISubmission.interface';
import { SubmissionService } from '../submission/service/submission-service.service';
import { ComprovativosTemplate, IComprovativos } from './IComprovativos.interface';
import { ComprovativosService } from './services/comprovativos.services';
import { LoggerService } from 'src/app/logger.service';
import { TableInfoService } from '../table-info/table-info.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../services/auth.service';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-comprovativos',
  templateUrl: './comprovativos.component.html',
  providers: [DatePipe]
})
export class ComprovativosComponent implements OnInit, AfterViewInit {
  private baseUrl: string;


  public comprovativos: IComprovativos[] = [];

  public newComp: IComprovativos = {
    "id": 0,
    "clientId": "",
    "filename": "",
    "url": ""
  };

  //SO PARA MOSTRAR, DEPOIS ATUALIZAR COM A API
  public compToShow: { tipo: string, interveniente: string, dataValidade: string, dataEntrada: string, status: string };
  public compsToShow: ComprovativosTemplate[] = [];

  public client: Client = {
    "clientId": "",
    "fiscalId": "",
    "companyName": "",
    "commercialName": "",
    "shortName": "",
    "headquartersAddress": {
      "address": "",
      "postalCode": "",
      "postalArea": "",
      "locality": "",
      "country": ""
    },
    "merchantType": "",
    "legalNature": "",
    "legalNature2": "",
    "crc": {
      "code": "",
      "validUntil": ""
    },
    "shareCapital": {
      "capital": 0,
      "date": "1966-08-30"
    },
    "byLaws": "",
    "mainEconomicActivity": "",
    "otherEconomicActivities": [""],
    "mainOfficeAddress": {
      "address": "",
      "postalCode": "",
      "postalArea": "",
      "country": "",
      "locality": ""
    },
    "establishmentDate": "2009-12-16",
    "businessGroup": {
      "type": "",
      "branch": ""
    },
    "knowYourSales": {
      "estimatedAnualRevenue": 0,
      "transactionsAverage": 0,
      "servicesOrProductsSold": [
        "",
        ""
      ],
      "servicesOrProductsDestinations": [
        "",
        ""
      ]
    },
    "foreignFiscalInformation": {
      "issuerCountry": "",
      "issuanceIndicator": "",
      "fiscalId": "",
      "issuanceReason": ""
    },
    "bankInformation": {
      "bank": "",
      "branch": "",
      "iban": "",
      "accountOpenedAt": "2019-06-11"
    },
    "contacts": {
      "phone1": {
        "countryCode": "",
        "phoneNumber": ""
      },
      "phone2": {
        "countryCode": "",
        "phoneNumber": ""
      },
      "email": ""
    },
    "documentationDeliveryMethod": "",
    "billingEmail": ""
  };

  public result: any;
  public id: number = 0;
  public clientNr: number = 0;
  //submissionId: string = "";
  submissionId: string = '83199e44-f089-471c-9588-f2a68e24b9ab';

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
  stakeholdersList: any[] = [];

  public returned: string;
  updatedComps: boolean;
  ///////////////////////
  //b64toBlob(b64Data: any, contentType: string, sliceSize: number) {
  //  const byteCharacters = atob(b64Data);
  //  const byteArrays = [];

  //  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
  //    const slice = byteCharacters.slice(offset, offset + sliceSize);

  //    const byteNumbers = new Array(slice.length);
  //    for (let i = 0; i < slice.length; i++) {
  //      byteNumbers[i] = slice.charCodeAt(i);
  //    }

  //    const byteArray = new Uint8Array(byteNumbers);
  //    byteArrays.push(byteArray);
  //  }

  //  const blob = new Blob(byteArrays, { type: contentType });
  //  return blob;
  //}

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

  constructor(private logger: LoggerService, private translate: TranslateService, private snackBar: MatSnackBar, public http: HttpClient, private route: Router, private router: ActivatedRoute, private compService: ComprovativosService, private renderer: Renderer2, @Inject(configurationToken) private configuration: Configuration,
    private modalService: BsModalService, private datepipe: DatePipe, private comprovativoService: ComprovativosService, private tableInfo: TableInfoService, private crcService: CRCService, private data: DataService, private submissionService: SubmissionService, private clientService: ClientService, private stakeholderService: StakeholderService, private documentService: SubmissionDocumentService, private authService: AuthService) {

    this.baseUrl = configuration.baseUrl;
    this.ngOnInit();
    var context = this;

    if (this.returned != null) {
      this.submissionService.GetSubmissionByProcessNumber(localStorage.getItem("processNumber")).then(result => {
        this.submissionService.GetSubmissionByID(result[0].submissionId).then(resul => {
          this.documentService.GetSubmissionDocuments(resul.id).subscribe(res => {
            var documents = res;
            if (documents.length != 0) {
              documents.forEach(function (value, index) {
                var document = value;
                context.documentService.GetDocumentImage(context.submissionId, document.id).then(async (res) => {
                  var teste = await res.blob();
                  teste.lastModifiedDate = new Date();
                  teste.name = "nome";

                  context.file = <File>teste;
                  console.log("Ficheiro encontrado ", context.file);

                  context.documentService.GetSubmissionDocumentById(context.submissionId, document.id).subscribe(val => {
                    context.compsToShow.push({
                      id: document.id,
                      type: "pdf",
                      expirationDate: "2024-10-10",
                      stakeholder: "Manuel",
                      status: "não definido",
                      uploadDate: "2020-10-10",
                      file: context.file,
                      documentPurpose: val.documentPurpose
                    })
                    console.log("Lista de comprovativos ", context.compsToShow);
                  });
                });

              });
            }

          });

          this.clientService.getClientByID(resul.merchant.id, "8ed4a062-b943-51ad-4ea9-392bb0a23bac", "22195900002451", "fQkRbjO+7kGqtbjwnDMAag==").then(c => {
            this.submissionClient = c.result;
            this.logger.debug('Cliente ' + c.result);
          });

          this.submission.stakeholders.forEach(stake => {
            this.stakeholderService.getStakeholderByID(stake.id, "8ed4a062-b943-51ad-4ea9-392bb0a23bac", "22195900002451", "fQkRbjO+7kGqtbjwnDMAag==").subscribe(result => {
              this.logger.debug('Stakeholder ' + result);
              this.stakeholdersList.push(result);
            }, error => {
              this.logger.error(error, "", "Erro ao obter informação de um stakeholder");
            });
          });
        });
      });
    }
    
    this.submissionService.GetSubmissionByID(this.submissionId).then(result => {
      this.submission = result.result;
      this.logger.debug('Submission ' + result);

      this.clientService.GetClientByIdAcquiring(this.submissionId).then(c => {
        this.submissionClient = c;
        this.logger.debug('Cliente ' + c);


        this.documentService.GetSubmissionDocuments(this.submissionId).subscribe(res => {
          var documents = res;
          if (documents.length != 0) {
            documents.forEach(function (value, index) {
              var document = value;
              //context.documentService.GetDocumentImage(context.submissionId, document.id).then(async (res) => {
                //console.log("imagem de um documento ", res);
                //var teste = await res.blob();

                //teste.lastModifiedDate = new Date();
                //teste.name = "nome";

                //context.file = <File>teste;
                //console.log("Ficheiro encontrado ", context.file);

                context.documentService.GetSubmissionDocumentById(context.submissionId, document.id).subscribe(val => {
                  const now = new Date();
                  var latest_date = context.datepipe.transform(now, 'dd-MM-yyyy').toString();

                  var index = context.compsToShow.findIndex(value => value.id == document.id);
                  if (index == -1) {
                    context.compsToShow.push({
                      id: val.id,
                      type: "pdf",
                      expirationDate: context.datepipe.transform(val.validUntil, 'dd-MM-yyyy'),
                      stakeholder: context.submissionClient.legalName,
                      status: "não definido",
                      uploadDate: latest_date,
                      file: val?.id,
                      documentPurpose: val.documentPurpose,
                      documentType: val.documentType
                    });
                  }
                  console.log("Lista de comprovativos ", context.compsToShow);
                });
              //});
            });
          }

        });
      });

      //this.submission.documents.forEach(document => {
      //  this.logger.debug("entrou aqui1!!!");
      //  var document = document;
      //  var promise = documentService.GetSubmissionDocumentById(this.submissionId, document.id).toPromise();

      //  promise.then((success) => {
      //    this.logger.debug("entrou aqui2!!!!")
      //    var currentDocument = success;
      //    var fileImage = documentService.GetDocumentImage(this.submissionId, currentDocument.id).toPromise();

      //    this.logger.debug(this.submissionId);
      //    this.logger.debug(currentDocument.id);
      //    this.logger.debug("----------------");
      //    this.documentService.GetDocumentImage(this.submissionId, currentDocument.id).subscribe(result => {
      //      this.logger.debug("entrou aqui3!!!!!!!");
      //    });

      //    //fileImage.then((success) => {
      //    //  this.logger.debug("entrou aqui3!!!!");
      //    //  var teste = success.arraybuffer();
      //    //  this.logger.debug(teste);
      //    //  //var file = success;
      //    //  //this.logger.debug("FICHEIRO PDF");
      //    //  //this.logger.debug(file);
      //    //  //this.files.push(file);
      //    //  //this.compsToShow.push({
      //    //  //  type: currentDocument.documentType,
      //    //  //  stakeholder: '',
      //    //  //  expirationDate: currentDocument.validUntil,
      //    //  //  uploadDate: '',
      //    //  //  status: '',
      //    //  //  file: file
      //    //  //});
      //    //  //this.logger.debug("comps a mostrar");
      //    //  //this.logger.debug(this.compsToShow);

      //    //}, error => {
      //    //  this.logger.debug("deu erro!!!");
      //    //  this.logger.debug(error);
      //    //});
      //  });

      //  var blob = this.b64toBlob(document, 'application/pdf', 512);

      //  var file = new File([blob], "crcTeste");
      //  this.logger.debug("blob para ficheiro");
      //  this.logger.debug(file);
      //  this.files.push(file);
      //});
    });
    if (this.submission.stakeholders != null) { 
      if (this.submission.stakeholders.length != 0) {
        this.submission.stakeholders.forEach(stake => {
          this.stakeholderService.getStakeholderByID(stake.id, "8ed4a062-b943-51ad-4ea9-392bb0a23bac", "22195900002451", "fQkRbjO+7kGqtbjwnDMAag==").subscribe(result => {
            this.logger.debug('Stakeholder ' + result);
            var index = this.stakeholdersList.findIndex(s => s.id == result.id);
            if (index == -1)
              this.stakeholdersList.push(result);
          }, error => {
            this.logger.error(error, "", "Erro ao obter informação de um stakeholder");
          });
        });
      }
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
        this.b64toBlob(result.binary, 'application/pdf', 512);
      });
    }
  }

  //mandar como parametro o ficheiro ou o nome do ficheiro
  download(/*imgName: any*/ file: File) {
    let blob = new Blob([file], { type: file.type });
    let url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    link.click();
  }

  onDelete(file: any, documentID) {
    this.deleteModalRef = this.modalService.show(this.deleteModal, { class: 'modal-lg' });
    this.fileToDelete = file;
    this.documentID = documentID;
  }

  obterOfertaComercial() {
    this.route.navigate(['/commercial-offert-list']);
  }

  firstSubmission() {
    if (!this.updatedComps) { 
      this.firstSubmissionModalRef = this.modalService.show(this.firstSubmissionModal, { class: 'modal-lg' });
    } else { 
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

    } else {
      this.tableInfo.deleteDocument(this.submissionId, this.documentID).then(sucess => {
        console.log("Sucesso a apagar um documento: ", sucess.msg);
      }, error => {
        console.log("Erro a apagar um ficheiro: ", error.msg);
      });
    }

    this.fileToDelete = null;
    this.documentID = "";
  }

  onCheckList() {
    this.checkListModalRef = this.modalService.show(this.checkListDocs, { class: 'modal-xl' });
  }

  declineDelete() {
    this.deleteModalRef?.hide();
  }

  submissionPutTeste: SubmissionPutTemplate = {
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
        this.documentService.SubmissionPostDocument(localStorage.getItem("submissionId"), docToSend).subscribe(result => {
          this.logger.debug('Ficheiro foi submetido ' + result);
        });
      })
    });

    var loginUser = this.authService.GetCurrentUser();

    this.submissionPutTeste.submissionUser = {
      user: loginUser.userName,
      branch: loginUser.bankLocation,
      partner: loginUser.bankName 
    }

    this.submissionPutTeste.processNumber = localStorage.getItem("processNumber");

    this.submissionService.EditSubmission(localStorage.getItem("submissionId"), this.submissionPutTeste).subscribe(result => {
      this.logger.debug('Editar sub ' + result);
      this.data.updateData(true, 4);
      this.data.changeUpdatedComprovativos(true);
      this.route.navigate(['/commercial-offert-list']);
    });

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
