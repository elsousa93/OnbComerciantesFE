export interface EligibilityAssessment {
    type: StateResultDiscriminatorEnum,
    userObservations?: string,
    merchantAssessment: MerchantEligibilityAssessment,
    stakeholderAssessment?: StakeholderEligibilityAssessment[]
}

export interface MerchantEligibilityAssessment {
    merchantId?: string,
    accepted: boolean
}

export interface StakeholderEligibilityAssessment {
    stakeholderId?: string,
    accepted: boolean
}

export interface RiskAssessment {
    type: StateResultDiscriminatorEnum,
    userObservations?: string,
    merchantAssessment: MerchantRiskAssessment,
    stakeholderAssessment?: StakeholderRiskAssessment[]
}
export interface MerchantRiskAssessment {
    stakeholderId?: string,
    accepted: boolean
}

export interface StakeholderRiskAssessment {
    stakeholderId?: string,
    accepted: boolean
}

export interface ContractAcceptance {
    type: StateResultDiscriminatorEnum,
    userObservations?: string,
    accepted: boolean
}

export interface StandardIndustryClassificationChoice {
    type: StateResultDiscriminatorEnum,
    userObservations?: string,
    shopsClassification?: ShopClassifications
}

export interface ShopClassifications {
    shopId?: string
    schemaClassifications?: PaymentSchemaClassification[]
}

export interface PaymentSchemaClassification {
    paymentSchemaId?: string
    classification?: string
}

export interface ExternalState {
    contractAcceptance?: ContractAcceptance,
    standardIndustryClassificationChoice?: StandardIndustryClassificationChoice,
    eligibilityAssessment?: EligibilityAssessment,
    riskAssessment?: RiskAssessment
}

export interface Hits {
  code?: string
  value?: string
}

export interface PostRisk {
  processNumber?: string,
  hasRisk?: string,
  riskLevel?: number,
  hits?: Hits[],
  complianceEvaluation?: boolean,
  complianceEvaluationOperator?: string,
  complianceEvaluationDate?: string,
  complianceEvaluationObservations?: string
}

export enum State {
    CONTRACT_ACCEPTANCE = "ContractAcceptance",
    STANDARD_INDUSTRY_CLASSIFICATION_CHOICE = "StandardIndustryClassificationChoice",
    RISK_ASSESSMENT = "RiskAssessment",
    ELIGIBILITY_ASSESSMENT = "EligibilityAssessment"
}

export enum StateResultDiscriminatorEnum {
    UNDEFINED = "Undefined",
    CONTRACT_ACCEPTANCE_MODEL = "ContractAcceptanceModel",
    STANDARD_INDUSTRY_CLASSIFICATION_MODEL = "StandardIndustryClassificationModel",
    RISK_ASSESSMENT = "RiskAssessment",
    ELIGIBILITY_ASSESSMENT = "EligibilityAssessment"
}
