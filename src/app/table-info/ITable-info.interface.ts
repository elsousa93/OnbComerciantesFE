export interface ITableInfo {
}

export interface RequestResponse {
  result?: any,
  error?: {
    code?: string,
    message?: string
  }
}

export interface TreatedResponse<E> {
  result?: E,
  msg?: string
}

export interface Activity {
  code?: string
  description?: string
  subActivities?: SubActivity[]
}

export interface EconomicActivityInformation {
  code: string
  description: string
}

export interface CountryInformation {
  code?: string
  description?: string
  internationalCallingCode?: string
  continent?: string
}

export interface LegalNature {
  code: string
  description: string
  mandatoryDocuments: string
  isCommercialCompany: boolean
  secondaryNatures: SecondLegalNature[]
}
export interface SecondLegalNature {
  code: string
  description: string
}
export interface PEPTypes {
  code: string
  description: string
}
export interface Kinship {
  code: string
  description: string
}

export interface DocTypes {
  code: string
  description: string
}

export interface CorporateRelations {
  code: string
  description: string
}

export interface Franchise {
  code: string
  description: string
}

export interface POS {
  communicationTypes: POSTemplate[]
  pointsOfSaleTypes: string[]
  pointOfSaleProperties: POSTemplate[]
}

export interface POSTemplate {
  tenent: string
  code: number
}

export interface Product {
  productCode: string
  productDescription: string
  subProducts: SubProduct[]
}

export interface SubProduct {
  subProductCode: string
  subProductDescription: string
  fullCode: string
}

export interface ShopActivity {
  activityCode: string
  activityDescription: string
  subActivities: SubActivity[]
}

export interface SubActivity {
  subActivityCode: string
  subActivityDescription: string
}

export interface StakeholderRole {
  code?: string
  description?: string
  relationshipCode?: string
}

export interface Address {
  address: string
  postalCode: string
  postalArea: string
  country: string
}

export interface ShoppingCenter {
  lowerPostalCode?: string
  postPostalCode?: string
  code?: string
  description?: string
}

export interface DocumentSearchType {
  code?: string
  description?: string
}

export interface TenantCommunication {
  tenant?: string
  code?: number
  description?: string
}

export interface TenantTerminal {
  tenant?: string
  code?: number
  description?: string
}

export interface ContractPackLanguage {
  code?: string
  description?: string
}

export interface DigitalSignature {
  type: string
  code: string
  description: string
}

export interface RepresentationPowers {
  code: string
  description: string
}

export enum UserTypes {
  MERCHANT = "Merchant",
  STAKEHOLDER = "Stakeholder"
}
