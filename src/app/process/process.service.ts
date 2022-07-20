import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ISubmission } from '../submission/ISubmission.interface';
import { Process } from './process.interface';

@Injectable({
  providedIn: 'root'
})
export class ProcessService {

  urlOutbound: string = "http://localhost:12000/OutboundAPI/";


  constructor(private router: ActivatedRoute,
    private http: HttpClient, @Inject('BASE_URL')
    private baseUrl: string, private route: Router) { }

   getAllProcessSubmissions(id) : any {
     return this.http.get<Process[]>(this.baseUrl + 'BEProcess/GetAllProcesses/' + id);
   }

    getAllSuccessSubmissions(id): any {
      return this.http.get<Process[]>(this.baseUrl + 'BEProcess/GetAllSuccessProcesses/' + id);
    }

    getAllIncompletedSubmissions(id): any {
      return this.http.get<Process[]>(this.baseUrl + 'BEProcess/GetAllIncompletedProcesses/' + id);
    }

    getSubmissionByID(id): any {
      return this.http.get<ISubmission>(this.baseUrl + 'BEProcess/GetSubmissionByID/' + id);
  }


  //OUTBOUND API

  startProcess(process: Process, RequestID: string, AcquiringUserID: string, AcquiringPartnerID?: string, AcquiringBranchID?: string, AcquiringProcessID?: string): any {

    var URI = this.urlOutbound + "api/v1/process/";

    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Request-Id': RequestID,
        'X-Acquiring-UserId': AcquiringUserID
      }),
    }

    if (AcquiringPartnerID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-PartnerId", AcquiringPartnerID);
    if (AcquiringBranchID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-BranchId", AcquiringBranchID);
    if (AcquiringProcessID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-ProcessId", AcquiringProcessID);

    return this.http.post<any>(URI, process, HTTP_OPTIONS);
  }


  createStakeholder(process: Process, processReferenceID: string, requestID: string, AcquiringUserID: string, AcquiringProcessID?: string, AcquiringPartnerID?: string, AcquiringBranchID?: string): any {

    var URI = this.urlOutbound + "api/v1/process/";

    var data = new Date();

    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Content-Type': 'multipart/form-data',
        'Request-Id': requestID,
        'Date': data.toISOString(),
        'X-Acquiring-UserId': AcquiringUserID
      }),
    }

    if (AcquiringPartnerID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-PartnerId", AcquiringPartnerID);
    if (AcquiringBranchID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-BranchId", AcquiringBranchID);
    if (AcquiringProcessID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-ProcessId", AcquiringProcessID);

    return this.http.post<any>(URI, process, HTTP_OPTIONS);
  }
}
