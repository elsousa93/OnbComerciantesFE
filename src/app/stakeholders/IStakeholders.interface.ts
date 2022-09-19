import { addresstranformed } from "../citizencard/addresstranformed.interface"
import { Contacts } from "../client/Client.interface"
import { Address, IPep } from "../pep/IPep.interface"
import { Document } from "../submission/ISubmission.interface"

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
  foreignFiscalInformation?: ForeignFiscalInformation
  isProxy?: boolean
  phone1?: Phone
  phone2?: Phone
  email?: string
  birthDate?: string
  pep?: IPep
  id?: string
  stakeholderId?: string
}

export interface StakeholderOutbound {
  stakeholderId?: string,
  fullName?: string,
  shortName?: string,
  fiscalIdentification?: ForeignFiscalInformation,
  address?: FiscalAddress,
  contacts?: Contacts,
  identificationDocument?: IdentificationDocument,
  birthDate?: string,
  document?: OutboundDocument[]
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
  receiveAt?: string,
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

export interface ForeignFiscalInformation {
  issuerCountry?: string
  issuanceIndicator?: string
  fiscalId?: string
  issuanceReason?: string
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

