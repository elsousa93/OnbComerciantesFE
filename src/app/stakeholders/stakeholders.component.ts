import { Component, Inject, OnInit, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IStakeholders } from './IStakeholders.interface';
import { stakeTypeList } from './stakeholderType';
import { docTypeList } from './docType';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, NgForm, Form, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DataService } from '../nav-menu-interna/data.service';

/** Listagem Intervenientes / Intervenientes
 * pag 13
 */
@Component({
  selector: 'app-stakeholders',
  templateUrl: './stakeholders.component.html',
  styleUrls: ['./stakeholders.component.css']
})
export class StakeholdersComponent implements OnInit {


  newStake: IStakeholders = {
    identificationDocument: {
      identificationDocumentType: "",
      identificationDocumentId: "",

    }
  } as IStakeholders
  
  //Field "stakeholder type" for the search
  ListStakeholderType = stakeTypeList;
  stakeholderType?: string = "";

  //Field "doc type" for the search
  ListDocType = docTypeList;
  docType?: string = "";


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

  constructor(private router: ActivatedRoute,
    private http: HttpClient, @Inject('BASE_URL')
    private baseUrl: string, private route: Router, private data: DataService, private fb: FormBuilder) {

    this.ngOnInit();
   
      http.get<IStakeholders[]>(baseUrl + 'bestakeholders/GetAllStakes' ).subscribe(result => {
        console.log(result);
        this.stakes = result;
      }, error => console.error(error));
    this.updateData(true,3);
  }

  //função que altera o valor do map e da currentPage
  updateData(value: boolean, currentPage: number) {
    this.map.set(currentPage, value);
    this.data.changeData(this.map);
    this.data.changeCurrentPage(currentPage);
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
      flagRecolhaEletronica: [''],
      identificationDocumentId: [''],
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
    this.route.navigate(['/add-stakeholder']);
  }

  onClickEdit(fiscalId) {
    console.log("edit");
    this.route.navigate(['/add-stakeholder/', fiscalId]);
  }

  onClickDelete(fiscalId, clientNr) {
    console.log("delete");
    this.route.navigate(['/add-stakeholder/', fiscalId, clientNr, 'delete']);
  }

  changeListElementStakeType(stakeType: string, e: any) {
    console.log(e.target.value)
    this.stakeholderType = e.target.value;

  }
  changeListElementDocType(docType: string, e: any) {
    console.log(e.target.value)
    this.docType = e.target.value;
    this.newStake.identificationDocument.identificationDocumentType = this.docType;

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
    this.http.get<IStakeholders>(this.baseUrl + 'bestakeholders/GetStakeholderByID/' + this.formStakeholderSearch.value.docNumber).subscribe(result => {
      console.log(result);
      this.toggleShow(result);
    }, error => console.error(error));
  }

  refreshDiv() {
    location.reload();
    this.ngOnInit();

  }
}



