import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoggerService } from 'src/app/logger.service';
import { Subscription } from 'rxjs';
import { Configuration, configurationToken } from '../../configuration';
import { DataService } from '../../nav-menu-interna/data.service';
import { ShopDetailsAcquiring } from '../IStore.interface';
import { StoreService } from '../store.service';
import { } from '../store.service';
import { EquipmentOwnershipTypeEnum, CommunicationOwnershipTypeEnum, ProductPackKindEnum, Product } from '../../commercial-offer/ICommercialOffer.interface';


@Component({
  selector: 'app-product-selection',
  templateUrl: './product-selection.component.html',
  styleUrls: ['./product-selection.component.css']
})
export class ProductSelectionComponent implements OnInit {
  public EquipmentOwnershipTypeEnum = EquipmentOwnershipTypeEnum;
  public CommunicationOwnershipTypeEnum = CommunicationOwnershipTypeEnum;
  public ProductPackKindEnum = ProductPackKindEnum;

  public store: ShopDetailsAcquiring = {
      shopId: "",
      name: "",
      manager: "",
      activity: "",
      subActivity: "",
      supportEntity: "",
      registrationId: "",
      address: {
          useMerchantAddress: true,
          address: {
              address: "",
              postalCode: "",
              postalArea: "",
              country: ""
          },
          isInsideShoppingCenter: false,
          shoppingCenter: ""
      },
      bank: {
          userMerchantBank: true,
          bank: {
              bank: "",
              iban: ""
          }
      },
      website: "",
      productCode: "",
      subproductCode: "",
      equipments: [
          {
              shopEquipmentId: "",
              communicationOwnership: CommunicationOwnershipTypeEnum.UNKNOWN,
              equipmentOwnership: EquipmentOwnershipTypeEnum.UNKNOWN,
              communicationType: "",
              equipmentType: "",
              quantity: 0,
              pricing: {
                  pricingId: "",
                  attributes: [
                      {
                          id: "",
                          description: "",
                          value: 0,
                          isReadOnly: true,
                          isVisible: true
                      }
                  ]
              }
          }
      ],
      pack: {
          packId: "",
          packDetails: [
              {
                  id: "",
                  description: "",
                  kind: "",
                  attributes: [
                      {
                          id: "",
                          description: "",
                          value: true,
                          isReadOnly: true,
                          isVisible: true,
                          isSelected: true,
                          order: 0,
                          bundles: [
                              {
                                  id: "",
                                  description: "",
                                  kind: ProductPackKindEnum.SIMPLE,
                                  attributes: [
                                      {
                                          id: "",
                                          description: "",
                                          value: true,
                                          isReadOnly: true,
                                          isVisible: true,
                                          isSelected: true,
                                          order: 0
                                      }
                                  ]
                              }
                          ]
                      }
                  ]
              }
          ],
          commission: {
              comissionId: "",
              attributes: {
                  id: "",
                  description: "",
                  fixedValue: {
                      value: 0,
                      isReadOnly: true,
                      isVisible: true
                  },
                  maxValue: {
                      value: 0,
                      isReadOnly: true,
                      isVisible: true
                  },
                  minValue: {
                      value: 0,
                      isReadOnly: true,
                      isVisible: true
                  },
                  percentageValue: {
                      value: 0,
                      isReadOnly: true,
                      isVisible: true
                  }
              }
          }
    },
      documents: {
        href: "",
        type: "",
        id: ""
      }
  } as  ShopDetailsAcquiring

  public map: Map<number, boolean>;
  public currentPage: number;
  public subscription: Subscription;

  formStores!: FormGroup;
  returned: string
  edit: boolean = false;

  public isCardPresent: boolean = false;
  public isCardNotPresent: boolean = false;
  public isCombinedOffer: boolean = false;
  public isURLFilled: boolean = false;

  public products;

  constructor(private logger: LoggerService, private router: ActivatedRoute, private http: HttpClient,
    @Inject(configurationToken) private configuration: Configuration, private route: Router, private data: DataService,
    private storeService: StoreService, private rootFormGroup: FormGroupDirective) {
    setTimeout(() => this.data.updateData(false, 3, 3), 0);


    if (this.route.getCurrentNavigation()?.extras?.state) {
      this.store = this.route.getCurrentNavigation().extras.state["store"];
    }
  }

  ngOnInit(): void {
    this.returned = localStorage.getItem("returned");
    this.initializeForm();


    if (this.rootFormGroup.form != null) {
      this.rootFormGroup.form.addControl('productStores', this.formStores);
      this.edit = true;
      if (this.returned == 'consult') {
        this.formStores.disable();
      }
    } else {
      this.subscription = this.data.currentData.subscribe(map => this.map = map);
      this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    }


    this.storeService.GetAllShopProducts().subscribe(result => {
    this.logger.debug(result);
      console.log("resultado getAllShopProducts: ", result);
    
      this.products = result; this.getProductDescriptions(this.products);
      for (let i = 0; i < this.products.length; i++) {
        console.log(`${i} Description:${this.products[i].productDescription}, code:${this.products[i].productCode}`)
      }

        }, error => {
          this.logger.debug("Erro");
        });
  }

  //----------------------------
  getProductDescriptions(products) {
    console.log("getProductDescriptions");
    var productsNames;
    for (let i = 0; i < products.length; i++) {
      productsNames = products.productDescription[i];
      console.log("Funcao: ", productsNames)
      console.log(`${i} Description:${products[i].productDescription}, code:${products[i].productCode}`)
    }
    return productsNames;
  }
  getProductsubProducts(product) {
  }
   //----------------------------

  chooseSolution(cardPresent: boolean, cardNotPresent: boolean, combinedOffer: boolean) {


    this.logger.debug("cardPresent: " + cardPresent);
    this.logger.debug("cardNotPresent: " + cardNotPresent);
    this.logger.debug("combinedOffer: " + combinedOffer);
   

    if (cardPresent) {
      this.isCardPresent = cardPresent;
      this.isCardNotPresent = false;
      this.isCombinedOffer = false;
    } else if (cardNotPresent) {
      this.isCardPresent = false;
      this.isCardNotPresent = cardNotPresent;
      this.isCombinedOffer = false;
    } else if (combinedOffer) {
      this.isCardPresent = false;
      this.isCardNotPresent = false;
      this.isCombinedOffer = combinedOffer;
    }
  }

  URLFilled(filled: boolean) {
    this.isURLFilled = filled;
  }

  initializeForm() {
    this.formStores = new FormGroup({
      solutionType: new FormControl((this.store.productCode !== null) ? this.store.productCode : '', Validators.required),
      subProduct: new FormControl((this.store.subproductCode !== null) ? this.store.subproductCode : ''),
      url: new FormControl((this.store.website !== null) ? this.store.website : '')
    });

    //URL só é obrigatório se caso o Tipo de Solução seja 'cardNotPresent'
    this.formStores.get("solutionType").valueChanges.subscribe(val => {
      if (val == 'cardNotPresent')
        this.formStores.get('url').setValidators([Validators.required]);
      else
        this.formStores.get('url').setValidators(null);
      this.formStores.get('url').updateValueAndValidity();
    });
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
}
