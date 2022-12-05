import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { Observable, of, Subscription } from 'rxjs';
import { Configuration, configurationToken } from 'src/app/configuration';
import { DataService } from '../../nav-menu-interna/data.service';
import { Istore, ShopDetailsAcquiring, ShopEquipment, ShopProductPack } from '../../store/IStore.interface';
import { LoggerService } from 'src/app/logger.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { AuthService } from '../../services/auth.service';
import { User } from '../../userPermissions/user';
import { UserPermissions } from '../../userPermissions/user-permissions';
import { MerchantCatalog, Product, ProductPackAttributeProductPackKind, ProductPackCommissionAttribute, ProductPackCommissionFilter, ProductPackEntry, ProductPackFilter, ProductPackPricingEntry, ProductPackRootAttributeProductPackKind, TerminalSupportEntityEnum } from '../ICommercialOffer.interface';
import { StoreService } from '../../store/store.service';
import { CommercialOfferService } from '../commercial-offer.service';
import { SubmissionService } from '../../submission/service/submission-service.service';
import { ClientService } from '../../client/client.service';
import { TableInfoService } from '../../table-info/table-info.service';
import { TenantCommunication, TenantTerminal } from '../../table-info/ITable-info.interface';

@Component({
  selector: 'app-commercial-offer-list',
  templateUrl: './commercial-offer-list.component.html',
  styleUrls: ['./commercial-offer-list.component.css']
})
export class CommercialOfferListComponent implements OnInit {

  selectedPack: ShopProductPack = null;

  //storesOfferMat!: MatTableDataSource<ShopDetailsAcquiring>;
  storeEquipMat = new MatTableDataSource<ShopEquipment>();

  form: FormGroup;
  private baseUrl: string;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  @ViewChild('storeEquipPaginator') storeEquipPaginator: MatPaginator;
  @ViewChild('storeEquipSort') storeEquipSort: MatSort;

  public stores: Istore[] = [];

  /*Is it supposed to relicate the Commercial offert from another store?*/
  selectionsReplicate = ['Não', 'Sim'];
  /*Default case*/
  selectedOption = 'Não';

  public subscription: Subscription;
  public map: Map<number, boolean>;
  public currentPage : number;
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

  emitPreviousStore(idx) {
    this.previousStoreEvent = idx;
  }

  getPacoteComercial() {
    console.log("loja selecionada: ", this.currentStore);
  }

  ngAfterViewInit() {
    //this.storesOfferMat.paginator = this.paginator;
    //this.storeEquipMat.paginator = this.storeEquipPaginator;
    this.storeEquipMat.sort = this.storeEquipSort;
  }


