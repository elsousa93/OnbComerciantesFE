import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map, catchError, retryWhen, delay, take } from 'rxjs/operators';
import { HttpUtilService } from './http.services';


@Injectable({
  providedIn: 'root'
})
export class ComprovativosService {
  API_URL:string = '';
  

  constructor(private http: HttpClient, @Inject('BASE_URL') baseUrl: string, private httpUtil: HttpUtilService) {
    this.API_URL = baseUrl;
   }

  uploadFile(file: File, id: any) {
    const formData: FormData = new FormData();
    formData.append('image', file);
    return this.http.put( this.API_URL + `ServicesComprovativos/`+ id, formData)
      .pipe(map(this.httpUtil.extrairDados))
      .pipe(
        retryWhen(errors => errors.pipe(delay(1000), take(10))),
        catchError(this.httpUtil.processarErros));
  }

  delFile(id: any){
    return this.http.delete(this.API_URL + `ServicesComprovativos/ServicesComprovativos/`+ id)
    .pipe(
      
      retryWhen(errors => errors.pipe(delay(1000), take(1))),
      catchError(this.httpUtil.processarErros));
    } 
}
