import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Istore } from '../../store/IStore.interface';

@Component({
  selector: 'app-commercial-offer-list',
  templateUrl: './commercial-offer-list.component.html',
  styleUrls: ['./commercial-offer-list.component.css']
})
export class CommercialOfferListComponent implements OnInit {

  public stores: Istore[] = [];
  public clientID: number = 12345678;

  constructor(http: HttpClient, @Inject('BASE_URL') baseUrl: string, private route: Router) {
    http.get<Istore[]>(baseUrl + 'bestores/GetAllStores/' + this.clientID).subscribe(result => {
      console.log(result);
      this.stores = result;
    }, error => console.error(error));

  }

  ngOnInit(): void {
  }

}
