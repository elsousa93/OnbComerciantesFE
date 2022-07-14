import { Address, IPep } from "../pep/IPep.interface"

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
  phone?: Phone
  email?: string
  birthDate?: string
  pep?: IPep
  id?: string
  stakeholderId?: string
}

export interface IdentificationDocument {
  type: string
  number: string
  country: string
  expirationDate: string
}

export interface FiscalAddress {
  address: string
  postalCode: string
  postalArea: string
  country: string
}

export interface ForeignFiscalInformation {
  issuerCountry: string
  issuanceIndicator: string
  fiscalId: string
  issuanceReason: string
}

export interface Phone {
  countryCode: string
  phoneNumber: string
}

export interface Country {
  code: string
}

export interface Email {
  value: string
}

