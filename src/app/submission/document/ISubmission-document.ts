export interface ISubmissionDocument {
  id: string
  documentType: string
  documentPurpose: string
  validUntil: string
  data: string
}

export interface SimplifiedDocument{
  id?: string
  href?: string
  type?: string
}

export interface PostDocument{
  documentType?: string
  documentPurpose?: string
  file?: FileDocument
  validUntil?: string
  data?: any
}

interface FileDocument {
  fileType: string
  binary: string
}
