export interface IComprovativos {
  id: Number,
  clientId: String,
  filename: String,
  url: String
}

export interface ComprovativosTemplate {
  id?: string,
  type?: string,
  stakeholder?: string,
  expirationDate?: string,
  uploadDate?: string,
  status?: string,
  file?: File,
  documentPurpose?: string,
  documentType?: string
}

export interface AceitacaoDoc {
  id?: string,
  type?: string,
  date?: string,
  file?: File,
}

export interface RequiredDocuments {
  requiredDocumentPurposesPrivateEntity?: RequiredDocumentPurpose[],
  requiredDocumentPurposesCorporateEntity?: RequiredDocumentPurpose[],
  requiredDocumentPurposesMerchants?: RequiredDocumentPurpose[],
  requiredDocumentPurposesStakeholders?: RequiredDocumentPurpose[],
  requiredDocumentPurposesShops?: RequiredDocumentPurpose[]
}

export interface RequiredDocumentPurpose {
  entityId?: string,
  entityName?: string,
  documentPurposes?: DocumentPurpose[]
}

export interface DocumentPurpose {
  purpose?: string,
  documentState?: string,
  documentsTypeCodeFulfillPurpose?: string[]
}

export interface PurposeDocument {
  code?: string,
  description?: string
}
