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
