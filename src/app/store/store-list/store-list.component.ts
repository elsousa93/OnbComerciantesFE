import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Istore } from '../IStore.interface';
import { Router } from '@angular/router';

//This component displays the list of the existing stores

@Component({
  selector: 'app-store-list',
  templateUrl: './store-list.component.html',
  styleUrls: ['./store-list.component.css']
})
export class StoreComponent{

  /*variable declaration*/
  public stores: Istore[] = [];
  public clientID: number = 12345678;

  constructor(http: HttpClient, @Inject('BASE_URL') baseUrl: string, private route: Router)
  {
    /*Get from the backend the full list of stores existing for the client*/
    http.get<Istore[]>(baseUrl + 'bestores/GetAllStores/' + this.clientID).subscribe(result => {
      this.stores = result;
    }, error => console.error(error));

  }
  
  ngOnInit(): void {
  }

  /*Option to add a new store - redirect to the corresponding screen*/
  onCickAdd() {
    this.route.navigate(['add-store/-1']);
  }

}
