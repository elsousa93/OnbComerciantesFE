import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Client } from '../Client.interface';
import { TestScheduler } from 'rxjs/testing';


@Component({
  selector: 'app-client',
  templateUrl: './clientbyid.component.html'
})

export class ClientByIdComponent implements OnInit {
  
  /*Variable declaration*/
  public clientNr: number = 0;
  client: Client = {
    "clientId": "Bananas",
    "fiscalId": "Bananas",
    "companyName": "Bananas",
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
      "capital": -88603287.00055264,
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
      "estimatedAnualRevenue": 59147011.77621019,
      "averageTransactions": -6444798.979596421,
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
  
  constructor(private router: ActivatedRoute, private http: HttpClient, @Inject('BASE_URL') private baseUrl: string, private route: Router) {
    this.ngOnInit();
    if (this.clientNr != -1) {
      http.get<Client>(baseUrl + 'BEClients/GetClientNr/' + this.clientNr).subscribe(result => {
        this.client = result;
        console.log( this.client);

      }, error => console.error(error));
    }
  }
  
  ngOnInit(): void {
    this.clientNr = Number(this.router.snapshot.params['id']);
    console.log(this.client);
  }

  obterComprovativos(){
    this.route.navigate(['/nav-interna/', "COMPROVATIVOS" ]);
    this.route.navigate(['/comprovativos/', this.clientNr ]);
  }
  umdois(){
   
  }
  
}
