import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map, catchError, retryWhen, delay, take } from 'rxjs/operators';
import { APIRequestsService } from '../../apirequests.service';
import { AppConfigService } from '../../app-config.service';
import { HttpMethod } from '../../enums/enum-data';
import { TreatedResponse } from '../../table-info/ITable-info.interface';
import { RequiredDocuments } from '../IComprovativos.interface';
import { HttpUtilService } from './http.services';

@Injectable({
  providedIn: 'root'
})
export class ComprovativosService {
  API_URL: string = '';
  private baseUrl: string;
  private outboundUrl: string;

  currentLanguage: string;
  languageStream$ = new BehaviorSubject<string>('');

  constructor(private http: HttpClient, /*@Inject(configurationToken)*/ private configuration: AppConfigService, private httpUtil: HttpUtilService, private APIRequest: APIRequestsService) {
    this.languageStream$.subscribe((val) => {
      this.currentLanguage = val
    });

    this.baseUrl = configuration.getConfig().acquiringAPIUrl;
    this.outboundUrl = configuration.getConfig().outboundUrl;
    this.API_URL = this.baseUrl;

  }

  readBase64(file): Promise<any> {
    const reader = new FileReader();
    const future = new Promise((resolve, reject) => {
      reader.addEventListener('load', function () {
        resolve(reader.result);
      }, false);
      reader.addEventListener('error', function (event) {
        reject(event);
      }, false);
      reader.readAsDataURL(file);
    });
    return future;
  }

  GetDocumentImageOutbound(documentReference, format?) {
    var url = this.outboundUrl + "api/v1/document/" + documentReference + "/image";
    return new Promise<any>((resolve, reject) => {
      this.APIRequest.callAPIOutbound(HttpMethod.FETCH, url, "221212", "search", "8812451", "78217").then(res => {
        var document = res;
        resolve(document);
      }, resolve => {
        reject(null);
      })
    })
  }

  viewDocument(documentReference) {
    this.GetDocumentImageOutbound(documentReference).then(res => {
      var file: File = res;
      let blob = new Blob([file], { type: file.type });
      let url = window.URL.createObjectURL(blob);

      window.open(url, '_blank',
        `margin: auto;
      width: 50%;
      padding: 10px;
      text-align: center;
      border: 3px solid green;
      `);
    });
  }

  getRequiredDocuments(submissionID: string) {
    var url = this.baseUrl + 'submission/' + submissionID + '/required-documents';
    var response: TreatedResponse<RequiredDocuments> = {};

    return new Promise<TreatedResponse<RequiredDocuments>>((resolve, reject) => {
      var HTTP_OPTIONS = {
        headers: new HttpHeaders({
          'Accept-Language': this.currentLanguage,
        }),
      }
      this.APIRequest.callAPIAcquiring(HttpMethod.GET, url, HTTP_OPTIONS).then(success => {
        response.result = success.result;
        response.msg = "Sucesso";
        resolve(response);
      }, error => {
        response.result = null;
        response.msg = "Erro";
        reject(response);
      })
    });
  }

  getProcessRequiredDocuments(processID: string) {
    var url = this.baseUrl + 'process/' + processID + '/required-documents';
    var response: TreatedResponse<RequiredDocuments> = {};

    return new Promise<TreatedResponse<RequiredDocuments>>((resolve, reject) => {
      var HTTP_OPTIONS = {
        headers: new HttpHeaders({
          'Accept-Language': this.currentLanguage,
        }),
      }
      this.APIRequest.callAPIAcquiring(HttpMethod.GET, url, HTTP_OPTIONS).then(success => {
        response.result = success.result;
        response.msg = "Sucesso";
        resolve(response);
      }, error => {
        response.result = null;
        response.msg = "Erro";
        reject(response);
      })
    });
  }
}
