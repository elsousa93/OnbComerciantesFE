import { Contacts, EligibilityAssessmentViewModel, RiskAssessmentTenantViewModel, RiskAssessmentViewModel } from "../client/Client.interface"
import { Address, IPep } from "../pep/IPep.interface"

export interface StakeholdersProcess {
  fiscalId?: string,
  capitalHeldPercentage?: number,
  isBeneficiary?: boolean,
  name?: string,
  role?: string
}

export interface StakeholdersCompleteInformation {
  stakeholderAcquiring?: IStakeholders,
  stakeholderOutbound?: StakeholderOutbound,
  eligibility?: boolean,
  displayName?: string
}

export interface IStakeholders {
  fiscalId?: string
  identificationDocument?: IdentificationDocument
  fullName?: string
  contactName?: string
  shortName?: string
  //address?: Address
  fiscalAddress?: Address
  isProxy?: boolean
  phone1?: Phone
  phone2?: Phone
  email?: string
  birthDate?: string
  pep?: IPep
  id?: string
  clientId?: string
  stakeholderId?: string
  signType?: string
  identificationState?: string
  signatureState?: string
  riskAssessmentTenant?: RiskAssessmentTenantViewModel
  riskAssessment?: RiskAssessmentViewModel
  eligibilityAssessmentTenant?: string
  eligibilityAssessment?: EligibilityAssessmentViewModel
  representationPower?: RepresentationPower
  potentialClientIds?: string[]
  documents?: DocumentStake[]
}

interface RepresentationPower {
  expirationDate?: string
  representationPowers?: string
  restrictions?: string
}

interface FiscalIdentification {
  fiscalId?: string,
  issuerCountry?: string
}

export interface StakeholderOutbound {
  stakeholderId?: string,
  fullName?: string,
  shortName?: string,
  isBeneficiary?: boolean,
  capitalHeld?: number,
  fiscalIdentification?: FiscalIdentification,
  address?: FiscalAddress,
  contacts?: Contacts,
  identificationDocument?: IdentificationDocument,
  birthDate?: string,
  pep?: IPep,
  supportingDocuments?: OutboundDocument[]
}

export interface IdentificationDocument {
  type?: string
  number?: string
  country?: string
  expirationDate?: string
  checkDigit?: string
}

export interface OutboundDocument {
  purpose?: string,
  documentType?: string,
  receivedAt?: string,
  validUntil?: string,
  uniqueReference?: string,
  archiveSource?: string,
}

export class FiscalAddress {
  address?: string
  postalCode?: string
  postalArea?: string
  country?: string
}
export interface Phone {
  countryCode?: string
  phoneNumber?: string
}

export interface Country {
  code: string
}

export interface Email {
  value: string
}

interface DocumentStake {
  id?: string
  documentType?: string
  validUntil?: string
  data?: string
  purposes?: string[]
}

export interface CorporateEntity {
  clientId?: string
  potentialClientIds?: string[]
  fiscalId?: string
  shortName?: string
  legalName?: string
  headquartersAddress?: FiscalAddress
  id?: string
  documents?: DocumentStake
}

export interface PostCorporateEntity {
  clientId?: string
  potentialClientIds?: string[]
  fiscalId?: string
  shortName?: string
  legalName?: string
  headquartersAddress?: FiscalAddress
}
