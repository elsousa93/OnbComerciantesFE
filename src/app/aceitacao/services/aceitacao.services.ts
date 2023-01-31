import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, catchError, retryWhen, delay, take } from 'rxjs/operators';
import { AppConfigService } from '../../app-config.service';
import { HttpUtilService } from './http.services';

@Injectable({
  providedIn: 'root'
})
export class AceitacaoService {
  API_URL: string = '';
  private baseUrl: string;

  constructor(private http: HttpClient, private configuration: AppConfigService, private httpUtil: HttpUtilService) {
    this.baseUrl = configuration.getConfig().acquiringAPIUrl;
    this.API_URL = this.baseUrl;
  }

  delFile(id: any) {
    return this.http.delete(this.API_URL + `ServicesAceitacao/ServicesAceitacao/` + id)
      .pipe(

        retryWhen(errors => errors.pipe(delay(1000), take(1))),
        catchError(this.httpUtil.processarErros));
  }
}
