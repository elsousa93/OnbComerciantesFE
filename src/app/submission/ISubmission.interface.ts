import { Client } from "../client/Client.interface"
import { IStakeholders } from "../stakeholders/IStakeholders.interface"


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
  merchant?: Client
  stakeholders?: IStakeholders[]
  documents?: Document[],
  startedAt?: string
}

export interface SubmissionPostResponse {
  id?: string
  state?: string
  bank?: string
  merchant?: Client
  stakeholders?: IStakeholders[]
  documents?: Document[]
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
  isComplete?: boolean
  id?: string
  bank?: string
}

export interface SubmissionGetTemplate {
  id?: string
  state?: string
  bank?: string
  merchant?: SimplifiedReference
  stakeholders?: SimplifiedReference[]
  documents?: Document[]
  submissionType?: string
  processNumber?: string
  processKind?: string
  processType?: string
  isClientAwaiting?: boolean
  submissionUser?: SubmissionUser
  isComplete?: boolean
  
}

interface SimplifiedReference {
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

interface Document {
  documentType: string
  documentPurpose: string
  file: DocumentFile
  validUntil: string
  data: string
}

interface DocumentFile{
  fileType: string
  binary: string
}
