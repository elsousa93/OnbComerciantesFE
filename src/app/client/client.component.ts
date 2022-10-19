import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Client } from './Client.interface';
import { FormBuilder, Validators,FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { DataService } from '../nav-menu-interna/data.service';
import { Subscription } from 'rxjs';
import { ClientService } from './client.service';
import { TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Configuration, configurationToken } from '../configuration';

import { readCC } from '../citizencard/CitizenCardController.js';
import { readCCAddress } from '../citizencard/CitizenCardController.js';
import { ICCInfo } from '../citizencard/ICCInfo.interface';
import { dataCC } from '../citizencard/dataCC.interface';
import { ReadcardService } from '../readcard/readcard.service';

import { SubmissionService } from '../submission/service/submission-service.service';
import { LoggerService } from 'src/app/logger.service';
import { FileAndDetailsCC } from '../readcard/fileAndDetailsCC.interface';
import { TableInfoService } from '../table-info/table-info.service';
import { UserTypes } from '../table-info/ITable-info.interface';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css']
})

export class ClientComponent implements OnInit {
  private baseUrl: string;
  private neyondBackUrl: string;

  dataCC = null;

  modalRef: BsModalRef;

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  //UUID
  UUIDAPI: string = "eefe0ecd-4986-4ceb-9171-99c0b1d14658"

  public clients: Client[] = [];
  public newClientForm: FormGroup;
  public searchClientForm: FormGroup;
  public searchParameter: any;
  public result: any;
  public displayValueSearch: any;
  public isNoDataReadable: boolean;

  // progress bar behaviour
  public clientFirstPage: string;

  //Processo
  process: any;

  //---- Cartão de Cidadao - vars ------
  public dataCCcontents = null;
  public prettyPDF: FileAndDetailsCC = null;

  //Variaveis para imprimir no html
  public nameCC = null;
  public nationalityCC = null;
  public birthDateCC = null;
  public cardNumberCC = null;
  public nifCC = null;
  public addressCC = null;
  public postalCodeCC = null;
  public countryCC = null;
  public localityCC = null;

