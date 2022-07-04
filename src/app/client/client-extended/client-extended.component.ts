import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Client } from '../Client.interface';
import { FormBuilder, Validators, ReactiveFormsModule, NgForm, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-client-extended',
  templateUrl: './client-extended.component.html',
  styleUrls: ['./client-extended.component.css']
})
export class ClientExtendedComponent implements OnInit {

  public clients: Client[] = [];
  newClient : Client= {
    "clientId": "Bananas",
    "fiscalId": "Bananas",
    "companyName": "Bananas",
    "observations": "",
    "contactName": "Bananas ipsum",
    "shortName": "deserunt exercita",
    "headquartersAddress": {
      "address": "sed al",
      "postalCode": "ea sit est dolore",
      "postalArea": "ex ad",
      "country": "dolor pariatur amet labore consectetur"
    },
    "merchantType": "in esse",
    "legalNature": "officia tempor",
    "legalNature2": "proident",
    "crc": {
      "code": "est in Excepteur",
      "validUntil": "2010-04-24"
    },
    "shareCapital": {
      "capital": 87,
      "date": "1966-08-30"
    },
    "bylaws": "aliqua fugiat adipisicing sed",
    "mainEconomicActivity": {
      "code": "nostrud laboris ex eu",
      "branch": "ex ad"
    },
    "otherEconomicActivities": [
      {
        "code": "amet id nisi aliquip",
        "branch": "ea incididunt ex"
      },
      {
        "code": "cillum",
        "branch": "consectetur sint"
      }
    ],
    "mainOfficeAddress": {
      "address": "culpa exercitation qui",
      "postalCode": "non consequat in nulla",
      "postalArea": "adipisicing sit nisi est",
      "country": "eiusmod sunt Excepteur consequat ut"
    },
    "establishmentDate": "2009-12-16",
    "businessGroup": {
      "type": "amet do minim",
      "fiscalId": "esse volup"
    },
    "sales": {
      "estimatedAnualRevenue": 591,
      "averageTransactions": -6444798,
      "servicesOrProductsSold": [
        "deserunt tempor Ut",
        "dolore nisi tempor"
      ],
      "servicesOrProductsDestinations": [
        "pariatur et amet dolore sed",
        "labore aliqua irure"
      ]
    },
    "foreignFiscalInformation": {
      "issuerCountry": "et non ad",
      "issuanceIndicator": "proident consectetur non",
      "fiscalId": "cupidatat est sit esse",
      "issuanceReason": "nisi officia dolore"
    },
    "bankInformation": {
      "bank": "consequat",
      "branch": "adipisicing amet",
      "iban": "non sunt sint",
      "accountOpenedAt": "2019-06-11"
    },
    "contacts": {
      "preferredMethod": "EMAIL",
      "preferredPeriod": {
        "startsAt": "22:40:00.450Z",
        "endsAt": "15:42:54.722Z"
      },
      "phone1": {
        "countryCode": "\\\\\\\\\\99646",
        "phoneNumber": "ea"
      },
      "phone2": {
        "countryCode": "\\\\\\\\\\\\\\\\\\\\\\03770",
        "phoneNumber": "incididunt elit qui"
      },
      "fax": {
        "countryCode": "\\\\\\\\\\\\03581305",
        "phoneNumber": "voluptate Excepteur sit"
      },
      "email": "azwub3bMd@MmQrMhlbOgZHJmPU.km"
    },
    "documentationDeliveryMethod": "PORTAL",
    "billingEmail": "27omQ82nb@RIqJdzMzddCi.wwoo"
  };

  public clientid = 444;

  //For testing

  postData = {
    test: "myContent",
  };

  url = 'http://httpbin.org/post';
  json;


  constructor(private router: ActivatedRoute,
    private http: HttpClient, @Inject('BASE_URL')
    private baseUrl: string, private route: Router) {

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
