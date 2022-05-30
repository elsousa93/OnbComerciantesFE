import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Submission } from './submission.interface';

@Injectable({
  providedIn: 'root'
})
export class ProcessService {

  constructor(private router: ActivatedRoute,
    private http: HttpClient, @Inject('BASE_URL')
    private baseUrl: string, private route: Router) { }

   getAllProcessSubmissions(id) : any {
     return this.http.get<Submission[]>(this.baseUrl + 'BEProcess/GetAllProcesses/ghjkl' + id);
   }

    getAllSuccessSubmissions(id): any {
      return this.http.get<Submission[]>(this.baseUrl + 'BEProcess/GetAllSuccessProcesses/ghjkl' + id);
    }

    getAllIncompletedSubmissions(id): any {
      return this.http.get<Submission[]>(this.baseUrl + 'BEProcess/GetAllIncompletedProcesses/' + id);
    }

  getSubmissionByID(id): any {
    return this.http.get<Submission>(this.baseUrl + 'BEProcess/GetSubmissionByID/' + id);
    }
}
