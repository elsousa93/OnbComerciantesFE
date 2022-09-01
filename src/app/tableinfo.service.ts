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
    this.logger.debug("get all countries service");
    this.http.get<ITableInformation>(this.baseUrl + 'betable/GetAllCountries/').subscribe(result => {
      this.logger.debug(result);
    }, error => console.error(error));
  }


// To get: /api/country/{code} 
  getCountry(countryCode) {
    this.logger.debug("get a specific country service");
    this.http.get<ITableInformation>(this.baseUrl + 'betable/GetCountry/' + countryCode).subscribe(result => {
      this.logger.debug(result);
    }, error => console.error(error));
  }




}
