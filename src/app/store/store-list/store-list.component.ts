import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Istore, ShopAddressAcquiring, ShopBank, ShopBankingInformation, ShopDetailsAcquiring, ShopsListOutbound } from '../IStore.interface';
import { Router } from '@angular/router';
import { DataService } from '../../nav-menu-interna/data.service';
import { fromEvent, map, Observable, Subscription } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Configuration, configurationToken } from 'src/app/configuration';
import { StoreService } from '../store.service';
import { ClientService } from '../../client/client.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Client } from '../../client/Client.interface';
import { SubmissionService } from '../../submission/service/submission-service.service';
import { ViewportScroller } from '@angular/common';
import { MatSort } from '@angular/material/sort';
import { TerminalSupportEntityEnum } from '../../commercial-offer/ICommercialOffer.interface';
import { StoreTableComponent } from '../store-table/store-table.component';
import { EquipmentOwnershipTypeEnum, CommunicationOwnershipTypeEnum, ProductPackKindEnum } from '../../commercial-offer/ICommercialOffer.interface';
import { FiscalAddress } from 'src/app/stakeholders/IStakeholders.interface';

interface Stores {
  storeName: string;
  activity: string;
  subactivity: string;
  zone: string;
}
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
        attributes: [{
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
          ]
      }
    },
    documents: {
      href: "",
      type: "",
      id: ""
    }
  }
]
//This component displays the list of the existing stores

@Component({
  selector: 'app-store-list',
  templateUrl: './store-list.component.html',
  styleUrls: ['./store-list.component.css']
})
export class StoreComponent implements AfterViewInit {
  public EquipmentOwnershipTypeEnum = EquipmentOwnershipTypeEnum;
  public CommunicationOwnershipTypeEnum = CommunicationOwnershipTypeEnum;
  public ProductPackKindEnum = ProductPackKindEnum;

  storesMat: MatTableDataSource<ShopDetailsAcquiring>;

  private baseUrl: string;

  public edit: string = "true";

  /*variable declaration*/
  public stores: Istore[] = [];
  public clientID: number = 12345678;

  public map: Map<number, boolean>;
  public currentPage: number;
  public subscription: Subscription;

  displayedColumns: string[] = ['name', 'activity', 'subActivity', 'address'];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(StoreTableComponent) viewChild!: StoreTableComponent;

  public storeList: ShopDetailsAcquiring[] = [];
  public currentStore: ShopDetailsAcquiring = null;
  public currentIdx: number = 0;

  formStores: FormGroup;
  editStores: FormGroup;

  submissionClient: Client;
  returned: string;
  processNumber: string;
  submissionId: string;

  ngAfterViewInit() {
    //this.storesMat = new MatTableDataSource();
    //this.storesMat.paginator = this.paginator;
    //this.storesMat.sort = this.sort;
  }

