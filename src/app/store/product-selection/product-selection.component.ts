import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoggerService } from 'src/app/logger.service';
import { Subscription } from 'rxjs';
import { DataService } from '../../nav-menu-interna/data.service';
import { ShopDetailsAcquiring } from '../IStore.interface';
import { StoreService } from '../store.service';
import { } from '../store.service';
import { EquipmentOwnershipTypeEnum, CommunicationOwnershipTypeEnum, ProductPackKindEnum, ProductOutbound } from '../../commercial-offer/ICommercialOffer.interface';
import { CommercialOfferService } from '../../commercial-offer/commercial-offer.service';

@Component({
  selector: 'app-product-selection',
  templateUrl: './product-selection.component.html',
  styleUrls: ['./product-selection.component.css']
})
export class ProductSelectionComponent implements OnInit {
  @Input() parentFormGroup: FormGroup;
  @Input() currentStore: ShopDetailsAcquiring;

  public EquipmentOwnershipTypeEnum = EquipmentOwnershipTypeEnum;
  public CommunicationOwnershipTypeEnum = CommunicationOwnershipTypeEnum;
  public ProductPackKindEnum = ProductPackKindEnum;
  public store: ShopDetailsAcquiring = new ShopDetailsAcquiring();
  public map: Map<number, boolean>;
  public currentPage: number;
  public subscription: Subscription;
  

  formStores!: FormGroup;
  returned: string
  edit: boolean = false;
  url: AbstractControl;

  public isCardPresent: boolean = false;
  public isCardNotPresent: boolean = false;
  public isCombinedOffer: boolean = false;
  public isURLFilled: boolean = false;
  public products: ProductOutbound[] = [];
  public subProducts;
  public exists = false;
  public urlRegex;
  public cardPresent;
  public cardNotPresent;
  public combinedOffer;
  window: any = window;

  constructor(private logger: LoggerService, private router: ActivatedRoute, private route: Router, private data: DataService,
    private storeService: StoreService, private rootFormGroup: FormGroupDirective, private COService: CommercialOfferService) {
    this.returned = localStorage.getItem("returned");
    if (this.returned != 'consult') {
      this.COService.OutboundGetProductsAvailable().then(result => {
        this.logger.info("Get store products result: " + JSON.stringify(result));
        this.products = result.result;
        if (this.formStores.get("solutionType").value != "" && this.formStores.get("solutionType").value != null) {
          var subProduct = this.formStores.get("subProduct").value;
          this.chooseSolutionAPI(this.formStores.get("solutionType").value);
          this.chooseSubSolutionAPI(subProduct);
        } else {
          if (this.products.length == 1) {
            this.formStores.get("solutionType").setValue(this.products[0].code);
            this.chooseSolutionAPI(this.products[0].code);
          }
        }
      }, error => {
        this.logger.error(error, "", "Error fetching store products");
      });
    }
    
    setTimeout(() => this.data.updateData(true, 3, 3), 0);
    if (this.route.getCurrentNavigation()?.extras?.state) {
      this.store = this.route.getCurrentNavigation().extras.state["store"];
    }
  }

  ngOnInit(): void {
    this.initializeForm();
    if (this.rootFormGroup.form != null) {
      this.rootFormGroup.form.setControl('productStores', this.formStores);
      this.edit = true;
      if (this.returned == 'consult') {
        this.formStores.disable();
      }
    } else {
      this.subscription = this.data.currentData.subscribe(map => this.map = map);
      this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    }
  }

  chooseSolutionAPI(productCode: any) {
    if (this.returned == 'consult') {
      this.products = [];
      this.products.push({
        code: this.currentStore.productCode,
        name: this.currentStore.productCodeDescription,
        subProducts: [{
          code: this.currentStore.subProductCode,
          name: this.currentStore.subProductCodeDescription
        }]
      });
    }
    this.formStores.get('subProduct').setValue('');
    this.products?.forEach(Prod => {
      if (productCode == Prod.code) {
        this.formStores.get("solutionName").setValue(Prod.name);
        this.subProducts = Prod.subProducts;
        this.exists = true;
      }
    })
    if (!this.exists) {
      //this.subProducts = [];
    }

  }

  chooseSubSolutionAPI(subproduct: any) {
    this.exists = true;
    this.formStores.get('subProduct').setValue(subproduct);
    this.formStores.get('subProductName').setValue(this.subProducts?.find(prod => prod.code == subproduct)?.name);
  }

  URLFilled(filled: boolean) {
    this.isURLFilled = filled;
  }

  initializeForm() {
    this.formStores = new FormGroup({
      solutionType: new FormControl((this.store.productCode != null) ? this.store.productCode : '', Validators.required),
      subProduct: new FormControl((this.store.subProductCode != null) ? this.store.subProductCode : '', Validators.required),
      url: new FormControl((this.store.website != null) ? this.store.website : '', Validators.email),
      solutionName: new FormControl(''),
      subProductName: new FormControl('')
    });

    //URL só é obrigatório se caso o Tipo de Solução seja 'cardNotPresent'
    this.urlRegex = '((^(http|https):\\/\\/)?((www\\.)[a-zA-Z0-9]*\\.[a-z]{2,6}))\\b([-a-zA-Z0-9@:%_\\+.~#?&\\/=]*)$([-a-zA-Z0-9@:%._\\+~#?&\\/=]*)';
    this.formStores.get("solutionType").valueChanges.subscribe(val => {
      if (val === 'cardNotPresent' || val === 'CARD NOT PRESENT' || val === 'Card Not Present' || val === 'CNP' || val === 'NOTPRESENT' || val === 'FV_001302') {
        this.formStores.get('url').setValidators([Validators.required, Validators.pattern(this.urlRegex)]);
      } else
        this.formStores.get('url').setValidators(Validators.pattern(this.urlRegex));
      this.formStores.get('url').updateValueAndValidity();
    });
  }

  get urlValid() {
    return this.formStores.get('url');
  }

  submit() {
    this.store.productCode = this.formStores.get("solutionType").value;
    this.store.subProductCode = this.formStores.get("subProduct").value;
    this.store.website = this.formStores.get("url").value;
    this.storeService.addShopToSubmission(localStorage.getItem("submissionId"), this.store).subscribe(result => {
      
    });
    this.route.navigate(['store-comp']);
  }

  clearSubProducts() {
    this.formStores.get("solutionType").setValue('');
    this.exists = false;
    this.subProducts = [];
  }

  chooseSolutionOne() {
    if (this.products.length == 1) {
      this.formStores.get("solutionType").setValue(this.products[0].code);
      this.chooseSolutionAPI(this.products[0].code);
    }
  }
}
