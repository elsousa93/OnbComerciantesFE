import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { APIRequestsService } from '../apirequests.service';
import { AppConfigService } from '../app-config.service';
import { HttpMethod } from '../enums/enum-data';
import { TreatedResponse } from '../table-info/ITable-info.interface';
import { ProductOutbound, ProductPack, ProductPackCommission, ProductPackCommissionFilter, ProductPackEntry, ProductPackFilter, ProductPackPricing, ProductPackPricingEntry, ProductPackPricingFilter } from './ICommercialOffer.interface';

@Injectable({
  providedIn: 'root'
})
export class CommercialOfferService {

  public baseUrl: string;
  public urlOutbound: string;
  public currentLanguage: string;

  constructor(private apiRequest: APIRequestsService, /*@Inject(configurationToken)*/ private configuration: AppConfigService, private translateService: TranslateService) {
    this.baseUrl = configuration.getConfig().acquiringAPIUrl;
    this.urlOutbound = configuration.getConfig().outboundUrl;
    this.currentLanguage = this.translateService.currentLang;
  }

  OutboundGetProductsAvailable(): Promise<TreatedResponse<ProductOutbound[]>> {
    var URI = this.urlOutbound + "api/v1/product/catalog/" + this.currentLanguage;
    var treatedResponse: TreatedResponse<ProductOutbound[]> = {};

    return new Promise<TreatedResponse<ProductOutbound[]>>((resolve, reject) => {
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
    var id = encodeURIComponent(packID);
    var URI = this.urlOutbound + "api/v1/product/pack/" + this.currentLanguage + "/" + id;
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
    var id = encodeURIComponent(packId);
    var URI = this.urlOutbound + "api/v1/product/pack/" + this.currentLanguage + "/" + id + "/pricing";
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
    var id = encodeURIComponent(packId);
    var idPricing = encodeURIComponent(pricingId);
    var URI = this.urlOutbound + "api/v1/product/pack/" + this.currentLanguage + "/" + id + "/pricing/" + idPricing;
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
    var id = encodeURIComponent(packId);
    var URI = this.urlOutbound + "api/v1/product/pack/" + this.currentLanguage + "/" + id + "/commission";
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
    var id = encodeURIComponent(packId);
    var idCommission = encodeURIComponent(commissionId);
    var URI = this.urlOutbound + "api/v1/product/pack/" + this.currentLanguage + "/" + id + "/commission/" + idCommission;
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