  public okCC = false;
  public dadosCC: Array<string> = []; //apagar
  public addressReading = null;
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
    this.logger.debug("okCC valor: " + this.okCC);
  }
  setAddressFalse() {
    this.addressReading = false;
  }
  /**
   * Information from the Citizen Card will be associated to the client structure
   * 
   * 
   * */
  SetNewCCData(name, cardNumber, nif, birthDate, imgSrc, cardIsExpired,
    gender, height, nationality, expiryDate, nameFather, nameMother,
    nss, sns, address, postalCode, notes, emissonDate, emissonLocal, country, countryIssuer) {

    this.dataCCcontents = {}

    this.dataCCcontents.nameCC = name;
    this.dataCCcontents.nationalityCC = nationality;
    this.dataCCcontents.birthdateCC = birthDate;
    this.dataCCcontents.cardNumberCC = cardNumber; // Nº do CC
    this.dataCCcontents.nifCC = nif;
    this.dataCCcontents.localityCC = postalCode.split(" ").pop();
    if (this.dataCCcontents.localityCC == null) {
      this.dataCCcontents.localityCC = '';
    }

    this.dataCCcontents.postalCode = postalCode;
    this.dataCCcontents.notes = notes;
    this.dataCCcontents.sns = sns;
    this.dataCCcontents.nss = nss;
    this.dataCCcontents.height = height;
    this.dataCCcontents.gender = gender;
    this.dataCCcontents.countryCC = country;
    this.countryCC = countryIssuer; //HTML

    var expireDate = expiryDate.replaceAll(" ", "/").split("/");
    var date = expireDate[1] + "/" + expireDate[0] + "/" + expireDate[2];
    this.dataCCcontents.expiryDate = new Date(date).toISOString();

    this.dataCCcontents.emissonDate = emissonDate;
    this.dataCCcontents.emissonLocal = emissonLocal;

    this.dataCCcontents.countryIssuer = countryIssuer;
    this.dataCCcontents.imgSrc = imgSrc;
    this.dataCCcontents.cardIsExpired = cardIsExpired;

    if (notes != null || notes != "") {
      var assinatura = "Sabe assinar";
      if (notes.toLowerCase().includes("não sabe assinar") || notes.toLowerCase().includes("não pode assinar")) {
        assinatura = "Não sabe assinar";
      }
    }

    if (this.addressReading == false) {

      //Without address
      this.dataCCcontents.addressCC = "Sem PIN de morada";
      this.dataCCcontents.postalCodeCC = " ";
      this.dataCCcontents.countryCC = " ";

      var ccArrayData: Array<string> = [name, gender, height, nationality, birthDate, cardNumber, expiryDate,
        emissonLocal, nameFather, nameMother, nif, nss, sns, assinatura, this.dataCCcontents.addressCC, this.dataCCcontents.postalCodeCC, this.dataCCcontents.countryCC];


      //Send to PDF without address -- type base64
      this.readCardService.formatPDF(ccArrayData).then(resolve => {
        this.prettyPDF = resolve;
      });

    } else {

      //WITH ADDRESS
      this.dataCCcontents.addressCC = address;
      this.dataCCcontents.postalCodeCC = postalCode;

      var ccArrayData: Array<string> = [name, gender, height, nationality, birthDate, cardNumber, expiryDate,
        emissonLocal, nameFather, nameMother, nif, nss, sns, assinatura, address, postalCode, country];

      //Send to PDF
      this.readCardService.formatPDF(ccArrayData).then(resolve => {
        this.prettyPDF = resolve;
      });
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
  BlockDocumentNumber: boolean = false; //if you want to read the CC NEW
  //  DocumentTypes: Array<IRefData>;
  IsInsolventCantPass: boolean;
  CCReaderPresent: boolean;
  CCReaderCCID: number;
  CCID: ICCInfo;

  @ViewChild('newModal') newModal;
  //--------- fim do CC ----------------------

  clientIdNew;
  ccInfo;
  newId;
  // ListaDocType = docType;
  // ListaDocTypeENI = docTypeENI;

  ListaDocType;
  ListaDocTypeENI;
  formDocType!: FormGroup;
  docType?: string = "";

  errorInput;
  errorMsg;

  hasClient: boolean = true;
  hasNewClient: boolean = true;
  isClient: boolean;

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
  clientNr: boolean = false;

  clientsToShow: { client: Client, isClient: boolean }[] = [];

  newClient: Client = {
    "clientId": "",
    "fiscalId": "22181900000011",
    "id": "",
    "companyName": "J SILVESTRE LIMITADA",
    "commercialName": "CAFE CENTRAL",
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
      "transactionsAverage": 30000,
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

  @Output() nameEmitter = new EventEmitter<string>();
  @Output() urlEmitter: EventEmitter<string> = new EventEmitter<string>();

  @ViewChild(MatSort) sort: MatSort;
  

  displayedColumns: string[] = ['select','clientNumber', 'commercialName', 'address' ,'ZIPCode', 'locale', 'country'];

  selectedClient: {
    client?: Client,
    idx?: number
  } = {};

  clientID: string = '';

  @Input() currentIdx?: number;

  emit(url: string) {
    this.urlEmitter.emit(url);
  }

  public map = new Map();
  public currentPage: number;
  public subscription: Subscription;

  public returned: string;
  public merchantInfo: any;
  public notFound: boolean = false;

  public subs: Subscription[] = [];

  constructor(private router: ActivatedRoute, private http: HttpClient, private logger: LoggerService, private formBuilder: FormBuilder,
    @Inject(configurationToken) private configuration: Configuration, private translate: TranslateService,
    private route: Router, private data: DataService, private clientService: ClientService,
    private tableInfo: TableInfoService, public modalService: BsModalService,
    private submissionService: SubmissionService, private readCardService: ReadcardService, private snackBar: MatSnackBar) {

    this.baseUrl = configuration.baseUrl;
    this.neyondBackUrl = configuration.neyondBackUrl;

    this.subs.push(this.tableInfo.GetAllSearchTypes(UserTypes.MERCHANT).subscribe(result => {
      this.ListaDocType = result;
      this.ListaDocType = this.ListaDocType.sort((a, b) => a.description> b.description? 1 : -1); //ordenar resposta
    }), (this.tableInfo.GetAllSearchTypes(UserTypes.STAKEHOLDER).subscribe(result => {
      this.ListaDocTypeENI = result;
      this.ListaDocTypeENI = this.ListaDocTypeENI.sort((a, b) => a.description> b.description? 1 : -1); //ordenar resposta
    })));

    // this.subs.push(this.tableInfo.GetAllSearchTypes(UserTypes.STAKEHOLDER).subscribe(result => {
    //   this.ListaDocTypeENI = result;
    // }));

    this.ngOnInit();
    this.clientsMat.sort = this.sort;
    this.initializeForm();
    this.logger.debug(this.baseUrl);
    this.data.updateData(false, 1);
    // this.activateButtons(false);
    this.errorInput = "form-control campo_form_coment";

    //if (this.returned != null) { // && this.returned !== undefined
    //  this.logger.debug("ENTREI NO IF DO RETURNED");
    //  this.submissionService.GetSubmissionByProcessNumber(localStorage.getItem("processNumber")).subscribe(result => {
    //    this.logger.debug('Submissão retornada quando pesquisada pelo número de processo' + result);
    //    this.submissionService.GetSubmissionByID(result[0].submissionId).subscribe(resul => {
    //      this.logger.debug('Submissão com detalhes mais especificos ' + resul);
    //      this.clientService.GetClientByIdAcquiring(resul.id).then(res => {
    //        this.merchantInfo = res;
    //        this.logger.debug("MERCHANT QUE FOMOS BUSCAR " + this.merchantInfo);
    //        if (this.merchantInfo.merchantType == 'Corporate') {
    //          this.logger.debug("O tipo é empresa");
    //          this.tipologia = 'Corporate';
    //          this.activateButtons(true); // se for Empresa
    //          this.clientTypology = "true";
    //        } else {
    //          this.logger.debug("O tipo é ENI");
    //          this.tipologia = 'ENI';
    //          this.activateButtons(false); // se for ENI
    //          this.clientTypology = "false";
    //        }
    //      });
    //    });
    //  });
    //}
  }

  clientsMat = new MatTableDataSource<any>();
  @ViewChild('paginator') set paginator(pager:MatPaginator) {
    if (pager) {
      this.clientsMat.paginator = pager;
      this.clientsMat.paginator._intl = new MatPaginatorIntl();
      this.clientsMat.paginator._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');
    }
  }

  receiveSearchValue(box: string) {
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
    }, error => this.logger.error(error));
  }
  getNIFNIPC() {
    if (this.newClient.documentationDeliveryMethod === '0502' || this.newClient.documentationDeliveryMethod === '0501') {
      return this.newClient.clientId;
    }

    if (this.newClient.documentationDeliveryMethod === '1001') {
      this.dataCC = {
        nameCC: this.nameCC,
        cardNumberCC: this.cardNumberCC,
        nifCC: this.nifCC,
        addresssCC: this.addressCC,
        postalCodeCC: this.postalCodeCC
      };
      return this.nifCC;
    }

    if (this.newClientForm?.get("nif") ?? this.newClientForm?.get("nipc")) {
      return this.newClientForm?.get("nif")?.value ?? this.newClientForm?.get("nipc")?.value;
    }
  }

  searchClient() {

    this.logger.debug(this.newClient.clientId);

    var context = this;
    this.newClientForm = null;

    this.clientService.SearchClientByQuery(this.newClient.clientId, "por mudar", "por mudar", "por mudar").subscribe(o => {
      this.showFoundClient = true;
      var clients = o;

      var context2 = this;

      
      this.logger.debug(context.clientsToShow);
      context.clientsToShow = [];
      this.logger.debug(context.clientsToShow);
      if (clients.length > 0) {
        context.resultError = "";
        clients.forEach(function (value, index) {
          context.logger.debug(value);
          var clientToShow = {
            client: undefined,
            isClient: value.isClient
          } as {
            client: Client,
            isClient: boolean
          }

          if (clients.length===1){
            context.snackBar.open(context.translate.instant('client.find'), '', {
            duration: 4000,
            panelClass: ['snack-bar']
            });
          } else {
            context.snackBar.open(context.translate.instant('client.multipleClients'), '', {
              duration: 4000,
              panelClass: ['snack-bar']
              });
          }

          context2.clientService.getClientByID(value.merchantId, "por mudar", "por mudar").subscribe(c => {
            context.logger.debug(c);
            var client = {
              "clientId": c.merchantId,
              "commercialName": c.commercialName,
              "address": c.headquartersAddress.address,
              "ZIPCode": c.headquartersAddress.postalCode,
              "locality": c.headquartersAddress.postalArea,
              "country": c.headquartersAddress.country,
            }
            context.notFound = false;

            clientToShow.client = client;
            context.clientsToShow.push(clientToShow);
            context.logger.debug(context.clientsToShow);
            context.clientsMat.data = context.clientsToShow;
          });
          
        })
      } else {
        this.showFoundClient = false;
        this.notFound = true;
        this.searchDone = true;
        this.createAdditionalInfoForm();


      }
    }, error => {
      context.showFoundClient = false;
      this.notFound = true;
      this.searchDone = true;
      this.createAdditionalInfoForm();
    });
  }

  initializeForm() {
    this.searchClientForm = new FormGroup({
      typology: new FormControl('', Validators.required),
      docType: new FormControl('', Validators.required),
      docNumber: new FormControl('', Validators.required)
    });

    this.searchClientForm.get("docType").valueChanges.subscribe(data => {
      if (data !== 'Cartão do Cidadão') {
        this.searchClientForm.controls["docNumber"].setValidators([Validators.required]);
        this.searchClientForm.removeControl("flagAutCol");
      } else {
        this.searchClientForm.controls["docNumber"].clearValidators();
        this.searchClientForm.addControl("flagAutCol", new FormControl('', Validators.required));
        this.searchClientForm.get("flagAutCol").updateValueAndValidity();
      }
      this.searchClientForm.controls["docNumber"].updateValueAndValidity();
    });
  }

  createAdditionalInfoForm() {
    let NIFNIPC = this.getNIFNIPC();
    switch (this.tipologia) {
      case "Company":
        this.newClientForm = this.formBuilder.group({
          nipc: new FormControl({ value: NIFNIPC, disabled: NIFNIPC }, Validators.required),
          denominacaoSocial: new FormControl('', Validators.required)
        });
        break;
      case "ENI":
        this.newClientForm = this.formBuilder.group({
          nif: new FormControl({ value: NIFNIPC, disabled: NIFNIPC }, Validators.required),
          nome: new FormControl('', Validators.required)
        });
        break;
    }
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
      this.logger.debug('close' + this.modalService);
    });
    this.returned = localStorage.getItem("returned");

    var context = this;

    //var processToInsert = {
    //  "processNumber": "5",
    //  "goal": "merchantOnboarding",
    //  "startedByUsername": "string",
    //  "startedByBranch": "string",
    //  "startedByPartner": "string",
    //  "startedAt": "2022-05-05"
    //} as Process;

    //this.processService.startProcess(processToInsert, "por mudar", "1").subscribe(o => {
    //  this.logger.debug("começou um processo");
    //  this.logger.debug(o);

    //  context.process = o;

    //  this.logger.debug(context.process);
    //});
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub?.unsubscribe);
  }


  submit(form: any) {
  }

  changeListElementDocType(docType, e: any) {
    // this.activateButtons(true);

    this.toggleShowFoundClient(false);
    this.docType = e.target.value;
    this.newClient.documentationDeliveryMethod = e.target.value;
    if (this.docType === '1001') { //código do Cartão do Cidadão
      this.isCC = true;
      this.clientNr = false;
    } else {
      this.isCC = false;
      this.clientNr = false;
    }
    if (this.docType === '1010'){ // Nº de cliente
      this.clientNr = true;
    } else {
      this.clientNr = false;
    }
    this.documentType = true;
    this.okCC = false;
    this.notFound = false;
    this.showSeguinte = false;
  }

  changeDocType() {
    this.documentType = true;
  }


  obterSelecionado() {
    this.logger.debug(this.clientId);
    var selectedClient = this.newClient;
    var NIFNIPC = null;
    if (selectedClient.documentationDeliveryMethod === '0502' || selectedClient.documentationDeliveryMethod === '0501') {
      NIFNIPC = selectedClient.clientId;
    }

    if (selectedClient.documentationDeliveryMethod === '1001') {
      this.dataCC = {
        nameCC: this.nameCC,
        cardNumberCC: this.cardNumberCC,
        nifCC: this.nifCC,
        addresssCC: this.addressCC,
        postalCodeCC: this.postalCodeCC,
      };
      NIFNIPC = this.nifCC;
    }
    this.logger.debug("antes de passar");
    let navigationExtras: NavigationExtras = {
      state: {
        tipologia: this.tipologia,
        NIFNIPC: selectedClient.fiscalId,
        clientExists: true,
        clientId: this.clientId,
        dataCC: this.dataCC,
        isClient: this.isClient
      }
    };
    this.logger.debug("a passar para a proxima pagina");
    this.route.navigate(['/clientbyid', selectedClient.fiscalId], navigationExtras);

    //isto nao esta a aparecer na versao mais nova.
  }
  /**
   *
   * @param readable: true: quero ler o CC; false: não quer ler o CC
   */
  changeDataReadable(readable: boolean) {
    this.isNoDataReadable = readable;
    this.toSearch = false;
    this.okCC = false;
    this.toShowReadCC = readable;
    this.BlockDocumentNumber = readable;
  }

  //Modal que questiona se tem o PIN da Morada 
  launchNewModal() {
    this.newModal = this.modalService.show(this.newModal, { class: 'modal-sm' })
    this.newModal.result.then(function (result: boolean): void {
      if (result) {
        this.Window.readCCAddress();
      } else {
        this.Window.readCC();
        this.newModal.hide();
      }
    }); // }.bind(this));
  }

  activateButtons(id: boolean) {
    this.newClient.clientId = '';
    this.newClient.documentationDeliveryMethod = '';
    this.logger.debug("Client typology: " + this.clientTypology);
    this.logger.debug("isCC:  " + this.isCC + this.isCC);
    this.logger.debug("showENI:  " + this.showENI);
    this.showFoundClient = false;
    this.ccInfo = null;
    this.showButtons = true;
    this.isCC = false;
    this.notFound = false;
    this.clientNr = false;
    this.isNoDataReadable = false;
    this.toSearch = false;
    this.documentType = false;
    this.okCC = false;
    this.errorMsg = '';
    this.resultError = ''
    this.newClientForm = null;
    this.showSeguinte = false;
    this.errorInput = 'form-control campo_form_coment';
    if (id == true) {
      this.showENI = false;
      this.isENI = false;
      this.tipologia = "Company";

    } else {
      this.showENI = true;
      this.isENI = true;
      this.tipologia = "ENI";
    }
  }

  clientId: string

  aButtons(id: boolean, clientId: string, isClient: boolean) {
    if (id == true) {
      this.showSeguinte = true
      this.clientId = clientId;
      this.isClient = isClient;
    } else {
      this.showSeguinte = false
    }
  }

  createNewClient() {
    var NIFNIPC = this.getNIFNIPC();
    
    let navigationExtras: NavigationExtras = {
      state: {
        tipologia: this.tipologia,
        clientExists: false,
        NIFNIPC: NIFNIPC,
        comprovativoCC: this.prettyPDF,
        dataCC: this.dataCCcontents
      }
    };

    if (this.dataCCcontents === null || this.dataCCcontents === undefined) {
      let clientName = this.newClientForm.get("denominacaoSocial")?.value ?? this.newClientForm.get("nome")?.value ?? '';
      localStorage.setItem("clientName", clientName);
    }

    if (NIFNIPC !== null && NIFNIPC !== undefined)
      this.route.navigate(['/clientbyid', NIFNIPC], navigationExtras);
    else
      this.route.navigate(['/clientbyid', 9999], navigationExtras);
    //this.route.navigate(['client-additional-info/88dab4e9-3818-4491-addb-f518ae649e5a']);
  }

  close() {
    this.route.navigate(['/']);
  }

  newSearch() {
    // location.reload();
    this.route.navigate(['/client'])
  }

  //PARA O NOVO COMPONENTE
  selectClient(clientEmitted) {
    this.selectedClient.client = clientEmitted.client;
    this.selectedClient.idx = clientEmitted.idx;
  }
}
