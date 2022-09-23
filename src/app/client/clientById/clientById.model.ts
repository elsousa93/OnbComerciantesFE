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
    client?: any;
    processId?: string;
    stakeholdersToInsert?: StakeholdersProcess[];
    merchantInfo?: string;

    constructor(tipologia: string, clientExists: boolean, comprovativoCC: FileAndDetailsCC, NIFNIPC: string, clientId: string, dataCC: string, client?: any){
        this.tipologia = tipologia;
        this.clientExists = clientExists;
        this.comprovativoCC = comprovativoCC;
        this.NIFNIPC = NIFNIPC;
        this.clientId = clientId;
        this.dataCC = dataCC;
        this.client = client;
    }

    isValidForCountries() : boolean{
        return this.client;
    }

    isValidForCharacterization(): boolean {
        return true;
    }
}