import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { merge, Observable, switchMap } from 'rxjs';
import { Configuration, configurationToken } from '../configuration';
import { LoggerService } from 'src/app/logger.service';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CRCService {
  private DOCASUrl: string;
  private authTokenUrl: string;
  docasURL: string = "DOCAS/";

  constructor(private logger: LoggerService, private router: ActivatedRoute, private http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private route: Router, private authService: AuthService) {
    this.DOCASUrl = configuration.DOCASUrl;
    this.authTokenUrl = configuration.authTokenUrl
  }

  async getAccessToken(): Promise<any> {
    var secret = btoa(this.configuration.clientID + ":" + this.configuration.clientSecret);

    const HTTP_OPTIONS_AUTH = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + secret
      })
    };

    this.logger.debug("a tentar obter o token");
    //var token;

    return this.http.post(this.authTokenUrl, 'grant_type=client_credentials', HTTP_OPTIONS_AUTH).toPromise();
    //this.http.post(URI, 'grant_type=client_credentials', HTTP_OPTIONS_AUTH).subscribe(result => {
    //  this.logger.debug("Post feito");
    //  token = result;
    //  localStorage.setItem('accessToken', token.access_token);
    //}, error => {
    //  return null;
    //});
  }

  getCRC(code: string, requestReason: string, requestedBy?: string): Observable<any>{

    //http://localhost:11000/api/v1/company/registry/001?requestReason=001&requestedBy=001

    //await this.getAccessToken().then(
    //  result => {
    //    this.logger.debug("resultado");
    //    this.logger.debug(result);
    //    const HTTP_OPTIONS = {
    //      headers: new HttpHeaders({
    //        'Authorization': 'Bearer ' + result.access_token
    //      }),
    //    }

    //    var URI = this.DOCASUrl + "v1/company/registry/" + code + "?requestReason=" + requestReason + (requestedBy === null ? "&requestedBy=" + requestedBy : "");


    //    this.logger.debug("chegou aqui resultado !!!");
    //    return this.http.get<any>(URI, HTTP_OPTIONS);
    //    //return new Promise(function (resolve, reject) {
    //    //  var URI = context.DOCASUrl + "v1/company/registry/" + code + "?requestReason=" + requestReason + (requestedBy === null ? "&requestedBy=" + requestedBy : "");

    //    //  context.http.get<any>(URI, HTTP_OPTIONS).subscribe(res => {
    //    //    this.logger.debug("entrou no resolve");
    //    //    resolve(res);
    //    //  }, error => {
    //    //    this.logger.debug("entrou no reject");
    //    //    reject(error);
    //    //  })
    //    //});

    //  }, error => {
    //    this.logger.debug("erro");
    //    this.logger.debug(error);
    //  }
    //);


      const HTTP_OPTIONS = {
        headers: new HttpHeaders({
          'Authorization': 'Bearer ' + this.authService.GetToken()
        }),
      }

      var URI = this.DOCASUrl + "v1/company/registry/" + code + "?requestReason=" + requestReason + (requestedBy === null ? "&requestedBy=" + requestedBy : "");
      var observable = this.http.get<any>(URI, HTTP_OPTIONS);

      return observable;
    
  }
  /*
    {
  "requestId": "77bfafbd-361f-4dec-85b8-1c3a51ecfd26",
  "code": "5767-5487-6430",
  "fiscalId": "501407081",
  "companyName": "V.VITORIA LDA",
  "legalNature": "SOCIEDADE POR QUOTAS",
  "headquartersAddress": {
    "fullAddress": "RESIDENCIAL Ã�GUA-MARINHA, CAMINHO DA ALFARROBEIRA, TORRE DA MEDRONHEIRA",
    "district": "Faro",
    "city": "Albufeira",
    "parish": "Albufeira e Olhos de Ã�gua",
    "postalCode": "8200-992",
    "postalArea": "ALBUFEIRA",
    "country": "PT"
  },
  "capitalStock": {
    "amount": null,
    "currency": "EUR",
    "date": "06/07/1984"
  },
  "economicActivity": {
    "main": "55111-R3",
    "secondary": null
  },
  "stakeholders": [
    {
      "name": "VÃ�TOR MANUEL CLEMENTE DA SILVA",
      "fiscalId": "111805082",
      "role": "GERENTE",
      "isBeneficiary": true,
      "capitalHeldPercentage": null
    },
    {
      "name": "PAULO ALEXANDRE COELHO CLEMENTE DA SILVA",
      "fiscalId": "218375476",
      "role": "GERENTE",
      "isBeneficiary": false,
      "capitalHeldPercentage": null
    },
    {
      "name": "KARLHEINZ PLÃ–SSER",
      "fiscalId": null,
      "role": "SOCIO SEM CARGO",
      "isBeneficiary": true,
      "capitalHeldPercentage": null
    },
    {
      "name": "V. VITÃ“RIA, LIMITADA",
      "fiscalId": null,
      "role": "GERENTE",
      "isBeneficiary": null,
      "capitalHeldPercentage": null
    }
  ],
  "expirationDate": "2022-10-18T00:00:00",
  "hasOutstandingFacts": false,
  "pdf": ""
  */
}
