import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { APIRequestsService } from '../apirequests.service';
import { AppConfigService } from '../app-config.service';
import { BankInformation, Client, Contacts, ForeignFiscalInformation, HeadquartersAddress, ShareCapital } from '../client/Client.interface';
import { HttpMethod } from '../enums/enum-data';
import { LoadingService } from '../loading.service';
import { AuthService } from '../services/auth.service';
import { CorporateEntity, IStakeholders } from '../stakeholders/IStakeholders.interface';
import { ShopDetailsAcquiring, ShopEquipment } from '../store/IStore.interface';
import { PostDocument } from '../submission/document/ISubmission-document';
import { SimplifiedReference } from '../submission/ISubmission.interface';
import { Process } from './process.interface';

@Injectable({
  providedIn: 'root'
})
export class ProcessService {
  private baseUrl: string;
  private urlOutbound: string;
  private neyondBackURL: string;
  currentLanguage: string;
  languageStream$ = new BehaviorSubject<string>(''); //temos de estar à escuta para termos a currentLanguage

  constructor(private router: ActivatedRoute,
    private http: HttpClient, /*@Inject(configurationToken)*/ private configuration: AppConfigService, private API: APIRequestsService, public translate: TranslateService, private authService: AuthService, private loader: LoadingService) {
    this.baseUrl = configuration.getConfig().acquiringAPIUrl;
    this.urlOutbound = configuration.getConfig().outboundUrl;
    this.neyondBackURL = configuration.getConfig().neyondBackUrl;
    this.languageStream$.subscribe((val) => {
      this.currentLanguage = val
    });
    
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
    var id = encodeURIComponent(processId);
    var URI = this.urlOutbound + "api/v1/process/" + id;

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

  getDocumentFromProcess(processId: string) : any {
    return this.http.get(this.baseUrl + 'process/' + processId + '/document');
  }

  getDocumentDetailsFromProcess(processId: string, documentId: string) : any {
    return this.http.get(this.baseUrl + 'process/' + processId + '/document/' + documentId);
  }

  getDocumentImageFromProcess(processId: string, documentId: string): any {
    this.loader.show();
    var URI = this.baseUrl + 'process/' + processId + '/document/' + documentId + '/image';
    return fetch(URI, {
      headers: {
        Authorization: 'Bearer ' + this.authService.GetToken(),
        responseType: 'blob',
        observe: 'response',
        "Accept": "application/pdf",
        "Content-Type": "application/pdf"
      }
    }).finally(() => {
      this.loader.hide();
    });
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
    return this.http.get<IStakeholders>(this.baseUrl + 'process/' + processId + '/stakeholder/' + stakeholderId);
  }

  changeProcessState(processId: string, state: string, update) {
    return this.http.post(this.baseUrl + 'process/' + processId + '/' + state, update);
  }

  postProcessDocuments(processId: string, state: string, document) {
    return this.http.post(this.baseUrl + 'process/' + processId + '/' + state + '/document', document);
  }

  getProcessIssuesById(processId: string, processHistoryId?: string) {
    var url = this.baseUrl + 'process/' + processId + '/issue'
    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Accept-Language': this.translate.currentLang,

      }),
    }
    if (processHistoryId != null)
      url = url + '?processHistoryId=' + processHistoryId;
    return this.http.get<BusinessIssueViewModel>(url, HTTP_OPTIONS);
  }

  getProcessHistory(processId: string) {
    var url = this.baseUrl + 'process/' + processId + '/History';

    return this.API.callAPIAcquiring(HttpMethod.GET, url);
  }

  getProcessEntities(processId: string) {
    var url = this.baseUrl + 'process/' + processId + '/entity';
    return this.API.callAPIAcquiring(HttpMethod.GET, url);
  }

  getProcessCorporateEntity(processId: string, entityId: string) {
    var url = this.baseUrl + 'process/' + processId + '/corporate-entity/' + entityId;
    return this.API.callAPIAcquiring(HttpMethod.GET, url);
  }

  getProcessPrivateEntity(processId: string, entityId: string) {
    var url = this.baseUrl + 'process/' + processId + '/private-entity/' + entityId;
    return this.API.callAPIAcquiring(HttpMethod.GET, url);
  }

  getStakeholdersFromProcess(processId: string) {
    var url = this.baseUrl + 'process/' + processId + '/stakeholder';
    return this.API.callAPIAcquiring(HttpMethod.GET, url);
  }

  addProcessDocument(processId: string, document: PostDocument) {
    var url = this.baseUrl + 'process/' + processId + '/document';
    return this.API.callAPIAcquiring(HttpMethod.POST, url, document);
  }

  addProcessMerchantDocument(processId: string, document: PostDocument) {
    var url = this.baseUrl + 'process/' + processId + '/merchant' + '/document';
    return this.API.callAPIAcquiring(HttpMethod.POST, url, document);
  }

  addProcessShopDocument(processId: string, shopId: string, document: PostDocument) {
    var url = this.baseUrl + 'process/' + processId + '/merchant/shop/' + shopId + '/document';
    return this.API.callAPIAcquiring(HttpMethod.POST, url, document);
  }

  addShopToProcess(processId: string, shop: ShopDetailsAcquiring) {
    var url = this.baseUrl + 'process/' + processId + '/merchant' + '/shop';
    return this.API.callAPIAcquiring(HttpMethod.POST, url, shop);
  }

  addEquipmentToShopProcess(processId: string, shopId: string, equip: ShopEquipment) {
    var url = this.baseUrl + 'process/' + processId + '/merchant/shop/' + shopId + '/equipment';
    return this.API.callAPIAcquiring(HttpMethod.POST, url, equip);
  }

  addStakeholderToProcess(processId: string, stakeholder: IStakeholders) {
    var url = this.baseUrl + 'process/' + processId + '/stakeholder';
    return this.API.callAPIAcquiring(HttpMethod.POST, url, stakeholder);
  }

  addDocumentToStakeholderProcess(processId: string, stakeholderId: string, document: PostDocument) {
    var url = this.baseUrl + 'process/' + processId + '/stakeholder/' + stakeholderId + '/document';
    return this.API.callAPIAcquiring(HttpMethod.POST, url, document);
  }

  addCorporateEntityToProcess(processId: string, corporate: CorporateEntity) {
    var url = this.baseUrl + 'process/' + processId + '/corporate-entity';
    return this.API.callAPIAcquiring(HttpMethod.POST, url, corporate);
  }

  updateProcess(processId: string, process: any) {
    var url = this.baseUrl + 'process/' + processId;
    return this.API.callAPIAcquiring(HttpMethod.PUT, url, process);
  }

  updateMerchantProcess(processId: string, merchant: Client) {
    var url = this.baseUrl + 'process/' + processId + '/merchant';
    return this.API.callAPIAcquiring(HttpMethod.PUT, url, merchant);
  }

  updateShopProcess(processId: string, shopId: string, shop: ShopDetailsAcquiring) {
    var url = this.baseUrl + 'process/' + processId + '/merchant/shop/' + shopId;
    return this.API.callAPIAcquiring(HttpMethod.PUT, url, shop);
  }

  updateEquipmentProcess(processId: string, shopId: string, equipId: string, equip: ShopEquipment) {
    var url = this.baseUrl + 'process/' + processId + '/merchant/shop/' + shopId + '/equipment/' + equipId;
    return this.API.callAPIAcquiring(HttpMethod.PUT, url, equip);
  }

  updateStakeholderProcess(processId: string, stakeId: string, stake: IStakeholders) {
    var url = this.baseUrl + 'process/' + processId + '/stakeholder/' + stakeId;
    return this.API.callAPIAcquiring(HttpMethod.PUT, url, stake);
  }

  updateCorporateEntity(processId: string, corporateId: string, corporate: CorporateEntity) {
    var url = this.baseUrl + 'process/' + processId + '/corporate-entity/' + corporateId;
    return this.API.callAPIAcquiring(HttpMethod.PUT, url, corporate);
  }

  deleteShopEquipmentFromProcess(processId: string, shopId: string, equipId: string) {
    var url = this.baseUrl + 'process/' + processId + '/merchant/shop/' + shopId + '/equipment/' + equipId;
    return this.API.callAPIAcquiring(HttpMethod.DELETE, url);
  }

  deleteStakeholderProcess(processId: string, stakeId: string) {
    var url = this.baseUrl + 'process/' + processId + '/stakeholder/' + stakeId;
    return this.API.callAPIAcquiring(HttpMethod.DELETE, url);
  }

  deleteCorporateProcess(processId: string, corporateId: string) {
    var url = this.baseUrl + 'process/' + processId + '/corporate-entity/' + corporateId;
    return this.API.callAPIAcquiring(HttpMethod.DELETE, url);
  }

  finishProcessUpdate(processId: string, body: any) {
    var url = this.baseUrl + 'process/' + processId;
    return this.API.callAPIAcquiring(HttpMethod.PATCH, url, body);
  }

  getUpdateProcessInfo(processId: string, processUpdateId?: string) {
    var url = this.baseUrl + 'process/' + processId + '/update-process';
    if (processUpdateId != "" && processUpdateId != null)
      url += '?processUpdateId=' + processUpdateId;
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

export interface IssueViewModel {
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
  document?: SimplifiedReferenceIssueDoc
  issues?: IssueViewModel[]
}

interface SimplifiedReferenceIssueDoc {
  id?: string
  href?: string
  type?: string
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
  userAssigned?: string
  contractSignature?: ProcessSignature
  updateProcessInformation?: UpdateProcessInformation
}

interface ProcessSignature {
  signType?: string
  state?: string
  digitalSignatureGuid?: string
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

export interface UpdateProcessInformation {
  isInProgress?: boolean
  id?: string
}
