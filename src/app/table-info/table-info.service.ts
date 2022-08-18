import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Configuration, configurationToken } from '../configuration';
import { Address, CountryInformation, EconomicActivityInformation, LegalNature, PEPTypes, POS, Product, ShopActivity, StakeholderRole } from './ITable-info.interface';

@Injectable({
  providedIn: 'root'
})
export class TableInfoService {
  private acquiringUrl: string;


  constructor(private http: HttpClient, @Inject(configurationToken) private configuration: Configuration) {
    this.acquiringUrl = configuration.acquiringAPIUrl;

   }

  GetAllCountries(): any{
    return this.http.get<CountryInformation[]>(this.acquiringUrl + 'country');
  }

  GetCountryById(code: string){
    return this.http.get<CountryInformation>(this.acquiringUrl + 'country/' + code);
  }

  GetAllCAEs() {
    return this.http.get<EconomicActivityInformation[]>(this.acquiringUrl + 'merchant/economicactivity');
  }

  GetCAEByCode(code: string){
    return this.http.get<EconomicActivityInformation>(this.acquiringUrl + 'merchant/economicactivity/' + code);
  }

  GetAllLegalNatures() {
    return this.http.get<LegalNature[]>(this.acquiringUrl + 'merchant/legalnature');
  }

  GetAllStakeholderRoles() {
    return this.http.get<StakeholderRole[]>(this.acquiringUrl + 'merchant/stakeholder/role');
  }

  GetAllShopActivities() {
    return this.http.get<ShopActivity[]>(this.acquiringUrl + 'shop/activity');
  }

  GetAllPEPTypes() {
    return this.http.get<PEPTypes[]>(this.acquiringUrl + 'pep/types');
  }

  GetAllPOS() {
    return this.http.get<POS[]>(this.acquiringUrl + 'pos');
  }

  GetAllProducts() {
    return this.http.get<Product[]>(this.acquiringUrl + 'product');
  }

  GetAddressByZipCode(cp4: number, cp3: number) {
    return this.http.get<Address[]>(this.acquiringUrl + 'address/pt/' + cp4 + '/' + cp3);
  }

}
