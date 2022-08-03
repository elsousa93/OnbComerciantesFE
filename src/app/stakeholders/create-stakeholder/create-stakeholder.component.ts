import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit,  EventEmitter } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DataService } from '../../nav-menu-interna/data.service';
import { SubmissionService } from '../../submission/service/submission-service.service';
import { docTypeListE, docTypeListP } from '../docType';
import { IStakeholders } from '../IStakeholders.interface';
import { StakeholderService } from '../stakeholder.service';
import { stakeTypeList } from '../stakeholderType';
import { TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, ModalModule } from 'ngx-bootstrap/modal';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { Configuration, configurationToken } from '../../configuration';

import { readCC } from '../../citizencard/CitizenCardController.js';
import { readCCAddress } from '../../citizencard/CitizenCardController.js';
import { ICCInfo } from '../../citizencard/ICCInfo.interface';

import { BrowserModule } from '@angular/platform-browser';

@Component({
  selector: 'app-create-stakeholder',
  templateUrl: './create-stakeholder.component.html',
  styleUrls: ['./create-stakeholder.component.css']
})
export class CreateStakeholderComponent implements OnInit {
  UUIDAPI: string = "eefe0ecd-4986-4ceb-9171-99c0b1d14658"

  modalRef: BsModalRef;

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  //---- Cartão de Cidadao - vars ------------

  public nameCC = null;
  public nationalityCC = null;
  public birthDateCC = null;
  public cardNumberCC = null;
  public nifCC = null;
  public addressCC = null;
  public postalCodeCC = null;
  public countryCC = null;

  public okCC = null;
  public dadosCC: Array<string> = [];

  //---- Cartão de Cidadao - funcoes ---------
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
   * cardNumber não é guardado
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

    this.nameCC = name;
    this.nationalityCC = nationality;
    // this.birthDateCC = birthDate;
    this.cardNumberCC = cardNumber; // Nº do CC
    this.nifCC = nif;

    this.countryCC = countryIssuer;

