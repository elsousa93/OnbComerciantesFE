import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LoggerService } from 'src/app/logger.service';
import { AuthService } from '../services/auth.service';
import { AppConfigService } from '../app-config.service';

@Injectable({
  providedIn: 'root'
})
export class CRCService {
  private DOCASUrl: string;
  private authTokenUrl: string;
  docasURL: string = "DOCAS/";

  constructor(private logger: LoggerService, private router: ActivatedRoute, private http: HttpClient, /*@Inject(configurationToken)*/ private configuration: AppConfigService, private route: Router, private authService: AuthService) {
    this.DOCASUrl = configuration.getConfig().DOCASUrl;
    this.authTokenUrl = configuration.getConfig().authTokenUrl
  }

  //async getAccessToken(): Promise<any> {
  //  var secret = btoa(this.configuration.getConfig().clientID + ":" + this.configuration.getConfig().clientSecret);

  //  const HTTP_OPTIONS_AUTH = {
  //    headers: new HttpHeaders({
  //      'Content-Type': 'application/x-www-form-urlencoded',
  //      'Authorization': 'Basic ' + secret
  //    })
  //  };

  //  this.logger.debug("a tentar obter o token");

  //  return this.http.post(this.authTokenUrl, 'grant_type=client_credentials', HTTP_OPTIONS_AUTH).toPromise();

  //}

  getCRC(code: string, requestReason: string, requestedBy?: string): Observable<any> {
    const HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + this.authService.GetToken()
      }),
    }

    var URI = this.DOCASUrl + "v1/company/registry/" + code + "?requestReason=" + requestReason + (requestedBy === null ? "&requestedBy=" + requestedBy : "");
    return this.http.get<any>(URI, HTTP_OPTIONS);

    //return observable;
  }
}
