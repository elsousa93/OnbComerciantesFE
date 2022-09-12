import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Configuration, configurationToken } from '../configuration';
import { HttpMethod } from '../enums/enum-data';
import { TranslationLanguage } from '../translationLanguages';
import { Address, CountryInformation, DocumentSearchType, EconomicActivityInformation, LegalNature, PEPTypes, POS, Product, RequestResponse, ShopActivity, ShoppingCenter, StakeholderRole, TenantCommunication, TenantTerminal, TreatedResponse, UserTypes } from './ITable-info.interface';

@Injectable({
  providedIn: 'root'
})
export class TableInfoService {
  private acquiringUrl: string;
  currentLanguage: TranslationLanguage;
  HTTP_OPTIONS: { headers: HttpHeaders; };

  constructor(private http: HttpClient, @Inject(configurationToken) private configuration: Configuration) {
    this.acquiringUrl = configuration.acquiringAPIUrl;

    
    this.HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Accept-Language': this.currentLanguage.abbreviation
      }),
    }

  }

  callAPIAcquiring(httpMethod: HttpMethod, httpURL: string, body?: any) {
    var requestResponse: RequestResponse = {};

    return new Promise<RequestResponse>((resolve, reject) => {
      this.http[httpMethod]<TenantCommunication[]>(httpURL, body).subscribe({
        next: (res: any) => {
          requestResponse.result = res;
          requestResponse.error = null;
          resolve(requestResponse);
        },
        error: (err: any) => {
          console.log("erro obj: ", err);
          requestResponse.result = null;
          requestResponse.error = {
            code: err.status,
            message: err.statusText
          }
          reject(requestResponse);
        },
        complete: () => {
          console.log("pedido terminado!!");
        }
      });
    });
  }

  callAPIOutbound(httpMethod: HttpMethod, httpURL: string, searchId: string, searchType: string, requestId: string, AcquiringUserId: string, body?: any, countryId?: string, acceptLanguage?: string, AcquiringPartnerId?: string, AcquiringBranchId?: string, AcquiringProcessId?: string) {
    var requestResponse: RequestResponse = {};

    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Request-Id': requestId,
        'X-Acquiring-UserId': AcquiringUserId,
      }),
    }

    if (AcquiringPartnerId !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-PartnerId", AcquiringPartnerId);
    if (AcquiringBranchId !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-BranchId", AcquiringBranchId);
    if (AcquiringProcessId !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-ProcessId", AcquiringProcessId);

    return new Promise<RequestResponse>((resolve, reject) => {
      this.http[httpMethod]<TenantCommunication[]>(httpURL, body, HTTP_OPTIONS).subscribe({
        next: (res: any) => {
          requestResponse.result = res;
          requestResponse.error = null;
          resolve(requestResponse);
        },
        error: (err: any) => {
          requestResponse.result = null;
          requestResponse.error = {
            code: err.status,
            message: err.statusText
          }
          reject(requestResponse);
        },
        complete: () => {
          console.log("pedido terminado!!");
        }
      });
    });
  }


  GetAllCountries(): any{
    return this.http.get<CountryInformation[]>(this.acquiringUrl + 'country', this.HTTP_OPTIONS);
  }

  GetCountryById(code: string){
    return this.http.get<CountryInformation>(this.acquiringUrl + 'country/' + code, this.HTTP_OPTIONS);
  }

  GetAllCAEs() {
    return this.http.get<EconomicActivityInformation[]>(this.acquiringUrl + 'merchant/economicactivity', this.HTTP_OPTIONS);
  }

  GetCAEByCode(code: string){
    return this.http.get<EconomicActivityInformation>(this.acquiringUrl + 'merchant/economicactivity/' + code, this.HTTP_OPTIONS);
  }

  GetAllLegalNatures() {
    return this.http.get<LegalNature[]>(this.acquiringUrl + 'merchant/legalnature', this.HTTP_OPTIONS);
  }

  GetAllStakeholderRoles() {
    return this.http.get<StakeholderRole[]>(this.acquiringUrl + 'merchant/stakeholder/role', this.HTTP_OPTIONS);
  }

  GetAllShopActivities() {
    return this.http.get<ShopActivity[]>(this.acquiringUrl + 'shop/activity', this.HTTP_OPTIONS);
  }

  GetAllPEPTypes() {
    return this.http.get<PEPTypes[]>(this.acquiringUrl + 'pep/types', this.HTTP_OPTIONS);
  }

  GetAllPOS() {
    return this.http.get<POS[]>(this.acquiringUrl + 'pos', this.HTTP_OPTIONS);
  }

  GetAllProducts() {
    return this.http.get<Product[]>(this.acquiringUrl + 'product', this.HTTP_OPTIONS);
  }

  GetAddressByZipCode(cp4: number, cp3: number) {
        return this.http.get<Address[]>(this.acquiringUrl + 'address/pt/' + cp4 + '/' + cp3, this.HTTP_OPTIONS);
  }

  GetAddressByZipCodeTeste(cp4: number, cp3: number): Promise<TreatedResponse<Address>> {

    var url = this.acquiringUrl + 'address/pt/'+ cp4 + '/' + cp3;

    var response: TreatedResponse<Address> = {};

    return new Promise<TreatedResponse<Address>>((resolve, reject) => {
      this.callAPIAcquiring(HttpMethod.GET, url, this.HTTP_OPTIONS).then(success => {
        response.result = success.result;
        response.msg = "Sucesso";
        resolve(response);
      }, error => {
        console.log("erro que deu: ", error);
        response.result = null;
        response.msg = "Código Postal inválido";
        reject(response);
      })
    });

  }

  GetAllShoppingCenters(postalCode: string) {
    return this.http.get<ShoppingCenter[]>(this.acquiringUrl + 'shop/shoppingCenter?postalCode=' + postalCode, this.HTTP_OPTIONS);
  }

  GetAllSearchTypes(userType: UserTypes) {
    return this.http.get<DocumentSearchType[]>(this.acquiringUrl + 'searchtype?type=' + userType, this.HTTP_OPTIONS);
  }

  

  GetTenantCommunications(): Promise<TreatedResponse<TenantCommunication[]>> {
    var url = this.acquiringUrl + 'tenant/communication';

    var response: TreatedResponse<TenantCommunication[]> = {};

    return new Promise<TreatedResponse<TenantCommunication[]>>((resolve, reject) => {
      this.callAPIAcquiring(HttpMethod.GET, url, this.HTTP_OPTIONS).then(success => {
        response.result = success.result;
        response.msg = "Sucesso";
        resolve(response);
      }, error => {
        console.log("erro que deu: ", error);
        response.result = null;
        response.msg = "Erro";
        reject(response);
      })
    });
  }

  GetTenantTerminals(): Promise<TreatedResponse<TenantTerminal[]>> {
    var url = this.acquiringUrl + 'tenant/terminal';

    var response: TreatedResponse<TenantTerminal[]> = {};

    return new Promise<TreatedResponse<TenantTerminal[]>>((resolve, reject) => {
      this.callAPIAcquiring(HttpMethod.GET, url, this.HTTP_OPTIONS).then(success => {
        response.result = success.result;
        response.msg = "Sucesso";
        resolve(response);
      }, error => {
        console.log("erro que deu: ", error);
        response.result = null;
        response.msg = "Erro";
        reject(response);
      })
    });
  }


}
