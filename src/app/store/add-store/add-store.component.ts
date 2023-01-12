import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ShopActivities, ShopSubActivities, ShopDetailsAcquiring } from '../IStore.interface';
import { AppComponent } from '../../app.component';
import { CountryInformation, ShoppingCenter, SubActivity } from '../../table-info/ITable-info.interface';
import { Product, Subproduct } from '../../commercial-offer/ICommercialOffer.interface';
import { TableInfoService } from '../../table-info/table-info.service';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/nav-menu-interna/data.service';
import { FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { SubmissionGetTemplate } from '../../submission/ISubmission.interface';
import { Client } from '../../client/Client.interface';
import { LoggerService } from 'src/app/logger.service';
import { EquipmentOwnershipTypeEnum, CommunicationOwnershipTypeEnum, ProductPackKindEnum } from '../../commercial-offer/ICommercialOffer.interface';
import { StoreService } from '../store.service';


@Component({
  selector: 'app-add-store',
  templateUrl: './add-store.component.html',
  styleUrls: ['./add-store.component.css']
})

//This component allows to add a new store or edit the main configutarion of a store

export class AddStoreComponent implements OnInit {

  public EquipmentOwnershipTypeEnum = EquipmentOwnershipTypeEnum;
  public CommunicationOwnershipTypeEnum = CommunicationOwnershipTypeEnum;
  public ProductPackKindEnum = ProductPackKindEnum;

  @Input() parentFormGroup: FormGroup;

  //Submissao
  submissionId: string;
  submission: SubmissionGetTemplate;
  @Input() submissionClient: Client;

  subActivities: ShopSubActivities[] = [];

  //Informação de campos/tabelas
  Countries: CountryInformation[] = [];
  public map: Map<number, boolean>;
  public currentPage: number;
  public subscription: Subscription;

  public isComercialCentreStore: boolean = null;

  private baseUrl;
  public replicateAddress: boolean = true;
  formStores!: FormGroup;
  edit: boolean = false;

  /*Variable declaration*/
  public stroreId: number = 0;
  store: ShopDetailsAcquiring =
    {
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
      website: "www.google.com",
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
                //originalValue: 1,
                //finalValue: 1,
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


  /*CHANGE - Get via service from the clients  - Address*/
  public commCountry: string = "";
  public auxCountry: string = "";

  public commPostal: string = "";
  public auxPostal: string = "";

  public commAddress: string = "";
  public auxAddress: string = "";

  public commIP: string = "";
  public auxIP: string = "";

  public commLocal: string = "";
  public auxLocal: string = "";

  /*CHANGE - Get via service from the clients  - Contacts*/
  public commEmail: string = "";
  public auxEmail: string = "";

  public commInd: string = "+351";
  public auxInd: string = "";

  public commCellNumber: string = ""
  public auxCellNumber: string = "";

  /*Is it supposed to relicate the Commercial offert from another store?*/
  selectionsAddReplicate = ['Não', 'Sim'];
  selectionsContactReplicate = ['Não', 'Sim'];

  selectedAddOption = 'Não';
  selectedContactOption = 'Não';

  public idisabledAdd: boolean = false;
  public idisabledContact: boolean = false;

  activities: ShopActivities[] = [];
  activity: ShopActivities[] = [];
  subActivity: SubActivity[] = [];
  subzonesShopping: ShoppingCenter[] = [];

  clientHasCAE: boolean = false;

  returned: string;

  countries: CountryInformation[] = [];

  subzones: {
    code: string,
    locality: string,
    name: string
  }[] = [];

  products: Product[] = [];
  subProducts: Subproduct[] = [];

  lockLocality: boolean = true;

  public subs: Subscription[] = [];

  constructor(private logger: LoggerService, private router: ActivatedRoute,
    private route: Router, public appComp: AppComponent, private tableInfo: TableInfoService, private storeService: StoreService,
    private data: DataService,
    private rootFormGroup: FormGroupDirective) {

    this.submissionId = localStorage.getItem("submissionId");
    setTimeout(() => this.data.updateData(false, 3, 2), 0);
  }

  ngOnInit(): void {
    this.fetchStartingInfo();
    this.initializeForm();
    this.returned = localStorage.getItem("returned");

    if (this.rootFormGroup.form != null) {
      this.rootFormGroup.form.setControl('infoStores', this.formStores);
      this.edit = true;

      if (this.returned == 'consult') {
        this.formStores.disable();
      }
    } else {
      this.replicateAddress = true;
      this.appComp.updateNavBar("Adicionar Loja")
      this.stroreId = Number(this.router.snapshot.params['stroreid']);
      this.subscription = this.data.currentData.subscribe(map => this.map = map);
      this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub?.unsubscribe);
  }

  fetchStartingInfo() {
    if (this.submissionClient?.mainEconomicActivity != null && this.submissionClient?.mainEconomicActivity != "") {
      var code = this.submissionClient?.mainEconomicActivity.split('-')[0];
      this.clientHasCAE = true;
      this.subs.push(this.tableInfo.FilterStoreByCAE(code).subscribe(result => {
        this.logger.debug(result);
        this.activity = result;
        this.activity = this.activity.sort((a, b) => a.activityDescription > b.activityDescription ? 1 : -1); //ordenar resposta

      }, error => {
        this.logger.debug("Deu erro");
      }));
    } else {
      this.clientHasCAE = false;
      this.subs.push(this.storeService.GetAllShopActivities().subscribe(result => {
        this.logger.debug(result);
        this.activities = result;
        this.activities = this.activities.sort((a, b) => a.activityDescription > b.activityDescription ? 1 : -1); //ordenar resposta
      }, error => {
        this.logger.debug("Deu erro");
      }));
    }

    this.tableInfo.GetAllCountries().subscribe(result => {
      this.countries = result;
    })
  }

  //When canceling the create new store feature the user must navigate back to store list
  onCickCancel() {
    this.route.navigate(['store-comp']);
  }

  /*Controles the radio button changes*/
  radioAddChangehandler(event: any) {
    this.selectedAddOption = event.target.value;
    if (this.selectedAddOption == "Sim") {
      /*Update Country according to the default from Client*/
      this.auxCountry = this.store.address.address.country;
      this.store.address.address.country = this.commCountry;
      /*Update Postal Code according to the default from Client*/
      this.auxPostal = this.store.address.address.postalCode;
      this.store.address.address.postalCode = this.commPostal;
      /*Update Address according to the default from Client*/
      this.auxAddress = this.store.address.address.address;
      this.store.address.address.address = this.commAddress;

      this.auxLocal = this.store.address.address.postalArea;
      this.store.address.address.postalArea = this.commLocal;

      /*Disable the fields from the address*/
      this.idisabledAdd = true;

    } else {
      /*Update Country according to the previous value selected*/
      this.store.address.address.country = this.auxCountry;
      /*Update Postal Code according to the previous value selected*/
      this.store.address.address.postalCode = this.auxPostal;
      /*Update Addresss according to the previous value selected*/
      this.store.address.address.address = this.auxAddress;

      /*Update IP according to the previous value selected*/
      //this.store.fixedIP = this.auxIP;

      /*Update Locale according to the previous value selected*/
      this.store.address.address.postalArea = this.auxLocal;

      /*Enable the fields from the address*/
      this.idisabledAdd = false;
    }

  }

  radioContactChangehandler(event: any) {
    this.selectedContactOption = event.target.value;
    if (this.selectedContactOption == "Sim") {

    } else {

    }
  }

  submit() {
    this.store.name = this.formStores.get("storeName").value;
    this.store.contactPerson = this.formStores.get("contactPoint").value;

    this.store.activity = this.formStores.get("activityStores").value;
    this.store.subActivity = this.formStores.get("subactivityStores").value;
    this.store.product = this.formStores.get("productStores").value;
    this.store.subProduct = this.formStores.get("subProductStores").value;

    if (!this.replicateAddress) {
      this.store.address.address.address = this.formStores.get("addressStore").value;
      this.store.address.address.country = this.formStores.get("countryStore").value;
      this.store.address.address.postalArea = this.formStores.get("localeStore").value;
      this.store.address.address.postalCode = this.formStores.get("zipCodeStore").value;
      this.store.address.useMerchantAddress = false;
    } else {
      this.store.address.address.address = this.submissionClient.headquartersAddress.address;
      this.store.address.address.country = this.submissionClient.headquartersAddress.country;
      this.store.address.address.postalArea = this.submissionClient.headquartersAddress.postalArea;
      this.store.address.address.postalCode = this.submissionClient.headquartersAddress.postalCode;
      this.store.address.useMerchantAddress = true;
    }

    if (this.isComercialCentreStore) {
      this.store.address.shoppingCenter = this.formStores.get("subZoneStore").value;
    } else {
      console.log('Valor do commercial ', this.formStores.get("commercialCenter").value);
    }

    this.store.address.isInsideShoppingCenter = this.isComercialCentreStore;

    let navigationExtras: NavigationExtras = {
      state: {
        store: this.store
      }
    }

    this.route.navigate(['/add-store-iban'], navigationExtras);
  }

  chooseAddress(toChoose: boolean) {
    this.replicateAddress = toChoose;
    this.formStores.get('replicate').setValue(toChoose);
    if (!toChoose) {
      this.formStores.get('localeStore').setValidators([Validators.required]);
      this.formStores.get('addressStore').setValidators([Validators.required]);
      this.formStores.get('countryStore').setValidators([Validators.required]);
      this.formStores.get('zipCodeStore').setValidators([Validators.required]);

      this.formStores.get('localeStore').updateValueAndValidity();
      this.formStores.get('addressStore').updateValueAndValidity();
      this.formStores.get('countryStore').updateValueAndValidity();
      this.formStores.get('zipCodeStore').updateValueAndValidity();
    } else {
      this.formStores.get('localeStore').setValidators(null);
      this.formStores.get('addressStore').setValidators(null);
      this.formStores.get('countryStore').setValidators(null);
      this.formStores.get('zipCodeStore').setValidators(null);

      this.formStores.get('localeStore').setValue('');
      this.formStores.get('addressStore').setValue('');
      this.formStores.get('zipCodeStore').setValue('');

      this.formStores.get('localeStore').updateValueAndValidity();
      this.formStores.get('addressStore').updateValueAndValidity();
      this.formStores.get('countryStore').updateValueAndValidity();
      this.formStores.get('zipCodeStore').updateValueAndValidity();

    }
  }

  numericOnly(event): boolean {
    var ASCIICode = (event.which) ? event.which : event.keyCode;

    if (ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57) && ASCIICode != 45)
      return false;
    return true;
  }

  GetCountryByZipCode() {
    this.subzonesShopping = null;
    var currentCountry = this.formStores.get('countryStore').value;
    this.logger.debug("Pais escolhido atual");

    this.formStores.get('addressStore').setValue('');
    this.formStores.get('localeStore').setValue('');

    if (currentCountry === 'PT') {
      this.lockLocality = true;
      var zipcode = this.formStores.value['zipCodeStore'];
      if (zipcode.length === 8) {
        var zipCode = zipcode.split('-');

        this.tableInfo.GetAddressByZipCodeShops(zipCode[0], zipCode[1]).then(success => {
          var address = success.result;
          var addressToShow = address[0];

          this.formStores.get('addressStore').setValue(addressToShow.address);
          this.formStores.get('countryStore').setValue(addressToShow.country);
          this.formStores.get('localeStore').setValue(addressToShow.postalArea);

        }, error => {
          console.log("error no codigo postal: ", error);
        });
      }
    } else {
      this.lockLocality = false;
      this.formStores.get('addressStore').setValidators(null);
      this.formStores.get('zipCodeStore').setValidators(null);
      this.formStores.get('localeStore').setValidators(null);
    }
  }

  clean() {
    if (this.formStores.get('countryStore').value !== 'PT') {
      this.lockLocality = false;
      this.formStores.get('addressStore').setValidators(null);
      this.formStores.get('zipCodeStore').setValidators(null);
      this.formStores.get('localeStore').setValidators(null);

      this.formStores.get('addressStore').setValue('');
      this.formStores.get('zipCodeStore').setValue('');
      this.formStores.get('localeStore').setValue('');
    } else {
      this.lockLocality = true;
      this.formStores.get('addressStore').addValidators(Validators.required);
      this.formStores.get('zipCodeStore').addValidators(Validators.required);
      this.formStores.get('localeStore').addValidators(Validators.required);

      this.formStores.get('addressStore').setValue('');
      this.formStores.get('zipCodeStore').setValue('');
      this.formStores.get('localeStore').setValue('');
    }
  }

  canEditLocality() {
    if (this.returned === 'consult')
      return false;
    if (this.lockLocality)
      return false;
    return true;
  }

  initializeForm() {
    this.formStores = new FormGroup({
      storeName: new FormControl('', Validators.required),
      activityStores: new FormControl((this.returned !== null) ? this.store.activity : '', [Validators.required]),
      countryStore: new FormControl('PT'),
      zipCodeStore: new FormControl(''),
      subZoneStore: new FormControl(''),
      contactPoint: new FormControl(''),
      subactivityStore: new FormControl((this.returned !== null) ? this.store.subActivity : '', [Validators.required]),
      localeStore: new FormControl(''),
      addressStore: new FormControl(''),
      replicate: new FormControl(true, Validators.required),
      commercialCenter: new FormControl(this.isComercialCentreStore, Validators.required)
    })
    this.formStores.get("activityStores").valueChanges.subscribe(v => {
      this.onActivitiesSelected();
      if (this.subActivities.length > 0)
        this.formStores.controls["subactivityStore"].setValidators([Validators.required]);
      else
        this.formStores.controls["subactivityStore"].clearValidators();
      this.formStores.controls["subactivityStore"].updateValueAndValidity();
    });
  }

  comercialCentre(isCentre: boolean) {
    this.isComercialCentreStore = isCentre;
    if (isCentre) {
      this.formStores.get('subZoneStore').setValidators([Validators.required]);
      if (!this.replicateAddress) {
        this.formStores.get('replicate').setValue(false);
        //chamar a API que vai buscar o centro comercial por codigo postal caso seja replicada a morada do cliente empresa
        this.subs.push(this.tableInfo.GetShoppingByZipCode(this.formStores.value['zipCodeStore'].split("-", 1)).subscribe(result => {
          this.logger.debug(result);
          this.subzonesShopping = result;
          this.subzonesShopping = this.subzonesShopping.sort((a, b) => a.description > b.description ? 1 : -1); //ordenar resposta
        }, error => {
          this.logger.debug("Deu erro");
        }));
      } else {
        this.formStores.get('replicate').setValue(true);
        if (this.submissionClient?.headquartersAddress?.postalCode != '' && this.submissionClient?.headquartersAddress?.postalCode != null) {
          var postalCode = this.submissionClient?.headquartersAddress?.postalCode.split("-", 1)[0];
          this.subs.push(this.tableInfo.GetShoppingByZipCode(Number(postalCode)).subscribe(res => {
            this.subzonesShopping = res;
            this.subzonesShopping = this.subzonesShopping.sort((a, b) => a.description > b.description ? 1 : -1); //ordenar resposta
          }, error => {
            this.logger.debug("Deu erro");
          }));
        }
      }
    } else {
      this.formStores.get('subZoneStore').setValidators(null);
    }
    this.formStores.get('subZoneStore').updateValueAndValidity();
  }

  onActivitiesSelected() {
    if (!this.clientHasCAE) {
      var exists = false;
      this.activities.forEach(act => {
        var actToSearch = this.formStores.get('activityStores').value;
        if (actToSearch == act.activityCode) {
          exists = true;
          this.subActivities = act.subActivities;
        }
      })
      if (!exists) {
        this.subActivities = [];
      }
    } else {
      var exists = false;
      this.activity.forEach(act => {
        var actToSearch = this.formStores.get('activityStores').value;
        if (actToSearch == act.activityCode) {
          exists = true;
          this.subActivity = act.subActivities;
        }
      })
      if (!exists) {
        this.subActivity = [];
      }
    }
  }

  onProductsSelected() {
    var exists = false;

    this.products.forEach(prod => {
      var prodToSearch = this.formStores.get('activityStores').value;
      if (prodToSearch == prod.productCode) {
        exists = true;
      }
    })
    if (!exists) {
      this.subProducts = [];
    }
  }
}