  constructor(http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private route: Router, private data: DataService, private storeService: StoreService, private clientService: ClientService, private formBuilder: FormBuilder, private submissionService: SubmissionService, private ref: ChangeDetectorRef) {
    this.baseUrl = configuration.baseUrl;

    this.ngOnInit();

    this.editStores = this.formBuilder.group({
      infoStores: this.formBuilder.group({
        "storeName": [''],
        "activityStores": [''],
        "subZoneStore": [''],
        "contactPoint": [''],
        "subactivityStore": [''],
        "localeStore": [''],
        "addressStore": [''],
        "countryStore": [''],
        "zipCodeStore": [''],
        "commercialCenter": [''],
        "replicateAddress": ['']
      }),
      bankStores: this.formBuilder.group({
        "supportBank": [''],
        "bankInformation": [''],
      }),
      productStores: this.formBuilder.group({
        "solutionType": [''],
        "subProduct": [''],
      })
    });

    this.data.updateData(false, 3, 1);
  }

  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    this.submissionId = localStorage.getItem("submissionId");
    this.processNumber = localStorage.getItem("processNumber");
    this.returned = localStorage.getItem("returned");
  }

  navigateTo(id: number) {
    this.route.navigate(['/add-store/', id]);
  }

  selectStore(info) {
    if (info !== null) {
      this.currentStore = info.store;
      this.currentIdx = info.idx;
      setTimeout(() => this.setFormData(), 500); //esperar um tempo para que os form seja criado e depois conseguir popular os campos com os dados certos
    }
  }


  addStore() {
    this.currentStore = new ShopDetailsAcquiring();
    this.currentStore.address = new ShopAddressAcquiring();
    this.currentStore.address.address = new FiscalAddress();
    this.currentStore.bank = new ShopBank();
    this.currentStore.bank.bank = new ShopBankingInformation();
    this.currentIdx = -1; //-1 index means new store is being created
  }

  setFormData() {
    var infoStores = this.editStores.controls["infoStores"];
    infoStores.get("storeName").setValue(this.currentStore.name);
    infoStores.get("activityStores").setValue(this.currentStore.activity);
    infoStores.get("subZoneStore").setValue(this.currentStore.address.shoppingCenter);
    infoStores.get("contactPoint").setValue(this.currentStore.manager);
    infoStores.get("subactivityStore").setValue(this.currentStore.subActivity);
    infoStores.get("localeStore").setValue(this.currentStore.address.address.postalArea);
    infoStores.get("addressStore").setValue(this.currentStore.address.address.address);
    infoStores.get("countryStore").setValue(this.currentStore.address.address.country);
    infoStores.get("zipCodeStore").setValue(this.currentStore.address.address.postalCode);
    infoStores.get("commercialCenter").setValue(this.currentStore.address.isInsideShoppingCenter);
    infoStores.get("replicateAddress").setValue(this.currentStore.address.useMerchantAddress);

    var bankStores = this.editStores.controls["bankStores"];
    bankStores.get("supportBank").setValue(this.currentStore.bank.bank.bank);
    bankStores.get("bankInformation").setValue(this.currentStore.bank.useMerchantBank);


    var productStores = this.editStores.controls["productStores"];
    productStores.get("solutionType").setValue(this.currentStore.productCode);
    productStores.get("subProduct").setValue(this.currentStore.subproductCode);
    productStores.get("url").setValue(this.currentStore.website);

  }

  deleteStore() {
    if (this.currentStore !== null) {
      this.storeService.deleteSubmissionShop(localStorage.getItem("submissionId"), this.currentStore.shopId).subscribe(result => {
        console.log("Valor retornado após a loja ter sido eliminada da submissão ", result);
        this.route.navigateByUrl('store-comp/');
      });
    }
  }

  submit(addStore: boolean) {
    if (this.editStores.valid /*&& testValues.length > 0*/) {
      var infoStores = this.editStores.get("infoStores");

      if (infoStores.get("replicateAddress").value) {
        this.currentStore.address.address.postalArea = infoStores.get("localeStore").value;
        this.currentStore.address.address.address = infoStores.get("addressStore").value;
        this.currentStore.address.address.country = infoStores.get("countryStore").value;
        this.currentStore.address.address.postalCode = infoStores.get("zipCodeStore").value;
        this.currentStore.address.useMerchantAddress = false;
      } else {
        this.currentStore.address.address.address = this.submissionClient.headquartersAddress.address;
        this.currentStore.address.address.country = this.submissionClient.headquartersAddress.country;
        this.currentStore.address.address.postalArea = this.submissionClient.headquartersAddress.postalArea;
        this.currentStore.address.address.postalCode = this.submissionClient.headquartersAddress.postalCode;
        this.currentStore.address.useMerchantAddress = true;
      }

      if (infoStores.get("commercialCenter").value) {
        this.currentStore.address.shoppingCenter = infoStores.get("subZoneStore").value;
        this.currentStore.address.isInsideShoppingCenter = true;
      } else {
        this.currentStore.address.shoppingCenter = "";
        this.currentStore.address.isInsideShoppingCenter = false;
      }

      this.currentStore.name = infoStores.get("storeName").value;
      this.currentStore.activity = infoStores.get("activityStores").value;
      this.currentStore.subActivity = infoStores.get("subactivityStore").value;
      this.currentStore.manager = infoStores.get("contactPoint").value;

      var bankStores = this.editStores.controls["bankStores"];

      this.currentStore.bank.bank.bank = bankStores.get("supportBank").value;
      this.currentStore.bank.useMerchantBank = bankStores.get("bankInformation").value;
      this.currentStore.bank.bank.iban = "";

      var productStores = this.editStores.controls["productStores"];

      this.currentStore.productCode = productStores.get("solutionType").value;
      this.currentStore.subproductCode = productStores.get("subProduct").value;
      this.currentStore.website = productStores.get("url").value;

      this.currentStore.supportEntity = TerminalSupportEntityEnum.OTHER; //de momento vou deixar este valor, não sei qual a condição para ser este valor ou outro

      if (addStore) {
        console.log('ADD');
        this.storeService.addShopToSubmission(localStorage.getItem("submissionId"), this.currentStore).subscribe(result => {
          console.log('LOJA ADICIONADA ', result);
        });
      } else {
        console.log('EDIT');
        this.storeService.updateSubmissionShop(localStorage.getItem("submissionId"), this.currentStore.shopId, this.currentStore).subscribe(result => {
          console.log('LOJA EDITADA', result);
        });
      }

      if (this.currentIdx < (this.storeList.length - 1)) {
        this.currentStore = this.storeList[this.currentIdx + 1];
        //this.currentIdx = this.currentIdx + 1;
        this.selectStore({ store: this.storeList[this.currentIdx], idx: this.currentIdx });
        this.onActivate();
      } else {
        this.data.updateData(true, 3);
        this.route.navigate(['comprovativos']);
      }
    }
  }

  fetchStartingInfo() {
    this.clientService.GetClientById(localStorage.getItem("submissionId")).subscribe(client => {
      this.submissionClient = client;
      console.log("cliente da submissao: ", this.submissionClient);
    });
  }

  onActivate() {
    let scrollToTop = window.setInterval(() => {
      let pos = window.pageYOffset;
      if (pos > 0) {
        window.scrollTo(0, pos - 100); // how far to scroll on each step
      } else {
        window.clearInterval(scrollToTop);
      }
    }, 16);
  }
}
