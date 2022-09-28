import { Country, IdentificationDocument } from "../stakeholders/IStakeholders.interface";

export interface IPep {
  kind: KindPep
  pepType?: string
  pepCountry?: string
  pepSince: string
  degreeOfRelatedness?: string
  businessPartnership?: string
}
export interface Address {
  address?: string
  postalCode?: string
  postalArea?: string
  locality?: string
  country?: string
}

export enum KindPep {
  PEP = "pep",
  FAMILY = "family",
  BUSINESS = "business"
}
