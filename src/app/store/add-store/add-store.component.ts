import { HttpClient } from '@angular/common/http';
import { Component, Host, Inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Istore, ShopActivities, ShopSubActivities, ShopDetailsAcquiring } from '../IStore.interface';
import { AppComponent } from '../../app.component';
import { CountryInformation } from '../../table-info/ITable-info.interface';
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

@Component({
  selector: 'app-add-store',
  templateUrl: './add-store.component.html',
  styleUrls: ['./add-store.component.css']
})

  //This component allows to add a new store or edit the main configutarion of a store
  //If the storeId value is -1 it means that it is a new store to be added - otherwise the storeId corresponds to the id of the store to edit

export class AddStoreComponent implements OnInit {

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
  store: ShopDetailsAcquiring = {
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
      userMerchantBank: false
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

  public clientID: number = 12345678;
  public totalUrl: string = "";

  public zonasTuristicas: string[] = ["Não", "Sim"];
  defaultZonaTuristica: number = 0;

  /*CHANGE - Get via service from the clients  - Address*/
  public commCountry: string = "England";
  public auxCountry: string = "";

  public commPostal: string = "1245-123";
  public auxPostal: string = "";

  public commAddress: string = "Rua da Cidade";
  public auxAddress: string = "";

  public commIP: string = "123498";
  public auxIP: string = "";

  public commLocal: string = "Brejos de Azeitão";
  public auxLocal: string = "";

  /*CHANGE - Get via service from the clients  - Contacts*/
  public commEmail: string = "asdfg@gmail.com";
  public auxEmail: string = "";

  public commInd: string = "+351";
  public auxInd: string = "";

  public commCellNumber: string = "914737727"
  public auxCellNumber: string = "";

  /*Is it supposed to relicate the Commercial offert from another store?*/
  selectionsAddReplicate = ['Não', 'Sim'];
  selectionsContactReplicate = ['Não', 'Sim'];

  selectedAddOption = 'Não';
  selectedContactOption = 'Não';
  
  public idisabledAdd: boolean = false;
  public idisabledContact: boolean = false;

  activities: ShopActivities[] = [];

  returned: string;

  countries: CountryInformation[] = [];

  subzones: {
    code: string,
    locality: string,
    name: string
  }[] = [];

  loadTableInfo() {
    this.tableInfo.GetAllCountries().subscribe(res => {
      this.Countries = res;
    })
  }

  updateForm() {
      this.formStores.get("contactPoint").setValue((this.submissionClient.merchantType === 'Entrepeneur') ? this.submissionClient.legalName : '', Validators.required);
  }

  fetchStartingInfo() {
    this.clientService.GetClientById(this.submissionId).subscribe(client => {

      this.submissionClient = client;

      this.logger.debug("cliente da submissao: " + this.submissionClient);
      this.updateForm();
    });

    this.storeService.GetAllShopActivities().subscribe(result => {
      this.logger.debug(result);
      console.log("resultado: ", result);

      this.activities = result;
    }, error => {
      this.logger.debug("Deu erro");
    });

    this.tableData.GetAllCountries().subscribe(result => {
      this.countries = result;
    })
  }

  constructor(private logger: LoggerService, private router: ActivatedRoute, private http: HttpClient, private tableData: TableInfoService, @Inject(configurationToken) private configuration: Configuration, private route: Router, public appComp: AppComponent, private tableInfo: TableInfoService, private data: DataService, private submissionService: SubmissionService, private clientService: ClientService, private rootFormGroup: FormGroupDirective, private storeService: StoreService) {
    this.submissionId = localStorage.getItem("submissionId");
    this.fetchStartingInfo();
    this.loadTableInfo();
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
      this.chooseAddressV=true;
      this.appComp.updateNavBar("Adicionar Loja")
      this.stroreId = Number(this.router.snapshot.params['stroreid']);
      this.subscription = this.data.currentData.subscribe(map => this.map = map);
      this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    }
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
    if (this.chooseAddressV) {
      this.store.address.address.address = this.formStores.get("addressStore").value;
      this.store.address.address.country = this.formStores.get("countryStore").value;
      this.store.address.address.postalArea = this.formStores.get("localeStore").value;
      this.store.address.address.postalCode = this.formStores.get("zipCodeStore").value;
      this.store.address.useMerchantAddress = false;
      console.log('Valor do replicateAddress ' , this.formStores.get("replicateAddress").value);
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
    var storename = '';
    this.formStores = new FormGroup({
      storeName: new FormControl('', Validators.required),
      activityStores: new FormControl('', Validators.required),
      countryStore: new FormControl(''),
      zipCodeStore: new FormControl(''),
      subZoneStore: new FormControl(''),
      contactPoint: new FormControl(''),
      subactivityStore: new FormControl('', Validators.required),
      localeStore: new FormControl(''),
      addressStore: new FormControl(''),
      replicateAddress: new FormControl(this.chooseAddressV, Validators.required),
      commercialCenter: new FormControl(this.isComercialCentreStore, Validators.required)
    })
      this.formStores.get("activityStores").valueChanges.subscribe(v => {
        this.logger.debug("alterou");
        var subactivities = this.activities.find(element => element.activityCode === v)["subactivities"];

        this.subActivities = subactivities;
        //console.log(this.subActivities);
      });

    //this.storeService.activitiesbycode(this.cae).subscribe(result => {
    //  this.formStores.get()
    //});
}

comercialCentre(isCentre: boolean) {
  this.isComercialCentreStore = isCentre;
  if (isCentre)
    this.formStores.get('subZoneStore').setValidators([Validators.required]);
  else
    this.formStores.get('subZoneStore').setValidators(null);
}
}
