import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Configuration, configurationToken } from 'src/app/configuration';
import { DataService } from '../../nav-menu-interna/data.service';
import { IPricing } from '../IPricing.interface';

@Component({
  selector: 'app-commercial-offer-pricing',
  templateUrl: './commercial-offer-pricing.component.html',
  styleUrls: ['./commercial-offer-pricing.component.css']
})
export class CommercialOfferPricingComponent implements OnInit {

  private baseUrl;


  /*Pricing Object*/
  prices: IPricing[] = [];
  public clientID: number = 12345678;

  public map = new Map();
  public currentPage: number;
  public subscription: Subscription;

  constructor(private http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private route: Router, private data: DataService) {
    /*Get pricing information*/
    this.ngOnInit();
    http.get<IPricing[]>(this.baseUrl + 'becommercialoffer/GetPricing/' + this.clientID).subscribe(result => {
      this.prices = result;
      console.log(this.prices)

    }, error => console.error(error));
  }

  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
  }


  /*Edit pricing button*/
  editPricing(index: number) {
    console.log(index)
    console.log(this.prices)
    //code for editing

  }

  /*Controls the continue button*/
  onCickContinue() {
    this.data.updateData(true, 5);
    /*Submit Pricing*/
    this.http.post<number>(this.baseUrl + 'becommercialoffer/PostPricing/' + this.clientID, this.prices).subscribe(result => {
      console.log(result);
      this.route.navigate(['info-declarativa'], { state: { isFinished: true } });
    }, error => console.error(error));
  }

}
