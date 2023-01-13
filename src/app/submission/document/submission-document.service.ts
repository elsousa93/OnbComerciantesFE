import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService } from '../../app-config.service';
import { AuthService } from '../../services/auth.service';
import { ISubmissionDocument, PostDocument, SimplifiedDocument } from './ISubmission-document';

@Injectable({
  providedIn: 'root'
})
export class SubmissionDocumentService {
  private baseUrl;
  private urlOutbound;

  constructor(private http: HttpClient, private configuration: AppConfigService, private authService: AuthService) {
    this.baseUrl = configuration.getConfig().acquiringAPIUrl;
    this.urlOutbound = configuration.getConfig().outboundUrl;
  }


  GetSubmissionDocuments(submissionID: string): any {
    return this.http.get<SimplifiedDocument[]>(this.baseUrl + 'submission/' + submissionID + '/document');
  }

  GetSubmissionDocumentById(submissionID: string, documentID: string): any {
    return this.http.get<ISubmissionDocument>(this.baseUrl + 'submission/' + submissionID + '/document/' + documentID);
  }

  GetDocumentImage(submissionID: string, documentID: string): any {
    var URI = this.baseUrl + 'submission/' + submissionID + '/document/' + documentID + '/image';

    //return this.http.get<any>(URI);
    return fetch(URI, {
      headers: {
        Authorization: 'Bearer ' + this.authService.GetToken(),
        responseType: 'blob',
        observe: 'response',
        "Accept": "application/pdf",
        "Content-Type": "application/pdf"
      }
    });
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
