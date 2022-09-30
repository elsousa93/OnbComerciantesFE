import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Configuration, configurationToken } from '../configuration';
import { TableInfoService } from '../table-info/table-info.service';
import { BehaviorSubject } from 'rxjs';
import { State, ExternalState } from './IQueues.interface';
import { SimplifiedReference } from '../submission/ISubmission.interface';
import { ShopDetailsAcquiring, ShopEquipment } from '../store/IStore.interface';
import { IStakeholders } from '../stakeholders/IStakeholders.interface';
import { PostDocument } from '../submission/document/ISubmission-document';
import { APIRequestsService } from '../apirequests.service';
import { HttpMethod } from '../enums/enum-data';

@Injectable({
  providedIn: 'root'
})
export class QueuesService {

  private acquiringUrl: string;

  currentLanguage: string;

  languageStream$ = new BehaviorSubject<string>(''); //temos de estar à escuta para termos a currentLanguage

  constructor(private router: ActivatedRoute,
    private http: HttpClient, @Inject(configurationToken) private configuration: Configuration,
    private route: Router, private tableinfo: TableInfoService, private APIService: APIRequestsService) {
    this.acquiringUrl = configuration.acquiringAPIUrl;

    this.languageStream$.subscribe((val) => {
      this.currentLanguage = val
    });
  }

  postExternalState(processId: string, state: State, externalState: ExternalState, queueModel: any) {
    var URI = this.acquiringUrl + "process/" + processId + state;
    return this.http.post(URI, externalState, queueModel);
  }

  postProcessDocuments(file: PostDocument, processID: string, state: string) {
    var url = this.acquiringUrl + "process/" + processID + "/" + state + "/document";

    return this.APIService.callAPIAcquiring(HttpMethod.POST, url, file);
  }

  // Stakeholders List
  getProcessStakeholdersList(processId: string) {
    var url = this.acquiringUrl + "process/" + processId + '/stakeholder';

    return this.APIService.callAPIAcquiring(HttpMethod.GET, url);

    //return this.http.get<SimplifiedReference[]>(this.acquiringUrl + "process/" + processId + '/stakeholder');
  }

  // Stakeholder Details
  getProcessStakeholderDetails(processId: string, stakeholderId: string) {
    var url = this.acquiringUrl + 'process/' + processId + '/stakeholder/' + stakeholderId;

    return this.APIService.callAPIAcquiring(HttpMethod.GET, url);
    
    //return this.http.get<IStakeholders>(this.acquiringUrl + 'process/' + processId + '/stakeholder/' + stakeholderId);
  }

  // Shops List
  getProcessShopsList(processId: string) {
    var url = this.acquiringUrl + 'process/' + processId + '/merchant/shop';

    return this.APIService.callAPIAcquiring(HttpMethod.GET, url);
    //return this.http.get<SimplifiedReference[]>(this.acquiringUrl + 'process/' + processId + '/merchant/shop');
  }

  // Shop Details
  getProcessShopDetails(processId: string, shopId: string) {
    var url = this.acquiringUrl + 'process/' + processId + '/shop/' + shopId;

    return this.APIService.callAPIAcquiring(HttpMethod.GET, url);
    //return this.http.get<ShopDetailsAcquiring>(this.acquiringUrl + 'process/' + processId + '/shop/' + shopId);
  }

  // Shop Equipments List
  getProcessShopEquipmentsList(processId: string, shopId: string) {
    var url = this.acquiringUrl + 'process/' + processId + '/shop/' + shopId + '/equipment';

    return this.APIService.callAPIAcquiring(HttpMethod.GET, url);
    //return this.http.get<SimplifiedReference[]>(this.acquiringUrl + 'process/' + processId + '/shop/' + shopId + '/equipment');
  }

  // Shop Equipments Detail
  getProcessShopEquipmentDetails(processId: string, shopId: string, equipmentId: string) {
    var url = this.acquiringUrl + 'process/' + processId + '/shop/' + shopId + '/equipment/' + equipmentId;

    return this.APIService.callAPIAcquiring(HttpMethod.GET, url);
    //return this.http.get<ShopEquipment>(this.acquiringUrl + 'process/' + processId + '/shop/' + shopId + '/equipment/' + equipmentId);
  }

  
}
