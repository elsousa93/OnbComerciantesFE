import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { Configuration, configurationToken } from '../configuration';
import { Product, ProductPack, ProductPackCommission, ProductPackCommissionEntry, ProductPackCommissionFilter, ProductPackEntry, ProductPackFilter, ProductPackPricing, ProductPackPricingEntry, ProductPackPricingFilter } from './ICommercialOffer';

@Injectable({
  providedIn: 'root'
})
export class CommercialOfferService {

  public baseUrl: string;
  public urlOutbound: string;

  constructor(private logger: NGXLogger, private http: HttpClient, @Inject(configurationToken) private configuration: Configuration) {
    this.baseUrl = configuration.acquiringAPIUrl;
    this.urlOutbound = configuration.outboundUrl;
  }

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
