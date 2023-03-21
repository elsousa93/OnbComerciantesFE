import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ClientChoice, ComplianceEvaluation, ContractAcceptance, EligibilityAssessment, Hits, MerchantRegistration, NegotiationApproval, OperationsEvaluation, PostRisk, ProcessStateNotification, ReassingWorkQueue, RiskAssessment, StandardIndustryClassificationChoice, State } from './IQueues.interface';
import { PostDocument } from '../submission/document/ISubmission-document';
import { APIRequestsService } from '../apirequests.service';
import { HttpMethod } from '../enums/enum-data';
import { LoggerService } from '../logger.service';
import { AppConfigService } from '../app-config.service';

@Injectable({
  providedIn: 'root'
})
export class QueuesService {

  private acquiringUrl: string;
  private outboundUrl: string;

  currentLanguage: string;

  languageStream$ = new BehaviorSubject<string>(''); //temos de estar à escuta para termos a currentLanguage

  constructor(private logger: LoggerService,
    private http: HttpClient, private configuration: AppConfigService,
    private APIService: APIRequestsService) {
    this.acquiringUrl = configuration.getConfig().acquiringAPIUrl;
    this.outboundUrl = configuration.getConfig().outboundUrl;
    this.languageStream$.subscribe((val) => {
      this.currentLanguage = val
    });
  }

  postExternalState(processId: string, state: State, externalState: ContractAcceptance | StandardIndustryClassificationChoice | EligibilityAssessment | RiskAssessment | ClientChoice | NegotiationApproval | MerchantRegistration | OperationsEvaluation | ComplianceEvaluation) {
    var URI = this.acquiringUrl + "process/" + processId + "/" + state;
    return this.APIService.callAPIAcquiring(HttpMethod.POST, URI, externalState);
  }

  postProcessDocuments(file: PostDocument, processID: string, state: State) {
    var url = this.acquiringUrl + "process/" + processID + "/" + state + "/document";
    return this.APIService.callAPIAcquiring(HttpMethod.POST, url, file);
  }

  getActiveWorkQueue(processID: string) {
    var URI = this.acquiringUrl + "process/" + processID + "/active-workqueue";
    return this.APIService.callAPIAcquiring(HttpMethod.GET, URI);
  }

  postReassignWorkQueue(processID: string, reassignWorkQueue: ReassingWorkQueue) {
    var URI = this.acquiringUrl + "process/" + processID + "/reassign-workqueue";
    return this.APIService.callAPIAcquiring(HttpMethod.POST, URI, reassignWorkQueue);
  }

  postUpdateProcessId(processID: string, processStateNotif: ProcessStateNotification) {
    var URI = this.acquiringUrl + "process/" + processID + "/update";
    return this.APIService.callAPIAcquiring(HttpMethod.POST, URI, processStateNotif);
  }

  postUpdateProcess(processRefId: string, processStateNotif: ProcessStateNotification) {
    var URI = this.acquiringUrl + "process/update&processReferenceId=" + processRefId;
    return this.APIService.callAPIAcquiring(HttpMethod.POST, URI, processStateNotif);
  }

  markToCancel(processId: string) {
    var URI = this.acquiringUrl + "process/" + processId + "/mark_to_cancel";
    return this.APIService.callAPIAcquiring(HttpMethod.PATCH, URI);
  }

  // Stakeholders List
  getProcessStakeholdersList(processId: string) {
    var url = this.acquiringUrl + "process/" + processId + '/stakeholder';
    return this.APIService.callAPIAcquiring(HttpMethod.GET, url);
  }

  // Stakeholder Details
  getProcessStakeholderDetails(processId: string, stakeholderId: string) {
    var url = this.acquiringUrl + 'process/' + processId + '/stakeholder/' + stakeholderId;
    return this.APIService.callAPIAcquiring(HttpMethod.GET, url);
  }

  // Shops List
  getProcessShopsList(processId: string) {
    var url = this.acquiringUrl + 'process/' + processId + '/merchant/shop';
    return this.APIService.callAPIAcquiring(HttpMethod.GET, url);
  }

  // Shop Details
  getProcessShopDetails(processId: string, shopId: string) {
    var url = this.acquiringUrl + 'process/' + processId + '/merchant/shop/' + shopId;
    return this.APIService.callAPIAcquiring(HttpMethod.GET, url);
  }

  // Shop Equipments List
  getShopEquipmentConfigurationsFromProcess(processId: string, shopId: string) {
    var url = this.acquiringUrl + 'process/' + processId + '/merchant/shop/' + shopId + '/equipment';
    return this.APIService.callAPIAcquiring(HttpMethod.GET, url);
  }

  // Shop Equipments Detail
  getProcessShopEquipmentDetails(processId: string, shopId: string, equipmentId: string) {
    var url = this.acquiringUrl + 'process/' + processId + '/merchant/shop/' + shopId + '/equipment/' + equipmentId;
    return this.APIService.callAPIAcquiring(HttpMethod.GET, url);
  }

  getProcessMerchant(processId: string) {
    var url = this.acquiringUrl + 'process/' + processId + '/merchant';
    return this.APIService.callAPIAcquiring(HttpMethod.GET, url);
  }

  GetProcessStakeholders(processId) {
    var stakeholdersList = [];
    return new Promise<any>((resolve, reject) => {
      this.getProcessStakeholdersList(processId).then(result => {
        var stakeholders = result.result;
        var totalLength = stakeholders.length;

        var stakeholderInfoPromises = [];

        stakeholders.forEach(value => {
          // Obter o detalhe dos stakeholders
          stakeholderInfoPromises.push(this.GetProcessStakeholderInfo(processId, value.id));
        });

        Promise.all(stakeholderInfoPromises).then(res => {
          res.forEach(res => {
            stakeholdersList.push(res);
          })
          resolve(stakeholdersList);
        });

        this.logger.debug("stakeholders do processo: " + stakeholders);
      });
    });
  }

  GetProcessStakeholderInfo(processId, stakeholderId) {
    return new Promise<any>((resolve, reject) => {
      this.getProcessStakeholderDetails(processId, stakeholderId).then(res => {
        var stakeholder = res.result;
        resolve(stakeholder);
      })
    });
  }

  getAssessmentRisk(fiscalId: string, clientType: string, assessmentPost: Hits[]) {
    var url = this.outboundUrl + 'api/v1/assessment/' + fiscalId + '/risk' + '&clientType=' + clientType;
    return this.APIService.callAPIOutbound(HttpMethod.POST, url, "por mudar", "por mudar", "por mudar", "por mudar", assessmentPost);
  }

  getAssessmentSendRisk(processRefId: string, clientId: string, risk: PostRisk) {
    var id = encodeURIComponent(processRefId);
    var idClient = encodeURIComponent(clientId);
    var url = this.acquiringUrl + 'api/v1/process/' + id + '/assessment/' + idClient + '/send-risk';
    return this.APIService.callAPIOutbound(HttpMethod.POST, url, "por mudar", "por mudar", "por mudar", "por mudar", risk);
  }

  getAssessmentEligibility(fiscalId: string, clientType: string, assessmentPost: Hits[]) {
    var url = this.acquiringUrl + 'api/v1/assessment/' + fiscalId + '/eligibility' + '&clientType=' + clientType;
    return this.APIService.callAPIOutbound(HttpMethod.POST, url, "por mudar", "por mudar", "por mudar", "por mudar", assessmentPost);
  }
}
