import { AfterViewInit, ChangeDetectorRef, Component, Inject, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Istore, ShopAddressAcquiring, ShopBank, ShopBankingInformation, ShopDetailsAcquiring } from '../IStore.interface';
import { Router } from '@angular/router';
import { DataService } from '../../nav-menu-interna/data.service';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { Configuration, configurationToken } from 'src/app/configuration';
import { StoreService } from '../store.service';
import { ClientService } from '../../client/client.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Client } from '../../client/Client.interface';
import { SubmissionService } from '../../submission/service/submission-service.service';
import { MatSort } from '@angular/material/sort';
import { TerminalSupportEntityEnum } from '../../commercial-offer/ICommercialOffer.interface';
import { StoreTableComponent } from '../store-table/store-table.component';
import { EquipmentOwnershipTypeEnum, CommunicationOwnershipTypeEnum, ProductPackKindEnum } from '../../commercial-offer/ICommercialOffer.interface';
import { FiscalAddress } from 'src/app/stakeholders/IStakeholders.interface';
import { ProductSelectionComponent } from '../product-selection/product-selection.component';
import { AddStoreComponent } from '../add-store/add-store.component';
import { AuthService } from '../../services/auth.service';
import { User } from '../../userPermissions/user';

@Component({
  selector: 'app-store-list',
  templateUrl: './store-list.component.html',
  styleUrls: ['./store-list.component.css'],
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

  updatedStoreEvent: Observable<{ store: ShopDetailsAcquiring, idx: number }>;
  storesLength: number = 0;

  ngAfterViewInit() {
    //this.storesMat = new MatTableDataSource();
    //this.storesMat.paginator = this.paginator;
    //this.storesMat.sort = this.sort;
  }

  removedStoreSubject: Subject<ShopDetailsAcquiring> = new Subject<ShopDetailsAcquiring>();

  insertedStoreSubject: Subject<ShopDetailsAcquiring> = new Subject<ShopDetailsAcquiring>();

  @ViewChild(ProductSelectionComponent) productSelectionComponent: ProductSelectionComponent;
  @ViewChild(AddStoreComponent) addStoreComponent: AddStoreComponent;

  products: any = [];

  currentUser: User = {};

  emitRemovedStore(store) {
    this.removedStoreSubject.next(store);
  }

  emitInsertedStore(store) {
    this.insertedStoreSubject.next(store);
  }

  constructor(http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private route: Router, private data: DataService, private storeService: StoreService, private clientService: ClientService, private formBuilder: FormBuilder, private submissionService: SubmissionService, private ref: ChangeDetectorRef, private authService: AuthService) {
    this.baseUrl = configuration.baseUrl;
    authService.currentUser.subscribe(user => this.currentUser = user);
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
        "replicate": ['']
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
    this.fetchStartingInfo();
  }

  navigateTo(id: number) {
    this.route.navigate(['/add-store/', id]);
  }

  selectStore(info) {
    if (info.store != null && info.idx != null) {
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
    if (this.submissionClient.merchantType.toLowerCase() == 'entrepeneur' || this.submissionClient.merchantType == '02') {
      setTimeout(() => this.updateContactPoint(), 100);
    }
  }

  updateContactPoint() {
    this.currentStore.manager = this.submissionClient.legalName;
    this.editStores.controls["infoStores"].get("contactPoint").setValue(this.submissionClient.legalName);
    this.editStores.controls["infoStores"].get("contactPoint").updateValueAndValidity();
  }

  closeAccordion() {
    document.getElementById("flush-collapseOne").className = "accordion-collapse collapse";
    document.getElementById("accordionButton1").className = "accordion1-button collapsed";
    document.getElementById("flush-collapseTwo").className = "accordion-collapse collapse";
    document.getElementById("accordionButton2").className = "accordion1-button collapsed";
    document.getElementById("flush-collapseThree").className = "accordion-collapse collapse";
    document.getElementById("accordionButton3").className = "accordion1-button collapsed";
  }

  setFormData() {
    if (this.currentStore != null) { 
      var infoStores = this.editStores.controls["infoStores"];
      console.log("FORM INFO STORES AO SELECIONAR UMA LOJA ", this.editStores);
      infoStores.get("storeName").setValue(this.currentStore.name);
      infoStores.get("activityStores").setValue(this.currentStore.activity);
      infoStores.get("subZoneStore").setValue(this.currentStore.address.shoppingCenter);
      infoStores.get("contactPoint").setValue(this.currentStore.manager);
      infoStores.get("subactivityStore").setValue(this.currentStore.subActivity);
      infoStores.get("commercialCenter").setValue(this.currentStore.address.isInsideShoppingCenter);
      infoStores.get("replicate").setValue(this.currentStore.address.useMerchantAddress);

      if (!this.currentStore.address.useMerchantAddress) {
        this.addStoreComponent.chooseAddress(false);
        infoStores.get("localeStore").setValue(this.currentStore.address.address.postalArea);
        infoStores.get("addressStore").setValue(this.currentStore.address.address.address);
        infoStores.get("countryStore").setValue(this.currentStore.address.address.country);
        infoStores.get("zipCodeStore").setValue(this.currentStore.address.address.postalCode);
      }

      var bankStores = this.editStores.controls["bankStores"];
      bankStores.get("supportBank").setValue(this.currentStore.bank.bank.bank);
      bankStores.get("bankInformation").setValue(this.currentStore.bank.useMerchantBank);


      var productStores = this.editStores.controls["productStores"];
      productStores.get("solutionType").setValue(this.currentStore.productCode);
      this.productSelectionComponent.chooseSolutionAPI(this.currentStore.productCode);
      productStores.get("subProduct").setValue(this.currentStore.subproductCode);

      productStores.get("url").setValue(this.currentStore.website);
    }
  }

  deleteStore() {
    if (this.currentStore !== null) {
      this.storeService.deleteSubmissionShop(localStorage.getItem("submissionId"), this.currentStore.id).subscribe(result => {
        console.log("Valor retornado após a loja ter sido eliminada da submissão ", result);
        this.resetForm();
        this.emitRemovedStore(this.currentStore);
        this.currentStore = null;
      });
    }
  }

  submit(addStore: boolean) {
    if (this.editStores.valid) {
      var infoStores = this.editStores.get("infoStores");

      if (!infoStores.get("replicate").value) {
        this.currentStore.address.address.postalArea = infoStores.get("localeStore").value;
        this.currentStore.address.address.address = infoStores.get("addressStore").value;
        this.currentStore.address.address.country = infoStores.get("countryStore").value;
        this.currentStore.address.address.postalCode = infoStores.get("zipCodeStore").value;
        this.currentStore.address.useMerchantAddress = false;
      } else {
        if (this.submissionClient.headquartersAddress != null) {
          this.currentStore.address.address.address = this.submissionClient.headquartersAddress.address;
          this.currentStore.address.address.country = this.submissionClient.headquartersAddress.country;
          this.currentStore.address.address.postalArea = this.submissionClient.headquartersAddress.postalArea;
          this.currentStore.address.address.postalCode = this.submissionClient.headquartersAddress.postalCode;
          this.currentStore.address.useMerchantAddress = true;
        }
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

      if (this.currentUser.permissions == "UNICRE") {
        this.currentStore.supportEntity = TerminalSupportEntityEnum.ACQUIRER;
      } else {
        this.currentStore.supportEntity = TerminalSupportEntityEnum.OTHER;
      }

      console.log("ESTRUTURA DE DADOS DA LOJA ANTES DE SER ADICIONADA ", this.currentStore);
      if (addStore) {
        this.storeService.addShopToSubmission(localStorage.getItem("submissionId"), this.currentStore).subscribe(result => {
          console.log('LOJA ADICIONADA ', result);
          this.currentStore.id = result["id"];
          this.emitInsertedStore(this.currentStore);
          this.resetForm();
        });
      } else {
        if (this.currentStore != null || this.currentStore != undefined) {
          this.storeService.updateSubmissionShop(localStorage.getItem("submissionId"), this.currentStore.id, this.currentStore).subscribe(result => {
            console.log('LOJA EDITADA', result);
            if (this.currentIdx < (this.storesLength - 1)) {
              this.emitUpdatedStore(of({ store: this.currentStore, idx: this.currentIdx }));
              this.onActivate();
              this.resetForm();
            } else {
              this.data.updateData(true, 3);
              this.route.navigate(['comprovativos']);
            }
          });
        } else {
          this.data.updateData(true, 3);
          this.route.navigate(['comprovativos']);
        }
      }
    }
  }

  resetForm() {
    this.editStores.reset();
    this.productSelectionComponent.clearSubProducts();
    this.addStoreComponent.chooseAddress(true);
    this.closeAccordion();
  }

  emitUpdatedStore(info) {
    this.updatedStoreEvent = info;
  }

  getStoresListLength(length) {
    this.storesLength = length;
  }

  fetchStartingInfo() {
    this.clientService.GetClientByIdAcquiring(localStorage.getItem("submissionId")).then(client => {
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
