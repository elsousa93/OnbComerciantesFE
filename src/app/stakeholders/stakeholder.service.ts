import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IStakeholders } from './IStakeholders.interface';

@Injectable({
  providedIn: 'root'
})
export class StakeholderService {

  constructor(private router: ActivatedRoute,
    private http: HttpClient, @Inject('BASE_URL')
    private baseUrl: string, private route: Router) { }

  GetAllStakeholdersFromSubmission(submissionId: string): any {
    return this.http.get<IStakeholders[]>(this.baseUrl + 'BEStakeholders/GetStakeholdersFromSubmission/' + submissionId);
  }

  GetStakeholderFromSubmission(submissionId: string, stakeholderId): any {
    return this.http.get<IStakeholders>(this.baseUrl + 'BEStakeholders/GetStakeholder/' + submissionId + '/' + stakeholderId);
  }

  CreateNewStakeholder(submissionId: string, newStake: IStakeholders) {
    return this.http.post<IStakeholders>(this.baseUrl + 'BEStakeholders/CreateNewStakeholder/' + submissionId, newStake);
  }

  UpdateStakeholder(submissionId: string, stakeholderId: string, newStake: IStakeholders) {
    return this.http.put<IStakeholders>(this.baseUrl + 'BEStakeholders/UpdateStakeholder/' + submissionId + '/' + stakeholderId, newStake);
  }

  DeleteStakeholder(submissionId: string, stakeholderId: string) {
    return this.http.delete(this.baseUrl + 'BEStakeholders/DeleteStakeholder/' + submissionId + '/' + stakeholderId);
  }
}
