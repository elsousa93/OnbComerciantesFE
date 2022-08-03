import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Configuration, configurationToken } from 'src/app/configuration';
import { ISubmissionDocument, PostDocument, SimplifiedDocument } from './ISubmission-document';

@Injectable({
  providedIn: 'root'
})
export class SubmissionDocumentService {
  private baseUrl;

  constructor(private http: HttpClient, @Inject(configurationToken) private configuration: Configuration) { 
    this.baseUrl = configuration.baseUrl;
  }


  GetSubmissionDocuments(submissionID: string): any {
    return this.http.get<SimplifiedDocument[]>(this.baseUrl + 'submission/' + submissionID + '/document');
  }

  GetSubmissionDocumentById(submissionID: string, documentID: string): any {
    return this.http.get<ISubmissionDocument>(this.baseUrl + 'submission/' + submissionID + '/document/' + documentID);
  }

  GetDocumentImage(submissionID: string, documentID: string): any {
    return this.http.get<any>(this.baseUrl + 'submission/' + submissionID + '/document/' + documentID + '/image', {
      headers: {
        "Accept": "application/pdf",
        "Content-type": "application/pdf"
      }
    }); //n sei qual o tipo
  }

  SubmissionPostDocument(submissionID: string, document: PostDocument): any {
    return this.http.post<PostDocument>(this.baseUrl + 'submission/' + submissionID + '/document/', document);
  }
}
