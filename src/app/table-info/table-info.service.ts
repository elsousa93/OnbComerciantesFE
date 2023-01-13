import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { APIRequestsService } from '../apirequests.service';
import { AppConfigService } from '../app-config.service';
import { PurposeDocument } from '../comprovativos/IComprovativos.interface';
import { HttpMethod } from '../enums/enum-data';
import { Bank } from '../store/IStore.interface';
import { Address, ContractPackLanguage, CorporateRelations, CountryInformation, DocTypes, DocumentSearchType, EconomicActivityInformation, Franchise, Kinship, PEPTypes, Product, RequestResponse, ShopActivity, ShoppingCenter, StakeholderRole, TenantCommunication, TenantTerminal, TreatedResponse, UserTypes } from './ITable-info.interface';

@Injectable({
  providedIn: 'root'
})
export class TableInfoService {
  private acquiringUrl: string;
  currentLanguage: string;

  languageStream$ = new BehaviorSubject<string>(''); //temos de estar à escuta para termos a currentLanguage


  constructor(private http: HttpClient, /*@Inject(configurationToken)*/ private configuration: AppConfigService, public translate: TranslateService, private API: APIRequestsService) {
    this.acquiringUrl = configuration.getConfig().acquiringAPIUrl;

    this.languageStream$.subscribe((val) => {
      this.currentLanguage = val
    });
  }

