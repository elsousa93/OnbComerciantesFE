import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { merge, Observable, switchMap } from 'rxjs';
import { Configuration, configurationToken } from './configuration';
import { AuthService } from './services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private DOCASUrl: string;
  private authTokenUrl: string;
  private neyondBackURL: string;
  docasURL: string = "DOCAS/";

  constructor(private router: ActivatedRoute, private http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private route: Router, private authService: AuthService) {
    this.DOCASUrl = configuration.DOCASUrl;
    this.authTokenUrl = configuration.authTokenUrl;
    this.neyondBackURL = configuration.neyondBackUrl;
  }

  async getAccessToken(): Promise<any> {

    var clientID = this.configuration.clientID;
    var clientSecret = this.configuration.clientSecret;

    var secret = btoa(clientID + ":" + clientSecret);

    const HTTP_OPTIONS_AUTH = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + secret
      })
    }; 
    return this.http.post(this.authTokenUrl, 'grant_type=client_credentials', HTTP_OPTIONS_AUTH).toPromise();
  }

  getCRC(code: string, requestReason: string, requestedBy?: string): any {
    var token = '';
    this.authService.currentUser.subscribe(result => {
      token = result.token;
      const HTTP_OPTIONS = {
        headers: new HttpHeaders({
          'Authorization': 'Bearer ' + token
        }),
      }
      var URI = this.DOCASUrl + "v1/company/registry/" + code + "?requestReason=" + requestReason + (requestedBy === null ? "&requestedBy=" + requestedBy : "");
      var observable = this.http.get<any>(URI, HTTP_OPTIONS);
      return observable;
    })
  }

  async getLoginToken(username?: string, bank?: string, bankLocation?: string): Promise<any> {

    var clientID = this.configuration.clientID;
    var clientSecret = this.configuration.clientSecret;

    var secret = btoa(clientID + ":" + clientSecret);

    const HTTP_OPTIONS_AUTH = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + secret
      })
    };
    return this.http.post(this.authTokenUrl, 'grant_type=client_credentials&claim-username=' + username + '&claim-bank=' + bank + '&claim-bankLocation=' + bankLocation, HTTP_OPTIONS_AUTH).toPromise();
  }

  getLoginTokenInfo(token): Promise<any> {
    var object = {
      token: token
    }

    var URI = this.neyondBackURL + 'BEToken/GetToken';
    return this.http.post(URI, object).toPromise();
  }

}
