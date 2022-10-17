import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Configuration, configurationToken } from 'src/app/configuration';
import { HttpMethod } from '../../enums/enum-data';
import { RequestResponse, TreatedResponse } from '../../table-info/ITable-info.interface';
import { SubmissionPostTemplate, SubmissionPostResponse, SubmissionPutTemplate, SubmissionGetTemplate, SubmissionGet } from '../ISubmission.interface'

@Injectable({
  providedIn: 'root'
})
export class SubmissionService {
  private baseUrl;
  currentLanguage: string;
  languageStream$ = new BehaviorSubject<string>(''); 

  constructor(private http: HttpClient, @Inject(configurationToken) private configuration: Configuration) {
    this.baseUrl = configuration.baseUrl;
    this.languageStream$.subscribe((val) => {
      this.currentLanguage = val
    });

  }

  GetSubmissionByID(submissionID: string): any {

    var url = this.baseUrl + 'submission/' + submissionID;

    var response: TreatedResponse<SubmissionGetTemplate> = {};

    return new Promise<TreatedResponse<SubmissionGetTemplate>>((resolve, reject) => {
      var HTTP_OPTIONS = {
        headers: new HttpHeaders({
          'Accept-Language': this.currentLanguage,

        }),
      }
      this.callAPIAcquiring(HttpMethod.GET, url, HTTP_OPTIONS).then(success => {
        response.result = success.result;
        response.msg = "Sucesso";
        resolve(response);
      }, error => {
        response.result = null;
        response.msg = "Sem stakeholders";
        reject(response);
      })
    });


  }

  InsertSubmission(submissionToInsert: SubmissionPostTemplate): any {
    return this.http.post<SubmissionPostResponse>(this.baseUrl + 'submission/', submissionToInsert);
  }

  EditSubmission(submissionID: string, submissionToEdit: SubmissionPutTemplate): any {
    return this.http.put<SubmissionPutTemplate>(this.baseUrl + 'submission/' + submissionID, submissionToEdit);
  }

  GetSubmissionByProcessNumber(processNumber: string): any {

    var url = this.baseUrl + 'submission?ProcessNumber=' + processNumber;

    var response: TreatedResponse<SubmissionGet[]> = {};

    return new Promise<TreatedResponse<SubmissionGet[]>>((resolve, reject) => {
      var HTTP_OPTIONS = {
        headers: new HttpHeaders({
          'Accept-Language': this.currentLanguage,

        }),
      }
      this.callAPIAcquiring(HttpMethod.GET, url, HTTP_OPTIONS).then(success => {
        response.result = success.result;
        response.msg = "Sucesso";
        resolve(response);
      }, error => {
        response.result = null;
        response.msg = "Sem stakeholders";
        reject(response);
      })
    });
  }


  //PROVISORIO
  callAPIAcquiring(httpMethod: HttpMethod, httpURL: string, body?: any) {
    var requestResponse: RequestResponse = {};

    return new Promise<RequestResponse>((resolve, reject) => {
      this.http[httpMethod](httpURL, body).subscribe({
        next: (res: any) => {
          requestResponse.result = res;
          requestResponse.error = null;
          resolve(requestResponse);
        },
        error: (err: any) => {
          requestResponse.result = null;
          requestResponse.error = {
            code: err.status,
            message: err.statusText
          }
          reject(requestResponse);
        },
        complete: () => {
          console.log("pedido terminado!!");
        }
      });
    });
  }



}
