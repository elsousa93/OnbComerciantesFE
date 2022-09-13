export interface ICommercialOffer {
  id: number;
  solutionType: string;
  configID: string;
  numberOfTerminals: number;
  brands: {
    fieldName: string,
    selected: boolean,
    editable: boolean
  }[],
  packages: {
    fieldName: string,
    selected: boolean,
    editable: boolean
  }[],
  additionalInfo: {
    fieldName: string,
    selected: boolean,
    editable: boolean
  }[],
  terminalType: string;
  communicationType: string;
};

export interface Product {
  productCode?: string
  productDescription?: string
  subProducts?: Subproduct[]
}

export interface Subproduct{
  subProductCode?: string
  subProductDescription?: string
  fullCode: string
}

export interface ProductPackFilter {
  productCode?: string
  subproductCode?: string
  merchant?: MerchantCatalog
  store?: StoreCatalog
}

export interface MerchantCatalog {
  fiscalIdentification?: FiscalIdentification
  context?: MerchantContextEnum
}

interface StoreCatalog {
  activity?: string
  subActivity?: string
  supportBank?: string
  referenceStore?: string
  supportEntity?: TerminalSupportEntityEnum
}

interface FiscalIdentification {
  fiscalId?: string
  issuerCountry?: string
}

export interface ProductPackEntry {
  id?: string
  description?: string
}

export interface ProductPack {
  groups?: ProductPackRootAttributeProductPackKind[]
}

export interface ProductPackRootAttributeProductPackKind {
  id?: string
  description?: string
  kind?: string //  ProductPackKindEnum
  attributes?: ProductPackRootAttribute[]
}

interface ProductPackRootAttribute {
  id?: string
  description?: string
  value?: boolean
  isReadOnly?: boolean
  isVisible?: boolean
  isSelected?: boolean
 // aggregatorId?: string
  order?: number
  bundles?: ProductPackAttributeProductPackKind[]
}

interface ProductPackAttributeProductPackKind{
  id?: string
  description?: string
  kind?: ProductPackKindEnum
  attributes?: ProductPackAttribute[]
}

export interface ProductPackAttribute {
  id?: string
  description?: string
  value?: boolean
  isReadOnly?: boolean
  isVisible?: boolean
  isSelected?: boolean
  aggregatorId?: string
  order?: number
}

export interface ProductPackPricingFilter {
  productCode?: string
  subproductCode?: string
  merchant?: MerchantCatalog
  store?: StoreCatalog

  packAttributes?: ProductPackRootAttributeProductPackKind[]
}

export interface ProductPackPricingEntry {
  id?: string
  description?: string
}

export interface ProductPackPricing {
  attributes?: ProductPackPricingAttribute[]
}

export interface ProductPackPricingAttribute {
  id?: string
  description?: string
  value?: number
  isReadOnly?: boolean
  isVisible?: boolean
}

export interface ProductPackCommissionFilter {
  productCode?: string
  subproductCode?: string
  merchant?: MerchantCatalog
  store?: StoreCatalog
  packAttributes?: ProductPackRootAttributeProductPackKind[]
}

export interface ProductPackCommissionEntry {
  id?: string
  description?: string
}

export interface ProductPackCommission {
  attributes?: ProductPackCommissionAttribute[]
}

export interface ProductPackCommissionAttribute {
  id?: string
  description?: string
  fixedValue?: ProductPackCommissionAttributeValue
  maxValue?: ProductPackCommissionAttributeValue
  minValue?: ProductPackCommissionAttributeValue
  percentageValue?: ProductPackCommissionAttributeValue
}

interface ProductPackCommissionAttributeValue {
  value?: number
  isReadOnly?: boolean
  isVisible?: boolean
}

export enum MerchantContextEnum {
  ISOLATED = "isolated",
  HOLDING = "holding",
  FRANCHISE = "franchise"
}

export enum TerminalSupportEntityEnum {
  OTHER = "other",
  ACQUIRER = "acquirer"
}

export enum ProductPackKindEnum {
  SIMPLE = "simple",
  ADVANCED = "advanced"
}

export enum EquipmentOwnershipTypeEnum {
  UNKNOWN = "unknown",
  CLIENT = "client",
  ACQUIRER = "acquirer"
}

export enum CommunicationOwnershipTypeEnum {
  UNKNOWN = "unknown",
  CLIENT = "client",
  ACQUIRER = "acquirer"
}