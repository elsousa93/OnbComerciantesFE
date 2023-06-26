export interface ISubmissionDocument {
  id: string
  documentType: string
  documentPurpose: string
  validUntil: string
  data: string
}

export interface SimplifiedDocument {
  id?: string
  isAnnulled?: boolean
  href?: string
  type?: string
}

export interface PostDocument {
  documentType?: string
  documentPurpose?: string
  file?: FileDocument
  validUntil?: string
  data?: any
}

interface FileDocument {
  fileType?: string
  binary?: string
}

export interface OutboundDocument {
  purpose?: string,
  documentType?: string,
  receivedAt?: string,
  validUntil?: string,
  uniqueReference?: string,
  archiveSource?: string,
  format?: string
}

export interface Documents {
  id?: string
  documentType?: string,
  validUntil?: string,
  data?: string,
  purposes?: string[]
}
