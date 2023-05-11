import { Phone } from "../client/Client.interface";
import { Product, Subproduct, ProductPackCommissionAttribute, ProductPackPricingAttribute, ProductPackRootAttributeProductPackKind, ProductPackAttributeProductPackKind, TerminalSupportEntityEnum, ProductPackPaymentSchemes, ProductPackAttribute } from "../commercial-offer/ICommercialOffer.interface";
import { FiscalAddress } from "../stakeholders/IStakeholders.interface";
import { Documents } from "../submission/document/ISubmission-document";
import { Document } from "../submission/ISubmission.interface";

export interface Istore {
  id: number;
  nameEstab: string;
  country: string;
  postalCode: string;
  address: string;
  fixedIP: string;
  postalLocality: string;
  emailContact: string;
  cellphoneIndic: string;
  cellphoneNumber: string;
  activityEstab: string;
  subActivityEstab: string;
  zoneEstab: string;
  subZoneEstab: string;
  iban: string;
};

export interface ShopsListOutbound {
  shopId?: string
  name?: string
  activity?: string
  secondaryActivity?: string
  address?: ShopAddress
}

export interface ShopActivities {
  activityCode: string
  activityDescription: string
  subActivities: ShopSubActivities[]
}

export interface ShopSubActivities {
  subActivityCode: string
  subActivityDescription: string
}

export interface ShopDetailsOutbound {
  shopId?: string
  name?: string,
  supportEntity?: TerminalSupportEntityEnum
  registrationId?: string,
  activity?: string,
  secondaryActivity?: string,
  address?: ShopAddress,
  url?: string,
  contacts?: ShopContacts
  bankingInformation?: ShopBankingInformation
  supportingDocuments?: Document[]
  productPack?: ShopProductPack
}

export class ShopDetailsAcquiring {
  shopId?: string
  name?: string
  manager?: string
  activity?: string
  subActivity?: string
  supportEntity?: string
  registrationId?: string
  address?: ShopAddressAcquiring
  bank?: ShopBank
  website?: string
  productCode?: string
  productCodeDescription?: string
  subProductCode?: string
  subProductCodeDescription?: string
  equipments: ShopEquipment[]
  pack?: ShopProductPackViewModel
  product?: Product
  subProduct?: Subproduct
  documents?: Documents[]
  id?: string
  contactPerson?: string
  phone1?: Phone
  phone2?: Phone
  email?: string
  industryClassifications?: IndustryClassifications[]
}

//Interfaces auxiliares

export interface ShopProductPackViewModel {
  packId?: string
  packDescription?: string
  paymentSchemes?: ProductPackAttributeProductPackKind
  otherPackDetails?: ProductPackRootAttributeProductPackKind[]
  equipmentSettings?: ProductPackAttributeProductPackKind[]
  commission?: ShopProductPackCommission
  processorId?: string
}

export interface ShopProductPack {
  product: string
  subproduct: string
  processorId: string
  productPackId: string
  paymentSchemes: ProductPackPaymentSchemes[]
  otherProductPackAttributes: ProductPackAttribute[]
  commissionId: string
  commissionAttributes: ProductPackCommissionAttribute[]
}

interface ShopProductPackCommission {
  commissionId?: string
  attributes?: ProductPackCommissionAttribute[]
}

interface ShopAddress {
  sameAsMerchantAddress?: boolean
  address?: FiscalAddress
  isInsideShoppingCenter?: boolean
  shoppingCenter?: string
}

export class ShopAddressAcquiring {
  useMerchantAddress?: boolean
  address?: FiscalAddress
  isInsideShoppingCenter?: boolean
  shoppingCenter?: string
  shoppingCenterPostalCode?: string
}

interface ShopContacts {
  contactName?: string
  phone1?: ShopPhone
  phone2?: ShopPhone
  email?: string
}

interface ShopPhone {
  country?: string,
  internationalIndicative?: string
  phoneNumber?: string
}

export class ShopBankingInformation {
  iban?: string
  bank?: string
}

export class ShopBank {
  useMerchantBank?: boolean
  bank?: ShopBankingInformation
}

export class Bank {
  code?: string
  description?: string
}

interface ShopDocuments {
  id?: string
  type?: string
  href?: string
}

export class ShopEquipment {
  //estes campos vão ter removidos
  id?: string
  communicationOwnership?: string //CommunicationOwnershipTypeEnum
  equipmentOwnership?: string //EquipmentOwnershipTypeEnum
  communicationType?: string
  equipmentType?: string
  //

  shopEquipmentId?: string
  quantity?: number
  pricing?: ShopProductPackPricingViewModel
  equipmentSettings?: EquipmentSettings[]
  registrationId?: string
}

export interface EquipmentSettings {
  id?: string
  description?: string
  attributes?: EquipmentSettingsAttributes[]
}

interface EquipmentSettingsAttributes {
  id?: string
  description?: string
  value?: string
  isReadOnly?: boolean
  isVisible?: boolean
  isSelected?: boolean
  aggregatorId?: string
  order?: number
}

interface ShopProductPackPricingViewModel {
  id?: string
  attribute?: ProductPackPricingAttribute
}

export interface IndustryClassifications {
  paymentSchemeAttributeId?: string,
  paymentSchemeAttributeDescription?: string,
  subPaymentSchemeAttributeId?: string,
  subPaymentSchemeAttributeDescription?: string,
  industryClassificationCode: string,
  industryClassificationDescription?: string,
  industryClassificationPotentialCodes?: PotentialCodes[]
}

interface PotentialCodes {
  code?: string
  description?: string
}

export enum CommunicationOwnershipTypeEnum {
  UNKNOWN = "unknown",
  CLIENT = "client",
  SELF = "self"
}

export enum EquipmentOwnershipTypeEnum {
  UNKNOWN = "unknown",
  CLIENT = "client",
  SELF = "self"
}
