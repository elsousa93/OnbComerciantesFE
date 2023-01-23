import { HeadquartersAddress, ShareCapital } from "../client/Client.interface";
import { StakeholdersProcess } from "../stakeholders/IStakeholders.interface";
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
  stakeholders?: StakeholdersProcess[]
  byLaws?: string
}
