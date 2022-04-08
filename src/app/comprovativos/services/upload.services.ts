import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map, catchError, retryWhen, delay, take } from 'rxjs/operators';
import { HttpUtilService } from './http.services';


@Injectable({
  providedIn: 'root'
})
export class UploadService {
  API_URL:string = '';
  

  constructor(private http: HttpClient, @Inject('BASE_URL') baseUrl: string, private httpUtil: HttpUtilService) {
    this.API_URL = baseUrl;
   }

  uploadFile(file: File) {
    const formData: FormData = new FormData();
    formData.append('image', file);

    return this.http.post( this.API_URL + `upload`, formData)
      .pipe(map(this.httpUtil.extrairDados))
      .pipe(
        retryWhen(errors => errors.pipe(delay(1000), take(10))),
        catchError(this.httpUtil.processarErros));
  }
}
