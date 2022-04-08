import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Istore } from '../IStore.interface';

@Component({
  selector: 'app-add-store',
  templateUrl: './add-store.component.html',
  styleUrls: ['./add-store.component.css']
})

  //If the storeId value is -1 it means that it is a new store to be added

export class AddStoreComponent implements OnInit {

  public stroreId: number = 0;
  store: Istore = { id: -1 } as Istore
  public clientID: number = 12345678;

  public totalUrl: string = "";

  constructor(private router: ActivatedRoute, private http: HttpClient, @Inject('BASE_URL') private baseUrl: string, private route: Router) {

    this.ngOnInit();

    //WS call - Get the fields for the specific store if we are not creatig a new store
    if (this.stroreId != -1) {
      http.get<Istore>(baseUrl + 'bestores/GetStoreById/' + this.clientID + '/' + this.stroreId).subscribe(result => {
        console.log(result);
        this.store = result;
      }, error => console.error(error));
    }

  }

  
  ngOnInit(): void {
    //Get Id from the store
    this.stroreId = Number(this.router.snapshot.params['stroreid']);

  }

  //When canceling the create new store feature the user must navigate back to store list
  onCickCancel() {
    this.route.navigate(['store-comp']);
  }

  onCickDelete() {
    console.log("Store ID: " + this.stroreId);
    
    if (this.stroreId != -1) {
      console.log("delete:" + this.stroreId);
      this.http.delete<Istore>(this.baseUrl + 'bestores/DeleteStoreById/' + this.clientID + '/' + this.stroreId).subscribe(result => {
        console.log(result);
      }, error => console.error(error));
    }

    this.route.navigate(['store-comp']);
  }

  //Submit form to Back-end
  submit(FormStores: any) {
    console.log("Store ID: " + this.stroreId);

    if (this.stroreId == -1) {
      console.log("post:" + this.stroreId);
      this.http.post<Istore>(this.baseUrl + 'bestores/PostStore/' + this.clientID, this.store).subscribe(result => {
        console.log(result);
      }, error => console.error(error));
    } else {
      console.log("put");
      this.http.put<Istore>(this.baseUrl + 'bestores/PutStoreById/' + this.clientID + '/' + this.stroreId, this.store).subscribe(result => {
        console.log(result);
      }, error => console.error(error));
    }

    this.route.navigate(['store-comp']);

  }
}
