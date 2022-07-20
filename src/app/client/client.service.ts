import { getLocaleDateTimeFormat } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Client } from './Client.interface';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  urlOutbound: string = "http://localhost:12000/OutboundAPI/";

  constructor(private router: ActivatedRoute,
    private http: HttpClient, @Inject('BASE_URL')
    private baseUrl: string, private route: Router) { }

  GetClientById(clientID: string): any {
    return this.http.get<Client>(this.baseUrl + 'submission/' + clientID + "/merchant");
  }

  EditClient(clientID: string, newClient: Client) {
    return this.http.put<Client>(this.baseUrl + 'submission/' + clientID + "/merchant", newClient);
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
        'Content-Type': 'multipart/form-data',
        'Request-Id': requestID,
        'Date': data.toISOString(),
        'X-Acquiring-UserId': AcquiringUserID,
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

  getClientByID(clientID: string, requestID: string, AcquiringUserID:string, AcquiringPartnerID?: string, AcquiringBranchID?: string, AcquiringProcessID?: string): any {
    console.log("ygijkldsuishdushdshd uhsudhsud hsudhhusd");
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

  createClient(client: Client, processReferenceID: string, requestID: string, AcquiringUserID: string, AcquiringProcessID?: string, AcquiringPartnerID?: string, AcquiringBranchID?: string): any {

    var URI = this.urlOutbound + "api/v1/process/" + processReferenceID + "/merchant";

    var data = new Date();

    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Content-Type': 'multipart/form-data',
        'Request-Id': requestID,
        'Date': data.toISOString(),
        'X-Acquiring-UserId': AcquiringUserID
      }),
    }

    if (AcquiringPartnerID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-PartnerId", AcquiringPartnerID);
    if (AcquiringBranchID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-BranchId", AcquiringBranchID);
    if (AcquiringProcessID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-ProcessId", AcquiringProcessID);

    return this.http.post<any>(URI, client, HTTP_OPTIONS);
  }

  updateClient(client: Client, processReferenceID: string, clientID: string, RequestID: string, AcquiringUserID: string, AcquiringProcessID?: string, AcquiringPartnerID?: string, AcquiringBranchID?: string): any {

    var treatedProcessNumber = encodeURIComponent(AcquiringProcessID);

    var URI = this.urlOutbound + "api/v1/process/" + processReferenceID + "/merchant/" + clientID;

    var data = new Date();

    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Content-Type': 'multipart/form-data',
        'Request-Id': RequestID,
        'Date': data.toISOString(),
        'X-Acquiring-UserId': AcquiringUserID
      }),
    }

    if (AcquiringPartnerID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-PartnerId", AcquiringPartnerID);
    if (AcquiringBranchID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-BranchId", AcquiringBranchID);
    if (AcquiringProcessID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-ProcessId", AcquiringProcessID);

    return this.http.put<any>(URI, client, HTTP_OPTIONS);
  }
}
