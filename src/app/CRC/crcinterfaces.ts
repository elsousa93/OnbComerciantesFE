import { HeadquartersAddress, ShareCapital } from "../client/Client.interface";
import { StakeholderRole } from "../table-info/ITable-info.interface";

export interface CRCProcess {
  capitalStock?: ShareCapital
  code?: string
  companyName?: string
  mainEconomicActivity?: string
  secondaryEconomicActivity?: string[]
  expirationDate?: string
  fiscalId?: string
  hasOutstandingFacts?: boolean
  headquartersAddress?: HeadquartersAddress
  legalNature?: string
  pdf?: string
  requestId?: string
  stakeholders?: StakeholderRole[]
}
