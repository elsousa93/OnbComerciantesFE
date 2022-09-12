import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { LoggerService } from 'src/app/logger.service';
import { Configuration, configurationToken } from '../configuration';
import { HttpMethod } from '../enums/enum-data';
import { TreatedResponse } from '../table-info/ITable-info.interface';
import { TableInfoService } from '../table-info/table-info.service';
import { Product, ProductPack, ProductPackCommission, ProductPackCommissionEntry, ProductPackCommissionFilter, ProductPackEntry, ProductPackFilter, ProductPackPricing, ProductPackPricingEntry, ProductPackPricingFilter } from './ICommercialOffer.interface';

@Injectable({
  providedIn: 'root'
})
export class CommercialOfferService {

  public baseUrl: string;
  public urlOutbound: string;

  constructor(private logger: LoggerService, private http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private tableInfo: TableInfoService) {
    this.baseUrl = configuration.acquiringAPIUrl;
    this.urlOutbound = configuration.outboundUrl;
  }

  //J� COM O NOVO FORMATO (TESTES)
  OutboundGetProductsAvailable(): Promise<TreatedResponse<Product[]>> {
    var URI = this.urlOutbound + "api/v1/product/catalog";

    var treatedResponse: TreatedResponse<Product[]> = {};


    return new Promise<TreatedResponse<Product[]>>((resolve, reject) => {
      this.tableInfo.callAPIOutbound(HttpMethod.GET, URI, "por mudar", "por mudar", "por mudar", "por mudar").then(success => {
        console.log("success: ", success);

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
    var URI = this.urlOutbound + "api/v1/product/pack";

    var treatedResponse: TreatedResponse<ProductPackEntry[]> = {};


    return new Promise<TreatedResponse<ProductPackEntry[]>>((resolve, reject) => {
      this.tableInfo.callAPIOutbound(HttpMethod.POST, URI, "por mudar", "por mudar", "por mudar", "por mudar", productPackFilter).then(success => {
        console.log("success: ", success);

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
    var URI = this.urlOutbound + "api/v1/product/pack/" + packID;

    var treatedResponse: TreatedResponse<ProductPack> = {};


    return new Promise<TreatedResponse<ProductPack>>((resolve, reject) => {
      this.tableInfo.callAPIOutbound(HttpMethod.POST, URI, "por mudar", "por mudar", "por mudar", "por mudar", productPackFilter).then(success => {
        console.log("success: ", success);

        treatedResponse.result = success.result;
        treatedResponse.msg = "sucesso";

        resolve(treatedResponse);

      }, error => {
        treatedResponse.result = null;
        treatedResponse.msg = "Codigo errado";
      });
    });
  }


  
  ////////////////////////////////
  //FORMATO ANTIGO
  GetProductsAvailable(requestID: string, AcquiringUserID: string, AcquiringProcessID?: string, countryID?: string, AcquiringPartnerID?: string, AcquiringBranchID?) {

    var URI = this.urlOutbound + "api/v1/product/catalog";

    if (countryID === null)
      URI += "&countryId=" + countryID;

    var data = new Date();

    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Request-Id': requestID,
        'X-Acquiring-UserId': AcquiringUserID,
      }),
    }

    if (AcquiringPartnerID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-PartnerId", AcquiringPartnerID);
    if (AcquiringBranchID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-BranchId", AcquiringBranchID);
    if (AcquiringProcessID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-ProcessId", AcquiringProcessID);
    this.logger.debug(`[Outbound] URI used is ${URI}`);
    this.logger.debug(`[Outbound] Headers used are ${JSON.stringify({
      "Request-Id": HTTP_OPTIONS.headers.get('Request-Id'),
      "X-Acquiring-UserId": HTTP_OPTIONS.headers.get('X-Acquiring-UserId'),
      "X-Acquiring-PartnerId": HTTP_OPTIONS.headers.get("X-Acquiring-PartnerId"),
      "X-Acquiring-BranchId": HTTP_OPTIONS.headers.get("X-Acquiring-BranchId"),
      "X-Acquiring-ProcessId": HTTP_OPTIONS.headers.get("X-Acquiring-ProcessId"),
    }, null, 2)}`);
    return this.http.get<Product[]>(URI, HTTP_OPTIONS);
  }

  //Obter os Tipos de Pacotes comerciais
  ListProductCommercialPacks(productPackFilter: ProductPackFilter ,requestID: string, AcquiringUserID: string, AcquiringProcessID?: string, countryID?: string, AcquiringPartnerID?: string, AcquiringBranchID?) {
    var URI = this.urlOutbound + "api/v1/product/pack";

    if (countryID === null)
      URI += "&countryId=" + countryID;

    var data = new Date();

    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Request-Id': requestID,
        'X-Acquiring-UserId': AcquiringUserID,
      }),
    }

    if (AcquiringPartnerID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-PartnerId", AcquiringPartnerID);
    if (AcquiringBranchID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-BranchId", AcquiringBranchID);
    if (AcquiringProcessID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-ProcessId", AcquiringProcessID);
    this.logger.debug(`[Outbound] URI used is ${URI}`);
    this.logger.debug(`[Outbound] Headers used are ${JSON.stringify({
      "Request-Id": HTTP_OPTIONS.headers.get('Request-Id'),
      "X-Acquiring-UserId": HTTP_OPTIONS.headers.get('X-Acquiring-UserId'),
      "X-Acquiring-PartnerId": HTTP_OPTIONS.headers.get("X-Acquiring-PartnerId"),
      "X-Acquiring-BranchId": HTTP_OPTIONS.headers.get("X-Acquiring-BranchId"),
      "X-Acquiring-ProcessId": HTTP_OPTIONS.headers.get("X-Acquiring-ProcessId"),
    }, null, 2)}`);

    return this.http.post<ProductPackEntry[]>(URI, productPackFilter, HTTP_OPTIONS);
  }

  //Retorna os atributos de um pacote comercial
  GetProductCommercialPack(packId: string, productPackFilter: ProductPackFilter, requestID: string, AcquiringUserID: string, AcquiringProcessID?: string, countryID?: string, AcquiringPartnerID?: string, AcquiringBranchID?) {
    var URI = this.urlOutbound + "api/v1/product/pack/" + packId;

    if (countryID === null)
      URI += "&countryId=" + countryID;

    var data = new Date();

    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Request-Id': requestID,
        'X-Acquiring-UserId': AcquiringUserID,
      }),
    }

    if (AcquiringPartnerID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-PartnerId", AcquiringPartnerID);
    if (AcquiringBranchID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-BranchId", AcquiringBranchID);
    if (AcquiringProcessID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-ProcessId", AcquiringProcessID);
    this.logger.debug(`[Outbound] URI used is ${URI}`);
    this.logger.debug(`[Outbound] Headers used are ${JSON.stringify({
      "Request-Id": HTTP_OPTIONS.headers.get('Request-Id'),
      "X-Acquiring-UserId": HTTP_OPTIONS.headers.get('X-Acquiring-UserId'),
      "X-Acquiring-PartnerId": HTTP_OPTIONS.headers.get("X-Acquiring-PartnerId"),
      "X-Acquiring-BranchId": HTTP_OPTIONS.headers.get("X-Acquiring-BranchId"),
      "X-Acquiring-ProcessId": HTTP_OPTIONS.headers.get("X-Acquiring-ProcessId"),
    }, null, 2)}`);

    return this.http.post<ProductPack>(URI, productPackFilter, HTTP_OPTIONS);
  }

  //Obter os Pacotes Pricing 
  ListProductCommercialPackPricing(packId: string, productPackPricingFilter: ProductPackPricingFilter, requestID: string, AcquiringUserID: string, AcquiringProcessID?: string, countryID?: string, AcquiringPartnerID?: string, AcquiringBranchID?) {
    var URI = this.urlOutbound + "api/v1/product/pack/" + packId + "/pricing";

    if (countryID === null)
      URI += "&countryId=" + countryID;

    var data = new Date();

    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Request-Id': requestID,
        'X-Acquiring-UserId': AcquiringUserID,
      }),
    }

    if (AcquiringPartnerID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-PartnerId", AcquiringPartnerID);
    if (AcquiringBranchID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-BranchId", AcquiringBranchID);
    if (AcquiringProcessID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-ProcessId", AcquiringProcessID);
    this.logger.debug(`[Outbound] URI used is ${URI}`);
    this.logger.debug(`[Outbound] Headers used are ${JSON.stringify({
      "Request-Id": HTTP_OPTIONS.headers.get('Request-Id'),
      "X-Acquiring-UserId": HTTP_OPTIONS.headers.get('X-Acquiring-UserId'),
      "X-Acquiring-PartnerId": HTTP_OPTIONS.headers.get("X-Acquiring-PartnerId"),
      "X-Acquiring-BranchId": HTTP_OPTIONS.headers.get("X-Acquiring-BranchId"),
      "X-Acquiring-ProcessId": HTTP_OPTIONS.headers.get("X-Acquiring-ProcessId"),
    }, null, 2)}`);

    return this.http.post<ProductPackPricingEntry[]>(URI, productPackPricingFilter, HTTP_OPTIONS);
  }

  //Retorna os detalhes de um Pacote Pricing
  GetProductCommercialPackPricing(packId: string, pricingId: string, productPackPricingFilter: ProductPackPricingFilter, requestID: string, AcquiringUserID: string, AcquiringProcessID?: string, countryID?: string, AcquiringPartnerID?: string, AcquiringBranchID?) {
    var URI = this.urlOutbound + "api/v1/product/pack/" + packId + "/pricing/" + pricingId;

    if (countryID === null)
      URI += "&countryId=" + countryID;

    var data = new Date();

    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Request-Id': requestID,
        'X-Acquiring-UserId': AcquiringUserID,
      }),
    }

    if (AcquiringPartnerID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-PartnerId", AcquiringPartnerID);
    if (AcquiringBranchID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-BranchId", AcquiringBranchID);
    if (AcquiringProcessID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-ProcessId", AcquiringProcessID);
    this.logger.debug(`[Outbound] URI used is ${URI}`);
    this.logger.debug(`[Outbound] Headers used are ${JSON.stringify({
      "Request-Id": HTTP_OPTIONS.headers.get('Request-Id'),
      "X-Acquiring-UserId": HTTP_OPTIONS.headers.get('X-Acquiring-UserId'),
      "X-Acquiring-PartnerId": HTTP_OPTIONS.headers.get("X-Acquiring-PartnerId"),
      "X-Acquiring-BranchId": HTTP_OPTIONS.headers.get("X-Acquiring-BranchId"),
      "X-Acquiring-ProcessId": HTTP_OPTIONS.headers.get("X-Acquiring-ProcessId"),
    }, null, 2)}`);

    return this.http.post<ProductPackPricing>(URI, productPackPricingFilter, HTTP_OPTIONS);
  }


  ListProductCommercialPackCommission(packId: string, productPackCommissionFilter: ProductPackCommissionFilter, requestID: string, AcquiringUserID: string, AcquiringProcessID?: string, countryID?: string, AcquiringPartnerID?: string, AcquiringBranchID?) {
    var URI = this.urlOutbound + "api/v1/product/pack/" + packId + "/commission";

    if (countryID === null)
      URI += "&countryId=" + countryID;

    var data = new Date();

    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Request-Id': requestID,
        'X-Acquiring-UserId': AcquiringUserID,
      }),
    }

    if (AcquiringPartnerID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-PartnerId", AcquiringPartnerID);
    if (AcquiringBranchID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-BranchId", AcquiringBranchID);
    if (AcquiringProcessID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-ProcessId", AcquiringProcessID);
    this.logger.debug(`[Outbound] URI used is ${URI}`);
    this.logger.debug(`[Outbound] Headers used are ${JSON.stringify({
      "Request-Id": HTTP_OPTIONS.headers.get('Request-Id'),
      "X-Acquiring-UserId": HTTP_OPTIONS.headers.get('X-Acquiring-UserId'),
      "X-Acquiring-PartnerId": HTTP_OPTIONS.headers.get("X-Acquiring-PartnerId"),
      "X-Acquiring-BranchId": HTTP_OPTIONS.headers.get("X-Acquiring-BranchId"),
      "X-Acquiring-ProcessId": HTTP_OPTIONS.headers.get("X-Acquiring-ProcessId"),
    }, null, 2)}`);

    return this.http.post<ProductPackCommissionEntry[]>(URI, productPackCommissionFilter, HTTP_OPTIONS);
  }

  GetProductCommercialPackCommission(packId: string, commissionId: string, productPackCommissionFilter: ProductPackCommissionFilter, requestID: string, AcquiringUserID: string, AcquiringProcessID?: string, countryID?: string, AcquiringPartnerID?: string, AcquiringBranchID?) {
    var URI = this.urlOutbound + "api/v1/product/pack/" + packId + "/commission/" + commissionId;

    if (countryID === null)
      URI += "&countryId=" + countryID;

    var data = new Date();

    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Request-Id': requestID,
        'X-Acquiring-UserId': AcquiringUserID,
      }),
    }

    if (AcquiringPartnerID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-PartnerId", AcquiringPartnerID);
    if (AcquiringBranchID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-BranchId", AcquiringBranchID);
    if (AcquiringProcessID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-ProcessId", AcquiringProcessID);
    this.logger.debug(`[Outbound] URI used is ${URI}`);
    this.logger.debug(`[Outbound] Headers used are ${JSON.stringify({
      "Request-Id": HTTP_OPTIONS.headers.get('Request-Id'),
      "X-Acquiring-UserId": HTTP_OPTIONS.headers.get('X-Acquiring-UserId'),
      "X-Acquiring-PartnerId": HTTP_OPTIONS.headers.get("X-Acquiring-PartnerId"),
      "X-Acquiring-BranchId": HTTP_OPTIONS.headers.get("X-Acquiring-BranchId"),
      "X-Acquiring-ProcessId": HTTP_OPTIONS.headers.get("X-Acquiring-ProcessId"),
    }, null, 2)}`);

    return this.http.post<ProductPackCommission>(URI, productPackCommissionFilter, HTTP_OPTIONS);
  }
}
