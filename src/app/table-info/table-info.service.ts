import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { CountryInformation, EconomicActivityInformation, LegalNature, PEPTypes, POS, Product, ShopActivity, StakeholderRole } from './ITable-info.interface';

@Injectable({
  providedIn: 'root'
})
export class TableInfoService {

  constructor(private http: HttpClient, @Inject('ACQUIRING_URL') private acquiringUrl: string) { }

  GetAllCountries(): any {
    return this.http.get<CountryInformation[]>(this.acquiringUrl + 'country');
  }

  GetCountryById(code: string): any {
    return this.http.get<CountryInformation>(this.acquiringUrl + 'country/' + code);
  }

  GetAllCAEs() {
    return this.http.get<EconomicActivityInformation[]>(this.acquiringUrl + 'merchant/economicactivity');
  }

  GetCAEByCode(code: string): any {
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
    return this.http.get<POS[]>(this.acquiringUrl + 'pointofsale');
  }

  GetAllProducts() {
    return this.http.get<Product[]>(this.acquiringUrl + 'product');
  }
}
