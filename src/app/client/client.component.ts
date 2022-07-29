import { HttpClient, HttpHeaders, } from '@angular/common/http';
import { Client } from './Client.interface';
import { FormBuilder, Validators, ReactiveFormsModule, NgForm, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { docType, docTypeENI } from './docType'
import { DataService } from '../nav-menu-interna/data.service';
import { Subscription } from 'rxjs';
import { ClientService } from './client.service';
import {  Component, EventEmitter, Inject, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, ModalModule } from 'ngx-bootstrap/modal';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
//import '../citizencard/CitizenCardController.js';
import { readCC } from '../citizencard/CitizenCardController.js';
import { readCCAddress } from '../citizencard/CitizenCardController.js';

import { BrowserModule } from '@angular/platform-browser';
import { Process } from '../process/process.interface';
import { ProcessService } from '../process/process.service';


//Funcao da SIBS 
declare function OpenCCDialog(): any;

//CC
interface ICCInfo {
  BI: string;
  BirthDate: Date;
  CardNumber: string;
  //CardNumberPAN: string;
  CardVersion: string;
  DeliveryEntity: string;
  DeliveryDate: Date;
  DocumentType: string;
  CountryCC: string;
  ExpiryDate: Date;
  Height: string;
  Localemission: string;
  Name: string;
  NameFather: string;
  NameMother: string;
  Nationality: string;
  NIF: string;
  NSS: string;
  Sex: string;
  SNS: string;

  Address1: string;
  Address2: string;
  Address3: string;
  ZipCode: string;
  Locality: string;

  FullAddress: string;
  Photo: string;
  CanSign: string;
  Notes: string;
}
interface addresstranformed {
  address1: string;
  address2: string;
  address3: string;
  Zipcode: string;
  Locality: string;

}
//Fim do CC

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css']
})

//declare var nameCC: any;
//declare var nationalityCC: any;
//declare var birthDateCC: any ;
//declare var cardNumberCC: any ;
//declare var nifCC: any;
//declare var okCC: any ;

export class ClientComponent implements OnInit {
  //UUID
  UUIDAPI: string = "eefe0ecd-4986-4ceb-9171-99c0b1d14658"

  public clients: Client[] = [];
  public searchParameter: any;
  public result: any;
  public displayValueSearch: any;
  public isNoDataReadable: boolean;
  public showCC: boolean;

  //---- Cartão de Cidadao - var glob -

  public nameCC = null;
  public nationalityCC = null;
  public birthDateCC = null;
  public cardNumberCC = null;
  public nifCC = null;
  public addressCC = null;
  public postalCodeCC = null;

  process: any;

  public okCC = null;
  public dadosCC: Array<string> = [];

