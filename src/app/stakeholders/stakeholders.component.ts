import { Component, Inject, OnInit, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IStakeholders } from './IStakeholders.interface';
import { stakeTypeList } from './stakeholderType';
import { docTypeListP } from './docType';
import { docTypeListE } from './docType';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { FormGroup, FormControl, NgForm, Form, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { readCC } from '../citizencard/CitizenCardController.js';
import { readCCAddress } from '../citizencard/CitizenCardController.js'; import { DataService } from '../nav-menu-interna/data.service';


/** Listagem Intervenientes / Intervenientes
 *
 */
@Component({
  selector: 'app-stakeholders',
  templateUrl: './stakeholders.component.html',
  styleUrls: ['./stakeholders.component.css']
})
export class StakeholdersComponent implements OnInit {

  callreadCC() {
    readCC(this.SetNewCCData);
  }
  callreadCCAddress() {
    readCCAddress(this.SetNewCCData);
  }

  /**
   * Information from the Citizen Card will be associated to the client structure
   * cardNumber não é guardado
   * 
   * */
  SetNewCCData(name, cardNumber, nif, birthDate, imgSrc, cardIsExpired,
    gender, height, nationality, expiryDate, nameFather, nameMother,
    nss, sns, address, postalCode, notes, emissonDate, emissonLocal, country) {

    //this.newStake.legalName = name;
    //console.log("Name: ", name);
    //this.newStake.fiscalId = nif;
    //console.log("Fiscal ID: ", nif);
    //this.idToSearch = cardNumber;
    //this.ccInfo = true;

    //this.CCID.NIF = nif;
    //console.log("NIF: ",
    //  this.CCID.NIF);
  }

  newStake: IStakeholders = {

    "id": "22199900000051",
    "merchantType": null,
    "commercialName": "CAFE CENTRAL",
    "legalNature": "35",
    "legalNature2": null,
    "incorporationStatement": {
      "code": "0000-0000-0001",
      "validUntil": "2023-06-29T18:52:08.336+01:00"
    },
    "shareCapital": {
      "capital": 50000.2,
      "date": "2028-06-29T18:52:08.336+01:00"
    },
    "byLaws": "O Joao pode assinar tudo, like a boss",
    "mainEconomicActivity": "90010",
    "otherEconomicActivities": [
      "055111"
    ],
    "incorporationDate": "2020-03-01T17:52:08.336+00:00",
    "businessGroup": null,
    "knowYourSales": {
      "estimatedAnualRevenue": 1000000,
      "transactionsAverage": 30000,
      "servicesOrProductsSold": [
        "Cafe"
      ],
      "servicesOrProductsDestinations": [
        "PT"
      ]
    },
    "bankInformation": {
      "bank": "0033",
      "iban": "PT00333506518874499677629"
    },
    "contacts": {
      "email": "joao@silvestre.pt",
      "phone1": {
        "countryCode": "+351",
        "phoneNumber": "919654422"
      },
      "phone2": null
    },
    "documentationDeliveryMethod": null,
    "billingEmail": null,
    "merchantRegistrationId": null,
    "clientId": null,
    "fiscalId": "585597928",
    "legalName": null,
    "shortName": "SILVESTRE LDA",
    "headquartersAddress": {
      "address": "Rua da Azoia 4",
      "postalCode": "2625-236",
      "postalArea": "Povoa de Santa Iria",
      "country": "PT"
    }

  } as IStakeholders

  //Field "stakeholder type" for the search
  ListStakeholderType = stakeTypeList;
  stakeholderType?: string = "";

  //Field "doc type" for the search
  ListDocTypeP = docTypeListP;
  ListDocTypeE = docTypeListE;
  documentType?: string = "";


  ngForm!: FormGroup;
  public stakes: IStakeholders[] = [];
  public stakeShow: IStakeholders[] = [];
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

  constructor(private router: ActivatedRoute,
    private http: HttpClient, @Inject('BASE_URL')
    private baseUrl: string, private route: Router, private data: DataService, private fb: FormBuilder) {

    this.ngOnInit();

    http.get<IStakeholders[]>(baseUrl + 'bestakeholders/GetAllStakes').subscribe(result => {
      console.log(result);
      this.stakes = result;
    }, error => console.error(error));
    this.updateData(false, 2);


  }

  //função que altera o valor do map e da currentPage
  updateData(value: boolean, currentPage: number) {
    this.map.set(currentPage, value);
    this.data.changeData(this.map);
    this.data.changeCurrentPage(currentPage);
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
    this.createForm();
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
    console.log("add new");
    let navigationExtras: NavigationExtras = {
      state: {
        isCC: this.isCC
      }
    };
    this.route.navigate(['/add-stakeholder'], navigationExtras);
  }

  onClickEdit(fiscalId) {
    console.log("edit");
    this.route.navigate(['/update-stakeholder/', fiscalId]);
  }

  onClickDelete(fiscalId, clientNr) {
    console.log("delete");
    this.route.navigate(['/add-stakeholder/', fiscalId, clientNr, 'delete']);
  }

  changeListElementStakeType(stakeType: string, e: any) {
    this.stakeholderType = e.target.value;
    if (this.stakeholderType === 'Particular') {
      this.isParticular = true;
    } else {
      this.isParticular = false;
    }
  }
  changeListElementDocType(docType: string, e: any) {
    this.documentType = e.target.value;

    this.newStake.identificationDocument.type = this.documentType;

    if (this.documentType === 'Cartão do Cidadão') {
      this.isCC = true;
    } else {
      this.isCC = false;
    }
  }

  toggleShow(stake: IStakeholders) {
    //clear the array
    this.stakeShow = [];
    this.isShown = !this.isShown;

    this.stakeShow.push(stake);
    console.log("stakeShow array: " + this.stakeShow[0]);
    // GetByid(StakeholderNif, 0)

  }

  searchStakeholder(formStakeholderSearch) {
    console.log(formStakeholderSearch);
    this.http.get<IStakeholders>(this.baseUrl + 'BEStakeholders/StakeholderBySubmissionID/' + this.formStakeholderSearch.value.docNumber + "/submission/" + "1").subscribe(result => {
      console.log(result);
      this.toggleShow(result);
    }, error => console.error(error));
  }

  refreshDiv() {
    location.reload();
    this.ngOnInit();

  }


}


