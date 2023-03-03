export interface EligibilityAssessment {
  $type: StateResultDiscriminatorEnum,
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
  $type: StateResultDiscriminatorEnum,
  userObservations?: string,
  merchantAssessment: MerchantRiskAssessment,
  stakeholderAssessment?: StakeholderRiskAssessment[]
}
export interface MerchantRiskAssessment {
  merchantId?: string,
  accepted: boolean
}

export interface StakeholderRiskAssessment {
  stakeholderId?: string,
  accepted: boolean
}

export interface ContractAcceptance {
  $type: StateResultDiscriminatorEnum,
  userObservations?: string,
  contractAcceptanceResult: ContractAcceptanceEnum
}

export interface StandardIndustryClassificationChoice {
  $type: StateResultDiscriminatorEnum,
  userObservations?: string,
  shopsClassification?: ShopClassifications[]
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
  $type?: StateResultDiscriminatorEnum,
  userObservations?: string,
  merchantChoice?: ClientNumberDecision,
  stakeholdersChoice?: ClientNumberDecision[]
  decision?: ClientChoiceDecisionEnum //Accepted, ReturnToBackOffice, ReturnToFrontOffice
}

export interface ClientNumberDecision {
  id?: string,
  //decision?: ClientNumberDecisionEnum,
  clientNumber?: string
}

export interface NegotiationApproval {
  $type?: StateResultDiscriminatorEnum,
  userObservations?: string,
  decision?: NegotiationApprovalEnum
}

export interface OperationsEvaluation {
  $type?: StateResultDiscriminatorEnum,
  userObservations?: string,
  decision?: OperationsEvaluationEnum
}

export interface ContractDigitalAcceptance {
  $type: StateResultDiscriminatorEnum,
  userObservations?: string,
  contractDigitalAcceptanceResult?: ContractDigitalAcceptanceEnum
}

export interface DigitalIdentification {
  $type: StateResultDiscriminatorEnum,
  userObservations?: string,
  digitalIdentificationResult?: DigitalIdentificationEnum
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
  $type?: StateResultDiscriminatorEnum,
  userObservations?: string,
  merchantRegistrationId?: string,
  shops?: ShopRegistration[],
  decision?: MerchantRegistrationEnum
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
  $type?: StateResultDiscriminatorEnum,
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
  CONTRACT_ACCEPTANCE = "ContractAcceptanceModel",
  STANDARD_INDUSTRY_CLASSIFICATION_CHOICE = "StandardIndustryClassificationModel",
  RISK_ASSESSMENT = "RiskAssessment",
  ELIGIBILITY_ASSESSMENT = "EligibilityAssessment",
  CLIENT_CHOICE = "ClientChoice",
  NEGOTIATION_APPROVAL = "NegotiationApproval",
  MERCHANT_REGISTRATION = "MerchantRegistration",
  OPERATIONS_EVALUATION = "OperationsEvaluation",
  COMPLIANCE_EVALUATION = "ComplianceEvaluation",
  CONTRACT_DIGITAL_ACCEPTANCE = "ContractDigitalAcceptance",
  DIGITAL_IDENTIFICATION = "DigitalIdentification"
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
  COMPLIANCE_EVALUATION = "ComplianceEvaluation",
  CONTRACT_DIGITAL_ACCEPTANCE = "ContractDigitalAcceptance",
  DIGITAL_IDENTIFICATION = "DigitalIdentification"
}

export enum ClientNumberDecisionEnum {
  SUCCESS = "Success",
  RETURN_TO_BACKOFFICE = "ReturnToBackOffice",
  RETURN_TO_FRONTOFFICE = "ReturnToFrontOffice"
}

export enum NegotiationApprovalEnum {
  ACCEPTED = "Accepted", //Estava "approved"
  RETURN_TO_FRONT_OFFICE = "ReturnToFrontOffice"
}

export enum OperationsEvaluationEnum {
  //Antes estava CONTINUE E RETURN
  RETURN_TO_FRONT_OFFICE = "ReturnToFrontOffice",
  RETURN_TO_BACK_OFFICE = "ReturnToBackOffice",
  RETURN_TO_COMPLIANCE_EVALUATION = "ReturnToComplianceEvaluation"
}

export enum ContractDigitalAcceptanceEnum {
  RETURN_TO_FRONT_OFFICE = "ReturnToFrontOffice",
  RETURN_TO_BACK_OFFICE = "ReturnToBackOffice",
  CANCEL_DIGITAL_SIGNATURE = "CancelDigitalSignature",
  CANCEL = "Cancel"
}

export enum DigitalIdentificationEnum {
  RETURN_TO_FRONT_OFFICE = "ReturnToFrontOffice",
  RETURN_TO_BACK_OFFICE = "ReturnToBackOffice",
  CANCEL_IDENTIFICATION = "CancelDigitalIdentification",
  CANCEL = "Cancel"
}

export enum ContractAcceptanceEnum {
  RETURN_TO_FRONT_OFFICE = "ReturnToFrontOffice",
  RETURN_TO_BACK_OFFICE = "ReturnToBackOffice",
  CHANGE_TO_MANUAL_SIGNATURE = "ChangeToManualSignature",
  CANCEL = "Cancel",
  CONTINUE = "Continue"
}

export enum ClientChoiceDecisionEnum {
  CONTINUE = "Continue",
  RETURN_TO_FRONT_OFFICE = "ReturnToFrontOffice"
}

export enum MerchantRegistrationEnum {
  CONTINUE = "Continue",
  RETURN_TO_FRONT_OFFICE = "ReturnToFrontOffice"
}
