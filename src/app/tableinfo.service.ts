import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ITableInformation } from './ITableInformation.interface';
import { DataService } from './nav-menu-interna/data.service';

@Injectable({
  providedIn: 'root'
})
export class TableinfoService {
  GetAddressByZipCode(arg0: string, arg1: string) {
      throw new Error('Method not implemented.');
  }

  constructor(private router: ActivatedRoute,
    private http: HttpClient, @Inject('BASE_URL')
    private baseUrl: string, private route: Router,
    private data: DataService,
    private fb: FormBuilder) {   }

// To get: /api/country
  getAllCountriesList() {
    console.log("get all countries service");
    this.http.get<ITableInformation>(this.baseUrl + 'betable/GetAllCountries/').subscribe(result => {
      console.log(result);
    }, error => console.error(error));
  }


// To get: /api/country/{code} 
  getCountry(countryCode) {
    console.log("get a specific country service");
    this.http.get<ITableInformation>(this.baseUrl + 'betable/GetCountry/' + countryCode).subscribe(result => {
      console.log(result);
    }, error => console.error(error));
  }




}
