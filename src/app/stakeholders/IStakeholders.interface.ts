import { Address, IPep } from "../pep/IPep.interface"

export interface IStakeholders {
  fiscalId: string
  identificationDocument: IdentificationDocument
  fullName: string
  contactName: string
  shortName: string
  address: Address
  fiscalAddress: Address
  foreignFiscalInformation: ForeignFiscalInformation
  isProxy: boolean
  phone: Phone
  email: Email
  birthDate: string
  pep: IPep
}

export interface IdentificationDocument {
  identificationDocumentType: string
  identificationDocumentNumber: string
  identificationDocumentCountry: Country
  identificationDocumentExpirationDate: string
}

export interface FiscalAddress {
  address: string
  postalCode: string
  postalArea: string
  country: string
}

export interface ForeignFiscalInformation {
  issuerCountry: Country
  issuanceIndicator: string
  fiscalId: string
  issuanceReason: string
}

export interface Phone {
  countryCode: Country
  phoneNumber: string
}

export interface Country {
  code: string
}

export interface Email {
  value: string
}

