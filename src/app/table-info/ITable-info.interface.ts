export interface ITableInfo {
}

export interface EconomicActivityInformation{
  code: string
  description: string
}

export interface CountryInformation {
  code: string
  description: string
  internationalCallingCode: string
  continent: string
}

export interface LegalNature {
  code: string
  description: string
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
  subActivities: SubActivities[]
}

export interface SubActivities {
  subActivityCode: string
  subActivityDescription: string
}

export interface StakeholderRole {
  code: string
  description: string
}

export interface Address {
  address: string
  postalCode: string
  postalArea: string
  country: string
}
