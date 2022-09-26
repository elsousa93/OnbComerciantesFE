import { Inject, Injectable } from '@angular/core';
import { HttpMethod } from './enums/enum-data';
import { RequestResponse } from './table-info/ITable-info.interface';
import { HttpClient, HttpHeaders, HTTP_INTERCEPTORS } from '@angular/common/http';
import { LoggerService } from './logger.service';
import { Configuration, configurationToken } from './configuration';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';



@Injectable({
  providedIn: 'root'
})
export class APIRequestsService {
  currentLanguage: string;

  languageStream$ = new BehaviorSubject<string>(''); //temos de estar à escuta para termos a currentLanguage

  constructor(private logger: LoggerService, private http: HttpClient, @Inject(configurationToken) private configuration: Configuration, public translate: TranslateService) { }

  callAPIAcquiringTest(httpMethod: HttpMethod, httpURL: string, body?: any) {
    var requestResponse: RequestResponse = {};
    return new Promise<RequestResponse>((resolve, reject) => {
      this.http[httpMethod](httpURL, body).subscribe(result => {
        requestResponse.result = result;
        requestResponse.error = null;
        resolve(requestResponse);
      }, error => {
        console.log("error que deu: ", error);
        requestResponse.result = null;
        requestResponse.error = error;
        reject(requestResponse);
      });
    });
  }

  callAPIOutboundTest(httpMethod: HttpMethod, httpURL: string, searchId: string, searchType: string, requestId: string, AcquiringUserId: string, body?: any, countryId?: string, acceptLanguage?: string, AcquiringPartnerId?: string, AcquiringBranchId?: string, AcquiringProcessId?: string) {
    var requestResponse: RequestResponse = {};

    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Request-Id': requestId,
        'X-Acquiring-UserId': AcquiringUserId,
        'Accept-Language': this.currentLanguage,
      }),
    }

    if (AcquiringPartnerId !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-PartnerId", AcquiringPartnerId);
    if (AcquiringBranchId !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-BranchId", AcquiringBranchId);
    if (AcquiringProcessId !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-ProcessId", AcquiringProcessId);

    return new Promise<RequestResponse>((resolve, reject) => {
      if (body !== null && body !== undefined) {
        this.http[httpMethod](httpURL, body, HTTP_OPTIONS).subscribe(result => {
          requestResponse.result = result;
          requestResponse.error = null;
          resolve(requestResponse);
        }, error => {
          console.log("error que deu: ", error);
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
          console.log("error que deu: ", error);
          requestResponse.result = null;
          requestResponse.error = error;
          reject(requestResponse);
        });
      }
      
    });
  }
}
