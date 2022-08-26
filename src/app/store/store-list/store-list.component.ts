import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Istore, ShopDetailsAcquiring, ShopsListOutbound } from '../IStore.interface';
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
import { TerminalSupportEntityEnum } from '../../commercial-offer/ICommercialOffer';
import { StoreTableComponent } from '../store-table/store-table.component';

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
    this.storesMat.paginator = this.paginator;
    this.storesMat.sort = this.sort;
  }

  constructor(http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private route: Router, private data: DataService, private storeService: StoreService, private clientService: ClientService, private formBuilder: FormBuilder, private submissionService: SubmissionService)
  {
    this.baseUrl = configuration.baseUrl;
     
    this.ngOnInit();

    this.editStores = this.formBuilder.group({});

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
    this.currentStore = info.store;
    this.currentIdx = info.idx;
    setTimeout(() => this.setFormData(), 500); //esperar um tempo para que os form seja criado e depois conseguir popular os campos com os dados certos
  }

  setFormData() {
    var infoStores = this.editStores.controls["infoStores"];
    infoStores.get("storeName").setValue(this.currentStore.name);
    infoStores.get("activityStores").setValue(this.currentStore.activity);
    infoStores.get("subZoneStore").setValue(this.currentStore.address.shoppingCenter);
    infoStores.get("contactPoint").setValue(this.currentStore.manager);
    //infoStores.get("subactivityStore").setValue(this.currentStore.subActivity);
    infoStores.get("localeStore").setValue(this.currentStore.address.address.postalArea);
    infoStores.get("addressStore").setValue(this.currentStore.address.address.address);
    infoStores.get("countryStore").setValue(this.currentStore.address.address.country);
    infoStores.get("zipCodeStore").setValue(this.currentStore.address.address.postalCode);
    infoStores.get("commercialCenter").setValue(this.currentStore.address.isInsideShoppingCenter);
    infoStores.get("replicateAddress").setValue(this.currentStore.address.useMerchantAddress);

    var bankStores = this.editStores.controls["bankStores"];
    bankStores.get("supportBank").setValue(this.currentStore.bank.bank.bank);
    bankStores.get("bankInformation").setValue(this.currentStore.bank.userMerchantBank);


    var productStores = this.editStores.controls["productStores"];
    productStores.get("solutionType").setValue(this.currentStore.productCode);
    productStores.get("subProduct").setValue(this.currentStore.subproductCode);
    productStores.get("url").setValue(this.currentStore.website);

  }

  deleteStore() {
    if (this.currentStore !== null) {
      this.storeService.deleteSubmissionShop(localStorage.getItem("submissionId"), this.currentStore.id).subscribe(result => {
        console.log("Valor retornado após a loja ter sido eliminada da submissão ", result);
        this.route.navigateByUrl('store-comp/');
      });
    }
  }

  submit() {
    //if (this.editStores.valid /*&& testValues.length > 0*/) {
      //var infoStores = this.editStores.controls["infoStores"];

      //if (infoStores.get("replicateAddress").value) {
      //  this.currentStore.address.address.postalArea = infoStores.get("localeStore").value;
      //  this.currentStore.address.address.address = infoStores.get("addressStore").value;
      //  this.currentStore.address.address.country = infoStores.get("countryStore").value;
      //  this.currentStore.address.address.postalCode = infoStores.get("zipCodeStore").value;
      //} else {
      //  this.currentStore.address.address.address = this.submissionClient.headquartersAddress.address;
      //  this.currentStore.address.address.country = this.submissionClient.headquartersAddress.country;
      //  this.currentStore.address.address.postalArea = this.submissionClient.headquartersAddress.postalArea;
      //  this.currentStore.address.address.postalCode = this.submissionClient.headquartersAddress.postalCode;
      //  this.currentStore.address.useMerchantAddress = true;
      //}

      //if (infoStores.get("subZoneStore").hasValidator(Validators.required)) {
      //  this.currentStore.address.shoppingCenter = infoStores.get("subZoneStore").value;
      //} else {
      //  this.currentStore.address.shoppingCenter = "";
      //}

      //this.currentStore.name = infoStores.get("storeName").value;
      //this.currentStore.activity = infoStores.get("activityStores").value;
      //this.currentStore.subActivity = infoStores.get("subactivityStore").value;
      //this.currentStore.manager = infoStores.get("contactPoint").value;

      //var bankStores = this.editStores.controls["bankStores"];

      //this.currentStore.bank.bank.bank = bankStores.get("supportBank").value;
      //this.currentStore.bank.userMerchantBank = bankStores.get("bankInformation").value;

      //var productStores = this.editStores.controls["productStores"];

      //this.currentStore.productCode = productStores.get("solutionType").value;
      //this.currentStore.subproductCode = productStores.get("subProduct").value;
      //this.currentStore.website = productStores.get("url").value;

      //this.storeService.updateSubmissionShop(localStorage.getItem("submissionId"), this.currentStore.id, this.currentStore).subscribe(result => {
      //  if (this.currentIdx < (this.storeList.length - 1)) {
      //    this.currentIdx = this.currentIdx + 1;
      //    this.selectStore(this.storeList[this.currentIdx], this.currentIdx);
      //  } else {
      //    this.route.navigate(['comprovativos']);
      //  }
      //});
      //if (this.currentIdx < (testValues.length - 1)) {
      this.currentIdx = this.currentIdx + 1;
      this.selectStore({ store: testValues[this.currentIdx], idx: this.currentIdx });
      this.onActivate();
      //} else {
        //this.data.updateData(true, 3);
        //this.route.navigate(['comprovativos']);
      //}
    //}

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
