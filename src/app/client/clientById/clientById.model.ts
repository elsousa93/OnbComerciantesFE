import { Component, EventEmitter, Output } from "@angular/core";
import { FormControlStatus, FormGroup, FormGroupDirective } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Behavior } from "popper.js";
import { BehaviorSubject, Observable } from "rxjs";
import { FileAndDetailsCC } from "src/app/readcard/fileAndDetailsCC.interface";
import { StakeholdersProcess } from "src/app/stakeholders/IStakeholders.interface";
import { ProcessNumberService } from "../../nav-menu-presencial/process-number.service";
import { ProcessService } from "../../process/process.service";
import { StakeholderService } from "../../stakeholders/stakeholder.service";
import { ShopDetailsAcquiring } from "../../store/IStore.interface";
import { StoreService } from "../../store/store.service";
import { SubmissionDocumentService } from "../../submission/document/submission-document.service";
import { SubmissionPostDocumentTemplate, SubmissionPostTemplate } from "../../submission/ISubmission.interface";
import { SubmissionService } from "../../submission/service/submission-service.service";
import { ClientService } from "../client.service";

export class ClientContext{
    tipologia: string;
    clientExists: boolean;
    comprovativoCC: FileAndDetailsCC;
    //NIFNIPC: string;
    clientId: string;
    dataCC: any;
    crc?: any;
  processId?: string
  isClient: boolean;

  submissionID: string;

    
  stakeholdersToInsert: BehaviorSubject<StakeholdersProcess[]>;
  currentStakeholdersToInsert: Observable<any>;

  merchantInfo: BehaviorSubject<any>;
  currentMerchantInfo: Observable<any>;

  client: BehaviorSubject<any>;
  currentClient: Observable<any>;

  NIFNIPC: BehaviorSubject<any>;
  currentNIFNIPC: Observable<any>;

  documents: BehaviorSubject<SubmissionPostDocumentTemplate[]>;
  currentDocuments: Observable<any>;

  newSubmission: SubmissionPostTemplate = {
    "submissionType": "DigitalComplete",
    "processKind": "MerchantOnboarding",
    "processType": "Standard",
    "isClientAwaiting": true,
    "submissionUser": {
      "user": "teste",
      "branch": "branch01",
      "partner": "SIBS"
    },
    "startedAt": new Date().toISOString(),
    "state": "Incomplete",
    "bank": "0800", //no futuro e para usar o token
    "merchant": null,
    //"merchant": {
    //  "fiscalId": "585597856",
    //  "legalName": "BATATA FRITA CIA LTDA",
    //  "shortName": "BATATA FRITA LTDA",
    //  "headquartersAddress": {
    //    "address": "Rua gusta 3",
    //    "postalCode": "2454-298",
    //    "postalArea": "Aldeia Vegetariana",
    //    "country": "PT"
    //  },
    //  "merchantType": "Corporate", //ou Entrepreneur -> ENI
    //  "commercialName": "BATATAS FRITAS",
    //  "legalNature": "35",
    //  "crc": {
    //    "code": "0000-0000-0001",
    //    "validUntil": "2022-07-13T11:10:13.420Z"
    //  },
    //  "shareCapital": {
    //    "capital": 50000.2,
    //    "date": "2022-07-13T11:10:13.420Z"
    //  },
    //  "byLaws": "O Joao pode assinar tudo, like a boss",
    //  "mainEconomicActivity": "90010",
    //  "otherEconomicActivities": [
    //    "055111"
    //  ],
    //  "establishmentDate": "2022-07-13T11:10:13.420Z",
    //  "businessGroup": {
    //    "type": "Isolated",
    //    "branch": "branch01"
    //  },
    //  "knowYourSales": {
    //    "estimatedAnualRevenue": 45892255.0,
    //    "averageTransactions": 46895,
    //    "servicesOrProductsSold": [

    //    ],
    //    "servicesOrProductsDestinations": [

    //    ]
    //  },
    //  "bankInformation": {
    //    "bank": "0033",
    //    "iban": "PT00333506518874499677629"
    //  },
    //  "contacts": {
    //    "email": "joao@silvestre.pt",
    //    "phone1": {
    //      "countryCode": "+351",
    //      "phoneNumber": "919654422"
    //    },
    //    "phone2": {
    //      "countryCode": "+351",
    //      "phoneNumber": "919654421"
    //    }
    //  },
    //  "documentationDeliveryMethod": "",
    //  "billingEmail": "joao@silvestre.pt"
    //},
    "stakeholders": [],
    "documents": []
  };


