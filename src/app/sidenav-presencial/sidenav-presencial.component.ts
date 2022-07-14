import { MediaMatcher } from '@angular/cdk/layout';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, HostBinding, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { onSideNavChange, AutoHideSidenavAdjust } from '../animation';
import { Client } from '../client/Client.interface';
import { ClientService } from '../client/client.service';
import { StakeholderService } from '../stakeholders/stakeholder.service';
import { SubmissionPostTemplate, SubmissionPutTemplate } from '../submission/ISubmission.interface';
import { SubmissionService } from '../submission/service/submission-service.service';
import { TableInfoService } from '../table-info/table-info.service';
import { UserPermissions, MenuPermissions, getMenuPermissions } from '../userPermissions/user-permissions'
import { IStakeholders } from '../stakeholders/IStakeholders.interface';

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

  submissionPutTeste: SubmissionPutTemplate = {
    "submissionType": "DigitalFirstHalf",
    "processNumber": "dOBUs+DgWEaiJVbKZi1c5A==",
    "processKind": "MerchantOnboarding",
    "processType": "Standard",
    "isClientAwaiting": true,
    "submissionUser": {
      "user": "joao.silvestre",
      "employer": "SIBS"
    },
    "isComplete": true,
    "id": "1a1e127a-ef25-49a1-a0c6-4e99b3c4c949",
    "bank": "0800"
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
    "phone": {
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
          "expirationDate": ""
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
    "phone": {
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
          "expirationDate": ""
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

  userType: string = "Banca";
  userPermissions: MenuPermissions;

  constructor(private http: HttpClient, private cookie: CookieService, private router: Router,
    changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, private submissionService: SubmissionService,
    private clientService: ClientService, private stakeholderService: StakeholderService, private tableInfo: TableInfoService  ) {
    this.mobileQuery = media.matchMedia('(max-width: 850px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit(): void {
    this.userPermissions = getMenuPermissions(UserPermissions.DO);
    console.log("teste api");
    this.submissionService.InsertSubmission(this.submissionTest).subscribe(d => {
      console.log("inserir");
      console.log(d);
    });
    this.submissionService.GetSubmissionByID("1a1e127a-ef25-49a1-a0c6-4e99b3c4c949").subscribe(d => {
      console.log("get");
      console.log(d);
    });
    this.submissionService.EditSubmission("1a1e127a-ef25-49a1-a0c6-4e99b3c4c949", this.submissionPutTeste).subscribe(d => {
      console.log("put");
      console.log(d);
    });
    //"QopQjSdjF0eBRW%2BljDFdtA%3D%3D"
    this.submissionService.GetSubmissionByProcessNumber("dOBUs+DgWEaiJVbKZi1c5A==").subscribe(d => {
      console.log("get by processNumber");
      console.log(d);
    });
    this.clientService.GetClientById("1a1e127a-ef25-49a1-a0c6-4e99b3c4c949").subscribe(d => {
      console.log("client by id");
      console.log(d);
    });
    this.clientService.EditClient("1a1e127a-ef25-49a1-a0c6-4e99b3c4c949", this.clientEditTest).subscribe(d => {
      console.log("edit client");
      console.log(d);
    });
  //  alert(this.isAutoHide);

    this.stakeholderService.GetAllStakeholdersFromSubmission("1a1e127a-ef25-49a1-a0c6-4e99b3c4c949").subscribe(d => {
      console.log("stakeholders from submission");
      console.log(d);
    });

    this.stakeholderService.GetStakeholderFromSubmission("1a1e127a-ef25-49a1-a0c6-4e99b3c4c949", "232012610").subscribe(d => {
      console.log("one stakeholder from submission");
      console.log(d);
    });

    this.stakeholderService.CreateNewStakeholder("1a1e127a-ef25-49a1-a0c6-4e99b3c4c949", this.stakeholderTeste).subscribe(d => {
      console.log("criar stakeholder para uma submissao");
      console.log(d);
    });

    this.stakeholderService.UpdateStakeholder("1a1e127a-ef25-49a1-a0c6-4e99b3c4c949", "232012610", this.stakeholderPutTeste).subscribe(d => {
      console.log("update stakeholder from submission");
      console.log(d);
    });

    this.stakeholderService.DeleteStakeholder("1a1e127a-ef25-49a1-a0c6-4e99b3c4c949", "232012610").subscribe(d => {
      console.log("delete de um stakeholder");
      console.log(d);
    });

    this.tableInfo.GetAllCAEs().subscribe(d => {
      console.log("get all caes");
      console.log(d);
    });

    this.tableInfo.GetAllCountries().subscribe(d => {
      console.log("get all countries");
      console.log(d);
    });

    this.tableInfo.GetAllLegalNatures().subscribe(d => {
      console.log("get all legal natures");
      console.log(d);
    });

    this.tableInfo.GetAllPEPTypes().subscribe(d => {
      console.log("get all pep types");
      console.log(d);
    });

    this.tableInfo.GetAllPOS().subscribe(d => {
      console.log("get all pos");
      console.log(d);
    });

    this.tableInfo.GetAllProducts().subscribe(d => {
      console.log("get all products");
      console.log(d);
    });

    this.tableInfo.GetAllShopActivities().subscribe(d => {
      console.log("get all shop activities");
      console.log(d);
    });

    this.tableInfo.GetAllStakeholderRoles().subscribe(d => {
      console.log("get all stakeholder roles");
      console.log(d);
    });

    //Corresponde ao ABATE DE AVES (PRODUÇÃO DE CARNE)
    this.tableInfo.GetCAEByCode("10120").subscribe(d => {
      console.log("get cae by code");
      console.log(d);
    });

    this.tableInfo.GetCountryById("PT").subscribe(d => {
      console.log("get country by code");
      console.log(d);
    });
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
