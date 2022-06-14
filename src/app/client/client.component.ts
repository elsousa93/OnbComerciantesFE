import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Client } from './Client.interface';
import { FormBuilder, Validators, ReactiveFormsModule, NgForm, FormGroup } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { docType } from './docType'
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
  newId;
  ListaDocType = docType;
  formDocType!: FormGroup;
  docType?: string = "";

  errorInput;
  errorMsg;

  hasClient: boolean = true;
  hasNewClient: boolean = true;
  showWarning: boolean = false;
  showButtons: boolean;
  showSeguinte: boolean = false;
  resultError: string = "";
  newClient: Client = {
    "clientId": "",
    "fiscalId": "",
    "companyName": "",
    "contactName": "",
    "shortName": "",
    "headquartersAddress": {
      "address": "",
      "postalCode": "",
      "postalArea": "",
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

  @Output() nameEmitter = new EventEmitter<string>();

  public map = new Map();
  public currentPage: number;
  public subscription : Subscription;

  constructor(private router: ActivatedRoute,
    private http: HttpClient, @Inject('BASE_URL')
    private baseUrl: string, private route: Router,
    private data: DataService) {
    this.ngOnInit();
    console.log(baseUrl);
    http.get<Client[]>(baseUrl + 'BEClients/GetAllClients/').subscribe(result => {
      this.clients = result;
    }, error => console.error(error));
    this.updateData(true,1);
    //this.activateButtons(true);
    this.errorInput = "form-control campo_form_coment";
  }


  receiveSearchValue(box: string) {
    console.warn("VALOR RECEBIDO no Client", box);
    // this.searchParameter.push(box);
    this.searchParameter = (box);
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

  obterSelecionado(id: any) {

    let navigationExtras: NavigationExtras = {
      state: {
        isCompany: this.showButtons
      } 
    }; 
    this.route.navigate(['/clientbyid/', id], navigationExtras);

    //isto nao esta a aparecer na versao mais nova.
  }

  activateButtons(id: boolean) {
    if (id == true) {
      this.showButtons = true
    } else {
      this.showButtons = false
    }
  }

  aButtons(id: boolean) {
    if (id == true) {
      this.showSeguinte = true
    } else {
      this.showSeguinte = false
    }
  }

  createNewClient() {
    this.http.post(this.baseUrl + 'BEClients/GetLastId/',this.newClient).subscribe(result => {
      console.log(result);
      if (result != null) {
        this.newId = result;
        this.route.navigate(['/app-new-client/', this.newId]);
      }
    }, error => console.error(error));
    
  }

  close() {
    this.route.navigate(['/']);
  }

  newSearch() {
    location.reload();
  }
}
