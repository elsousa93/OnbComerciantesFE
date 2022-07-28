import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { merge, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CRCService {

  docasURL: string = "DOCAS/";

  constructor(private router: ActivatedRoute, private http: HttpClient, @Inject('DOCAS_URL')
  private DOCASUrl: string, private route: Router) { }

  getAccessToken() {
    var secret = btoa("4bd86de7-5640-4048-887e-7ecb6cedb01d" + ":" + "SIBS123456");

    var URI = 'http://localhost:10000/connect/token'

    const HTTP_OPTIONS_AUTH = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + secret
      })
    };

    console.log("a tentar obter o token");
    var token;

    return this.http.post(URI, 'grant_type=client_credentials', HTTP_OPTIONS_AUTH);

    //this.http.post(URI, 'grant_type=client_credentials', HTTP_OPTIONS_AUTH).subscribe(result => {
    //  console.log("Post feito");
    //  token = result;
    //  localStorage.setItem('accessToken', token.access_token);
    //}, error => {
    //  return null;
    //});
  }

  getCRC(code: string, requestReason: string, requestedBy?: string): any {

    //http://localhost:11000/api/v1/company/registry/001?requestReason=001&requestedBy=001

      const HTTP_OPTIONS = {
        headers: new HttpHeaders({
          //'Content-Type': 'multipart/form-data',
          'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
          //  "Access-Control-Allow-Headers": "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
        }),
      }
      ////////////////////////

      console.log("continua!!!j hsahkja hskjas");

      var URI = this.DOCASUrl + "v1/company/registry/" + code + "?requestReason=" + requestReason + (requestedBy === null ? "&requestedBy=" + requestedBy : "");
      var a = this.http.get<any>(URI, HTTP_OPTIONS);
      console.log("chegou ao fim");
      console.log(a);
      return a;
    
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
