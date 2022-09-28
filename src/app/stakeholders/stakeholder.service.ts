import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Configuration, configurationToken } from '../configuration';
import { IStakeholders } from './IStakeholders.interface';
import { LoggerService } from 'src/app/logger.service';
import { HttpMethod } from '../enums/enum-data';
import { RequestResponse, TreatedResponse } from '../table-info/ITable-info.interface';
import { BehaviorSubject } from 'rxjs';
import { TableInfoService } from '../table-info/table-info.service';

@Injectable({
  providedIn: 'root'
})
export class StakeholderService {
  private baseUrl: string;
  private urlOutbound: string;

  currentLanguage: string;

  languageStream$ = new BehaviorSubject<string>(''); //temos de estar à escuta para termos a currentLanguage


  constructor(private logger: LoggerService, private http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private tableInfo: TableInfoService) {
    this.languageStream$.subscribe((val) => {
      this.currentLanguage = val
    });

    this.baseUrl = configuration.acquiringAPIUrl;      
    this.urlOutbound = configuration.outboundUrl;
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

  GetAllStakeholdersFromSubmission(submissionId: string): any {
    this.logger.info(`Getting all stakeholders for submission ${submissionId}`)
    //return this.http.get<IStakeholders[]>(this.baseUrl + 'submission/' + submissionId + '/stakeholder');
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
        console.log("erro que deu: ", error);
        response.result = null;
        response.msg = "Sem stakeholders";
        reject(response);
      })
    });
  }

  GetStakeholderFromSubmission(submissionId: string, stakeholderId: string): any {

    console.log("GET STAKEHOLDER FROM SUBMISSIO");
    console.log("submissionID: ", submissionId);
    console.log("stakeholderID: ", stakeholderId);

    this.logger.info(`Getting stakeholder ${stakeholderId} for submission ${submissionId}`)
    return this.http.get<IStakeholders>(this.baseUrl + 'submission/' + submissionId + '/stakeholder/' + stakeholderId);
  }

  //api / submisison/{id}/stakeholder/{sid}
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


  ///////////////////
  //Stakeholder OUTBOUND//
  ///////////////////

  SearchStakeholderByQuery(searchID: string, searchType: string, requestID: string, AcquiringUserID: string, AcquiringProcessID?: string, countryID?: string, AcquiringPartnerID?: string, AcquiringBranchID?): any {

    var URI = this.urlOutbound + "api/v1/stakeholder?searchId=" + searchID + "&searchType=" + searchType;

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
    this.logger.info(`[Outbound] Searching stakeholder with id ${searchID}`);
    this.logger.debug(`[Outbound] URI used is ${URI}`);
    this.logger.debug(`[Outbound] Headers used are ${JSON.stringify({
      "Request-Id": HTTP_OPTIONS.headers.get('Request-Id'),
      "X-Acquiring-UserId" : HTTP_OPTIONS.headers.get('X-Acquiring-UserId'),
      "X-Acquiring-PartnerId" : HTTP_OPTIONS.headers.get("X-Acquiring-PartnerId"),
      "X-Acquiring-BranchId" : HTTP_OPTIONS.headers.get("X-Acquiring-BranchId"),
      "X-Acquiring-ProcessId" : HTTP_OPTIONS.headers.get("X-Acquiring-ProcessId"),
    }, null, 2)}`);
    return this.http.get<any>(URI, HTTP_OPTIONS);
  }

  /////////////////////////////////////////////////////
  //getStakeholderByIDNew(stakeholderID : string) {
  //  var url = this.urlOutbound + "api/v1/stakeholder/" + stakeholderID;
  //  var response: TreatedResponse<any> = {};
  //  return new Promise<TreatedResponse<any>>((resolve, reject) => {
  //    var HTTP_OPTIONS = {
  //      headers: new HttpHeaders({
  //        'Accept-Language': this.currentLanguage,

  //      }),
  //    }
  //    this.tableInfo.callAPIOutboundNew(HttpMethod.GET, url, "pesquisa", "searchtype", "ola", "userID", this.currentLanguage).then(success => {
  //      response.result = success.result;
  //      response.msg = "Sucesso";
  //      resolve(response);
  //    }, error => {
  //      console.log("erro que deu: ", error);
  //      response.result = null;
  //      response.msg = "Sem stakeholders";
  //      reject(response);
  //    })
  //  })
  //}
  /////////////////////////////////////////////////////

  getStakeholderByID(StakeholderID: string, requestID: string, AcquiringUserID: string, AcquiringPartnerID?: string, AcquiringBranchID?: string, AcquiringProcessID?: string): any {

    var URI = this.urlOutbound + "api/v1/stakeholder/" + StakeholderID;

    var data = new Date();

    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Request-Id': requestID,
        'X-Acquiring-UserId': AcquiringUserID
      }),
    }

    if (AcquiringPartnerID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-PartnerId", AcquiringPartnerID);
    if (AcquiringBranchID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-BranchId", AcquiringBranchID);
    if (AcquiringProcessID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-ProcessId", AcquiringProcessID);

    this.logger.info(`[Outbound] Searching stakeholder with id ${StakeholderID}`);
    this.logger.debug(`[Outbound] URI used is ${URI}`);
    this.logger.debug(`[Outbound] Headers used are ${JSON.stringify({
      "Request-Id": HTTP_OPTIONS.headers.get('Request-Id'),
      "X-Acquiring-UserId" : HTTP_OPTIONS.headers.get('X-Acquiring-UserId'),
      "X-Acquiring-PartnerId" : HTTP_OPTIONS.headers.get("X-Acquiring-PartnerId"),
      "X-Acquiring-BranchId" : HTTP_OPTIONS.headers.get("X-Acquiring-BranchId"),
      "X-Acquiring-ProcessId" : HTTP_OPTIONS.headers.get("X-Acquiring-ProcessId"),
    }, null, 2)}`);


    return this.http.get<any>(URI, HTTP_OPTIONS);
  }
  updateStakeholder(stakeholder: IStakeholders, processReferenceID: string, StakeholderID: string, RequestID: string, AcquiringUserID: string, AcquiringProcessID?: string, AcquiringPartnerID?: string, AcquiringBranchID?: string): any {

    var treatedProcessNumber = encodeURIComponent(AcquiringProcessID);

    var URI = this.urlOutbound + "api/v1/process/" + processReferenceID + "/stakeholder/" + StakeholderID;

    var data = new Date();

    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Request-Id': RequestID,
        'X-Acquiring-UserId': AcquiringUserID
      }),
    }

    if (AcquiringPartnerID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-PartnerId", AcquiringPartnerID);
    if (AcquiringBranchID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-BranchId", AcquiringBranchID);
    if (AcquiringProcessID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-ProcessId", AcquiringProcessID);

    this.logger.info(`[Outbound] Updating stakeholder with id ${stakeholder}`);
    this.logger.debug(`[Outbound] URI used is ${URI}`);
    this.logger.debug(`[Outbound] Headers used are ${JSON.stringify({
      "Request-Id": HTTP_OPTIONS.headers.get('Request-Id'),
      "X-Acquiring-UserId" : HTTP_OPTIONS.headers.get('X-Acquiring-UserId'),
      "X-Acquiring-PartnerId" : HTTP_OPTIONS.headers.get("X-Acquiring-PartnerId"),
      "X-Acquiring-BranchId" : HTTP_OPTIONS.headers.get("X-Acquiring-BranchId"),
      "X-Acquiring-ProcessId" : HTTP_OPTIONS.headers.get("X-Acquiring-ProcessId"),
    }, null, 2)}`);

    return this.http.put<any>(URI, stakeholder, HTTP_OPTIONS);
  }



  ///////////////////////////////////
  //TESTAR ESTA CHAMADA SEM PROMISE//
  ///////////////////////////////////

  callAPIAcquiringTest(httpMethod: HttpMethod, httpURL: string, body?: any) {
    var requestResponse: RequestResponse = {};
    return new Promise<RequestResponse>((resolve, reject) => {
      this.http[httpMethod](httpURL, body).subscribe(result => {
        requestResponse.result = result;
        requestResponse.error = null;
        resolve(requestResponse);
      }, error => {
        console.log("error que deu: ", error);
        requestResponse.result = null;
        requestResponse.error = error;
        reject(requestResponse);
      });
    });
  }

  GetAllStakeholdersFromSubmissionTest(submissionId: string): any {
    this.logger.info(`Getting all stakeholders for submission ${submissionId}`)
    //return this.http.get<IStakeholders[]>(this.baseUrl + 'submission/' + submissionId + '/stakeholder');
    var url = this.baseUrl + 'submission/' + submissionId + '/stakeholder';

    return this.callAPIAcquiringTest(HttpMethod.GET, url);
  }

  GetStakeholderFromSubmissionTest(submissionId: string, stakeholderId: string): any {

    console.log("GET STAKEHOLDER FROM SUBMISSIO");
    console.log("submissionID: ", submissionId);
    console.log("stakeholderID: ", stakeholderId);

    this.logger.info(`Getting stakeholder ${stakeholderId} for submission ${submissionId}`)

    var url = this.baseUrl + 'submission/' + submissionId + '/stakeholder/' + stakeholderId;

    return this.callAPIAcquiringTest(HttpMethod.GET, url);
  }
}
