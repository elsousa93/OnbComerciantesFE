import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Configuration, configurationToken } from 'src/app/configuration';
import { AppConfigService } from '../../app-config.service';
import { AuthService } from '../../services/auth.service';
import { ISubmissionDocument, PostDocument, SimplifiedDocument } from './ISubmission-document';

@Injectable({
  providedIn: 'root'
})
export class SubmissionDocumentService {
  private baseUrl;
  private urlOutbound;

  constructor(private http: HttpClient, /*@Inject(configurationToken)*/ private configuration: AppConfigService, private authService: AuthService) {
    this.baseUrl = configuration.getConfig().acquiringAPIUrl;
    this.urlOutbound = configuration.getConfig().outboundUrl;
  }


  GetSubmissionDocuments(submissionID: string): any {
    return this.http.get<SimplifiedDocument[]>(this.baseUrl + 'submission/' + submissionID + '/document');
  }

  GetSubmissionDocumentById(submissionID: string, documentID: string): any {
    return this.http.get<ISubmissionDocument>(this.baseUrl + 'submission/' + submissionID + '/document/' + documentID);
  }

  GetDocumentImage(submissionID: string, documentID: string) {

    var URI = this.baseUrl + 'submission/' + submissionID + '/document/' + documentID + '/image';
    //return fetch(this.baseUrl + 'submission/' + submissionID + '/document/' + documentID + '/image', {
    //  method: "GET",
    //  headers: {
    //    "Accept": "application/pdf",
    //    "Content-type": "application/pdf",
    //    "Authorization": 'Bearer ' + this.authService.GetToken()
    //  }
    //});
    //return this.http.get<any>(this.baseUrl + 'submission/' + submissionID + '/document/' + documentID + '/image', {
    //  headers: {
    //    "Accept": "application/pdf",
    //    "Content-type": "application/pdf"
    //  }
    //}); //n sei qual o tipo

    //return this.http.get<any>(URI);
    return fetch(URI);
  }

  SubmissionPostDocument(submissionID: string, document: PostDocument): any {
    return this.http.post<PostDocument>(this.baseUrl + 'submission/' + submissionID + '/document/', document);
  }

  GetDocumentImageOutbound(documentReference: string, requestID: string, AcquiringUserID: string, format?: string, AcquiringPartnerID?: string, AcquiringBranchID?: string, AcquiringProcessID?: string): any {

    var URI = this.urlOutbound + "api/v1/document/" + documentReference + "/image";

    if (format != null && format != "")
      URI += "?format=" + format;

    var data = new Date();

    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'X-Request-Id': requestID,
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

  SubmissionPostDocumentToShop(submissionID: string, shopId: string, newDoc: PostDocument) {
    return this.http.post<SimplifiedDocument>(this.baseUrl + 'submission/' + submissionID + '/merchant/' + 'shop/' + shopId + '/document', newDoc);
  }

  DeleteDocumentFromSubmission(submissionID: string, docId: string) {
    return this.http.delete(this.baseUrl + 'submission/' + submissionID + '/document/' + docId);
  }
}
