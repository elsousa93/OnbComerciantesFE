import { IStakeholders } from "src/app/stakeholders/IStakeholders.interface";
import { Istore } from "src/app/store/IStore.interface";
import { Client } from "../Client.interface";

export class infoDeclarativaForm {
  client: Client
  stakeholder: IStakeholders
  store: Istore
}
 
