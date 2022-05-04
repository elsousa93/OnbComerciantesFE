import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IPricing } from '../IPricing.interface';

@Component({
  selector: 'app-commercial-offer-pricing',
  templateUrl: './commercial-offer-pricing.component.html',
  styleUrls: ['./commercial-offer-pricing.component.css']
})
export class CommercialOfferPricingComponent implements OnInit {

  prices: IPricing[] = [
    {
      package: "teste 1",
      denomination: "teste 2",
      value: 10.3,
      tsc: 0.2,
      editable: true
    },
    {
      package: "Tarifa",
      denomination: "Denominação",
      value: 0.35,
      tsc: 0.8,
      editable: false
    }
  ];
  public clientID: number = 12345678;

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string, private route: Router) {
    http.get<IPricing[]>(baseUrl + 'becommercialoffer/GetPricing/' + this.clientID).subscribe(result => {
      this.prices = result;
      console.log(this.prices)

    }, error => console.error(error));
  }

  ngOnInit(): void {
  }

  editPricing(index: number) {
    console.log(index)
    console.log(this.prices)
    //code for editing

  }

  onCickContinue() {
    
    /*Submit Pricing*/
    this.http.post<number>(this.baseUrl + 'becommercialoffer/PostPricing/' + this.clientID, this.prices).subscribe(result => {
      console.log(result);
      this.route.navigate(['info-declarativa']);
    }, error => console.error(error));
  }

}
