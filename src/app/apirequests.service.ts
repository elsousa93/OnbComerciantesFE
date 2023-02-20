import { Injectable } from '@angular/core';
import { HttpMethod } from './enums/enum-data';
import { RequestResponse } from './table-info/ITable-info.interface';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from './services/auth.service';
import { ProcessNumberService } from './nav-menu-presencial/process-number.service';

@Injectable({
  providedIn: 'root'
})
export class APIRequestsService {
  currentLanguage: string;
  languageStream$ = new BehaviorSubject<string>(''); //temos de estar à escuta para termos a currentLanguage

  constructor(private http: HttpClient, public translate: TranslateService, private authService: AuthService, private processNrService: ProcessNumberService) {
    this.languageStream$.subscribe((val) => {
      this.currentLanguage = val
    });
  }

  callAPIAcquiring(httpMethod: HttpMethod, httpURL: string, body?: any) {
    var requestResponse: RequestResponse = {};
    return new Promise<RequestResponse>((resolve, reject) => {
      this.http[httpMethod](httpURL, body).subscribe(result => {
        requestResponse.result = result;
        requestResponse.error = null;
        resolve(requestResponse);
      }, error => {
        console.log("erro na chamada da Acquiring: ", error);
        requestResponse.result = null;
        requestResponse.error = error;
        reject(requestResponse);
      });
    });
  }

  callAPIOutbound(httpMethod: HttpMethod, httpURL: string, searchId: string, searchType: string, requestId: string, AcquiringUserId: string, body?: any, countryId?: string, acceptLanguage?: string, AcquiringPartnerId?: string, AcquiringBranchId?: string, AcquiringProcessId?: string) {
    var requestResponse: RequestResponse = {};

    requestId = window.crypto['randomUUID']();
    AcquiringUserId = this.authService.GetCurrentUser().userName;
    AcquiringPartnerId = this.authService.GetCurrentUser().bankName;
    AcquiringBranchId = this.authService.GetCurrentUser().bankLocation;
    this.processNrService.processNumber.subscribe(processNumber => AcquiringProcessId = processNumber);

    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'X-Acquiring-Tenant': "0800",
        'X-Request-Id': requestId,
        'X-Acquiring-UserId': AcquiringUserId,
        'X-Date': new Date().toUTCString(),
        'X-Acquiring-PartnerId': AcquiringPartnerId,
        'X-Acquiring-BranchId': AcquiringBranchId
      }),
    }
    if (AcquiringProcessId != "" && AcquiringProcessId != null)
      HTTP_OPTIONS.headers = HTTP_OPTIONS.headers.append("X-Acquiring-ProcessId", AcquiringProcessId);
    //if (AcquiringPartnerID !== null)
    //  HTTP_OPTIONS.headers.append("X-Acquiring-PartnerId", AcquiringPartnerID);
    //if (AcquiringBranchID !== null)
    //  HTTP_OPTIONS.headers.append("X-Acquiring-BranchId", AcquiringBranchID);
    //if (AcquiringProcessID !== null)
    //  HTTP_OPTIONS.headers.append("X-Acquiring-ProcessId", AcquiringProcessID);

    return new Promise<RequestResponse>((resolve, reject) => {
      if (body !== null && body !== undefined) {
        this.http[httpMethod](httpURL, body, HTTP_OPTIONS).subscribe(result => {
          requestResponse.result = result;
          requestResponse.error = null;
          resolve(requestResponse);
        }, error => {
          console.log("Erro na chamada da Outbound: ", error);
          requestResponse.result = null;
          requestResponse.error = error;
          reject(requestResponse);
        });
      } else {
        this.http[httpMethod](httpURL, HTTP_OPTIONS).subscribe(result => {
          requestResponse.result = result;
          requestResponse.error = null;
          resolve(requestResponse);
        }, error => {
          console.log("Erro na chamada da Outbound: ", error);
          requestResponse.result = null;
          requestResponse.error = error;
          reject(requestResponse);
        });
      }
    });
  }

}
