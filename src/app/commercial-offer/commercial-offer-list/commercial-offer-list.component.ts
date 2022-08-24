import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Configuration, configurationToken } from 'src/app/configuration';
import { DataService } from '../../nav-menu-interna/data.service';
import { CommunicationOwnershipTypeEnum, EquipmentOwnershipTypeEnum, Istore, ShopDetailsAcquiring, ShopEquipment } from '../../store/IStore.interface';
import { NGXLogger } from 'ngx-logger';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { AuthService } from '../../services/auth.service';
import { User } from '../../userPermissions/user';
import { UserPermissions } from '../../userPermissions/user-permissions';
import { ProductPackAttribute, TerminalSupportEntityEnum } from '../ICommercialOffer';
import { StoreService } from '../../store/store.service';
import { CommercialOfferService } from '../commercial-offer.service';
import { SubmissionService } from '../../submission/service/submission-service.service';


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

const storeEquipTest: ShopEquipment = {
  communicationOwnership: CommunicationOwnershipTypeEnum.CLIENT,
  communicationType: "2",
  equipmentOwnership: EquipmentOwnershipTypeEnum.SELF,
  equipmentType: "1",
  quantity: 10,
  pricing: {
    attributes: 
      [
        {
          id: "abc",
          description: "description",
          value: 100,
          isReadOnly: true,
          isVisible: false
        },
        {
          id: "bde",
          description: "description 2",
          value: 500,
          isReadOnly: false,
          isVisible: true
        },
      ]
    ,
    pricingId: "id"
  }
}

@Component({
  selector: 'app-commercial-offer-list',
  templateUrl: './commercial-offer-list.component.html',
  styleUrls: ['./commercial-offer-list.component.css']
})
export class CommercialOfferListComponent implements OnInit {

  storesOfferMat: MatTableDataSource<ShopDetailsAcquiring>;

  form: FormGroup;
  private baseUrl: string;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  public stores: Istore[] = [];
  public clientID: number = 12345678;

  /*Is it supposed to relicate the Commercial offert from another store?*/
  selectionsReplicate = ['Não', 'Sim'];
  /*Default case*/
  selectedOption = 'Não';

  public subscription: Subscription;
  public map: Map<number, boolean>;
  public currentPage : number;
  public currentStore: ShopDetailsAcquiring = null;
  public currentIdx: number = 0;

  public isUnicre: boolean;
  public geographyChecked: boolean = false;

  displayedColumns: string[] = ['nameEstab', 'activityEstab', 'subActivityEstab', 'bank', 'terminalNumber', 'product'];


  currentUser: User = {};
  replicateProducts: boolean;
  disableNewConfiguration: boolean;
  public storeEquip: ShopEquipment;
  public returned: string;
  public showMore: boolean;
  storesList: ShopDetailsAcquiring[];

  storeEquipTest = storeEquipTest;

  ngAfterViewInit() {
    //this.storesMat = new MatTableDataSource();
    this.storesOfferMat.paginator = this.paginator;
  }

  constructor(private logger: NGXLogger, http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private route: Router, private data: DataService, private authService: AuthService, private storeService: StoreService, private COService: CommercialOfferService, private submissionService: SubmissionService) {
    this.baseUrl = configuration.baseUrl;

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
    //this.storeService.getSubmissionShopsList(localStorage.getItem("submissionId")).subscribe(result => {
    //  result.forEach(value => {
    //    this.storeService.getSubmissionShopDetails(localStorage.getItem("submissionId"), value.id).subscribe(res => {
    //      this.storesList.push(res);
    //    });
    //  });
    //  this.loadStores(this.storesList);
    //});

    //Caso seja DEVOLUÇÃO OU CONSULTA - Vamos buscar as lojas que foram inseridas na ultima submissão.
    //if (this.returned !== null) {
    //  this.submissionService.GetSubmissionByProcessNumber(localStorage.getItem("processNumber")).subscribe(result => {
    //    this.storeService.getSubmissionShopsList(result[0].submissionId).subscribe(resul => {
    //      resul.forEach(val => {
    //        this.storeService.getSubmissionShopDetails(result[0].submissionId, val.id).subscribe(res => {
    //          var index = this.storesList.findIndex(store => store.id == res.id);
    //          if (index == -1) // só adicionamos a Loja caso esta ainda n exista na lista
    //            this.storesList.push(res);
    //        });
    //      });
    //      this.loadStores(this.storesList);
    //    })
    //  });
    //}

    this.data.updateData(false, 5);
  }

  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    this.loadStores();
    this.returned = localStorage.getItem("returned");
  }

  loadStores(storesValues: ShopDetailsAcquiring[] = testValues) {
    this.storesOfferMat = new MatTableDataSource(storesValues);
    this.storesOfferMat.paginator = this.paginator;
  }

  selectStore(store: ShopDetailsAcquiring, idx: number) {
    this.currentStore = store;
    this.currentIdx = idx;

    if (this.form.get("replicateProducts").value)
      this.loadStoresWithSameBank(this.currentStore.bank.bank.bank);

    if (store.supportEntity == 'other' || this.returned == 'consult')
      this.disableNewConfiguration = true;
    else
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
      productPackAttributes: new FormGroup({
        productPackAttributesBrands: new FormArray([]),
        productPackAttributesBundles: new FormArray([]),
        productPackAttributesAddInfo: new FormArray([])
      }),

    });
  }

  get productPackAttributesBrands() {
    return this.form.get("productPackAttributesBrands") as FormArray;
  }

  get productPackAttributesBundles() {
    return this.form.get("productPackAttributesBundles") as FormArray;
  }

  get productPackAttributesAddInfo() {
    return this.form.get("productPackAttributesAddInfo") as FormArray;
  }

  //chamar este metodo no html quando estivermos a fazer o ngFor aos atributos do productPack
  addAttributeToFormArray(attribute: ProductPackAttribute, formArray: FormArray) {
    if (attribute.isVisible) {
      formArray.push(new FormControl({
        value: attribute.value,
        disabled: attribute.isReadOnly,
      }));
    }
  }

  //fazer a lógica de atribuir os valores ao form aqui
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
          store: this.currentStore
        }
      }
      this.route.navigate(['/commercial-offert-new-configuration'], navigationExtras);
    }
  }

  submit() {
    if (this.returned != 'consult') {
      if (this.currentIdx < (testValues.length - 1)) {
        this.currentIdx = this.currentIdx + 1;
        this.selectStore(testValues[this.currentIdx], this.currentIdx);
        this.onActivate();
      } else {
        this.data.updateData(true, 5);
        this.route.navigate(['info-declarativa']);
      }
    }
  }

  changeShowMore() {
    this.showMore = !this.showMore;
  }

  loadStoresWithSameBank(bank: string) {
    
  }

  deleteConfiguration(shopEquipment: ShopEquipment = storeEquipTest) {
    if (this.returned != 'consult') { 
    //CHAMADA À API QUE REMOVE UMA CONFUGURAÇÃO DE UM TERMINAL
    }
  }

  editConfiguration(shopEquipment: ShopEquipment = storeEquipTest) {
    if (this.returned != 'consult') { 
      let navigationExtras: NavigationExtras = {
        state: {
          store: this.currentStore,
          storeEquip: shopEquipment
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
