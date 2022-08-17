import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Configuration, configurationToken } from 'src/app/configuration';
import { DataService } from '../../nav-menu-interna/data.service';
import { Istore, ShopDetailsAcquiring } from '../../store/IStore.interface';
import { NGXLogger } from 'ngx-logger';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormGroup } from '@angular/forms';
import { MatSort } from '@angular/material/sort';


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
    website: "google.com"
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
    website: "google.com"
  },
]

@Component({
  selector: 'app-commercial-offer-list',
  templateUrl: './commercial-offer-list.component.html',
  styleUrls: ['./commercial-offer-list.component.css']
})
export class CommercialOfferListComponent implements OnInit {

  storesOfferMat: MatTableDataSource<ShopDetailsAcquiring>;

  editStores: FormGroup;
  private baseUrl: string;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  public stores: Istore[] = [];
  public clientID: number = 12345678;

  /*Is it supposed to relicate the Commercial offert from another store?*/
  selectionsReplicate = ['Não', 'Sim'];
  /*Default case*/
  selectedOption = 'Não';

  public subscription: Subscription;
  public map: Map<number, boolean>;
  public currentPage : number;
  public currentStore: ShopDetailsAcquiring = null;
  public currentIdx: number = 0;

  public isUnicre: boolean = false;
  public geographyChecked: boolean = false;

  displayedColumns: string[] = ['nameEstab', 'activityEstab', 'subActivityEstab', 'bank', 'terminalNumber', 'product'];

  ngAfterViewInit() {
    //this.storesMat = new MatTableDataSource();
    this.storesOfferMat.paginator = this.paginator;
  }

  constructor(private logger : NGXLogger, http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private route: Router, private data: DataService) {
    this.baseUrl = configuration.baseUrl;

    /*Get stores list*/
    this.ngOnInit();
    http.get<Istore[]>(this.baseUrl + 'bestores/GetAllStores/' + this.clientID).subscribe(result => {
      this.logger.debug(result);
      this.stores = result;
    }, error => console.error(error));
    this.data.updateData(false, 5);
  }

  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    this.loadStores();
  }

  loadStores(storesValues: ShopDetailsAcquiring[] = testValues) {
    this.storesOfferMat = new MatTableDataSource(storesValues);
    this.storesOfferMat.paginator = this.paginator;
  }

  selectStore(store: ShopDetailsAcquiring, idx: number) {
    this.currentStore = store;
    this.currentIdx = idx;
    console.log("Store selected ", this.currentStore);
    console.log("Current index ", this.currentIdx);
    console.log(this.currentStore === store);
    setTimeout(() => this.setFormData(), 500); //esperar um tempo para que os form seja criado e depois conseguir popular os campos com os dados certos
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
    bankStores.get("bankInformation").setValue(this.currentStore.bank.userMerchantBank);
    bankStores.get("solutionType").setValue(this.currentStore.productCode);
    bankStores.get("subProduct").setValue(this.currentStore.subproductCode);
    bankStores.get("url").setValue(this.currentStore.website);

  }

  onCickContinue() {
    this.route.navigate(['commercial-offert-tariff']);
  }

  changeUnicre(bool: boolean){
    this.isUnicre = bool;
  }
}
