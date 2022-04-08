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


   //If the storeId value is -1 it means that it is a new store to be added

  public stakeholderId : number = 0;
  stakeholder: IStakeholders = { clientNr: -1 } as unknown as IStakeholders
  public clientNr: number = 8875;

  public totalUrl: string = "";

  //Parent class files
  items = ['item1', 'item2', 'item3', 'item4'];

  addItem(newItem: string) {
    this.items.push(newItem);
  }

  //end

  constructor(private router: ActivatedRoute,
    private http: HttpClient, @Inject('BASE_URL')
    private baseUrl: string, private route: Router) {

    this.ngOnInit();

    //WS call - Get the fields for the specific store if we are not creatig a new store
    if (this.clientNr != -1) {
      http.get<IStakeholders>(baseUrl + 'bestakeholders/' + this.clientNr).subscribe(result => {
        console.log(result);
        this.stakeholder = result;
      }, error => console.error(error));
    }

  }
 

  ngOnInit(): void {
    //Get Id from the store
    this.clientNr = Number(this.router.snapshot.params['clientNr']);
    
  }

  //When canceling the create new store feature the user must navigate back to store list
  onCickCancel() {
    this.route.navigate(['stakeholders']);
  }

  onClickNew() {
    console.log("add new");
    this.route.navigate(['/add-stakeholder']);
  }


  //Submit form to Back-end
  submit(FormStakeholders: any) {
    console.log("Store ID: " + this.clientNr);

    if (this.clientNr == -1) {
      console.log("post:" + this.clientNr);
      this.http.post<IStakeholders>(this.baseUrl + 'bestakeholders/PostStakeholders/' + this.clientNr, this.stakeholder).subscribe(result => {
        console.log(result);
      }, error => console.error(error));
    } else {
      console.log("put");
      this.http.put<IStakeholders>(this.baseUrl + 'bestakeholders/PutStakeholdersById/' + this.clientNr + '/' + this.clientNr, this.stakeholder).subscribe(result => {
        console.log(result);
      }, error => console.error(error));
    }

    this.route.navigate(['stakeholders']);

  }

}



