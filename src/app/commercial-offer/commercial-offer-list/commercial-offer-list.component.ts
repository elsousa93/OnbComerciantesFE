import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Configuration, configurationToken } from 'src/app/configuration';
import { DataService } from '../../nav-menu-interna/data.service';
import { Istore, ShopDetailsAcquiring, ShopEquipment } from '../../store/IStore.interface';
import { NGXLogger } from 'ngx-logger';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { AuthService } from '../../services/auth.service';
import { User } from '../../userPermissions/user';
import { UserPermissions } from '../../userPermissions/user-permissions';
import { ProductPackAttribute, TerminalSupportEntityEnum } from '../ICommercialOffer';


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
    supportEntity: TerminalSupportEntityEnum.ACQUIRER
  },
]

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

  ngAfterViewInit() {
    //this.storesMat = new MatTableDataSource();
    this.storesOfferMat.paginator = this.paginator;
  }

  constructor(private logger: NGXLogger, http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private route: Router, private data: DataService, private authService: AuthService) {
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
    }

    if (this.returned == 'consult') {
      //ir buscar a lista de lojas associadas ao processo que estamos a consultar
    } else {
      //ir buscar a lista de lojas da submissão em que nos encontramos
    }

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
    return this.form.get("productPackAttributesBundles") as FormArray;
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
    this.form.get("isUnicre").setValue(this.currentStore.supportEntity);

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

    }
  }

  changeShowMore() {
    this.showMore = !this.showMore;
  }

  loadStoresWithSameBank(bank: string) {
    
  }
}
