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
    },
    "fullName": "",
    "contactName": "",
    "shortName": ""
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

  public isParticular: boolean=false;
  public isCC: boolean = false;
  public isNoDataReadable: boolean;

  constructor(private router: ActivatedRoute,
    private http: HttpClient, @Inject('BASE_URL')
    private baseUrl: string, private route: Router, private data: DataService, private fb: FormBuilder, private stakeholderService: StakeholderService) {

    this.ngOnInit();
   
      http.get<IStakeholders[]>(baseUrl + 'bestakeholders/GetAllStakes' ).subscribe(result => {
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

  changeDataReadable(readable: boolean){
    this.isNoDataReadable=readable;
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
    if (this.stakeholderType === 'Particular'){
      this.isParticular = true;
    } else {
      this.isParticular=false;
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

  //searchStakeholder(formStakeholderSearch) {
  //  console.log(formStakeholderSearch);
  //  this.http.get<IStakeholders>(this.baseUrl + 'BEStakeholders/StakeholderBySubmissionID/' + this.formStakeholderSearch.value.docNumber + "/submission/" + "1").subscribe(result => {
  //    console.log(result);
  //    this.toggleShow(result);
  //  }, error => console.error(error));
  //}

  searchStakeholder() {
    //this.formStakeholderSearch
    console.log("ola");
    this.stakeholderService.getStakeholderByID("75c99155-f3a8-45e2-9bd3-56a39d8a68ae", this.UUIDAPI, "2").subscribe(o => {
      console.log(o);
    });
  }

  refreshDiv() {
    location.reload();
    this.ngOnInit();

  }


  }


