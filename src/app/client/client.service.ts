import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Client } from './Client.interface';
import { LoggerService } from 'src/app/logger.service';
import { APIRequestsService } from '../apirequests.service';
import { HttpMethod } from '../enums/enum-data';
import { AppConfigService } from '../app-config.service';
import { PostDocument } from '../submission/document/ISubmission-document';
import { AuthService } from '../services/auth.service';
import { ProcessNumberService } from '../nav-menu-presencial/process-number.service';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private baseUrl: string;
  private urlOutbound: string;

  constructor(private logger: LoggerService,
    private http: HttpClient, private configuration: AppConfigService, private API: APIRequestsService, private authService: AuthService, private processNrService: ProcessNumberService) {
    this.baseUrl = configuration.getConfig().acquiringAPIUrl;
    this.urlOutbound = configuration.getConfig().outboundUrl;
  }

  EditClient(submissionID: string, newClient: Client) {
    this.logger.info(`Editing client for submission ${submissionID}`)
    this.logger.debug(JSON.stringify(newClient)); //Usar em vez de console log
    return this.http.put<Client>(this.baseUrl + 'submission/' + submissionID + "/merchant", newClient);
  }

  ///////////////////
  //CLIENT OUTBOUND//
  ///////////////////

  SearchClientByQuery(searchID: string, searchType: string, requestID: string, AcquiringUserID: string, AcquiringProcessID?: string, countryID?: string, AcquiringPartnerID?: string, AcquiringBranchID?): any {

    var URI = this.urlOutbound + "api/v1/merchant?searchId=" + searchID + "&searchType=" + searchType;

    if (countryID === null)
      URI += "&countryId=" + countryID;

    requestID = window.crypto['randomUUID']();
    AcquiringUserID = this.authService.GetCurrentUser().userName;
    AcquiringPartnerID = this.authService.GetCurrentUser().bankName;
    AcquiringBranchID = this.authService.GetCurrentUser().bankLocation;
    this.processNrService.processNumber.subscribe(processNumber => AcquiringProcessID = processNumber);

    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'X-Acquiring-Tenant': "0800",
        'X-Request-Id': requestID,
        'X-Acquiring-UserId': AcquiringUserID,
        'X-Date': new Date().toUTCString(),
        'X-Acquiring-PartnerId': AcquiringPartnerID,
        'X-Acquiring-BranchId': AcquiringBranchID
      }),
    }
    if (AcquiringProcessID != "" && AcquiringProcessID != null)
      HTTP_OPTIONS.headers = HTTP_OPTIONS.headers.append("X-Acquiring-ProcessId", AcquiringProcessID);
    //if (AcquiringPartnerID !== null)
    //  HTTP_OPTIONS.headers.append("X-Acquiring-PartnerId", AcquiringPartnerID);
    //if (AcquiringBranchID !== null)
    //  HTTP_OPTIONS.headers.append("X-Acquiring-BranchId", AcquiringBranchID);
    //if (AcquiringProcessID !== null)
    //  HTTP_OPTIONS.headers.append("X-Acquiring-ProcessId", AcquiringProcessID);

    return this.http.get<any>(URI, HTTP_OPTIONS);
  }

  getClientByID(clientID: string, requestID: string, AcquiringUserID: string, AcquiringPartnerID?: string, AcquiringBranchID?: string, AcquiringProcessID?: string) {
    var URI = this.urlOutbound + "api/v1/merchant/" + clientID;

    return this.API.callAPIOutbound(HttpMethod.GET, URI, "por mudar", "por mudar", requestID, AcquiringUserID);
  }

  merchantPostDocument(submissionID: string, document: PostDocument) {
    return this.http.post<PostDocument>(this.baseUrl + 'submission/' + submissionID + '/merchant' + '/document/', document);
  }

  /////////////////////
  /// A ALTERAR    ///
  ////////////////////

  getClientByIdCall(clientID: string) {
    var url = this.urlOutbound + "api/v1/merchant/" + clientID;

    return this.API.callAPIOutbound(HttpMethod.GET, url, "por mudar", "por mudar", "por mudar", "por mudar");
  }

  getAcquiringClientByIdCall(submissionId: string) {
    var url = this.baseUrl + "submission/" + submissionId + "/merchant";

    return this.API.callAPIAcquiring(HttpMethod.GET, url);
  }

  GetClientByIdOutbound(clientID: string) {
    return new Promise<any>((resolve, reject) => {
      this.getClientByIdCall(clientID).then(res => {
        var client = res.result
        resolve(client);
      }, error => {
        reject(null);
      });
    });
  }

  GetClientByIdAcquiring(submissionId: string) {
    return new Promise<any>((resolve, reject) => {
      this.getAcquiringClientByIdCall(submissionId).then(res => {
        var client = res.result;
        resolve(client);
      }, error => {
        reject(null);
      });
    });
  }
}
