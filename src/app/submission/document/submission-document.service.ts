import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ISubmissionDocument, PostDocument, SimplifiedDocument } from './isubmission-document';

@Injectable({
  providedIn: 'root'
})
export class SubmissionDocumentService {

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }


  GetSubmissionDocuments(submissionID: string): any {
    return this.http.get<SimplifiedDocument[]>(this.baseUrl + 'submission/' + submissionID + '/document');
  }

  GetSubmissionDocumentById(submissionID: string, documentID: string): any {
    return this.http.get<ISubmissionDocument>(this.baseUrl + 'submission/' + submissionID + '/document/' + documentID);
  }

  GetDocumentImage(submissionID: string, documentID: string): any {
    return this.http.get(this.baseUrl + 'submission/' + submissionID + '/document/' + documentID + '/image'); //n sei qual o tipo
  }

  SubmissionPostDocument(submissionID: string, document: PostDocument): any {
    return this.http.post<PostDocument>(this.baseUrl + 'submission/' + submissionID + '/document/', document);
  }
}
