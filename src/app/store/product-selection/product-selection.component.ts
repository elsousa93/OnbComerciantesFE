import { HttpClient } from '@angular/common/http';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoggerService } from 'src/app/logger.service';
import { Subscription } from 'rxjs';
import { Configuration, configurationToken } from '../../configuration';
import { DataService } from '../../nav-menu-interna/data.service';
import { ShopDetailsAcquiring } from '../IStore.interface';
import { StoreService } from '../store.service';
import { } from '../store.service';
import { EquipmentOwnershipTypeEnum, CommunicationOwnershipTypeEnum, ProductPackKindEnum, Product, ProductOutbound } from '../../commercial-offer/ICommercialOffer.interface';
import { SubProduct } from '../../table-info/ITable-info.interface';
import { CommercialOfferService } from '../../commercial-offer/commercial-offer.service';


@Component({
  selector: 'app-product-selection',
  templateUrl: './product-selection.component.html',
  styleUrls: ['./product-selection.component.css']
})
export class ProductSelectionComponent implements OnInit {
  @Input() parentFormGroup : FormGroup;

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

  public products: ProductOutbound[];
  public subProducts;
  public exists = false;
  public urlRegex;

  public cardPresent;
  public cardNotPresent;
  public combinedOffer;

  constructor(private logger: LoggerService, private router: ActivatedRoute, private http: HttpClient,
    @Inject(configurationToken) private configuration: Configuration, private route: Router, private data: DataService,
    private storeService: StoreService, private rootFormGroup: FormGroupDirective, private COService: CommercialOfferService) {
    setTimeout(() => this.data.updateData(true, 3, 3), 0);


    if (this.route.getCurrentNavigation()?.extras?.state) {
      this.store = this.route.getCurrentNavigation().extras.state["store"];
    }
  }

  ngOnInit(): void {
    this.returned = localStorage.getItem("returned");
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


    this.COService.OutboundGetProductsAvailable().then(result => {
      this.logger.debug(result);
      this.products = result.result;
    }, error => {
      this.logger.debug("Erro");
    });
  }

  chooseSolutionAPI(productDescription: any) {
    this.formStores.get('subProduct').setValue('');
    this.products.forEach(Prod => {
      var subProductToSearch = productDescription;
      if (subProductToSearch == Prod.name) {
        this.subProducts = Prod.subProducts;
        this.exists = true;
      }
    })
    if (!this.exists) {
      this.subProducts = [];
    }
  }

  //Returns picked SubProduct by the User --
  chooseSubSolutionAPI(subproduct: any) {
   //Add to store to be Submitted

  //  this.store.product.subProducts = this.subProducts; //Todos

  }

  URLFilled(filled: boolean) {
    this.isURLFilled = filled;
  }

  initializeForm() {
    this.formStores = new FormGroup({
      solutionType: new FormControl((this.store.productCode != null) ? this.store.productCode : '', Validators.required),
      subProduct: new FormControl((this.store.subproductCode != null) ? this.store.subproductCode : '', Validators.required),
      url: new FormControl((this.store.website != null) ? this.store.website : '', Validators.email)
    });

    //URL só é obrigatório se caso o Tipo de Solução seja 'cardNotPresent'
    this.urlRegex = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';
    this.formStores.get("solutionType").valueChanges.subscribe(val => {
      if (val==='cardNotPresent' || val==='CARD NOT PRESENT' || val==='Card Not Present') {
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
    this.store.subproductCode = this.formStores.get("subProduct").value;
    this.store.website = this.formStores.get("url").value;


    this.storeService.addShopToSubmission(localStorage.getItem("submissionId"), this.store).subscribe(result => {
      console.log("Uma nova loja foi adicionada à submissão", result);
    });
    this.route.navigate(['store-comp']);
  }

  clearSubProducts() {
    this.formStores.get("solutionType").setValue('');
    this.exists = false;
    this.subProducts = [];
  }
}
