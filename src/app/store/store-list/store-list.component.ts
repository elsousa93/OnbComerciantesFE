import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
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

  submissionClient: Client;
  returned: string;

  ngAfterViewInit() {
    //this.storesMat = new MatTableDataSource();
    this.storesMat.paginator = this.paginator;
  }

  constructor(http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private route: Router, private data: DataService, private storeService: StoreService, private clientService: ClientService, private formBuilder: FormBuilder, private submissionService: SubmissionService)
  {
    this.baseUrl = configuration.baseUrl;
     
    this.ngOnInit();

    //Ir buscar as lojas que já se encontram associadas à submissão em que nos encontramos, ou seja, se adicionarmos uma submissão nova
    this.storeService.getSubmissionShopsList(localStorage.getItem("submissionId")).subscribe(result => {
      result.forEach(value => {
        this.storeService.getSubmissionShopDetails(localStorage.getItem("submissionId"), value.id).subscribe(res => {
          this.storeList.push(res);
        });
      });
      this.loadStores(this.storeList);
    });

    //Caso seja DEVOLUÇÃO OU CONSULTA - Vamos buscar as lojas que foram inseridas na ultima submissão.
    if (this.returned !== null) {
      this.submissionService.GetSubmissionByProcessNumber(localStorage.getItem("processNumber")).subscribe(result => {
        this.storeService.getSubmissionShopsList(result[0].submissionId).subscribe(resul => {
          resul.forEach(val => {
            this.storeService.getSubmissionShopDetails(result[0].submissionId, val.id).subscribe(res => {
              var index = this.storeList.findIndex(store => store.id == res.id);
              if(index == -1) // só adicionamos a Loja caso esta ainda n exista na lista
                this.storeList.push(res);
            });
          });
          this.loadStores(this.storeList);
        })
      });
    }

    this.editStores = this.formBuilder.group({});

    this.data.updateData(false, 3, 1);
  }
  
  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    this.loadStores();
    this.returned = localStorage.getItem("returned");
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


    var productStores = this.editStores.controls["productStores"];
    productStores.get("solutionType").setValue(this.currentStore.productCode);
    productStores.get("subProduct").setValue(this.currentStore.subproductCode);
    productStores.get("url").setValue(this.currentStore.website);

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

  submit() {
    console.log('Store list form ', this.editStores);
    console.log('Replicate address ', this.editStores.controls["infoStores"].get("replicateAddress").value);
    if (this.editStores.valid && testValues.length > 0) {
      var infoStores = this.editStores.controls["infoStores"];

      if (infoStores.get("replicateAddress").value) {
        this.currentStore.address.address.postalArea = infoStores.get("localeStore").value;
        this.currentStore.address.address.address = infoStores.get("addressStore").value;
        this.currentStore.address.address.country = infoStores.get("countryStore").value;
        this.currentStore.address.address.postalCode = infoStores.get("zipCodeStore").value;
      } else {
        this.currentStore.address.address.address = this.submissionClient.headquartersAddress.address;
        this.currentStore.address.address.country = this.submissionClient.headquartersAddress.country;
        this.currentStore.address.address.postalArea = this.submissionClient.headquartersAddress.postalArea;
        this.currentStore.address.address.postalCode = this.submissionClient.headquartersAddress.postalCode;
        this.currentStore.address.useMerchantAddress = true;
      }

      if (infoStores.get("subZoneStore").hasValidator(Validators.required)) {
        this.currentStore.address.shoppingCenter = infoStores.get("subZoneStore").value;
      } else {
        this.currentStore.address.shoppingCenter = "";
      }

      this.currentStore.name = infoStores.get("storeName").value;
      this.currentStore.activity = infoStores.get("activityStores").value;
      this.currentStore.subActivity = infoStores.get("subactivityStore").value;
      this.currentStore.manager = infoStores.get("contactPoint").value;

      var bankStores = this.editStores.controls["bankStores"];

      this.currentStore.bank.bank.bank = bankStores.get("supportBank").value;
      this.currentStore.bank.userMerchantBank = bankStores.get("bankInformation").value;

      var productStores = this.editStores.controls["productStores"];

      this.currentStore.productCode = productStores.get("solutionType").value;
      this.currentStore.subproductCode = productStores.get("subProduct").value;
      this.currentStore.website = productStores.get("url").value;

      //this.storeService.updateSubmissionShop(localStorage.getItem("submissionId"), this.currentStore.id, this.currentStore).subscribe(result => {
      //  if (this.currentIdx < (this.storeList.length - 1)) {
      //    this.currentIdx = this.currentIdx + 1;
      //    this.selectStore(this.storeList[this.currentIdx], this.currentIdx);
      //  } else {
      //    this.route.navigate(['comprovativos']);
      //  }
      //});
      if (this.currentIdx < (testValues.length - 1)) {
        this.currentIdx = this.currentIdx + 1;
        this.selectStore(testValues[this.currentIdx], this.currentIdx);
        this.onActivate();
      } else {
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
