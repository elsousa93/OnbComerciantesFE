import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Istore } from '../IStore.interface';

@Component({
  selector: 'app-store-iban',
  templateUrl: './store-iban.component.html',
  styleUrls: ['./store-iban.component.css']
})

  //This component allows to edit the iban field from the store. THere are two options
  //1. Use the iban from the cient.
  //2. Insert a new iban for the store
export class StoreIbanComponent implements OnInit {

  /*variable declarations*/
  public stroreId: number = 0;
  store: Istore = { id: -1 } as Istore
  public clientID: number = 12345678;

  /*CHANGE - Get via service from the clients */
  public commIban: string = "232323232";
  public auxIban: string = "";

  /*Is it supposed to relicate the Commercial offert from another store?*/
  selectionsReplicate = ['Não', 'Sim'];
  /*Default case*/
  selectedOption = 'Não';
  public idisabled: boolean = false;

  constructor(private router: ActivatedRoute, private http: HttpClient, @Inject('BASE_URL') private baseUrl: string, private route: Router) {
    this.ngOnInit();

    /*Get the information from the store we are editing*/
    http.get<Istore>(baseUrl + 'bestores/GetStoreById/' + this.clientID + '/' + this.stroreId).subscribe(result => {
      this.store = result;
    }, error => console.error(error));
  }

  ngOnInit(): void {
    //Get Id from the store
    this.stroreId = Number(this.router.snapshot.params['stroreid']);
  }

  /*Controles the radio button changes*/
  radoChangehandler(event: any) {
    this.selectedOption = event.target.value;
    if (this.selectedOption == "Sim") {
      this.auxIban = this.store.iban;
      this.store.iban = this.commIban;
      this.idisabled = true;
    } else {
      this.store.iban = this.auxIban;
      this.idisabled = false;
    }
    
  }

  //Submit form to Back-end
  submit(FormStores: any) {
    this.http.put<Istore>(this.baseUrl + 'bestores/PutStoreById/' + this.clientID + '/' + this.stroreId, this.store).subscribe(result => {
    }, error => console.error(error));
    this.route.navigate(['store-comp']);
  }

}
