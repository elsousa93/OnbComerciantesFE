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
  BANCA,
  UNICRE,
  CALLCENTER,
  DO,
  COMPLIANCEOFFICE,
  COMERCIAL
}

export function getMenuPermissions(user: UserPermissions) {
  var permissions: MenuPermissions;
  switch (user) {
    case UserPermissions.BANCA:
      permissions = { HomePage: true, ProcessOpening: true, Consultation: true, ProcessHandling: null };
      return permissions;
    case UserPermissions.UNICRE || UserPermissions.CALLCENTER:
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
  }
}
