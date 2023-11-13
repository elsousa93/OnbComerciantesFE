import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IStakeholders, PostCorporateEntity, PostPrivateEntity } from './IStakeholders.interface';
import { LoggerService } from 'src/app/logger.service';
import { HttpMethod } from '../enums/enum-data';
import { RequestResponse, TreatedResponse } from '../table-info/ITable-info.interface';
import { BehaviorSubject } from 'rxjs';
import { TableInfoService } from '../table-info/table-info.service';
import { APIRequestsService } from '../apirequests.service';
import { QueuesService } from '../queues-detail/queues.service';
import { AppConfigService } from '../app-config.service';
import { PostDocument } from '../submission/document/ISubmission-document';

@Injectable({
  providedIn: 'root'
})
export class StakeholderService {
  private baseUrl: string;
  private urlOutbound: string;

  currentLanguage: string;
  languageStream$ = new BehaviorSubject<string>(''); //temos de estar à escuta para termos a currentLanguage

  constructor(private logger: LoggerService, private http: HttpClient, /*@Inject(configurationToken)*/ private configuration: AppConfigService, private tableInfo: TableInfoService, private APIService: APIRequestsService, private queuesInfo: QueuesService) {
    this.languageStream$.subscribe((val) => {
      this.currentLanguage = val
    });
    this.baseUrl = configuration.getConfig().acquiringAPIUrl;      
    this.urlOutbound = configuration.getConfig().outboundUrl;
  }

