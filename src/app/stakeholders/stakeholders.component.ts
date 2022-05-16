import { Component, Inject, OnInit, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IStakeholders } from './IStakeholders.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, NgForm } from '@angular/forms';

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

  constructor(private router: ActivatedRoute,
    private http: HttpClient, @Inject('BASE_URL')
    private baseUrl: string, private route: Router) {

    this.ngOnInit();
   
      http.get<IStakeholders[]>(baseUrl + 'bestakeholders/GetAllStakes' ).subscribe(result => {
        console.log(result);
        this.stakes = result;
      }, error => console.error(error));
  }
 
  ngOnInit(): void {
    //Get Id from the store
    this.clientNr = Number(this.router.snapshot.params['nif']);
   this.form = new FormGroup({
      stakeholderType: new FormControl(''),
      tipoDocumento: new FormControl(''),
      stakeholderNif: new FormControl(''),
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
    this.newStake.stakeholderNif = form.stakeholderNif;
    this.newStake.clientName = form.clientName;
    this.newStake.clientNr = form.clientNr;
    this.stakeholdersByNIF.push(this.newStake);
   // this.stakeholderNif = stkNif;

      
    console.log("this " + form.value.stakeholderNif);

    this.http.get<IStakeholders[]>(this.baseUrl +
      'bestakeholders/GetStakeholderByNIF/' + form.value.stakeholderNif ).subscribe(result => {
      console.log(result);
        this.stakeholdersByNIF = result;
      }, error => console.error(error));

      if (this.stakeholdersByNIF != null) {
         this.isFoundStakeholderShown = true;
    }

    console.log("hello");
 
  }

  refreshDiv() {
    location.reload();
    this.ngOnInit();

  }
}



