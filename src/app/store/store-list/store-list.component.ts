import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Istore } from '../IStore.interface';
import { Router } from '@angular/router';
import { DataService } from '../../nav-menu-interna/data.service';
import { Subscription } from 'rxjs';

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

  public map: Map<number, boolean>;
  public currentPage: number;
  public subscription: Subscription;

  constructor(http: HttpClient, @Inject('BASE_URL') baseUrl: string, private route: Router, private data: DataService)
  {
    this.ngOnInit();
    /*Get from the backend the full list of stores existing for the client*/
    http.get<Istore[]>(baseUrl + 'bestores/GetAllStores/' + this.clientID).subscribe(result => {
      this.stores = result;
    }, error => console.error(error));
    this.updateData(false, 4);
  }
  
  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
  }

  //função que altera o valor do map e da currentPage
  updateData(value: boolean, currentPage: number) {
    this.map.set(currentPage, value);
    this.data.changeData(this.map);
    this.data.changeCurrentPage(currentPage);
  }
  

  /*Option to add a new store - redirect to the corresponding screen*/
  onCickAdd() {
    this.route.navigate(['add-store/-1']);
  }

  onCickContinue() {
    this.updateData(true, this.currentPage);
    this.route.navigate(['commercial-offert-list']);
  }

}
