import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Renderer2 } from '@angular/core';
import { Component, Inject, Input, OnInit, VERSION, ViewChild } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription, take } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { Client } from '../client/Client.interface';
import { ClientService } from '../client/client.service';
import { DataService } from '../nav-menu-interna/data.service';
import { StakeholderService } from '../stakeholders/stakeholder.service';
import { SubmissionService } from '../submission/service/submission-service.service';
import { CheckDocumentsComponent } from './check-documents/check-documents.component';
import { IComprovativos } from './IComprovativos.interface';
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
  public compToShow: {tipo:string, interveniente: string, dataValidade: string, dataEntrada: string, status: string};

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

  submission: any;
  submissionClient: any;
  stakeholdersList: any[] = [];

  constructor(public http: HttpClient, @Inject('BASE_URL') baseUrl: string, private route: Router, private router: ActivatedRoute, private compService: ComprovativosService, private renderer: Renderer2,
    private modalService: BsModalService, private data: DataService, private submissionService: SubmissionService, private clientService: ClientService, private stakeholderService: StakeholderService) {

    this.url = baseUrl;
    this.ngOnInit();
    http.get<Client>(baseUrl + 'BEClients/GetClientById/' + this.clientNr).subscribe(result => {
      this.client = result;
    }, error => console.error(error));
    http.get<IComprovativos[]>(baseUrl + `BEComprovativos/` + this.clientNr).subscribe(result => {
      this.comprovativos = result;
      console.log(result);
    }, error => console.error(error));
    this.updateData(false, 4);

    this.submissionService.GetSubmissionByID("1a1e127a-ef25-49a1-a0c6-4e99b3c4c949").subscribe(result => {
      this.submission = result;
    });

    this.clientService.getClientByID(this.submission.merchant.id, "8ed4a062-b943-51ad-4ea9-392bb0a23bac", "22195900002451", "fQkRbjO+7kGqtbjwnDMAag==").subscribe(result => {
      this.submissionClient = result;
    });

    this.submission.stakeholders.forEach(stake => {
      this.stakeholderService.getStakeholderByID(stake.stakeholderId, "8ed4a062-b943-51ad-4ea9-392bb0a23bac", "22195900002451", "fQkRbjO+7kGqtbjwnDMAag==").subscribe(result => {
        this.stakeholdersList.push(result);
      });
    });
    console.log('Submission ', this.submission);
    console.log('Client ', this.client);
    console.log('stakeholders list ', this.stakeholdersList);
  }

  ngOnInit(): void {
    this.clientNr = Number(this.router.snapshot.params['id']);
    //console.log(String(this.router.snapshot.params['pagename']));
    this.pageName = String(this.router.snapshot.params['pageName']);
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
  }

  //função que altera o valor do map e da currentPage
  updateData(value: boolean, currentPage: number) {
    this.map.set(currentPage, value);
    this.data.changeData(this.map);
    this.data.changeCurrentPage(currentPage);
  }

  selectFile(event: any, comp: any) {
    this.compToShow = { tipo: "pdf", interveniente: "Manuel", dataValidade: new Date() + "", dataEntrada: new Date() + "", status: "A ser avaliado" }
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
    this.deleteModalRef = this.modalService.show(this.deleteModal, { class: 'modal-sm' });
    this.fileToDelete = file;
  }

  obterOfertaComercial() {
    this.route.navigate(['/commercial-offert-list']);
  }

  firstSubmission() {
    this.firstSubmissionModalRef = this.modalService.show(this.firstSubmissionModal, { class: 'modal-sm' });
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

  continue() {
    this.firstSubmissionModalRef?.hide();
    this.route.navigate(['/commercial-offert-list']);
  }

  back() {
    this.firstSubmissionModalRef?.hide();
  }

  declineCheckList() {
    this.checkListModalRef?.hide();
  }

  ngAfterViewInit() {
    this.onCheckList();
  }

  validatedDocumentsChange(value: boolean) {
    this.validatedDocuments = value;
  }
}
