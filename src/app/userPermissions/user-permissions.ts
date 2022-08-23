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

export enum UserPermissions {
  BANCA = "BANCA",
  UNICRE = "UNICRE",
  CALLCENTER = "CALLCENTER",
  DO = "DO",
  COMPLIANCEOFFICE = "COMPLIANCEOFFICE",
  COMERCIAL = "COMERCIAL",
  ADMIN = "ADMIN"
}

export function getMenuPermissions(user: any) {
  var permissions: MenuPermissions;
  switch (user) {
    case UserPermissions.BANCA:
      permissions = { HomePage: true, ProcessOpening: true, Consultation: true, ProcessHandling: null };
      return permissions;
    case UserPermissions.UNICRE:
      permissions = { HomePage: true, ProcessOpening: true, Consultation: true, ProcessHandling: { EligibilityOpinions: true } }
      return permissions;
    case UserPermissions.CALLCENTER:
      permissions = { HomePage: true, ProcessOpening: true, Consultation: true, ProcessHandling: { EligibilityOpinions: true } }
      return permissions;
    case UserPermissions.DO:
      permissions = {
        HomePage: true, Consultation: true, ProcessHandling: { MultipleClientes: true, DOValidation: true, NegotiationAproval: true, MCCTreatment: true, EnrollmentValidation: true }
      };
      return permissions;
    case UserPermissions.COMPLIANCEOFFICE:
      permissions = { HomePage: true, Consultation: true, ProcessHandling: { RiskOpinion: true, ComplianceDoubts: true } };
      return permissions;
    case UserPermissions.COMERCIAL:
      permissions = { HomePage: true, Consultation: true, ProcessHandling: { EligibilityOpinions: true } };
      return permissions;
    case UserPermissions.ADMIN:
      permissions = {
        HomePage: true, ProcessOpening: true, Consultation: true, ProcessHandling: { EligibilityOpinions: true, MultipleClientes: true, DOValidation: true, NegotiationAproval: true, MCCTreatment: true, EnrollmentValidation: true, RiskOpinion: true, ComplianceDoubts: true }
      };
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
]
