import { Component, OnInit } from '@angular/core';
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

  constructor(private route: Router) { }

  ngOnInit(): void {
  }

  editPricing(index: number) {
    console.log(index)
    console.log(this.prices)
    //code for editing

  }

  onCickContinue() {
    this.route.navigate(['info-declarativa']);
  }

}
