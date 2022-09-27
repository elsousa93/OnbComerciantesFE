import { EventEmitter, Output } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { FileAndDetailsCC } from "src/app/readcard/fileAndDetailsCC.interface";
import { StakeholdersProcess } from "src/app/stakeholders/IStakeholders.interface";

export class ClientContext{
    tipologia: string;
    clientExists: boolean;
    comprovativoCC: FileAndDetailsCC;
    //NIFNIPC: string;
    clientId: string;
    dataCC: string;
    crc?: any;
    processId?: string;

    
  stakeholdersToInsert?: StakeholdersProcess[];

  merchantInfo: BehaviorSubject<any>;
  currentMerchantInfo: Observable<any>;

  client: BehaviorSubject<any>;
  currentClient: Observable<any>;

  NIFNIPC: BehaviorSubject<any>;
  currentNIFNIPC: Observable<any>;


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

    constructor(tipologia: string, clientExists: boolean, comprovativoCC: FileAndDetailsCC, NIFNIPC: string, clientId: string, dataCC: string){
        this.tipologia = tipologia;
        this.clientExists = clientExists;
        this.comprovativoCC = comprovativoCC;
        this.NIFNIPC = new BehaviorSubject(NIFNIPC);
      this.clientId = clientId;

      

      this.client = new BehaviorSubject(this.clientOutbound);
      this.merchantInfo = new BehaviorSubject(null);

      this.currentClient = this.client.asObservable();
      this.currentMerchantInfo = this.merchantInfo.asObservable();
      this.currentNIFNIPC = this.NIFNIPC.asObservable();
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


}
