import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SubmissionPostTemplate, SubmissionPostResponse, SubmissionPutTemplate, SubmissionGetTemplate } from '../ISubmission.interface'

@Injectable({
  providedIn: 'root'
})
export class SubmissionService {

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }

  GetSubmissionByID(submissionID: string): any {
    return this.http.get<SubmissionGetTemplate>(this.baseUrl + 'submission/' + submissionID);
  }

  InsertSubmission(submissionToInsert: SubmissionPostTemplate): any {
    return this.http.post<SubmissionPostResponse>(this.baseUrl + 'submission/', submissionToInsert);
  }

  EditSubmission(submissionID: string, submissionToEdit: SubmissionPutTemplate): any {
    return this.http.put<any>(this.baseUrl + 'submission/' + submissionID, submissionToEdit);
  }
}
