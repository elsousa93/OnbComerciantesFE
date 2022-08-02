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
import { DataService } from '../nav-menu-interna/data.service';
import { StakeholderService } from '../stakeholders/stakeholder.service';
import { PostDocument } from '../submission/document/ISubmission-document';
import { SubmissionDocumentService } from '../submission/document/submission-document.service';
import { SubmissionGetTemplate, SubmissionPutTemplate } from '../submission/ISubmission.interface';
import { SubmissionService } from '../submission/service/submission-service.service';
import { CheckDocumentsComponent } from './check-documents/check-documents.component';
import { ComprovativosTemplate, IComprovativos } from './IComprovativos.interface';
import { ComprovativosService } from './services/comprovativos.services';


@Component({
  selector: 'app-comprovativos',
  templateUrl: './comprovativos.component.html'
})
export class ComprovativosComponent implements OnInit, AfterViewInit {
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
    "commercialName":"",
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

  public subscription: Subscription;
  public currentPage: number;
  public map: Map<number, boolean>;

  public url: string;

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
  // TESTE //////////////

  constructor(public http: HttpClient, @Inject('BASE_URL') baseUrl: string, private route: Router, private router: ActivatedRoute, private compService: ComprovativosService, private renderer: Renderer2,
    private modalService: BsModalService, private data: DataService, private submissionService: SubmissionService, private clientService: ClientService, private stakeholderService: StakeholderService, private documentService: SubmissionDocumentService) {

    //this.submissionId = localStorage.getItem("submissionId");
    this.url = baseUrl;
    this.ngOnInit();
    http.get<Client>(baseUrl + 'BEClients/GetClientById/' + this.clientNr).subscribe(result => {
      this.client = result;
    }, error => console.error(error));
    http.get<IComprovativos[]>(baseUrl + `BEComprovativos/` + this.clientNr).subscribe(result => {
      this.comprovativos = result;
      console.log(result);
    }, error => console.error(error));
    this.data.updateData(false, 4);

    this.submissionService.GetSubmissionByID(this.submissionId).subscribe(result => {
      this.submission = result;
      console.log('Submission ', result);

      this.clientService.getClientByID(result.merchant.id, "8ed4a062-b943-51ad-4ea9-392bb0a23bac", "22195900002451", "fQkRbjO+7kGqtbjwnDMAag==").subscribe(c => {
        this.submissionClient = c;
        console.log('Cliente ', c);
      });

      this.submission.stakeholders.forEach(stake => {
        this.stakeholderService.getStakeholderByID(stake.id, "8ed4a062-b943-51ad-4ea9-392bb0a23bac", "22195900002451", "fQkRbjO+7kGqtbjwnDMAag==").subscribe(result => {
          console.log('Stakeholder ', result);
          this.stakeholdersList.push(result);
        });
      });

      this.submission.documents.forEach(document => {
        console.log("entrou aqui1!!!");
        var document = document;
        var promise = documentService.GetSubmissionDocumentById(this.submissionId, document.id).toPromise();

        promise.then((success) => {
          console.log("entrou aqui2!!!!")
          var currentDocument = success;
          var fileImage = documentService.GetDocumentImage(this.submissionId, currentDocument.id).toPromise();

          this.documentService.GetDocumentImage(this.submissionId, currentDocument.id).subscribe(result => {
            console.log("entrou aqui3!!!!!!!");
          });

          //fileImage.then((success) => {
          //  console.log("entrou aqui3!!!!");
          //  var teste = success.arraybuffer();
          //  console.log(teste);
          //  //var file = success;
          //  //console.log("FICHEIRO PDF");
          //  //console.log(file);
          //  //this.files.push(file);
          //  //this.compsToShow.push({
          //  //  type: currentDocument.documentType,
          //  //  stakeholder: '',
          //  //  expirationDate: currentDocument.validUntil,
          //  //  uploadDate: '',
          //  //  status: '',
          //  //  file: file
          //  //});
          //  //console.log("comps a mostrar");
          //  //console.log(this.compsToShow);
            
          //}, error => {
          //  console.log("deu erro!!!");
          //  console.log(error);
          //});
        });

        var blob = this.b64toBlob(document, 'application/pdf', 512);

        var file = new File([blob], "crcTeste");
        console.log("blob para ficheiro");
        console.log(file);
        this.files.push(file);
      });
    });

    console.log('Submission ', this.submission);
    console.log('Client ', this.client);
    console.log('stakeholders list ', this.stakeholdersList);
    console.log('Submission id ', localStorage.getItem("submissionId"));
  }

  ngOnInit(): void {
    this.clientNr = Number(this.router.snapshot.params['id']);
    //console.log(String(this.router.snapshot.params['pagename']));
    this.pageName = String(this.router.snapshot.params['pageName']);
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
  }


