import { IStakeholders } from "../stakeholders/IStakeholders.interface"

export interface Process {
  processNumber: string,
  goal: string,
  startedByUsername: string,
  startedByBranch: string,
  startedByPartner: string,
  startedAt: string
}

//merchant: {
//  fiscalId: string,
//    name: string
//},
//processKind: string,
//  processNumber: number,
//    processType: string,
//      submissionId: string,
//        submissionType: string,
//          contractNumber: number,
//            requestDate: Date,
//              state: string,
//                stakeholders: String[]
//documents: String[]


