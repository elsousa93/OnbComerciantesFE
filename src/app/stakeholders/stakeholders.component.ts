import { Component, Inject, OnInit, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IStakeholders } from './IStakeholders.interface';
import { stakeTypeList } from './stakeholderType';
import { docTypeListP } from './docType';
import { docTypeListE } from './docType';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { FormGroup, FormControl, NgForm, Form, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DataService } from '../nav-menu-interna/data.service';
import { StakeholderService } from './stakeholder.service';
import { SubmissionService } from '../submission/service/submission-service.service';
import { TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, ModalModule } from 'ngx-bootstrap/modal';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { Configuration, configurationToken } from '../configuration';

import { readCC } from '../citizencard/CitizenCardController.js';
import { readCCAddress } from '../citizencard/CitizenCardController.js';

import { ReadcardService } from '../readcard/readcard.service';
import { BrowserModule } from '@angular/platform-browser';
import jsPDF from 'jspdf';
import { dataCC } from '../client/dataCC.interface';
import { NGXLogger } from 'ngx-logger';

/** Listagem Intervenientes / Intervenientes
 *
 */
@Component({
  selector: 'app-stakeholders',
  templateUrl: './stakeholders.component.html',
  styleUrls: ['./stakeholders.component.css']
})
export class StakeholdersComponent implements OnInit {

  UUIDAPI: string = "eefe0ecd-4986-4ceb-9171-99c0b1d14658"


