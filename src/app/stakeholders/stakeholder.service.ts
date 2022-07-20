import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { IStakeholders } from './IStakeholders.interface';

@Injectable({
  providedIn: 'root'
})
export class StakeholderService {

  urlOutbound: string = "http://localhost:12000/OutboundAPI/";

  constructor(private http: HttpClient, @Inject('ACQUIRING_URL')
    private baseUrl: string) { }

  GetAllStakeholdersFromSubmission(submissionId: string): any {
    return this.http.get<IStakeholders[]>(this.baseUrl + 'submission/' + submissionId + '/stakeholder');
  }

  GetStakeholderFromSubmission(submissionId: string, stakeholderId: string): any {
    return this.http.get<IStakeholders>(this.baseUrl + 'submission/' + submissionId + '/stakeholder/' + stakeholderId);
  }

  //api / submisison/{id}/stakeholder/{sid}
  CreateNewStakeholder(submissionId: string, newStake: IStakeholders) {
    return this.http.post<IStakeholders>(this.baseUrl + 'submission/' + submissionId + '/stakeholder', newStake);
  }

  UpdateStakeholder(submissionId: string, stakeholderId: string, newStake: IStakeholders) {
    return this.http.put<IStakeholders>(this.baseUrl + 'submission/' + submissionId + '/stakeholder/' + stakeholderId, newStake);
  }

  DeleteStakeholder(submissionId: string, stakeholderId: string) {
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

  getStakeholderByID(StakeholderID: string, requestID: string, AcquiringUserID: string, AcquiringPartnerID?: string, AcquiringBranchID?: string, AcquiringProcessID?: string): any {

    var URI = this.urlOutbound + "api/v1/stakeholder/" + StakeholderID;

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

    return this.http.get<any>(URI, HTTP_OPTIONS);
  }

  createStakeholder(Stakeholder: IStakeholders, processReferenceID: string, requestID: string, AcquiringUserID: string, AcquiringProcessID?: string, AcquiringPartnerID?: string, AcquiringBranchID?: string): any {

    var URI = this.urlOutbound + "api/v1/process/" + processReferenceID + "/stakeholder";

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

    return this.http.post<any>(URI, Stakeholder, HTTP_OPTIONS);
  }

  updateStakeholder(stakeholder: IStakeholders, processReferenceID: string, StakeholderID: string, RequestID: string, AcquiringUserID: string, AcquiringProcessID?: string, AcquiringPartnerID?: string, AcquiringBranchID?: string): any {

    var treatedProcessNumber = encodeURIComponent(AcquiringProcessID);

    var URI = this.urlOutbound + "api/v1/process/" + processReferenceID + "/stakeholder/" + StakeholderID;

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

    return this.http.put<any>(URI, stakeholder, HTTP_OPTIONS);
  }
}

//OLD VERSION


//GetAllStakeholdersFromSubmission(submissionId: string): any {
//  return this.http.get<IStakeholders[]>(this.baseUrl + 'BEStakeholders/GetStakeholdersFromSubmission/' + submissionId);
//}

//GetStakeholderFromSubmission(submissionId: string, stakeholderId): any {
//  return this.http.get<IStakeholders>(this.baseUrl + 'BEStakeholders/GetStakeholder/' + submissionId + '/' + stakeholderId);
//}

//CreateNewStakeholder(submissionId: string, newStake: IStakeholders) {
//  return this.http.post<IStakeholders>(this.baseUrl + 'BEStakeholders/CreateNewStakeholder/' + submissionId, newStake);
//}

//UpdateStakeholder(submissionId: string, stakeholderId: string, newStake: IStakeholders) {
//  return this.http.put<IStakeholders>(this.baseUrl + 'BEStakeholders/UpdateStakeholder/' + submissionId + '/' + stakeholderId, newStake);
//}

//DeleteStakeholder(submissionId: string, stakeholderId: string) {
//  return this.http.delete(this.baseUrl + 'BEStakeholders/DeleteStakeholder/' + submissionId + '/' + stakeholderId);
//}
