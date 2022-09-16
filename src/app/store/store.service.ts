import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Configuration, configurationToken } from '../configuration';
import { SimplifiedReference } from '../submission/ISubmission.interface';
import { TableInfoService } from '../table-info/table-info.service';
import { Product, Subproduct } from '../commercial-offer/ICommercialOffer.interface';



import { ShopActivities, ShopDetailsAcquiring, ShopDetailsOutbound, ShopEquipment, ShopsListOutbound } from './IStore.interface';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  private baseUrl: string;
  private urlOutbound: string;
  private mockacoUrl: string;
  private acquiringUrl: string;

  currentLanguage: string;

  languageStream$ = new BehaviorSubject<string>(''); //temos de estar à escuta para termos a currentLanguage

  constructor(private router: ActivatedRoute,
    private http: HttpClient, @Inject(configurationToken) private configuration: Configuration,
    private route: Router, private tableinfo: TableInfoService) {
    this.baseUrl = configuration.baseUrl;
    this.urlOutbound = configuration.outboundUrl;
    this.mockacoUrl = configuration.mockacoUrl;
    this.acquiringUrl = configuration.acquiringAPIUrl;

    this.languageStream$.subscribe((val) => {
      this.currentLanguage = val
    });
  }

  ////////////
  //OUTBOUND//
  ////////////

  getShopsListOutbound(merchantId: string, requestID: string, AcquiringUserID: string, AcquiringProcessID?: string, AcquiringPartnerID?: string, AcquiringBranchID?) {

    var URI = this.urlOutbound + "api/v1/merchant/" + merchantId + '/shop';

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

    return this.http.get<ShopsListOutbound[]>(URI, HTTP_OPTIONS);
  }

  getShopInfoOutbound(merchantId: string, shopId: string, requestID: string, AcquiringUserID: string, AcquiringProcessID?: string, AcquiringPartnerID?: string, AcquiringBranchID?) {

    var URI = this.urlOutbound + 'api/v1/merchant/' + merchantId + '/shop/' + shopId;

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

    return this.http.get<ShopDetailsOutbound>(URI, HTTP_OPTIONS);
  }


  /////////////
  //ACQUIRING//
  /////////////
  GetAllShopActivities(): any{
    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Accept-Language': this.currentLanguage,

      }),
    }
    return this.http.get<ShopActivities[]>(this.acquiringUrl + 'shop/activity', HTTP_OPTIONS);
  }

  GetAllShopProducts() {
    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Accept-Language': this.currentLanguage,

      }),
    }
    return this.http.get<Product[]>(this.acquiringUrl + 'product');
  }

  getProcessShopsList(processId: string) {
    return this.http.get<SimplifiedReference[]>(this.baseUrl + 'process/' + processId + '/shop');
  }

  getProcessShopDetails(processId: string, shopId: string) {
    return this.http.get<ShopDetailsAcquiring>(this.baseUrl + 'process/' + processId + '/shop/' + shopId);
  }

  getSubmissionShopsList(submissionId: string) {
    //tentar alterar o url para o do Mockaco
    return this.http.get<SimplifiedReference[]>(this.acquiringUrl + 'submission/' + submissionId + '/merchant/shop');
  }

  addShopToSubmission(submissionId: string, newShop: ShopDetailsAcquiring) {
    return this.http.post(this.baseUrl + 'submission/' + submissionId + '/merchant/shop', newShop);
  }

  getSubmissionShopDetails(submissionId: string, shopId: string) {
    //tentar alterar o url para o do Mockaco
    return this.http.get<ShopDetailsAcquiring>(this.baseUrl + 'submission/' + submissionId + '/merchant/shop/' + shopId);
  }

  updateSubmissionShop(submissionId: string, shopId: string, newShop: ShopDetailsAcquiring) {
    return this.http.put(this.baseUrl + 'submission/' + submissionId + '/merchant/shop/' + shopId, newShop);
  }

  deleteSubmissionShop(submissionId: string, shopId: string) {
    return this.http.delete(this.baseUrl + 'submission/' + submissionId + '/merchant/shop/' + shopId);
  }

  activitiesbycode(code: string): any {
    return this.http.get(this.mockacoUrl + 'v1/config/activities/' + code);
  }

  subzonesNearby(zipCode1: string, zipCode2: string): any {
    return this.http.get(this.mockacoUrl + 'v1/config/subzones/' + zipCode1 + '/' + zipCode2);
  }

  getShopEquipmentConfigurationsFromProcess(processId: string, shopId: string) {
    return this.http.get<ShopEquipment>(this.baseUrl + 'process/' + processId + '/merchant/shop/' + shopId + '/equipment');
  }

  getShopEquipmentConfigurationsFromSubmission(submissionId: string, shopId: string) {
    return this.http.get<ShopEquipment>(this.baseUrl + 'submission/' + submissionId + '/merchant/shop/' + shopId + '/equipment');
  }

  addShopEquipmentConfigurationsToSubmission(submissionId: string, shopId: string, newShopEquipment: ShopEquipment) {
    return this.http.post<SimplifiedReference>(this.baseUrl + 'submission/' + submissionId + '/merchant/shop/' + shopId + '/equipment', newShopEquipment);
  }

  updateShopEquipmentConfigurationsInSubmission(submissionId: string, shopId: string, newShopEquipment: ShopEquipment) {
    return this.http.put<SimplifiedReference>(this.baseUrl + 'submission/' + submissionId + '/merchant/shop/' + shopId + '/equipment', newShopEquipment);
  }



}
