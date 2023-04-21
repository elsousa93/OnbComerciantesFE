import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ShopActivities, ShopSubActivities } from '../IStore.interface';
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

  //Submissao
  submissionId: string;
  submission: SubmissionGetTemplate;
  @Input() submissionClient: Client;
  @Input() parentFormGroup: FormGroup;

  subActivities: ShopSubActivities[] = [];

  //Informação de campos/tabelas
  Countries: CountryInformation[] = [];
  public map: Map<number, boolean>;
  public currentPage: number;
  public subscription: Subscription;
  public isComercialCentreStore: boolean = false;
  private baseUrl;
  public replicateAddress: boolean = true;
  formStores!: FormGroup;
  edit: boolean = false;

  /*Variable declaration*/
  public stroreId: number = 0;

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
  foundComercialCentre: boolean;
  noAddress: boolean = false;
  showError: boolean = false;

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
        this.logger.info("Filter store by CAE result: " + JSON.stringify(result));
        this.activity = result;
        this.activity = this.activity.sort((a, b) => a.activityDescription > b.activityDescription ? 1 : -1); //ordenar resposta

      }, error => {
        this.logger.error(error, "", "Error fetching CAE by store");
      }));
    } else {
      this.clientHasCAE = false;
      this.subs.push(this.tableInfo.GetAllShopActivities().subscribe(result => {
        this.logger.info("Get all shop activities result: " + JSON.stringify(result));
        this.activities = result;
        this.activities = this.activities.sort((a, b) => a.activityDescription > b.activityDescription ? 1 : -1); //ordenar resposta
      }, error => {
        this.logger.error(error, "", "Error fecthing all shop activities");
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
    this.resetIsInsideCommercialCenter();
  }

  resetIsInsideCommercialCenter() {
    this.isComercialCentreStore = false;
    this.foundComercialCentre = false;
    this.showError = false;
    this.noAddress = false;
    this.formStores.get("subZoneStore").setValue("");
    this.formStores.get("zipCodeStore").setValue("");
    this.formStores.get("commercialCenter").setValue(this.isComercialCentreStore);
  }

  numericOnly(event): boolean {
    var ASCIICode = (event.which) ? event.which : event.keyCode;

    if (ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57) && ASCIICode != 45)
      return false;
    return true;
  }

  GetComercialCenterByZipCode() {
    this.foundComercialCentre = false;
    this.showError = false;
    this.subzonesShopping = [];
    this.formStores.get("subZoneStore").setValue('');
    var zipCode = this.formStores.value['zipCodeStore'];
    if (zipCode.length === 8) { 
      this.subs.push(this.tableInfo.GetShoppingByZipCode(zipCode.split("-", 1)).subscribe(result => {
        this.logger.info("Get shopping center by zip code result: " + JSON.stringify(result));
        if (result.length > 0) {
          this.foundComercialCentre = true;
          this.subzonesShopping = result;
          this.subzonesShopping = this.subzonesShopping.sort((a, b) => a.description > b.description ? 1 : -1); //ordenar resposta
        } else {
          this.foundComercialCentre = false;
          this.showError = true;
        }
      }, error => {
        this.foundComercialCentre = false;
        this.showError = true;
        this.logger.error(error, "", "Error getting shopping center by zip code");
      }));
    }

  }

  GetCountryByZipCode() {
    this.subzonesShopping = null;
    var currentCountry = this.formStores.get('countryStore').value;
    this.formStores.get('addressStore').setValue('');
    this.formStores.get('localeStore').setValue('');
    this.isComercialCentreStore = false;
    this.foundComercialCentre = false;
    this.showError = false;
    this.noAddress = false;
    this.formStores.get("subZoneStore").setValue("");
    this.formStores.get("commercialCenter").setValue(this.isComercialCentreStore);

    if (currentCountry === 'PT') {
      this.lockLocality = true;
      var zipcode = this.formStores.value['zipCodeStore'];
      if (zipcode.length === 8) {
        var zipCode = zipcode.split('-');

        this.tableInfo.GetAddressByZipCodeShops(zipCode[0], zipCode[1]).then(success => {
          this.logger.info("Get address by zip code result: " + JSON.stringify(success));
          var address = success.result;
          var addressToShow = address[0];

          this.formStores.get('addressStore').setValue(addressToShow.address);
          this.formStores.get('countryStore').setValue(addressToShow.country);
          this.formStores.get('localeStore').setValue(addressToShow.postalArea);

        }, error => {
          this.logger.error(error, "", "Error getting address by zip code");
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
      activityStores: new FormControl('', [Validators.required]),
      countryStore: new FormControl('PT'),
      zipCodeStore: new FormControl(''),
      subZoneStore: new FormControl(''),
      contactPoint: new FormControl('', Validators.required),
      subactivityStore: new FormControl('', [Validators.required]),
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
          this.logger.info("Get shopping center by zip code result: " + JSON.stringify(result));
          this.foundComercialCentre = true;
          this.subzonesShopping = result;
          this.subzonesShopping = this.subzonesShopping.sort((a, b) => a.description > b.description ? 1 : -1); //ordenar resposta
        }, error => {
          this.logger.error(error, "", "Error getting shopping center by zip code");
        }));
      } else {
        this.formStores.get('replicate').setValue(true);
        if (this.submissionClient?.headquartersAddress?.postalCode != '' && this.submissionClient?.headquartersAddress?.postalCode != null) {
          var postalCode = this.submissionClient?.headquartersAddress?.postalCode.split("-", 1)[0];
          this.subs.push(this.tableInfo.GetShoppingByZipCode(Number(postalCode)).subscribe(res => {
            this.logger.info("Get shopping center by zip code result: " + JSON.stringify(res));
            this.foundComercialCentre = true;
            this.subzonesShopping = res;
            this.subzonesShopping = this.subzonesShopping.sort((a, b) => a.description > b.description ? 1 : -1); //ordenar resposta
          }, error => {
            this.logger.error(error, "", "Error getting shopping center by zip code");
          }));
        } else if (this.formStores.get("subZoneStore").value == '' || this.formStores.get("subZoneStore").value == null) {
          this.noAddress = true;
          this.foundComercialCentre = false;
        }
      }
    } else {
      this.formStores.get('subZoneStore').setValidators(null);
    }
    this.formStores.get('subZoneStore').updateValueAndValidity();
  }

  onActivitiesSelected() {
    this.formStores.get("subactivityStore").setValue('');
    this.subActivities = [];
    this.subActivity = [];
    if (!this.clientHasCAE) {
      var exists = false;
      this.activities.forEach(act => {
        var actToSearch = this.formStores.get('activityStores').value;
        if (actToSearch == act.activityCode) {
          exists = true;
          this.subActivities = act.subActivities.sort((a, b) => a.subActivityDescription > b.subActivityDescription ? 1 : -1);
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
          this.subActivity = act.subActivities.sort((a, b) => a.subActivityDescription > b.subActivityDescription ? 1 : -1);
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
