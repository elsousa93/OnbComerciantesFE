import { HttpClient } from '@angular/common/http';
import { Component, Host, Inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Istore, ShopActivities, ShopSubActivities, ShopDetailsAcquiring, ShopDetailsOutbound } from '../IStore.interface';
import { AppComponent } from '../../app.component';
import { CountryInformation, ShoppingCenter } from '../../table-info/ITable-info.interface';
import { Product, Subproduct } from '../../commercial-offer/ICommercialOffer.interface';
import { TableInfoService } from '../../table-info/table-info.service';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/nav-menu-interna/data.service';
import { Configuration, configurationToken } from 'src/app/configuration';
import { FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { SubmissionService } from '../../submission/service/submission-service.service';
import { Merchant, SubmissionGetTemplate } from '../../submission/ISubmission.interface';
import { Client } from '../../client/Client.interface';
import { ClientService } from '../../client/client.service';
import { LoggerService } from 'src/app/logger.service';
import { StoreService } from '../store.service';
import { Country } from '../../stakeholders/IStakeholders.interface';
import { EquipmentOwnershipTypeEnum, CommunicationOwnershipTypeEnum, ProductPackKindEnum } from '../../commercial-offer/ICommercialOffer.interface';


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

  @Input() parentFormGroup : FormGroup;

  //Submissao
  submissionId: string;
  submission: SubmissionGetTemplate;
  submissionClient: Client;

  subActivities: ShopSubActivities[] = [];

  //Informação de campos/tabelas
  Countries: CountryInformation[] = [];
  public map: Map<number, boolean>;
  public currentPage: number;
  public subscription: Subscription;

  public isComercialCentreStore: boolean = null;

  private baseUrl;

  cae: string = "5212";
  public chooseAddressV: boolean = false;
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
        userMerchantBank: true,
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
            pricingId: "123",
            attributes: [
              {
                id: "A",
                description: "A",
                value: 1,
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
                value: true,
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
          comissionId: "1",
          attributes: {
            id: "",
            description: "A1",
            fixedValue: {
              value: 1,
              isReadOnly: true,
              isVisible: true
            },
            maxValue: {
              value: 2,
              isReadOnly: true,
              isVisible: true
            },
            minValue: {
              value: 0,
              isReadOnly: true,
              isVisible: true
            },
            percentageValue: {
              value: 1,
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


  public clientID: number = 12345678;
  public totalUrl: string = "";

  public zonasTuristicas: string[] = ["Não", "Sim"];
  defaultZonaTuristica: number = 0;

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
  subzonesShopping: ShoppingCenter[] = [];

  returned: string;

  countries: CountryInformation[] = [];

  subzones: {
    code: string,
    locality: string,
    name: string
  }[] = [];

  products: Product[] = [];
  subProducts: Subproduct[] = [];

  loadTableInfo() {
    this.tableInfo.GetAllCountries().subscribe(res => {
      this.Countries = res;
    })
  }

  updateForm() {
    this.formStores.get("contactPoint").setValue((this.submissionClient.merchantType === 'Entrepeneur') ? this.submissionClient.legalName : '', Validators.required);
  }

  public subs: Subscription[] = [];

  constructor(private logger: LoggerService, private router: ActivatedRoute, private http: HttpClient,
    private tableData: TableInfoService, @Inject(configurationToken) private configuration: Configuration,
    private route: Router, public appComp: AppComponent, private tableInfo: TableInfoService,
    private data: DataService, private submissionService: SubmissionService, private clientService: ClientService,
    private rootFormGroup: FormGroupDirective, private storeService: StoreService) {

    this.submissionId = localStorage.getItem("submissionId");
    this.fetchStartingInfo();
    this.loadTableInfo();
    this.ngOnInit();
    setTimeout(() => this.data.updateData(false, 3, 2), 0);
  }

  ngOnInit(): void {
    this.initializeForm();
    this.returned = localStorage.getItem("returned");

    if (this.rootFormGroup.form != null) {
      this.rootFormGroup.form.addControl('infoStores', this.formStores);
      this.edit = true;

      if (this.returned == 'consult') {
        this.formStores.disable();
      }
    } else {
      this.chooseAddressV = true;
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
    this.clientService.GetClientById(this.submissionId).subscribe(client => {

      this.submissionClient = client;

      this.logger.debug("cliente da submissao: " + this.submissionClient);
      this.updateForm();
    });

    this.subs.push(this.tableInfo.GetAllShopActivities().subscribe(result => {
      this.logger.debug(result);
      this.activities = result;
    }, error => {
      this.logger.debug("Deu erro");
    }));

    this.storeService.GetAllShopProducts().subscribe(result => {
      this.logger.debug(result);
      console.log("resultado: ", result);

      this.products = result;
    }, error => {
      this.logger.debug("Erro");
    });

    this.tableData.GetAllCountries().subscribe(result => {
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

      /*Update IP according to the default from Client*/
      //this.auxIP = this.store.fixedIP;
      //this.store.fixedIP = this.commIP;
      /*Update Locale according to the default from Client*/

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
      ///*Update Email according to the default from Client*/
      //this.auxEmail = this.store..emailContact;
      //this.store.emailContact = this.commEmail;
      ///*Update Indicative according to the default from Client*/
      //this.auxInd = this.store.cellphoneIndic;
      //this.store.cellphoneIndic = this.commInd;
      ///*Update Cellphone number according to the default from Client*/
      //this.auxCellNumber = this.store.cellphoneNumber;
      //this.store.cellphoneNumber = this.commCellNumber;

      ///*Disable the fields from the address*/
      //this.idisabledContact = true;
    } else {
      ///*Update Email according to the previous value selected*/
      //this.store.emailContact = this.auxEmail;
      ///*Update Indicative according to the previous value selected*/
      //this.store.cellphoneIndic = this.auxInd;
      ///*Update Indicative according to the previous value selected*/
      //this.store.cellphoneNumber = this.auxCellNumber;

      ///*Enable the fields from the address*/
      //this.idisabledContact = false;
    }
  }

  submit() {
    this.store.name = this.formStores.get("storeName").value;
    if (this.submissionClient?.merchantType == 'Entrepreneur')
      this.store.manager = this.submissionClient.legalName; // caso o cliente seja ENI, o nome do ponto de contacto fica com o nome do comerciante
    else
      this.store.manager = this.formStores.get("contactPoint").value;

    this.store.activity = this.formStores.get("activityStores").value;
    this.store.subActivity = this.formStores.get("subactivityStores").value;
    this.store.product = this.formStores.get("productStores").value;
    this.store.subProduct = this.formStores.get("subProductStores").value;

    if (this.chooseAddressV) {
      this.store.address.address.address = this.formStores.get("addressStore").value;
      this.store.address.address.country = this.formStores.get("countryStore").value;
      this.store.address.address.postalArea = this.formStores.get("localeStore").value;
      this.store.address.address.postalCode = this.formStores.get("zipCodeStore").value;
      this.store.address.useMerchantAddress = false;
      console.log('Valor do replicateAddress ', this.formStores.get("replicateAddress").value);
    } else {
      this.store.address.address.address = this.submissionClient.headquartersAddress.address;
      this.store.address.address.country = this.submissionClient.headquartersAddress.country;
      this.store.address.address.postalArea = this.submissionClient.headquartersAddress.postalArea;
      this.store.address.address.postalCode = this.submissionClient.headquartersAddress.postalCode;
      this.store.address.useMerchantAddress = true;
      console.log('Valor do replicateAddress ', this.formStores.get("replicateAddress").value);
    }

    if (this.isComercialCentreStore) {
      this.store.address.shoppingCenter = this.formStores.get("subZoneStore").value;
      console.log('Valor do commercial ', this.formStores.get("commercialCenter").value);
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
    this.chooseAddressV = toChoose;
    if (toChoose) {
      this.formStores.get('localeStore').setValidators([Validators.required]);
      this.formStores.get('addressStore').setValidators([Validators.required]);
      this.formStores.get('countryStore').setValidators([Validators.required]);
      this.formStores.get('zipCodeStore').setValidators([Validators.required]);
    } else {
      this.formStores.get('localeStore').setValidators(null);
      this.formStores.get('addressStore').setValidators(null);
      this.formStores.get('countryStore').setValidators(null);
      this.formStores.get('zipCodeStore').setValidators(null);
    }
  }

  GetCountryByZipCodeTest() {
    var currentCountry = this.formStores.get('countryStore').value;
    this.logger.debug("Pais escolhido atual");

    if (currentCountry === 'PT') {
      var zipcode = this.formStores.value['zipCodeStore'];
      if (zipcode.length === 8) {
        var zipCode = zipcode.split('-');

        this.tableData.GetAddressByZipCodeTeste(Number(zipCode[0]), Number(zipCode[1])).then(success => {
          console.log(success);
          var address = success.result;
          var addressToShow = address[0];

          this.formStores.get('addressStore').setValue(addressToShow.address);
          this.formStores.get('countryStore').setValue(addressToShow.country);
          this.formStores.get('localeStore').setValue(addressToShow.postalArea);

          this.storeService.subzonesNearby(zipCode[0], zipCode[1]).subscribe(result => {
            this.subzones = result;
          })

          this.formStores.updateValueAndValidity();
        }, error => {
          console.log("error no codigo postal: ", error);
        });
      }
    }
  }

  GetCountryByZipCode() {
    var currentCountry = this.formStores.get('countryStore').value;
    this.logger.debug("Pais escolhido atual");

    if (currentCountry === 'PT') {
      var zipcode = this.formStores.value['zipCodeStore'];
      if (zipcode.length === 8) {
        var zipCode = zipcode.split('-');

        this.tableData.GetAddressByZipCode(Number(zipCode[0]), Number(zipCode[1])).subscribe(address => {

          var addressToShow = address[0];

          this.formStores.get('addressStore').setValue(addressToShow.address);
          this.formStores.get('countryStore').setValue(addressToShow.country);
          this.formStores.get('localeStore').setValue(addressToShow.postalArea);

          this.storeService.subzonesNearby(zipCode[0], zipCode[1]).subscribe(result => {
            this.subzones = result;
          })

          this.formStores.updateValueAndValidity();
        });
      }
    }
  }

  initializeForm() {
    this.formStores = new FormGroup({
      storeName: new FormControl('', Validators.required),
      activityStores: new FormControl((this.returned !== null) ? this.store.activity : '', [Validators.required]),
      countryStore: new FormControl(''),
      zipCodeStore: new FormControl(''),
      subZoneStore: new FormControl(''),
      contactPoint: new FormControl(''),
      subactivityStore: new FormControl((this.returned !== null) ? this.store.subActivity : '', [Validators.required]),
      localeStore: new FormControl(''),
      addressStore: new FormControl(''),
      replicateAddress: new FormControl(this.chooseAddressV, Validators.required),
      commercialCenter: new FormControl(this.isComercialCentreStore, Validators.required)
    })
    this.formStores.get("activityStores").valueChanges.subscribe(v => {
      this.onActivitiesSelected();
      console.log("Já saiu do activities selected")
      console.log("Subactivities length: " + this.subActivities.length);
      if (this.subActivities.length > 0)
        this.formStores.controls["subactivityStore"].setValidators([Validators.required]);
      else
        this.formStores.controls["subactivityStore"].clearValidators();
      this.formStores.controls["subactivityStore"].updateValueAndValidity();
    });

    /*this.formStores.get("productStores").valueChanges.subscribe(v => {
      this.onProductsSelected();
      console.log("Já saiu do products selected")
      console.log("SubProducst length: " + this.subProducts.length);
      if (this.subProducts.length > 0)
        this.formStores.controls["subProductsStore"].setValidators([Validators.required]);
      else
        this.formStores.controls["subProductsStore"].clearValidators();
      this.formStores.controls["subProductsStore"].updateValueAndValidity();
    });*/
  }

  comercialCentre(isCentre: boolean) {
    this.isComercialCentreStore = isCentre;
    if (isCentre)
      this.formStores.get('subZoneStore').setValidators([Validators.required]);
      if (this.chooseAddressV){
        //chamar a API que vai buscar o centro comercial por codigo postal caso seja replicada a morada do cliente empresa
        this.subs.push(this.tableInfo.GetShoppingByZipCode(this.formStores.value['zipCodeStore'].split("-", 1)).subscribe(result => {
          this.logger.debug(result);
          this.subzonesShopping = result;
        }, error => {
          this.logger.debug("Deu erro");
        }));
      }

    else
      this.formStores.get('subZoneStore').setValidators(null);
  }

  onActivitiesSelected() {
    var exists = false;

    console.log("entrei no activies selected")

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
  }

  onProductsSelected() {
    var exists = false;

    console.log("product selected")

    this.products.forEach(prod => {
      var prodToSearch = this.formStores.get('activityStores').value;
      if (prodToSearch == prod.productCode) {
        exists = true;
        // this.subProducts = prod.code;
      }
    })
    if (!exists) {
      this.subProducts = [];
    }
  }



}
