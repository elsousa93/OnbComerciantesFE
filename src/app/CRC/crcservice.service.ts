import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CRCService {

  docasURL: string = "DOCAS/";

  constructor(private router: ActivatedRoute, private http: HttpClient, @Inject('DOCAS_URL')
  private DOCASUrl: string, private route: Router) { }

  getCRC(code: string, requestReason: string, requestedBy?: string): any {
    //http://localhost:11000/api/v1/company/registry/001?requestReason=001&requestedBy=001

    var secret = btoa("4bd86de7-5640-4048-887e-7ecb6cedb01d" + ":" + "SIBS123456");
    const HTTP_OPTIONS = {
      headers: new HttpHeaders({
        //'Content-Type': 'multipart/form-data',
        'Authorization': 'Bearer ' + "eyJhbGciOiJSUzI1NiIsImtpZCI6IkM1QkE4RDUwNjcyNTg5NTcwOEI5QkUyMDJBOEU5MjJFQUE1MjE2OUYiLCJ4NXQiOiJ4YnFOVUdjbGlWY0l1YjRnS282U0xxcFNGcDgiLCJ0eXAiOiJhdCtqd3QifQ.eyJzdWIiOiI0YmQ4NmRlNy01NjQwLTQwNDgtODg3ZS03ZWNiNmNlZGIwMWQiLCJuYW1lIjoiRE9DQVMiLCJvaV9wcnN0IjoiNGJkODZkZTctNTY0MC00MDQ4LTg4N2UtN2VjYjZjZWRiMDFkIiwiY2xpZW50X2lkIjoiNGJkODZkZTctNTY0MC00MDQ4LTg4N2UtN2VjYjZjZWRiMDFkIiwib2lfdGtuX2lkIjoiMTkzYjYxNjAtYzIxMy00MmM3LTg4MGYtMzY5MjRjMjY0NzRlIiwiZXhwIjoxNjU4Mzk0Njg0LCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjEwMDAwLyIsImlhdCI6MTY1ODMwODI4NH0.SX4x7uoSSzyBr6Ujq_0vb7T5cm8UHCvEuoUBsx21FCuF6Xxgqb7ej7jO67uhiZRFLpIJ-J858Ga0MOxXQCJCd5LNK1NTy3luqZMY0BxFYxa-rYJTdUlpmR3G5dhxL0iTLjQoWvYI05JGKk9zIRlyo28hlaDbOQo8SP_Y7v9_kAbXLeQdSM1PL8wTuq4KxVgtLDJm3sijBDaxSQwIbiRxp3gTPpgJJmfRbeYHiViSyQlSdh1YkSYjqPVxaWCLLLvOgjq4znoLKHxIH5lQlp4-irI6z_Mixvh09-siutaw4_m_2jhIKdK-f1uv_BJpgMu35ZOuFPH6Q9-pKgAWIXhwsA"
        //  "Access-Control-Allow-Headers": "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
      }),
    }
    ////////////////////////

    var URI = this.DOCASUrl + "v1/company/registry/" + code + "?requestReason=" + requestReason + (requestedBy === null ? "&requestedBy=" + requestedBy : "");
    return this.http.get<any>(URI, HTTP_OPTIONS);
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
