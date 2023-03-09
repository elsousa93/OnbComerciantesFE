import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, Subscription } from 'rxjs';
import { DataService } from '../../nav-menu-interna/data.service';
import { Istore, ShopDetailsAcquiring, ShopEquipment, ShopProductPack } from '../../store/IStore.interface';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { AuthService } from '../../services/auth.service';
import { User } from '../../userPermissions/user';
import { UserPermissions } from '../../userPermissions/user-permissions';
import { MerchantCatalog, Product, ProductPackAttributeProductPackKind, ProductPackCommissionAttribute, ProductPackCommissionFilter, ProductPackEntry, ProductPackFilter, ProductPackPricingEntry, ProductPackRootAttributeProductPackKind, TerminalSupportEntityEnum } from '../ICommercialOffer.interface';
import { StoreService } from '../../store/store.service';
import { CommercialOfferService } from '../commercial-offer.service';
import { ClientService } from '../../client/client.service';
import { TableInfoService } from '../../table-info/table-info.service';
import { TenantCommunication, TenantTerminal } from '../../table-info/ITable-info.interface';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from '../../logger.service';

@Component({
  selector: 'app-commercial-offer-list',
  templateUrl: './commercial-offer-list.component.html',
  styleUrls: ['./commercial-offer-list.component.css']
})
export class CommercialOfferListComponent implements OnInit {

  selectedPack: ShopProductPack = null;

  storeEquipMat = new MatTableDataSource<ShopEquipment>();
  @ViewChild('storeEquipPaginator') set paginator(pager: MatPaginator) {
    if (pager) {
      this.storeEquipMat.paginator = pager;
      this.storeEquipMat.paginator._intl = new MatPaginatorIntl();
      this.storeEquipMat.paginator._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');
    }
  }

  form: FormGroup;
  private baseUrl: string;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('storeEquipPaginator') storeEquipPaginator: MatPaginator;
  @ViewChild('storeEquipSort') storeEquipSort: MatSort;

  public stores: Istore[] = [];

  selectionsReplicate = ['Não', 'Sim'];
  selectedOption = 'Não';

  public subscription: Subscription;
  public map: Map<number, boolean>;
  public currentPage: number;
  public currentStore: ShopDetailsAcquiring = null;
  public currentIdx: number = 0;
  public commissionId: string = "";

  public products: Product[];

  public isUnicre: boolean;
  public geographyChecked: boolean = false;

  updatedStoreEvent: Observable<{ store: ShopDetailsAcquiring, idx: number }>;

  displayedColumns: string[] = ['nameEstab', 'activityEstab', 'subActivityEstab', 'bank', 'terminalNumber', 'product'];
  storeEquipColumns: string[] = ['equipmentOwnership', 'equipmentType', 'communicationType', 'quantity', 'monthlyFee', 'delete', 'edit'];

  currentUser: User = {};
  replicate: boolean;
  disableNewConfiguration: boolean;
  public storeEquip: ShopEquipment;
  public returned: string;
  public showMore: boolean;
  storesList: ShopDetailsAcquiring[];

  merchantCatalog: MerchantCatalog;
  productPack: ProductPackFilter = {
    productCode: "",
    subproductCode: "",
    merchant: {},
    store: {}
  };
  groupsList: ProductPackRootAttributeProductPackKind[] = [];
  finalList: ProductPackRootAttributeProductPackKind[] = [];
  commissionOptions: ProductPackPricingEntry[] = [];
  commissionFilter: ProductPackCommissionFilter;
  commissionAttributeList: ProductPackCommissionAttribute[] = [];

  submissionId: string;
  processNumber: string;
  packId: string;

  storeEquipList: ShopEquipment[] = [];

  editForm: FormGroup;
  configTerm: FormGroup;

  isNewConfig: boolean;
  paymentSchemes: ProductPackAttributeProductPackKind;

  packs: ProductPackEntry[];
  isPackSelected: boolean = false;
  userBanca: boolean = false;

  previousStoreEvent: Observable<number>;
  storesLength: number = 0;
  public subs: Subscription[] = [];

