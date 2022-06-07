import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DataService } from '../../nav-menu-interna/data.service';
import { Istore } from '../../store/IStore.interface';

@Component({
  selector: 'app-commercial-offer-list',
  templateUrl: './commercial-offer-list.component.html',
  styleUrls: ['./commercial-offer-list.component.css']
})
export class CommercialOfferListComponent implements OnInit {

  public stores: Istore[] = [];
  public clientID: number = 12345678;

  /*Is it supposed to relicate the Commercial offert from another store?*/
  selectionsReplicate = ['Não', 'Sim'];
  /*Default case*/
  selectedOption = 'Não';

  public subscription: Subscription;
  public map: Map<number, boolean>;
  public currentPage : number;

  constructor(http: HttpClient, @Inject('BASE_URL') baseUrl: string, private route: Router, private data: DataService) {
    /*Get stores list*/
    this.ngOnInit();
    http.get<Istore[]>(baseUrl + 'bestores/GetAllStores/' + this.clientID).subscribe(result => {
      console.log(result);
      this.stores = result;
    }, error => console.error(error));
    this.updateData(false, 5);
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

  onCickContinue() {
    this.route.navigate(['commercial-offert-tariff']);
  }


}