  callAPIAcquiring(httpMethod: HttpMethod, httpURL: string, body?: any) {
    var requestResponse: RequestResponse = {};

    return new Promise<RequestResponse>((resolve, reject) => {
      this.http[httpMethod]<any>(httpURL, body).subscribe({
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
          console.log("pedido efetuado");
        }
      });
    });
  }

  GetAllCountries(): any {
    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Accept-Language': this.currentLanguage,

      }),
    }
    return this.http.get<CountryInformation[]>(this.acquiringUrl + 'country', HTTP_OPTIONS);
  }

  GetCountryById(code: string) {
    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Accept-Language': this.currentLanguage,
      }),
    }
    return this.http.get<CountryInformation>(this.acquiringUrl + 'country/' + code, HTTP_OPTIONS);
  }

  GetCAEByCode(code: string) {
    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Accept-Language': this.currentLanguage,
      }),
    }
    return this.http.get<EconomicActivityInformation>(this.acquiringUrl + 'merchant/economicactivity/' + code, HTTP_OPTIONS);
  }

  FilterStoreByCAE(code: string) {
    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Accept-Language': this.currentLanguage,
      }),
    }
    return this.http.get<ShopActivity[]>(this.acquiringUrl + 'merchant/economicactivity/' + code + '/activity', HTTP_OPTIONS);
  }

  GetAllLegalNatures() {
    var url = this.acquiringUrl + 'merchant/legalnature';
    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Accept-Language': this.currentLanguage,
      }),
    }
    return this.API.callAPIAcquiring(HttpMethod.GET, url, HTTP_OPTIONS);
  }

  GetAllStakeholderRoles() {
    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Accept-Language': this.currentLanguage,
      }),
    }
    return this.http.get<StakeholderRole[]>(this.acquiringUrl + 'stakeholder/role', HTTP_OPTIONS);
  }

  GetBanks(): any {
    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Accept-Language': this.currentLanguage,
      }),
    }
    return this.http.get<Bank>(this.acquiringUrl + 'bank', HTTP_OPTIONS);
  }

  GetAllPEPTypes() {
    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Accept-Language': this.currentLanguage,
      }),
    }
    return this.http.get<PEPTypes[]>(this.acquiringUrl + 'pep/types', HTTP_OPTIONS);
  }

  GetAllKinships() {
    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Accept-Language': this.currentLanguage,
      }),
    }
    return this.http.get<Kinship[]>(this.acquiringUrl + 'stakeholder/kinship', HTTP_OPTIONS);
  }

  GetAllCorporateRelations() {
    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Accept-Language': this.currentLanguage,
      }),
    }
    return this.http.get<CorporateRelations[]>(this.acquiringUrl + 'merchant/corporaterelations', HTTP_OPTIONS);
  }

  GetAllFranchises() {
    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Accept-Language': this.currentLanguage,
      }),
    }
    return this.http.get<Franchise[]>(this.acquiringUrl + 'franchise', HTTP_OPTIONS);
  }

  GetAllDocumentTypes() {
    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Accept-Language': this.currentLanguage,
      }),
    }
    return this.http.get<DocTypes[]>(this.acquiringUrl + 'identificationdocument', HTTP_OPTIONS);
  }

  GetAllProducts() {
    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Accept-Language': this.currentLanguage,
      }),
    }
    return this.http.get<Product[]>(this.acquiringUrl + 'product', HTTP_OPTIONS);
  }

  GetAddressByZipCode(cp4: number, cp3: number) {
    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Accept-Language': this.currentLanguage,
      }),
    }
    return this.http.get<Address[]>(this.acquiringUrl + 'address/pt/' + cp4 + '/' + cp3, HTTP_OPTIONS);
  }

  GetShoppingByZipCode(cp: number) {
    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Accept-Language': this.currentLanguage,
      }),
    }
    return this.http.get<ShoppingCenter[]>(this.acquiringUrl + 'address/' + cp + '/shoppingcenter', HTTP_OPTIONS);
  }

  GetAddressByZipCodeShops(cp4: number, cp3: number): Promise<TreatedResponse<Address>> {

    var url = this.acquiringUrl + 'address/pt/' + cp4 + '/' + cp3;
    var response: TreatedResponse<Address> = {};

    return new Promise<TreatedResponse<Address>>((resolve, reject) => {
      var HTTP_OPTIONS = {
        headers: new HttpHeaders({
          'Accept-Language': this.currentLanguage,
        }),
      }
      this.callAPIAcquiring(HttpMethod.GET, url, HTTP_OPTIONS).then(success => {
        response.result = success.result;
        response.msg = "Sucesso";
        resolve(response);
      }, error => {
        response.result = null;
        response.msg = "Código Postal inválido";
        reject(response);
      })
    });
  }

  GetAllShoppingCenters(postalCode: string) {
    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Accept-Language': this.currentLanguage,
      }),
    }
    return this.http.get<ShoppingCenter[]>(this.acquiringUrl + 'shop/shoppingCenter?postalCode=' + postalCode, HTTP_OPTIONS);
  }

  GetAllSearchTypes(userType: UserTypes) {
    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Accept-Language': this.currentLanguage,
      }),
    }
    return this.http.get<DocumentSearchType[]>(this.acquiringUrl + 'searchtype?type=' + userType, HTTP_OPTIONS);
  }

  GetDocumentsDescription() {
    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Accept-Language': this.currentLanguage,
      }),
    }
    return this.http.get<DocumentSearchType[]>(this.acquiringUrl + 'document-type-information', HTTP_OPTIONS);
  }

  GetTenantCommunications() {

    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Accept-Language': this.currentLanguage,
      }),
    }

    return this.http.get<TenantCommunication[]>(this.acquiringUrl + 'tenant/communication', HTTP_OPTIONS);
  }

  GetTenantTerminals() {
    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Accept-Language': this.currentLanguage,
      }),
    }
    return this.http.get<TenantTerminal[]>(this.acquiringUrl + 'tenant/terminal', HTTP_OPTIONS);
  }

  GetContractualPackLanguage() {
    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Accept-Language': this.currentLanguage,
      }),
    }
    return this.http.get<ContractPackLanguage[]>(this.acquiringUrl + 'contratualpacklanguage', HTTP_OPTIONS);
  }

  GetAllDocumentPurposes() {
    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Accept-Language': this.currentLanguage,
      }),
    }
    return this.http.get<PurposeDocument[]>(this.acquiringUrl + 'document-purpose', HTTP_OPTIONS);
  }
}