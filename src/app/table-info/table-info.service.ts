import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { CountryInformation, EconomicActivityInformation, LegalNature, PEPTypes, POS, Product, ShopActivity, StakeholderRole } from './itable-info.interface';

@Injectable({
  providedIn: 'root'
})
export class TableInfoService {

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }

  GetAllCountries(): any {
    return this.http.get<CountryInformation[]>(this.baseUrl + 'BEConfig/GetAllCountries');
  }

  GetCountryById(code: string): any {
    return this.http.get<CountryInformation>(this.baseUrl + 'BEConfig/GetCountry/' + code);
  }

  GetAllCAEs() {
    return this.http.get<EconomicActivityInformation[]>(this.baseUrl + 'BEConfig/GetAllCAEs');
  }

  GetAllLegalNatures() {
    return this.http.get<LegalNature[]>(this.baseUrl + 'BEConfig/GetAllLegalNatures');
  }

  GetAllStakeholderRoles() {
    return this.http.get<StakeholderRole[]>(this.baseUrl + 'BEConfig/GetAllStakeholderRoles');
  }

  GetAllShopActivities() {
    return this.http.get<ShopActivity[]>(this.baseUrl + 'BEConfig/GetAllShopActivities');
  }

  GetAllPEPTypes() {
    return this.http.get<PEPTypes>(this.baseUrl + 'BEConfig/GetAllPEPTypes');
  }

  GetAllPOS() {
    return this.http.get<POS[]>(this.baseUrl + 'BEConfig/GetAllPOS');
  }

  GetAllProducts() {
    return this.http.get<Product[]>(this.baseUrl + 'BEConfig/GetAllProducts');
  }
}
