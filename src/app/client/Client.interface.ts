export interface Client {
  id?: String,
  fiscalId?: String,
  companyName?: String,
  commercialName?: String,
  shortName?: String,
  headquartersAddress?: HeadquartersAddress,
  merchantType?: String,
  legalNature?: String,
  legalNature2?: String,
  crc?: Crc,
  shareCapital?: ShareCapital,
  byLaws?: String,
  mainEconomicActivity?: String,
  otherEconomicActivities?: String[],
  mainOfficeAddress?: MainOfficeAddress,
  establishmentDate?: String,
  bankInformation?: BankInformation,
  contacts?: Contacts,
  documentationDeliveryMethod?: String,
  billingEmail?: String,
  knowYourSales?: Sales,
  foreignFiscalInformation?: ForeignFiscalInformation,
  businessGroup?: BusinessGroup,
  clientId?: String,
  legalName?: String
}

export interface HeadquartersAddress {
  address?: String,
  postalCode?: String,
  postalArea?: String,
  locality?: String,
  country?: String,
}

export interface Crc {
  code?: String,
  validUntil?: String,
}

export interface ShareCapital {
  capital?: Number,
  date?: String,
}

export interface MainEconomicActivity {
  code: String,
  branch: String,
}

export interface OtherEconomicActivity {
  code: String,
  branch: String,
}

export interface MainOfficeAddress {
  address?: String,
  postalCode?: String,
  postalArea?: String,
  country?: String,
  locality?: String
}

export interface BusinessGroup {
  type?: String,
  fiscalId?: String,
}

export interface Sales {
  estimatedAnualRevenue?: Number,
  averageTransactions?: Number,
  servicesOrProductsSold?: String[],
  servicesOrProductsDestinations?: String[],
}

export interface ForeignFiscalInformation {
  issuerCountry?: String,
  issuanceIndicator?: String,
  fiscalId?: String,
  issuanceReason?: String,
}

export interface BankInformation {
  bank?: String,
  branch?: String,
  iban?: String,
  accountOpenedAt?: String,
}

export interface Contacts {
  preferredMethod?: String,
  preferredPeriod?: PreferredPeriod,
  phone1?: Phone1,
  phone2?: Phone2,
  fax?: Fax,
  email?: String,
}

export interface PreferredPeriod {
  startsAt: String,
  endsAt: String,
}

export interface Phone1 {
  countryCode: String,
  phoneNumber: String,
}

export interface Phone2 {
  countryCode: String,
  phoneNumber: String,
}

export interface Fax {
  countryCode: String,
  phoneNumber: String,
}
