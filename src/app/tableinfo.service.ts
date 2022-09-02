import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Configuration, configurationToken } from './configuration';
import { ITableInformation } from './ITableInformation.interface';
import { DataService } from './nav-menu-interna/data.service';
import { LoggerService } from 'src/app/logger.service';

@Injectable({
  providedIn: 'root'
})
export class TableinfoService {
  GetAddressByZipCode(arg0: string, arg1: string) {
      throw new Error('Method not implemented.');
  }
  private baseUrl;

  constructor(private logger : LoggerService, private router: ActivatedRoute,
    private http: HttpClient, 
    @Inject(configurationToken) private configuration: Configuration,
    private route: Router,
    private data: DataService,
    private fb: FormBuilder) { 
      this.baseUrl = configuration.baseUrl;
    }

// To get: /api/country
  getAllCountriesList() {
    let messageId = ""
    let url = this.baseUrl + 'betable/GetAllCountries/';
    this.http.get<ITableInformation>(url , {observe: "response"}).subscribe(result => {
      this.logger.response(result, "");
    }, error => this.logger.responseCustom(url, JSON.stringify(error.headers), error.message, messageId, error.status.toString()));
  }


// To get: /api/country/{code} 
  getCountry(countryCode) {
    let messageId = ""
    let url = this.baseUrl + 'betable/GetCountry/' + countryCode;
    this.logger.request("GET", this.baseUrl + 'betable/GetAllCountries/', "", "", messageId);
    this.http.get<ITableInformation>(url, {observe: "response"} ).subscribe(result => {
      this.logger.response(result, "");
    }, error => this.logger.responseError(error, ""));
  }




}
