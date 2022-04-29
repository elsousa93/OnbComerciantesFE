import { Component, OnInit } from '@angular/core';
import { IPricing } from '../IPricing.interface';

@Component({
  selector: 'app-commercial-offer-tariff',
  templateUrl: './commercial-offer-tariff.component.html',
  styleUrls: ['./commercial-offer-tariff.component.css']
})
export class CommercialOfferTariffComponent implements OnInit {

  constructor() { }

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

  ngOnInit(): void {
  }

}
