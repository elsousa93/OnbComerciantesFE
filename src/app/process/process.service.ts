import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BankInformation, Client, Contacts, ForeignFiscalInformation, HeadquartersAddress, Sales, ShareCapital } from '../client/Client.interface';
import { CRCProcess } from '../CRC/crcinterfaces';
import { FiscalAddress, IdentificationDocument } from '../stakeholders/IStakeholders.interface';
import { ISubmission } from '../submission/ISubmission.interface';
import { Process } from './process.interface';

@Injectable({
  providedIn: 'root'
})
export class ProcessService {

  urlOutbound: string = "http://localhost:12000/OutboundAPI/";


  constructor(private router: ActivatedRoute,
    private http: HttpClient, @Inject('BASE_URL')
    private baseUrl: string, private route: Router) { }

   getAllProcessSubmissions(id) : any {
     return this.http.get<Process[]>(this.baseUrl + 'BEProcess/GetAllProcesses/' + id);
   }

    getAllSuccessSubmissions(id): any {
      return this.http.get<Process[]>(this.baseUrl + 'BEProcess/GetAllSuccessProcesses/' + id);
    }

    getAllIncompletedSubmissions(id): any {
      return this.http.get<Process[]>(this.baseUrl + 'BEProcess/GetAllIncompletedProcesses/' + id);
    }

    getSubmissionByID(id): any {
      return this.http.get<ISubmission>(this.baseUrl + 'BEProcess/GetSubmissionByID/' + id);
  }


  //OUTBOUND API

  startProcess(process: Process, RequestID: string, AcquiringUserID: string, AcquiringPartnerID?: string, AcquiringBranchID?: string, AcquiringProcessID?: string): any {

    var URI = this.urlOutbound + "api/v1/process/";

    var HTTP_OPTIONS = {
      headers: new HttpHeaders({
        'Request-Id': RequestID,
        'X-Acquiring-UserId': AcquiringUserID
      }),
    }

    if (AcquiringPartnerID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-PartnerId", AcquiringPartnerID);
    if (AcquiringBranchID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-BranchId", AcquiringBranchID);
    if (AcquiringProcessID !== null)
      HTTP_OPTIONS.headers.append("X-Acquiring-ProcessId", AcquiringProcessID);

    return this.http.post<any>(URI, process, HTTP_OPTIONS);
  }


  createMerchant(client: ClientForProcess, processReferenceID: string, requestID: string, AcquiringUserID: string, AcquiringProcessID?: string, AcquiringPartnerID?: string, AcquiringBranchID?: string): any {
    
    var URI = this.urlOutbound + "api/v1/process/" + processReferenceID + "/merchant";

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

    return this.http.post<any>(URI, client, HTTP_OPTIONS);
  }

  //ACQUIRING API

  searchProcessByNumber(processNumber: string) {
    return this.http.get<ProcessGet>(this.baseUrl + 'process' + '?number=' + processNumber);
  }

  searchProcessByState(state: string) {
    return this.http.get<ProcessGet[]>(this.baseUrl + 'process' + '?state=' + state);
  }

  getProcessById(processId: string) {
    return this.http.get<ProcessGet>(this.baseUrl + 'process/' + processId);
  }
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
  processId: string
  processNumber: string
  processType: string
  processKind: string
  state: string
  isClientAwaiting: boolean
  startedBy: StartedBy
}

interface StartedBy {
  user: string
  partner: string
  partnerBranch: string
}
