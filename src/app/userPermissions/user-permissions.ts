export interface MenuPermissions {
  HomePage: boolean,
  ProcessOpening: boolean,
  Consultation: boolean,
  ProcessHandling: {
    EligibilityOpinions: boolean,
    MultipleClientes: boolean,
    DOValidation: boolean,
    NegotiationAproval: boolean,
    MCCTreatment: boolean,
    EnrollmentValidation: boolean,
    RiskOpinion: boolean,
    ComplianceDoubts: boolean
  }
}

export enum UserPermissions {
  BANCA,
  UNICRE,
  CALLCENTER,
  DO,
  COMPLIANCEOFFICE,
  COMERCIAL
}
