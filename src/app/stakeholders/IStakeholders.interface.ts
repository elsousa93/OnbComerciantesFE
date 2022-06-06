export interface IStakeholders {
  fiscalId: number
  identificationDocument: IdentificationDocument
  fullName: string
  contactName: string
  shortName: string
  fiscalAddress: FiscalAddress
  foreignFiscalInformation: ForeignFiscalInformation
  isProxy: boolean
  phone: Phone
  email: string
  birthDate: string
  pep: Pep
}

export interface IdentificationDocument {
  identificationDocumentType: string
  identificationDocumentId: string
  identificationDocumentCountry: string
  identificationDocumentValidUntil: string
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

export interface Pep {
  isPep: boolean
  pepDetails: PepDetails
  hasFamilityRelationship: boolean
  familyRelationshipKind: string
  hasBusinessRelationship: boolean
  businessRelationshipKind: string
  relatedPep: RelatedPep
}

export interface PepDetails {
  kind: string
  country: string
  sinceWhen: string
  name: string
  fiscalId: string
  identificationDocumentType: string
  identificationDocumentId: string
  identificationDocumentValidUntil: string
  address: Address
}

export interface Address {
  address: string
  postalCode: string
  postalArea: string
  country: Country
}

export interface Country {
  value: string
}

export interface RelatedPep {
  id: string
  href: string
}
