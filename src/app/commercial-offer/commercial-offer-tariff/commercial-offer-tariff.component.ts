import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IPricing } from '../IPricing.interface';

@Component({
  selector: 'app-commercial-offer-tariff',
  templateUrl: './commercial-offer-tariff.component.html',
  styleUrls: ['./commercial-offer-tariff.component.css']
})
export class CommercialOfferTariffComponent implements OnInit {

  constructor(private route: Router) { }


  prices: IPricing[] = [
    {
      package: "teste 1",
      denomination: "teste 2",
      value: 10.3,
      tsc: 0.2,
      editable: false
    },
    {
      package: "Tarifa",
      denomination: "Denominação",
      value: 0.35,
      tsc: 0.8,
      editable: false
    },
    {
      package: "Tarifa",
      denomination: "Denominação 2",
      value: 0.35,
      tsc: 0.8,
      editable: false
    },
    {
      package: "teste 1",
      denomination: "teste 3",
      value: 10.3,
      tsc: 0.2,
      editable: false
    }
  ];


  selectedTarif: string = this.prices.findIndex(x => x.package === 'Tarifa').toString();
  
  selectedNonTarif: string = this.prices.findIndex(x => x.package != 'Tarifa').toString();

  ngOnInit(): void {
    console.log(this.prices)
    console.log(this.selectedTarif)
  }

  onChangeCheckbox($event: any) {
    console.log(this.prices)
  }

  onCickContinue() {
    console.log(this.selectedTarif)
    this.prices[this.selectedTarif].editable = true;
    this.prices[this.selectedNonTarif].editable = true;
    console.log(this.prices);
    this.route.navigate(['commercial-offert-pricing']);
  }

}
