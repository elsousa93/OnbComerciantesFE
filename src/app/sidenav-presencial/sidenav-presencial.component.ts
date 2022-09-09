import { MediaMatcher } from '@angular/cdk/layout';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, HostBinding, Input, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { onSideNavChange, AutoHideSidenavAdjust } from '../animation';
import { Client, Crc } from '../client/Client.interface';
import { ClientService } from '../client/client.service';
import { StakeholderService } from '../stakeholders/stakeholder.service';
import { CRCService } from '../CRC/crcservice.service';
import { SubmissionPostTemplate, SubmissionPutTemplate } from '../submission/ISubmission.interface';
import { SubmissionService } from '../submission/service/submission-service.service';
import { TableInfoService } from '../table-info/table-info.service';
import { UserPermissions, MenuPermissions, getMenuPermissions } from '../userPermissions/user-permissions'
import { IStakeholders } from '../stakeholders/IStakeholders.interface';
import { DataService } from '../nav-menu-interna/data.service';
import { AuthService } from '../services/auth.service';
import { User } from '../userPermissions/user';

@Component({
  selector: 'app-sidenav-presencial',
  templateUrl: './sidenav-presencial.component.html',
  styleUrls: ['./sidenav-presencial.component.css'],
  animations: [onSideNavChange, AutoHideSidenavAdjust]
})
export class SidenavPresencialComponent implements OnInit {

  @Input() isToggle: boolean = false;
  @Input() isAutoHide: boolean = false;

  clientEditTest: Client = {
    "id": "22195900000011",
    "merchantType": null,
    "commercialName": "CAFE CENTRAL DA CASINHA",
    "legalNature": "35",
    "legalNature2": null,
    "crc": {
      "code": "0000-0000-0001",
      "validUntil": "2023-06-29T18:52:08.336+01:00"
    },
    "shareCapital": {
      "capital": 50000.2,
      "date": "2028-06-29T18:52:08.336+01:00"
    },
    "byLaws": "O Joao pode assinar quase tudo, like a boss",
    "mainEconomicActivity": "90010",
    "otherEconomicActivities": [
      "055111"
    ],
    "establishmentDate": "2020-03-01T17:52:08.336+00:00",
    "businessGroup": null,
    "knowYourSales": {
      "estimatedAnualRevenue": 1000000,
      "averageTransactions": 30000,
      "servicesOrProductsSold": [
        "Cafe"
      ],
      "servicesOrProductsDestinations": [
        "PT"
      ]
    },
    "bankInformation": {
      "bank": "0033",
      "iban": "PT00333506518874499677629"
    },
    "contacts": {
      "email": "joao@silvestre.pt",
      "phone1": {
        "countryCode": "+351",
        "phoneNumber": "919654422"
      },
      "phone2": null,
      "fax": null
    },
    "documentationDeliveryMethod": null,
    "billingEmail": null,
    "clientId": null,
    "fiscalId": "585597928",
    "legalName": null,
    "shortName": "SILVESTRE LDA COMPANY",
    "headquartersAddress": {
      "address": "Rua da Azoia 4",
      "postalCode": "2625-236",
      "postalArea": "Povoa de Santa Iria",
      "country": "PT"
    }
  }