  selectFile(event: any, comp: any) {
    this.compToShow = { tipo: "desconhecido", interveniente: "desconhecido", dataValidade: "desconhecido", dataEntrada: "desconhecido", status: "Ativo" }
    this.newComp.clientId = "2";
    this.newComp.id = 1;
    this.newComp.filename = "teste";
    this.newComp.url = "img/";
    const files = <File[]>event.target.files;
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      const sizeFile = file.size / (1024 * 1024);
      var extensoesPermitidas = /(.pdf)$/i;
      const limSize = 10;
      this.result = this.http.put(this.url + 'ServicesComprovativos/', this.newComp.clientId);
      if (this.result != null) {
        if ((sizeFile <= limSize) && (extensoesPermitidas.exec(file.name))) {
          if (event.target.files && files[i]) {
            var reader = new FileReader();
            reader.onload = (event: any) => {
              this.localUrl = event.target.result;
            }
            reader.readAsDataURL(files[i]);
            this.files.push(file);
          } else {
            alert("Verifique o tipo / tamanho do ficheiro");
          }
        }
      }
    }
    console.log(this.files);

    //this.file = <File>event.target.files[0];
    //const sizeFile = this.file.size / (1024 * 1024);
    //var extensoesPermitidas = /(.pdf)$/i;
    //const limSize = 10


    
    // this.comprovativos.push({ id: 1, clientId: "2", filename: "ola", url: "url" });

    // this.newComp.clientId = String(this.clientNr);
    //this.result = this.http.put(this.url + 'ServicesComprovativos/', this.newComp.clientId);
    //// .subscribe(result => {
    //  // console.log(this.result);
    //  if (this.result != null) {
    //    // this.compClientId = this.result;
    //    if ((sizeFile <= limSize) && (extensoesPermitidas.exec(this.file.name))) {
    //      if (event.target.files && event.target.files[0]) {
    //        var reader = new FileReader();
    //        reader.onload = (eve: any) => {
    //          //console.log('Local URL ', event);
    //          //this.localUrl = event.target.result;
              
    //          let blob = new Blob(event.target.files, { type: event.target.files[0].type });
    //          let url = window.URL.createObjectURL(blob);
    //          console.log(event.target.files);
    //          this.localUrl = url;
    //          console.log('URKLSDLSDSDMSLK ',url);
    //        }
    //        reader.readAsDataURL(event.target.files[0]);
    //        this.uploadFile(this.newComp.clientId);
    //      }
    //    } else {
    //      alert("Verifique o tipo / tamanho do ficheiro");
    //    }
    //  }
    // }, error => console.error(error));
  }

  //recebe o ficheiro que vai dar upload
  uploadFile(id: any) {
    if (this.file != undefined) {
      this.compService.uploadFile(this.file, id).subscribe(data => {
        console.log(data);
        if (data != null) {
          alert("Upload efetuado!");
          this.load();
        }

      },
        err => {
          console.error(err);
        }
      )
    } else {
      alert("Selecione um arquivo!")
    }
  }

  load() {
    location.reload()
  }

  //mandamos uma lista dos ficheiros (for)  recebemos um ficheiro e transformamos esse ficheiro em blob e depois redirecionamos para essa página
  search(/*url: any, imgName: any*/ file: File) {
    //console.log('url ', url);
    //console.log('image name ', imgName);
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
    //const fileName = new Blob([imgName], { type: 'application/pdf;base64' });
    //const blob = window.URL.createObjectURL(fileName);

    let blob = new Blob([file], { type: file.type });
    let url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    link.click();

    
  }

  onDelete(id: any, clientId: any, filename: any, file: File) {
    this.id = id;
    this.clientId = clientId;
    this.filename = filename;
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
    const index = this.files.indexOf(this.fileToDelete);
    if (index > -1) {
      this.files.splice(index, 1);
    }
    this.compService.delFile(this.id).subscribe(data => {
      console.log("DATA: ", data);
      if (data != null) {
        alert("Ficheiro apagado com sucesso!!");
        this.load();
      }
    },
      err => {
        console.error(err);
      }
    )
    
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
    let utf8encode = new TextEncoder();
    this.files.forEach(doc => {
      
      this.readBase64(doc).then((data) => {
        //var buf = new ArrayBuffer(data.length * 2); // 2 bytes for each char
        //var bufView = new Uint16Array(buf);
        //for (var i = 0, strLen = data.length; i < strLen; i++) {
        //  bufView[i] = data.charCodeAt(i);
        //}
        //console.log('Array ', buf);
        //console.log('String ', buf.toString());
        //console.log('Buf View ', bufView);
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
          console.log('Ficheiro foi submetido ', result);
        });
      })      
    });

    if (localStorage.getItem("returned") != null) {
      console.log("Entrei no if dos comprovativos quando faço o submit ");
      this.submissionPutTeste.processNumber = localStorage.getItem("processNumber");
      console.log("Objeto com os valores atualizados ", this.submissionPutTeste);
    }

    this.submissionService.EditSubmission(localStorage.getItem("submissionId"), this.submissionPutTeste).subscribe(result => {
      console.log('Editar sub ', result);
    });



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

  declineFirstSubmission(){
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

