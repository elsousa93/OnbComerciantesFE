import { AcquiringClientPost, Client } from "../client/Client.interface"
import { IStakeholders, OutboundDocument } from "../stakeholders/IStakeholders.interface"
import { SimplifiedDocument } from "./document/ISubmission-document"
export interface ISubmission {
  processNumber: string
  submissionId: string
  submissionType: string
  state: string
  processKind: string
  processType: string
  merchant: Merchant
}

export interface SubmissionPostTemplate {
  submissionType?: string
  processNumber?: string
  state?: string
  processKind?: string
  processType?: string
  isClientAwaiting?: boolean
  submissionUser?: SubmissionUser
  isComplete?: boolean
  bank?: string
  merchant?: AcquiringClientPost
  stakeholders?: IStakeholders[]
  documents?: SubmissionPostDocumentTemplate[],
  startedAt?: string
}
export interface SubmissionPostDocumentTemplate {
  documentType?: string
  documentPurpose?: string
  file?: File
  validUntil?: string
  data?: string
}

export interface File {
  fileType?: string,
  binary?: string
}

export interface SubmissionPostResponse {
  id?: string
  state?: string
  bank?: string
  merchant?: Client
  stakeholders?: IStakeholders[]
  documents?: OutboundDocument[]
  submissionType?: string
  processNumber?: string
  processKind?: string
  processType?: string
  isClientAwaiting?: boolean
  submissionUser?: SubmissionUser
  isComplete?: boolean,
}
export interface SubmissionPutTemplate {
  submissionType?: string
  processNumber?: string
  processKind?: string
  processType?: string
  isClientAwaiting?: boolean
  submissionUser?: SubmissionUser
  id?: string
  bank?: string
  startedAt?: string
  state?: string
}
export interface SubmissionGetTemplate {
  id?: string
  state?: string
  bank?: string
  merchant?: SimplifiedReference
  stakeholders?: SimplifiedReference[]
  documents?: SimplifiedDocument[]
  shops?: SimplifiedReference[]
  submissionType?: string
  processNumber?: string
  processKind?: string
  processType?: string
  isClientAwaiting?: boolean
  submissionUser?: SubmissionUser
  isComplete?: boolean
}
export interface SimplifiedReference {
  id?: string
  href?: string
}
interface SubmissionUser {
  user?: string
  branch?: string
  partner?: string
}
export interface Merchant {
  fiscalId: string
  name: string
}
export interface Document {
  documentType?: string
  purpose?: string
  uniqueReference?: string
  validUntil?: string
  receivedAt?: string
  archiveSource?: string
}
interface DocumentFile {
  fileType?: string
  binary?: string
}
export interface SubmissionGet {
  processNumber: string
  submissionId: string
  submissionType: string
  state: string
  processKind: string
  processType: string
  merchant: Merchant
}
