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
import { NGXLogger } from 'ngx-logger';


@Component({
  selector: 'app-comprovativos',
  templateUrl: './comprovativos.component.html'
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
      "averageTransactions": 0,
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
      "preferredMethod": "",
      "preferredPeriod": {
        "startsAt": "22:40:00.450Z",
        "endsAt": "15:42:54.722Z"
      },
      "phone1": {
        "countryCode": "",
        "phoneNumber": ""
      },
      "phone2": {
        "countryCode": "",
        "phoneNumber": ""
      },
      "fax": {
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
  submissionId: string = '83199e44-f089-471c-9588-f2a68e24b9ab';

  crcCode: string = "";

  public subscription: Subscription;
  public currentPage: number;
  public map: Map<number, boolean>;


  pageName = "";
  file?: File;
  files?: File[] = [];
  fileToDelete?: File;
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


  @ViewChild('deleteModal') deleteModal;
  @ViewChild('checkListDocs') checkListDocs;
  @ViewChild('firstSubmissionModal') firstSubmissionModal;

  validatedDocuments: boolean = false;

  submission: SubmissionGetTemplate = {};
  submissionClient: any = {};
  stakeholdersList: any[] = [];

  public returned: string;
  ///////////////////////
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
    return blob;
  }

  constructor(private logger: NGXLogger, public http: HttpClient, private route: Router, private router: ActivatedRoute, private compService: ComprovativosService, private renderer: Renderer2, @Inject(configurationToken) private configuration: Configuration,
    private modalService: BsModalService, private crcService: CRCService, private data: DataService, private submissionService: SubmissionService, private clientService: ClientService, private stakeholderService: StakeholderService, private documentService: SubmissionDocumentService) {

    this.baseUrl = configuration.baseUrl;
    //this.submissionId = localStorage.getItem("submissionId");
    this.logger.debug("id:!!!!");
    this.logger.debug(this.submissionId);
    var context = this;
    this.submissionService.GetSubmissionByID(this.submissionId).subscribe(result => {
      this.submission = result;
      this.logger.debug('Submission ', result);

      //this.crcService.getCRC('001', '001').subscribe(result => {

      //  this.logger.debug("--------- CRC SERVICE ---------");
      //  var crcResult = result;
      //  var crcFile = this.b64toBlob(crcResult.pdf, "application/pdf", 512);

      //  crcFile["lastModifiedDate"] = new Date();
      //  crcFile["name"] = "crc pdf";

      //  this.logger.debug("!!! crc file !!!");
      //  this.logger.debug(crcFile);

      //  this.compsToShow.push({
      //    type: "pdf",
      //    expirationDate: "2024-10-10",
      //    stakeholder: "Manuel",
      //    status: "não definido",
      //    uploadDate: "2020-10-10",
      //    file: <File>crcFile
      //  });

      //  this.logger.debug(this.compsToShow);
      //});

      this.documentService.GetSubmissionDocuments(this.submissionId).subscribe(res => {
        var documents = res;
        console.log("Lista inicial ", res);

        documents.forEach(function (value, index) {
          var document = value;
          console.log("Cada documento ", document);
          context.logger.debug("Documento do for");
          context.logger.debug(document);

          //if (document.documentPurpose === 'crcPDF') {
          context.logger.debug("encontrou!!!!");
            context.documentService.GetDocumentImage(context.submissionId, document.id).then(async (res) => {
              context.logger.debug("entrou no document get image!!!");
              context.logger.debug(res)
              console.log("imagem de um documento ", res);
              var teste = await res.blob();
              context.logger.debug(teste);
              console.log('teste ', teste);

              teste.lastModifiedDate = new Date();
              teste.name = "nome";

              context.file = <File>teste;

              context.logger.debug("ficheiro tratado");
              context.logger.debug(context.file);
              console.log("Ficheiro encontrado ", context.file);

              context.compsToShow.push({
                type: "pdf",
                expirationDate: "2024-10-10",
                stakeholder: "Manuel",
                status: "não definido",
                uploadDate: "2020-10-10",
                file: context.file,
                documentPurpose: document.documentPurpose
              })
              console.log("Lista de comprovativos ", context.compsToShow);
            });
          //}
        });
      });



      this.clientService.getClientByID(result.merchant.id, "8ed4a062-b943-51ad-4ea9-392bb0a23bac", "22195900002451", "fQkRbjO+7kGqtbjwnDMAag==").subscribe(c => {
        this.submissionClient = c;
        this.logger.debug('Cliente ', c);
      });

      this.submission.stakeholders.forEach(stake => {
        this.stakeholderService.getStakeholderByID(stake.id, "8ed4a062-b943-51ad-4ea9-392bb0a23bac", "22195900002451", "fQkRbjO+7kGqtbjwnDMAag==").subscribe(result => {
          this.logger.debug('Stakeholder ', result);
          this.stakeholdersList.push(result);
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

    this.logger.debug('Submission ', this.submission);
    this.logger.debug('Client ', this.client);
    this.logger.debug('stakeholders list ', this.stakeholdersList);
    this.logger.debug('Submission id ', localStorage.getItem("submissionId"));
    this.ngOnInit();

  }

  ngOnInit(): void {
    this.clientNr = Number(this.router.snapshot.params['id']);
    this.pageName = String(this.router.snapshot.params['pageName']);
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    this.returned = localStorage.getItem("returned");

    this.data.updateData(false, 4, 1);
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
  search(/*url: any, imgName: any*/ file: File) {
    let blob = new Blob([file], { type: file.type });
    let url = window.URL.createObjectURL(blob);

    window.open(url, '_blank',
      `margin: auto;
      width: 50%;
      padding: 10px;
      text-align: center;
      border: 3px solid green;
      `);

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

  onDelete(file: File) {
    this.deleteModalRef = this.modalService.show(this.deleteModal, { class: 'modal-lg' });
    this.fileToDelete = file;
  }

  obterOfertaComercial() {
    this.route.navigate(['/commercial-offert-list']);
  }

  firstSubmission() {
    this.firstSubmissionModalRef = this.modalService.show(this.firstSubmissionModal, { class: 'modal-lg' });
  }

  confirmDelete() {
    this.deleteModalRef?.hide();

    const index1 = this.compsToShow.findIndex(value => value.file == this.fileToDelete);
    if (index1 > -1)
      this.compsToShow.splice(index1, 1);

    const index = this.files.indexOf(this.fileToDelete);
    if (index > -1) {
      this.files.splice(index, 1);
    }

    this.fileToDelete = null;
    //this.compService.delFile(this.id).subscribe(data => {
    //  this.logger.debug("DATA: ", data);
    //  if (data != null) {
    //    alert("Ficheiro apagado com sucesso!!");
    //    this.load();
    //  }
    //},
    //  err => {
    //    console.error(err);
    //  }
    //)

  }

  onCheckList() {
    this.checkListModalRef = this.modalService.show(this.checkListDocs, { class: 'modal-xl' });
  }

  declineDelete() {
    this.deleteModalRef?.hide();
  }

  submissionPutTeste: SubmissionPutTemplate = {
    "submissionType": "DigitalFirstHalf",
    "processNumber": "",
    "processKind": "MerchantOnboarding",
    "processType": "Standard",
    "isClientAwaiting": true,
    "submissionUser": {
      "user": "joao.silvestre",
      "branch": "",
      "partner": ""
    },
    "startedAt": "2022-10-10",
    "id": localStorage.getItem("submissionId"), //uuid
    "bank": "0800",
    "state": "Ready"
  }

  continue() {
    this.firstSubmissionModalRef?.hide();
    this.files.forEach(doc => {

      this.readBase64(doc).then((data) => {
        var docToSend: PostDocument = {
          "documentType": "string",
          "documentPurpose": "Identification",
          "file": {
            "fileType": "PDF",
            "binary": data.split(',')[1] //para retirar a parte inicial "data:application/pdf;base64"
          },
          "validUntil": "2022-07-20T11:03:13.001Z",
          "data": {}
        }
        this.documentService.SubmissionPostDocument(localStorage.getItem("submissionId"), docToSend).subscribe(result => {
          this.logger.debug('Ficheiro foi submetido ', result);
        });
      })
    });

    if (this.returned !== null) {
      this.logger.debug("Entrei no if dos comprovativos quando faço o submit ");
      this.submissionPutTeste.processNumber = localStorage.getItem("processNumber");
      this.logger.debug("Objeto com os valores atualizados ", this.submissionPutTeste);
    }

    this.submissionService.EditSubmission(localStorage.getItem("submissionId"), this.submissionPutTeste).subscribe(result => {
      this.logger.debug('Editar sub ', result);
    });


    this.data.updateData(true, 4);
    this.route.navigate(['/commercial-offert-list']);
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

