import { PostDocument } from "../submission/document/ISubmission-document"

export interface OutboundClient {
  bankingInformation?: BankInformation,
  billingEmail?: string,
  bylaws?: string,
  commercialName?: string,
  contacts?: Contacts,
  context?: string,
  contextId?: string,
  documentationDeliveryMethod?: string,
  documents?: PostDocument[],
  fiscalIdentification?: ForeignFiscalInformation,
  headquartersAddress?: HeadquartersAddress,
  incorporationDate?: string,
  incorporationStatement?: Crc,
  legalName?: string,
  legalNature?: string,
  legalNature2?: string,
  merchantId?: string,
  merchantRegistrationId?: string,
  merchantType?: string, //mudar para ENUM
  otherEconomicActivities?: string[],
  otherTaxCodes?: string[],
  principalEconomicActivity?: string,
  principalTaxCode?: string,
  sales?: SalesOutbound,
  shareCapital?: ShareCapital,
  shortName?: string
}
/** Interface Client
* documentationDeliveryMethod: see docType.ts for the codes
**/

export interface AcquiringClientPost {
  clientId?: string,
  fiscalId?: string,
  legalName?: string,
  shortName?: string,
  headquartersAddress?: HeadquartersAddress,
  merchantType?: string,
  commercialName?: string,
  legalNature?: string,
  legalNature2?: string,
  incorporationStatement?: Crc,
  shareCapital?: ShareCapital,
  byLaws?: string,
  mainEconomicActivity?: string,
  otherEconomicActivities?: string[],
  mainTaxCode?: string
  otherTaxCodes?: string[],
  incorporationDate?: string,
  businessGroup?: BusinessGroup,
  knowYourSales?: Sales,
  bankInformation?: BankInformation,
  contacts?: Contacts,
  documentationDeliveryMethod?: string,
  billingEmail?: string,
  merchantRegistrationId?: string
}

export interface Client {
  id?: string,
  merchantId?: string
  fiscalId?: string,
  legalName?: string,
  shortName?: string,
  headquartersAddress?: HeadquartersAddress,
  merchantType?: string,
  commercialName?: string,
  companyName?: string,
  legalNature?: string,
  legalNature2?: string,
  crc?: Crc,
  shareCapital?: ShareCapital,
  byLaws?: string,
  mainEconomicActivity?: string,
  otherEconomicActivities?: string[],
  mainOfficeAddress?: MainOfficeAddress,
  establishmentDate?: string,
  bankInformation?: BankInformation,
  contacts?: Contacts,
  documentationDeliveryMethod?: string,
  billingEmail?: string,
  knowYourSales?: Sales,
  foreignFiscalInformation?: ForeignFiscalInformation,
  businessGroup?: BusinessGroup,
  clientId?: string,
  merchantRegistrationId?: string
}

export interface HeadquartersAddress {
  address?: string,
  postalCode?: string,
  postalArea?: string,
  locality?: string,
  country?: string,
}

export interface Crc {
  code?: string,
  validUntil?: string,
}

export interface ShareCapital {
  capital?: Number,
  date?: string,
}

export interface MainEconomicActivity {
  code: string,
  branch: string,
}

export interface OtherEconomicActivity {
  code: string,
  branch: string,
}

export interface MainOfficeAddress {
  address?: string,
  postalCode?: string,
  postalArea?: string,
  locality?: string,
  country?: string
  
}

export interface BusinessGroup {
  type?: string,
  branch?: string,
}

export interface SalesOutbound {
  annualEstimatedRevenue?: Number,
  transactionsAverage?: Number,
  productsOrServicesSold?: string[],
  productsOrServicesCountries?: string[],
}

export interface Sales {
  estimatedAnualRevenue?: Number,
  averageTransactions?: Number,
  servicesOrProductsSold?: string[],
  servicesOrProductsDestinations?: string[],
}

export interface ForeignFiscalInformation {
  issuerCountry?: string,
  issuanceIndicator?: string,
  fiscalId?: string,
  issuanceReason?: string,
}

export interface BankInformation {
  bank?: string,
  branch?: string,
  iban?: string,
  accountOpenedAt?: string,
}

export interface Contacts {
  preferredMethod?: string,
  preferredPeriod?: PreferredPeriod,
  phone1?: Phone,
  phone2?: Phone,
  fax?: Phone,
  email?: string,
}

export interface PreferredPeriod {
  startsAt: string,
  endsAt: string,
}

export interface Phone {
  countryCode?: string,
  phoneNumber?: string,
}

export interface Phone2 {
  countryCode: string,
  phoneNumber: string,
}

export interface Fax {
  countryCode: string,
  phoneNumber: string,
}
