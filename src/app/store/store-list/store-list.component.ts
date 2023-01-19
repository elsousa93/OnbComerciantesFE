import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { Istore, ShopAddressAcquiring, ShopBank, ShopBankingInformation, ShopDetailsAcquiring } from '../IStore.interface';
import { NavigationExtras, Router } from '@angular/router';
import { DataService } from '../../nav-menu-interna/data.service';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { StoreService } from '../store.service';
import { ClientService } from '../../client/client.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Client } from '../../client/Client.interface';
import { MatSort } from '@angular/material/sort';
import { TerminalSupportEntityEnum } from '../../commercial-offer/ICommercialOffer.interface';
import { StoreTableComponent } from '../store-table/store-table.component';
import { EquipmentOwnershipTypeEnum, CommunicationOwnershipTypeEnum, ProductPackKindEnum } from '../../commercial-offer/ICommercialOffer.interface';
import { FiscalAddress } from 'src/app/stakeholders/IStakeholders.interface';
import { ProductSelectionComponent } from '../product-selection/product-selection.component';
import { AddStoreComponent } from '../add-store/add-store.component';
import { AuthService } from '../../services/auth.service';
import { User } from '../../userPermissions/user';
import { StoreIbanComponent } from '../store-iban/store-iban.component';
import { PostDocument } from '../../submission/document/ISubmission-document';
import { SubmissionDocumentService } from '../../submission/document/submission-document.service';
import { ComprovativosService } from '../../comprovativos/services/comprovativos.services';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

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

  }

  removedStoreSubject: Subject<ShopDetailsAcquiring> = new Subject<ShopDetailsAcquiring>();

  insertedStoreSubject: Subject<ShopDetailsAcquiring> = new Subject<ShopDetailsAcquiring>();

  @ViewChild(ProductSelectionComponent) productSelectionComponent: ProductSelectionComponent;
  @ViewChild(AddStoreComponent) addStoreComponent: AddStoreComponent;
  @ViewChild(StoreIbanComponent) storeIbanComponent: StoreIbanComponent;

  products: any = [];

  currentUser: User = {};
  previousStoreEvent: Observable<number>;
  public ibansToShow: { tipo: string, dataDocumento: string, file: File, id: string };

  emitRemovedStore(store) {
    this.removedStoreSubject.next(store);
  }

  emitInsertedStore(store) {
    this.insertedStoreSubject.next(store);
  }

  constructor(private translate: TranslateService, private route: Router, private data: DataService, private storeService: StoreService, private clientService: ClientService, private formBuilder: FormBuilder, private authService: AuthService, private comprovativoService: ComprovativosService, private documentService: SubmissionDocumentService, private datePipe: DatePipe) {
    authService.currentUser.subscribe(user => this.currentUser = user);
    this.initializeForm();

    this.data.updateData(false, 3, 1);
  }

  initializeForm() {
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
        "bankIban": ['']
      }),
      productStores: this.formBuilder.group({
        "solutionType": [''],
        "subProduct": [''],
      })
    });
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
    if (this.storesLength > 0 && this.currentStore != null) {
      this.resetForm();
    }
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

  close() {
    this.currentStore = null;
    this.currentIdx = -2;
  }

  updateContactPoint() {
    this.currentStore.contactPerson = this.submissionClient.legalName;
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
      var context = this;
      var infoStores = this.editStores.controls["infoStores"];
      infoStores.get("storeName").setValue(this.currentStore.name);
      infoStores.get("activityStores").setValue(this.currentStore.activity);
      infoStores.get("contactPoint").setValue(this.currentStore.contactPerson);
      infoStores.get("subactivityStore").setValue(this.currentStore.subActivity);
      infoStores.get("replicate").setValue(this.currentStore.address.useMerchantAddress);

      if (!this.currentStore.address.useMerchantAddress) {
        this.addStoreComponent.chooseAddress(false);
        infoStores.get("localeStore").setValue(this.currentStore.address.address.postalArea);
        infoStores.get("addressStore").setValue(this.currentStore.address.address.address);
        infoStores.get("countryStore").setValue(this.currentStore.address.address.country);
        infoStores.get("zipCodeStore").setValue(this.currentStore.address.address.postalCode);
      } else {
        this.addStoreComponent.chooseAddress(true);
      }

      infoStores.get("commercialCenter").setValue(this.currentStore.address.isInsideShoppingCenter);
      this.addStoreComponent.comercialCentre(this.currentStore.address.isInsideShoppingCenter);
      infoStores.get("subZoneStore").setValue(this.currentStore.address.shoppingCenter);

      var bankStores = this.editStores.controls["bankStores"];
      bankStores.get("supportBank").setValue(this.currentStore.bank.bank.bank);
      bankStores.get("bankInformation").setValue(this.currentStore.bank.useMerchantBank);

      if (!this.currentStore.bank.useMerchantBank) {
        this.storeIbanComponent.isIBAN(this.currentStore.bank.useMerchantBank);
        bankStores.get("bankIban").setValue(this.currentStore.bank.bank.iban);
        this.documentService.GetSubmissionDocumentById(this.submissionId, this.currentStore.bank.bank.iban).subscribe(val => {
          context.documentService.GetDocumentImage(context.submissionId, context.currentStore.bank.bank.iban).then(async res => {
            console.log("imagem de um documento ", res);
            
            res.blob().then(data => {
              var blob = new Blob([data], { type: 'application/pdf' });
              var file = new File([blob], context.translate.instant('supportingDocuments.checklistModal.IBAN'), { 'type': 'application/pdf' });
              context.ibansToShow = {
                dataDocumento: context.datePipe.transform(val.validUntil, 'dd-MM-yyyy'),
                file: file,
                id: context.currentStore.bank.bank.iban,
                tipo: context.translate.instant('supportingDocuments.checklistModal.IBAN')
              };
            }); 
          });
        });

      }
      var productStores = this.editStores.controls["productStores"];
      productStores.get("solutionType").setValue(this.currentStore.productCode);
      this.productSelectionComponent.chooseSolutionAPI(this.currentStore.productCode);
      productStores.get("subProduct").setValue(this.currentStore.subproductCode);
      this.productSelectionComponent.chooseSubSolutionAPI(this.currentStore.subproductCode);
      productStores.get("url").setValue(this.currentStore.website);
    }
  }

  deleteStore() {
    if (this.currentStore != null) {
      this.storeService.deleteSubmissionShop(localStorage.getItem("submissionId"), this.currentStore.id).subscribe(result => {
        this.resetForm();
        this.emitRemovedStore(this.currentStore);
        this.currentStore = null;
        this.currentIdx = -2;
        this.storeIbanComponent.removeFiles();
      });
    }
  }

  submit(addStore: boolean, isEditButton?: boolean) {
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
          this.currentStore.address.useMerchantAddress = true; //
        }
      }

      if (infoStores.get("commercialCenter").value) {
        this.currentStore.address.shoppingCenter = infoStores.get("subZoneStore").value;
        this.currentStore.address.isInsideShoppingCenter = true;
      } else {
        this.currentStore.address.shoppingCenter = null; //
        this.currentStore.address.isInsideShoppingCenter = false;
      }

      this.currentStore.name = infoStores.get("storeName").value;
      this.currentStore.activity = infoStores.get("activityStores").value;
      this.currentStore.subActivity = infoStores.get("subactivityStore").value;
      this.currentStore.contactPerson = infoStores.get("contactPoint").value;

      var bankStores = this.editStores.controls["bankStores"];

      this.currentStore.bank = {
        bank: {
          bank: bankStores.get("supportBank").value
        },
        useMerchantBank: bankStores.get("bankInformation").value
      }

      var productStores = this.editStores.controls["productStores"];

      this.currentStore.productCode = productStores.get("solutionType").value;
      this.currentStore.subproductCode = productStores.get("subProduct").value;
      this.currentStore.website = productStores.get("url").value;

      if (this.currentUser.permissions == "UNICRE") {
        this.currentStore.supportEntity = TerminalSupportEntityEnum.ACQUIRER;
      } else {
        this.currentStore.supportEntity = TerminalSupportEntityEnum.OTHER;
      }

      if (addStore) {
        this.storeService.addShopToSubmission(localStorage.getItem("submissionId"), this.currentStore).subscribe(result => {
          this.currentStore.id = result["id"];
          this.addDocumentToShop(result["id"], this.currentStore);
          this.emitInsertedStore(this.currentStore);
          this.resetForm();
          this.currentStore = null;
          this.currentIdx = -2;
        });
      } else {
        this.storeService.updateSubmissionShop(localStorage.getItem("submissionId"), this.currentStore.id, this.currentStore).subscribe(result => {
          if (isEditButton) {
            this.addDocumentToShop(this.currentStore.id, this.currentStore);
            this.resetForm();
            this.currentStore = null;
            this.currentIdx = -2;
          } else {
            if (this.currentIdx < (this.storesLength - 1)) {
              this.addDocumentToShop(this.currentStore.id, this.currentStore);
              this.emitUpdatedStore(of({ store: this.currentStore, idx: this.currentIdx }));
              this.resetForm();
            } else {
              this.addDocumentToShop(this.currentStore.id, this.currentStore);
              this.resetForm();
              this.currentStore = null;
              this.currentIdx = -2;
              this.data.updateData(true, 3);
              this.route.navigate(['comprovativos']);
            }
          }
        });
      }

    } else {
      if (this.currentStore == null) {
        this.data.updateData(true, 3);
        this.route.navigate(['comprovativos']);
      }
    }
    this.onActivate();
  }

  resetForm() {
    this.editStores.reset();
    this.editStores.get("infoStores").get("countryStore").setValue("PT");
    this.productSelectionComponent.clearSubProducts();
    this.addStoreComponent.chooseAddress(true);
    this.closeAccordion();
    this.storeIbanComponent.removeFiles();
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

  goToStakeholders() {
    if ((this.currentIdx - 1) >= 0) {
      this.emitPreviousStore(of(this.currentIdx));
    } else {
      let navigationExtras: NavigationExtras = {
        state: {
          editStakeInfo: true
        }
      }
      this.route.navigate(['/stakeholders'], navigationExtras);
    }
  }

  emitPreviousStore(idx) {
    this.previousStoreEvent = idx;
  }

  getUploadedFiles(info) {
    this.ibansToShow = info.ibansToShow;
  }

  getFile(info) {
    this.ibansToShow = info;
  }

  addDocumentToShop(storeId: string, store: ShopDetailsAcquiring) {
    if (this.ibansToShow != null) {
      var context = this;
      this.comprovativoService.readBase64(this.ibansToShow.file).then((data) => {
        var docToSend: PostDocument = {
          "documentType": "0071",
          "documentPurpose": "BankAccount",
          "file": {
            "fileType": "PDF",
            "binary": data.split(',')[1]
          },
          "validUntil": "2022-07-20T11:03:13.001Z",
          "data": {}
        }

        context.documentService.SubmissionPostDocument(localStorage.getItem("submissionId"), docToSend).subscribe(res => {
          store.bank.bank.iban = res.id;
          this.documentService.SubmissionPostDocumentToShop(localStorage.getItem("submissionId"), storeId, docToSend).subscribe(result => {
            context.storeService.updateSubmissionShop(localStorage.getItem("submissionId"), storeId, store).subscribe(res => {
              console.log('Loja Atualizada ', res);
            });
          });
        })
      })
    }
  }
}
