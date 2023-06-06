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
import { LoggerService } from '../../logger.service';
import { ProcessNumberService } from '../../nav-menu-presencial/process-number.service';
import { ProcessService } from '../../process/process.service';
import { QueuesService } from '../../queues-detail/queues.service';

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

  displayedColumns: string[] = ['name', 'activity', 'subActivity', 'bank', 'product', 'subproduct'];

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
    idx: number,
    clickedTable: boolean
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
  @Output() visitedStoresEmitter?= new EventEmitter<string[]>();
  @Output() storeListEmitter?= new EventEmitter<ShopDetailsAcquiring[]>();
  @Output() processInfoEmitter?= new EventEmitter<any>();

  public subs: Subscription[] = [];
  activities: ShopActivities[];
  subActivities: ShopSubActivities[];

  banks: Bank[];
  processId: string;
  updateProcessId: string;
  visitedStores: string[] = [];

  constructor(private submissionService: SubmissionService, private storeService: StoreService, private translate: TranslateService, private tableInfo: TableInfoService, private logger: LoggerService, private processNrService: ProcessNumberService, private queuesInfo: QueuesService, private processService: ProcessService) {
    this.fetchActivities();
  }

  fetchActivities() {
    this.subs.push(this.tableInfo.GetAllShopActivities().subscribe(result => {
      this.logger.info("Get all shop activities result: " + JSON.stringify(result));
      this.activities = result;
    }, error => {
      this.logger.error(error, "", "Error getting all shop activities");
    }));
    this.subs.push(this.tableInfo.GetBanks().subscribe(result => {
      this.logger.info("Get all banks result: " + JSON.stringify(result));
      this.banks = result;
    }, error => {
      this.logger.error(error, "", "Error getting all banks");
    }))
  }

  getActivityDescription(activityCode) {
    this.activities?.forEach(act => {
      if (activityCode == act.activityCode) {
        this.subActivities = act.subActivities;
      }
    })
    return this.activities?.find(a => a.activityCode == activityCode)?.activityDescription;
  }

  getSubActivityDescription(subActivityCode) {
    return this.subActivities?.find(s => s.subActivityCode == subActivityCode)?.subActivityDescription;
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
        this.checkVisitedStores();
        //this.emitSelectedStore(this.storesList[nextIdx], nextIdx, false);
      });
    }
    if (changes["previousStoreEvent"] && this.previousStoreEvent != null) {
      this.previousStoreEvent.subscribe(result => {
        if (result > 0) {
          var prevIdx = result - 1;
          //this.checkVisitedStores();
          this.emitSelectedStore(this.storesList[prevIdx], prevIdx, false);
        }
      });
    }
  }

  ngOnInit(): void {
    this.returned = localStorage.getItem("returned");
    this.processNrService.processId.subscribe(id => this.processId = id);
    this.processNrService.updateProcessId.subscribe(id => this.updateProcessId = id);
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
        this.logger.info("Get all shops from submission result: " + JSON.stringify(result));
        var shops = result.result;
        var totalLength = shops.length;
        shops.forEach(value => {
          this.storeService.getSubmissionShopDetails(localStorage.getItem("submissionId"), value.id).then(res => {
            this.logger.info("Get shop from submission result: " + JSON.stringify(result));
            var shop = res.result;
            this.storesList.push(shop);
            length++;
            if (length === totalLength) {
              this.storesList = this.storesList.sort((a, b) => a.id > b.id ? 1 : -1);
              resolve(null);
            }
          });
        });
      })
    });
  }

  getStoreListFromProcess() {
    var length = 0;
    var context = this;
    return new Promise((resolve, reject) => {
      this.queuesInfo.getProcessShopsList(context.processId).then(result => {
        this.logger.info("Get all shops from process result: " + JSON.stringify(result));
        var shops = result.result;
        var totalLength = shops.length;
        shops.forEach(value => {
          this.queuesInfo.getProcessShopDetails(context.processId, value.id).then(res => {
            this.logger.info("Get shop from process result: " + JSON.stringify(result));
            var shop = res.result;
            this.storesList.push(shop);
            length++;
            if (length === totalLength) {
              this.storesList = this.storesList.sort((a, b) => a.id > b.id ? 1 : -1);
              resolve(null);
            }
          });
        });
      })
    });
  }

  getStoreList() {
    if ((this.processId != '' && this.processId != null) && this.returned != null) {
      if (this.returned == 'consult') {
        this.getStoreListFromProcess().then(result => {
          this.loadStores(this.storesList);
          this.storeListEmitter.emit(this.storesList);
          this.listLengthEmitter.emit(this.storesList.length);
          if (this.storesList.length > 0)
            this.checkVisitedStores();
            //this.emitSelectedStore(this.storesList[0], 0, false);
        });
      } else {
        this.processService.getUpdateProcessInfo(this.processId, this.updateProcessId).then(result => {
          this.processInfoEmitter.emit(result.result);
          var shops = result.result.shops;
          if (shops.length > 0) {
            shops.forEach(val => {
              if (val.updateProcessAction != "Delete") {
                if (val.phone1 != null) {
                  val.phone1.phoneIndicative = null;
                }
                if (val.phone2 != null) {
                  val.phone2.phoneIndicative = null;
                }
                let o = Object.fromEntries(Object.entries(val).filter(([_, v]) => v != null)) as any;
                this.storesList.push(o);
              }
            });
            this.storesList = this.storesList.sort((a, b) => a.id > b.id ? 1 : -1);
            this.loadStores(this.storesList);
            this.storeListEmitter.emit(this.storesList);
            this.listLengthEmitter.emit(this.storesList.length);
            if (this.storesList.length > 0)
              this.checkVisitedStores();
              //this.emitSelectedStore(this.storesList[0], 0, false);
          }
        });
      }
    } else {
      this.getStoreListFromSubmission().then(result => {
        this.loadStores(this.storesList);
        this.storeListEmitter.emit(this.storesList);
        this.listLengthEmitter.emit(this.storesList.length);
        if (this.storesList.length > 0)
          this.checkVisitedStores();
          //this.emitSelectedStore(this.storesList[0], 0, false);
      });
    }
  }

  emitSelectedStore(store, idx, clickedTable) {
    this.selectedStoreEmitter.emit({ store: store, idx: idx, clickedTable: clickedTable });
    this.selectedStore = store;
    this.currentIdx = idx;
  }

  loadStores(storesValues: ShopDetailsAcquiring[]) {
    this.storesMat.data = storesValues;
    this.storesMat.sort = this.sort;
  }

  checkVisitedStores() {
    let currentPage = location.href.split("/")[5];
    this.storesList.forEach(shop => {
      if (currentPage == "store-comp") {
        if (shop.activity != null && shop.activity != "" && shop.productCode != null && shop.productCode != "") {
          this.visitedStores.push(shop.id);
          this.visitedStores = Array.from(new Set(this.visitedStores));
        }
      } else if (currentPage == "commercial-offert-list") {
        if (shop.pack != null) {
          this.visitedStores.push(shop.id);
          this.visitedStores = Array.from(new Set(this.visitedStores));
        }
      } else {
        if ((shop.phone1 != null && shop.phone1 != {}) || (shop.phone2 != null && shop.phone2 != {})) {
          this.visitedStores.push(shop.id);
          this.visitedStores = Array.from(new Set(this.visitedStores));
        }
      }
    });
    if (this.visitedStores.length < this.storesList.length) {
      var index = this.storesList.findIndex(value => !this.visitedStores.includes(value.id));
      if (index != -1)
        this.emitSelectedStore(this.storesList[index], index, false);
      else
        this.emitSelectedStore(this.storesList[0], 0, false);
    } else {
      this.emitSelectedStore(this.storesList[0], 0, false);
    }
    this.visitedStoresEmitter.emit(this.visitedStores);
  }
}
