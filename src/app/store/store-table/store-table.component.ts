import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TerminalSupportEntityEnum } from '../../commercial-offer/ICommercialOffer';
import { IStakeholders } from '../../stakeholders/IStakeholders.interface';
import { SubmissionService } from '../../submission/service/submission-service.service';
import { ShopDetailsAcquiring } from '../IStore.interface';
import { StoreService } from '../store.service';

const testValues: ShopDetailsAcquiring[] = [
  {
    activity: "Activity1",
    address:
    {
      isInsideShoppingCenter: true, useMerchantAddress: true, shoppingCenter: "Colombo",
      address:
      {
        address: "A",
        country: "B",
        postalArea: "C",
        postalCode: "123"
      }
    },
    bank: {
      bank:
      {
        bank: "Banco",
        iban: "893018920"
      },
      userMerchantBank: true
    },
    documents:
    {
      href: "",
      type: "",
      id: ""
    },
    id: "1",
    manager: "Manager1",
    name: "ShopName",
    productCode: "cardPresent",
    subActivity: "99",
    subproductCode: "easy",
    website: "google.com",
    supportEntity: TerminalSupportEntityEnum.ACQUIRER
  },
  {
    activity: "Activity2",
    address:
    {
      isInsideShoppingCenter: true,
      useMerchantAddress: false,
      shoppingCenter: "Colombo2",
      address:
      {
        address: "A2",
        country: "B2",
        postalArea: "C2",
        postalCode: "1232"
      }
    },
    bank: {
      bank:
      {
        bank: "Banco2",
        iban: "893018920"
      },
      userMerchantBank: false
    },
    documents:
    {
      href: "",
      type: "",
      id: ""
    },
    id: "2",
    manager: "Manager2",
    name: "ShopName2",
    productCode: "cardNotPresent",
    subActivity: "99",
    subproductCode: "keyOnHand",
    website: "google.com",
    supportEntity: TerminalSupportEntityEnum.OTHER
  },
]

@Component({
  selector: 'app-store-table',
  templateUrl: './store-table.component.html',
  styleUrls: ['./store-table.component.css']
})

export class StoreTableComponent implements OnInit, AfterViewInit, OnChanges {

  storesMat: MatTableDataSource<ShopDetailsAcquiring>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns: string[] = ['name', 'activity', 'subActivity', 'address' ,'bank', 'terminalNumber', 'product'];

  //Variáveis que podem ser preenchidas
  @Input() submissionId: string;
  @Input() processNumber?: string;
  @Input() isCommercialOffer?: boolean = false;
  @Input() currentStore?: ShopDetailsAcquiring = {};
  @Input() currentIdx?: number;

  //Variáveis que vão retornar informação
  @Output() selectedStoreEmitter = new EventEmitter<{
    store: ShopDetailsAcquiring,
    idx: number
  }>();

  selectedStore: ShopDetailsAcquiring = {};
  returned: string;
  storesList: ShopDetailsAcquiring[] = [];

  constructor(private submissionService: SubmissionService, private storeService: StoreService) { }

  ngOnChanges(changes: SimpleChanges): void {
    var store = {};
    var idx = -1;
    for (const propName in changes) {
      const change = changes[propName];
      if (propName == 'currentStore')
        store = change.currentValue;
      if (propName == 'currentIdx')
        idx = change.currentValue;

    }

    this.emitSelectedStore(store, idx);
  }

  ngOnInit(): void {
    this.returned = localStorage.getItem("returned");
    this.getStoreList();
  }

  ngAfterViewInit(): void {
    this.storesMat.paginator = this.paginator;
    this.storesMat.sort = this.sort;
  }

  getStoreList() {

    //Ir buscar as lojas que já se encontram associadas à submissão em que nos encontramos, ou seja, se adicionarmos uma submissão nova
    //this.storeService.getSubmissionShopsList(localStorage.getItem("submissionId")).subscribe(result => {
    //  result.forEach(value => {
    //    this.storeService.getSubmissionShopDetails(localStorage.getItem("submissionId"), value.id).subscribe(res => {
    //      this.storesList.push(res);
    //    });
    //  });
    //  this.loadStores(this.storesList);
    //});

    //Caso seja DEVOLUÇÃO OU CONSULTA - Vamos buscar as lojas que foram inseridas na ultima submissão.
    //if (this.returned !== null) {
    //  this.submissionService.GetSubmissionByProcessNumber(localStorage.getItem("processNumber")).subscribe(result => {
    //    this.storeService.getSubmissionShopsList(result[0].submissionId).subscribe(resul => {
    //      resul.forEach(val => {
    //        this.storeService.getSubmissionShopDetails(result[0].submissionId, val.id).subscribe(res => {
    //          var index = this.storesList.findIndex(store => store.id == res.id);
    //          if (index == -1) // só adicionamos a Loja caso esta ainda n exista na lista
    //            this.storesList.push(res);
    //        });
    //      });
    //      this.loadStores(this.storesList);
    //    })
    //  });
    //}
    this.loadStores();
  }

  emitSelectedStore(store, idx) {
    this.selectedStoreEmitter.emit({ store: store, idx: idx });
    this.selectedStore = store;
    this.currentIdx = idx;
  }

  loadStores(storesValues: ShopDetailsAcquiring[] = testValues) {
    this.storesMat = new MatTableDataSource(storesValues);
    this.storesMat.paginator = this.paginator;
    this.storesMat.sort = this.sort;
  }
}
