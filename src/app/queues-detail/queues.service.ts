import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Configuration, configurationToken } from '../configuration';
import { TableInfoService } from '../table-info/table-info.service';
import { BehaviorSubject } from 'rxjs';
import { Risk, RiskAssessmentPost } from './IQueues.interface';

@Injectable({
  providedIn: 'root'
})
export class QueuesService {

  private acquiringUrl: string;
  private urlOutbound: string;

  currentLanguage: string;

  languageStream$ = new BehaviorSubject<string>(''); //temos de estar à escuta para termos a currentLanguage

  constructor(private router: ActivatedRoute,
    private http: HttpClient, @Inject(configurationToken) private configuration: Configuration,
    private route: Router, private tableinfo: TableInfoService) {
    this.acquiringUrl = configuration.acquiringAPIUrl;
    this.urlOutbound = configuration.outboundUrl;

    this.languageStream$.subscribe((val) => {
      this.currentLanguage = val
    });
  }

  ////////////
  //OUTBOUND//
  ////////////

  postRiskAssessment(fiscalId: string, postRiskAssessment: [Risk], clientType: string, requestID?: string, AcquiringUserID?: string, AcquiringProcessID?: string, AcquiringPartnerID?: string, AcquiringBranchID?) {


    // TODO: Enviar o clientType

    var URI = this.urlOutbound + "api/v1/assessment/" + fiscalId + '/risk';

    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Request-Id': requestID,
        'X-Acquiring-UserId': AcquiringUserID,
      }),
    }

    if (AcquiringPartnerID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-PartnerId", AcquiringPartnerID);
    if (AcquiringBranchID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-BranchId", AcquiringBranchID);
    if (AcquiringProcessID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-ProcessId", AcquiringProcessID);

    return this.http.post<RiskAssessmentPost>(URI, postRiskAssessment, HTTP_OPTIONS);
  }

  postEligibilityAssessment(fiscalId: string, clientType: string, requestID?: string, AcquiringUserID?: string, AcquiringProcessID?: string, AcquiringPartnerID?: string, AcquiringBranchID?) {


        // TODO: Enviar o clientType


    var URI = this.urlOutbound + 'api/v1/assessment/' + fiscalId + '/elegibility';

    var data = new Date();

    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Request-Id': requestID,
        'X-Acquiring-UserId': AcquiringUserID,
      }),
    }

    if (AcquiringPartnerID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-PartnerId", AcquiringPartnerID);
    if (AcquiringBranchID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-BranchId", AcquiringBranchID);
    if (AcquiringProcessID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-ProcessId", AcquiringProcessID);

    return this.http.post<string>(URI, clientType, HTTP_OPTIONS);
  }
}
