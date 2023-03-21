import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { AppConfigService } from './app-config.service';
import { retry } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private DOCASUrl: string;
  private authTokenUrl: string;
  private neyondBackURL: string;
  docasURL: string = "DOCAS/";

  constructor(private http: HttpClient, /*@Inject(configurationToken)*/ private configuration: AppConfigService, private authService: AuthService) {
    this.DOCASUrl = configuration.getConfig().DOCASUrl;
    this.authTokenUrl = configuration.getConfig().authTokenUrl;
    this.neyondBackURL = configuration.getConfig().neyondBackUrl;
  }

  async getAccessToken(): Promise<any> {

    var clientID = this.configuration.getConfig().clientID;
    var clientSecret = this.configuration.getConfig().clientSecret;
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
    var URI = this.authTokenUrl + "?delegated_token=true";
    var clientID = this.configuration.getConfig().clientID;
    var clientSecret = this.configuration.getConfig().clientSecret;
    var secret = btoa(clientID + ":" + clientSecret);

    const HTTP_OPTIONS_AUTH = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + secret
      })
    };
    return this.http.post(URI, 'grant_type=client_credentials&subject=' + username + '&display_name=' + username + '&claim-bank=' + bank + '&claim-bankLocation=' + bankLocation, HTTP_OPTIONS_AUTH).toPromise();
  }

  getLoginTokenInfo(token): Promise<any> {
    var object = {
      token: token
    }
    var URI = this.neyondBackURL + 'BEToken/GetToken';
    return this.http.post(URI, object).toPromise();
  }

  getToken() {
    var URI = this.neyondBackURL + 'BEToken/Token';
    return this.http.get(URI).pipe(retry(3));
  }

  teste() {
    var URI = 'http://localhost:7269/' + 'BEToken/Listen';
    var object = {
      SIBSTokenID: "abcdef"
    };
    return this.http.post(URI, object).toPromise();
  }


}
