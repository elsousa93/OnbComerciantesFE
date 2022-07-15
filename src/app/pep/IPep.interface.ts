import { Country, IdentificationDocument } from "../stakeholders/IStakeholders.interface";

export interface IPep {
  isPep: boolean
  hasFamilyRelationship: boolean
  familyRelationshipKind: number
  hasBusinessRelationship: boolean
  businessRelationshipKind: number
  relatedPep: RelatedPep
  pepDetails: PepDetails
}

export interface PepDetails {
  fiscalId: string
  identificationDocument: IdentificationDocument
  fullName: string
  contactName: string
  shortName: string
  fiscalAddress: Address
  kind: string
  sinceWhen: string
  country: string
}

export interface Address {
  address?: string
  postalCode?: string
  postalArea?: string
  locality?: string
  country?: string
}

export interface RelatedPep {
  id: string
  url: string
}
