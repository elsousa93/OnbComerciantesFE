import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Configuration, configurationToken } from 'src/app/configuration';
import { DataService } from '../../nav-menu-interna/data.service';
import { CommunicationOwnershipTypeEnum, EquipmentOwnershipTypeEnum, Istore, ShopDetailsAcquiring, ShopEquipment, ShopProductPack } from '../../store/IStore.interface';
import { LoggerService } from 'src/app/logger.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { AuthService } from '../../services/auth.service';
import { User } from '../../userPermissions/user';
import { UserPermissions } from '../../userPermissions/user-permissions';
import { MerchantCatalog, MerchantContextEnum, Product, ProductPackAttribute, ProductPackCommissionAttribute, ProductPackCommissionFilter, ProductPackFilter, ProductPackKindEnum, ProductPackPricingEntry, ProductPackRootAttributeProductPackKind, TerminalSupportEntityEnum } from '../ICommercialOffer.interface';
import { StoreService } from '../../store/store.service';
import { CommercialOfferService } from '../commercial-offer.service';
import { SubmissionService } from '../../submission/service/submission-service.service';
import { ClientService } from '../../client/client.service';

@Component({
  selector: 'app-commercial-offer-list',
  templateUrl: './commercial-offer-list.component.html',
  styleUrls: ['./commercial-offer-list.component.css']
})
export class CommercialOfferListComponent implements OnInit {

  selectedPack: ShopProductPack = null;

  storesOfferMat!: MatTableDataSource<ShopDetailsAcquiring>;
  storeEquipMat!: MatTableDataSource<ShopEquipment>;

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

  public products: Product[];

  public isUnicre: boolean;
  public geographyChecked: boolean = false;

  displayedColumns: string[] = ['nameEstab', 'activityEstab', 'subActivityEstab', 'bank', 'terminalNumber', 'product'];

  storeEquipColumns: string[] = ['equipmentOwnership', 'equipmentType', 'communicationType', 'quantity', 'monthlyFee', 'delete', 'edit'];

  currentUser: User = {};
  replicateProducts: boolean;
  disableNewConfiguration: boolean;
  public storeEquip: ShopEquipment;
  public returned: string;
  public showMore: boolean;
  storesList: ShopDetailsAcquiring[];

  merchantCatalog: MerchantCatalog;
  productPack: ProductPackFilter;
  groupsList: ProductPackRootAttributeProductPackKind[] = [];
  commissionOptions: ProductPackPricingEntry[] = [];
  commissionFilter: ProductPackCommissionFilter;
  commissionAttributeList: ProductPackCommissionAttribute[] = [];

  submissionId: string;
  processNumber: string;


  getPacoteComercial() {
    console.log("loja selecionada: ", this.currentStore);
  }

  ngAfterViewInit() {
    //this.storesMat = new MatTableDataSource();
    this.storesOfferMat.paginator = this.paginator;
    this.storeEquipMat.paginator = this.storeEquipPaginator;
    this.storeEquipMat.sort = this.storeEquipSort;
  }

