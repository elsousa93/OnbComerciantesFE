import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, Subscription } from 'rxjs';
import { DataService } from '../../nav-menu-interna/data.service';
import { EquipmentSettings, Istore, ShopDetailsAcquiring, ShopEquipment, ShopProductPack } from '../../store/IStore.interface';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { AuthService } from '../../services/auth.service';
import { User } from '../../userPermissions/user';
import { UserPermissions } from '../../userPermissions/user-permissions';
import { MerchantCatalog, Product, ProductPack, ProductPackAttribute, ProductPackAttributeProductPackKind, ProductPackCommissionAttribute, ProductPackCommissionFilter, ProductPackEntry, ProductPackFilter, ProductPackKindEnum, ProductPackPricingEntry, ProductPackRootAttributeProductPackKind, TerminalSupportEntityEnum } from '../ICommercialOffer.interface';
import { StoreService } from '../../store/store.service';
import { CommercialOfferService } from '../commercial-offer.service';
import { ClientService } from '../../client/client.service';
import { TableInfoService } from '../../table-info/table-info.service';
import { TenantCommunication, TenantTerminal } from '../../table-info/ITable-info.interface';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from '../../logger.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProcessNumberService } from '../../nav-menu-presencial/process-number.service';
import { ProcessService } from '../../process/process.service';
import { QueuesService } from '../../queues-detail/queues.service';
import { Client } from '../../client/Client.interface';

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
  replicate: boolean = false;
  disableNewConfiguration: boolean;
  public storeEquip: ShopEquipment;
  public returned: string;
  public showMore: boolean;
  storesList: ShopDetailsAcquiring[] = [];
  replicateStoresList: ShopDetailsAcquiring[] = [];

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
  paymentList: ProductPackAttributeProductPackKind;
  equipmentSettings: ProductPackAttributeProductPackKind[];
  processId: string;
  firstTime: boolean = true;
  equips: boolean;
  public visitedStores: string[] = [];
  updateProcessId: string;
  processInfo: any;
  changedPackReturned: boolean = false;
  merchant: Client;

  emitPreviousStore(idx) {
    this.previousStoreEvent = idx;
  }

  getVisitedStores(visitedStores) {
    this.visitedStores = visitedStores;
  }

  ngAfterViewInit() {
    this.storeEquipMat.sort = this.storeEquipSort;
  }

  constructor(private translate: TranslateService, private route: Router, private data: DataService, private authService: AuthService, private storeService: StoreService, private COService: CommercialOfferService, private clientService: ClientService, private tableInfo: TableInfoService, private logger: LoggerService, private snackBar: MatSnackBar, private processNrService: ProcessNumberService, private processService: ProcessService, private queuesInfo: QueuesService) {
    this.ngOnInit();
    //this.loadReferenceData();
    authService.currentUser.subscribe(user => this.currentUser = user);
    this.initializeForm();

    if ((this.processId != '' && this.processId != null) && this.returned != null) {
      if (this.returned == 'consult') {
        this.processService.getMerchantFromProcess(this.processId).subscribe(res => {
          this.logger.info("Get process client by id result: " + JSON.stringify(res));
          this.merchant = res;
          this.merchantCatalog = {
            context: res?.businessGroup?.type?.toLocaleLowerCase() as any,
            contextId: res?.businessGroup?.branch,
            fiscalIdentification: {
              fiscalId: res?.fiscalId,
              issuerCountry: "PT"
            }
          }
        });
      } else {
        this.processService.getUpdateProcessInfo(this.processId, this.updateProcessId).then(result => {
          this.processInfo = result.result;
          this.merchant = this.processInfo.merchant;
          this.merchantCatalog = {
            context: this.merchant?.businessGroup?.type?.toLocaleLowerCase() as any,
            contextId: this.merchant?.businessGroup?.branch,
            fiscalIdentification: {
              fiscalId: this.merchant?.fiscalId,
              issuerCountry: "PT"
            }
          }
        });
      }
    } else {
      this.clientService.GetClientByIdAcquiring(this.submissionId).then(result => {
        this.logger.info("Get merchant from submission: " + JSON.stringify(result));
        this.merchant = result;
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
    }
    if (!this.equips) {
      this.data.updateData(false, 5, 1);
    } else {
      this.data.updateData(true, 5, 1);
    }

  }

  ngOnInit(): void {
    this.subscription = this.data.currentEquips.subscribe(equips => this.equips = equips);
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    this.subscription = this.processNrService.processId.subscribe(id => this.processId = id);
    this.subscription = this.processNrService.updateProcessId.subscribe(id => this.updateProcessId = id);
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
    var context = this;
    if ((this.processId != '' && this.processId != null) && this.returned != null) {
      if (this.returned == 'consult') {
        this.queuesInfo.getShopEquipmentConfigurationsFromProcess(this.processId, this.currentStore.id).then(result => {
          this.logger.info("Get equipments from shop result: " + JSON.stringify(result));
          var list = result.result;
          if (list.length > 0) {
            list.forEach(res => {
              this.queuesInfo.getProcessShopEquipmentDetails(context.processId, context.currentStore.id, res.id).then(r => {
                context.storeEquipList.push(r.result);
              }).then(res => {
                context.loadStoreEquips(this.storeEquipList);
              });
            });
          }
        }).then(res => {
        });
      } else {
        this.processService.getUpdateProcessInfo(this.processId, this.updateProcessId).then(result => {
          this.processInfo = result.result;
          var shop = this.processInfo.shops.find(shop => shop.id == context.currentStore.id);
          if (shop.equipments.length > 0) {
           context.equipmentSettings = shop.equipments[0].equipmentSettings;
           shop.equipments.forEach(equip => {
              if (equip.updateProcessAction != "Delete") {
                context.storeEquipList.push(equip);
              }
           });
            this.loadStoreEquips(this.storeEquipList);
          }
        });
      }
    } else {
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
  }

  loadStoreEquips(storeEquipValues: ShopEquipment[]) {
    this.storeEquipMat.data = storeEquipValues;
    this.storeEquipMat.paginator = this.storeEquipPaginator;
    this.storeEquipMat.sort = this.storeEquipSort;
  }

  selectStore(info) {
    this.closeAccordion();
    if (info.clickedTable) {
      this.submit(true);
    }
    this.replicate = false;
    this.showMore = false;
    this.storeEquipList = [];
    this.loadStoreEquips(this.storeEquipList);
    this.packId = "";
    this.packs = [];
    this.paymentSchemes = null;
    this.groupsList = [];
    this.commissionId = "";
    this.commissionOptions = [];
    this.commissionAttributeList = [];
    this.currentStore = info.store;
    this.currentIdx = info.idx;
    this.changedPackReturned = false;
    this.changedEAT = true;
    this.changedPackValue = true;
    this.firstTime = true;
    this.logger.info("Selected store: " + JSON.stringify(this.currentStore));
    this.logger.info("Selected store index: " + this.currentIdx);


    //setTimeout(() => this.setFormData(), 100);
    this.setFormData();
    if (this.form.get("replicateProducts").value)
      this.loadStoresWithSameBank(this.currentStore.bank.bank.bank); 

    this.getStoreEquipsFromSubmission();

    if (this.currentStore.pack != null) {
      this.getPackDetails();
    }

    this.resetValues();

    if (this.returned == 'consult')
      this.form.disable();
  }

  resetValues() {
    var context = this;
    this.commissionAttributeList.forEach(function (value, idx) {
      context.form.get("commission" + value.id).get("commissionMin" + value.id).setValue(value.minValue.originalValue + "");
      context.form.get("commission" + value.id).get("commissionMax" + value.id).setValue(value.maxValue.originalValue + "");
      context.form.get("commission" + value.id).get("commissionFixed" + value.id).setValue(value.fixedValue.originalValue + "");
      var val = (value.percentageValue.originalValue * 100).toFixed(3);
      if (val.includes(".")) {
        var split = val.split(".");
        if (split[1].length < 3) {
          var decimal = split[1].length == 0 ? "000" : split[1].length == 1 ? "00" + split[1] : "0" + split[1];
        } else {
          var decimal = split[1].substring(0, 3);
        }
        val = split[0] + "." + decimal;
      }
      if (val.includes(",")) {
        var split = val.split(",");
        if (split[1].length < 3) {
          var decimal = split[1].length == 0 ? "000" : split[1].length == 1 ? "00" + split[1] : "0" + split[1];
        } else {
          var decimal = split[1].substring(0, 3);
        }
        val = split[0] + "," + decimal;
      }
      if (!val.includes(".") && !val.includes(",")) {
        val = val + "." + "000";
      }
      context.form.get("commission" + value.id).get("commissionPercentage" + value.id).setValue(val);
    });
    //if (this.commissionId != "") {
    //  this.chooseCommission(this.commissionId);
    //}
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
        if (value["aggregatorId"] !== null && value["aggregatorId"] !== '') {
          if (value.isSelected) {
            if (group.get("formControl" + value["aggregatorId"])) {
              group.setControl("formControl" + value["aggregatorId"], new FormControl(value.description));
            } else {
              group.addControl("formControl" + value["aggregatorId"], new FormControl(value.description));
            }
          } else {
            if (group.get("formControl" + value["aggregatorId"])) {
              
            } else {
              group.addControl("formControl" + value["aggregatorId"], new FormControl(''));
            }
          }
        } else {
          group.addControl("formControl" + value.id, new FormControl(value.isSelected));
        }

        if (value.bundles != undefined || value.bundles != null || value.bundles?.length > 0) {
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

    if (charCode == 188 || charCode == 194)
      return true;

    if (charCode == 101 || charCode == 69 || charCode == 45 || charCode == 43 || charCode == 32) {
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

    if (this.currentStore.pack == null || this.currentStore?.pack?.commission?.commissionId == "" || this.currentStore?.pack?.commission?.attributes?.length == 0) {
      this.commissionAttributeList.forEach(function (value, idx) {
        valueGroup.setControl("commissionMin" + value.id, new FormControl(value.minValue.originalValue + "", Validators.required));
        valueGroup.setControl("commissionMax" + value.id, new FormControl(value.maxValue.originalValue + "", Validators.required));
        valueGroup.setControl("commissionFixed" + value.id, new FormControl(value.fixedValue.originalValue + "", Validators.required));
        var val = (value.percentageValue.originalValue * 100).toFixed(3);
        if (val.includes(".")) {
          var split = val.split(".");
          if (split[1].length < 3) {
            var decimal = split[1].length == 0 ? "000" : split[1].length == 1 ? "00" + split[1] : "0" + split[1];
          } else {
            var decimal = split[1].substring(0, 3);
          }
          val = split[0] + "." + decimal;
        }
        if (val.includes(",")) {
          var split = val.split(",");
          if (split[1].length < 3) {
            var decimal = split[1].length == 0 ? "000" : split[1].length == 1 ? "00" + split[1] : "0" + split[1];
          } else {
            var decimal = split[1].substring(0, 3);
          }
          val = split[0] + "," + decimal;
        }
        if (!val.includes(".") && !val.includes(",")) {
          val = val + "." + "000";
        }
        valueGroup.setControl("commissionPercentage" + value.id, new FormControl(val, Validators.required));
        context.form.setControl("commission" + value.id, valueGroup);
      });
    } else {
      this.commissionAttributeList.forEach(function (value, idx) {
        valueGroup.setControl("commissionMin" + value.id, new FormControl(value.minValue.finalValue + "", Validators.required));
        valueGroup.setControl("commissionMax" + value.id, new FormControl(value.maxValue.finalValue + "", Validators.required));
        valueGroup.setControl("commissionFixed" + value.id, new FormControl(value.fixedValue.finalValue + "", Validators.required));
        var val = (value.percentageValue.finalValue * 100).toFixed(3);
        if (val.includes(".")) {
          var split = val.split(".");
          if (split[1].length < 3) {
            var decimal = split[1].length == 0 ? "000" : split[1].length == 1 ? "00" : "0";
          } else {
            var decimal = split[1].substring(0, 3);
          }
          val = split[0] + "." + decimal;
        }
        if (val.includes(",")) {
          var split = val.split(",");
          if (split[1].length < 3) {
            var decimal = split[1].length == 0 ? "000" : split[1].length == 1 ? "00" : "0";
          } else {
            var decimal = split[1].substring(0, 3);
          }
          val = split[0] + "," + decimal;
        }
        if (!val.includes(".") && !val.includes(",")) {
          val = val + "." + "000";
        }
        valueGroup.setControl("commissionPercentage" + value.id, new FormControl(val, Validators.required));
        context.form.setControl("commission" + value.id, valueGroup);
      });
    }

  }

  //utilizado para mostrar os valores no PACOTE COMERCIAL
  getPackDetails() {
    if ((this.processId != '' && this.processId != null) && this.returned != null) {
      if (this.currentStore["updateProcessAction"] != null) {
      if (this.changedEAT) {
        this.packs = [];
        this.changedEAT = false;
        this.paymentSchemes = null;
        this.groupsList = [];
        this.productPack.productCode = this.currentStore.productCode;
        this.productPack.subproductCode = this.currentStore.subProductCode;
        this.productPack.merchant = this.merchantCatalog;
        this.productPack.store = {
          activity: this.currentStore.activity,
          subActivity: this.currentStore.subActivity,
          supportEntity: this.form.get("isUnicre").value ? "Acquirer" : "Other",
          referenceStore: this.currentStore.shopId,
          supportBank: this.currentStore?.bank?.bank?.bank
        }

        this.logger.info("Data sent to outbound get packs: " + JSON.stringify(this.productPack));
        this.COService.OutboundGetPacks(this.productPack).then(result => {
          this.logger.info("Get packs: " + JSON.stringify(result));
          this.packs = result.result;
          if (this.packs.length === 1) {
            this.form.get("productPackKind").markAsDirty();
            this.selectCommercialPack(this.packs[0].id);
          } else if (this.currentStore.pack != null) {
            this.selectCommercialPack(this.currentStore.pack.packId);
          }
        });
      }
      } else {
        if (this.firstTime) { 
          this.packs = [];
          this.packs.push({
            id: this.currentStore.pack.packId,
            description: this.currentStore.pack.packDescription,
            processors: this.currentStore.pack.processorId != null ? [this.currentStore.pack.processorId] : ["teste"]
          })
          this.selectCommercialPack(this.currentStore.pack.packId);
        }
      }
    } else {
      if (this.changedEAT) {
        this.packs = [];
        this.changedEAT = false;
        this.paymentSchemes = null;
        this.groupsList = [];
        this.productPack.productCode = this.currentStore.productCode;
        this.productPack.subproductCode = this.currentStore.subProductCode;
        this.productPack.merchant = this.merchantCatalog;
        this.productPack.store = {
          activity: this.currentStore.activity,
          subActivity: this.currentStore.subActivity,
          supportEntity: this.form.get("isUnicre").value ? "Acquirer" : "Other",
          referenceStore: this.currentStore.shopId,
          supportBank: this.currentStore?.bank?.bank?.bank
        }

        this.logger.info("Data sent to outbound get packs: " + JSON.stringify(this.productPack));
        this.COService.OutboundGetPacks(this.productPack).then(result => {
          this.logger.info("Get packs: " + JSON.stringify(result));
          this.packs = result.result;
          if (this.packs.length === 1) {
            this.form.get("productPackKind").markAsDirty();
            this.selectCommercialPack(this.packs[0].id);
          } else if (this.currentStore.pack != null) {
            this.selectCommercialPack(this.currentStore.pack.packId);
          }
        });
      }
    }
  }

  selectCommercialPack(packId: string) {
    if ((this.returned == null || this.returned == 'edit') && this.packId != "" && !this.firstTime) { //adicionei o firstTime
      if (this.storeEquipList.length > 0) {
        this.storeEquipList.forEach(equip => {
          this.deleteConfiguration(equip);
        });
      }
    }
    var context = this;
    this.packId = packId;
    this.changedPackValue = true;
    context.groupsList = [];
    context.paymentSchemes = null;

    if (this.currentStore.pack == null || this.returned == null || (this.returned == 'edit' && (this.processId == null || this.processId == '')) || this.currentStore["updateProcessAction"] != null) {
      this.COService.OutboundGetPackDetails(packId, this.productPack).then(res => {
        context.logger.info("Get pack details " + JSON.stringify(res));
        if (this.currentStore.pack == null) {
          context.paymentSchemes = res.result.paymentSchemes;
          context.addPaymentFormGroups();
          res.result.otherGroups.forEach(group => {
            context.groupsList.push(group);
          });
          context.equipmentSettings = res.result.equipmentSettings;
          context.joinSameIdGroups();
          context.addFormGroups();
          context.changedValue();
          if (this.returned == 'consult')
            this.form.disable();
        } else {
          context.updateCommercialPackInfo(res.result);
          context.getCommissionsList();
        }
      });
    } else {
      context.paymentSchemes = context.currentStore.pack.paymentSchemes;
      context.addPaymentFormGroups();
      context.groupsList = context.currentStore.pack.otherPackDetails;

      /*if (this.returned == 'edit') {
        this.productPack.productCode = this.currentStore.productCode;
        this.productPack.subproductCode = this.currentStore.subProductCode;
        this.productPack.merchant = this.merchantCatalog;
        this.productPack.store = {
          activity: this.currentStore.activity,
          subActivity: this.currentStore.subActivity,
          supportEntity: this.form.get("isUnicre").value ? "acquirer" : "other",
          referenceStore: this.currentStore.shopId,
          supportBank: this.currentStore?.bank?.bank?.bank
        }
        this.COService.OutboundGetPackDetails(packId, this.productPack).then(res => {
          context.equipmentSettings = res.result.equipmentSettings;
          context.joinSameIdGroups();
          context.addFormGroups();
          context.changedValue();
          if (this.returned == 'consult')
            this.form.disable();
          this.form.get("productPackKind").setValue(packId);
        });
      }*/

      //context.equipmentSettings = context.currentStore.pack.equipmentSettings;
      context.joinSameIdGroups();
      context.addFormGroups();
      context.changedValue();
      if (this.returned == 'consult')
        this.form.disable();
    }
    this.form.get("productPackKind").setValue(packId);
  }

  updateCommercialPackInfo(pack: ProductPack) {
    var context = this;

    pack.paymentSchemes.attributes.forEach(val => {
      var attr = context.currentStore.pack.paymentSchemes.attributes.find(att => att.id == val.id);
      if (attr != undefined) {
        val.isSelected = attr.isSelected;
      } else {
        val.isSelected = false;
      }
    });
    context.paymentSchemes = pack.paymentSchemes;
    context.addPaymentFormGroups();

    pack.otherGroups.forEach(value => {
      var group = context.currentStore.pack.otherPackDetails.find(grp => grp.id == value.id);
      if (group != undefined) {
        value.attributes.forEach(val => {
          var attr = group.attributes.find(att => att.id == val.id);
          if (attr != undefined) {
            val.isSelected = attr.isSelected;
          } else {
            val.isSelected = false;
          }
        });
      } else {
        //todos os atributos deste grupo vão ter o selected a false
        value.attributes.forEach(v => {
          v.isSelected = false;
        });
      }
    });
    context.groupsList = pack.otherGroups;


    context.equipmentSettings = pack.equipmentSettings;
    context.joinSameIdGroups();
    context.addFormGroups();
    context.changedValue();
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

    if (!this.firstTime)
      this.changedPackReturned = true;

    if ((this.returned == null || this.returned == 'edit') && !this.firstTime) {
      if (this.storeEquipList.length > 0) {
        this.storeEquipList.forEach(equip => {
          this.deleteConfiguration(equip);
        });
      }
    }
    this.firstTime = false;

    //atualizar a lista dos pacotes comerciais com os valores selecionados no front
    this.finalList = [];
    this.list = [];

    var oldArray = JSON.stringify(this.groupsList);
    this.list = JSON.parse(oldArray);

    this.list.forEach((group) => {
      group.attributes.forEach((attr) => {
        if (attr["aggregatorId"] !== null && attr["aggregatorId"] !== "") {
          if (attr.description === this.form.get("formGroup" + group.id)?.get("formControl" + attr["aggregatorId"])?.value) {
            attr.isSelected = true;
          } else {
            attr.isSelected = false;
          }
        } else {
          attr.isSelected = this.form.get("formGroup" + group.id)?.get("formControl" + attr.id)?.value;
        }
        //if (attr.isSelected && (attr.bundles != null || attr.bundles?.length > 0)) { // se tiver sido selecionado
        //  attr.bundles.forEach((bundle) => {
        //    bundle.attributes.forEach((bundleAttr) => {
        //      bundleAttr.isSelected = this.form.get("formGroup" + group.id)?.get("formGroupBundle" + bundle.id)?.get("formControlBundle" + bundleAttr.id)?.value;
        //    });
        //  });
        //}
      });
    });

    var finalGroupsList = this.list.filter(group => group.attributes.filter(attr => {
      if (attr.isSelected) {
        if (attr.bundles != null || attr.bundles?.length > 0) {
          attr.bundles?.filter(bundle => bundle.attributes.filter(bundleAttr => bundleAttr.isSelected));
        }
        return true;
      } else {
        return false;
      }
    }));

    this.list.forEach(group => {
      var groupList = group.attributes.filter(attr => attr.isSelected == true || (attr["aggregatorId"] != null && attr["aggregatorId"] != undefined && attr["aggregatorId"] != "" && attr.description == context.form.get("formGroup" + group.id)?.get("formControl" + attr["aggregatorId"])?.value));
      context.finalList.push(group);
      context.finalList.find(l => l.id == group.id).attributes = groupList;
      //group.attributes.forEach(attr => {
      //  attr.bundles?.forEach(bundle => {
      //    var bundleList = bundle.attributes.filter(bundleAttr => bundleAttr.isSelected == true);
      //    context.finalList.find(l => l.id == group.id).attributes.find(a => a.id == attr.id).bundles.find(b => b.id == bundle.id).attributes = bundleList;
      //  });
      //});
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
            if (attr.bundles != null || attr.bundles != undefined || attr.bundles?.length > 0) {
              attr.bundles?.forEach((bundle, index) => {
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

    var oldPayment = JSON.stringify(this.paymentSchemes);
    this.paymentList = JSON.parse(oldPayment);

    var group = context.form.get("formGroupPayment" + this.paymentList.id);
    this.paymentList.attributes.forEach(payment => {
      payment.isSelected = group.get("formControlPayment" + payment.id).value;
    });

    var finalPaymentAttributes = this.paymentList.attributes.filter(payment => payment.isSelected);
    this.paymentList.attributes = finalPaymentAttributes;

    this.list.push(this.paymentList);
  }

  joinSameIdGroups() {
    var context = this;
    this.groupsList.forEach(group => {
      var list = context.groupsList.filter(g => group.id == g.id && group.attributes[0].id != g.attributes[0].id);
      list.forEach(g => {
        group.attributes.push(...g.attributes);
        var index = context.groupsList.findIndex(gr => group.id == gr.id && group.attributes[0].id != gr.attributes[0].id);
        if (index > -1) {
          context.groupsList.splice(index, 1);
        }
      });
    });
    this.groupsList.forEach((group, index) => {
      if (group.id == context.paymentSchemes.id) {
        context.paymentSchemes.attributes.push(...group.attributes);
        context.groupsList.splice(index, 1);
      }
    });

  }

  //Utilizado para mostrar os valores na tabela do PREÇARIO LOJA
  getCommissionsList() {
    if ((this.processId != '' && this.processId != null) && this.returned != null) {
      this.commissionOptions = [];
      if (this.currentStore["updateProcessAction"] != null && this.currentStore["updateProcessAction"] == "Add" && this.currentStore.pack == null) {
        this.commissionFilter = {
          productCode: this.currentStore.productCode,
          subproductCode: this.currentStore.subProductCode,
          processorId: this.packs.find(pack => pack.id == this.packId).processors[0],
          merchant: this.merchantCatalog,
          store: {
            activity: this.currentStore.activity,
            subActivity: this.currentStore.subActivity,
            supportEntity: this.form.get("isUnicre").value ? "Acquirer" : "Other",
            referenceStore: this.currentStore.shopId,
            supportBank: this.currentStore.supportEntity
          },
          packAttributes: this.list //ter em atenção se os valores são alterados à medida que vamos interagindo com a interface
        }
        this.logger.info("Filter sent to get commercial pack commission list: " + JSON.stringify(this.commissionFilter));
        this.COService.ListProductCommercialPackCommission(this.packId, this.commissionFilter).then(result => {
          this.logger.info("Get commercial pack commission list result: " + JSON.stringify(result));
          this.commissionOptions = [];
          if (this.currentStore.pack == null || this.returned == null || (this.returned == 'edit' && (this.processId == null || this.processId == ''))) {
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
      
      } else {
        if (!this.changedPackReturned && this.currentStore.pack != null) {
          this.chooseCommission(this.currentStore.pack.commission.commissionId); 
        } else {
          if (this.changedPackValue) {
            this.commissionFilter = {
              productCode: this.currentStore.productCode,
              subproductCode: this.currentStore.subProductCode,
              processorId: this.packs.find(pack => pack.id == this.packId).processors[0],
              merchant: this.merchantCatalog,
              store: {
                activity: this.currentStore.activity,
                subActivity: this.currentStore.subActivity,
                supportEntity: this.form.get("isUnicre").value ? "Acquirer" : "Other",
                referenceStore: this.currentStore.shopId,
                supportBank: this.currentStore.supportEntity
              },
              packAttributes: this.list //ter em atenção se os valores são alterados à medida que vamos interagindo com a interface
            }
            this.logger.info("Filter sent to get commercial pack commission list: " + JSON.stringify(this.commissionFilter));
            this.COService.ListProductCommercialPackCommission(this.packId, this.commissionFilter).then(result => {
              this.logger.info("Get commercial pack commission list result: " + JSON.stringify(result));
              this.commissionOptions = [];
              if (this.currentStore.pack == null || this.returned == null || (this.returned == 'edit' && (this.processId == null || this.processId == '')) || this.currentStore["updateProcessAction"] != null) {
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
        
      }
    } else {
      if (this.packId != "" && this.returned != "consult") {
        if (this.changedPackValue) {
          //this.changedPackValue = false;
          this.commissionFilter = {
            productCode: this.currentStore.productCode,
            subproductCode: this.currentStore.subProductCode,
            processorId: this.packs.find(pack => pack.id == this.packId).processors[0],
            merchant: this.merchantCatalog,
            store: {
              activity: this.currentStore.activity,
              subActivity: this.currentStore.subActivity,
              supportEntity: this.form.get("isUnicre").value ? "Acquirer" : "Other",
              referenceStore: this.currentStore.shopId,
              supportBank: this.currentStore.supportEntity
            },
            packAttributes: this.list //ter em atenção se os valores são alterados à medida que vamos interagindo com a interface
          }
          this.logger.info("Filter sent to get commercial pack commission list: " + JSON.stringify(this.commissionFilter));
          this.COService.ListProductCommercialPackCommission(this.packId, this.commissionFilter).then(result => {
            this.logger.info("Get commercial pack commission list result: " + JSON.stringify(result));
            this.commissionOptions = [];
            if (this.currentStore.pack == null || this.returned == null || (this.returned == 'edit' && (this.processId == null || this.processId == ''))) {
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
      } else {
        //mandar pop-up e fechar tabulador
        document.getElementById("flush-collapseFour").className = "accordion-collapse collapse";
        document.getElementById("accordionButton4").className = "accordion1-button collapsed";
        this.snackBar.open(this.translate.instant('commercialOffer.openError'), '', {
          duration: 4000,
          panelClass: ['snack-bar']
        });
      }
    }
  }

  chooseCommission(commisionId: string) {
    var context = this;
    this.commissionId = commisionId;
    var productCode = this.currentStore.productCode;
    this.commissionAttributeList = [];
    if (this.currentStore.pack == null || this.returned == null && this.changedPackValue || (this.returned == 'edit' && (this.processId == null || this.processId == '') || this.changedPackReturned && this.changedPackValue)) {
      this.COService.GetProductCommercialPackCommission(this.packId, this.commissionId, this.commissionFilter).then(res => {
        this.commissionAttributeList = [];
        this.logger.info("Get commercial pack commission result: " + JSON.stringify(res));
        res.result.attributes.forEach(val => {
          let value: ProductPackCommissionAttribute = {};
          value.id = val.id;
          value.description = val.description;
          value.fixedValue = {
            originalValue: val.fixedValue.value,
            isReadOnly: val.fixedValue.isReadOnly,
            isVisible: val.fixedValue.isVisible,
            finalValue: context.currentStore.pack != null ? context.currentStore?.pack?.commission?.attributes?.find(comm => comm.id == val.id)?.fixedValue?.finalValue : null
          }
          value.maxValue = {
            originalValue: val.maxValue.value,
            isReadOnly: val.maxValue.isReadOnly,
            isVisible: val.maxValue.isVisible,
            finalValue: context.currentStore.pack != null ? context.currentStore?.pack?.commission?.attributes?.find(comm => comm.id == val.id)?.maxValue?.finalValue : null
          }
          value.minValue = {
            originalValue: val.minValue.value,
            isReadOnly: val.minValue.isReadOnly,
            isVisible: val.minValue.isVisible,
            finalValue: context.currentStore.pack != null ? context.currentStore?.pack?.commission?.attributes?.find(comm => comm.id == val.id)?.minValue?.finalValue : null
          }
          value.percentageValue = {
            originalValue: val.percentageValue.value,
            isReadOnly: val.percentageValue.isReadOnly,
            isVisible: val.percentageValue.isVisible,
            finalValue: context.currentStore.pack != null ? context.currentStore?.pack?.commission?.attributes?.find(comm => comm.id == val.id)?.percentageValue?.finalValue : null
          }
          context.commissionAttributeList.push(value);
        });
        //this.commissionAttributeList = res.result.attributes;
        this.addCommissionFormGroups();
        if (this.returned == 'consult')
          this.form.disable();
      });
    } else {
      this.currentStore.pack.commission.attributes.forEach(attr => {
        this.commissionAttributeList.push(attr);
      });
      this.addCommissionFormGroups();
      if (this.returned == 'consult')
        this.form.disable();
    }
    this.changedPackValue = false;
  }

  getStoresListLength(length) {
    this.storesLength = length;
  }

  configurationTerminal() {
    if (this.packId == "" && this.returned != 'consult') {
      document.getElementById("flush-collapseThree").className = "accordion-collapse collapse";
      document.getElementById("accordionButton3").className = "accordion1-button collapsed";
      this.snackBar.open(this.translate.instant('commercialOffer.openError'), '', {
        duration: 4000,
        panelClass: ['snack-bar']
      });
    }
  }

  setFormData() {
    this.form.get("replicateProducts").setValue(false);
    this.form.get("isUnicre").setValue(this.currentStore.supportEntity.toLowerCase() == 'acquirer' ? true : false);
    this.form.get("terminalRegistrationNumber").setValue((this.currentStore.registrationId != '' && this.currentStore.registrationId != null) ? this.currentStore.registrationId : null);

    if (this.form.get("replicateProducts").value)
      this.form.get("store").setValue(null);

    if (this.currentUser.permissions == UserPermissions.BANCA) {
      this.userBanca = true;
      this.form.get("isUnicre").setValue(false);
      this.form.get("isUnicre").disable();
      this.changeUnicre(false);
    } else {
      var value = this.currentStore.supportEntity.toLowerCase() == 'acquirer' ? true : false;
      this.userBanca = false;
      this.form.get("isUnicre").setValue(value);
      this.changeUnicre(value); 
    }
  }

  changeUnicre(bool: boolean) {
    this.isUnicre = bool;
    this.disableNewConfiguration = !bool;
    this.isNewConfig = null;
    if (!this.firstTime || this.packId == "")
      this.changedEAT = true;
    this.packs = [];
    this.packId = "";
    this.isPackSelected = false;
    this.form.get("productPackKind").setValue("");
    this.form.get("productPackKind").markAsUntouched();
    if (!bool) {
      this.form.get("terminalRegistrationNumber").setValue((this.currentStore.registrationId != '' && this.currentStore.registrationId != null) ? this.currentStore.registrationId : null); //null
      this.form.get("terminalRegistrationNumber").setValidators(Validators.required);
    } else {
      this.form.get("terminalRegistrationNumber").setValidators(null);
    }
    this.form.get("terminalRegistrationNumber").updateValueAndValidity();
    if (this.disableNewConfiguration) {
      this.data.changeEquips(true);
    }
  }

  changeReplicateProducts(bool: boolean) {
    this.replicate = bool;
    if (bool)
      this.loadStoresWithSameBank(this.currentStore.bank.bank.bank);
  }

  createNewConfiguration() {
    if (this.isNewConfig || this.isNewConfig == false) {
      this.isNewConfig = null;
    }
    this.isNewConfig = true;
  }

  submit(clickedTable: boolean = false) {
    var context = this;

    this.commissionAttributeList.forEach(commission => {
      var currentValue = this.form.get("commission" + commission.id);
      commission.minValue.finalValue = Number(currentValue.get("commissionMin" + commission.id).value.replace(/,/g, '.'));
      commission.maxValue.finalValue = Number(currentValue.get("commissionMax" + commission.id).value.replace(/,/g, '.'));
      commission.fixedValue.finalValue = Number(currentValue.get("commissionFixed" + commission.id).value.replace(/,/g, '.'));
      commission.percentageValue.finalValue = Math.trunc((Number(currentValue.get("commissionPercentage" + commission.id).value.replace(/,/g, '.')) / 100) * 100000) / 100000; //Number((Number(currentValue.get("commissionPercentage" + commission.id).value.replace(/,/g, '.')) / 100).toFixed(3));
    });

    //estava aqui antes os valores do changedValue()
    if (this.paymentSchemes != null) {
      var index = this.list.findIndex(group => group.id == this.paymentSchemes?.id);
      if (index > -1)
        this.list.splice(index, 1);
    }

    if (this.returned != 'consult') {
      if (this.form.valid && !(this.storeEquipList.length == 0 && !this.userBanca && this.isUnicre) && this.commissionId !== '') {
        this.currentStore.equipments = this.storeEquipList;
        this.currentStore.pack = {
          packId: this.packId,
          processorId: this.packs?.find(pack => pack.id == this.packId)?.processors[0],
          packDescription: this.packs?.find(pack => pack.id == this.packId)?.description,
          commission: {
            commissionId: this.commissionId,
            attributes: this.commissionAttributeList
          },
          paymentSchemes: this.paymentList,
          otherPackDetails: this.list
        }
        this.currentStore.supportEntity = this.form.get("isUnicre").value ? "Acquirer" : "Other";
        this.currentStore.registrationId = this.form.get("terminalRegistrationNumber")?.value?.toString();
        this.logger.info("Store data update " + JSON.stringify(this.currentStore));
        if (this.returned == null || (this.returned == 'edit' && (this.processId == null || this.processId == ''))) {
          if (!this.form.pristine) {
            this.storeService.updateSubmissionShop(this.submissionId, this.currentStore.id, this.currentStore).subscribe(result => {
              this.logger.info("Updated shop result: " + JSON.stringify(result));
              this.visitedStores.push(result.id);
              this.visitedStores = Array.from(new Set(this.visitedStores));
              if (!clickedTable) {
                if (this.visitedStores.length < this.storesLength) {
                  this.emitUpdatedStore(of({ store: this.currentStore, idx: this.currentIdx }));
                  this.closeAccordion();
                } else {
                  this.data.changeEquips(true);
                  this.data.updateData(true, 5);
                  this.logger.info("Redirecting to Info Declarativa page");
                  this.route.navigate(['info-declarativa']);
                }
              }
            });
          } else {
            this.visitedStores.push(this.currentStore.id);
            this.visitedStores = Array.from(new Set(this.visitedStores));
            if (!clickedTable) {
              if (this.visitedStores.length < this.storesLength) {
                this.emitUpdatedStore(of({ store: this.currentStore, idx: this.currentIdx }));
                this.closeAccordion();
              } else {
                this.data.changeEquips(true);
                this.data.updateData(true, 5);
                this.logger.info("Redirecting to Info Declarativa page");
                this.route.navigate(['info-declarativa']);
              }
            }
          }
        } else {
          if (!this.form.pristine) {
            this.processService.updateShopProcess(this.processId, this.currentStore.id, this.currentStore).then(result => {
              this.logger.info("Updated shop result: " + JSON.stringify(result.result));
              this.visitedStores.push(result.result.id);
              this.visitedStores = Array.from(new Set(this.visitedStores));
              if (!clickedTable) {
                if (this.visitedStores.length < this.storesLength) {
                  this.emitUpdatedStore(of({ store: this.currentStore, idx: this.currentIdx }));
                  this.closeAccordion();
                } else {
                  this.data.changeEquips(true);
                  this.data.updateData(true, 5);
                  this.logger.info("Redirecting to Info Declarativa page");
                  this.route.navigate(['info-declarativa']);
                }
              }
            });
          } else {
            this.visitedStores.push(this.currentStore.id);
            this.visitedStores = Array.from(new Set(this.visitedStores));
            if (!clickedTable) {
              if (this.visitedStores.length < this.storesLength) {
                this.emitUpdatedStore(of({ store: this.currentStore, idx: this.currentIdx }));
                this.closeAccordion();
              } else {
                this.data.changeEquips(true);
                this.data.updateData(true, 5);
                this.logger.info("Redirecting to Info Declarativa page");
                this.route.navigate(['info-declarativa']);
              }
            }
          }
        }
      } else {
        if (!clickedTable) {
          if (this.storeEquipList.length == 0 && !this.userBanca && this.isUnicre) {
            this.snackBar.open(this.translate.instant('generalKeywords.requiredTerminal'), '', {
              duration: 15000,
              panelClass: ['snack-bar']
            });
          } else if (this.commissionId == "" || this.commissionId == null) {
            this.snackBar.open(this.translate.instant('generalKeywords.requiredPricing'), '', {
              duration: 15000,
              panelClass: ['snack-bar']
            });
          } else {
            this.openAccordeons();
            this.form.markAllAsTouched();
            this.snackBar.open(this.translate.instant('generalKeywords.formInvalid'), '', {
              duration: 15000,
              panelClass: ['snack-bar']
            });
          }
        } else {
          this.currentStore.equipments = this.storeEquipList;
          this.currentStore.pack = {
            packId: this.packId,
            processorId: this.packs?.find(pack => pack.id == this.packId)?.processors[0],
            packDescription: this.packs?.find(pack => pack.id == this.packId)?.description,
            commission: {
              commissionId: this.commissionId,
              attributes: this.commissionAttributeList
            },
            paymentSchemes: this.paymentList,
            otherPackDetails: this.list
          }
          this.currentStore.supportEntity = this.form.get("isUnicre").value ? "Acquirer" : "Other";
          this.currentStore.registrationId = this.form.get("terminalRegistrationNumber")?.value?.toString();
        }
      }
    } else {
      this.data.changeEquips(true);
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

  openAccordeons() {
    document.getElementById("flush-collapseOne").className = "accordion-collapse collapse show";
    document.getElementById("accordionButton1").className = "accordion1-button";
    document.getElementById("flush-collapseTwo").className = "accordion-collapse collapse show";
    document.getElementById("accordionButton2").className = "accordion1-button";
    document.getElementById("flush-collapseThree").className = "accordion-collapse collapse show";
    document.getElementById("accordionButton3").className = "accordion1-button";
    document.getElementById("flush-collapseFour").className = "accordion-collapse collapse show";
    document.getElementById("accordionButton4").className = "accordion1-button";
  }

  emitUpdatedStore(info) {
    this.updatedStoreEvent = info;
  }

  changeShowMore() {
    this.showMore = !this.showMore;
  }

  emitStoreList(storeList) {
    this.storesList = storeList;
  }

  loadStoresWithSameBank(bank: string) {
    this.replicateStoresList = [];
    this.storesList.forEach(value => {
      if (value.pack != null && value.pack?.commission != null && value.pack?.otherPackDetails != null && value.productCode == this.currentStore.productCode && value.subProductCode == this.currentStore.subProductCode && value.activity == this.currentStore.activity && value.subActivity == this.currentStore.subActivity && value.bank.bank.bank == bank && this.currentStore.id != value.id) {
        this.replicateStoresList.push(value);
      }
    });
  }

  storeToReplicate(e) {
    var context = this;
    var replicateShop = this.replicateStoresList.find(x => x.id == e.target.value);
    let length = 0;
    if (replicateShop != undefined) {
      this.currentStore.pack = replicateShop.pack;
      this.currentStore.registrationId = replicateShop.registrationId;
      if ((this.processId != '' && this.processId != null) && this.returned != null) {
        this.storeService.getShopEquipmentConfigurationsFromProcess(context.processId, replicateShop.id).subscribe(result => {
          result.forEach(res => {
            context.queuesInfo.getProcessShopEquipmentDetails(context.processId, replicateShop.id, res.id).then(r => {
              var equip = r.result;
              var equipToAdd: ShopEquipment = {};
              equipToAdd.pricing = equip.pricing;
              equipToAdd.quantity = equip.quantity;
              equipToAdd.equipmentSettings = equip.equipmentSettings;
              if ((this.processId != '' && this.processId != null) && this.returned != null) {
                context.processService.addEquipmentToShopProcess(context.processId, context.currentStore.id, equipToAdd).then(res => {
                  length++;
                  equipToAdd.id = res.result.id;
                  context.storeEquipList.push(equipToAdd);
                  context.logger.info("Add Shop Equipment To Submission Response " + JSON.stringify(res.result));
                  if (result.length == length) {
                    context.loadStoreEquips(context.storeEquipList);
                    context.getPackDetails();
                  }
                });
              }
            });
          });
        });
      } else {
        this.storeService.getShopEquipmentConfigurationsFromSubmission(context.submissionId, replicateShop.id).then(result => {
          result.result.forEach(res => {
            context.storeService.getShopEquipmentFromSubmission(context.submissionId, replicateShop.id, res.id).then(r => {
              var equip = r.result;
              var equipToAdd: ShopEquipment = {};
              equipToAdd.pricing = equip.pricing;
              equipToAdd.quantity = equip.quantity;
              equipToAdd.equipmentSettings = equip.equipmentSettings;
              context.storeService.addShopEquipmentConfigurationsToSubmission(context.submissionId, context.currentStore.id, equipToAdd).subscribe(res => {
                length++;
                equipToAdd.id = res.id;
                context.storeEquipList.push(equipToAdd);
                context.logger.info("Add Shop Equipment To Submission Response " + JSON.stringify(res));
                if (result.result.length == length) {
                  context.loadStoreEquips(context.storeEquipList);
                  context.getPackDetails();
                }
              });
            });
          });
        });
      }
    }
  }

  deleteConfiguration(shopEquipment: ShopEquipment) {
    if (this.returned != 'consult') {
      if ((this.processId != '' && this.processId != null) && this.returned != null) {
        this.processService.deleteShopEquipmentFromProcess(this.processId, this.currentStore.id, shopEquipment.id).then(result => {
          this.logger.info("Deleted shop equipment with id " + shopEquipment.id);
          var index = this.storeEquipList.findIndex(equip => equip.id == shopEquipment.id);
          if (index != -1) {
            this.storeEquipList.splice(index, 1);
            this.loadStoreEquips(this.storeEquipList);
            if (!this.disableNewConfiguration && this.storeEquipList.length == 0) {
              this.data.updateData(false, 5, 1);
              this.data.changeEquips(false);
            }
            if (this.storeEquipList.length > 0) {
              this.data.changeEquips(true);
            }
          }
        });
      } else {
        this.storeService.deleteShopEquipmentConfigurationFromSubmission(this.submissionId, this.currentStore.id, shopEquipment.id).subscribe(result => {
          this.logger.info("Deleted shop equipment with id " + shopEquipment.id);
          var index = this.storeEquipList.findIndex(equip => equip.id == shopEquipment.id);
          if (index != -1) {
            this.storeEquipList.splice(index, 1);
            this.loadStoreEquips(this.storeEquipList);
            if (!this.disableNewConfiguration && this.storeEquipList.length == 0) {
              this.data.updateData(false, 5, 1);
              this.data.changeEquips(false);
            }
            if (this.storeEquipList.length > 0) {
              this.data.changeEquips(true);
            }
          }
        });
      }
    }
  }

  editConfiguration(shopEquipment: ShopEquipment) {
    if (this.returned != 'consult') {
      if (this.isNewConfig || this.isNewConfig == false) {
        this.isNewConfig = null;
      }
      this.isNewConfig = false;
      this.storeEquip = shopEquipment; //
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
    if (value) {
      this.isNewConfig = null;
      this.storeEquip = null;
    }
  }

  storeEquipEvent(value) {
    this.storeEquip = null;
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

  getTerminalDesc(equipSettings: EquipmentSettings[]) {
    var found = equipSettings?.find(equip => equip.id == "AK_000017");
    if (found != undefined) {
      return found?.attributes[0]?.description;
    } else {
      return '';
    }

  }

  getCommunicationDesc(equipSettings: EquipmentSettings[]) {
    var found = equipSettings?.find(equip => equip.id == "AK_000011");
    if (found != undefined) {
      return found?.attributes[0]?.description;
    } else {
      return '';
    }
  }

  onKeyDown(event: any) {
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab'];
    const regex = /^[0-9]+([,.][0-9]{1,3})?$/;
    let currentValue = this.form.get("commission" + event.target.id).get(event.target.name).value as string;
    currentValue = currentValue + event.key;
    if (currentValue.endsWith(",") || currentValue.endsWith(".")) {
      currentValue = currentValue + "0";
    }
    if (allowedKeys.indexOf(event.key) !== -1 || regex.test(currentValue)) {
      return true;
    }
    event.preventDefault();
    return false;
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
