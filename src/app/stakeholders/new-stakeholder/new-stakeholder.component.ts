import { Component, OnInit, Inject, Output, EventEmitter  } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, NgForm } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StakeholdersComponent } from '../stakeholders.component';
import { IStakeholders } from '../IStakeholders.interface';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-new-stakeholder',
  templateUrl: './new-stakeholder.component.html',
  styleUrls: ['./new-stakeholder.component.css']
})

/**
 * Child component of Stakeholders Component
*/

export class NewStakeholderComponent implements OnInit {
  public foo = 0;
  public displayValueSearch = "";

  newStake: IStakeholders = {
    nif: 0
  } as IStakeholders

  constructor(private router: ActivatedRoute,
    private http: HttpClient, @Inject('BASE_URL')
    private baseUrl: string, private route: Router) {

    this.ngOnInit();
 
    console.log(this.newStake.nif);

    if (this.newStake.nif != 0) {
      http.get<IStakeholders>(baseUrl + 'bestakeholders/EditStakeholderById/' + this.newStake.nif ).subscribe(result => {
        console.log(result);
        this.newStake = result;
      }, error => console.error(error));
    }
  }

   ngOnInit(): void {
     //Get Id from the store
     this.newStake.nif = Number(this.router.snapshot.params['nif']);
     console.log(this.newStake.nif);
  }

  //@Output()  newStakeholderAdded = new EventEmitter<any>();
    stringJson: any;


  submit(form: any) {
    this.newStake.stakeholderType = form.stakeholderType;
    this.newStake.nif = form.nif;
    this.newStake.clientName = form.clientName;
    this.newStake.clientNr = form.clientNr;
    this.newStake.electronicCollectFlag = form.electronicCollectFlag;
    this.newStake.documentType = form.documentType;
    this.newStake.documentCountry = form.documentCountry;
    this.newStake.flagRecolhaEletronica = form.flagRecolhaEletronica;
    this.newStake.tipoDocumento = form.tipoDocumento;
    this.newStake.paisDocumentoID = form.paisDocumentoID;
    this.newStake.nrDocumentoID = form.nrDocumentoID;
    this.newStake.primeiranacionalidade = form.primeiranacionalidade;
    this.newStake.dtValidadeID = form.dtValidadeID;
    this.newStake.primeiranacionalidade = form.primeiranacionalidade;
    this.newStake.paisNIFEstrangeiro = form.paisNIFEstrangeiro;
    this.newStake.indicadorNIFPaisEstrangeiro = form.indicadorNIFPaisEstrangeiro;
    this.newStake.nifEstrangeiro = form.nifEstrangeiro;

    console.log(this.newStake);
    console.log(typeof this.newStake);

    //Nao esta a ser usado
    this.stringJson = JSON.stringify(this.newStake);
    console.log("String json object :", this.stringJson);
    console.log("Type :", typeof this.stringJson);

    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }

    this.http.post<IStakeholders>(this.baseUrl + 'bestakeholders/PostNewStakeholder/'
      + this.newStake.nif, this.newStake).subscribe(result => {
        console.log(result);
      }, error => console.error(error));

    //Edit EditStakeholderById
    this.http.post<IStakeholders>(this.baseUrl + 'bestakeholders/EditStakeholderById/'
      + this.newStake.nif + '/edit', this.newStake).subscribe(result => {
        console.log("EditStakeholderById");
        console.log(result);
      }, error => console.error(error));

    //Delete 
    this.http.delete<IStakeholders[]>(this.baseUrl + 'bestakeholders/DeleteStakeholderById/' +
     +this.newStake.nif+ this.newStake.clientNr +'/delete').subscribe(result => {
      }, error => console.error(error));



  }//Fim do submit

  onClickDelete(nif, clientNr) {
    this.http.delete<IStakeholders[]>(this.baseUrl + 'bestakeholders/DeleteStakeholderById/' +
      +this.newStake.nif +'/'+ this.newStake.clientNr + '/delete').subscribe(result => {
      }, error => console.error(error));
    this.route.navigate(['stakeholders']);
  }
}
