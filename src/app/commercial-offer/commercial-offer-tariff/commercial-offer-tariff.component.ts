import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ITariff } from '../ITariff.interface';

@Component({
  selector: 'app-commercial-offer-tariff',
  templateUrl: './commercial-offer-tariff.component.html',
  styleUrls: ['./commercial-offer-tariff.component.css']
})
export class CommercialOfferTariffComponent implements OnInit {

  /*Tariffs structure*/
  tariffs: ITariff[] = [];
  public clientID: number = 12345678;

  selectedTarif: string = "";
  selectedNonTarif: string = "";

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string, private route: Router) {
    /*Get Tariffs List*/
    http.get<ITariff[]>(baseUrl + 'becommercialoffer/GetTariff/' + this.clientID).subscribe(result => {
      this.tariffs = result;
      console.log(this.tariffs)
      /*Get the first element to display in each table*/
      this.selectedTarif = this.tariffs.findIndex(x => x.package === 'Tarifa').toString();
      this.selectedNonTarif = this.tariffs.findIndex(x => x.package != 'Tarifa').toString();

    }, error => console.error(error));
  }

  ngOnInit(): void {
    console.log(this.tariffs)
    console.log(this.selectedTarif)
  }

  /*Controls the Continue Button*/
  onCickContinue() {
    console.log(this.selectedTarif)
    this.tariffs[this.selectedTarif].selected = true;
    this.tariffs[this.selectedNonTarif].selected = true;
    console.log(this.tariffs);

    /*Submit tariff*/
    this.http.post<number>(this.baseUrl + 'becommercialoffer/PostTariff/' + this.clientID, this.tariffs).subscribe(result => {
      console.log(result);
      this.route.navigate(['commercial-offert-pricing']);
    }, error => console.error(error));
  }

}
