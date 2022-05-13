import { Component, Inject, OnInit, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IStakeholders } from './IStakeholders.interface';
import { ActivatedRoute, Router } from '@angular/router';

/** Listagem Intervenientes / Intervenientes
 * pag 13
 */
@Component({
  selector: 'app-stakeholders',
  templateUrl: './stakeholders.component.html',
  styleUrls: ['./stakeholders.component.css']
})
export class StakeholdersComponent implements OnInit {
  public stakes: IStakeholders[] = [];
  public stakeShow: IStakeholders[] = [];
  public stakeholderId : number = 0;
  public clientNr: number = 8875;
  public totalUrl: string = "";

  isShown: boolean = false;


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
   this.stakeShow =[];
   this.isShown = !this.isShown;
   console.log(this.stakeShow);
     
   this.stakeShow.push(stake);
     
   // GetByid(StakeholderNif, 0)
       
   }

}



