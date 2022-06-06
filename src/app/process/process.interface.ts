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
  state: string 
}
