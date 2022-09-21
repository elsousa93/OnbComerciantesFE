import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TerminalSupportEntityEnum } from '../../commercial-offer/ICommercialOffer.interface';
import { IStakeholders } from '../../stakeholders/IStakeholders.interface';
import { SubmissionService } from '../../submission/service/submission-service.service';
import { ShopDetailsAcquiring } from '../IStore.interface';
import { StoreService } from '../store.service';
import { EquipmentOwnershipTypeEnum, CommunicationOwnershipTypeEnum, ProductPackKindEnum } from '../../commercial-offer/ICommercialOffer.interface';

const testValues: ShopDetailsAcquiring[] = [
  {
    shopId: "1",
    name: "ShopName",
    manager: "Manager1",
    activity: "C",
    subActivity: "C1",
    supportEntity: "Entity1",
    registrationId: "RegID",
    address: {
      useMerchantAddress: true,
      address: {
        address: "A",
        postalCode: "B",
        postalArea: "C",
        country: "123"
      },
      isInsideShoppingCenter: true,
      shoppingCenter: "Shopping1"
    },
    bank: {
      useMerchantBank: true,
      bank: {
        bank: "Bank",
        iban: "12345"
      }
    },
    website: "www.google.com",
    productCode: "345",
    subproductCode: "324",
    equipments: [
      {
        shopEquipmentId: "123",
        communicationOwnership: CommunicationOwnershipTypeEnum.UNKNOWN,
        equipmentOwnership: EquipmentOwnershipTypeEnum.UNKNOWN,
        communicationType: "A",
        equipmentType: "A",
        quantity: 0,
        pricing: {
          id: "123",
          attribute: [
            {
              id: "A",
              description: "A",
              originalValue: 1,
              finalValue: 1,
              isReadOnly: true,
              isVisible: true
            }
          ]
        }
      }
    ],
    pack: {
      packId: "123",
      processorId: "345",
      packDetails: [
        {
          id: "1234",
          description: "123",
          kind: "1234",
          attributes: [
            {
              id: "1234",
              description: "AAA",
              originalValue: true,
              finalValue: true,
              isReadOnly: true,
              isVisible: true,
              isSelected: true,
              order: 0,
              bundles: [
                {
                  id: "B",
                  description: "B",
                  kind: ProductPackKindEnum.SIMPLE,
                  attributes: [
                    {
                      id: "B123",
                      description: "B123456",
                      originalValue: true,
                      finalValue: true,
                      isReadOnly: true,
                      isVisible: true,
                      isSelected: true,
                      order: 0
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      commission: {
        commissionId: "1",
        attributes: {
          id: "",
          description: "A1",
          fixedValue: {
            originalValue: 1,
            finalValue: 1,
            isReadOnly: true,
            isVisible: true
          },
          maxValue: {
            originalValue: 2,
            finalValue: 2,
            isReadOnly: true,
            isVisible: true
          },
          minValue: {
            originalValue: 0,
            finalValue: 0,
            isReadOnly: true,
            isVisible: true
          },
          percentageValue: {
            originalValue: 4,
            finalValue: 4,
            isReadOnly: true,
            isVisible: true
          }
        }
      }
    },
    documents: {
      href: "",
      type: "",
      id: ""
    }
  }
]

@Component({
  selector: 'app-store-table',
  templateUrl: './store-table.component.html',
  styleUrls: ['./store-table.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class StoreTableComponent implements OnInit, AfterViewInit, OnChanges {

  storesMat: MatTableDataSource<ShopDetailsAcquiring>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  public EquipmentOwnershipTypeEnum = EquipmentOwnershipTypeEnum;
  public CommunicationOwnershipTypeEnum = CommunicationOwnershipTypeEnum;
  public ProductPackKindEnum = ProductPackKindEnum;

  displayedColumns: string[] = ['name', 'activity', 'subActivity', 'address' ,'bank', 'terminalNumber', 'product'];

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

  constructor(private submissionService: SubmissionService, private storeService: StoreService, private ref: ChangeDetectorRef) { }

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
  }

  ngAfterViewInit(): void {
    this.storesMat.paginator = this.paginator;
    this.storesMat.sort = this.sort;
    
  }

  getStoreList() {

    //Ir buscar as lojas que já se encontram associadas à submissão em que nos encontramos, ou seja, se adicionarmos uma submissão nova
    this.storeService.getSubmissionShopsList(localStorage.getItem("submissionId")).subscribe(result => {
     result.forEach(value => {
       this.storeService.getSubmissionShopDetails(localStorage.getItem("submissionId"), value.id).subscribe(res => {
         this.storesList.push(res);
       });
     });
     this.loadStores(this.storesList);
    });

    //Caso seja DEVOLUÇÃO OU CONSULTA - Vamos buscar as lojas que foram inseridas na ultima submissão.
    if (this.returned !== null) {
     this.submissionService.GetSubmissionByProcessNumber(localStorage.getItem("processNumber")).subscribe(result => {
       this.storeService.getSubmissionShopsList(result[0].submissionId).subscribe(resul => {
         resul.forEach(val => {
           this.storeService.getSubmissionShopDetails(result[0].submissionId, val.id).subscribe(res => {
             var index = this.storesList.findIndex(store => store.shopId == res.shopId);
             if (index == -1) // só adicionamos a Loja caso esta ainda n exista na lista
               this.storesList.push(res);
           });
         });
         this.loadStores(this.storesList);
       })
     });
    }
    this.loadStores();
  }

  emitSelectedStore(store, idx) {
    this.selectedStoreEmitter.emit({ store: store, idx: idx });
    this.selectedStore = store;
    this.currentIdx = idx;
    console.log('Current store ', this.selectedStore);
    console.log('Index ', this.currentIdx);
  }

  loadStores(storesValues: ShopDetailsAcquiring[] = testValues) {
    this.storesMat = new MatTableDataSource(storesValues);
    this.storesMat.paginator = this.paginator;
    this.storesMat.sort = this.sort;
  }
}
