import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from 'src/app/logger.service';
import { APIRequestsService } from '../apirequests.service';
import { Configuration, configurationToken } from '../configuration';
import { HttpMethod } from '../enums/enum-data';
import { TreatedResponse } from '../table-info/ITable-info.interface';
import { TableInfoService } from '../table-info/table-info.service';
import { Product, ProductPack, ProductPackCommission, ProductPackCommissionAttribute, ProductPackCommissionEntry, ProductPackCommissionFilter, ProductPackEntry, ProductPackFilter, ProductPackPricing, ProductPackPricingAttribute, ProductPackPricingEntry, ProductPackPricingFilter } from './ICommercialOffer.interface';

@Injectable({
  providedIn: 'root'
})
export class CommercialOfferService {

  public baseUrl: string;
  public urlOutbound: string;
  public currentLanguage: string;

  constructor(private logger: LoggerService, private apiRequest: APIRequestsService ,private http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private tableInfo: TableInfoService, private translateService: TranslateService) {
    this.baseUrl = configuration.acquiringAPIUrl;
    this.urlOutbound = configuration.outboundUrl;
    this.currentLanguage = this.translateService.currentLang;
  }

  OutboundGetProductsAvailable(): Promise<TreatedResponse<Product[]>> {
    var URI = this.urlOutbound + "api/v1/product/catalog/" + this.currentLanguage;

    var treatedResponse: TreatedResponse<Product[]> = {};


    return new Promise<TreatedResponse<Product[]>>((resolve, reject) => {
      this.apiRequest.callAPIOutbound(HttpMethod.GET, URI, "por mudar", "por mudar", "por mudar", "por mudar").then(success => {
        treatedResponse.result = success.result;
        treatedResponse.msg = "sucesso";
        resolve(treatedResponse);
      }, error => {
        treatedResponse.result = null;
        treatedResponse.msg = "Codigo errado";
      });
    });
  }

  OutboundGetPacks(productPackFilter: ProductPackFilter): Promise<TreatedResponse<ProductPackEntry[]>> {
    var URI = this.urlOutbound + "api/v1/product/pack/" + this.currentLanguage;

    var treatedResponse: TreatedResponse<ProductPackEntry[]> = {};


    return new Promise<TreatedResponse<ProductPackEntry[]>>((resolve, reject) => {
      this.apiRequest.callAPIOutbound(HttpMethod.POST, URI, "por mudar", "por mudar", "por mudar", "por mudar", productPackFilter).then(success => {
        treatedResponse.result = success.result;
        treatedResponse.msg = "sucesso";
        resolve(treatedResponse);
      }, error => {
        treatedResponse.result = null;
        treatedResponse.msg = "Codigo errado";
      });
    });
  }

  OutboundGetPackDetails(packID: string, productPackFilter: ProductPackFilter): Promise<TreatedResponse<ProductPack>> {
    var URI = this.urlOutbound + "api/v1/product/pack/" + this.currentLanguage + "/" + packID;

    var treatedResponse: TreatedResponse<ProductPack> = {};


    return new Promise<TreatedResponse<ProductPack>>((resolve, reject) => {
      this.apiRequest.callAPIOutbound(HttpMethod.POST, URI, "por mudar", "por mudar", "por mudar", "por mudar", productPackFilter).then(success => {
        treatedResponse.result = success.result;
        treatedResponse.msg = "sucesso";
        resolve(treatedResponse);
      }, error => {
        treatedResponse.result = null;
        treatedResponse.msg = "Codigo errado";
      });
    });
  }

  //Obter os Pacotes Pricing 
  ListProductCommercialPackPricing(packId: string, productPackPricingFilter: ProductPackPricingFilter) {
    var URI = this.urlOutbound + "api/v1/product/pack/" + this.currentLanguage + "/" + packId + "/pricing";

    var treatedResponse: TreatedResponse<ProductPackPricingEntry[]> = {};

    return new Promise<TreatedResponse<ProductPackPricingEntry[]>>((resolve, reject) => {
      this.apiRequest.callAPIOutbound(HttpMethod.POST, URI, "por mudar", "por mudar", "por mudar", "por mudar", productPackPricingFilter).then(success => {
        treatedResponse.result = success.result;
        treatedResponse.msg = "sucesso";
        resolve(treatedResponse);
      }, error => {
        treatedResponse.result = null;
        treatedResponse.msg = "Codigo errado";
      });
    });

  }

  //Retorna os detalhes de um Pacote Pricing
  GetProductCommercialPackPricing(packId: string, pricingId: string, productPackPricingFilter: ProductPackPricingFilter) {
    var URI = this.urlOutbound + "api/v1/product/pack/" + this.currentLanguage + "/" + packId + "/pricing/" + pricingId;

    var treatedResponse: TreatedResponse<ProductPackPricing> = {};

    return new Promise<TreatedResponse<ProductPackPricing>>((resolve, reject) => {
      this.apiRequest.callAPIOutbound(HttpMethod.POST, URI, "por mudar", "por mudar", "por mudar", "por mudar", productPackPricingFilter).then(success => {
        treatedResponse.result = success.result;
        treatedResponse.msg = "sucesso";
        resolve(treatedResponse);
      }, error => {
        treatedResponse.result = null;
        treatedResponse.msg = "Codigo errado";
      });
    });
  }


  ListProductCommercialPackCommission(packId: string, productPackCommissionFilter: ProductPackCommissionFilter) {
    var URI = this.urlOutbound + "api/v1/product/pack/" + this.currentLanguage + "/" + packId + "/commission";

    var treatedResponse: TreatedResponse<ProductPackPricingEntry[]> = {};

    return new Promise<TreatedResponse<ProductPackPricingEntry[]>>((resolve, reject) => {
      this.apiRequest.callAPIOutbound(HttpMethod.POST, URI, "por mudar", "por mudar", "por mudar", "por mudar", productPackCommissionFilter).then(success => {
        treatedResponse.result = success.result;
        treatedResponse.msg = "sucesso";
        resolve(treatedResponse);
      }, error => {
        treatedResponse.result = null;
        treatedResponse.msg = "Codigo errado";
      });
    });
  }

  GetProductCommercialPackCommission(packId: string, commissionId: string, productPackCommissionFilter: ProductPackCommissionFilter) {
    var URI = this.urlOutbound + "api/v1/product/pack/" + this.currentLanguage + "/" + packId + "/commission/" + commissionId;

    var treatedResponse: TreatedResponse<ProductPackCommission> = {};

    return new Promise<TreatedResponse<ProductPackCommission>>((resolve, reject) => {
      this.apiRequest.callAPIOutbound(HttpMethod.POST, URI, "por mudar", "por mudar", "por mudar", "por mudar", productPackCommissionFilter).then(success => {
        treatedResponse.result = success.result;
        treatedResponse.msg = "sucesso";
        resolve(treatedResponse);
      }, error => {
        treatedResponse.result = null;
        treatedResponse.msg = "Codigo errado";
      });
    });
  }
}
