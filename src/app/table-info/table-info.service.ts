import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { Configuration, configurationToken } from '../configuration';
import { HttpMethod } from '../enums/enum-data';
import { Bank, ShopBankingInformation } from '../store/IStore.interface';
import { Address, CorporateRelations, CountryInformation, DocumentSearchType, EconomicActivityInformation, Kinship, LegalNature, PEPTypes, POS, Product, RequestResponse, ShopActivity, ShoppingCenter, StakeholderRole, TenantCommunication, TenantTerminal, TreatedResponse, UserTypes } from './ITable-info.interface';

@Injectable({
  providedIn: 'root'
})
export class TableInfoService {
  private acquiringUrl: string;
  currentLanguage: string;

  languageStream$ = new BehaviorSubject<string>(''); //temos de estar à escuta para termos a currentLanguage


  constructor(private http: HttpClient, @Inject(configurationToken) private configuration: Configuration, public translate: TranslateService) {
    this.acquiringUrl = configuration.acquiringAPIUrl;
    // this.currentLanguage = this.translate.currentLang; 

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
        'Accept-Language': this.currentLanguage,
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

  //callAPIOutboundNew(httpMethod: HttpMethod, httpURL: string, searchId: string, searchType: string, requestId: string, AcquiringUserId: string, acceptLanguage: string, body?: any, countryId?: string, AcquiringPartnerId?: string, AcquiringBranchId?: string, AcquiringProcessId?: string) {
  //  var requestResponse: RequestResponse = {};

  //  var HTTP_OPTIONS = {
  //    headers: new HttpHeaders({
  //      'Request-Id': requestId,
  //      'X-Acquiring-UserId': AcquiringUserId,
  //      'Accept-Language': this.currentLanguage,
  //    }),
  //  }

  //  if (AcquiringPartnerId !== null)
  //    HTTP_OPTIONS.headers.append("X-Acquiring-PartnerId", AcquiringPartnerId);
  //  if (AcquiringBranchId !== null)
  //    HTTP_OPTIONS.headers.append("X-Acquiring-BranchId", AcquiringBranchId);
  //  if (AcquiringProcessId !== null)
  //    HTTP_OPTIONS.headers.append("X-Acquiring-ProcessId", AcquiringProcessId);

  //  return new Promise<RequestResponse>((resolve, reject) => {
  //    this.http[httpMethod]<RequestResponse[]>(httpURL, body, HTTP_OPTIONS).subscribe({
  //      next: (res: any) => {
  //        requestResponse.result = res;
  //        requestResponse.error = null;
  //        resolve(requestResponse);
  //      },
  //      error: (err: any) => {
  //        requestResponse.result = null;
  //        requestResponse.error = {
  //          code: err.status,
  //          message: err.statusText
  //        }
  //        reject(requestResponse);
  //      },
  //      complete: () => {
  //        console.log("pedido terminado!!");
  //      }
  //    });
  //  });
  //}


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

  GetAllCAEs() {
    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Accept-Language': this.currentLanguage,

      }),
    }
    return this.http.get<EconomicActivityInformation[]>(this.acquiringUrl + 'merchant/economicactivity', HTTP_OPTIONS);
  }

  GetCAEByCode(code: string) {
    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Accept-Language': this.currentLanguage,

      }),
    }
    return this.http.get<EconomicActivityInformation>(this.acquiringUrl + 'merchant/economicactivity/' + code, HTTP_OPTIONS);
  }

  GetAllLegalNatures() {
    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Accept-Language': this.currentLanguage,

      }),
    }
    return this.http.get<LegalNature[]>(this.acquiringUrl + 'merchant/legalnature', HTTP_OPTIONS);
  }

  GetAllStakeholderRoles() {
    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Accept-Language': this.currentLanguage,

      }),
    }
    return this.http.get<StakeholderRole[]>(this.acquiringUrl + 'stakeholder/role', HTTP_OPTIONS);
  }

  GetAllShopActivities() {
    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Accept-Language': this.currentLanguage,

      }),
    }
    return this.http.get<ShopActivity[]>(this.acquiringUrl + 'shop/activity', HTTP_OPTIONS);
  }

    GetBanks(): any{
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

  GetAllPOS() {
    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Accept-Language': this.currentLanguage,

      }),
    }
    return this.http.get<POS[]>(this.acquiringUrl + 'pos', HTTP_OPTIONS);
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

  GetAddressByZipCodeTeste(cp4: number, cp3: number): Promise<TreatedResponse<Address>> {

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
        console.log("erro que deu: ", error);
        response.result = null;
        response.msg = "Código Postal inválido";
        reject(response);
      })
    });
  }

  ////////////////////////////////////////////////////////////
  //delete (remover daqui)
    deleteDocument(submissionID, documentID) {
    var url = this.acquiringUrl + 'submission/' + submissionID + '/document/' + documentID;
    var response: TreatedResponse<any> = {};


    return new Promise<TreatedResponse<any>>((resolve, reject) => {
      this.callAPIAcquiring(HttpMethod.DELETE, url).then(success => {
        console.log("Apagou o documento");
        response.result = success.result;
        response.msg = "Sucesso";
        resolve(response);
      }, error => {
        console.log("Não apagou o documento (erro)");
        response.result = null;
        response.msg = "Não foi possível remover o documento";
        reject(response);
      });
    })
  }

  ////////////////////////////////////////////////////////

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
}
