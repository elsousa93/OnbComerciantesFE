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

@Component({
  selector: 'app-product-selection',
  templateUrl: './product-selection.component.html',
  styleUrls: ['./product-selection.component.css']
})
export class ProductSelectionComponent implements OnInit {

  public store: ShopDetailsAcquiring = {
    activity: "",
    address:
    {
      isInsideShoppingCenter: false,
      sameAsMerchantAddress: false,
      shoppingCenter: "",
      address:
      {
        address: "",
        country: "",
        postalArea: "",
        postalCode: ""
      }
    },
    bank: {
      bank:
      {
        bank: "",
        iban: ""
      },
      userMerchantBank: null
    },
    documents:
    {
      href: "",
      type: "",
      id: ""
    },
    id: "",
    manager: "",
    name: "",
    productCode: "",
    subActivity: "",
    subproductCode: "",
    website: ""
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

  constructor(private logger: LoggerService, private router: ActivatedRoute, private http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private route: Router, private data: DataService, private storeService: StoreService, private rootFormGroup: FormGroupDirective) {
    setTimeout(() => this.data.updateData(false, 3, 3), 0);


    if (this.route.getCurrentNavigation()?.extras?.state) {
      this.store = this.route.getCurrentNavigation().extras.state["store"];
      console.log('Store recebddnjkn ', this.store);
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
  }


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

    console.log("Store submetida ", this.store);

    this.storeService.addShopToSubmission(localStorage.getItem("submissionId"), this.store).subscribe(result => {
      console.log("Uma nova loja foi adicionada à submissão", result);
    });

    this.route.navigate(['store-comp']);
  }
}