  //---- Cartão de Cidadao - vars ------
  public dataCCcontents: dataCC;
  public prettyPDF: jsPDF = null;
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
    console.log("okCC valor: ", this.okCC);
  }
  /**
   * Information from the Citizen Card will be associated to the client structure
   * cardNumber não é guardado?
   * 
   * */
  SetNewCCData(name, cardNumber, nif, birthDate, imgSrc, cardIsExpired,
    gender, height, nationality, expiryDate, nameFather, nameMother,
    nss, sns, address, postalCode, notes, emissonDate, emissonLocal, country, countryIssuer) {

    console.log("Name: ", name, "type: ", typeof (name));

    console.log("nationality: ", nationality);
    console.log("birthDate: ", birthDate);
    console.log("cardNumber: ", cardNumber);
    console.log("nif: ", nif);

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





  newStake: IStakeholders = {
    "fiscalId": "",
    "identificationDocument": {
      "type": "",
      "number": "",
      "country": "",
      "expirationDate": "",
    }
  }
  @ViewChild('newModal') newModal;

  //newStake: IStakeholders = {

  //  "id": "22199900000051",
  //  "merchantType": null,
  //  "commercialName": "CAFE CENTRAL",
  //  "legalNature": "35",
  //  "legalNature2": null,
  //  "incorporationStatement": {
  //    "code": "0000-0000-0001",
  //    "validUntil": "2023-06-29T18:52:08.336+01:00"
  //  },
  //  "shareCapital": {
  //    "capital": 50000.2,
  //    "date": "2028-06-29T18:52:08.336+01:00"
  //  },
  //  "byLaws": "O Joao pode assinar tudo, like a boss",
  //  "mainEconomicActivity": "90010",
  //  "otherEconomicActivities": [
  //    "055111"
  //  ],
  //  "incorporationDate": "2020-03-01T17:52:08.336+00:00",
  //  "businessGroup": null,
  //  "knowYourSales": {
  //    "estimatedAnualRevenue": 1000000,
  //    "transactionsAverage": 30000,
  //    "servicesOrProductsSold": [
  //      "Cafe"
  //    ],
  //    "servicesOrProductsDestinations": [
  //      "PT"
  //    ]
  //  },
  //  "bankInformation": {
  //    "bank": "0033",
  //    "iban": "PT00333506518874499677629"
  //  },
  //  "contacts": {
  //    "email": "joao@silvestre.pt",
  //    "phone1": {
  //      "countryCode": "+351",
  //      "phoneNumber": "919654422"
  //    },
  //    "phone2": null
  //  },
  //  "fullName": "",
  //  "contactName": "",
  //  "shortName": ""
  //} as IStakeholders;

  currentStakeholder: IStakeholders = null;

  submissionId: string;

//  submissionId: string = "83199e44-f089-471c-9588-f2a68e24b9ab";

  submissionStakeholders: IStakeholders[] = [];
  
  //Field "stakeholder type" for the search
  ListStakeholderType = stakeTypeList;
  stakeholderType?: string = "";

  //Field "doc type" for the search
  ListDocTypeP = docTypeListP;
  ListDocTypeE = docTypeListE;
  documentType?: string = "";

  stakeholdersToShow: any[] = [];

  ngForm!: FormGroup;
  public stakes: IStakeholders[] = [];
  public stakeShow: IStakeholders[] = [];
  public stakeType: boolean = false;
  public showFoundStake: boolean = null;
  public stakeDocType: boolean = false;
  public stakeholderId : number = 0;
  public fiscalId: number = 0;
  public clientNr: number = 8875;
  public totalUrl: string = "";
  public auxUrl: string = "";
  public stakeSearch: IStakeholders[] = [this.newStake];
  isShown: boolean = false;
  isFoundStakeholderShown: boolean = false;
  public flagRecolhaEletronica: boolean = true;
  public poppy?: any;

  formStakeholderSearch: FormGroup;

  public map: Map<number, boolean>;
  public currentPage: number;
  public subscription: Subscription;

  public isParticular: boolean = false;
  public isCC: boolean = false;
  public isNoDataReadable: boolean;

  public returned: string;


  constructor(private router: ActivatedRoute, public modalService: BsModalService, private readCardService: ReadcardService,
      private http: HttpClient, private route: Router, private data: DataService, private fb: FormBuilder, private stakeholderService: StakeholderService, private submissionService: SubmissionService) {

    this.submissionId = localStorage.getItem('submissionId');
    this.returned = localStorage.getItem('returned');

    this.ngOnInit();

    var context = this;
      this.submissionService.GetSubmissionByProcessNumber(localStorage.getItem("processNumber")).subscribe(result => {
        this.submissionService.GetSubmissionByID(result[0].submissionId).subscribe(resul => {
          this.stakeholderService.GetAllStakeholdersFromSubmission(result[0].submissionId).subscribe(res => {
            res.forEach(function (value, index) {
              context.stakeholderService.GetStakeholderFromSubmission(result[0].submissionId, value.id).subscribe(r => {
                context.submissionStakeholders.push(r);
              }, error => {
              });
            }, error => {
            });
          });
        });
      });

    if (this.submissionId !== null) {
      stakeholderService.GetAllStakeholdersFromSubmission(this.submissionId).subscribe(result => {
        result.forEach(function (value, index) {
          context.stakeholderService.GetStakeholderFromSubmission(context.submissionId, value.id).subscribe(result => {
            context.submissionStakeholders.push(result);
          }, error => {
          });
        });
      }, error => {
      });
    }
  }

  redirectAddStakeholder() {
    this.route.navigate(['/create-stakeholder/']);
  }

  redirectInfoStakeholder() {
    this.route.navigate(['/add-stakeholder/']);
  }

  changeDataReadable(readable: boolean) {
    this.isNoDataReadable = readable;
  }

  ngOnInit(): void {
    //Get Id from the store
   // this.clientNr = Number(this.router.snapshot.params['nif']);
   //this.form = new FormGroup({
   //   stakeholderType: new FormControl(''),
   //   tipoDocumento: new FormControl(''),
   //   stakeholderNif: new FormControl(''),
   // });
    //this.createForm();
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    this.data.updateData(false,2,1);
  }

  //Modal que pergunta se tem o PIN da Morada
  launchNewModal() {
    this.newModal = this.modalService.show(this.newModal, { class: 'modal-sm' })
    this.newModal.result.then(function (result: boolean): void {
      if (result) {
        this.Window.readCCAddress();
      } else {
        this.Window.readCC();

        this.closeModal();
      }
    }.bind(this));
  }

  createForm() {
    this.formStakeholderSearch = this.fb.group({
      stakeholderType: [''],
      docType: [''],
      docNumber: [''],
      flagAutCol: [''],
      identificationDocumentId: [''],
      documentType: ['']
    });
  }

  onClickSearch() {

  }

  //When canceling the create new store feature the user must navigate back to store list
  onClickCancel() {
    this.route.navigate(['stakeholders']);
  }

  onClickNew() {
    let navigationExtras: NavigationExtras = {
      state: {
        isCC: this.isCC
      }
    };
    this.route.navigate(['/add-stakeholder'], navigationExtras);
  }

  onClickEdit(fiscalId) {
    this.route.navigate(['/update-stakeholder/', fiscalId]);
  }

  onClickDelete(fiscalId, clientNr) {
    this.route.navigate(['/add-stakeholder/', fiscalId, clientNr, 'delete']);
  }

  changeListElementStakeType(stakeType: string, e: any) {
    this.stakeholderType = e.target.value;
    if (this.stakeholderType === 'Particular') {
      this.isParticular = true;
    } else {
      this.isParticular = false;
    }
    this.stakeType = true;
  }
  changeListElementDocType(docType: string, e: any) {
    this.documentType = e.target.value;

    this.newStake.identificationDocument.type = this.documentType;

    if (this.documentType === 'Cartão do Cidadão') {
      this.isCC = true;
    } else {
      this.isCC = false;
    }
    this.stakeDocType = true;
  }

  toggleShow(stake: IStakeholders) {
    //clear the array
    this.stakeShow = [];
    this.isShown = !this.isShown;

    this.stakeShow.push(stake);
   // GetByid(StakeholderNif, 0)
       
  }

  selectStakeholder(stakeholder) {
    this.currentStakeholder = stakeholder;
    
  }

  //searchStakeholder(formStakeholderSearch) {
  //  this.logger.debug(formStakeholderSearch);
  //  this.http.get<IStakeholders>(this.baseUrl + 'BEStakeholders/StakeholderBySubmissionID/' + this.formStakeholderSearch.value.docNumber + "/submission/" + "1").subscribe(result => {
  //    this.logger.debug(result);
  //    this.toggleShow(result);
  //  }, error => console.error(error));
  //}

  searchStakeholder() {
    //this.formStakeholderSearch
    //this.logger.debug("ola");
    //this.stakeholderService.SearchStakeholderByQuery("000000002", "por mudar", this.UUIDAPI, "2").subscribe(o => {
    //  this.logger.debug(o);
    //});

    var context = this;

    /*this.onSearchSimulation(22181900000011);*/
    this.stakeholderService.SearchStakeholderByQuery("000000002", "por mudar", this.UUIDAPI, "2").subscribe(o => {
      var clients = o;

      var context2 = this;

      clients.forEach(function (value, index) {
        context2.stakeholderService.getStakeholderByID(value.stakeholderId, "por mudar", "por mudar").subscribe(c => {
          var stakeholder = {
            "stakeholderNumber": c.stakeholderId,
            "stakeholderName": c.shortName,
            "stakeholderNIF": c.fiscalIdentification.fiscalId,
            "elegible": "elegivel",
            "associated": "SIM"
          }

          context.stakeholdersToShow.push(stakeholder);
        });
      })
    }, error => {
      //context.showFoundClient = false;
      //this.logger.debug("entrou aqui no erro huajshudsj");
      //context.resultError = "Não existe Comerciante com esse número.";
      //this.searchDone = true;

    });
  }

  refreshDiv() {
    location.reload();
    this.ngOnInit();
  }

  deleteStakeholder(stakeholder) {
    if (this.returned !== 'consult') {
      this.stakeholderService.DeleteStakeholder(this.submissionId, stakeholder.id).subscribe(s => {
        this.route.navigateByUrl('stakeholders/');
        //this.ngOnInit();
        //const index = this.stakeholdersToShow.indexOf(this.currentStakeholder);
        //this.logger.debug(index);
        //if (index > -1) { // 
        //  this.stakeholdersToShow.splice(index, 1);
        //}
        //this.logger.debug("depois de apagar");
        //this.logger.debug(this.stakeholdersToShow);
        //for (var i = 0; i < this.stakeholdersToShow.length; i++) {
        //  if (this.stakeholdersToShow[i] === this.currentStakeholder)
        //    this.stakeholdersToShow.splice(i, 1);
        //}
      });
    } else {
    }
  }

  }


