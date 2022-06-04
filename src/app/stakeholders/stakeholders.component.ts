import { Component, Inject, OnInit, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IStakeholders } from './IStakeholders.interface';
import { stakeTypeList } from './stakeholderType';
import { docTypeList } from './docType';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, NgForm, Form, FormBuilder } from '@angular/forms';

/** Listagem Intervenientes / Intervenientes
 *
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

  public fiscalId : number = 0;
  public clientNr: number = 8875;
  public totalUrl: string = "";
  public auxUrl: string = "";
  public stakeSearch: IStakeholders[] = [this.newStake];
  isShown: boolean = false;
  isFoundStakeholderShown: boolean = false;
  public flagRecolhaEletronica: boolean = true; 
  public poppy?: any;




  formStakeholderSearch: FormGroup;
    
  constructor(private router: ActivatedRoute,
    private http: HttpClient, @Inject('BASE_URL')
    private baseUrl: string, private route: Router, private fb: FormBuilder) {

    this.ngOnInit();
 
      http.get<IStakeholders[]>(baseUrl + 'bestakeholders/GetAllStakes' ).subscribe(result => {
        console.log(result);
        this.stakes = result;
      }, error => console.error(error));
  }


  ngOnInit(): void {
    // this.clientNr = Number(this.router.snapshot.params['fiscalId']);
    this.createForm();
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
  //When canceling the create new store feature the user must navigate back to store list
  onClickCancel() {
    this.route.navigate(['stakeholders']);
  }

  onClickNew() {
    console.log("add new");
    this.route.navigate(['/add-stakeholder']);
  }

  onClickSearch() {
    console.log("pesq");

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
