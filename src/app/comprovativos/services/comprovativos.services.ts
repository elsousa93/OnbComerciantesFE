import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map, catchError, retryWhen, delay, take } from 'rxjs/operators';
import { Configuration, configurationToken } from 'src/app/configuration';
import { HttpUtilService } from './http.services';


@Injectable({
  providedIn: 'root'
})
export class ComprovativosService {
  API_URL:string = '';
  private baseUrl: string;
  
  constructor(private http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private httpUtil: HttpUtilService) {
    this.baseUrl = configuration.baseUrl;

    this.API_URL = this.baseUrl;
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



}
