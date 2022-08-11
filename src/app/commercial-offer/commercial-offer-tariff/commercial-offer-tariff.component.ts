import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Configuration, configurationToken } from 'src/app/configuration';
import { ITariff } from '../ITariff.interface';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-commercial-offer-tariff',
  templateUrl: './commercial-offer-tariff.component.html',
  styleUrls: ['./commercial-offer-tariff.component.css']
})
export class CommercialOfferTariffComponent implements OnInit {

  private baseUrl;


  /*Tariffs structure*/
  tariffs: ITariff[] = [];
  public clientID: number = 12345678;

  selectedTarif: string = "";
  selectedNonTarif: string = "";

  constructor(private logger : NGXLogger, private http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private route: Router) {
    this.baseUrl = configuration.baseUrl;

    
    /*Get Tariffs List*/
    http.get<ITariff[]>(this.baseUrl + 'becommercialoffer/GetTariff/' + this.clientID).subscribe(result => {
      this.tariffs = result;
      this.logger.debug(this.tariffs)
      /*Get the first element to display in each table*/
      this.selectedTarif = this.tariffs.findIndex(x => x.package === 'Tarifa').toString();
      this.selectedNonTarif = this.tariffs.findIndex(x => x.package != 'Tarifa').toString();

    }, error => console.error(error));
  }

  ngOnInit(): void {
    this.logger.debug(this.tariffs)
    this.logger.debug(this.selectedTarif)
  }

  /*Controls the Continue Button*/
  onCickContinue() {
    this.logger.debug(this.selectedTarif)
    this.tariffs[this.selectedTarif].selected = true;
    this.tariffs[this.selectedNonTarif].selected = true;
    this.logger.debug(this.tariffs);

    /*Submit tariff*/
    this.http.post<number>(this.baseUrl + 'becommercialoffer/PostTariff/' + this.clientID, this.tariffs).subscribe(result => {
      this.logger.debug(result);
      this.route.navigate(['commercial-offert-pricing']);
    }, error => console.error(error));
  }

}
