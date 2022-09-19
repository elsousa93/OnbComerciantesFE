import { Product, Subproduct, ProductPackCommissionAttribute, ProductPackPricingAttribute, ProductPackRootAttributeProductPackKind } from "../commercial-offer/ICommercialOffer.interface";
import { FiscalAddress } from "../stakeholders/IStakeholders.interface";
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
  product?: string,
  subproduct?: string,
  registrationId?: string,
  activity?: string,
  secondaryActivity?: string,
  address?: ShopAddress,
  url?: string,
  contacts?: ShopContacts
  bankingInformation?: ShopBankingInformation
  supportingDocuments?: Document[]
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
  subproductCode?: string
  equipments: ShopEquipment[]
  pack?: ShopProductPack
  product?: Product
  subProduct?: Subproduct 
  documents?: ShopDocuments
}

//Interfaces auxiliares

export interface ShopProductPack {
  packId?: string
  packDetails?: ProductPackRootAttributeProductPackKind[]
  commission?: ShopProductPackCommission
}

interface ShopProductPackCommission {
  comissionId?: string
  attributes?: ProductPackCommissionAttribute
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

interface ShopBankingInformation {
  iban?: string,
  bank?: string
}

interface ShopBank {
  userMerchantBank?: boolean
  bank?: ShopBankingInformation
}

interface ShopDocuments {
  id?: string
  type?: string
  href?: string
}

export interface ShopEquipment {
  shopEquipmentId?: string
  communicationOwnership?: string //CommunicationOwnershipTypeEnum
  equipmentOwnership?: string //EquipmentOwnershipTypeEnum
  communicationType?: string
  equipmentType?: string
  quantity?: number
  pricing?: ShopProductPackPricingViewModel
}

interface ShopProductPackPricingViewModel {
  pricingId?: string
  attributes?: ProductPackPricingAttribute[]
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
