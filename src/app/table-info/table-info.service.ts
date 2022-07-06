import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { CountryInformation, EconomicActivityInformation, LegalNature, PEPTypes, POS, Product, ShopActivity, StakeholderRole } from './ITable-info.interface';

@Injectable({
  providedIn: 'root'
})
export class TableInfoService {

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }

  GetAllCountries(): any {
    return this.http.get<CountryInformation[]>(this.baseUrl + 'GetAllCountries');
  }

  GetCountryById(code: string): any {
    return this.http.get<CountryInformation>(this.baseUrl + 'GetCountry/' + code);
  }

  GetAllCAEs() {
    return this.http.get<EconomicActivityInformation[]>(this.baseUrl + 'GetAllCAEs');
  }

  GetAllLegalNatures() {
    return this.http.get<LegalNature[]>(this.baseUrl + 'GetAllLegalNatures');
  }

  GetAllStakeholderRoles() {
    return this.http.get<StakeholderRole[]>(this.baseUrl + 'GetAllStakeholderRoles');
  }

  GetAllShopActivities() {
    return this.http.get<ShopActivity[]>(this.baseUrl + 'GetAllShopActivities');
  }

  GetAllPEPTypes() {
    return this.http.get<PEPTypes[]>(this.baseUrl + 'GetAllPEPTypes');
  }

  GetAllPOS() {
    return this.http.get<POS[]>(this.baseUrl + 'GetAllPOS');
  }

  GetAllProducts() {
    return this.http.get<Product[]>(this.baseUrl + 'GetAllProducts');
  }
}
