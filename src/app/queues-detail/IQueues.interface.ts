export interface EligibilityAssessment {
    type: StateResultDiscriminatorEnum,
    userObservations?: string,
    merchantAssessment : MerchantEligibilityAssessment,
    stakeholderAssessment?: StakeholderEligibilityAssessment
}

export interface MerchantEligibilityAssessment {
    stakeholderId?: string,
    accepted: boolean
}

export interface StakeholderEligibilityAssessment {
    stakeholderId?: string,
    accepted: boolean
}

export interface RiskAssessment {
    type: StateResultDiscriminatorEnum,
    userObservations?: string,
    merchantAssessment : MerchantRiskAssessment,
    stakeholderAssessment?: StakeholderRiskAssessment
}

export class RiskAssessmentPost{
    hasRisk: boolean
    riskLevel: number
    hits: Hits
}
export interface Hits {
    code: string,
    value: string
}

export interface Risk {
    code: string,
    value: string
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
    userObservations?:string,
    accepted: boolean
}

export interface StandardIndustryClassificationChoice {
    type: StateResultDiscriminatorEnum,
    userObservations?:string,
    shopsClassification?:ShopClassifications
}

export interface ShopClassifications {
    shopId?:string
    schemaClassifications?: PaymentSchemaClassification
}

export interface PaymentSchemaClassification{
    paymentSchemaId?:string
    classification?:string
}

export enum StateResultDiscriminatorEnum {
    UNDEFINED = "undefined",
    CONTRACT_ACCEPTANCE_MODEL = "contract acceptance model",
    STANDARD_INDUSTRY_CLASSIFICATION_MODEL = "standard industry classification model",
    RISK_ASSESSMENT = "risk assessment",
    ELIGIBILITY_ASSESSMENT = "eligibility assessment"
  }