  submissionTest: SubmissionPostTemplate = {
    "submissionType": "DigitalFirstHalf",
    "processKind": "MerchantOnboarding",
    "processType": "Standard",
    "isClientAwaiting": true,
    "submissionUser": {
      "user": "joao.silvestre",
      "branch": "",
      "partner": ""
    },
    "documents": [],
    "isComplete": true,
    "bank": "0800",
    "merchant": {
      "fiscalId": "585597928",
      "companyName": "SILVESTRE LIMITADA",
      "commercialName": "CAFE CENTRAL",
      "shortName": "SILVESTRE LDA",
      "headquartersAddress": {
        "address": "Rua da Azoia 4",
        "postalCode": "2625-236",
        "postalArea": "Povoa de Santa Iria",
        "locality": "string",
        "country": "PT"
      },
      "merchantType": "Corporate",
      "legalNature": "35",
      "crc": {
        "code": "0000-0000-0001",
        "validUntil": "2023-06-29T17:52:08.336Z"
      },
      "shareCapital": {
        "capital": 50000.20,
        "date": "2028-06-29T17:52:08.336Z"
      },
      "byLaws": "O Joao pode assinar tudo, like a boss",
      "mainEconomicActivity": "90010",
      "otherEconomicActivities": ["055111"],
      "mainOfficeAddress": {
        "address": "Rua da Azoia 4",
        "postalCode": "2625-236",
        "postalArea": "Povoa de Santa Iria",
        "locality": "string",
        "country": "PT"
      },
      "establishmentDate": "2020-03-01T17:52:08.336Z",
      "knowYourSales": {
        "estimatedAnualRevenue": 1000000,
        "averageTransactions": 30000,
        "servicesOrProductsSold": ["Cafe"],
        "servicesOrProductsDestinations": ["PT"]
      },
      "bankInformation": {
        "bank": "0033",
        "branch": "0000",
        "iban": "PT00333506518874499677629",
        "accountOpenedAt": "2020-06-29T17:52:08.336Z"
      },
      "contacts": {
        "email": "joao@silvestre.pt",
        "phone1": {
          "countryCode": "+351",
          "phoneNumber": "919654422"
        }
      },
      "documentationDeliveryMethod": "MAIL",
      "billingEmail": "joao@silvestre.pt"
    },
    "stakeholders": [
      {
        "fiscalId": "232012610",
        "identificationDocument": {
          "type": "0020",
          "number": "13713441",
          "country": "PT",
          "expirationDate": "2023-06-29T17:52:08.337Z"
        },
        "fullName": "Joao Paulo Ferreira Silvestre",
        "contactName": "Jo Silvestre",
        "shortName": "Joao Silvestre",
        "isProxy": false,
        "fiscalAddress": {
          "address": "Rua da Azoia 4",
          "postalCode": "2625-236",
          "postalArea": "Povoa de Santa Iria",
          "country": "PT"
        },
        "phone1": {
          "countryCode": "+351",
          "phoneNumber": "919654422"
        },
        "phone2": {
          "countryCode": "+351",
          "phoneNumber": "919654422"
        },
        "email": "joao@silvestre.pt",
        "birthDate": "1990-08-11"
      }
    ]
  }

  submissionPutTeste: SubmissionPutTemplate = {
    "submissionType": "DigitalFirstHalf",
    "processNumber": "dOBUs+DgWEaiJVbKZi1c5A==",
    "processKind": "MerchantOnboarding",
    "processType": "Standard",
    "isClientAwaiting": true,
    "submissionUser": {
      "user": "joao.silvestre",
      "branch": "",
      "partner": ""
    },
    "isComplete": true,
    "id": "1a1e127a-ef25-49a1-a0c6-4e99b3c4c949",
    "bank": "0800",
    "state": "Incomplete",
    "startedAt": "2020-10-10"
  }

  stakeholderTeste: IStakeholders = {
    "fiscalId": "232012610",
    "identificationDocument": {
      "type": "0020",
      "number": "13713441",
      "country": "PT",
      "expirationDate": "2023-06-29T17:52:08.337Z"
    },
    "fullName": "Joao Paulo Ferreira Silvestre",
    "contactName": "Jo Silvestre",
    "shortName": "Joao Silvestre",
    "fiscalAddress": {
      "address": "Rua da Azoia 4",
      "postalCode": "2625-236",
      "postalArea": "Povoa de Santa Iria",
      "country": "PT"
    },
    "isProxy": false,
    "phone1": {
      "countryCode": "+351",
      "phoneNumber": "919654422"
    },
    "phone2": {
      "countryCode": "+351",
      "phoneNumber": "919654422"
    },
    "email": "joao@silvestre.pt",
    "birthDate": "1990-08-11",
    "pep": {
      "isPep": true,
      "hasFamilyRelationship": true,
      "familyRelationshipKind": 1,
      "hasBusinessRelationship": true,
      "businessRelationshipKind": 1,
      "relatedPep": {
        "id": "",
        "url": ""
      },
      "pepDetails": {
        "fiscalId": "",
        "identificationDocument": {
          "type": "",
          "number": "",
          "country": "",
          "expirationDate": "2023-06-29T17:52:08.337Z"
        },
        "fullName": "",
        "contactName": "",
        "shortName": "",
        "fiscalAddress": {
          "address": "Rua da Azoia 4",
          "postalCode": "2625-236",
          "postalArea": "Povoa de Santa Iria",
          "country": "PT"
        },
        "kind": "",
        "country": "",
        "sinceWhen": ""
      }, 
    },
    "id": "",
    "stakeholderId": "" 
  }

