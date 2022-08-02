import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Configuration, configurationToken } from 'src/app/configuration';
import { SubmissionPostTemplate, SubmissionPostResponse, SubmissionPutTemplate, SubmissionGetTemplate, SubmissionGet } from '../ISubmission.interface'

@Injectable({
  providedIn: 'root'
})
export class SubmissionService {
  private baseUrl;

  constructor(private http: HttpClient, @Inject(configurationToken) private configuration: Configuration) {
    this.baseUrl = configuration.baseUrl;

  }

  GetSubmissionByID(submissionID: string): any {
    return this.http.get<SubmissionGetTemplate>(this.baseUrl + 'submission/' + submissionID);
  }

  InsertSubmission(submissionToInsert: SubmissionPostTemplate): any {
    return this.http.post<SubmissionPostResponse>(this.baseUrl + 'submission/', submissionToInsert);
  }

  EditSubmission(submissionID: string, submissionToEdit: SubmissionPutTemplate): any {
    return this.http.put<SubmissionPutTemplate>(this.baseUrl + 'submission/' + submissionID, submissionToEdit);
  }

  GetSubmissionByProcessNumber(processNumber: string): any {
    var treatedProcessNumber = encodeURIComponent(processNumber);
    return this.http.get<SubmissionGet[]>(this.baseUrl + 'submission?ProcessNumber=' + treatedProcessNumber);
  }
}
