import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IPricing } from '../IPricing.interface';
import { ITariff } from '../ITariff.interface';

@Component({
  selector: 'app-commercial-offer-tariff',
  templateUrl: './commercial-offer-tariff.component.html',
  styleUrls: ['./commercial-offer-tariff.component.css']
})
export class CommercialOfferTariffComponent implements OnInit {

  prices: ITariff[] = [];
  public clientID: number = 12345678;

  selectedTarif: string = "";
  selectedNonTarif: string = "";

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string, private route: Router) {
    http.get<ITariff[]>(baseUrl + 'becommercialoffer/GetTariff/' + this.clientID).subscribe(result => {
      this.prices = result;
      console.log(this.prices)
      this.selectedTarif = this.prices.findIndex(x => x.package === 'Tarifa').toString();
      this.selectedNonTarif = this.prices.findIndex(x => x.package != 'Tarifa').toString();

    }, error => console.error(error));
  }

  ngOnInit(): void {
    console.log(this.prices)
    console.log(this.selectedTarif)
  }

  onChangeCheckbox($event: any) {
    console.log(this.prices)
  }

  onCickContinue() {
    console.log(this.selectedTarif)
    this.prices[this.selectedTarif].selected = true;
    this.prices[this.selectedNonTarif].selected = true;
    console.log(this.prices);

    /*Submit tariff*/
    this.http.post<number>(this.baseUrl + 'becommercialoffer/PostTariff/' + this.clientID , this.prices).subscribe(result => {
      console.log(result);
      this.route.navigate(['commercial-offert-pricing']);
    }, error => console.error(error));
  }

}
