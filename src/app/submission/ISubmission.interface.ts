import * as internal from "stream"
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
  submissionType: string
  processNumber: string
  processKind: string
  processType: string
  isClientAwaiting: boolean
  submissionUser: SubmissionUser
  isComplete: boolean
  bank: string
  merchant: Client
  stakeholders: IStakeholders[]
  documents: Document[]
}

export interface SubmissionPostResponse {
  id: string
  state: string
  bank: string
  merchant: Client
  stakeholders: IStakeholders[]
  documents: Document[]
  submissionType: string
  processNumber: string
  processKind: string
  processType: string
  isClientAwaiting: boolean
  submissionUser: SubmissionUser
  isComplete: boolean
}

export interface SubmissionPutTemplate {
  id: string
  submissionType: string
  processNumber: string
  processKind: string
  processType: string
  isClientAwaiting: boolean
  submissionUser: SubmissionUser
  isComplete: boolean
  bank: string
}

export interface SubmissionGetTemplate {
  merchant: Client
  processKind: string
  processNumber: string
  processType: string
  submissionId: string
  submissionType: string
  contractNumber: number
  requestDate: string
  state?: string
  stakeholders: IStakeholders[]
  documents: Document[]
}

interface SubmissionUser {
  user: string
  employer: string
}

export interface Merchant {
  fiscalId: string
  name: string
}
