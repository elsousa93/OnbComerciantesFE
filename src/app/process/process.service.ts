import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { APIRequestsService } from '../apirequests.service';
import { AppConfigService } from '../app-config.service';
import { BankInformation, Client, Contacts, ForeignFiscalInformation, HeadquartersAddress, ShareCapital } from '../client/Client.interface';
import { HttpMethod } from '../enums/enum-data';
import { SimplifiedReference } from '../submission/ISubmission.interface';
import { Process } from './process.interface';

@Injectable({
  providedIn: 'root'
})
export class ProcessService {
  private baseUrl: string;
  private urlOutbound: string;


  constructor(private router: ActivatedRoute,
    private http: HttpClient, /*@Inject(configurationToken)*/ private configuration: AppConfigService, private API: APIRequestsService) {
    this.baseUrl = configuration.getConfig().acquiringAPIUrl;
    this.urlOutbound = configuration.getConfig().outboundUrl;
  }

  getAllProcessSubmissions(id): any {
    return this.http.get<Process[]>(this.baseUrl + 'BEProcess/GetAllProcesses/' + id);
  }

  getAllSuccessSubmissions(id): any {
    return this.http.get<Process[]>(this.baseUrl + 'BEProcess/GetAllSuccessProcesses/' + id);
  }

  getAllIncompletedSubmissions(id): any {
    return this.http.get<Process[]>(this.baseUrl + 'BEProcess/GetAllIncompletedProcesses/' + id);
  }

  UpdateProcess(processId: string, processUpdate: UpdateProcess, requestID: string, AcquiringUserID: string, AcquiringProcessID?: string, AcquiringPartnerID?: string, AcquiringBranchID?: string) {

    var URI = this.urlOutbound + "api/v1/process/" + processId;

    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Request-Id': requestID,
        'X-Acquiring-UserId': AcquiringUserID
      }),
    }

    if (AcquiringPartnerID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-PartnerId", AcquiringPartnerID);
    if (AcquiringBranchID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-BranchId", AcquiringBranchID);
    if (AcquiringProcessID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-ProcessId", AcquiringProcessID);

    return this.http.patch(URI, processUpdate, HTTP_OPTIONS);
  }

  //ACQUIRING API

  getDocumentDetailsFromProcess(processId: string, documentId: string) {
    return this.http.get(this.baseUrl + 'process/' + processId + '/document/' + documentId);
  }

  getDocumentImageFromProcess(processId: string, documentId: string) {
    return this.http.get(this.baseUrl + 'process/' + processId + '/document/' + documentId + '/image');
  }

  getMerchantFromProcess(processId: string) {
    return this.http.get<Client>(this.baseUrl + 'process/' + processId + '/merchant');
  }

  advancedSearch(url: string, from: number, count: number) {
    return this.http.get<ProcessGet>(url + "&from=" + from + '&count=' + count);
  }

  searchProcessByNumber(processNumber: string, from: number, count: number) {
    return this.http.get<ProcessGet>(this.baseUrl + 'process' + '?number=' + processNumber + "&from=" + from + '&count=' + count);
  }

  searchProcessByState(state: string, from: number, count: number) {
    return this.http.get<ProcessGet>(this.baseUrl + 'process' + '?state=' + state + "&from=" + from + '&count=' + count);
  }

  getProcessById(processId: string) {
    return this.http.get<ProcessList>(this.baseUrl + 'process/' + processId);
  }

  getStakeholderByIdFromProcess(processId: string, stakeholderId: string) {
    return this.http.get(this.baseUrl + 'process/' + processId + '/stakeholder/' + stakeholderId);
  }

  changeProcessState(processId: string, state: string, update) {
    return this.http.post(this.baseUrl + 'process/' + processId + '/' + state, update);
  }

  postProcessDocuments(processId: string, state: string, document) {
    return this.http.post(this.baseUrl + 'process/' + processId + '/' + state + '/document', document);
  }

  getProcessIssuesById(processId: string, processHistoryId?: string) {
    var url = this.baseUrl + 'process/' + processId + '/issue'
    if (processHistoryId != null)
      url = url + '?processHistoryId=' + processHistoryId;
    return this.http.get<BusinessIssueViewModel>(url);
  }

  getProcessHistory(processId: string) {
    var url = this.baseUrl + 'process/' + processId + '/History';

    return this.API.callAPIAcquiring(HttpMethod.GET, url);
  }
}
export interface BusinessIssueViewModel {
  process?: IssueViewModel[]
  merchant?: MerchantIssueViewModel
  stakeholders?: StakeholderIssueViewModel[]
  shops?: ShopIssueViewModel[]
  documents?: DocumentIssueViewModel[]
}

export enum IssueTypeEnum {
  AUTOMATIC_RULE = "AutomaticRule",
  MANUAL_RULE = "ManualRule"
}

interface IssueViewModel {
  issueType?: IssueTypeEnum
  originCode?: string
  issueCode?: string
  issueDescription?: string
}

interface MerchantIssueViewModel {
  merchant?: SimplifiedReference
  issues?: IssueViewModel[]
}

interface StakeholderIssueViewModel {
  stakeholder?: SimplifiedReference
  issues?: IssueViewModel[]
}

interface ShopIssueViewModel {
  shop?: SimplifiedReference
  issues?: IssueViewModel[]
}

interface DocumentIssueViewModel {
  document?: SimplifiedReference
  issues?: IssueViewModel[]
}
export interface ClientForProcess {
  legalName?: string,
  commercialName?: string,
  shortName?: string,
  headquartersAddress?: HeadquartersAddress,
  context?: string,
  contextId?: string,
  fiscalIdentification?: ForeignFiscalInformation,
  merchantType?: string,
  legalNature?: string,
  legalNature2?: string,
  certificate?: {
    code?: string,
    validUntil?: string
  },
  shareCapital?: ShareCapital,
  estabilishmentDate?: string,
  bylaws?: string,
  principalEconomicActivity?: string,
  otherEconomicActivities?: string[],
  sales?: {
    annualEstimatedRevenue?: number,
    productsOrServicesSold?: string[],
    productsOrServicesCountries?: string[],
    averageTransactions?: number
  },
  documentationDeliveryMethod?: string,
  bankingInformation?: BankInformation,
  merchantRegistrationId?: string,
  contacts?: Contacts,
  billingEmail?: string,
  documents: {
    purpose?: string,
    documentType?: string,
    receivedAt?: string,
    validUntil?: string,
    uniqueReference?: string,
    archiveSource?: string
  }[]
}
export interface ProcessGet {
  items: ProcessList[]
  pagination: Pagination
}

interface StartedBy {
  user: string
  partner: string
  partnerBranch: string
}

export interface UpdateProcess {
  state: string //completed, canceled
  cancellationReason: string //merchantWithHighRisk, stakeholderWithHighRisk, merchantNotEligible, stakeholderNotEligible, promptedByUser
}

export interface ProcessList {
  processId: string
  processNumber: string
  processType: string
  processKind: string
  state: string
  startedAt: string
  isClientAwaiting: boolean
  startedBy: StartedBy
  merchant: Merchant
}

interface Pagination {
  from: number
  count: number
  total: number
}

interface Merchant {
  fiscalId: string
  name: string
}

export interface SearchProcessHistory {
  items?: ProcessHistory[]
}
export interface ProcessHistory {
  idProcess?: number
  processState?: string
  historyGuid?: string
  whenStarted?: string
  whoStarted?: string
  whenFinished?: string
  whoFinished?: string
  observations?: string
  externalState?: string
}
