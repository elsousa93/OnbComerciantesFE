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

@Injectable({
  providedIn: 'root'
})
export class QueuesService {

  private acquiringUrl: string;

  currentLanguage: string;

  languageStream$ = new BehaviorSubject<string>(''); //temos de estar à escuta para termos a currentLanguage

  constructor(private router: ActivatedRoute,
    private http: HttpClient, @Inject(configurationToken) private configuration: Configuration,
    private route: Router, private tableinfo: TableInfoService) {
    this.acquiringUrl = configuration.acquiringAPIUrl;

    this.languageStream$.subscribe((val) => {
      this.currentLanguage = val
    });
  }

  postExternalState(processId: string, state: State, externalState: ExternalState) {
    var URI = this.acquiringUrl + "api/v1/process/" + processId + state;
    return this.http.post(URI, externalState);
  }

  // Stakeholders List
  getProcessStakeholdersList(processId: string) {
    return this.http.get<SimplifiedReference[]>(this.acquiringUrl + "api/v1/process/" + processId + '/stakeholder');
  }

  // Stakeholder Details
  getProcessStakeholderDetails(processId: string, stakeholderId: string){
    return this.http.get<IStakeholders>(this.acquiringUrl + 'process/' + processId + '/stakeholder/' + stakeholderId);
  }

  // Shops List
  getProcessShopsList(processId: string) {
    return this.http.get<SimplifiedReference[]>(this.acquiringUrl + 'process/' + processId + '/shop');
  }

  // Shop Details
  getProcessShopDetails(processId: string, shopId: string) {
    return this.http.get<ShopDetailsAcquiring>(this.acquiringUrl + 'process/' + processId + '/shop/' + shopId);
  }

  // Shop Equipments List
  getProcessShopEquipmentsList(processId: string, shopId: string) {
    return this.http.get<SimplifiedReference[]>(this.acquiringUrl + 'process/' + processId + '/shop/' + shopId + '/equipment');
  }

  // Shop Equipments Detail
  getProcessShopEquipmentDetails(processId: string, shopId: string, equipmentId: string) {
    return this.http.get<ShopEquipment>(this.acquiringUrl + 'process/' + processId + '/shop/' + shopId + '/equipment/' + equipmentId);
  }
}