    if (!(address == null)) {
      this.addressCC = address;
      this.postalCodeCC = postalCode;
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

  @ViewChild('newModal') newModal;

  //-------------- fim do CC ------------

  newStake: IStakeholders = {
    "fiscalId": "",
    "identificationDocument": {
      "type": "",
      "number": "",
      "country": "",
      "expirationDate": "",
    },
    "fullName": "",
    "contactName": "",
    "shortName": ""
  } as IStakeholders;

 submissionId: string;
 // submissionId: string = "83199e44-f089-471c-9588-f2a68e24b9ab";

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
  public stakeholderId: number = 0;
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

  stakeholderNumber: string;

  foundStakeholders: boolean;

  constructor(private router: ActivatedRoute, public modalService: BsModalService,
    private http: HttpClient, private route: Router, private data: DataService, private fb: FormBuilder, private stakeholderService: StakeholderService, private submissionService: SubmissionService) {


    this.submissionId = localStorage.getItem('submissionId');

    //console.log("foi buscar bem ao localstorage?");
    //console.log(this.submissionId);
    this.ngOnInit();

    var context = this;
    this.initializeForm();
    //stakeholderService.GetAllStakeholdersFromSubmission(this.submissionId).subscribe(result => {
    //  result.forEach(function (value, index) {
    //    console.log(value);
    //    context.stakeholderService.GetStakeholderFromSubmission(context.submissionId, value.id).subscribe(result => {
    //      console.log(result);
    //      context.submissionStakeholders.push(result);
    //    }, error => {
    //      console.log(error);
    //    });
    //  });
    //}, error => {
    //  console.log(error);
    //});

  }

  initializeNotFoundForm() {
    this.formStakeholderSearch.addControl("socialDenomination", new FormControl('', Validators.required));
  }

  deactivateNotFoundForm() {
    this.formStakeholderSearch.removeControl("socialDenomination");
  }

  initializeForm() {
    this.formStakeholderSearch = new FormGroup({
      type: new FormControl('', Validators.required),
      documentType: new FormControl('', Validators.required),
      documentNumber: new FormControl('', Validators.required)
    });

    this.formStakeholderSearch.get("documentType").valueChanges.subscribe(data => {
      if (data !== 'Cartão do Cidadão') {
        this.formStakeholderSearch.controls["documentNumber"].setValidators([Validators.required]);
      } else {
        this.formStakeholderSearch.controls["documentNumber"].clearValidators();
      }
      this.formStakeholderSearch.controls["documentNumber"].updateValueAndValidity();
    });
  }

  redirectAddStakeholder() {
    this.route.navigate(['/add-stakeholder/']);
  }

  redirectInfoStakeholder() {
    this.route.navigate(['/add-stakeholder/']);
  }

  changeDataReadable(readable: boolean) {
    this.isNoDataReadable = readable;
  }

  //Modal que pergunta se tem o PIN da Morada
  launchNewModal() {
    this.newModal = this.modalService.show(this.newModal, { class: 'modal-sm' })
    this.newModal.result.then(function (result: boolean): void {
      if (result) {
        this.Window.readCCAddress();
      } else {
        console.log("fechar");
        this.Window.readCC();
        this.newModal.hide();
      }
    }); // }.bind(this));
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
    console.log("pesq");

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

  //searchStakeholder(formStakeholderSearch) {
  //  console.log(formStakeholderSearch);
  //  this.http.get<IStakeholders>(this.baseUrl + 'BEStakeholders/StakeholderBySubmissionID/' + this.formStakeholderSearch.value.docNumber + "/submission/" + "1").subscribe(result => {
  //    console.log(result);
  //    this.toggleShow(result);
  //  }, error => console.error(error));
  //}

  searchStakeholder() {
    //this.formStakeholderSearch
    //console.log("ola");
    //this.stakeholderService.SearchStakeholderByQuery("000000002", "por mudar", this.UUIDAPI, "2").subscribe(o => {
    //  console.log(o);
    //});
    if (this.formStakeholderSearch.invalid)
      return false;

    var context = this;

    var documentNumberToSearch = this.formStakeholderSearch.get('documentNumber').value;

    /*this.onSearchSimulation(22181900000011);*/
    this.stakeholderService.SearchStakeholderByQuery(documentNumberToSearch, "por mudar", this.UUIDAPI, "2").subscribe(o => {
      var clients = o;
      console.log("searched interveniente");
      console.log(clients);

      context.isShown = true;
      
      if (clients.length > 0) {
        context.deactivateNotFoundForm();
        context.foundStakeholders = true;
        context.stakeholdersToShow = [];
        clients.forEach(function (value, index) {
          console.log(value);
          context.stakeholderService.getStakeholderByID(value.stakeholderId, "por mudar", "por mudar").subscribe(c => {
            console.log("ja a ir buscar");
            console.log(c);
            var stakeholder = {
              "stakeholderNumber": c.stakeholderId,
              "stakeholderName": c.shortName,
              "stakeholderNIF": c.fiscalIdentification.fiscalId,
              "elegible": "elegivel",
              "associated": "SIM"
            }
            console.log("stakeholder adicionado:");
            console.log(stakeholder);
            context.stakeholdersToShow.push(stakeholder);
          });
        })
      } else {
        context.initializeNotFoundForm();
        context.stakeholdersToShow = [];
        context.foundStakeholders = false;
      }
    }, error => {
      //context.showFoundClient = false;
      //console.log("entrou aqui no erro huajshudsj");
      //context.resultError = "Não existe Comerciante com esse número.";
      //this.searchDone = true;
    });
  }

  refreshDiv() {
    location.reload();
    this.ngOnInit();
  }

  selectStakeholder(stakeholder) {
    console.log(stakeholder);
    
    this.newStake = {
      "fiscalId": stakeholder.stakeholderNIF,
      "identificationDocument": {},
      "fullName": '',
      "contactName": '',
      "shortName": ''
    };
    console.log(this.newStake);
    this.stakeholderNumber = stakeholder.stakeholderNumber;
  }

  addStakeholder() {
    if (this.foundStakeholders) {
      this.stakeholderService.getStakeholderByID(this.stakeholderNumber, 'por mudar', 'por mudar').subscribe(stakeholder => {
        var stakeholderToInsert = stakeholder;

        console.log("stakeholder procurado");
        console.log(stakeholderToInsert);
        this.stakeholderService.CreateNewStakeholder(this.submissionId, stakeholderToInsert).subscribe(result => {
          console.log("add stakeholder existente");
          console.log(this.newStake);

          this.route.navigate(['/stakeholders/']);
        }, error => {
          console.log(error);
        });
      });
    } else {
      console.log("form");
      console.log(this.formStakeholderSearch);

      var stakeholderToInsert: IStakeholders = {
        "fiscalId": this.formStakeholderSearch.get("documentNumber").value,
        "identificationDocument": {
          "type": this.formStakeholderSearch.get("documentType").value,
          "number": this.formStakeholderSearch.get("documentNumber").value,
        },
        "phone1": {},
        "phone2": {},
        "shortName": this.formStakeholderSearch.get("socialDenomination").value
      }
      console.log("Stakeholder a adicionar");
      console.log(stakeholderToInsert);
      this.stakeholderService.CreateNewStakeholder(this.submissionId, stakeholderToInsert).subscribe(result => {
        console.log("Stakeholder criado com sucesso");
        this.route.navigate(['/stakeholders/']);
      });
    }
  }

}
