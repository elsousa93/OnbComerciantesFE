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
import { ICCInfo } from '../citizencard/ICCInfo.interface';

import { BrowserModule } from '@angular/platform-browser';
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


  constructor(private logger : NGXLogger, private router: ActivatedRoute, public modalService: BsModalService,
      private http: HttpClient, private route: Router, private data: DataService, private fb: FormBuilder, private stakeholderService: StakeholderService, private submissionService: SubmissionService) {

    this.submissionId = localStorage.getItem('submissionId');
    this.returned = localStorage.getItem('returned');
    this.logger.debug("foi buscar bem ao localstorage?");
    this.logger.debug(this.submissionId);
    this.logger.debug("returned ", this.returned);

    this.ngOnInit();

    var context = this;
      this.submissionService.GetSubmissionByProcessNumber(localStorage.getItem("processNumber")).subscribe(result => {
        this.logger.debug("Ir buscar submissão através do processNumber", result);
        this.submissionService.GetSubmissionByID(result[0].submissionId).subscribe(resul => {
          this.logger.debug("Ir buscar os detalhes da submissão com o seu ID ", resul);
          this.stakeholderService.GetAllStakeholdersFromSubmission(result[0].submissionId).subscribe(res => {
            this.logger.debug('Lista de stakeholders da submissão ', res);
            res.forEach(function (value, index) {
              this.logger.debug("Stake ", value);
              context.stakeholderService.GetStakeholderFromSubmission(result[0].submissionId, value.id).subscribe(r => {
                this.logger.debug("Info stakeholder ", r);
                context.submissionStakeholders.push(r);
              }, error => {
                this.logger.debug(error);
              });
            }, error => {
              this.logger.debug(error);
            });
          });
        });
      });

    this.logger.debug("Lista que fomos buscar à submissão antiga ", this.submissionStakeholders);
    if (this.submissionId !== null) {
      this.logger.debug("O id da submissão existe", this.submissionId);
      stakeholderService.GetAllStakeholdersFromSubmission(this.submissionId).subscribe(result => {
        result.forEach(function (value, index) {
          this.logger.debug("Value ", value);
          context.stakeholderService.GetStakeholderFromSubmission(context.submissionId, value.id).subscribe(result => {
            this.logger.debug("Info stake ", result);
            context.submissionStakeholders.push(result);
          }, error => {
            this.logger.debug(error);
          });
        });
      }, error => {
        this.logger.debug(error);
      });
    }
      this.logger.debug("Lista depois de irmos buscar stakeholders à submissao atual (CRC) ", this.submissionStakeholders);
  }

  redirectAddStakeholder() {
    this.logger.debug("errada");
    this.route.navigate(['/create-stakeholder/']);
  }

  redirectInfoStakeholder() {
    this.logger.debug("certa");
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
        this.logger.debug("fechar");
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
    this.logger.debug("pesq");

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
    this.logger.debug("edit");
    this.route.navigate(['/update-stakeholder/', fiscalId]);
  }

  onClickDelete(fiscalId, clientNr) {
    this.logger.debug("delete");
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
    this.logger.debug("stakeShow array: " + this.stakeShow[0]);
   // GetByid(StakeholderNif, 0)
       
  }

  selectStakeholder(stakeholder) {
    this.logger.debug(this.currentStakeholder);
    this.logger.debug(stakeholder);
    this.currentStakeholder = stakeholder;
    this.logger.debug(this.currentStakeholder);
    this.logger.debug(this.currentStakeholder === stakeholder);
    
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
        this.logger.debug(value);
        context2.stakeholderService.getStakeholderByID(value.stakeholderId, "por mudar", "por mudar").subscribe(c => {
          this.logger.debug("stakeholders a popular");
          this.logger.debug(c);
          var stakeholder = {
            "stakeholderNumber": c.stakeholderId,
            "stakeholderName": c.shortName,
            "stakeholderNIF": c.fiscalIdentification.fiscalId,
            "elegible": "elegivel",
            "associated": "SIM"
          }

          context.stakeholdersToShow.push(stakeholder);
          this.logger.debug(context.stakeholdersToShow);
        });
      })
    }, error => {
      this.logger.debug("deu erro no stakeholders search request");
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
    this.logger.debug("delete");
    this.logger.debug(stakeholder);
    if (this.returned !== 'consult') {
      this.logger.debug("Como não é uma consulta, consegui apagar o stakeholder");
      this.stakeholderService.DeleteStakeholder(this.submissionId, stakeholder.id).subscribe(s => {
        this.logger.debug("stakeholder deleted");
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
      this.logger.debug("Estamos numa consulta logo nao é possivel eliminar um stakeholder");
    }
  }

  }


