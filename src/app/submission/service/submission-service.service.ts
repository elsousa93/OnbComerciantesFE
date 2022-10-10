import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Configuration, configurationToken } from 'src/app/configuration';
import { HttpMethod } from '../../enums/enum-data';
import { RequestResponse } from '../../table-info/ITable-info.interface';
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
    //var treatedProcessNumber = encodeURIComponent(processNumber);
    return this.http.get<SubmissionGet[]>(this.baseUrl + 'submission?ProcessNumber=' + processNumber);
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
          console.log("erro obj: ", err);
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
