import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Client } from './Client.interface';
import { FormBuilder, Validators, ReactiveFormsModule, NgForm, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { docType, docTypeENI } from './docType'
import { DataService } from '../nav-menu-interna/data.service';
import { Subscription } from 'rxjs';
import { ClientService } from './client.service';
import { ProcessService } from '../process/process.service';
import { Process } from '../process/process.interface';
import { TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, ModalModule } from 'ngx-bootstrap/modal';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { Configuration, configurationToken } from '../configuration';

import { readCC } from '../citizencard/CitizenCardController.js';
import { readCCAddress } from '../citizencard/CitizenCardController.js';
import { ICCInfo } from '../citizencard/ICCInfo.interface';
import { dataCC } from './dataCC.interface';
import { ReadcardService } from '../readcard/readcard.service';

import { BrowserModule } from '@angular/platform-browser';
import { SubmissionService } from '../submission/service/submission-service.service';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css']
})

export class ClientComponent implements OnInit {
  private baseUrl: string;
  private neyondBackUrl: string;

  dataCC = {};

  modalRef: BsModalRef;

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  //UUID
  UUIDAPI: string = "eefe0ecd-4986-4ceb-9171-99c0b1d14658"

  public clients: Client[] = [];
  public searchParameter: any;
  public result: any;
  public displayValueSearch: any;
  public isNoDataReadable: boolean;

  // progress bar behaviour
  public clientFirstPage: string;

  //Processo
  process: any;

  //---- Cartão de Cidadao - vars ------
  public dataCCcontents: dataCC;
  public prettyPDF = null;
  public nameCC = null;
  public nationalityCC = null;
  public birthDateCC = null;
  public cardNumberCC = null;
  public nifCC = null;
  public addressCC = null;
  public postalCodeCC = null;
  public countryCC = null;

  public okCC = null;
  public dadosCC: Array<string> = []; //apagar

  //---- Cartão de Cidadao - funcoes -----
  callreadCC() {
    readCC(this.SetNewCCData.bind(this));
    this.setOkCC();
  }
  callreadCCAddress() {
    readCCAddress(this.SetNewCCData.bind(this));
    this.setOkCC();
  }
  closeModal() {
    this.newModal.hide();
  }
  setOkCC() {
    this.okCC = true;
    this.logger.debug("okCC valor: ", this.okCC);
  }
  /**
   * Information from the Citizen Card will be associated to the client structure
   * cardNumber não é guardado?
   * 
   * */
  SetNewCCData(name, cardNumber, nif, birthDate, imgSrc, cardIsExpired,
    gender, height, nationality, expiryDate, nameFather, nameMother,
    nss, sns, address, postalCode, notes, emissonDate, emissonLocal, country, countryIssuer) {

    this.logger.debug("Name: ", name, "type: ", typeof (name));

    this.logger.debug("nationality: ", nationality);
    this.logger.debug("birthDate: ", birthDate);
    this.logger.debug("cardNumber: ", cardNumber);
    this.logger.debug("nif: ", nif);
  
    this.dataCCcontents.nomeCC = name;
    this.dataCCcontents.nationalityCC = nationality;
    // this.birthDateCC = birthDate;
    this.cardNumberCC = cardNumber; // Nº do CC
    this.dataCCcontents.nifCC = nif;
   
    this.dataCCcontents.countryCC = countryIssuer;

    if (!(address == null)) {
      this.dataCCcontents.addressCC = address;
      this.dataCCcontents.postalCodeCC = postalCode;

      var ccArrayData: Array<string> = [name, gender, height, nationality, birthDate, cardNumber, expiryDate,
        nameFather, nameMother, nif, nss, sns, notes];

      //Send to PDF
      this.prettyPDF = this.readCardService.formatPDF(ccArrayData);
    }
    else {
      
      var ccArrayData: Array<string> = [name, gender, height, nationality, birthDate, cardNumber, expiryDate,
        nameFather, nameMother, nif, nss, sns, notes, address, postalCode, country];

      //Send to PDF without address
      this.prettyPDF = this.readCardService.formatPDF(ccArrayData);
    }

  }



  UibModal: BsModalRef | undefined;
  ShowSearchResults: boolean;
  SearchDone: boolean;
  ShowAddManual: boolean;
  ValidadeSearchAddIntervenient: boolean;
  // IntervenientsTableSearch: Array<IClientResult>;
  HasInsolventIntervenients: boolean;
  BlockClientName: boolean;
  BlockNIF: boolean;
  Validations: boolean;
  DisableButtons: boolean;
  //  DocumentTypes: Array<IRefData>;
  IsInsolventCantPass: boolean;
  CCReaderPresent: boolean;
  CCReaderCCID: number;
  CCID: ICCInfo;

  //--------- fim do CC ----------------------

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
  toShowReadCC: boolean = false;
  documentType: boolean = false;
  toSearch: boolean = false;
  resultError: string = "";
  clientTypology: string = "";

  clientsToShow: Client[] = [];

