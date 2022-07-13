import { MediaMatcher } from '@angular/cdk/layout';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, HostBinding, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { onSideNavChange, AutoHideSidenavAdjust } from '../animation';
import { SubmissionPostTemplate } from '../submission/ISubmission.interface';
import { SubmissionService } from '../submission/service/submission-service.service';
import { UserPermissions, MenuPermissions, getMenuPermissions } from '../userPermissions/user-permissions'

@Component({
  selector: 'app-sidenav-presencial',
  templateUrl: './sidenav-presencial.component.html',
  styleUrls: ['./sidenav-presencial.component.css'],
  animations: [onSideNavChange, AutoHideSidenavAdjust]
})
export class SidenavPresencialComponent implements OnInit {

  @Input() isToggle: boolean = false;
  @Input() isAutoHide: boolean = false;

  submissionTest: SubmissionPostTemplate = {
    "submissionType": "DigitalFirstHalf",
    "processKind": "MerchantOnboarding",
    "processType": "Standard",
    "isClientAwaiting": true,
    "submissionUser": {
      "user": "joao.silvestre",
      "employer": "SIBS"
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
        "address": {
          "address": "Rua da Azoia 4",
          "postalCode": "2625-236",
          "postalArea": "Povoa de Santa Iria",
          "country": "PT"
        },
        "isProxy": false,
        "fiscalAddress": {
          "address": "Rua da Azoia 4",
          "postalCode": "2625-236",
          "postalArea": "Povoa de Santa Iria",
          "country": "PT"
        },
        "phone": {
          "countryCode": "+351",
          "phoneNumber": "919654422"
        },
        "email": "joao@silvestre.pt",
        "birthDate": "1990-08-11"
      }
    ]
  }

  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  @HostBinding('style.--toptestexpto') public toptestexpto: string = '5px';

  userType: string = "Banca";
  userPermissions: MenuPermissions;

  constructor(private http: HttpClient, private cookie: CookieService, private router: Router,
    changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, private submissionService: SubmissionService) {
    this.mobileQuery = media.matchMedia('(max-width: 850px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit(): void {
    this.userPermissions = getMenuPermissions(UserPermissions.DO);
    console.log("teste api");
    console.log(this.submissionService.InsertSubmission(this.submissionTest));
  //  alert(this.isAutoHide);
  }

  assignMenus() {
  }

  public toggleSideNav(toggled: boolean) {
    this.isToggle = toggled;
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }
}
