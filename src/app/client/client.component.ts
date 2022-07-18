import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Client } from './Client.interface';
import { FormBuilder, Validators, ReactiveFormsModule, NgForm, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { docType, docTypeENI } from './docType'
import { DataService } from '../nav-menu-interna/data.service';
import { Subscription } from 'rxjs';
import { ClientService } from './client.service';

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
  public isNoDataReadable: boolean;
  

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

  //Pesquisa 
  showFoundClient: boolean = false;     //sem backend: true // antigo nome: showWarning
  idToSeacrh: number;
  searchDone: boolean = false;

  showButtons: boolean = false;
  
  showSeguinte: boolean = false;
  showENI: boolean = false;
  isENI: boolean = false;
  isCC: boolean = false;
  toSearch: boolean = false;
  resultError: string = "";
  clientTypology: string ="";
  newClient: Client = {
    "clientId": "22181900000011",
    "fiscalId": "22181900000011",
    "id": "22181900000011",

    "companyName": "J SILVESTRE LIMITADA",
    "commercialName":"CAFE CENTRAL",
    "shortName": "SILVESTRE LDA",
    "headquartersAddress": {
      "address": "Rua da Azoia 4",
      "postalCode": "2625-236",
      "postalArea": "Povoa de Santa Iria",
      "locality": "Lisboa",
      "country": "PT"
    },
    "merchantType": "Company",
    "legalNature": "35",
    "legalNature2": "",
    "crc": {
      "code": "0000-0000-0001",
      "validUntil": "2023-06-29T17:52:08.336Z"
    },
    "shareCapital": {
      "capital": 50000.20,
      "date": "1966-08-30"
    },
    "byLaws": "O Joao pode assinar tudo",
    "mainEconomicActivity": "90010",
    "otherEconomicActivities": ["055111"],
    "mainOfficeAddress": {
      "address": "Rua da Azoia 4",
      "postalCode": "2625-236",
      "postalArea": "Povoa de Santa Iria",
      "country": "Lisbon",
      "locality": "PT"
    },
    "establishmentDate": "2009-12-16",
    "businessGroup": {
      "type": "",
      "fiscalId": ""
    },
    "knowYourSales": {
      "estimatedAnualRevenue": 1000000,
      "averageTransactions": 30000,
      "servicesOrProductsSold": [
        "Cafe",
        "Pastelaria"
      ],
      "servicesOrProductsDestinations": [
        "PT",
        "ES"
      ]
    },
    "foreignFiscalInformation": {
      "issuerCountry": "",
      "issuanceIndicator": "",
      "fiscalId": "",
      "issuanceReason": ""
    },
    "contacts": {
      "email": "joao@silvestre.pt",
      "phone1": {
        "countryCode": "+351",
        "phoneNumber": "919654422"
      }
    },
    "documentationDeliveryMethod": "Mail",
    "billingEmail": "joao@silvestre.pt"
  };

  tipologia: string;

  tempClient: any;

  @Output() nameEmitter = new EventEmitter<string>();

  public map = new Map();
  public currentPage: number;
  public subscription: Subscription;

  constructor(private router: ActivatedRoute, private http: HttpClient, @Inject('BASE_URL')
  private baseUrl: string, @Inject('NEYONDBACK_URL')
    private neyondBackUrl: string, private route: Router, private data: DataService, private clientService: ClientService) {

    this.ngOnInit();
    console.log(baseUrl);
    http.get<Client[]>(baseUrl + 'BEClients/GetAllClients/').subscribe(result => {
      this.clients = result;
    }, error => console.error(error));
    this.updateData(false, 1);
    // this.activateButtons(false);
    this.errorInput = "form-control campo_form_coment";

    this.initializeDefaultClient();
  }

  //TEMPORARIO!!!!
  initializeDefaultClient() {
    this.tempClient = {
      "id": "22181900000011",
      "merchantId": "22181900000021",
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
      "merchantType": "Company",
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
    console.log("chamar a funcao de leitura do cartao: ");
    this.http.get(this.neyondBackUrl + 'CitizenCard/searchCC').subscribe(result => {
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
        this.toggleShowFoundClient(false);
        this.errorInput = "form-control campo_form_coment_error";
        this.resultError = "*  Não existe Comerciante com esse número.";
        this.errorMsg = "titulo-form-error";
      } else {
        this.newClient = result;
        this.clientIdNew = this.newClient.clientId;
        this.toggleShowFoundClient(true);
        this.hasClient == true;

        this.errorInput = "form-control campo_form_coment";
        this.errorMsg = "";
        this.resultError = "";
      }
    }, error => console.error(error));
    return this.newClient;

  }

  /**
   * SIMULAÇÃO da Pesquisa -- Enquanto não temos API
   * Chamar esta função no botão de Pesquisar
   * 
   **/
  onSearchSimulation(idToSeacrh: number) {
    //No New SubmissionResponse, este é o valor do merchant.id
    if (idToSeacrh == 22181900000011) {
     //Cliente Encontrado
      console.log("Cliente Encontrado");
      this.showFoundClient = true;

    }
    if (!(idToSeacrh==22181900000011)) {
      this.showFoundClient = false;
      this.resultError = "*  Não existe Comerciante com esse número.";
    }

    this.searchDone = true;
  }

  changeSearch(){
    this.toSearch=true;
  }

  sendToParent() {
    this.nameEmitter.emit(this.displayValueSearch);
  }

  toggleShowFoundClient(value: Boolean) {
    //There is no client
    if (value == true) {
      this.showFoundClient = true
      this.hasNewClient = true;
    } else {
      this.showFoundClient = false;
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
    this.map.set(currentPage, value);
    this.data.changeData(this.map);
    this.data.changeCurrentPage(currentPage);
  }

  submit(form: any) {
  }

  changeListElementDocType(docType, e: any) {
    // this.activateButtons(true);
    this.toggleShowFoundClient(false);
    this.docType = e.target.value;
    if (this.docType === 'Cartão do Cidadão') {
      this.isCC = true;
    } else {
      this.isCC = false;
    }
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

  // activateButtonsENI(id: boolean) {
  //   if (id == true) {
  //     this.showENI = true;
  //     this.showFoundClient = false;
  //     this.ccInfo = null;
  //     this.isENI=true;
  //     this.showButtons = true;
  //     this.isCC=false;
  //   } else {
  //     this.showENI = false;
  //     this.showFoundClient = false;
  //     this.ccInfo = null;
  //     this.isENI = false;
  //     this.showButtons = true;
  //     this.isCC=false;
  //   }

  //   this.tipologia = "ENI";
  // }

  changeDataReadable(readable: boolean){
    this.isNoDataReadable=readable;
    this.toSearch = false;
  }

  activateButtons(id: boolean) {
    this.showFoundClient = false;
    this.ccInfo = null;
    this.showButtons = true;
    this.isCC = false;
    this.toSearch = false;
    if (id == true) {
      this.showENI = false;
      this.isENI=false;

    } else {
      this.showENI = true;
      this.isENI=true;
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
        this.route.navigate(['/app-new-client/']);
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
