import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../nav-menu-interna/data.service';
import { IStakeholders } from './IStakeholders.interface';

@Injectable({
  providedIn: 'root'
})
export class StakeholderService {

  constructor(private router: ActivatedRoute,
    private http: HttpClient, @Inject('ACQUIRING_URL')
    private baseUrl: string, private route: Router,
    private data: DataService, private fb: FormBuilder  ) { }

  GetAllStakeholdersFromSubmission(submissionId: string): any {
    return this.http.get<IStakeholders[]>(this.baseUrl + 'submission/' + submissionId + '/stakeholder');
  }

  GetStakeholderFromSubmission(submissionId: string, stakeholderId): any {
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
