import { HttpClient } from '@angular/common/http';
import { Component, Inject, Input, OnInit } from '@angular/core';
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
import { SubProduct } from '../../table-info/ITable-info.interface';


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

  public store: ShopDetailsAcquiring = {
    shopId: "1",
    name: "ShopName",
    manager: "Manager1",
    activity: "C",
    subActivity: "C1",
    supportEntity: "Entity1",
    registrationId: "RegID",
    address: {
      useMerchantAddress: true,
      address: {
        address: "A",
        postalCode: "B",
        postalArea: "C",
        country: "123"
      },
      isInsideShoppingCenter: true,
      shoppingCenter: "Shopping1"
    },
    bank: {
      useMerchantBank: true,
      bank: {
        bank: "Bank",
        iban: "12345"
      }
    },
    website: "",
    productCode: "345",
    subproductCode: "324",
    equipments: [
      {
        shopEquipmentId: "123",
        communicationOwnership: CommunicationOwnershipTypeEnum.UNKNOWN,
        equipmentOwnership: EquipmentOwnershipTypeEnum.UNKNOWN,
        communicationType: "A",
        equipmentType: "A",
        quantity: 0,
        pricing: {
          id: "123",
          attribute: [
            {
              id: "A",
              description: "A",
              originalValue: 1,
              finalValue: 1,
              isReadOnly: true,
              isVisible: true
            }
          ]
        }
      }
    ],
    pack: {
      packId: "123",
      packDetails: [
        {
          id: "1234",
          description: "123",
          kind: "1234",
          attributes: [
            {
              id: "1234",
              description: "AAA",
              originalValue: true,
              finalValue: true,
              isReadOnly: true,
              isVisible: true,
              isSelected: true,
              order: 0,
              bundles: [
                {
                  id: "B",
                  description: "B",
                  kind: ProductPackKindEnum.SIMPLE,
                  attributes: [
                    {
                      id: "B123",
                      description: "B123456",
                      originalValue: true,
                      finalValue: true,
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
        commissionId: "1",
        attribute: {
          id: "",
          description: "A1",
          fixedValue: {
            originalValue: 1,
            finalValue: 1,
            isReadOnly: true,
            isVisible: true
          },
          maxValue: {
            originalValue: 1,
            finalValue: 1,
            isReadOnly: true,
            isVisible: true
          },
          minValue: {
            originalValue: 1,
            finalValue: 1,
            isReadOnly: true,
            isVisible: true
          },
          percentageValue: {
            originalValue: 1,
            finalValue: 1,
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
  } as ShopDetailsAcquiring

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
  public subProducts;
  public exists = false;

  public cardPresent;
  public cardNotPresent;
  public combinedOffer;

  constructor(private logger: LoggerService, private router: ActivatedRoute, private http: HttpClient,
    @Inject(configurationToken) private configuration: Configuration, private route: Router, private data: DataService,
    private storeService: StoreService, private rootFormGroup: FormGroupDirective) {
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


    this.storeService.GetAllShopProducts().subscribe(result => {
      this.logger.debug(result);
      console.log("resultado getAllShopProducts: ", result);
      this.products = result;
      this.getProductDescriptions(this.products);
    }, error => {
      this.logger.debug("Erro");
    });
  }

  //Prints Product Descriptions - for debug purposes
  getProductDescriptions(products) {
    console.log("getProductDescriptions");
    var productsNames;
    for (let i = 0; i < products.length; i++) {
      console.log(`${i} Description:${products[i].productDescription}, code:${products[i].productCode}`)
    }
    return productsNames;
  }

  chooseSolutionAPI(productDescription: any) {
    console.log("recebido do front: " + productDescription);
    this.products.forEach(Prod => {
      console.log("This Subprod: ", Prod.subProducts);
      var subProductToSearch = productDescription;
      if (subProductToSearch == Prod.productDescription) {
        console.log("entrou no if, subProd.productDescription: ", Prod.subProducts);
        this.subProducts = Prod.subProducts;
        this.exists = true;
        console.log("subProducts: ", this.subProducts);
        //Add to store to be Submitted
        // this.store.product = 
      }
    })
    if (!this.exists) {
      this.subProducts = [];
    }

    if (productDescription==="cardPresent" || productDescription==="CARD PRESENT") {
      this.isCardPresent = true;
      this.isCardNotPresent = false;
      this.isCombinedOffer = false;
    } else if (productDescription==="cardNotPresent" || productDescription==="CARD NOT PRESENT") {
      this.isCardPresent = false;
      this.isCardNotPresent = true;
      this.isCombinedOffer = false;
    } else if (productDescription==="OFERTA COMBINADA") {
      this.isCardPresent = false;
      this.isCardNotPresent = false;
      this.isCombinedOffer = true;
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
      solutionType: new FormControl((this.store.productCode !== null) ? this.store.productCode : '', Validators.required),
      subProduct: new FormControl((this.store.subproductCode !== null) ? this.store.subproductCode : ''),
      url: new FormControl((this.store.website !== null) ? this.store.website : '')
    });

    //URL só é obrigatório se caso o Tipo de Solução seja 'cardNotPresent'
    this.formStores.get("solutionType").valueChanges.subscribe(val => {
      if (val==='cardNotPresent' || val==='CARD NOT PRESENT')
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

  clearSubProducts() {
    console.log("CHAMADA DO METODO DOS SUBPRODUTOS");
    this.exists = false;
    this.subProducts = [];
  }

}