  constructor(private logger: LoggerService, http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private route: Router, private data: DataService, private authService: AuthService, private storeService: StoreService, private COService: CommercialOfferService, private submissionService: SubmissionService, private clientService: ClientService) {
    this.baseUrl = configuration.baseUrl;

    this.ngOnInit();

    if (this.route.getCurrentNavigation()?.extras?.state) {
      this.currentStore = this.route.getCurrentNavigation().extras.state["store"];
      this.storeEquip = this.route.getCurrentNavigation().extras.state["storeEquip"];
    }

    authService.currentUser.subscribe(user => this.currentUser = user);

    this.initializeForm();

    if (this.currentUser.permissions == UserPermissions.BANCA) {
      this.form.get("isUnicre").setValue(false);
      this.isUnicre = false;
      this.form.get("isUnicre").disable();
    } else {
      this.form.get("isUnicre").setValue(true);
      this.isUnicre = true;
    }

    //Ir buscar as lojas que já se encontram associadas à submissão em que nos encontramos, ou seja, se adicionarmos uma submissão nova
    this.storeService.getSubmissionShopsList(localStorage.getItem("submissionId")).subscribe(result => {
     result.forEach(value => {
       this.storeService.getSubmissionShopDetails(localStorage.getItem("submissionId"), value.id).subscribe(res => {
         this.storesList.push(res);
       });
     });
     this.loadStores(this.storesList);
    });

    //Caso seja DEVOLUÇÃO OU CONSULTA - Vamos buscar as lojas que foram inseridas na ultima submissão.
    if (this.returned != null) {
     this.submissionService.GetSubmissionByProcessNumber(this.processNumber).subscribe(result => {
       this.storeService.getSubmissionShopsList(result[0].submissionId).subscribe(resul => {
         resul.forEach(val => {
           this.storeService.getSubmissionShopDetails(result[0].submissionId, val.id).subscribe(res => {
             var index = this.storesList.findIndex(store => store.shopId == res.shopId);
             if (index == -1) // só adicionamos a Loja caso esta ainda n exista na lista
               this.storesList.push(res);
           });
         });
         this.loadStores(this.storesList);
       })
     });
    }

    this.COService.OutboundGetProductsAvailable().then(result => {
      this.products = result.result;
    });

    this.clientService.GetClientById(this.submissionId).subscribe(result => {
      this.merchantCatalog = {
        context: result.context,
        contextId: result.contextId,
        fiscalIdentification: {
          fiscalId: result.fiscalIdentification.fiscalId,
          issuerCountry: result.fiscalIdentification.issuerCountry
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

  loadStores(storesValues: ShopDetailsAcquiring[]) {
    this.storesOfferMat = new MatTableDataSource(storesValues);
    this.storesOfferMat.paginator = this.paginator;
  }

  loadStoreEquips(storeEquipValues: ShopEquipment[]) {
    this.storeEquipMat = new MatTableDataSource(storeEquipValues);
    this.storeEquipMat.paginator = this.storeEquipPaginator;
    this.storeEquipMat.sort = this.storeEquipSort;

  }

  selectStore(info) {
    this.currentStore = info.store;
    this.currentIdx = info.idx;

    if (this.form.get("replicateProducts").value)
      this.loadStoresWithSameBank(this.currentStore.bank.bank.bank);

    //if (info.store.supportEntity == 'other' || this.returned == 'consult')
    //  this.disableNewConfiguration = true;
    //else
    //  this.disableNewConfiguration = false;

    this.disableNewConfiguration = false;

    if (this.returned != null)
      setTimeout(() => this.setFormData(), 500);

    if (this.returned == 'consult')
      this.form.disable();
  }

  initializeForm() {
    this.form = new FormGroup({
      replicateProducts: new FormControl(this.replicateProducts, [Validators.required]),
      store: new FormControl(''),
      isUnicre: new FormControl(this.isUnicre, [Validators.required]),
      terminalRegistrationNumber: new FormControl(''),
      productPackKind: new FormControl('', [Validators.required]),
    });
  }

  addFormGroups() {
    var context = this;

    this.groupsList.forEach(function (value, idx) {
      console.log(value)
      var group = new FormGroup({});
      var attributes = value.attributes;

      attributes.forEach(function (value, idx) {
        console.log(value);
        group.addControl(("formControl" + value.id), new FormControl(value.originalValue));

        if (value.bundles !== [] && value.bundles !== undefined && value.bundles !== null) {
          var attributeGroup = new FormGroup({});
          var bundle = value.bundles;

          bundle.forEach(function (value, idx) {
            console.log(value);
            var bundleAttributes = value.attributes;

            bundleAttributes.forEach(function (value, idx) {
              console.log(value);
              attributeGroup.addControl(("formControl" + value.id), new FormControl(value.originalValue));
            });
            group.addControl("formGroup" + value.id, attributeGroup);
          });
        }
      });
      context.form.addControl("formGroup" + value.id, group);
    });
    console.log("form com os checkboxes: ", this.form);
  }

  //utilizado para mostrar os valores no PACOTE COMERCIAL
  getPackDetails() {
    this.productPack.productCode = this.form.get("productPackKind").value;
    this.productPack.subproductCode = this.form.get("").value;

    this.productPack.merchant = this.merchantCatalog;

    this.productPack.store = {
      activity: this.currentStore.activity,
      subActivity: this.currentStore.subActivity,
      supportEntity: TerminalSupportEntityEnum[this.currentStore.supportEntity] as TerminalSupportEntityEnum,
      referenceStore: this.currentStore.shopId,
      supportBank: this.currentStore.supportEntity
    }

    console.log('Product pack enviado para a API ', this.productPack);

    var context = this;

    this.COService.OutboundGetPacks(this.productPack).then(result => {
      result.result.forEach(pack => {
        this.COService.OutboundGetPackDetails(pack.id, this.productPack).then(res => {
          res.result.groups.forEach(group => {
            context.groupsList.push(group);
          });
          this.addFormGroups();
        });
      });
    });
  }

  //Utilizado para mostrar os valores na tabela do PREÇARIO LOJA
  getCommissionsList() {
    this.commissionFilter = {
      productCode : this.form.get("productPackKind").value,
      subproductCode: this.form.get("").value,
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
      result.result.forEach(options => {
        this.commissionOptions.push(options);
      })
    });
  }

  chooseCommission(commisionId: string) {
    var productCode = this.form.get("productPackKind").value;
    this.COService.GetProductCommercialPackCommission(productCode, commisionId, this.commissionFilter).then(res => {
      res.result.attributes.forEach(attr => {
        this.commissionAttributeList.push(attr);
      });
    });
  }

  setFormData() {
    //setValue(null) - são valores que ainda não conseguimos ir buscar
    this.form.get("replicateProducts").setValue(null);
    this.form.get("isUnicre").setValue(this.currentStore.supportEntity == 'acquirer' ? true : false);

    if (this.form.get("replicateProducts").value)
      this.form.get("store").setValue(null);

    if (!this.form.get("isUnicre").value)
      this.form.get("terminalRegistrationNumber").setValue(null);

    this.form.get("productPackKind").setValue(null);
  }

  onCickContinue() {
    this.route.navigate(['commercial-offert-tariff']);
  }

  changeUnicre(bool: boolean){
    this.isUnicre = bool;
  }

  changeReplicateProducts(bool: boolean) {
    this.replicateProducts = bool;
  }

  createNewConfiguration() {
    if (this.currentStore != null) {
      let navigationExtras: NavigationExtras = {
        state: {
          store: this.currentStore,
          packId: this.form.get("productPackKind").value,
          merchantCatalog: this.merchantCatalog,
          packAttributes: this.groupsList
        }
      }
      this.route.navigate(['/commercial-offert-new-configuration'], navigationExtras);
    }
  }

  submit() {
  //   if (this.returned != 'consult') {
  //     if (this.currentIdx < (testValues.length - 1)) {
  //       this.currentIdx = this.currentIdx + 1;
  //       this.selectStore({ store: testValues[this.currentIdx], idx: this.currentIdx });
  //       this.onActivate();
  //     } else {
        this.data.updateData(true, 5);
        this.route.navigate(['info-declarativa']);
  //     }
  //   }
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
      let navigationExtras: NavigationExtras = {
        state: {
          store: this.currentStore,
          storeEquip: shopEquipment,
          packId: this.form.get("productPackKind").value,
          merchantCatalog: this.merchantCatalog,
          packAttributes: this.groupsList
        }
      }
      this.route.navigate(['/commercial-offert-new-configuration'], navigationExtras);
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
}
