import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SubmissionService } from '../../submission/service/submission-service.service';
import { Bank, ShopActivities, ShopDetailsAcquiring, ShopSubActivities } from '../IStore.interface';
import { StoreService } from '../store.service';
import { EquipmentOwnershipTypeEnum, CommunicationOwnershipTypeEnum, ProductPackKindEnum } from '../../commercial-offer/ICommercialOffer.interface';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { TableInfoService } from '../../table-info/table-info.service';

@Component({
  selector: 'app-store-table',
  templateUrl: './store-table.component.html',
  styleUrls: ['./store-table.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class StoreTableComponent implements OnInit, AfterViewInit, OnChanges {

  @ViewChild(MatSort) sort: MatSort;

  public EquipmentOwnershipTypeEnum = EquipmentOwnershipTypeEnum;
  public CommunicationOwnershipTypeEnum = CommunicationOwnershipTypeEnum;
  public ProductPackKindEnum = ProductPackKindEnum;

  displayedColumns: string[] = ['name', 'activity', 'subActivity', 'bank', 'terminalNumber', 'product'];

  //Variáveis que podem ser preenchidas
  @Input() submissionId: string;
  @Input() processNumber?: string;
  @Input() isCommercialOffer?: boolean = false;
  @Input() currentStore?: ShopDetailsAcquiring = { equipments: [] };
  @Input() currentIdx?: number;
  @Input() previousStoreEvent?: Observable<number>;

  //Variáveis que vão retornar informação
  @Output() selectedStoreEmitter = new EventEmitter<{
    store: ShopDetailsAcquiring,
    idx: number
  }>();

  selectedStore: ShopDetailsAcquiring = {
    equipments: []
  };
  returned: string;
  storesList: ShopDetailsAcquiring[] = [];

  @Input() deleteStoreEvent: Observable<ShopDetailsAcquiring>;
  @Input() insertStoreEvent: Observable<ShopDetailsAcquiring>;
  @Input() updatedStoreEvent: Observable<{ store: ShopDetailsAcquiring, idx: number }>;

  @Output() listLengthEmitter = new EventEmitter<number>();

  public subs: Subscription[] = [];
  activities: ShopActivities[];
  subActivities: ShopSubActivities[];

  banks: Bank[];

  constructor(private submissionService: SubmissionService, private storeService: StoreService, private translate: TranslateService, private tableInfo: TableInfoService) {
    this.fetchActivities();
  }

  fetchActivities() {
    this.subs.push(this.storeService.GetAllShopActivities().subscribe(result => {
      this.activities = result;
    }, error => {

    }));
    this.subs.push(this.tableInfo.GetBanks().subscribe(result => {
      this.banks = result;
    }, error => {

    }))
  }

  getActivityDescription(activityCode) {
    this.activities.forEach(act => {
      if (activityCode == act.activityCode) {
        this.subActivities = act.subActivities;
      }
    })
    return this.activities.find(a => a.activityCode == activityCode).activityDescription;
  }

  getSubActivityDescription(subActivityCode) {
    return this.subActivities.find(s => s.subActivityCode == subActivityCode).subActivityDescription;
  }

  getBank(bankCode) {
    return this.banks?.find(b => b.code == bankCode)?.description;
  }

  storesMat = new MatTableDataSource<ShopDetailsAcquiring>();
  @ViewChild('paginator') set paginator(pager: MatPaginator) {
    if (pager) {
      this.storesMat.paginator = pager;
      this.storesMat.paginator._intl = new MatPaginatorIntl();
      this.storesMat.paginator._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["updatedStoreEvent"] && this.updatedStoreEvent != null) {
      this.updatedStoreEvent.subscribe(result => {
        var nextIdx = result.idx + 1;
        this.emitSelectedStore(this.storesList[nextIdx], nextIdx);
      });
    }
    if (changes["previousStoreEvent"] && this.previousStoreEvent != null) {
      this.previousStoreEvent.subscribe(result => {
        if (result > 0) {
          var prevIdx = result - 1;
          this.emitSelectedStore(this.storesList[prevIdx], prevIdx);
        }
      });
    }
  }

  ngOnInit(): void {
    this.returned = localStorage.getItem("returned");
    this.getStoreList();

    if (this.deleteStoreEvent != null) {
      this.deleteStoreEvent.subscribe(result => {
        var storeToRemove = result;

        var idx = this.storesList.indexOf(storeToRemove);

        this.storesList.splice(idx, 1);

        this.listLengthEmitter.emit(this.storesList.length);

        this.loadStores(this.storesList);
      });
    }

    if (this.insertStoreEvent != null) {
      this.insertStoreEvent.subscribe(result => {
        var storeToInsert = result;

        this.storesList.push(storeToInsert);

        this.listLengthEmitter.emit(this.storesList.length);

        this.loadStores(this.storesList);
      });
    }
  }

  ngAfterViewInit(): void {
    this.storesMat.sort = this.sort;
  }

  getStoreListFromSubmission() {
    var length = 0;

    return new Promise((resolve, reject) => {
      this.storeService.getSubmissionShopsList(localStorage.getItem("submissionId")).then(result => {
        var shops = result.result;
        var totalLength = shops.length;
        shops.forEach(value => {
          this.storeService.getSubmissionShopDetails(localStorage.getItem("submissionId"), value.id).then(res => {
            var shop = res.result;
            this.storesList.push(shop);
            length++;
            if (length === totalLength)
              resolve(null);
          });
        });
      })
    });
  }

  getStoreListFromProcess() {
    var length = 0;

    return new Promise((resolve, reject) => {
      if (this.returned != null) {
        this.submissionService.GetSubmissionByProcessNumber(localStorage.getItem("processNumber")).then(result => {
          this.storeService.getSubmissionShopsList(result.result[0].submissionId).then(resul => {
            var shops = resul.result;
            var totalLength = shops.length;
            shops.forEach(val => {
              this.storeService.getSubmissionShopDetails(result.result[0].submissionId, val.id).then(res => {
                var shop = res.result;
                var index = this.storesList.findIndex(store => store.shopId == shop.shopId);
                if (index == -1) // só adicionamos a Loja caso esta ainda n exista na lista
                  this.storesList.push(shop);
                length++;
                if (length === totalLength)
                  resolve(null);
              });
            });
          })
        });
      } else {
        resolve(null);
      }
    });
  }

  getStoreList() {
    //Ir buscar as lojas que já se encontram associadas à submissão em que nos encontramos, ou seja, se adicionarmos uma submissão nova
    this.getStoreListFromSubmission().then(result => {
      this.getStoreListFromProcess().then(result => {
        this.loadStores(this.storesList);
        this.listLengthEmitter.emit(this.storesList.length);
        if (this.storesList.length > 0)
          this.emitSelectedStore(this.storesList[0], 0);
      })
    });
  }

  emitSelectedStore(store, idx) {
    this.selectedStoreEmitter.emit({ store: store, idx: idx });
    this.selectedStore = store;
    this.currentIdx = idx;
  }

  loadStores(storesValues: ShopDetailsAcquiring[]) {
    this.storesMat.data = storesValues;
    this.storesMat.sort = this.sort;
  }
}