  stakeholderPutTeste: IStakeholders = {
    "fiscalId": "232012610",
    "identificationDocument": {
      "type": "0020",
      "number": "13713441",
      "country": "PT",
      "expirationDate": "2023-06-29T17:52:08.337Z"
    },
    "fullName": "Joao Paulo Ferreira Silvestre",
    "contactName": "Jo Silvestre",
    "shortName": "Joao Silvestre",
    "fiscalAddress": {
      "address": "Rua da Azoia 4",
      "postalCode": "2625-236",
      "postalArea": "Povoa de Santa Iria",
      "country": "PT"
    },
    "isProxy": false,
    "phone1": {
      "countryCode": "+351",
      "phoneNumber": "919654422"
    },
    "phone2": {
      "countryCode": "+351",
      "phoneNumber": "919654422"
    },
    "email": "joao@silvestre.pt",
    "birthDate": "1990-08-11",
    "pep": {
      "isPep": true,
      "hasFamilyRelationship": true,
      "familyRelationshipKind": 1,
      "hasBusinessRelationship": true,
      "businessRelationshipKind": 1,
      "relatedPep": {
        "id": "",
        "url": ""
      },
      "pepDetails": {
        "fiscalId": "",
        "identificationDocument": {
          "type": "",
          "number": "",
          "country": "",
          "expirationDate": "2023-06-29T17:52:08.337Z"
        },
        "fullName": "",
        "contactName": "",
        "shortName": "",
        "fiscalAddress": {
          "address": "Rua da Azoia 4",
          "postalCode": "2625-236",
          "postalArea": "Povoa de Santa Iria",
          "country": "PT"
        },
        "kind": "",
        "sinceWhen": "",
        "country": ""
      },

    },
    "id": "",
    "stakeholderId": ""
  }


  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  @HostBinding('style.--toptestexpto') public toptestexpto: string = '5px';

  userPermissions: MenuPermissions;

  currentUser: User = {};

  constructor(private http: HttpClient, private cookie: CookieService, private router: Router,
    changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, private submissionService: SubmissionService,
    private clientService: ClientService, private crcService: CRCService, private stakeholderService: StakeholderService, private tableInfo: TableInfoService,
    private dataService: DataService, private authService: AuthService) {
    this.mobileQuery = media.matchMedia('(max-width: 850px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      var a = UserPermissions[this.currentUser.permissions];

      console.log("permissões: ", this.currentUser.permissions);
      console.log("userPermission tratada: ", a);

      this.userPermissions = getMenuPermissions(a);

    });
  }

  hideHistoryTab(){
    this.dataService.historyStream$.next(false); 
  }

  public toggleSideNav(toggled: boolean) {
    this.isToggle = toggled;
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  FTSearch(queue: string){
    let navigationExtras: NavigationExtras = {
      state: {
        queueName: queue
      }
    };
    this.router.navigate(["/app-consultas-ft"], navigationExtras);
  }

  testeAuth() {
    console.log(this.currentUser);
    console.log(this.userPermissions);
  }

  logout() {
    localStorage.removeItem('auth');
    this.authService.reset();
  }

  login() {
    this.authService.reset();

    console.log("currentUser: ", this.authService.GetCurrentUser());

    this.logout();
  }
}
