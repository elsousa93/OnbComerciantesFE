
export interface ISubmission {
      processNumber: string
      submissionId: string
      submissionType: string
      state: string
      processKind: string
      processType: string
      merchant: Merchant
}

export interface Merchant {
  fiscalId: string
  name: string
}
