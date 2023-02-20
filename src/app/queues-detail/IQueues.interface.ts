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
  accepted?: boolean
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

export interface ClientChoice {
  type?: StateResultDiscriminatorEnum,
  userObservations?: string,
  merchantChoice?: ClientNumberDecision,
  stakeholdersChoice?: ClientNumberDecision[]
}

export interface ClientNumberDecision {
  id?: string,
  decision?: ClientNumberDecisionEnum,
  clientNumber?: string
}

export interface NegotiationApproval {
  type?: StateResultDiscriminatorEnum,
  userObservations?: string,
  decision?: NegotiationApprovalEnum
}

export interface OperationsEvaluation {
  type?: StateResultDiscriminatorEnum,
  userObservations?: string,
  decision?: OperationsEvaluationEnum
}

export interface ExternalState {
  contractAcceptance?: ContractAcceptance,
  standardIndustryClassificationChoice?: StandardIndustryClassificationChoice,
  eligibilityAssessment?: EligibilityAssessment,
  riskAssessment?: RiskAssessment,
  clientChoice?: ClientChoice,
  negotiationApproval?: NegotiationApproval,
  merchantRegistration?: MerchantRegistration,
  operationsEvaluation?: OperationsEvaluation,
  complianceEvaluation?: ComplianceEvaluation
}

export interface MerchantRegistration {
  type?: StateResultDiscriminatorEnum,
  userObservations?: string,
  merchantRegistrationId?: string,
  shops?: ShopRegistration[]
}

export interface ShopRegistration {
  shopId?: string,
  shopRegistrationId?: string,
  equipments?: ShopEquipmentRegistration[]
}

export interface ShopEquipmentRegistration{
  equipmentId?: string,
  equipmentRegistrationId?: string
}

export interface ComplianceEvaluation {
  type?: StateResultDiscriminatorEnum,
  userObservations?: string
}

export interface ReassingWorkQueue {
  jobId?: number,
  forceReassign?: boolean,
  username?: string
}

export interface ProcessStateNotification {
  state?: string,
  endedBy?: string,
  observations?: string
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
  ELIGIBILITY_ASSESSMENT = "EligibilityAssessment",
  CLIENT_CHOICE = "ClientChoice",
  NEGOTIATION_APPROVAL = "NegotiationApproval",
  MERCHANT_REGISTRATION = "MerchantRegistration",
  OPERATIONS_EVALUATION = "OperationsEvaluation",
  COMPLIANCE_EVALUATION = "ComplianceEvaluation"
}

export enum StateResultDiscriminatorEnum {
  UNDEFINED = "Undefined",
  CONTRACT_ACCEPTANCE_MODEL = "ContractAcceptanceModel",
  STANDARD_INDUSTRY_CLASSIFICATION_MODEL = "StandardIndustryClassificationModel",
  RISK_ASSESSMENT = "RiskAssessment",
  ELIGIBILITY_ASSESSMENT = "EligibilityAssessment",
  CLIENT_CHOICE = "ClientChoice",
  NEGOTIATION_APPROVAL = "NegotiationApproval",
  MERCHANT_REGISTRATION = "MerchantRegistration",
  OPERATIONS_EVALUATION = "OperationsEvaluation",
  COMPLIANCE_EVALUATION = "ComplianceEvaluation"
}

export enum ClientNumberDecisionEnum {
  SUCCESS = "Success",
  RETURN_TO_BACKOFFICE = "ReturnToBackOffice",
  RETURN_TO_FRONTOFFICE = "ReturnToFrontOffice"
}

export enum NegotiationApprovalEnum {
  APPROVE = "Approve",
  RETURN_TO_FRONT_OFFICE = "ReturnToFrontOffice"
}

export enum OperationsEvaluationEnum {
  CONTINUE = "Continue",
  RETURN = "Return"
}
