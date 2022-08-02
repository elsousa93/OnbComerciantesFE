import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Client } from '../Client.interface';
import { FormBuilder, Validators, ReactiveFormsModule, NgForm, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Configuration, configurationToken } from 'src/app/configuration';

@Component({
  selector: 'app-client-extended',
  templateUrl: './client-extended.component.html',
  styleUrls: ['./client-extended.component.css']
})
export class ClientExtendedComponent implements OnInit {
  private baseUrl: string;


  public clients: Client[] = [];
  newClient: Client = {
    "clientId": "",
    "fiscalId": "",
    "companyName": "",
    "commercialName":"",
    "shortName": "",
    "headquartersAddress": {
      "address": "",
      "postalCode": "",
      "postalArea": "",
      "locality": "",
      "country": ""
    },
    "merchantType": "",
    "legalNature": "",
    "legalNature2": "",
    "crc": {
      "code": "",
      "validUntil": ""
    },
    "shareCapital": {
      "capital": 0,
      "date": "1966-08-30"
    },
    "byLaws": "",
    "mainEconomicActivity": "",
    "otherEconomicActivities": [""],
    "mainOfficeAddress": {
      "address": "",
      "postalCode": "",
      "postalArea": "",
      "country": "",
      "locality": ""
    },
    "establishmentDate": "2009-12-16",
    "businessGroup": {
      "type": "",
      "branch": ""
    },
    "knowYourSales": {
      "estimatedAnualRevenue": 0,
      "averageTransactions": 0,
      "servicesOrProductsSold": [
        "",
        ""
      ],
      "servicesOrProductsDestinations": [
        "",
        ""
      ]
    },
    "foreignFiscalInformation": {
      "issuerCountry": "",
      "issuanceIndicator": "",
      "fiscalId": "",
      "issuanceReason": ""
    },
    "bankInformation": {
      "bank": "",
      "branch": "",
      "iban": "",
      "accountOpenedAt": "2019-06-11"
    },
    "contacts": {
      "preferredMethod": "",
      "preferredPeriod": {
        "startsAt": "22:40:00.450Z",
        "endsAt": "15:42:54.722Z"
      },
      "phone1": {
        "countryCode": "",
        "phoneNumber": ""
      },
      "phone2": {
        "countryCode": "",
        "phoneNumber": ""
      },
      "fax": {
        "countryCode": "",
        "phoneNumber": ""
      },
      "email": ""
    },
    "documentationDeliveryMethod": "",
    "billingEmail": ""
  };

  public clientid = 444;

  //For testing

  postData = {
    test: "myContent",
  };

  url = 'http://httpbin.org/post';
  json;


  constructor(private router: ActivatedRoute,
    private http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private route: Router) {
      this.baseUrl = configuration.baseUrl;


    //Resquest
  //  this.http.post(baseUrl + 'BEClients/PostClientTest/', this.postData).toPromise().then(data => {
  //    console.log(data);});

  

  /*  http.post(baseUrl + 'BEClients/', this.newClient)
      .toPromise().then((data: any) => {
        console.log("construtor, a ser enviado pelo BECLients " ,data);
        //console.log(data.json.test);
        this.json = JSON.stringify(data.json);
      });
  */
  }

  ngOnInit(): void {
  }

  chamadaPost(newClient :  Client) {


    this.http.post(this.baseUrl + 'BEClients/PostClientTest', this.newClient)
      .toPromise().then((data: any) => {
        console.log(data);
        //console.log(data.json.test);
        this.json = JSON.stringify(data.json);
      });

  }

  chamadaPost2() {

    this.http.post<Client>(this.baseUrl + 'BEClients/PostClientTest', this.newClient).subscribe(result => {
      this.newClient = result;
       console.log("RESULT CHAMADA:  " , result);
    }, error => console.error(error));
   
  }

}