  callAPIAcquiring(httpMethod: HttpMethod, httpURL: string, body?: any) {
    var requestResponse: RequestResponse = {};

    return new Promise<RequestResponse>((resolve, reject) => {
      this.http[httpMethod](httpURL, body).subscribe({
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

  GetAllStakeholdersFromSubmission(submissionId: string): any {
    this.logger.info(`Getting all stakeholders for submission ${submissionId}`)
    var url = this.baseUrl + 'submission/' + submissionId + '/stakeholder';
    var response: TreatedResponse<IStakeholders[]> = {};

    return new Promise<TreatedResponse<IStakeholders[]>>((resolve, reject) => {
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
        response.msg = "Sem stakeholders";
        reject(response);
      })
    });
  }

  GetStakeholderFromSubmission(submissionId: string, stakeholderId: string): any {
    this.logger.info(`Getting stakeholder ${stakeholderId} for submission ${submissionId}`)
    var url = this.baseUrl + 'submission/' + submissionId + '/stakeholder/' + stakeholderId;

    return this.callAPIAcquiring(HttpMethod.GET, url);
  }

  CreateNewStakeholder(submissionId: string, newStake: IStakeholders) {
    this.logger.info(`Creating new stakeholder for submission ${submissionId}`)
    this.logger.info(JSON.stringify(newStake));
    return this.http.post<IStakeholders>(this.baseUrl + 'submission/' + submissionId + '/stakeholder', newStake);
  }

  UpdateStakeholder(submissionId: string, stakeholderId: string, newStake: IStakeholders) {
    this.logger.info(`Updating stakeholder ${stakeholderId} for submission ${submissionId}`)
    this.logger.info(JSON.stringify(newStake));
    return this.http.put<IStakeholders>(this.baseUrl + 'submission/' + submissionId + '/stakeholder/' + stakeholderId, newStake);
  }

  DeleteStakeholder(submissionId: string, stakeholderId: string) {
    this.logger.info(`Deleting stakeholder ${stakeholderId} for submission ${submissionId}`)
    return this.http.delete(this.baseUrl + 'submission/' + submissionId + '/stakeholder/' + stakeholderId);
  }

  AddNewDocumentStakeholder(submissionId: string, stakeholderId: string, document: PostDocument) {
    return this.http.post(this.baseUrl + 'submission/' + submissionId + '/stakeholder/' + stakeholderId + '/document', document);
  }

  AddNewDocumentToProcessPrivateEntity(processId: string, privateId: string, document: PostDocument) {
    var URL = this.baseUrl + "process/" + processId + "/private-entity/" + privateId + "/document";
    return this.callAPIAcquiring(HttpMethod.POST, URL, document);
  }

  AddNewDocumentToProcessCorporateEntity(processId: string, corporateId: string, document: PostDocument) {
    var URL = this.baseUrl + "process/" + processId + "/corporate-entity/" + corporateId + "/document";
    return this.callAPIAcquiring(HttpMethod.POST, URL, document);
  }

  GetCorporateEntityList(submissionId: string) {
    var URL = this.baseUrl + "submission/" + submissionId + "/corporate-entity";
    return this.callAPIAcquiring(HttpMethod.GET, URL);
  }

  GetCorporateEntityById(submissionId: string, corporateId: string) {
    var URL = this.baseUrl + "submission/" + submissionId + "/corporate-entity/" + corporateId;
    return this.callAPIAcquiring(HttpMethod.GET, URL);
  }

  AddNewCorporateEntity(submissionId: string, corporateEntity: PostCorporateEntity) {
    var URL = this.baseUrl + "submission/" + submissionId + "/corporate-entity";
    return this.callAPIAcquiring(HttpMethod.POST, URL, corporateEntity);
  }

  UpdateCorporateEntity(submissionId: string, corporateId: string, corporateEntity: PostCorporateEntity) {
    var URL = this.baseUrl + "submission/" + submissionId + "/corporate-entity/" + corporateId;
    return this.callAPIAcquiring(HttpMethod.PUT, URL, corporateEntity);
  }

  DeleteCorporateEntity(submissionId: string, corporateId: string) {
    var URL = this.baseUrl + "submission/" + submissionId + "/corporate-entity/" + corporateId;
    return this.callAPIAcquiring(HttpMethod.DELETE, URL);
  }

  GetPrivateEntityList(submissionId: string) {
    var URL = this.baseUrl + "submission/" + submissionId + "/private-entity";
    return this.callAPIAcquiring(HttpMethod.GET, URL);
  }

  GetPrivateEntityById(submissionId: string, privateId: string) {
    var URL = this.baseUrl + "submission/" + submissionId + "/private-entity/" + privateId;
    return this.callAPIAcquiring(HttpMethod.GET, URL);
  }

  AddNewPrivateEntity(submissionId: string, privateEntity: PostPrivateEntity) {
    var URL = this.baseUrl + "submission/" + submissionId + "/private-entity";
    return this.callAPIAcquiring(HttpMethod.POST, URL, privateEntity);
  }

  UpdatePrivateEntity(submissionId: string, corporateId: string, privateEntity: PostPrivateEntity) {
    var URL = this.baseUrl + "submission/" + submissionId + "/private-entity/" + corporateId;
    return this.callAPIAcquiring(HttpMethod.PUT, URL, privateEntity);
  }

  UpdateProcessPrivateEntity(processId: string, corporateId: string, privateEntity: PostPrivateEntity) {
    var URL = this.baseUrl + "process/" + processId + "/private-entity/" + corporateId;
    return this.callAPIAcquiring(HttpMethod.PUT, URL, privateEntity);
  }

  DeletePrivateEntity(submissionId: string, privateId: string) {
    var URL = this.baseUrl + "submission/" + submissionId + "/private-entity/" + privateId;
    return this.callAPIAcquiring(HttpMethod.DELETE, URL);
  }

  ///////////////////
  //Stakeholder OUTBOUND//
  ///////////////////

  SearchStakeholderByQuery(searchID: string, searchType: string, requestID: string, AcquiringUserID: string, AcquiringProcessID?: string, countryID?: string, AcquiringPartnerID?: string, AcquiringBranchID?): any {
    var id = encodeURIComponent(searchID);
    var url = this.urlOutbound + "api/v1/stakeholder?searchId=" + id + "&searchType=" + searchType;

    if (countryID === null)
      url += "&countryId=" + countryID;

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
    this.logger.info(`[Outbound] Searching stakeholder with id ${searchID}`);
    this.logger.debug(`[Outbound] URI used is ${url}`);
    this.logger.debug(`[Outbound] Headers used are ${JSON.stringify({
      "Request-Id": HTTP_OPTIONS.headers.get('Request-Id'),
      "X-Acquiring-UserId" : HTTP_OPTIONS.headers.get('X-Acquiring-UserId'),
      "X-Acquiring-PartnerId" : HTTP_OPTIONS.headers.get("X-Acquiring-PartnerId"),
      "X-Acquiring-BranchId" : HTTP_OPTIONS.headers.get("X-Acquiring-BranchId"),
      "X-Acquiring-ProcessId" : HTTP_OPTIONS.headers.get("X-Acquiring-ProcessId"),
    }, null, 2)}`);

    return this.APIService.callAPIOutbound(HttpMethod.GET, url, "searchId", "searchType", "requestID", "AcquiringUserID");
  }

  getStakeholderByID(StakeholderID: string, requestID: string, AcquiringUserID: string, AcquiringPartnerID?: string, AcquiringBranchID?: string, AcquiringProcessID?: string): any {
    var id = encodeURIComponent(StakeholderID);
    var url = this.urlOutbound + "api/v1/stakeholder/" + id;

    return this.APIService.callAPIOutbound(HttpMethod.GET, url, "searchId", "searchType", "requestID", "AcquiringUserID");
  }
}
