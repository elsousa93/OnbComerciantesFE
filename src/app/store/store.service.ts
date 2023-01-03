import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Configuration, configurationToken } from '../configuration';
import { SimplifiedReference } from '../submission/ISubmission.interface';
import { TableInfoService } from '../table-info/table-info.service';
import { Product, Subproduct } from '../commercial-offer/ICommercialOffer.interface';



import { ShopActivities, ShopDetailsAcquiring, ShopDetailsOutbound, ShopEquipment, ShopsListOutbound, ShopBankingInformation } from './IStore.interface';
import { BehaviorSubject } from 'rxjs';
import { APIRequestsService } from '../apirequests.service';
import { HttpMethod } from '../enums/enum-data';
import { AppConfigService } from '../app-config.service';
import { RequestResponse, TreatedResponse } from '../table-info/ITable-info.interface';

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  private baseUrl: string;
  private urlOutbound: string;

  currentLanguage: string;

  languageStream$ = new BehaviorSubject<string>(''); //temos de estar à escuta para termos a currentLanguage

  constructor(private router: ActivatedRoute,
    private http: HttpClient, /*@Inject(configurationToken)*/ private configuration: AppConfigService,
    private route: Router, private tableinfo: TableInfoService, private APIService: APIRequestsService) {
    this.baseUrl = configuration.getConfig().acquiringAPIUrl;
    this.urlOutbound = configuration.getConfig().outboundUrl;

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
        'X-Request-Id': requestID,
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

  getShopInfoOutbound(merchantId: string, shopId: string, requestID: string, AcquiringUserID: string, AcquiringProcessID?: string, AcquiringPartnerID?: string, AcquiringBranchID?){

    var URI = this.urlOutbound + 'api/v1/merchant/' + merchantId + '/shop/' + shopId;

    return this.APIService.callAPIOutbound(HttpMethod.GET, URI, "searchId", "searchType", "requestId", "acquiringUserId");
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
    return this.http.get<ShopActivities[]>(this.baseUrl + 'shop/activity', HTTP_OPTIONS);
  }

  GetAllShopProducts() {
    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Accept-Language': this.currentLanguage,

      }),
    }
    return this.http.get<Product[]>(this.baseUrl + 'product', HTTP_OPTIONS);
  }

  getProcessShopsList(processId: string) {
    return this.http.get<SimplifiedReference[]>(this.baseUrl + 'process/' + processId + '/merchant/shop');
  }

  getProcessShopDetails(processId: string, shopId: string) {
    return this.http.get<ShopDetailsAcquiring>(this.baseUrl + 'process/' + processId + '/merchant/' + 'shop/' + shopId);
  }

  getSubmissionShopsList(submissionId: string) {
    //tentar alterar o url para o do Mockaco
    //return this.http.get<SimplifiedReference[]>(this.acquiringUrl + 'submission/' + submissionId + '/merchant/shop');
    var url = this.baseUrl + 'submission/' + submissionId + '/merchant/shop';


    return this.APIService.callAPIAcquiring(HttpMethod.GET, url);

  }

  addShopToSubmission(submissionId: string, newShop: ShopDetailsAcquiring) {
    return this.http.post(this.baseUrl + 'submission/' + submissionId + '/merchant/shop', newShop);
  }

  getSubmissionShopDetails(submissionId: string, shopId: string) {
    var url = this.baseUrl + 'submission/' + submissionId + '/merchant/shop/' + shopId;

    return this.APIService.callAPIAcquiring(HttpMethod.GET, url);
  }

  updateSubmissionShop(submissionId: string, shopId: string, newShop: ShopDetailsAcquiring) {
    return this.http.put(this.baseUrl + 'submission/' + submissionId + '/merchant/shop/' + shopId, newShop);
  }

  deleteSubmissionShop(submissionId: string, shopId: string) {
    return this.http.delete(this.baseUrl + 'submission/' + submissionId + '/merchant/shop/' + shopId);
  }

  activitiesbycode(code: string): any {
    return this.http.get(this.baseUrl + 'v1/config/activities/' + code);
  }

  subzonesNearby(zipCode: string): any {
    return this.http.get(this.baseUrl + 'address/' + zipCode + '/shoppingcenter');
  }

  getShopEquipmentConfigurationsFromProcess(processId: string, shopId: string) {
    return this.http.get<ShopEquipment>(this.baseUrl + 'process/' + processId + '/merchant/shop/' + shopId + '/equipment');
  }

  getShopEquipmentConfigurationsFromSubmission(submissionId: string, shopId: string) {
    var url = this.baseUrl + 'submission/' + submissionId + '/merchant/shop/' + shopId + '/equipment';
    return this.APIService.callAPIAcquiring(HttpMethod.GET, url);
  }

  getShopEquipmentFromSubmission(submissionId: string, shopId: string, equipId: string) {
    var url = this.baseUrl + 'submission/' + submissionId + '/merchant/shop/' + shopId + '/equipment/' + equipId;
    return this.APIService.callAPIAcquiring(HttpMethod.GET, url);
  }

  addShopEquipmentConfigurationsToSubmission(submissionId: string, shopId: string, newShopEquipment: ShopEquipment) {
    return this.http.post<SimplifiedReference>(this.baseUrl + 'submission/' + submissionId + '/merchant/shop/' + shopId + '/equipment', newShopEquipment);
  }

  updateShopEquipmentConfigurationsInSubmission(submissionId: string, shopId: string, equipId: string, newShopEquipment: ShopEquipment) {
    return this.http.put<SimplifiedReference>(this.baseUrl + 'submission/' + submissionId + '/merchant/shop/' + shopId + '/equipment/' + equipId, newShopEquipment);
  }

  addDocumentToShop(submissionId: string, shopId: string, ) {

  }

}