  allCommunications: TenantCommunication[] = [];
  allTerminals: TenantTerminal[] = [];
  queueName: string = "";
  title: string;
  changedEAT: boolean = true;
  list: ProductPackRootAttributeProductPackKind[] = [];
  changedPackValue: boolean = true;

  emitPreviousStore(idx) {
    this.previousStoreEvent = idx;
  }

  ngAfterViewInit() {
    this.storeEquipMat.sort = this.storeEquipSort;
  }

  constructor(private translate: TranslateService, private route: Router, private data: DataService, private authService: AuthService, private storeService: StoreService, private COService: CommercialOfferService, private clientService: ClientService, private tableInfo: TableInfoService, private logger: LoggerService) {
    this.ngOnInit();
    this.loadReferenceData();
    authService.currentUser.subscribe(user => this.currentUser = user);
    this.initializeForm();

    this.clientService.GetClientByIdAcquiring(this.submissionId).then(result => {
      this.logger.info("Get merchant from submission: " + JSON.stringify(result));
      this.merchantCatalog = {
        context: result.businessGroup.type.toLocaleLowerCase(),
        contextId: result.businessGroup.branch,
        fiscalIdentification: {
          fiscalId: result.fiscalId,
          issuerCountry: "PT"
        }
      }
      this.logger.info("Merchant catalog info to get packs: " + JSON.stringify(this.merchantCatalog));
    });
    this.data.updateData(false, 5, 1);
  }

  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    this.subscription = this.data.currentQueueName.subscribe(queueName => {
      if (queueName != null) {
        this.translate.get('homepage.diaryPerformance').subscribe((translated: string) => {
          this.queueName = this.translate.instant('homepage.' + queueName);
          this.title = this.translate.instant('commercialOffer.title');
        });
      }
    });
    this.submissionId = localStorage.getItem("submissionId");
    this.processNumber = localStorage.getItem("processNumber");
    this.returned = localStorage.getItem("returned");
  }

  getStoreEquipsFromSubmission() {
    this.storeEquipList = [];
    if (this.returned != null) {
      this.storeService.getShopEquipmentConfigurationsFromProcess(this.processNumber, this.currentStore.id).subscribe(result => {
        this.logger.info("Get equipments from shop result: " + JSON.stringify(result));
        if (result != null) {
          this.storeEquipList.push(result);
        }
      });
    }

    this.storeService.getShopEquipmentConfigurationsFromSubmission(this.submissionId, this.currentStore.id).then(result => {
      this.logger.info("Get equipments from shop result: " + JSON.stringify(result));
      var list = result.result;
      if (list.length > 0) {
        list.forEach(res => {
          this.storeService.getShopEquipmentFromSubmission(this.submissionId, this.currentStore.id, res.id).then(r => {
            this.storeEquipList.push(r.result);
          }).then(res => {
            this.loadStoreEquips(this.storeEquipList);
          });
        });
      }
    }).then(res => {
    });
  }

  loadStoreEquips(storeEquipValues: ShopEquipment[]) {
    this.storeEquipMat.data = storeEquipValues;
    this.storeEquipMat.paginator = this.storeEquipPaginator;
    this.storeEquipMat.sort = this.storeEquipSort;
  }

  selectStore(info) {
    this.storeEquipList = [];
    this.loadStoreEquips(this.storeEquipList);
    this.packId = "";
    this.packs = [];
    this.paymentSchemes = null;
    this.groupsList = [];
    this.commissionId = "";
    this.commissionOptions = []
    this.currentStore = info.store;
    this.currentIdx = info.idx;

    this.logger.info("Selected store: " + JSON.stringify(this.currentStore));
    this.logger.info("Selected store index: " + this.currentIdx);

    if (this.form.get("replicateProducts").value)
      this.loadStoresWithSameBank(this.currentStore.bank.bank.bank);

    setTimeout(() => this.setFormData(), 500);

    this.getStoreEquipsFromSubmission();
    //this.getPackDetails();
    this.resetValues();

    if (this.returned == 'consult')
      this.form.disable();
  }

  resetValues() {
    var context = this;
    this.commissionAttributeList.forEach(function (value, idx) {
      context.form.get("commission" + value.id).get("commissionMin" + value.id).setValue(value.minValue.value);
      context.form.get("commission" + value.id).get("commissionMax" + value.id).setValue(value.maxValue.value);
      context.form.get("commission" + value.id).get("commissionFixed" + value.id).setValue(value.fixedValue.value);
      context.form.get("commission" + value.id).get("commissionPercentage" + value.id).setValue(value.percentageValue.value);
    });
    if (this.commissionId != "") {
      this.chooseCommission(this.commissionId);
    }
  }

  initializeForm() {
    this.form = new FormGroup({
      replicateProducts: new FormControl(this.replicate, [Validators.required]),
      store: new FormControl(''),
      isUnicre: new FormControl(this.isUnicre, [Validators.required]),
      terminalRegistrationNumber: new FormControl(''),
      productPackKind: new FormControl('', [Validators.required]),
    });
  }

  addFormGroups() {
    var context = this;
    this.groupsList.forEach(function (value, idx) {
      context.form.removeControl('formGroup' + value.id);
    });

    this.groupsList.forEach(function (value, idx) {
      var group = new FormGroup({});
      var attributes = value.attributes;

      attributes.forEach(function (value, idx) {
        if (value["aggregatorId"] !== null) {
          if (value.isSelected)
            group.addControl("formControl" + value["aggregatorId"], new FormControl(value.description));
          else
            group.addControl("formControl" + value["aggregatorId"], new FormControl(''));
        } else {
          group.addControl("formControl" + value.id, new FormControl(value.isSelected));
        }

        if (value.bundles != undefined || value.bundles != null || value.bundles.length > 0) {
          var attributeGroup = new FormGroup({});
          var bundle = value.bundles;

          bundle.forEach(function (value, idx) {
            var bundleAttributes = value.attributes;

            bundleAttributes.forEach(function (value, idx) {
              attributeGroup.addControl("formControlBundle" + value.id, new FormControl(value.isSelected));
            });
            group.addControl("formGroupBundle" + value.id, attributeGroup);
          });
        }
      });
      context.form.addControl("formGroup" + value.id, group);
    });
    this.isPackSelected = true;
  }

  numericOnly(event): boolean {
    var ASCIICode = (event.which) ? event.which : event.keyCode;

    if (ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57))
      return false;
    return true;
  }

  decimalOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode == 101 || charCode == 69 || charCode == 45 || charCode == 43) {
      return false;
    }
    return true;
  }

  addCommissionFormGroups() {
    var valueGroup = new FormGroup({});
    var context = this;

    this.commissionAttributeList.forEach(function (value, idx) {
      context.form.removeControl('comission' + value.id);
    });

    this.commissionAttributeList.forEach(function (value, idx) {
      valueGroup.addControl("commissionMin" + value.id, new FormControl(value.minValue.value));
      valueGroup.addControl("commissionMax" + value.id, new FormControl(value.maxValue.value));
      valueGroup.addControl("commissionFixed" + value.id, new FormControl(value.fixedValue.value));
      valueGroup.addControl("commissionPercentage" + value.id, new FormControl(value.percentageValue.value));
      context.form.addControl("commission" + value.id, valueGroup);
    });
  }

  //utilizado para mostrar os valores no PACOTE COMERCIAL
  getPackDetails() {
    if (this.changedEAT) {
      this.changedEAT = false;
      this.paymentSchemes = null;
      this.groupsList = [];
      this.productPack.productCode = this.currentStore.productCode;
      this.productPack.subproductCode = this.currentStore.subproductCode;
      this.productPack.merchant = this.merchantCatalog;
      this.productPack.store = {
        activity: this.currentStore.activity,
        subActivity: this.currentStore.subActivity,
        supportEntity: this.currentStore.supportEntity.toLocaleLowerCase(),
        referenceStore: this.currentStore.shopId,
        supportBank: this.currentStore?.bank?.bank?.bank
      }
      this.logger.info("Data sent to outbound get packs: " + JSON.stringify(this.productPack));
      this.COService.OutboundGetPacks(this.productPack).then(result => {
        this.logger.info("Get packs: " + JSON.stringify(result));
        this.packs = result.result;
        if (this.packs.length === 1) {
          this.selectCommercialPack(this.packs[0].id);
        } else if (this.currentStore.pack != null) {
          this.selectCommercialPack(this.currentStore.pack.packId);
        }
      });
    }
  }

  selectCommercialPack(packId: string) {
    var context = this;
    this.packId = packId;
    context.groupsList = [];
    context.paymentSchemes = null;

    if (this.currentStore.pack == null) {
      this.COService.OutboundGetPackDetails(packId, this.productPack).then(res => {
        context.logger.info("Get pack details " + JSON.stringify(res));
        context.paymentSchemes = res.result.paymentSchemes;
        context.addPaymentFormGroups();
        res.result.otherGroups.forEach(group => {
          context.groupsList.push(group);
        });
        context.addFormGroups();
      });
    } else {
      context.paymentSchemes = this.currentStore.pack.paymentSchemes;
      context.addPaymentFormGroups();
      this.COService.OutboundGetPackDetails(packId, this.productPack).then(res => {
        context.logger.info("Get pack details " + JSON.stringify(res));
        res.result.otherGroups.forEach(group => {
          context.groupsList.push(group);
        });

        context.currentStore.pack.otherPackDetails.forEach((curr, index) => {
          context.groupsList.forEach((value, index) => {
            if (curr.id === value.id) {
              curr.attributes.forEach((curr, index) => {
                value.attributes.forEach((value, index) => {
                  if (curr.isSelected) {
                    if (curr.id === value.id) {
                      value.isSelected = curr.isSelected;
                      if (curr.bundles != undefined || curr.bundles != null || curr.bundles.length > 0) {
                        curr.bundles.forEach((curr, index) => {
                          value.bundles.forEach((value, index) => {
                            if (curr.id === value.id) {
                              curr.attributes.forEach((curr, index) => {
                                value.attributes.forEach((value, index) => {
                                  if (curr.isSelected) {
                                    if (curr.id === value.id) {
                                      value.isSelected = curr.isSelected;
                                    }
                                  }
                                });
                              });
                            }
                          });
                        });
                      }
                    }
                  }
                })
              });
            }
          });
        });
        context.addFormGroups();
      });
    }
    this.form.get("productPackKind").setValue(packId);
    //this.getCommissionsList();
  }

  //check if it exists at least one attribute with 'isVisible' == true
  existsNotVisibleAttr(group: ProductPackRootAttributeProductPackKind) {
    var found = group.attributes.find(attr => attr.isVisible);
    if (found == undefined)
      return true;
    else
      return false;
  }

  existsNotVisibleBundleAttr(bundle: ProductPackAttributeProductPackKind) {
    var found = bundle.attributes.find(attr => attr.isVisible);
    if (found == undefined)
      return true;
    else
      return false;
  }

  changedValue() {
    this.changedPackValue = true;
    var context = this;
    //atualizar a lista dos pacotes comerciais com os valores selecionados no front
    this.finalList = [];
    this.list = [];
    var oldArray = JSON.stringify(this.groupsList);
    this.list = JSON.parse(oldArray);

    this.list.forEach((group) => {
      group.attributes.forEach((attr) => {
        if (attr["aggregatorId"] !== null) {
          if (attr.description === this.form.get("formGroup" + group.id)?.get("formControl" + attr["aggregatorId"])?.value) {
            attr.isSelected = true;
          } else {
            attr.isSelected = false;
          }
        } else {
          attr.isSelected = this.form.get("formGroup" + group.id)?.get("formControl" + attr.id)?.value;
        }
        if (attr.isSelected && (attr.bundles != null || attr.bundles.length > 0)) { // se tiver sido selecionado
          attr.bundles.forEach((bundle) => {
            bundle.attributes.forEach((bundleAttr) => {
              bundleAttr.isSelected = this.form.get("formGroup" + group.id)?.get("formGroupBundle" + bundle.id)?.get("formControlBundle" + bundleAttr.id)?.value;
            });
          });
        }
      });
    });

    var finalGroupsList = this.list.filter(group => group.attributes.filter(attr => {
      if (attr.isSelected) {
        if (attr.bundles != null || attr.bundles.length > 0) {
          attr.bundles.filter(bundle => bundle.attributes.filter(bundleAttr => bundleAttr.isSelected));
        }
        return true;
      } else {
        return false;
      }
    }));

    this.list.forEach(group => {
      var groupList = group.attributes.filter(attr => attr.isSelected == true || (attr["aggregatorId"] != null && attr["aggregatorId"] != undefined && attr["aggregatorId"] != "" && attr.description == this.form.get("formGroup" + group.id)?.get("formControl" + attr["aggregatorId"])?.value));
      context.finalList.push(group);
      context.finalList.find(l => l.id == group.id).attributes = groupList;
      group.attributes.forEach(attr => {
        attr.bundles.forEach(bundle => {
          var bundleList = bundle.attributes.filter(bundleAttr => bundleAttr.isSelected == true);
          context.finalList.find(l => l.id == group.id).attributes.find(a => a.id == attr.id).bundles.find(b => b.id == bundle.id).attributes = bundleList;
        });
      });
    });

    this.list = this.finalList.filter(group => group.attributes.length > 0);

    //remover da lista dos pacotes comerciais, os grupos que não foram selecionados
    this.list.forEach((group) => {
      group.attributes.forEach((attr, ind) => {
        if (attr["aggregatorId"] != null && attr["aggregatorId"] != undefined && attr["aggregatorId"] != "") {
          if (attr.description !== this.form.get("formGroup" + group.id)?.get("formControl" + attr["aggregatorId"])?.value) {
            var removedGroup = group.attributes.splice(ind, 1);
            return;
          }
        } else {
          if (attr.isSelected === false || attr.isSelected == undefined) {
            var removedGroup = group.attributes.splice(ind, 1);
            return;
          } else {
            if (attr.bundles != null || attr.bundles != undefined || attr.bundles.length > 0) {
              attr.bundles.forEach((bundle, index) => {
                bundle.attributes.forEach((bundleAttr, i) => {
                  if (bundleAttr.isSelected === false) {
                    var removedBundle = bundle.attributes.splice(i, 1);
                    return;
                  }
                });
              });
            }
          }
        }
      });
    });
  }

  //Utilizado para mostrar os valores na tabela do PREÇARIO LOJA
  getCommissionsList() {
    if (this.changedPackValue) {
      this.changedPackValue = false;
      this.commissionFilter = {
        productCode: this.currentStore.productCode,
        subproductCode: this.currentStore.subproductCode,
        processorId: this.packs[0].processors[0],
        merchant: this.merchantCatalog,
        store: {
          activity: this.currentStore.activity,
          subActivity: this.currentStore.subActivity,
          supportEntity: TerminalSupportEntityEnum[this.currentStore.supportEntity] as TerminalSupportEntityEnum,
          referenceStore: this.currentStore.shopId,
          supportBank: this.currentStore.supportEntity
        },
        packAttributes: this.list //ter em atenção se os valores são alterados à medida que vamos interagindo com a interface
      }
      this.logger.info("Filter sent to get commercial pack commission list: " + JSON.stringify(this.commissionFilter));
      this.COService.ListProductCommercialPackCommission(this.packId, this.commissionFilter).then(result => {
        this.logger.info("Get commercial pack commission list result: " + JSON.stringify(result));
        this.commissionOptions = [];
        if (this.currentStore.pack == null) {
          if (result.result.length == 1) {
            this.commissionOptions.push(result.result[0]);
            this.chooseCommission(result.result[0].id);
          } else {
            result.result.forEach(options => {
              this.commissionOptions.push(options);
            });
          }
        } else {
          result.result.forEach(options => {
            this.commissionOptions.push(options);
          });
          this.chooseCommission(this.currentStore.pack.commission.commissionId);
        }
      });
    }
  }

  chooseCommission(commisionId: string) {
    this.commissionId = commisionId;
    var productCode = this.currentStore.productCode;
    this.commissionAttributeList = [];
    if (this.currentStore.pack == null) {
      this.COService.GetProductCommercialPackCommission(this.packId, this.commissionId, this.commissionFilter).then(res => {
        this.logger.info("Get commercial pack commission result: " + JSON.stringify(res));
        this.commissionAttributeList = res.result.attributes;
        this.addCommissionFormGroups();
      });
    } else {
      this.currentStore.pack.commission.attributes.forEach(attr => {
        this.commissionAttributeList.push(attr);
      });
      this.addCommissionFormGroups();
    }
  }

  getStoresListLength(length) {
    this.storesLength = length;
  }

  setFormData() {
    this.form.get("replicateProducts").setValue(null);
    this.form.get("isUnicre").setValue(this.currentStore.supportEntity.toLowerCase() == 'acquirer' ? true : false);
    this.form.get("terminalRegistrationNumber").setValue(this.currentStore.registrationId != '' ? this.currentStore.registrationId : '');

    if (this.form.get("replicateProducts").value)
      this.form.get("store").setValue(null);

    if (this.currentUser.permissions == UserPermissions.BANCA) {
      this.userBanca = true;
      this.form.get("isUnicre").setValue(false);
      this.form.get("isUnicre").disable();
      this.changeUnicre(false);
    } else {
      this.userBanca = false;
      this.form.get("isUnicre").setValue(true);
      this.changeUnicre(true);
    }
  }

  changeUnicre(bool: boolean) {
    this.isUnicre = bool;
    this.disableNewConfiguration = !bool;
    this.isNewConfig = null;
    this.changedEAT = true;
    if (!bool) {
      this.form.get("terminalRegistrationNumber").setValue(null);
      this.form.get("terminalRegistrationNumber").setValidators(Validators.required);
    } else {
      this.form.get("terminalRegistrationNumber").setValidators(null);
    }
    this.form.get("terminalRegistrationNumber").updateValueAndValidity();
  }

  changeReplicateProducts(bool: boolean) {
    this.replicate = bool;
  }

  createNewConfiguration() {
    if (this.isNewConfig || this.isNewConfig == false) {
      this.isNewConfig = null;
    }
    this.isNewConfig = true;
  }

  submit() {
    var context = this;

    this.commissionAttributeList.forEach(commission => {
      var currentValue = this.form.get("commission" + commission.id);
      commission.minValue.finalValue = currentValue.get("commissionMin" + commission.id).value;
      commission.maxValue.finalValue = currentValue.get("commissionMax" + commission.id).value;
      commission.fixedValue.finalValue = currentValue.get("commissionFixed" + commission.id).value;
      commission.percentageValue.finalValue = currentValue.get("commissionPercentage" + commission.id).value;
    });

    var group = context.form.get("formGroupPayment" + this.paymentSchemes.id);
    this.paymentSchemes.attributes.forEach(payment => {
      payment.isSelected = group.get("formControlPayment" + payment.id).value;
    });

    var finalPaymentAttributes = this.paymentSchemes.attributes.filter(payment => payment.isSelected);
    this.paymentSchemes.attributes = finalPaymentAttributes;

    //estava aqui antes os valores do changedValue()
    
    if (this.returned != 'consult') {
      this.currentStore.equipments = this.storeEquipList;
      this.currentStore.pack = {
        packId: this.packId,
        commission: {
          commissionId: this.commissionId,
          attributes: this.commissionAttributeList
        },
        paymentSchemes: this.paymentSchemes,
        otherPackDetails: this.list
      }
      this.currentStore.registrationId = this.form.get("terminalRegistrationNumber")?.value?.toString();
      this.logger.info("Store data update " + JSON.stringify(this.currentStore));
      this.storeService.updateSubmissionShop(this.submissionId, this.currentStore.id, this.currentStore).subscribe(result => {
        this.logger.info("Updated shop result: " + JSON.stringify(result));
        if (this.currentIdx < (this.storesLength - 1)) {
          this.emitUpdatedStore(of({ store: this.currentStore, idx: this.currentIdx }));
          this.closeAccordion();
        } else {
          this.data.updateData(true, 5);
          this.logger.info("Redirecting to Info Declarativa page");
          this.route.navigate(['info-declarativa']);
        }
      });
    } else {
      this.data.updateData(true, 5);
      this.logger.info("Redirecting to Info Declarativa page");
      this.route.navigate(['info-declarativa']);
    }
    this.onActivate();
  }

  closeAccordion() {
    document.getElementById("flush-collapseOne").className = "accordion-collapse collapse";
    document.getElementById("accordionButton1").className = "accordion1-button collapsed";
    document.getElementById("flush-collapseTwo").className = "accordion-collapse collapse";
    document.getElementById("accordionButton2").className = "accordion1-button collapsed";
    document.getElementById("flush-collapseThree").className = "accordion-collapse collapse";
    document.getElementById("accordionButton3").className = "accordion1-button collapsed";
    document.getElementById("flush-collapseFour").className = "accordion-collapse collapse";
    document.getElementById("accordionButton4").className = "accordion1-button collapsed";
  }

  emitUpdatedStore(info) {
    this.updatedStoreEvent = info;
  }

  changeShowMore() {
    this.showMore = !this.showMore;
  }

  loadStoresWithSameBank(bank: string) {
  }

  deleteConfiguration(shopEquipment: ShopEquipment) {
    if (this.returned != 'consult') {
      this.storeService.deleteShopEquipmentConfigurationFromSubmission(this.submissionId, this.currentStore.id, shopEquipment.id).subscribe(result => this.logger.info("Deleted shop equipment with id " + shopEquipment.id));
    }
  }

  editConfiguration(shopEquipment: ShopEquipment) {
    if (this.returned != 'consult') {
      if (this.isNewConfig || this.isNewConfig == false) {
        this.isNewConfig = null;
      }
      this.isNewConfig = false;
      this.storeEquip = shopEquipment;
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

  changedStoreEvent(value) {
    if (value)
      this.isNewConfig = null;
  }

  storeEquipEvent(value) {
    this.getStoreEquipsFromSubmission();
    this.loadStoreEquips(this.storeEquipList);
  }

  addPaymentFormGroups() {
    this.form.removeControl("formGroupPayment" + this.paymentSchemes.id);

    var group = new FormGroup({});
    this.paymentSchemes.attributes.forEach(function (value, idx) {
      group.addControl('formControlPayment' + value.id, new FormControl(value.isSelected));
    });

    this.form.addControl("formGroupPayment" + this.paymentSchemes.id, group);
  }

  getAttributeValue(formGroup: string, formControl: string) {
    return this.form.get(formGroup)?.get(formControl)?.value;
  }

  goToComprovativos() {
    if ((this.currentIdx - 1) >= 0) {
      this.emitPreviousStore(of(this.currentIdx));
    } else {
      this.logger.info("Redirecting to Comprovativos page");
      this.route.navigate(['/comprovativos']);
    }
  }

  loadReferenceData() {
    this.subs.push(this.tableInfo.GetTenantCommunications().subscribe(result => {
      this.logger.info("Get tenant communications: " + JSON.stringify(result));
      this.allCommunications = result;
      this.allCommunications = this.allCommunications.sort((a, b) => a.description > b.description ? 1 : -1); //ordenar resposta
    }), this.tableInfo.GetTenantTerminals().subscribe(result => {
      this.logger.info("Get tenant terminals: " + JSON.stringify(result));
      this.allTerminals = result;
      this.allTerminals = this.allTerminals.sort((a, b) => a.description > b.description ? 1 : -1); //ordenar resposta
    }));
  }

  getTerminalDesc(code: number) {
    return this.allTerminals.find(term => term.code == code).description;
  }

  getCommunicationDesc(code: number) {
    return this.allCommunications.find(comm => comm.code == code).description;
  }
}
