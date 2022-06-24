import { IStakeholders } from "../stakeholders/IStakeholders.interface"

export interface Process {
  merchant: {
    fiscalId: string,
    name: string
  },
  processKind: string,
  processNumber: number,
  processType: string,
  submissionId: string,
  submissionType: string,
  contractNumber: number,
  requestDate: Date,
  state: string,
  stakeholders: String[]
  documents: String[]
}
