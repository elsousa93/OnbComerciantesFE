import { HttpClient } from '@angular/common/http';
import { Renderer2 } from '@angular/core';
import { Component, Inject, Input, OnInit, VERSION, ViewChild } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription, take } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { Client } from '../client/Client.interface';
import { DataService } from '../nav-menu-interna/data.service';
import { CheckDocumentsComponent } from './check-documents/check-documents.component';
import { IComprovativos } from './IComprovativos.interface';
import { ComprovativosService } from './services/comprovativos.services';


@Component({
  selector: 'app-comprovativos',
  templateUrl: './comprovativos.component.html'
})
export class ComprovativosComponent implements OnInit {
  public comprovativos: IComprovativos[] = [];

  public newComp: IComprovativos = {
    "id": 0,
    "clientId": "",
    "filename": "",
    "url": ""
  };

  public client: Client = {
    "clientId": "",
    "fiscalId": "",
    "companyName": "",
    "contactName": "",
    "shortName": "",
    "observations": "",
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
    "bylaws": "",
    "mainEconomicActivity": {
      "code": "",
      "branch": ""
    },
    "otherEconomicActivities": [
      {
        "code": "",
        "branch": ""
      },
      {
        "code": "",
        "branch": ""
      }
    ],
    "mainOfficeAddress": {
      "address": "",
      "postalCode": "",
      "postalArea": "",
      "country": ""
    },
    "establishmentDate": "2009-12-16",
    "businessGroup": {
      "type": "",
      "fiscalId": ""
    },
    "sales": {
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
  localUrl: any;
  fileName: any;
  urlImage: string | any;
  mostrar: boolean = false;
  deleteModalRef: BsModalRef | undefined;
  checkListModalRef: BsModalRef | undefined;
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
  constructor(public http: HttpClient, @Inject('BASE_URL') baseUrl: string, private route: Router, private router: ActivatedRoute, private compService: ComprovativosService, private renderer: Renderer2,
  private modalService: BsModalService, private data: DataService) {

    this.url = baseUrl;
    this.ngOnInit();
    http.get<Client>(baseUrl + 'BEClients/GetClientById/' + this.clientNr).subscribe(result => {
      this.client = result;
    }, error => console.error(error));
    http.get<IComprovativos[]>(baseUrl + `BEComprovativos/` + this.clientNr).subscribe(result => {
      this.comprovativos = result;
      console.log(result);
    }, error => console.error(error));
    this.updateData(true, 2);
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
    this.file = <File>event.target.files[0];
    const sizeFile = this.file.size / (1024 * 1024);
    var extensoesPermitidas = /(.pdf)$/i;
    const limSize = 10;

    this.newComp.clientId = String(this.clientNr);
    console.log(this.clientNr);
    this.http.post(this.url + 'ServicesComprovativos/GetLastId/', this.newComp).subscribe(result => {
      console.log(result);
      if (result != null) {
        this.compClientId = result;
        if ((sizeFile <= limSize) && (extensoesPermitidas.exec(this.file.name))) {
          if (event.target.files && event.target.files[0]) {
            var reader = new FileReader();
            reader.onload = (event: any) => {
              this.localUrl = event.target.result;
            }
            reader.readAsDataURL(event.target.files[0]);
            this.uploadFile(comp.clientId, this.compClientId);
          }
        } else {
          alert("Verifique o tipo / tamanho do ficheiro");
        }
      }
    }, error => console.error(error));
  }

  uploadFile(id: any, compClient: any) {
    if (this.file != undefined) {
      this.compService.uploadFile(this.file, id, compClient).subscribe(data => {
        if (data != null) {
          alert("Upload efetuado!");
          var elemento = document.getElementById(id);
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

  search(url: any, imgName: any) {
    window.open(url + imgName, '_blank',
      `margin: auto;
      width: 50%;
      padding: 10px;
      text-align: center;
      border: 3px solid green;
      `);

  }

  download(url: any, imgName: any) {
    const fileName = new Blob([imgName], { type: 'application/pdf;base64' });
    const blob = window.URL.createObjectURL(fileName);
    const link = document.createElement('a');
    link.href = blob;
    link.download = imgName;
    link.click();
  }

  onDelete(id: any, clientId: any, filename: any) {
    this.id = id;
    this.clientId = clientId;
    this.filename = filename;
    this.deleteModalRef = this.modalService.show(this.deleteModal, { class: 'modal-sm' });
  }

  obterStakeholders() {
    this.route.navigate(['stakeholders/']);
  }

  confirmDelete() {
    this.deleteModalRef?.hide();
    this.compService.delFile(this.id,this.clientId,this.filename).subscribe(data => {
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

  declineCheckList() {
    this.checkListModalRef?.hide();
  }
}