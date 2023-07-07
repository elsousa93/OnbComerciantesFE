export interface MenuPermissions {
  HomePage?: boolean,
  ProcessOpening?: boolean,
  Consultation?: boolean,
  ProcessHandling: {
    EligibilityOpinions?: boolean,
    MultipleClientes?: boolean,
    DOValidation?: boolean,
    NegotiationAproval?: boolean,
    MCCTreatment?: boolean,
    EnrollmentValidation?: boolean,
    RiskOpinion?: boolean,
    ComplianceDoubts?: boolean
  }
}

export interface FTPermissions {
  pending?: boolean,
  backOffice?: boolean,
  returned?: boolean,
  acceptance?: boolean,
  pendingSent?: boolean,
  pendingEligibility?: boolean,
  multipleClientes?: boolean,
  DOValidation?: boolean,
  negotiationAproval?: boolean,
  MCCTreatment?: boolean,
  validationSIBS?: boolean,
  riskOpinion?: boolean,
  complianceDoubts?: boolean
}

export enum UserPermissions {
  BANCA = "BANCA",
  UNICRE = "UNICRE",
  CALLCENTER = "CALLCENTER",
  DO = "DO",
  COMPLIANCEOFFICE = "COMPLIANCEOFFICE",
  COMERCIAL = "COMERCIAL",
  ADMIN = "ADMIN",
  PROMOTOR = "PROMOTOR"
}

export function getMenuPermissions(user: any) {
  var permissions: MenuPermissions;
  switch (user) {
    case UserPermissions.BANCA:
      permissions = { HomePage: true, ProcessOpening: true, Consultation: true, ProcessHandling: null };
      return permissions;
    case UserPermissions.UNICRE:
      permissions = { HomePage: true, ProcessOpening: true, Consultation: true, ProcessHandling: { EligibilityOpinions: true, NegotiationAproval: true } }
      return permissions;
    case UserPermissions.CALLCENTER:
      permissions = { HomePage: true, Consultation: true, ProcessHandling: null }
      return permissions;
    case UserPermissions.DO:
      permissions = {
        HomePage: true, ProcessOpening: false, Consultation: true, ProcessHandling: { MultipleClientes: true, DOValidation: true, MCCTreatment: true, EnrollmentValidation: true }
      };
      return permissions;
    case UserPermissions.COMPLIANCEOFFICE:
      permissions = { HomePage: true, ProcessOpening: false, Consultation: true, ProcessHandling: { RiskOpinion: true, ComplianceDoubts: true } };
      return permissions;
    case UserPermissions.COMERCIAL:
      permissions = { HomePage: true, ProcessOpening: true, Consultation: true, ProcessHandling: { EligibilityOpinions: true} };
      return permissions;
    case UserPermissions.ADMIN:
      permissions = {
        HomePage: true, ProcessOpening: true, Consultation: true, ProcessHandling: { EligibilityOpinions: true, MultipleClientes: true, DOValidation: true, NegotiationAproval: true, MCCTreatment: true, EnrollmentValidation: true, RiskOpinion: true, ComplianceDoubts: true }
      };
      return permissions;
    case UserPermissions.PROMOTOR:
      permissions = { HomePage: true, ProcessOpening: true, Consultation: true, ProcessHandling: null };
      return permissions;
  }
}

export function getFTPermissions(user: any) {
  var permissions: FTPermissions;

  switch (user) {
    case UserPermissions.BANCA:
      permissions = { pending: true, backOffice: true, returned: true, acceptance: true };
      return permissions;
    case UserPermissions.UNICRE:
      permissions = { pending: true, backOffice: true, returned: true, acceptance: true, pendingEligibility: true, pendingSent: true, negotiationAproval: true }
      return permissions;
    case UserPermissions.CALLCENTER:
      permissions = { pending: true, backOffice: true, returned: true, acceptance: true, pendingSent: true }
      return permissions;
    case UserPermissions.DO:
      permissions = { multipleClientes: true, DOValidation: true, MCCTreatment: true, validationSIBS: true, pendingSent: true };
      return permissions;
    case UserPermissions.COMPLIANCEOFFICE:
      permissions = { riskOpinion: true, complianceDoubts: true };
      return permissions;
    case UserPermissions.COMERCIAL:
      permissions = { pending: true, backOffice: true, returned: true, acceptance: true, pendingSent: true, pendingEligibility: true };
      return permissions;
    case UserPermissions.ADMIN:
      permissions = { pending: true, backOffice: true, returned: true, acceptance: true, pendingEligibility: true, pendingSent: true };
      return permissions;
    case UserPermissions.PROMOTOR:
      permissions = { pending: true, backOffice: true, returned: true, acceptance: true };
      return permissions;
  }
}

export interface role {
  name?: string,
  code?: UserPermissions
}

export const roles = [
  {
    "name": "Banca",
    "code": UserPermissions.BANCA
  },
  {
    "name": "Unicre",
    "code": UserPermissions.UNICRE
  },
  {
    "name": "CallCenter",
    "code": UserPermissions.CALLCENTER
  },
  {
    "name": "DO",
    "code": UserPermissions.DO
  },
  {
    "name": "Compliance Office",
    "code": UserPermissions.COMPLIANCEOFFICE
  },
  {
    "name": "Comercial",
    "code": UserPermissions.COMERCIAL
  },
  {
    "name": "Promotor",
    "code": UserPermissions.PROMOTOR
  }
]
