import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Client } from './Client.interface';
import { FormBuilder, Validators, ReactiveFormsModule, NgForm, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { docType, docTypeENI } from './docType'
import { DataService } from '../nav-menu-interna/data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css']
})

export class ClientComponent implements OnInit {
  public clients: Client[] = [];
  public searchParameter: any;
  public result: any;
  public displayValueSearch: any;

  clientIdNew;
  ccInfo;
  newId;
  ListaDocType = docType;
  ListaDocTypeENI = docTypeENI;
  formDocType!: FormGroup;
  docType?: string = "";

  errorInput;
  errorMsg;

  hasClient: boolean = true;
  hasNewClient: boolean = true;
  showWarning: boolean = true; //sem backend: true
  showButtons: boolean = false;
  showSeguinte: boolean = false;
  showENI: boolean = false;
  resultError: string = "";
  newClient: Client = {
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

  tipologia: string;

  tempClient: any;

  @Output() nameEmitter = new EventEmitter<string>();

  public map = new Map();
  public currentPage: number;
  public subscription: Subscription;

  constructor(private router: ActivatedRoute,
    private http: HttpClient, @Inject('BASE_URL')
    private baseUrl: string, private route: Router,
    private data: DataService) {
    this.ngOnInit();
    console.log(baseUrl);
    http.get<Client[]>(baseUrl + 'BEClients/GetAllClients/').subscribe(result => {
      this.clients = result;
    }, error => console.error(error));
    this.updateData(true, 1);
    this.activateButtons(true);
    this.errorInput = "form-control campo_form_coment";

    this.initializeDefaultClient();
  }

  //TEMPORARIO!!!!
  initializeDefaultClient() {
    this.tempClient = {
      "fiscalId": "585597928",
      "companyName": "SILVESTRE LIMITADA",
      "commercialName": "CAFE CENTRAL",
      "shortName": "SILVESTRE LDA",
      "headquartersAddress": {
        "address": "Rua da Azoia 4",
        "postalCode": "2625-236",
        "postalArea": "Povoa de Santa Iria",
        "locality": "string",
        "country": "PT"
      },
      "merchantType": "COMPANY",
      "legalNature": "35",
      "crc": {
        "code": "0000-0000-0001",
        "validUntil": "2023-06-29T17:52:08.336Z"
      },
      "shareCapital": {
        "capital": 50000.20,
        "date": "2028-06-29T17:52:08.336Z"
      },
      "byLaws": "O Joao pode assinar tudo, like a boss",
      "mainEconomicActivity": "90010",
      "otherEconomicActivities": ["055111"],
      "mainOfficeAddress": {
        "address": "Rua da Azoia 4",
        "postalCode": "2625-236",
        "postalArea": "Povoa de Santa Iria",
        "locality": "string",
        "country": "PT"
      },
      "establishmentDate": "2020-03-01T17:52:08.336Z",
      "knowYourSales": {
        "estimatedAnualRevenue": 1000000,
        "averageTransactions": 30000,
        "servicesOrProductsSold": ["Cafe"],
        "servicesOrProductsDestinations": ["PT"]
      },
      "bankInformation": {
        "bank": "0033",
        "branch": "0000",
        "iban": "PT00333506518874499677629",
        "accountOpenedAt": "2020-06-29T17:52:08.336Z"
      },
      "contacts": {
        "email": "joao@silvestre.pt",
        "phone1": {
          "countryCode": "+351",
          "phoneNumber": "919654422"
        }
      },
      "documentationDeliveryMethod": "MAIL",
      "billingEmail": "joao@silvestre.pt"
    }
    
  }


  receiveSearchValue(box: string) {
    console.warn("VALOR RECEBIDO no Client", box);
    // this.searchParameter.push(box);
    this.searchParameter = (box);
  }

  getValueENI() {
    //this.activateButtons(true);
    this.http.get(this.baseUrl + 'CitizenCard/searchCC').subscribe(result => {
      if (result == null) {
        alert("Erro ao ler cartão cidadão!");
      } else {
        this.ccInfo = result;
        console.log(this.ccInfo);
      }
    }, error => console.error(error));
  }

  // Search for a client
  getValueSearch(val: string) {
    this.activateButtons(true);
    this.displayValueSearch = val;
    this.http.get<Client>(this.baseUrl + 'BEClients/GetClientById/' + this.displayValueSearch).subscribe(result => {
      if (result == null) {
        this.newClient.clientId = "0";
        this.clientIdNew = result;
        this.toggleShowWarning(false);
        this.errorInput = "form-control campo_form_coment_error";
        this.resultError = "*  Não existe Comerciante com esse número.";
        this.errorMsg = "titulo-form-error";
      } else {
        this.newClient = result;
        this.clientIdNew = this.newClient.clientId;
        this.toggleShowWarning(true);
        this.hasClient == true;

        this.errorInput = "form-control campo_form_coment";
        this.errorMsg = "";
        this.resultError = "";
      }
    }, error => console.error(error));
    return this.newClient;

  }

  sendToParent() {
    this.nameEmitter.emit(this.displayValueSearch);
  }

  toggleShowWarning(value: Boolean) {
    //There is no client
    if (value == true) {
      this.showWarning = true
      this.hasNewClient = true;
    } else {
      this.showWarning = false;
      this.hasNewClient = false;
      this.showSeguinte = false;
    }
  }

  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
  }

  //função que altera o valor do map e da currentPage
  updateData(value: boolean, currentPage: number) {
    this.map.set(1, value);
    this.data.changeData(this.map);
    this.data.changeCurrentPage(currentPage);
  }

  submit(form: any) {
  }

  changeListElementDocType(docType, e: any) {
    this.activateButtons(true);
    this.toggleShowWarning(false);
    this.docType = e.target.value;
  }

  obterSelecionado() {
    console.log("aaa");
    console.log(this.newClient.clientId);
    let navigationExtras: NavigationExtras = {
      state: {
        tipologia: this.tipologia,
        NIFNIPC: this.newClient.clientId
      }
    };

    this.route.navigate(['/clientbyid', this.tempClient.fiscalId], navigationExtras);

    //isto nao esta a aparecer na versao mais nova.
  }

  activateButtonsENI(id: boolean) {
    if (id == true) {
      this.showButtons = true;
      this.showENI = true;
      this.showWarning = false;
      this.ccInfo = null;
    } else {
      this.showButtons = false;
      this.showENI = false;
      this.showWarning = false;
      this.ccInfo = null;
    }

    this.tipologia = "ENI";
  }

  activateButtons(id: boolean) {
    if (id == true) {
      this.showButtons = true;
      this.showENI = false;
    } else {
      this.showButtons = false;
      this.showENI = false;
    }

    this.tipologia = "Company";
  }

  aButtons(id: boolean) {
    if (id == true) {
      this.showSeguinte = true
    } else {
      this.showSeguinte = false
    }
  }

  createNewClient() {
    //Funcao para ir buscar o numero do ultimo cliente e incrementar
   // this.http.post(this.baseUrl + 'BEClients/GetLastId/', this.newClient).subscribe(result => {
   //   console.log(result);
    // if (result != null) {
     //   this.newId = result;
        this.route.navigate(['/app-new-client/', this.newId]);
     // }
    //}, error => console.error(error));

  }

  close() {
    this.route.navigate(['/']);
  }

  newSearch() {
   // location.reload();

  this.route.navigate(['/client'])
  }
}
