import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { merge, Observable, switchMap } from 'rxjs';
import { Configuration, configurationToken } from './configuration';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private DOCASUrl: string;
  private authTokenUrl: string;
  docasURL: string = "DOCAS/";

  constructor(private router: ActivatedRoute, private http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private route: Router) {
    this.DOCASUrl = configuration.DOCASUrl;
    this.authTokenUrl = configuration.authTokenUrl;
  }

  async getAccessToken(): Promise<any> {
    var secret = btoa("4bd86de7-5640-4048-887e-7ecb6cedb01d" + ":" + "SIBS123456");

    const HTTP_OPTIONS_AUTH = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + secret
      })
    }; 
    return this.http.post(this.authTokenUrl, 'grant_type=client_credentials', HTTP_OPTIONS_AUTH).toPromise();
  }

  getCRC(code: string, requestReason: string, requestedBy?: string): any {

    const HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
      }),
    }
    var URI = this.DOCASUrl + "v1/company/registry/" + code + "?requestReason=" + requestReason + (requestedBy === null ? "&requestedBy=" + requestedBy : "");
    var observable = this.http.get<any>(URI, HTTP_OPTIONS);
    return observable;

  }

}
