import { EventEmitter, Output } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { FileAndDetailsCC } from "src/app/readcard/fileAndDetailsCC.interface";
import { StakeholdersProcess } from "src/app/stakeholders/IStakeholders.interface";

export class ClientContext{
    tipologia: string;
    clientExists: boolean;
    comprovativoCC: FileAndDetailsCC;
    NIFNIPC: string;
    clientId: string;
    dataCC: string;
  crc?: any;
  client: BehaviorSubject<any>;

  currentClient: Observable<any>;

    processId?: string;
  stakeholdersToInsert?: StakeholdersProcess[];

  merchantInfo: BehaviorSubject<any>;

  currentMerchantInfo: Observable<any>;


    constructor(tipologia: string, clientExists: boolean, comprovativoCC: FileAndDetailsCC, NIFNIPC: string, clientId: string, dataCC: string, client?: any){
        this.tipologia = tipologia;
        this.clientExists = clientExists;
        this.comprovativoCC = comprovativoCC;
        this.NIFNIPC = NIFNIPC;
      this.clientId = clientId;
      this.client = new BehaviorSubject(client);
      this.merchantInfo = new BehaviorSubject(null);

      this.currentClient = this.client.asObservable();
      this.currentMerchantInfo = this.merchantInfo.asObservable();
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


}
