import { BehaviorSubject, Observable } from "rxjs";
import { FileAndDetailsCC } from "src/app/readcard/fileAndDetailsCC.interface";
import { StakeholdersProcess } from "src/app/stakeholders/IStakeholders.interface";
import { SubmissionPostDocumentTemplate, SubmissionPostTemplate } from "../../submission/ISubmission.interface";
import { OutboundClient } from "../Client.interface";

export class ClientContext {
  tipologia: string;
  clientExists: boolean;
  comprovativoCC: FileAndDetailsCC;
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
    "submissionType": "DigitalFirstHalf",
    "processKind": "MerchantOnboarding",
    "processType": "Standard",
    "isClientAwaiting": true,
    "submissionUser": {
      "user": "",
      "branch": "",
      "partner": ""
    },
    "startedAt": new Date().toISOString(),
    "state": "Incomplete",
    "bank": "0800", //no futuro e para usar o token
    "merchant": null,
    "stakeholders": [],
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
    this.client = new BehaviorSubject(new OutboundClient);
    this.merchantInfo = new BehaviorSubject(null);
    this.currentClient = this.client.asObservable();
    this.currentMerchantInfo = this.merchantInfo.asObservable();
    this.currentNIFNIPC = this.NIFNIPC.asObservable();
    this.stakeholdersToInsert = new BehaviorSubject([]);
    this.currentStakeholdersToInsert = this.stakeholdersToInsert.asObservable();
    this.documents = new BehaviorSubject([]);
    this.currentDocuments = this.documents.asObservable();
  }

  getClient() {
    return this.client.getValue();
  }

  setClient(client) {
    this.client.next(client);
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
}