  constructor(private logger: LoggerService, http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private route: Router, private data: DataService, private authService: AuthService, private storeService: StoreService, private COService: CommercialOfferService, private submissionService: SubmissionService, private clientService: ClientService, private formBuilder: FormBuilder, private tableInfo: TableInfoService) {
    this.baseUrl = configuration.baseUrl;
    this.ngOnInit();
    this.loadReferenceData();

    if (this.route.getCurrentNavigation()?.extras?.state) {
      this.currentStore = this.route.getCurrentNavigation().extras.state["store"];
      this.storeEquip = this.route.getCurrentNavigation().extras.state["storeEquip"];
    }

    authService.currentUser.subscribe(user => this.currentUser = user);

    this.initializeForm();

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

    //this.COService.OutboundGetProductsAvailable().then(result => {
    //  this.products = result.result;
    //});

    this.clientService.GetClientByIdAcquiring(this.submissionId).then(result => {
      this.merchantCatalog = {
        context: result.context,
        contextId: result.contextId,
        fiscalIdentification: {
          fiscalId: result.fiscalId,
          issuerCountry: ""
        }
      }
    });

    this.data.updateData(false, 5, 1);
  }

  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    this.submissionId = localStorage.getItem("submissionId");
    this.processNumber = localStorage.getItem("processNumber");
    this.returned = localStorage.getItem("returned");
  }

  getStoreEquipsFromSubmission() {
    this.storeEquipList = [];
    if (this.returned != null) {
      this.storeService.getShopEquipmentConfigurationsFromProcess(this.processNumber, this.currentStore.shopId).subscribe(result => {
        if (result != null){
          this.storeEquipList.push(result);
        }
      });
    }

    this.storeService.getShopEquipmentConfigurationsFromSubmission(this.submissionId, this.currentStore.id).then(result => {
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
    this.commissionAttributeList = [];

    this.currentStore = info.store;
    this.currentIdx = info.idx;

    if (this.form.get("replicateProducts").value)
      this.loadStoresWithSameBank(this.currentStore.bank.bank.bank);

    setTimeout(() => this.setFormData(), 500);

    this.getStoreEquipsFromSubmission();

    this.getPackDetails();

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
    this.chooseCommission(this.commissionId);
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
    console.log("form com os checkboxes: ", this.form);
  }

  numericOnly(event): boolean {
    var ASCIICode = (event.which) ? event.which : event.keyCode;

    if (ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57))
      return false;
    return true;
  }
  
  decimalOnly(event): boolean { // restrict e,+,-,E characters in  input type number
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
    this.paymentSchemes = null;
    this.groupsList = [];

    this.productPack.productCode = this.currentStore.productCode;
    this.productPack.subproductCode = this.currentStore.subproductCode;

    this.productPack.merchant = this.merchantCatalog;

    this.productPack.store = {
      activity: this.currentStore.activity,
      subActivity: this.currentStore.subActivity,
      supportEntity: TerminalSupportEntityEnum[this.currentStore.supportEntity] as TerminalSupportEntityEnum,
      referenceStore: this.currentStore.shopId,
      supportBank: this.currentStore.supportEntity
    }

    this.COService.OutboundGetPacks(this.productPack).then(result => {
      this.packs = result.result;
      if (this.packs.length === 1) {
        this.form.get("productPackKind").setValue(this.packs[0].id);
        this.selectCommercialPack(this.packs[0].id);
      } else if (this.currentStore.pack != null) {
        this.selectCommercialPack(this.currentStore.pack.packId);
      }
    });
  
  }

  selectCommercialPack(packId: string) {
    var context = this;
    this.packId = packId;
    context.groupsList=[];
    context.paymentSchemes=null;
    this.form.get("productPackKind").setValue(packId);
    if (this.currentStore.pack == null) {
      this.COService.OutboundGetPackDetails(packId, this.productPack).then(res => {
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
      this.currentStore.pack.otherPackDetails.forEach(group => {
        context.groupsList.push(group);
      });
      context.addFormGroups();
    }
    this.getCommissionsList();
  }

  //Utilizado para mostrar os valores na tabela do PREÇARIO LOJA
  getCommissionsList() {
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
      packAttributes: this.groupsList //ter em atenção se os valores são alterados à medida que vamos interagindo com a interface
    }

    
    this.COService.ListProductCommercialPackCommission(this.commissionFilter.productCode, this.commissionFilter).then(result => {
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

  chooseCommission(commisionId: string) {
    this.commissionId = commisionId;
    var productCode = this.currentStore.productCode;
    this.commissionAttributeList = [];
    if (this.currentStore.pack == null) {
      this.COService.GetProductCommercialPackCommission(productCode, commisionId, this.commissionFilter).then(res => {
        //res.result.attributes.forEach(attr => {
        //  this.commissionAttributeList.push(attr);
        //});
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
    //setValue(null) - são valores que ainda não conseguimos ir buscar
    this.form.get("replicateProducts").setValue(null);
    this.form.get("isUnicre").setValue(this.currentStore.supportEntity.toLowerCase() == 'acquirer' ? true : false);

    if (this.form.get("replicateProducts").value)
      this.form.get("store").setValue(null);

    if (!this.form.get("isUnicre").value) {
      this.form.get("terminalRegistrationNumber").setValue(null);
      this.form.get("terminalRegistrationNumber").addValidators(Validators.required);
      this.form.updateValueAndValidity();
      this.disableNewConfiguration = true;
    }

    this.form.get("productPackKind").setValue(this.currentStore.pack?.packId);
  }

  onCickContinue() {
    this.route.navigate(['commercial-offert-tariff']);
  }

  changeUnicre(bool: boolean){
    this.isUnicre = bool;
    this.disableNewConfiguration = !bool;
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
    this.commissionAttributeList.forEach(commission => {
      var currentValue = this.form.get("commission" + commission.id);
      commission.minValue.finalValue = currentValue.get("commissionMin" + commission.id).value;
      commission.maxValue.finalValue = currentValue.get("commissionMax" + commission.id).value;
      commission.fixedValue.finalValue = currentValue.get("commissionFixed" + commission.id).value;
      commission.percentageValue.finalValue = currentValue.get("commissionPercentage" + commission.id).value;
    });

    this.groupsList.forEach((group) => {
      group.attributes.forEach((attr) => {
        if (attr["aggregatorId"] !== null) {
          attr.value = this.form.get("formGroup" + group.id)?.get("formControl" + attr["aggregatorId"])?.value;
        } else {
          attr.value = this.form.get("formGroup" + group.id)?.get("formControl" + attr.id)?.value;
        }
          if (attr.value && (attr.bundles != null || attr.bundles.length > 0 )) { // se tiver sido selecionado
            attr.bundles.forEach((bundle) => {
              bundle.attributes.forEach((bundleAttr) => { 
                bundleAttr.value = this.form.get("formGroup" + group.id)?.get("formGroupBundle" + bundle.id)?.get("formControlBundle" + bundleAttr.id)?.value;
              });
            }, this);
          }
      }, this);
    }, this);

    if (this.returned != 'consult') {
      this.currentStore.equipments = this.storeEquipList;
      this.currentStore.pack = {
        packId: this.packId,
        commission: {
          commissionId: this.commissionId,
          attributes: this.commissionAttributeList
        },
        paymentSchemes: this.paymentSchemes,
        otherPackDetails: this.groupsList
      }
      console.log("ESTRUTURA DE DADOS DA LOJA QUE VAI SER ATUALIZADA ", this.currentStore);
      this.storeService.updateSubmissionShop(this.submissionId, this.currentStore.id, this.currentStore).subscribe(result => {
        console.log('Loja atualizada ', this.currentStore);
        if (this.currentIdx < (this.storesLength - 1)) {
          this.emitUpdatedStore(of({ store: this.currentStore, idx: this.currentIdx }));
          this.closeAccordion();
        } else {
          this.data.updateData(true, 5);
          this.route.navigate(['info-declarativa']);
        }

      });
    }
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
    //CHAMADA À API QUE REMOVE UMA CONFUGURAÇÃO DE UM TERMINAL
    }
  }

  editConfiguration(shopEquipment: ShopEquipment) {
    if (this.returned != 'consult') {
      if (this.isNewConfig || this.isNewConfig == false) { 
        this.isNewConfig = null;
      }

      this.isNewConfig = false;

      this.storeEquip = shopEquipment;
      //let navigationExtras: NavigationExtras = {
      //  state: {
      //    store: this.currentStore,
      //    storeEquip: shopEquipment,
      //    packId: this.form.get("productPackKind").value,
      //    merchantCatalog: this.merchantCatalog,
      //    packAttributes: this.groupsList
      //  }
      //}
      //this.route.navigate(['/commercial-offert-new-configuration'], navigationExtras);
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
      this.route.navigate(['/comprovativos']);
    }
  }

  loadReferenceData() {
    this.subs.push(this.tableInfo.GetTenantCommunications().subscribe(result => {
      this.allCommunications = result;
      this.allCommunications = this.allCommunications.sort((a, b) => a.description > b.description ? 1 : -1); //ordenar resposta
    }), this.tableInfo.GetTenantTerminals().subscribe(result => {
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
