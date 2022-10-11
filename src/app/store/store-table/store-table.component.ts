import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SubmissionService } from '../../submission/service/submission-service.service';
import { ShopDetailsAcquiring } from '../IStore.interface';
import { StoreService } from '../store.service';
import { EquipmentOwnershipTypeEnum, CommunicationOwnershipTypeEnum, ProductPackKindEnum } from '../../commercial-offer/ICommercialOffer.interface';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

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

  displayedColumns: string[] = ['name', 'activity', 'subActivity' ,'bank', 'terminalNumber', 'product'];

  //Variáveis que podem ser preenchidas
  @Input() submissionId: string;
  @Input() processNumber?: string;
  @Input() isCommercialOffer?: boolean = false;
  @Input() currentStore?: ShopDetailsAcquiring = {
      equipments: []
  };
  @Input() currentIdx?: number;

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


  constructor(private submissionService: SubmissionService, private storeService: StoreService, private ref: ChangeDetectorRef, private translate: TranslateService) { }

  storesMat = new MatTableDataSource<ShopDetailsAcquiring>();
  @ViewChild('paginator') set paginator(pager:MatPaginator) {
    if (pager) {
      this.storesMat.paginator = pager;
      this.storesMat.paginator._intl = new MatPaginatorIntl();
      this.storesMat.paginator._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    //var store = {};
    //var idx = 0;
    //for (const propName in changes) {
    //  const change = changes[propName];
    //  if (propName == 'currentStore')
    //    store = change.currentValue;
    //  if (propName == 'currentIdx')
    //    idx = change.currentValue;
    //}
    if (changes["currentStore"]) {
      this.emitSelectedStore(this.currentStore, this.currentIdx);
    }
  }

  ngOnInit(): void {
    this.returned = localStorage.getItem("returned");
    this.getStoreList();

    this.deleteStoreEvent.subscribe(result => {
      var storeToRemove = result;

      var idx = this.storesList.indexOf(storeToRemove);

      this.storesList.splice(idx, 1);

      this.loadStores(this.storesList);
    });

    this.insertStoreEvent.subscribe(result => {
      var storeToInsert = result;

      this.storesList.push(storeToInsert);

      this.loadStores(this.storesList);
    });
  }

  ngAfterViewInit(): void {
    // this.storesMat.paginator = this.paginator;
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
      //Caso seja DEVOLUÇÃO OU CONSULTA - Vamos buscar as lojas que foram inseridas na ultima submissão.
      if (this.returned != null) {
        this.submissionService.GetSubmissionByProcessNumber(localStorage.getItem("processNumber")).then(result => {
          this.storeService.getSubmissionShopsList(result[0].submissionId).then(resul => {
            var shops = result.result;
            var totalLength = shops.length;
            shops.forEach(val => {
              this.storeService.getSubmissionShopDetails(result[0].submissionId, val.id).then(res => {
                var shop = res.result;
                var index = this.storesList.findIndex(store => store.shopId == shop.shopId);
                if (index == -1) // só adicionamos a Loja caso esta ainda n exista na lista
                  this.storesList.push(shop);
                length++;
                if (length === totalLength)
                  resolve(null);
              });
            });
            //this.loadStores(this.storesList);
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
        this.selectedStore = this.storesList[0];
        this.currentStore = this.storesList[0];
        this.loadStores(this.storesList);
      })
    });
    //this.loadStores(this.storesList);
  }

  emitSelectedStore(store, idx) {
    this.selectedStoreEmitter.emit({ store: store, idx: idx });
    this.selectedStore = store;
    this.currentIdx = idx;
    console.log('Current store ', this.selectedStore);
    console.log('Index ', this.currentIdx);
  }

  loadStores(storesValues: ShopDetailsAcquiring[]) {
    this.storesMat.data = storesValues;
    // this.storesMat.paginator = this.paginator;
    this.storesMat.sort = this.sort;
  }
}
