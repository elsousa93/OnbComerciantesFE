import { getLocaleDateTimeFormat } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Client } from './Client.interface';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  urlOutbound: string = "Mockaco/";

  constructor(private router: ActivatedRoute,
    private http: HttpClient, @Inject('BASE_URL')
    private baseUrl: string, private route: Router) { }

  GetClientById(clientID: string): any {
    return this.http.get<Client>(this.baseUrl + 'submission/' + clientID + "/merchant");
  }

  EditClient(clientID: string, newClient: Client) {
    return this.http.put<Client>(this.baseUrl + 'submission/' + clientID + "/merchant", newClient);
  }

  SearchClientByQuery(searchID: string, searchType: string, messageID: string, userID: string, processID: string, countryID?: string, partnerID?: string, branchID?): any {

    var URI = this.urlOutbound + "v1/merchant?searchId=" + searchID + "&searchType=" + searchType;

    if (countryID === null)
      URI += "&countryId=" + countryID;

    var data = new Date();

    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Content-Type': 'multipart/form-data',
        'Message-Id': messageID,
        'Date': data.toISOString(),
        'X-Acquiring-UserId': userID,
        'X-Acquiring-ProcessId': processID
      }),
    }

    if (partnerID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-PartnerId", partnerID);
    if (branchID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-BranchId", branchID);

    return this.http.get<any>(URI, HTTP_OPTIONS);
  }

  getClientByID(clientID: string, messageID: string, AcquiringUserID: string, AcquiringProcessID:string, AcquiringPartnerID?: string, AcquiringBranchID?: string): any {

    var URI = this.urlOutbound + "v1/merchant/" + clientID;

    var data = new Date();

    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Content-Type': 'multipart/form-data',
        'Message-Id': messageID,
        'Date': data.toISOString(),
        'X-Acquiring-UserId': AcquiringUserID,
        'X-Acquiring-ProcessId': AcquiringProcessID
      }),
    }

    if (AcquiringPartnerID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-PartnerId", AcquiringPartnerID);
    if (AcquiringBranchID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-BranchId", AcquiringBranchID);

    return this.http.get<any>(URI, HTTP_OPTIONS);
  }

  createClient(client: Client, processReferenceID: string, messageID: string, AcquiringUserID: string, AcquiringProcessID: string, AcquiringPartnerID?: string, AcquiringBranchID?: string): any {

    var URI = this.urlOutbound + "v1/process/" + processReferenceID + "/merchant";

    var data = new Date();

    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Content-Type': 'multipart/form-data',
        'Message-Id': messageID,
        'Date': data.toISOString(),
        'X-Acquiring-UserId': AcquiringUserID,
        'X-Acquiring-ProcessId': AcquiringProcessID
      }),
    }

    if (AcquiringPartnerID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-PartnerId", AcquiringPartnerID);
    if (AcquiringBranchID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-BranchId", AcquiringBranchID);

    return this.http.post<any>(URI, client, HTTP_OPTIONS);
  }

  updateClient(client: Client, processReferenceID: string, clientID: string, messageID: string, AcquiringUserID: string, AcquiringProcessID: string, AcquiringPartnerID?: string, AcquiringBranchID?: string): any {

    var treatedProcessNumber = encodeURIComponent(AcquiringProcessID);

    var URI = this.urlOutbound + "v1/process/" + processReferenceID + "/merchant/" + clientID;

    var data = new Date();

    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Content-Type': 'multipart/form-data',
        'Message-Id': messageID,
        'Date': data.toISOString(),
        'X-Acquiring-UserId': AcquiringUserID,
        'X-Acquiring-ProcessId': treatedProcessNumber
      }),
    }

    if (AcquiringPartnerID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-PartnerId", AcquiringPartnerID);
    if (AcquiringBranchID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-BranchId", AcquiringBranchID);

    return this.http.put<any>(URI, client, HTTP_OPTIONS);
  }
}
