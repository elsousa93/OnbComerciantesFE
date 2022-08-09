import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Istore, ShopDetailsAcquiring, ShopsListOutbound } from '../IStore.interface';
import { Router } from '@angular/router';
import { DataService } from '../../nav-menu-interna/data.service';
import { Subscription } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Configuration, configurationToken } from 'src/app/configuration';
import { StoreService } from '../store.service';
import { ClientService } from '../../client/client.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';


interface Stores {
  storeName: string;
  activity: string;
  subactivity: string;
  zone: string;
}

const testValues: ShopDetailsAcquiring[] = [
  {
    activity: "Activity1",
    address:
    {
      isInsideShoppingCenter: true, sameAsMerchantAddress: true, shoppingCenter: "Colombo",
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
    productCode: "432",
    subActivity: "99",
    subproductCode: "0",
    website: "google.com"
  },
  {
    activity: "Activity2",
    address:
    {
      isInsideShoppingCenter: true,
      sameAsMerchantAddress: true,
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
      userMerchantBank: true
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
    productCode: "432",
    subActivity: "99",
    subproductCode: "01",
    website: "google.com"
  },
]

//This component displays the list of the existing stores

@Component({
  selector: 'app-store-list',
  templateUrl: './store-list.component.html',
  styleUrls: ['./store-list.component.css']
})
export class StoreComponent implements AfterViewInit{
  storesMat: MatTableDataSource<ShopDetailsAcquiring>;

  private baseUrl: string;

  public edit: string = "true";

  /*variable declaration*/
  public stores: Istore[] = [];
  public clientID: number = 12345678;

  public map: Map<number, boolean>;
  public currentPage: number;
  public subscription: Subscription;

  displayedColumns: string[] = ['nameEstab', 'activityEstab', 'subActivityEstab', 'zoneEstab'];

  @ViewChild(MatPaginator) paginator: MatPaginator;

  public storeList: ShopDetailsAcquiring[] = [];
  public currentStore: ShopDetailsAcquiring = null;
  public currentIdx: number = 0;

  formStores: FormGroup;
  editStores: FormGroup;

  ngAfterViewInit() {
    //this.storesMat = new MatTableDataSource();
    this.storesMat.paginator = this.paginator;
  }

  constructor(http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private route: Router, private data: DataService, private storeService: StoreService, private clientService: ClientService, private formBuilder: FormBuilder)
  {
    this.baseUrl = configuration.baseUrl;
     
    this.ngOnInit();

    //Ir buscar a lista de lojas associadas ao merchant, caso existam
    //this.clientService.GetClientById(localStorage.getItem("submissionId")).subscribe(result => {
    //  this.storeService.getShopsListOutbound(result.clientId, "por mudar", "por mudar").subscribe(res => {
    //    this.loadStores(res);
    //  });
    //});

    //this.storeService.getSubmissionShopsList(localStorage.getItem("submissionId")).subscribe(result => {
    //  result.forEach(value => {
    //    this.storeService.getSubmissionShopDetails(localStorage.getItem("submissionId"), value.id).subscribe(res => {
    //      this.storeList.push(res);
    //      console.log('Lista obtida ', result);
    //      console.log('Info detalhada de cada loja ', res);
    //    });
    //  });
    //  this.loadStores(this.storeList);
    //  console.log('Lista após ter ido buscar todas as lojas recebidas ', this.storeList);
    //});
    this.editStores = this.formBuilder.group({});
    this.formStores = this.formBuilder.group({});

    this.data.updateData(false, 3, 1);
  }
  
  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    this.loadStores();
  }

  navigateTo(id: number) {
    this.route.navigate(['/add-store/', id]);
  }

  selectStore(store: ShopDetailsAcquiring, idx: number) {
    this.currentStore = store;
    this.currentIdx = idx;
    console.log("Store selected ", this.currentStore);
    console.log("Current index ", this.currentIdx);
    console.log(this.currentStore === store);
  }

  loadStores(storesValues: ShopDetailsAcquiring[] = testValues) {
    this.storesMat = new MatTableDataSource(storesValues);
    this.storesMat.paginator = this.paginator;
  }

  deleteStore() {
    if (this.currentStore !== null) {
      this.storeService.deleteSubmissionShop(localStorage.getItem("submissionId"), this.currentStore.id).subscribe(result => {
        console.log("Valor retornado após a loja ter sido eliminada da submissão ", result);
      });
    }
  }
}