  newClient: Client = {
    "clientId": "",
    "fiscalId": "22181900000011",
    "id": "",

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
      "branch": ""
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
  @Output() urlEmitter: EventEmitter<string> = new EventEmitter<string>();
  @ViewChild('newModal') newModal;


  emit(url: string) {
    this.urlEmitter.emit(url);
  }

  public map = new Map();
  public currentPage: number;
  public subscription: Subscription;

  public returned: string;
  public merchantInfo: any;

  constructor(private router: ActivatedRoute, private http: HttpClient, private logger: NGXLogger,
    @Inject(configurationToken) private configuration: Configuration,
    private route: Router, private data: DataService, private clientService: ClientService,
    private processService: ProcessService, public modalService: BsModalService,
    private submissionService: SubmissionService, private readCardService: ReadcardService) {

      this.baseUrl = configuration.baseUrl;
      this.neyondBackUrl = configuration.neyondBackUrl;

    this.ngOnInit();
    this.logger.debug(this.baseUrl);
    http.get<Client[]>(this.baseUrl + 'BEClients/GetAllClients/').subscribe(result => {
      this.clients = result;
    }, error => console.error(error));
    this.data.updateData(false, 1);
    // this.activateButtons(false);
    this.errorInput = "form-control campo_form_coment";

    this.initializeDefaultClient();
    if (this.returned !== null) { // && this.returned !== undefined
      this.logger.debug("ENTREI NO IF DO RETURNED");
      this.submissionService.GetSubmissionByProcessNumber(localStorage.getItem("processNumber")).subscribe(result => {
        this.logger.debug('Submissão retornada quando pesquisada pelo número de processo', result);
        this.submissionService.GetSubmissionByID(result[0].submissionId).subscribe(resul => {
          this.logger.debug('Submissão com detalhes mais especificos ', resul);
          this.clientService.GetClientById(resul.id).subscribe(res => {
            this.merchantInfo = res;
            this.logger.debug("MERCHANT QUE FOMOS BUSCAR ", this.merchantInfo);
            if (this.merchantInfo.merchantType == 'Corporate') {
              this.logger.debug("O tipo é empresa");
              this.activateButtons(true); // se for Empresa
              this.clientTypology = "true";
            } else {
              this.logger.debug("O tipo é ENI");
              this.activateButtons(false); // se for ENI
              this.clientTypology = "false";
            }
          });
        });
      });
    }
  }

  //TEMPORARIO
  initializeDefaultClient() {
    this.tempClient = {
      "id": "",
      "merchantId": "",
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
      "crc": {
        "code": "",
        "validUntil": ""
      },
      "shareCapital": {
        "capital": 0,
        "date": ""
      },
      "byLaws": "",
      "mainEconomicActivity": "",
      "otherEconomicActivities": [""],
      "mainOfficeAddress": {
        "address": "",
        "postalCode": "",
        "postalArea": "",
        "locality": "",
        "country": ""
      },
      "establishmentDate": "",
      "knowYourSales": {
        "estimatedAnualRevenue": 1000000,
        "averageTransactions": 30000,
        "servicesOrProductsSold": [""],
        "servicesOrProductsDestinations": [""]
      },
      "bankInformation": {
        "bank": "",
        "branch": "",
        "iban": "",
        "accountOpenedAt": ""
      },
      "contacts": {
        "email": "",
        "phone1": {
          "countryCode": "",
          "phoneNumber": ""
        }
      },
      "documentationDeliveryMethod": "",
      "billingEmail": ""
    }
    
  }

  receiveSearchValue(box: string) {
    console.warn("VALOR RECEBIDO no Client", box);
    // this.searchParameter.push(box);
    this.searchParameter = (box);
  }

  getValueENI() {
   // this.activateButtons(true);
    this.logger.debug("chamar a funcao de leitura do cartao: ");
    this.http.get(this.neyondBackUrl + 'CitizenCard/searchCC').subscribe(result => {
      if (result == null) {
        alert("Erro ao ler cartão cidadão!");
      } else {
        this.ccInfo = result;
        this.logger.debug(this.ccInfo);
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
        this.resultError = "Não existe Comerciante com esse número.";
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


  searchClient() {
    this.logger.debug(this.newClient.clientId);

    var context = this;

    /*this.onSearchSimulation(22181900000011);*/
    this.clientService.SearchClientByQuery(this.newClient.clientId, "por mudar", "por mudar", "por mudar").subscribe(o => {
      this.showFoundClient = true;
      var clients = o;

      var context2 = this;

      this.logger.debug("a");
      this.logger.debug(context.clientsToShow);
      context.clientsToShow = [];
      this.logger.debug(context.clientsToShow);
      if (clients.length > 0) {
        clients.forEach(function (value, index) {
          context.logger.debug(value);
          context2.clientService.getClientByID(value.merchantId, "por mudar", "por mudar").subscribe(c => {
            context.logger.debug(c);
            var client = {
              "clientId": c.merchantId,
              "commercialName": c.commercialName,
              "address": "Rua Gomes Artur",
              "ZIPCode": "1000-001",
              "locality": "Lisboa",
              "country": "Portugal",
            }
            context.clientsToShow.push(client);
            context.logger.debug(context.clientsToShow);
          });
        })
      } else {
        this.showFoundClient = false;
        context.resultError = "Não existe Comerciante com esse número.";
        this.searchDone = true;
      }
    }, error => {
      context.showFoundClient = false;
      context.resultError = "Não existe Comerciante com esse número.";
      this.searchDone = true;

    });
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
      this.logger.debug("Cliente Encontrado");
      this.showFoundClient = true;

    }
    if (!(idToSeacrh==22181900000011)) {
      this.showFoundClient = false;
      this.resultError = "Não existe Comerciante com esse número.";
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
    this.modalService.onHide.subscribe((e) => {
      this.logger.debug('close', this.modalService);
    });
    this.returned = localStorage.getItem("returned");

    var context = this;

    var processToInsert = {
      "processNumber": "5",
      "goal": "merchantOnboarding",
      "startedByUsername": "string",
      "startedByBranch": "string",
      "startedByPartner": "string",
      "startedAt": "2022-05-05"
    } as Process;

    this.processService.startProcess(processToInsert, "por mudar", "1").subscribe(o => {
      this.logger.debug("começou um processo");
      this.logger.debug(o);

      context.process = o;

      this.logger.debug(context.process);
    });
  }


  submit(form: any) {
  }

  changeListElementDocType(docType, e: any) {
    // this.activateButtons(true);
    this.toggleShowFoundClient(false);
    this.docType = e.target.value;
    if (this.docType === '004') { //código do Cartão do Cidadão
      this.isCC = true;
    } else {
      this.isCC = false;
    }
    this.documentType = true;
  }

  changeDocType(){
    this.documentType = true;
  }


  obterSelecionado() {
    this.logger.debug(this.clientId);

    var NIFNIPC = '';
    this.logger.debug("DOCUMENTAIONDELIVERYMETHOD -->");
    this.logger.debug(this.newClient.documentationDeliveryMethod);
    if (this.newClient.documentationDeliveryMethod === '002' || this.newClient.documentationDeliveryMethod === '005') {
      this.logger.debug("entrou aqui no if complexo");
      NIFNIPC = this.newClient.clientId;
    }

    if (this.newClient.documentationDeliveryMethod === '004') {
      this.dataCC = {
        nomeCC: this.nameCC,
        cardNumberCC: this.cardNumberCC,
        nifCC: this.nifCC,
        addresssCC: this.addressCC,
        postalCodeCC: this.postalCodeCC
      }
    }
    this.logger.debug("antes de passar");
      let navigationExtras: NavigationExtras = {
        state: {
          tipologia: this.tipologia,
          NIFNIPC: NIFNIPC,
          clientExists: true,
          clientId: this.clientId,
          dataCC: this.dataCC
        }
      };
    this.logger.debug("a passar para a proxima pagina");
      this.route.navigate(['/clientbyid', this.tempClient.fiscalId], navigationExtras);

    //isto nao esta a aparecer na versao mais nova.
  }
  /**
   *
   * @param readable: true: quero ler o CC; false: não quer ler o CC
   */
  changeDataReadable(readable: boolean){
    this.isNoDataReadable=readable;
    this.toSearch = false;
    this.toShowReadCC = readable;
  }

  //Modal que questiona se tem o PIN da Morada
  launchNewModal() {
    this.newModal = this.modalService.show(this.newModal, { class: 'modal-sm' })
    this.newModal.result.then(function (result: boolean): void {
      if (result) {
        this.Window.readCCAddress();
      } else {
        this.logger.debug("fechar");
        this.Window.readCC();

        this.closeModal();
      }
    }.bind(this));
  }

  activateButtons(id: boolean) {
    this.logger.debug("Client typology: ", this.clientTypology);
    this.logger.debug("isCC:  ", this.isCC, this.isCC);
    this.logger.debug("showENI:  ", this.showENI);
    this.showFoundClient = false;
    this.ccInfo = null;
    this.showButtons = true;
    this.isCC = false;
    this.toSearch = false;
    this.documentType = false;
    if (id == true) {
      this.showENI = false;
      this.isENI=false;
      this.tipologia = "Company";

    } else {
      this.showENI = true;
      this.isENI=true;
      this.tipologia = "ENI";
    }
  }

  clientId: string

  aButtons(id: boolean, clientId: string) {
    if (id == true) {
      this.showSeguinte = true
      this.clientId = clientId;
    } else {
      this.showSeguinte = false
    }
  }

  createNewClient(clientId: string) {
    var NIFNIPC = ''
    if (this.newClient.documentationDeliveryMethod === '002' || this.newClient.documentationDeliveryMethod === '005') {
      this.logger.debug("entrou aqui no if complexo");
      NIFNIPC = this.newClient.clientId;
    }

    let navigationExtras: NavigationExtras = {
      state: {
        tipologia: this.tipologia,
        NIFNIPC: NIFNIPC,
        exists: false
      }
    };
    this.route.navigate(['/clientbyid', clientId], navigationExtras);
  //this.route.navigate(['client-additional-info/88dab4e9-3818-4491-addb-f518ae649e5a']);
  }

  close() {
    this.route.navigate(['/']);
  }

  newSearch() {
   // location.reload();
  this.route.navigate(['/client'])
  }
}