  //---- Cartão de Cidadao ------
   callreadCC() {
    readCC(this.SetNewCCData.bind(this));
  }
  callreadCCAddress() {
    readCCAddress(this.SetNewCCData.bind(this));
  }
  closeModal() {
    this.newModal.hide();
  }
  setOkCC() {
    this.okCC = true;
    console.log("okCC valor: ", this.okCC);
  }
/**
 * Information from the Citizen Card will be associated to the client structure
 * cardNumber não é guardado
 * 
 * */
  SetNewCCData(name, cardNumber, nif, birthDate, imgSrc, cardIsExpired,
  gender, height, nationality, expiryDate, nameFather, nameMother,
   nss, sns, address, postalCode, notes, emissonDate, emissonLocal, country) {


      console.log("Name: ", name, "type: ", typeof (name));

      console.log("nationality: ", nationality);
      console.log("birthDate: ", birthDate);
      console.log("cardNumber: ", cardNumber);
      console.log("nif: ", nif);

    this.nameCC = name; 
    this.nationalityCC = nationality;
   // this.birthDateCC = birthDate;
    this.cardNumberCC = cardNumber; // Nº do CC
    this.nifCC = nif;

    if (!(address == null)) {
      this.addressCC = address;
      this.postalCodeCC = postalCode;
    }
    

      //Abrir o div
    

   //  this.dadosCC =  [name, nationality]; ERROR
   
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

 //----------------
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
  idToSearch: number;
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


  constructor(private router: ActivatedRoute, private http: HttpClient, @Inject('BASE_URL')
  private baseUrl: string, @Inject('NEYONDBACK_URL')
    private neyondBackUrl: string, private route: Router, private data: DataService, public modalService: BsModalService,
    private clientService: ClientService, private processService: ProcessService) {

    this.ngOnInit();
    console.log(baseUrl);
    http.get<Client[]>(baseUrl + 'BEClients/GetAllClients/').subscribe(result => {
      this.clients = result;
    }, error => console.error(error));
    this.data.updateData(false, 1);
    // this.activateButtons(false);
    this.errorInput = "form-control campo_form_coment";

    this.initializeDefaultClient();
  }

  //TEMPORARIO!!!!
  initializeDefaultClient() {
    this.tempClient = {
      "id": "",
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
   // this.activateButtons(true);
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
    console.log(this.newClient.clientId);

    var context = this;

    /*this.onSearchSimulation(22181900000011);*/
    this.clientService.SearchClientByQuery(this.newClient.clientId, "por mudar", "por mudar", "por mudar").subscribe(o => {
      this.showFoundClient = true;
      var clients = o;

      var context2 = this;

      console.log("a");
      console.log(context.clientsToShow);
      context.clientsToShow = [];
      console.log(context.clientsToShow);
      clients.forEach(function (value, index) {
        console.log(value);
        context2.clientService.getClientByID(value.merchantId, "por mudar", "por mudar").subscribe(c => {
          console.log(c);
          var client = {
            "clientId": c.merchantId,
            "commercialName": c.commercialName,
            "address": "Rua Gomes Artur",
            "ZIPCode": "1000-001",
            "locality": "Lisboa",
            "country": "Portugal",
          }
          context.clientsToShow.push(client);
          console.log(context.clientsToShow);
        });
      })
    }, error => {
      context.showFoundClient = false;
      console.log("entrou aqui no erro huajshudsj");
      context.resultError = "Não existe Comerciante com esse número.";
      this.searchDone = true;

    });
  }

  /**
   * SIMULAÇÃO da Pesquisa -- Enquanto não temos API
   * Chamar esta função no botão de Pesquisar
   * 
   **/
  onSearchSimulation(idToSearch: number) {
    //No New SubmissionResponse, este é o valor do merchant.id
    if (idToSearch == 22181900000011) {
     //Cliente Encontrado
      console.log("Cliente Encontrado");
      this.showFoundClient = true;

    }
    if (!(idToSearch==22181900000011)) {
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
      console.log("começou um processo");
      console.log(o);

      context.process = o;

      console.log(context.process);
    });
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
    this.documentType = true;
  }

  changeDocType(){
    this.documentType = true;
  }

  obterSelecionado() {
    console.log(this.clientId);

      let navigationExtras: NavigationExtras = {
        state: {
          tipologia: this.tipologia,
          NIFNIPC: this.newClient.clientId,
          clientExists: true,
          clientId: this.clientId,
        }
      };

      this.route.navigate(['/clientbyid', this.tempClient.fiscalId], navigationExtras);

    //isto nao esta a aparecer na versao mais nova.
  }

  changeDataReadable(readable: boolean){
    this.isNoDataReadable=readable;
    this.toSearch = false;
    this.toShowReadCC = readable;
  }

  launchNewModal() {
    this.newModal = this.modalService.show(this.newModal, { class: 'modal-sm' } )
    this.newModal.result.then(function (result: boolean): void {
      if (result) {
        this.Window.readCCAddress();
      } else {
        console.log("fechar");
        this.Window.readCC();
       
        this.closeModal();
      }
    }.bind(this));
  }

  activateButtons(id: boolean) {
    this.showFoundClient = false;
  //  this.ccInfo = null;
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
    let navigationExtras: NavigationExtras = {
      state: {
      tipologia: this.tipologia,
        NIFNIPC: this.newClient.clientId,
        exists: false,
    }
  };

    this.route.navigate(['/clientbyid', clientId], navigationExtras);
  //  this.route.navigate(['client-additional-info/88dab4e9-3818-4491-addb-f518ae649e5a']);
  }

  close() {
    this.route.navigate(['/']);
  }

  newSearch() {
   // location.reload();

  this.route.navigate(['/client'])
  }


  // Cartão de Cidadão
  private GetCCData(): any {
    var elName = (<HTMLInputElement>document.getElementById("CCDivNome"));
    var elCCNumber = (<HTMLInputElement>document.getElementById("CCDivID"));
    var elNif = (<HTMLInputElement>document.getElementById("CCDivNIF"));
    var elBirthDate = (<HTMLInputElement>document.getElementById("CCDivDN"));
    var elAddress = (<HTMLInputElement>document.getElementById("CCDivMr"));
    var elPostalCode = (<HTMLInputElement>document.getElementById("CCDivPostalCode"));
    var elCanSign = (<HTMLInputElement>document.getElementById("CCCanSign"));

    // ******* Hidden Fields *********

    var elNotes = (<HTMLInputElement>document.getElementById("CCDivNotes"));
    var elNationality = (<HTMLInputElement>document.getElementById("CCDivNationality"));
    var elGender = (<HTMLInputElement>document.getElementById("CCDivGender"));
    var elHeight = (<HTMLInputElement>document.getElementById("CCDivHeight"));
    var elEmissoneDate = (<HTMLInputElement>document.getElementById("CCDivEmissonDate"));
    var elExpireDate = (<HTMLInputElement>document.getElementById("CCDivExpireDate"));
    var elFatherName = (<HTMLInputElement>document.getElementById("CCDivFatherName"));
    var elMotherName = (<HTMLInputElement>document.getElementById("CCDivMotherName"));
    var elSSNumber = (<HTMLInputElement>document.getElementById("CCDivSSNumber"));
    var elSNS = (<HTMLInputElement>document.getElementById("CCDivSNSNumber"));
    var elEmissionLocal = (<HTMLInputElement>document.getElementById("CCDivEmissonLocal"));
    var photo = (<HTMLInputElement>document.getElementById("CCDivPhoto"));
    var country = (<HTMLInputElement>document.getElementById("CCDivCountry"));


    if ((elName != null && elName.innerText != "") &&
      (elCCNumber != null && elCCNumber.innerText != "") &&
      (elNif != null && elNif.innerText != "") &&
      (elBirthDate != null && elBirthDate.innerText != "")) {
      var ccID = "";
      ccID = elCCNumber.innerText;
      this.CCID.Name = elName.innerText;
      this.CCID.CardNumber = ccID; //elCCNumber.innerText;
      //this.CCID.CardNumberPAN = ccID.substring(9);
      this.CCID.NIF = elNif.innerText;
      this.CCID.Nationality = null; // this.RefDataService.CountriesCCCodes.filter(x => x.ThreeLetterCode == elNationality.innerText)[0].TwoLetterCode;
      this.CCID.Sex = elGender.innerText;
      this.CCID.Height = elHeight.innerText;

      this.CCID.NameFather = elFatherName.innerText;
      this.CCID.NameMother = elMotherName.innerText;
      this.CCID.NSS = elSSNumber.innerText;
      this.CCID.SNS = elSNS.innerText;
      this.CCID.CanSign = elCanSign.innerText;
      this.CCID.Notes = elNotes.innerText;

      var deliverydate = elEmissoneDate.innerText.split(' ');
      var BirthDate = elBirthDate.innerText.split(' ');
      var Expired = elExpireDate.innerText.split(' ');

      this.CCID.BirthDate = new Date(BirthDate[2] + "/" + BirthDate[1] + "/" + BirthDate[0]);
      this.CCID.ExpiryDate = new Date(Expired[2] + "/" + Expired[1] + "/" + Expired[0]);
      this.CCID.DeliveryDate = new Date(deliverydate[2] + "/" + deliverydate[1] + "/" + deliverydate[0]);

      if (elAddress != null && elAddress.innerText != "" && elAddress.innerText != "X" && elAddress.innerText.length > 2 && elAddress.innerText.substring(0, 2) != "X ") {
        this.CCID.FullAddress = elAddress.innerText + " " + elPostalCode.innerText;
        const ccmorada: addresstranformed = {

          address1: "",
          address2: "",
          address3: "",
          Zipcode: "",
          Locality: "",
        };

        this.CCID.Address1 = ccmorada.address1;
        this.CCID.Address2 = ccmorada.address2;
        this.CCID.Address3 = ccmorada.address3;
        this.CCID.ZipCode = ccmorada.Zipcode;
        this.CCID.Locality = ccmorada.Locality;
        this.CCID.CountryCC = country.innerText;
      }
      this.CCID.Localemission = elEmissionLocal.innerText;
      this.CCID.Photo = photo.innerText;
      this.CCID.DocumentType = "1001";
    }
  }


}