  //Client predefinido
  clientOutbound = {
  "merchantId": null,
  "legalName": null,
  "commercialName": null,
  "shortName": null,
  "headquartersAddress": {},
  //"headquartersAddress": {
  //  "address": "",
  //  "postalCode": "",
  //  "postalArea": "",
  //  "country": ""
  //},
  "context": null,
  "contextId": null,
  "fiscalIdentification": {},
  "merchantType": "corporation",
  "legalNature": null,
  "legalNature2": null,
  "incorporationStatement": {},
  "incorporationDate": null,
  "shareCapital": null,
  "bylaws": null,
  "principalTaxCode": null,
  "otherTaxCodes": [],
  "principalEconomicActivity": null,
  "otherEconomicActivities": [],
  "sales": {
    "annualEstimatedRevenue": null,
    "productsOrServicesSold": [],
    "productsOrServicesCountries": [],
    "transactionsAverage": null
  },
  "documentationDeliveryMethod": null,
  "bankingInformation": {},
  "merchantRegistrationId": null,
  "contacts": {},
  "billingEmail": null,
  "documents": []
};

  constructor(tipologia: string, clientExists: boolean, comprovativoCC: FileAndDetailsCC, NIFNIPC: string, clientId: string, dataCC: any, isClient: boolean) {
    this.dataCC = dataCC;
        this.tipologia = tipologia;
        this.clientExists = clientExists;
        this.comprovativoCC = comprovativoCC;
        this.NIFNIPC = new BehaviorSubject(NIFNIPC);
    this.clientId = clientId;
    this.isClient = isClient;
      

      this.client = new BehaviorSubject(this.clientOutbound);
      this.merchantInfo = new BehaviorSubject(null);

      this.currentClient = this.client.asObservable();
      this.currentMerchantInfo = this.merchantInfo.asObservable();
    this.currentNIFNIPC = this.NIFNIPC.asObservable();

    this.stakeholdersToInsert = new BehaviorSubject([]);
    this.currentStakeholdersToInsert = this.stakeholdersToInsert.asObservable();

    this.documents = new BehaviorSubject([]);
    this.currentDocuments = this.documents.asObservable();
  }



  isValidForCountries(): boolean{
    return true;
        //return this.client.;
    }

    isValidForCharacterization(): boolean {
        return true;
  }

  getClient() {
    return this.client.getValue();
  }

  setClient(client) {
    this.client.next(client);
  }

  getMerchantInfo() {
    return this.merchantInfo.getValue();
  }

  setMerchantInfo(merchantInfo) {
    this.merchantInfo.next(merchantInfo);
  }

  getNIFNIPC() {
    return this.NIFNIPC.getValue();
  }

  setNIFNIPC(NIFNIPC) {
    this.NIFNIPC.next(NIFNIPC);
  }

  getStakeholdersToInsert() {
    return this.stakeholdersToInsert.getValue();
  }

  setStakeholdersToInsert(stakeholdersToInsert) {
    this.stakeholdersToInsert.next(stakeholdersToInsert);
  }

  getDocuments() {
    return this.documents;
  }

  setDocuments(documents) {
    this.documents.next(documents);
  }

  getIsClient() {
    return this.isClient;
  }

  setIsClient(isClient) {
    this.isClient = isClient;
  }

  

}
