import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ISubmission } from '../submission/ISubmission.interface';
import { Process } from './process.interface';

@Injectable({
  providedIn: 'root'
})
export class ProcessService {

  constructor(private router: ActivatedRoute,
    private http: HttpClient, @Inject('BASE_URL')
    private baseUrl: string, private route: Router) { }

   getAllProcessSubmissions(id) : any {
     return this.http.get<Process[]>(this.baseUrl + 'BEProcess/GetAllProcesses/ghjkl');
   }

    getAllSuccessSubmissions(id): any {
      return this.http.get<Process[]>(this.baseUrl + 'BEProcess/GetAllSuccessProcesses/ghjkl');
    }

    getAllIncompletedSubmissions(id): any {
      return this.http.get<Process[]>(this.baseUrl + 'BEProcess/GetAllIncompletedProcesses/ghjkl');
    }

    getSubmissionByID(id): any {
      return this.http.get<ISubmission>(this.baseUrl + 'BEProcess/GetSubmissionByID/' + id);
    }
}
