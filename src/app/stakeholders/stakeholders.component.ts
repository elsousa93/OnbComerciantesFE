import { Component, Inject, OnInit, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IStakeholders } from './IStakeholders.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, NgForm } from '@angular/forms';
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
    stakeholderType:"Particular",
    stakeholderNif: 0
  } as IStakeholders
  form!: FormGroup;


  ngForm!: FormGroup;
  public stakes: IStakeholders[] = [];
  public stakeShow: IStakeholders[] = [];
  public stakeholderId : number = 0;
  public stakeholderNif : number = 0;
  public clientNr: number = 8875;
  public totalUrl: string = "";
  public auxUrl: string = "";
  public stakeholdersByNIF: IStakeholders[] = [this.newStake];
  isShown: boolean = false;
  isFoundStakeholderShown: boolean = false;

  public poppy?: any; 

  public map: Map<number, boolean>;
  public currentPage: number;
  public subscription: Subscription; 

  constructor(private router: ActivatedRoute,
    private http: HttpClient, @Inject('BASE_URL')
    private baseUrl: string, private route: Router, private data: DataService) {

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
    this.clientNr = Number(this.router.snapshot.params['nif']);
   this.form = new FormGroup({
      stakeholderType: new FormControl(''),
      tipoDocumento: new FormControl(''),
      stakeholderNif: new FormControl(''),
    });
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
  }

  //When canceling the create new store feature the user must navigate back to store list
  onClickCancel() {
    this.route.navigate(['stakeholders']);
  }

  onClickNew() {
    console.log("add new");
    this.route.navigate(['/add-stakeholder']);
  }

  onClickEdit(stakeNif) {
    console.log("edit");
    this.route.navigate(['/add-stakeholder/', stakeNif]);
  }

  onClickDelete(stakeNif, clientNr) {
    console.log("delete");
    this.route.navigate(['/add-stakeholder/', stakeNif, clientNr, 'delete']);

  }

  toggleShow(stake: IStakeholders) {
   //clear the array
   this.stakeShow = [];
   this.isShown = !this.isShown;
   console.log(this.stakeShow);

   this.stakeShow.push(stake);
     
   // GetByid(StakeholderNif, 0)
       
   }

  searchStakeholder(form: any) {
   // stakeholderType: string, stakeholderNif: string
    this.newStake.stakeholderType = form.stakeholderType;

    console.log("FORM stake: " + typeof (form.stakeholderType));
    console.log(form.stakeholderType);

    this.newStake.stakeholderNif = form.stakeholderNif;
    this.newStake.clientName = form.clientName;
    this.newStake.clientNr = form.clientNr;

    console.log("FORM" + form)
    this.stakeholdersByNIF.push(this.newStake);
   //this.stakeholderNif = stkNif;

      
    console.log("this " + form.value.stakeholderNif);

    this.http.get<IStakeholders[]>(this.baseUrl +
      'bestakeholders/GetStakeholderByNIF/' + form.value.stakeholderNif ).subscribe(result => {
      console.log(result);
        this.stakeholdersByNIF = result;
        console.log("RESULT " + result);
      }, error => console.error(error));

      if (this.stakeholdersByNIF != null) {
         this.isFoundStakeholderShown = true;
    }
    console.log(this.stakeholdersByNIF);
  }

  refreshDiv() {
    location.reload();
    this.ngOnInit();

  }
}



