import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { Istore, ShopAddressAcquiring, ShopBank, ShopBankingInformation, ShopDetailsAcquiring } from '../IStore.interface';
import { NavigationExtras, Router } from '@angular/router';
import { DataService } from '../../nav-menu-interna/data.service';
import { distinctUntilChanged, Observable, of, Subject, Subscription } from 'rxjs';
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
import { LoggerService } from '../../logger.service';
import { ProcessService } from '../../process/process.service';
import { ProcessNumberService } from '../../nav-menu-presencial/process-number.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

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
  shops: boolean;
  public visitedStores: string[] = [];
  updateProcessId: string;
  subActivityChanged: boolean = false;
  activityChanged: boolean = false;
  bankChanged: boolean = false;

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
  queueName: string = "";
  title: string;
  processId: string;
  deleteModalRef: BsModalRef | undefined;
  @ViewChild('deleteModal') deleteModal;

  updateModalRef: BsModalRef | undefined;
  @ViewChild('updateModal') updateModal;
  processInfo: any;

  emitRemovedStore(store) {
    this.removedStoreSubject.next(store);
  }

  emitInsertedStore(store) {
    this.insertedStoreSubject.next(store);
  }

  constructor(private translate: TranslateService, private route: Router, private data: DataService, private storeService: StoreService, private clientService: ClientService, private formBuilder: FormBuilder, private authService: AuthService, private comprovativoService: ComprovativosService, private documentService: SubmissionDocumentService, private datePipe: DatePipe, private logger: LoggerService, private processService: ProcessService, private processNrService: ProcessNumberService, private modalService: BsModalService) {
    this.data.currentShops.subscribe(shops => this.shops = shops);
    authService.currentUser.subscribe(user => this.currentUser = user);
    this.initializeForm();

    if (!this.shops) {
      this.data.updateData(false, 3, 1);
    } else {
      this.data.updateData(true, 3, 1);
    }
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
        "solutionName": [''],
        "subProductName": ['']
      })
    });
  }

  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    this.subscription = this.processNrService.processId.subscribe(id => this.processId = id);
    this.subscription = this.processNrService.updateProcessId.subscribe(id => this.updateProcessId = id);
    this.subscription = this.data.currentQueueName.subscribe(queueName => {
      if (queueName != null) {
        this.translate.get('homepage.diaryPerformance').subscribe((translated: string) => {
          this.queueName = this.translate.instant('homepage.' + queueName);
          this.title = this.translate.instant('stores.title');
        });
      }
    });
    this.submissionId = localStorage.getItem("submissionId");
    this.processNumber = localStorage.getItem("processNumber");
    this.returned = localStorage.getItem("returned");
    this.fetchStartingInfo();
  }

  navigateTo(id: number) {
    this.route.navigate(['/add-store/', id]);
  }

  getVisitedStores(visitedStores) {
    this.visitedStores = visitedStores;
  }

  selectStore(info) {
    if (info.store != null && info.idx != null) {
      if (this.currentIdx > -1) {
        if (info.clickedTable) {
          this.submit(false, false, true);
        }
      }
      this.currentStore = info.store;
      this.currentIdx = info.idx;
      setTimeout(() => this.setFormData(), 500); //esperar um tempo para que os form seja criado e depois conseguir popular os campos com os dados certos
    }
  }

  addStore() {
    if (this.storesLength > 0 && this.currentStore != null) {
      this.resetForm();
      this.productSelectionComponent.chooseSolutionOne();
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
    this.resetForm();
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
        infoStores.get("commercialCenter").setValue(this.currentStore.address.isInsideShoppingCenter);
        this.addStoreComponent.comercialCentre(this.currentStore.address.isInsideShoppingCenter);
        infoStores.get("subZoneStore").setValue(this.currentStore.address.shoppingCenter);
      } else {
        this.addStoreComponent.chooseAddress(true);
        infoStores.get("commercialCenter").setValue(this.currentStore.address.isInsideShoppingCenter);
        this.addStoreComponent.comercialCentre(this.currentStore.address.isInsideShoppingCenter);
        if (this.submissionClient.headquartersAddress.address != null) {
          infoStores.get("subZoneStore").setValue(this.currentStore.address.shoppingCenter);
        } else {
          if (this.currentStore.address.isInsideShoppingCenter && this.currentStore.address.useMerchantAddress) {
            infoStores.get("zipCodeStore").setValue(this.currentStore.address.shoppingCenterPostalCode); // antes estava postalCode
            this.addStoreComponent.GetComercialCenterByZipCode();
            infoStores.get("subZoneStore").setValue(this.currentStore.address.shoppingCenter);
          }
        }
      }

      var bankStores = this.editStores.controls["bankStores"];
      bankStores.get("supportBank").setValue(this.currentStore.bank.bank.bank);
      bankStores.get("bankInformation").setValue(this.currentStore.bank.useMerchantBank);
      this.storeIbanComponent.isIBAN(this.currentStore.bank.useMerchantBank);
      if (!this.currentStore.bank.useMerchantBank) {
        bankStores.get("bankIban").setValue(this.currentStore.bank.bank.iban);
        if (this.returned == null || this.returned == 'edit' && (this.processId == '' || this.processId == null)) {
          if (context.currentStore.documents?.length > 0) {
            context.documentService.GetDocumentImage(context.submissionId, context.currentStore?.documents[0]?.id).then(async res => {
              context.logger.info("Get document image result: " + JSON.stringify(res));
              res.blob().then(data => {
                var blob = new Blob([data], { type: 'application/pdf' });
                var file = new File([blob], context.translate.instant('supportingDocuments.checklistModal.IBAN'), { 'type': 'application/pdf' });
                context.ibansToShow = {
                  dataDocumento: context.currentStore?.documents[0]?.validUntil == null ? "desconhecido" : context.datePipe.transform(context.currentStore?.documents[0]?.validUntil, 'dd-MM-yyyy'),
                  file: file,
                  id: context.currentStore?.documents[0]?.id,
                  tipo: context.translate.instant('supportingDocuments.checklistModal.IBAN')
                };
              });
            });
          }
        } else {
          if (context.currentStore.documents?.length > 0) {
            context.processService.getDocumentImageFromProcess(context.processId, context.currentStore?.documents[0]?.id).then(async res => {
              context.logger.info("Get document image result: " + JSON.stringify(res));
              res.blob().then(data => {
                var blob = new Blob([data], { type: 'application/pdf' });
                var file = new File([blob], context.translate.instant('supportingDocuments.checklistModal.IBAN'), { 'type': 'application/pdf' });
                context.ibansToShow = {
                  dataDocumento: context.currentStore?.documents[0]?.validUntil == null ? "desconhecido" : context.datePipe.transform(context.currentStore?.documents[0]?.validUntil, 'dd-MM-yyyy'),
                  file: file,
                  id: context.currentStore?.documents[0]?.id,
                  tipo: context.translate.instant('supportingDocuments.checklistModal.IBAN')
                };
              });
            });
          }
        }
      } else {
        this.ibansToShow = null;
      }
      setTimeout(() => {
        var productStores = this.editStores.controls["productStores"];
        productStores.get("solutionType").setValue(this.currentStore.productCode);
        this.productSelectionComponent.chooseSolutionAPI(this.currentStore.productCode);
        productStores.get("subProduct").setValue(this.currentStore.subProductCode);
        this.productSelectionComponent.chooseSubSolutionAPI(this.currentStore.subProductCode);
        productStores.get("url")?.setValue(this.currentStore.website);
      }, 500);

      infoStores.get("activityStores").valueChanges.pipe(distinctUntilChanged()).subscribe(activity => {
        if (activity != this.currentStore.activity) {
          if (this.currentStore.pack != null)
            this.activityChanged = true;
        } else {
          this.activityChanged = false;
        }
      });
      infoStores.get("subactivityStore").valueChanges.pipe(distinctUntilChanged()).subscribe(subActivity => {
        if (subActivity != this.currentStore.subActivity) {
          if (this.currentStore.pack != null)
            this.subActivityChanged = true;
        } else {
          this.subActivityChanged = false;
        }
      });
      bankStores.get("supportBank").valueChanges.pipe(distinctUntilChanged()).subscribe(bank => {
        if (bank != this.currentStore.bank?.bank?.bank) {
          if (this.currentStore.pack != null)
            this.bankChanged = true;
        } else {
          this.bankChanged = false;
        }
      });
    }
  }

  closeDeleteModal() {
    this.deleteModalRef?.hide();
  }

  delete() {
    this.deleteModalRef = this.modalService.show(this.deleteModal, { class: 'modal-lg' });
  }

  deleteStore() {
    if (this.currentStore != null && this.returned != 'consult') {
      if (this.returned == null || (this.returned == 'edit' && (this.processId == null || this.processId == ''))) {
        if (this.currentStore.documents?.length > 0) {
          this.currentStore.documents.forEach(val => {
            this.documentService.DeleteDocumentFromSubmission(localStorage.getItem("submissionId"), val.id).subscribe(res => {
            });
          });
        }
        this.storeService.deleteSubmissionShop(localStorage.getItem("submissionId"), this.currentStore.id).subscribe(result => {
          this.deleteModalRef?.hide();
          this.logger.info("Deleted shop result: " + JSON.stringify(result));
          this.resetForm();
          this.emitRemovedStore(this.currentStore);
          this.currentStore = null;
          this.currentIdx = -2;
          this.storeIbanComponent.removeFiles();
        });
      } else {
        if (this.currentStore.documents?.length > 0) {
          this.currentStore.documents.forEach(val => {
            this.documentService.DeleteDocumentFromProcess(this.processId, val.id).subscribe(res => {
            });
          });
        }
        this.storeService.deleteShopProcess(this.processId, this.currentStore.id).subscribe(result => {
          this.deleteModalRef?.hide();
          this.logger.info("Deleted shop result: " + JSON.stringify(result));
          this.resetForm();
          this.emitRemovedStore(this.currentStore);
          this.currentStore = null;
          this.currentIdx = -2;
          this.storeIbanComponent.removeFiles();
        });
      }
    }
  }

  submit(addStore: boolean, isEditButton?: boolean, clickedTable: boolean = false) {
    if (this.returned != 'consult') {
      if (this.editStores.valid) {
        var infoStores = this.editStores.get("infoStores");

        if (!infoStores.get("replicate").value) {
          this.currentStore.address.address.postalArea = infoStores.get("localeStore").value;
          this.currentStore.address.address.address = infoStores.get("addressStore").value;
          this.currentStore.address.address.country = infoStores.get("countryStore").value;
          this.currentStore.address.address.postalCode = infoStores.get("zipCodeStore").value;
          this.currentStore.address.useMerchantAddress = false;
        } else {
          this.currentStore.address.useMerchantAddress = true;
          if (this.submissionClient.headquartersAddress.address != null) {
            this.currentStore.address.address.address = this.submissionClient.headquartersAddress.address;
            this.currentStore.address.address.country = this.submissionClient.headquartersAddress.country;
            this.currentStore.address.address.postalArea = this.submissionClient.headquartersAddress.postalArea;
            this.currentStore.address.address.postalCode = this.submissionClient.headquartersAddress.postalCode;
          } else {
            this.currentStore.address.shoppingCenterPostalCode = infoStores.get("zipCodeStore").value; //antes estava address.postalCode
          }
        }

        if (infoStores.get("commercialCenter").value) {
          this.currentStore.address.shoppingCenter = infoStores.get("subZoneStore").value;
          this.currentStore.address.isInsideShoppingCenter = true;
        } else {
          this.currentStore.address.shoppingCenter = null;
          this.currentStore.address.isInsideShoppingCenter = false;
        }

        this.currentStore.name = infoStores.get("storeName").value;
        this.currentStore.activity = infoStores.get("activityStores").value;
        this.currentStore.subActivity = infoStores.get("subactivityStore").value;
        this.currentStore.contactPerson = infoStores.get("contactPoint").value;

        var bankStores = this.editStores.controls["bankStores"];

        this.currentStore.bank = {
          bank: {
            bank: bankStores.get("supportBank").value,
            iban: this.currentStore.bank?.bank?.iban
          },
          useMerchantBank: bankStores.get("bankInformation").value
        }

        var productStores = this.editStores.controls["productStores"];

        this.currentStore.productCode = productStores.get("solutionType").value;
        this.currentStore.subProductCode = productStores.get("subProduct").value;
        this.currentStore.website = productStores.get("url").value;
        this.currentStore.productCodeDescription = productStores.get("solutionName").value;
        this.currentStore.subProductCodeDescription = productStores.get("subProductName").value;

        if (this.currentUser.permissions == "UNICRE") {
          this.currentStore.supportEntity = TerminalSupportEntityEnum.ACQUIRER;
        } else {
          this.currentStore.supportEntity = TerminalSupportEntityEnum.OTHER;
        }

        if (addStore) {
          this.logger.info("Shop to add: " + JSON.stringify(this.currentStore));
          if (this.returned == null || (this.returned == 'edit' && (this.processId == null || this.processId == ''))) {
            this.storeService.addShopToSubmission(localStorage.getItem("submissionId"), this.currentStore).subscribe(result => {
              this.logger.info("Added shop result: " + JSON.stringify(result));
              this.currentStore.id = result["id"];
              this.visitedStores.push(this.currentStore.id);
              this.visitedStores = Array.from(new Set(this.visitedStores));
              this.addDocumentToShop(result["id"], this.currentStore);
              this.emitInsertedStore(this.currentStore);
              this.resetForm();
              this.currentStore = null;
              this.currentIdx = -2;
            });
          } else {
            this.processService.addShopToProcess(this.processId, this.currentStore).then(result => {
              this.logger.info("Added shop result: " + JSON.stringify(result.result));
              this.currentStore.id = result.result["id"];
              this.visitedStores.push(this.currentStore.id);
              this.visitedStores = Array.from(new Set(this.visitedStores));
              this.addDocumentToShop(result.result["id"], this.currentStore);
              this.emitInsertedStore(this.currentStore);
              this.resetForm();
              this.currentStore = null;
              this.currentIdx = -2;
            });
          }
        } else {
          if (this.returned == null || (this.returned == 'edit' && (this.processId == null || this.processId == ''))) {
            if (!this.editStores.pristine) {
              if (!this.activityChanged && !this.subActivityChanged && !this.bankChanged) {
                this.storeService.updateSubmissionShop(localStorage.getItem("submissionId"), this.currentStore.id, this.currentStore).subscribe(result => {
                  this.visitedStores.push(this.currentStore.id);
                  this.visitedStores = Array.from(new Set(this.visitedStores));
                  this.logger.info("Updated shop result: " + JSON.stringify(result));
                  if (!clickedTable) {
                    if (isEditButton) {
                      this.addDocumentToShop(this.currentStore.id, this.currentStore);
                      this.resetForm();
                      this.currentStore = null;
                      this.currentIdx = -2;
                    } else {
                      if (this.visitedStores.length < this.storesLength) {
                        this.addDocumentToShop(this.currentStore.id, this.currentStore);
                        this.emitUpdatedStore(of({ store: this.currentStore, idx: this.currentIdx }));
                        this.resetForm();
                      } else {
                        this.addDocumentToShop(this.currentStore.id, this.currentStore);
                        this.resetForm();
                        this.currentStore = null;
                        this.currentIdx = -2;
                        this.data.changeShops(true);
                        this.logger.info("Redirecting to Comprovativos page");
                        this.data.updateData(true, 3);
                        this.route.navigate(['comprovativos']);
                      }
                    }
                  }
                });
              } else {
                //mostrar popup
                this.updateModalRef = this.modalService.show(this.updateModal, { class: 'modal-lg' });
              }
            } else {
              this.visitedStores.push(this.currentStore.id);
              this.visitedStores = Array.from(new Set(this.visitedStores));
              if (!clickedTable) {
                if (this.visitedStores.length < this.storesLength) {
                  this.emitUpdatedStore(of({ store: this.currentStore, idx: this.currentIdx }));
                  this.resetForm();
                } else {
                  this.resetForm();
                  this.currentStore = null;
                  this.currentIdx = -2;
                  this.data.changeShops(true);
                  this.logger.info("Redirecting to Comprovativos page");
                  this.data.updateData(true, 3);
                  this.route.navigate(['comprovativos']);
                }
              }
            }
          } else {
            if (!this.editStores.pristine) {
              if (!this.activityChanged && !this.subActivityChanged && !this.bankChanged) {
                this.processService.updateShopProcess(this.processId, this.currentStore.id, this.currentStore).then(result => {
                  this.visitedStores.push(this.currentStore.id);
                  this.visitedStores = Array.from(new Set(this.visitedStores));
                  if (!clickedTable) {
                    if (isEditButton) {
                      this.addDocumentToShop(this.currentStore.id, this.currentStore);
                      this.resetForm();
                      this.currentStore = null;
                      this.currentIdx = -2;
                    } else {
                      if (this.visitedStores.length < this.storesLength) {
                        this.addDocumentToShop(this.currentStore.id, this.currentStore);
                        this.emitUpdatedStore(of({ store: this.currentStore, idx: this.currentIdx }));
                        this.resetForm();
                      } else {
                        this.addDocumentToShop(this.currentStore.id, this.currentStore);
                        this.resetForm();
                        this.currentStore = null;
                        this.currentIdx = -2;
                        this.data.changeShops(true);
                        this.logger.info("Redirecting to Comprovativos page");
                        this.data.updateData(true, 3);
                        this.route.navigate(['comprovativos']);
                      }
                    }
                  }
                });
              } else {
                //mostrar popup
                this.updateModalRef = this.modalService.show(this.updateModal, { class: 'modal-lg' });
              }
            } else {
              this.visitedStores.push(this.currentStore.id);
              this.visitedStores = Array.from(new Set(this.visitedStores));
              if (!clickedTable) {
                if (this.visitedStores.length < this.storesLength) {
                  this.emitUpdatedStore(of({ store: this.currentStore, idx: this.currentIdx }));
                  this.resetForm();
                } else {
                  this.resetForm();
                  this.currentStore = null;
                  this.currentIdx = -2;
                  this.data.changeShops(true);
                  this.logger.info("Redirecting to Comprovativos page");
                  this.data.updateData(true, 3);
                  this.route.navigate(['comprovativos']);
                }
              }
            }
          }
        }
      } else {
        if (!clickedTable) {
          if (this.currentStore == null) {
            this.data.changeShops(true);
            this.logger.info("Redirecting to Comprovativos page");
            this.data.updateData(true, 3);
            this.route.navigate(['comprovativos']);
          }
        }
      }
      this.onActivate();
    } else {
      if (!clickedTable) {
        this.data.changeShops(true);
        this.logger.info("Redirecting to Comprovativos page");
        this.data.updateData(true, 3);
        this.route.navigate(['comprovativos']);
      }
    }
  }

  resetForm() {
    this.editStores.reset();
    this.editStores.get("infoStores").get("countryStore").setValue("PT");
    this.editStores.get("infoStores").get("replicate").setValue(true);
    this.editStores.get("infoStores").get("commercialCenter").setValue(false);
    this.editStores.get("bankStores").get("bankInformation").setValue(true);
    this.productSelectionComponent.clearSubProducts();
    this.addStoreComponent.chooseAddress(true);
    this.closeAccordion();
    this.storeIbanComponent.removeFiles();
    this.editStores.markAsPristine();
  }

  emitUpdatedStore(info) {
    this.updatedStoreEvent = info;
  }

  getStoresListLength(length) {
    this.storesLength = length;
    if (this.storesLength == 0) {
      this.data.updateData(false, 3, 1);
      this.data.changeShops(false);
    } else {
      this.data.changeShops(true);
    }
  }

  fetchStartingInfo() {
    if ((this.processId != '' && this.processId != null) && this.returned != null) {
      if (this.returned == 'consult') {
        this.processService.getMerchantFromProcess(this.processId).subscribe(res => {
          this.logger.info("Get process client by id result: " + JSON.stringify(res));
          this.submissionClient = res;
        });
      } else {
        this.processService.getUpdateProcessInfo(this.processId, this.updateProcessId).then(result => {
          this.submissionClient = result.result.merchant;
        });
      }
    } else {
      this.clientService.GetClientByIdAcquiring(localStorage.getItem("submissionId")).then(client => {
        this.logger.info("Get client by id result: " + JSON.stringify(client));
        this.submissionClient = client;
      });
    }
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
      this.logger.info("Redirecting to Stakeholders page");
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
    if (this.ibansToShow != null && store.bank.useMerchantBank == false) {
      if (store?.documents?.length == 0 || store.documents == null) {
        var context = this;
        this.comprovativoService.readBase64(this.ibansToShow.file).then((data) => {
          var docToSend: PostDocument = {
            "documentType": "0071",
            "documentPurpose": "BankAccount",
            "file": {
              "fileType": "PDF",
              "binary": data.split(',')[1]
            },
            "validUntil": null,
            "data": {}
          }
          context.logger.info("Document to add to submission: " + JSON.stringify(docToSend));
          if (this.returned == null || (this.returned == 'edit' && (this.processId == null || this.processId == ''))) {
            this.documentService.SubmissionPostDocumentToShop(localStorage.getItem("submissionId"), storeId, docToSend).subscribe(result => {
              context.logger.info("Added document to shop result: " + JSON.stringify(result));
              if (store?.documents == null) {
                store.documents = [];
              }
              store?.documents?.push({ id: result.id, documentType: result.type });
              context.ibansToShow = null;
            });
          } else {
            this.processService.addProcessShopDocument(context.processId, storeId, docToSend).then(result => {
              context.logger.info("Added document to shop result: " + JSON.stringify(result.result));
              if (store?.documents == null) {
                store.documents = [];
              }
              store?.documents?.push({ id: result.result.id, documentType: result.result.type });
              context.ibansToShow = null;
            });
          }
        })
      }
    }
  }

  confirmUpdate() {
    var context = this;
    this.currentStore.pack = null;
    this.activityChanged = false;
    this.subActivityChanged = false;
    this.bankChanged = false;
    if (this.returned == null || (this.returned == 'edit' && (this.processId == null || this.processId == ''))) {
      let promise = new Promise((resolve, reject) => {
        this.storeService.getShopEquipmentConfigurationsFromSubmission(this.submissionId, this.currentStore.id).then(result => {
          let length = 0;
          var equips = result.result;
          if (equips.length > 0) {
            equips.forEach(e => {
              context.storeService.deleteShopEquipmentConfigurationFromSubmission(context.submissionId, context.currentStore.id, e.id).subscribe(res => {
                length++;
                context.logger.info("Deleted equipment " + e.id + " from shop " + context.currentStore.id);
                if (length == equips.length)
                  resolve(length);
              });
            });
          } else {
            resolve(null);
          }
        });
      }).finally(() => {
        this.storeService.updateSubmissionShop(localStorage.getItem("submissionId"), this.currentStore.id, this.currentStore).subscribe(result => {
          this.visitedStores.push(this.currentStore.id);
          this.visitedStores = Array.from(new Set(this.visitedStores));
          if (this.visitedStores.length < this.storesLength) {
            this.addDocumentToShop(this.currentStore.id, this.currentStore);
            this.emitUpdatedStore(of({ store: this.currentStore, idx: this.currentIdx }));
            this.resetForm();
            this.updateModalRef?.hide();
          } else {
            this.addDocumentToShop(this.currentStore.id, this.currentStore);
            this.resetForm();
            this.currentStore = null;
            this.currentIdx = -2;
            this.updateModalRef?.hide();
            this.data.changeShops(true);
            this.logger.info("Redirecting to Comprovativos page");
            this.data.updateData(true, 3);
            this.route.navigate(['comprovativos']);
          }
        });
      });
    } else {
      let promise = new Promise((resolve, reject) => {
        if (this.updateProcessId == "" || this.updateProcessId == null) {
          this.storeService.getShopEquipmentConfigurationsFromProcess(this.processId, this.currentStore.id).subscribe(result => {
            let length = 0;
            var equips = result;
            if (equips.length > 0) {
              equips.forEach(e => {
                context.processService.deleteShopEquipmentFromProcess(context.processId, context.currentStore.id, e.id).then(res => {
                  length++;
                  context.logger.info("Deleted equipment " + e.id + " from shop " + context.currentStore.id);
                  if (length == equips.length)
                    resolve(length);
                });
              });
            } else {
              resolve(null);
            }
          });
        } else {
          let length = 0;
          var shop = this.processInfo.shops.find(shop => shop.id == context.currentStore.id);
          shop.equipments = shop.equipments.filter(val => val["updateProcessAction"] != "Delete");
          if (shop.equipments.length > 0) {
            shop.equipments.forEach(equip => {
              if (equip["updateProcessAction"] != "Delete") {
                context.processService.deleteShopEquipmentFromProcess(context.processId, context.currentStore.id, equip.id).then(res => {
                  length++;
                  if (length == shop.equipments.length)
                    resolve(length);
                });
              }
            });
          } else {
            resolve(null);
          }
        }
      }).finally(() => {
        this.processService.updateShopProcess(this.processId, this.currentStore.id, this.currentStore).then(result => {
          this.visitedStores.push(this.currentStore.id);
          this.visitedStores = Array.from(new Set(this.visitedStores));
          if (this.visitedStores.length < this.storesLength) {
            this.addDocumentToShop(this.currentStore.id, this.currentStore);
            this.emitUpdatedStore(of({ store: this.currentStore, idx: this.currentIdx }));
            this.resetForm();
            this.updateModalRef?.hide();
          } else {
            this.addDocumentToShop(this.currentStore.id, this.currentStore);
            this.resetForm();
            this.currentStore = null;
            this.currentIdx = -2;
            this.updateModalRef?.hide();
            this.data.changeShops(true);
            this.logger.info("Redirecting to Comprovativos page");
            this.data.updateData(true, 3);
            this.route.navigate(['comprovativos']);
          }
        });
      });
    }
  }

  cancelUpdate() {
    this.updateModalRef?.hide();
  }

  getProcessInfo(event) {
    this.processInfo = event;
  }

  openCancelPopup() {
    //this.cancelModalRef = this.modalService.show(this.cancelModal);
    this.route.navigate(['/']);
  }

  closeCancelPopup() {
    //this.cancelModalRef?.hide();
  }

  confirmCancel() {
    //var context = this;
    //var processNumber = "";
    //this.processNrService.processNumber.subscribe(res => processNumber = res);
    //var encodedCode = encodeURIComponent(processNumber);
    //var baseUrl = this.configuration.getConfig().acquiringAPIUrl;
    //var url = baseUrl + 'process?number=' + encodedCode;
    //this.processService.advancedSearch(url, 0, 1).subscribe(result => {
    //  context.queueService.markToCancel(result.items[0].processId, context.authService.GetCurrentUser().userName).then(res => {
    //    context.closeCancelPopup();
    //    context.route.navigate(['/']);
    //  });
    //});
  }
}
