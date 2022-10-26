import { getLocaleDateTimeFormat } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Configuration, configurationToken } from '../configuration';
import { Client } from './Client.interface';
import { LoggerService } from 'src/app/logger.service';
import { APIRequestsService } from '../apirequests.service';
import { HttpMethod } from '../enums/enum-data';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private baseUrl: string;
  private urlOutbound: string;

  constructor(private logger : LoggerService, private router: ActivatedRoute,
    private http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private route: Router, private API: APIRequestsService) {
      this.baseUrl = configuration.baseUrl;
      this.urlOutbound = configuration.outboundUrl;

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

    //this.logger.info(`[Outbound] Searching client with id ${searchID}`);
    //this.logger.debug(`[Outbound] URI used is ${URI}`);
    //this.logger.debug(`[Outbound] Headers used are ${JSON.stringify({
    //  "Request-Id": HTTP_OPTIONS.headers.get('Request-Id'),
    //  "X-Acquiring-UserId" : HTTP_OPTIONS.headers.get('X-Acquiring-UserId'),
    //  "X-Acquiring-PartnerId" : HTTP_OPTIONS.headers.get("X-Acquiring-PartnerId"),
    //  "X-Acquiring-BranchId" : HTTP_OPTIONS.headers.get("X-Acquiring-BranchId"),
    //  "X-Acquiring-ProcessId" : HTTP_OPTIONS.headers.get("X-Acquiring-ProcessId"),
    //}, null, 2)}`);

    return this.http.get<any>(URI, HTTP_OPTIONS);
  }

  getClientByID(clientID: string, requestID: string, AcquiringUserID:string, AcquiringPartnerID?: string, AcquiringBranchID?: string, AcquiringProcessID?: string): any {
    var URI = this.urlOutbound + "api/v1/merchant/" + clientID;

    var data = new Date();
    //'Request-Date': data.toISOString(),
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


    return this.http.get<any>(URI, HTTP_OPTIONS);
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
