import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Client } from './Client.interface';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { Router, NavigationExtras } from '@angular/router';
import { DataService } from '../nav-menu-interna/data.service';
import { Subscription } from 'rxjs';
import { ClientService } from './client.service';
import { TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { BsModalService } from 'ngx-bootstrap/modal';
import { readCC } from '../citizencard/CitizenCardController.js';
import { readCCAddress } from '../citizencard/CitizenCardController.js';
import { ICCInfo } from '../citizencard/ICCInfo.interface';
import { ReadcardService } from '../readcard/readcard.service';
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

  public canSearch: boolean = true;
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
    this.addressReading = true;
    this.setOkCC();
  }
  closeModal() {
    this.newModal.hide();
  }
  setOkCC() {
    this.okCC = true;
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
    localStorage.setItem("clientName", name);
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
    this.dataCCcontents.countryCC = countryIssuer;
    this.countryCC = countryIssuer; //HTML

    var expireDate = expiryDate.split(" ");//expiryDate.replaceAll(" ", "/").split("/");
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
      this.dataCCcontents.addressCC = " ";
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
  HasInsolventIntervenients: boolean;
  BlockClientName: boolean;
  BlockNIF: boolean;
  Validations: boolean;
  DisableButtons: boolean;
  BlockDocumentNumber: boolean = true; //if you want to read the CC NEW
  IsInsolventCantPass: boolean;
  CCReaderPresent: boolean;
  CCReaderCCID: number;
  CCID: ICCInfo;

  @ViewChild('newModal') newModal;
  //--------- fim do CC ----------------------

  clientIdNew;
  ccInfo;
  newId;
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
  showFoundClient: boolean = false;
  idToSeacrh: number;
  searchDone: boolean = false;
  showButtons: boolean = false;
  showSeguinte: boolean = false;
  showENI: boolean = false;
  isENI: boolean = false;
  isCC: boolean = false;
  toShowReadCC: boolean = true;
  documentType: boolean = false;
  toSearch: boolean = false;
  resultError: string = "";
  clientTypology: string = "";
  searchType: string = "";
  clientNr: boolean = false;
  clientsToShow: { client: Client, isClient: boolean }[] = [];

  newClient: Client = {};
  tipologia: string;
  searchedDocument: string;
  firstTime: boolean = true;
  defaultValue: boolean = true;

  @Output() nameEmitter = new EventEmitter<string>();
  @Output() urlEmitter: EventEmitter<string> = new EventEmitter<string>();
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns: string[] = ['select', 'clientNumber', 'commercialName', 'address', 'ZIPCode', 'locale', 'country'];

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

  incorrectNIFSize: boolean = false;
  incorrectNIF: boolean = false;
  incorrectNIPCSize: boolean = false;
  incorrectNIPC: boolean = false;
  incorrectCCSize: boolean = false;
  incorrectCC: boolean = false;
  incorrectCCFormat: boolean = false;
  potentialClientIds: string[] = [];
  queueName: string = "";
  title: string;
  merchant: boolean;

  constructor(private http: HttpClient, private logger: LoggerService, private formBuilder: FormBuilder, private translate: TranslateService,
    private route: Router, private data: DataService, private clientService: ClientService,
    private tableInfo: TableInfoService, public modalService: BsModalService,
    private readCardService: ReadcardService, private snackBar: MatSnackBar) {
    this.data.currentMerchant.subscribe(merchant => this.merchant = merchant);
    this.subs.push(this.tableInfo.GetAllSearchTypes(UserTypes.MERCHANT).subscribe(result => {
      this.ListaDocType = result;
      this.ListaDocType = this.ListaDocType.sort((a, b) => a.description > b.description ? 1 : -1); //ordenar resposta
    }), (this.tableInfo.GetAllSearchTypes(UserTypes.STAKEHOLDER).subscribe(result => {
      this.ListaDocTypeENI = result;
      this.ListaDocTypeENI = this.ListaDocTypeENI.sort((a, b) => a.description > b.description ? 1 : -1); //ordenar resposta
    })));

    this.clientsMat.sort = this.sort;
    this.initializeForm();

    this.subscription = this.data.currentQueueName.subscribe(queueName => {
      if (queueName != null) {
        this.translate.get('homepage.diaryPerformance').subscribe((translated: string) => {
          this.queueName = this.translate.instant('homepage.' + queueName);
          this.title = this.translate.instant('client.title');
        });
      }
    });
    this.errorInput = "form-control campo_form_coment";

    if (localStorage.getItem("submissionId") != null) {
      var readable;
      this.data.currentTipologia.subscribe(tipologia => this.tipologia = tipologia);//this.route.getCurrentNavigation().extras.state["tipologia"];
      this.searchedDocument = localStorage.getItem("documentType");
      this.clientId = localStorage.getItem("documentNumber");
      this.data.currentIsNoDataReadable.subscribe(read => readable = read);
      this.data.currentComprovativoCC.subscribe(cc => this.prettyPDF = cc);//this.route.getCurrentNavigation().extras.state["comprovativoCC"];
      this.data.currentDataCC.subscribe(data => this.dataCCcontents = data);//this.route.getCurrentNavigation().extras.state["dataCC"];
      this.data.currentIsClient.subscribe(isClient => this.isClient = isClient);//this.route.getCurrentNavigation().extras.state["isClient"];

      if (this.tipologia === 'Company' || this.tipologia === 'Corporate' || this.tipologia === '01' || this.tipologia === 'corporation') {
        this.setClientData(true);
        this.changeListElementDocType(null, { target: { value: this.newClient.documentationDeliveryMethod } });
        this.searchClient();
      }

      if (this.tipologia === 'ENI' || this.tipologia === 'Entrepeneur' || this.tipologia === '02') {
        this.setClientData(false);
        this.changeListElementDocType(null, { target: { value: this.newClient.documentationDeliveryMethod } });
        if (this.dataCCcontents == null) {
          this.searchClient();
        } else {
          if (readable) {
            this.setOkCC();
          }
          this.changeDataReadable(readable);
          this.searchClient();
        }
      }
    }
    if (!this.merchant) {
      this.data.updateData(false, 1);
    } else {
      this.data.updateData(true, 1);
    }
  }

  setClientData(bool: boolean) {
    if (bool) {
      this.activateButtons(bool);
      this.clientTypology = 'true';
      this.newClient.clientId = this.clientId;
      this.newClient.documentationDeliveryMethod = this.searchedDocument;
    } else {
      this.activateButtons(bool);
      this.clientTypology = 'false';
      this.newClient.clientId = this.clientId;
      this.newClient.documentationDeliveryMethod = this.searchedDocument;
    }
  }

  clientsMat = new MatTableDataSource<any>();
  @ViewChild('paginator') set paginator(pager: MatPaginator) {
    if (pager) {
      this.clientsMat.paginator = pager;
      this.clientsMat.paginator._intl = new MatPaginatorIntl();
      this.clientsMat.paginator._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');
    }
  }

  getValueENI() {
    this.logger.info("Calling fucntion to read citizen card...");
    this.http.get(this.neyondBackUrl + 'CitizenCard/searchCC').subscribe(result => {
      if (result == null) {
        alert("Error reading citizen card!");
      } else {
        this.ccInfo = result;
        this.logger.info("Citizen card info: " + JSON.stringify(this.ccInfo));
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
    if ((this.newClientForm?.get("nif")?.value != '' && this.newClientForm?.get("nif")?.value != null) || (this.newClientForm?.get("nipc")?.value != '' && this.newClientForm?.get("nipc")?.value != null)) {
      return this.newClientForm?.get("nif")?.value ?? this.newClientForm?.get("nipc")?.value;
    }
    return '';
  }

  searchClient() {
    this.logger.info("Searching for client with ID: " + this.newClient.clientId);
    this.showSeguinte = false;
    var context = this;
    this.newClientForm = null;
    context.clientsToShow = [];
    context.clientsMat.data = context.clientsToShow;
    context.potentialClientIds = [];

    if (this.canSearch) {
      this.canSearch = false;
      this.clientService.SearchClientByQuery(this.newClient.clientId, this.searchType, "por mudar", "por mudar").subscribe(o => {
        this.logger.info("Search client by ID result: " + JSON.stringify(o));
        this.showFoundClient = true;
        var clients = o;
        var context2 = this;
        context.clientsToShow = [];
        context.clientsMat.data = context.clientsToShow;
        if (clients.length > 0) {
          if (clients.length === 1) {
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
          context.resultError = "";
          clients.forEach(function (value, index) {
            var clientToShow = {
              client: undefined,
              isClient: value.isClient
            } as {
              client: Client,
              isClient: boolean
            }
            context2.clientService.getClientByID(value.merchantId, "por mudar", "por mudar").then(c => {
              context.logger.info("Get Merchant Outbound result: " + JSON.stringify(c));
              var client = {
                "clientId": c.result.merchantId,
                "commercialName": c.result.commercialName,
                "address": c.result.headquartersAddress.address,
                "ZIPCode": c.result.headquartersAddress.postalCode,
                "postalArea": c.result.headquartersAddress.postalArea,
                "country": c.result.headquartersAddress.country,
              }
              clientToShow.client = client;
              context.clientsToShow.push(clientToShow);
              context.logger.info("Clients found from search: " + JSON.stringify(context.clientsToShow));
              context.clientsMat.data = context.clientsToShow;

            }).then(res => {
              context.notFound = false;
              context.canSearch = true;
            });
          });
        } else {
          this.showFoundClient = false;
          this.notFound = true;
          this.searchDone = true;
          this.canSearch = true;
          this.createAdditionalInfoForm();
          this.resetLocalStorage();
        }
      }, error => {
        context.showFoundClient = false;
        this.notFound = true;
        this.searchDone = true;
        this.canSearch = true;
        this.createAdditionalInfoForm();
        this.resetLocalStorage();
      });
    }
  }

  resetLocalStorage() {
    localStorage.removeItem("nif");
    localStorage.removeItem("clientName");
  }

  initializeForm() {
    this.searchClientForm = new FormGroup({
      typology: new FormControl('', Validators.required),
      docType: new FormControl('', Validators.required),
      docNumber: new FormControl('', Validators.required)
    });

    this.searchClientForm.get("docType").valueChanges.subscribe(data => {
      if (data !== '1001') {
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
      case "Company" || "Corporate" || "01" || "corporation":
        this.newClientForm = this.formBuilder.group({
          nipc: new FormControl({ value: (NIFNIPC != null && NIFNIPC != '') ? NIFNIPC : localStorage.getItem("nif"), disabled: NIFNIPC }, Validators.required),
          denominacaoSocial: new FormControl(localStorage.getItem("submissionId") != null ? localStorage.getItem("clientName") ?? '' : '', Validators.required)
        });
        break;
      case "ENI" || "Entrepeneur" || "02":
        this.newClientForm = this.formBuilder.group({
          nif: new FormControl({ value: (NIFNIPC != null && NIFNIPC != '') ? NIFNIPC : localStorage.getItem("nif"), disabled: NIFNIPC }, Validators.required),
          nome: new FormControl(localStorage.getItem("submissionId") != null ? localStorage.getItem("clientName") ?? '' : '', Validators.required)
        });
        break;
    }
  }

  toggleShowFoundClient(value: boolean) {
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
      
    });
    this.returned = localStorage.getItem("returned");
    var context = this;
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub?.unsubscribe);
  }

  changeListElementDocType(docType, e: any) {

    if ((localStorage.getItem("submissionId") == null && !this.defaultValue) || !this.firstTime || !this.defaultValue)
      this.activateButtons(!this.showENI);
      this.firstTime = false;
      this.defaultValue = false;
      this.toggleShowFoundClient(false);
      this.docType = e.target.value;

    // get search type
    this.searchType = this.docType;

    this.newClient.documentationDeliveryMethod = e.target.value;
    if (this.docType === '1001') { //código do Cartão do Cidadão
      this.isCC = true;
      this.clientNr = false;
    } else {
      this.isCC = false;
      this.clientNr = false;
    }
    if (this.docType === '1010') { // Nº de cliente
      this.clientNr = true;
    } else {
      this.clientNr = false;
    }
    this.documentType = true;
    this.okCC = false;
    this.notFound = false;
    this.showSeguinte = false;
  }

  obterSelecionado() {
    this.logger.info("Client ID from selected client: " + this.clientId);
    var selectedClient = this.newClient;
    var NIFNIPC = null;
    if (selectedClient.documentationDeliveryMethod === '0502' || selectedClient.documentationDeliveryMethod === '0501') {
      NIFNIPC = selectedClient.clientId;
    }

    if (selectedClient.documentationDeliveryMethod === '1001') {
      this.dataCC = {
        nameCC: this.nameCC,
        cardNumberCC: this.cardNumberCC,
        nifCC: this.nifCC + "",
        addresssCC: this.addressCC,
        postalCodeCC: this.postalCodeCC,
      };
      NIFNIPC = this.nifCC + "";
    }

    let navigationExtras: NavigationExtras = {
      state: {
        tipologia: this.tipologia,
        clientExists: true,
        clientId: this.clientId,
        dataCC: this.dataCC,
        isClient: this.isClient,
        isFromSearch: true,
        potentialClientIds: JSON.stringify(this.potentialClientIds)
      }
    };

    this.data.changeCurrentDataCC(this.dataCC);
    this.data.changeCurrentIsClient(this.isClient);
    this.data.changeCurrentTipologia(this.tipologia);

    localStorage.setItem("documentType", selectedClient.documentationDeliveryMethod);
    localStorage.setItem("documentNumber", selectedClient.clientId);
    this.logger.info("Redirecting to Client by id page");
    this.data.changeMerchant(false);
    this.route.navigate(['/clientbyid', this.clientId], navigationExtras);
  }
  /**
   *
   * @param readable: true: quero ler o CC; false: não quer ler o CC
   */
  changeDataReadable(readable: boolean) {
    if (readable) {
      this.newClient.clientId = '';

      this.clearNewForm();
    }
    this.isNoDataReadable = readable;
    this.toSearch = false;
    if (readable === false) {
      this.okCC = false;
    }
    this.toShowReadCC = readable;
    this.BlockDocumentNumber = readable;
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
    this.isNoDataReadable = true;
    this.toSearch = false;
    this.documentType = false;
    this.okCC = false;
    this.errorMsg = '';
    this.resultError = ''
    this.newClientForm = null;
    this.showSeguinte = false;
    this.errorInput = 'form-control campo_form_coment';
    this.incorrectCC = false;
    this.incorrectCCSize = false;
    this.incorrectCCFormat = false;
    this.incorrectNIF = false;
    this.incorrectNIFSize = false;
    this.incorrectNIPCSize = false;
    this.incorrectNIPC = false;
    if (id == true) {
      this.showENI = false;
      this.isENI = false;
      this.tipologia = "Company";

      if (localStorage.getItem("submissionId") == null) {
        this.newClient.documentationDeliveryMethod = "0502";
        this.firstTime = true;
        this.defaultValue = true;
        this.changeListElementDocType(null, { target: { value: this.newClient.documentationDeliveryMethod } });
      }
    } else {
      this.showENI = true;
      this.isENI = true;
      this.tipologia = "ENI";

      if (localStorage.getItem("submissionId") == null) {
        this.newClient.documentationDeliveryMethod = "0501";
        this.firstTime = true;
        this.defaultValue = true;
        this.changeListElementDocType(null, { target: { value: this.newClient.documentationDeliveryMethod } });
      }
    }
  }

  clientId: string

  aButtons(id: boolean, clientId: string, isClient: boolean) {
    this.potentialClientIds = [];
    if (id == true) {
      this.showSeguinte = true
      this.clientId = clientId;
      this.isClient = isClient;
      this.clientsToShow.forEach(val => {
        if (clientId != val.client.clientId) {
          this.potentialClientIds.push(val.client.clientId);
        }
      }, this);
    } else {
      this.showSeguinte = false
    }
  }

  createNewClient() {
    var NIFNIPC = this.getNIFNIPC();
    if (this.clientTypology === 'false' && !this.showFoundClient) {
      localStorage.setItem("nif", this.newClientForm?.get("nif")?.value ?? this.newClientForm?.get("nipc")?.value);
      localStorage.setItem("documentNumber", this.newClient.clientId);
      NIFNIPC = this.newClientForm?.get("nif")?.value ?? this.newClientForm?.get("nipc")?.value;
    } else {
      localStorage.setItem("documentNumber", NIFNIPC);
    }
    localStorage.setItem("documentType", this.newClient.documentationDeliveryMethod);
    let navigationExtras: NavigationExtras = {
      state: {
        tipologia: this.tipologia,
        clientExists: false,
        NIFNIPC: NIFNIPC + "",
        comprovativoCC: this.prettyPDF,
        dataCC: this.dataCCcontents,
        isFromSearch: true,
        potentialClientIds: JSON.stringify(this.potentialClientIds)
      }
    };

    if (this.dataCCcontents == null || this.dataCCcontents == undefined) {
      let clientName = this.newClientForm.get("denominacaoSocial")?.value ?? this.newClientForm.get("nome")?.value ?? '';
      if (clientName != '') {
        var nameArray = clientName.split(" ").filter(element => element);
        var fullName = "";
        nameArray.forEach((val, index) => {
          if (index == 0) {
            fullName = val;
          } else {
            fullName = fullName + " " + val;
          }
        });
      }
      localStorage.setItem("clientName", fullName);
    } else {
      if (!this.isNoDataReadable) {
        let clientName = this.newClientForm.get("denominacaoSocial")?.value ?? this.newClientForm.get("nome")?.value ?? '';
        if (clientName != '') {
          var nameArray = clientName.split(" ").filter(element => element);
          var fullName = "";
          nameArray.forEach((val, index) => {
            if (index == 0) {
              fullName = val;
            } else {
              fullName = fullName + " " + val;
            }
          });
        }
        localStorage.setItem("clientName", fullName);
      }
    }
    this.data.changeNoDataReadable(this.isNoDataReadable);
    this.data.changeCurrentDataCC(this.dataCC);
    this.data.changeCurrentComprovativoCC(this.prettyPDF);
    this.data.changeCurrentTipologia(this.tipologia);
    this.data.changeMerchant(false);
    if (NIFNIPC !== null && NIFNIPC !== undefined) {
      this.logger.info("Redirecting to Client by id page");
      this.route.navigate(['/clientbyid', NIFNIPC], navigationExtras);
    } else {
      this.logger.info("Redirecting to Client by id page");
      this.route.navigate(['/clientbyid', 9999], navigationExtras);
    }
  }

  close() {
    this.logger.info("Redirecting to Dashboard page");
    this.route.navigate(['/']);
  }

  clearNewForm() {
    this.notFound = false;
    this.newClientForm = null;
  }

  numericOnly(event): boolean {
    if (this.docType === '0501' || this.docType === '0502' || this.docType === '1010' || this.docType === '0101' || this.docType === '0302') {
      var ASCIICode = (event.which) ? event.which : event.keyCode;

      if (ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57) || ASCIICode == 86)
        return false;

      //if (this.docType == '0501' || this.docType == '0502') {
      //  let pattern = /[0-9]+/g;
      //  let result = pattern.test(event.key);
      //  return result;
      //}

      return true;
    }
  }

  checkValidationType(str: string, event) {
    if (this.docType === '1001')
      this.ValidateNumeroDocumentoCC(str);

    if (this.docType === '0501')
      this.validateNIF(str)

    if (this.docType === '0502')
      this.validateNIPC(str)
  }

  validateNIF(nif: string): boolean {
    this.incorrectNIFSize = false;
    this.incorrectNIF = false;
    if (nif != '') {
      if (nif.length != 9) {
        this.incorrectNIFSize = true;
        return false;
      }
      if (!['1', '2', '3'].includes(nif.substr(0, 1))) {
        this.incorrectNIF = true;
        return false;
      }

      const total = Number(nif[0]) * 9 + Number(nif[1]) * 8 + Number(nif[2]) * 7 + Number(nif[3]) * 6 + Number(nif[4]) * 5 + Number(nif[5]) * 4 + Number(nif[6]) * 3 + Number(nif[7]) * 2;
      const modulo11 = total - Math.trunc(total / 11) * 11;
      const comparador = modulo11 === 1 || modulo11 === 0 ? 0 : 11 - modulo11;

      if (Number(nif[8]) !== comparador) {
        this.incorrectNIF = true;
        return false;
      }
      return Number(nif[8]) === comparador;
    }
  }

  validateNIPC(nipc: string): boolean {
    this.incorrectNIPCSize = false;
    this.incorrectNIPC = false;
    if (nipc != '') {
      if (nipc.length != 9) {
        this.incorrectNIPCSize = true;
        return false;
      }
      if (!['5', '6', '8', '9'].includes(nipc.substr(0, 1))) {
        this.incorrectNIPC = true;
        return false;
      }

      const total = Number(nipc[0]) * 9 + Number(nipc[1]) * 8 + Number(nipc[2]) * 7 + Number(nipc[3]) * 6 + Number(nipc[4]) * 5 + Number(nipc[5]) * 4 + Number(nipc[6]) * 3 + Number(nipc[7]) * 2;
      const modulo11 = total - Math.trunc(total / 11) * 11;
      const comparador = modulo11 === 1 || modulo11 === 0 ? 0 : 11 - modulo11;

      if (Number(nipc[8]) !== comparador) {
        this.incorrectNIPC = true;
        return false;
      }

      return Number(nipc[8]) === comparador;
    }
  }

  ValidateNumeroDocumentoCC(numeroDocumento: string) {
    this.incorrectCC = false;
    this.incorrectCCSize = false;
    this.incorrectCCFormat = false;
    var sum = 0;
    var secondDigit = false;

    if (numeroDocumento.length != 12) {
      this.incorrectCCSize = true;
      return false;
    }

    var ccFormat = /^[\d]{8}?\d([A-Z]{2}\d)?$/g;
    if (!ccFormat.test(numeroDocumento)) {
      this.incorrectCCFormat = true;
      return false;
    }

    for (var i = numeroDocumento.length - 1; i >= 0; --i) {
      var valor = this.GetNumberFromChar(numeroDocumento[i]);
      if (secondDigit) {
        valor *= 2;
        if (valor > 9)
          valor -= 9;
      }
      sum += valor;
      secondDigit = !secondDigit;
    }

    if (sum % 10 != 0) {
      this.incorrectCC = true;
      return false;
    }

    return (sum % 10) == 0;
  }

  GetNumberFromChar(letter: string) {
    switch (letter) {
      case '0': return 0;
      case '1': return 1;
      case '2': return 2;
      case '3': return 3;
      case '4': return 4;
      case '5': return 5;
      case '6': return 6;
      case '7': return 7;
      case '8': return 8;
      case '9': return 9;
      case 'A': return 10;
      case 'B': return 11;
      case 'C': return 12;
      case 'D': return 13;
      case 'E': return 14;
      case 'F': return 15;
      case 'G': return 16;
      case 'H': return 17;
      case 'I': return 18;
      case 'J': return 19;
      case 'K': return 20;
      case 'L': return 21;
      case 'M': return 22;
      case 'N': return 23;
      case 'O': return 24;
      case 'P': return 25;
      case 'Q': return 26;
      case 'R': return 27;
      case 'S': return 28;
      case 'T': return 29;
      case 'U': return 30;
      case 'V': return 31;
      case 'W': return 32;
      case 'X': return 33;
      case 'Y': return 34;
      case 'Z': return 35;
    }
  }

  @HostListener('paste', ['$event']) onPaste(event: ClipboardEvent) {
    const clipboardData = event.clipboardData;
    const pastedText = clipboardData.getData('text/plain');
    if (this.docType === '0501' || this.docType === '0502' || this.docType === '1010' || this.docType === '0101' || this.docType === '0302') {
      if (event.target["name"] != "nome" && event.target["name"] != "denominacaoSocial") {
        if (!this.isNumeric(pastedText)) {
          event.preventDefault();
        }
      }
    }
  }

  isNumeric(value: string): boolean {
    return /^\d+$/.test(value);
  }
}
