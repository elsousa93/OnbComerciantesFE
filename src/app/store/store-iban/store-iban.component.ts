import { HttpClient } from '@angular/common/http';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/nav-menu-interna/data.service';
import { Istore, ShopDetailsAcquiring } from '../IStore.interface';
import { Configuration, configurationToken } from 'src/app/configuration';
import { FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { StoreService } from '../store.service';
import { AuthService } from '../../services/auth.service';
import { UserPermissions } from '../../userPermissions/user-permissions';
import { LoggerService } from 'src/app/logger.service';

@Component({
  selector: 'app-store-iban',
  templateUrl: './store-iban.component.html',
  styleUrls: ['./store-iban.component.css']
})

  //This component allows to edit the iban field from the store. THere are two options
  //1. Use the iban from the cient.
  //2. Insert a new iban for the store
export class StoreIbanComponent implements OnInit {

  private baseUrl;

  /*variable declarations*/
  public stroreId: number = 0;
  //store: Istore = { id: -1 } as Istore
  public clientID: number = 12345678;

  public isIBANConsidered: boolean = null;
  public IBANToShow: {tipo:string, dataDocumento: string};
  public result: any;
  localUrl: any;

  public isCardPresent: boolean = false;
  public isCardNotPresent: boolean = false;
  public isCombinedOffer: boolean = false;

  public isURLFilled: boolean = false;

  public newStore: Istore = {
    "id": 1,
    "nameEstab": "",
    "country": "",
    "postalCode": "",
    "address": "",
    "fixedIP": "",
    "postalLocality": "",
    "emailContact": "",
    "cellphoneIndic": "",
    "cellphoneNumber": "",
    "activityEstab": "",
    "subActivityEstab": "",
    "zoneEstab": "",
    "subZoneEstab": "",
    "iban": ""
  };


  public map: Map<number, boolean>;
  public currentPage: number;
  public subscription: Subscription;

  /*CHANGE - Get via service from the clients */
  public commIban: string = "232323232";
  public auxIban: string = "";

  /*Is it supposed to relicate the Commercial offert from another store?*/
  selectionsReplicate = ['Não', 'Sim'];
  /*Default case*/
  selectedOption = 'Não';
  public idisabled: boolean = false;

  files?: File[] = [];

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

  formStores!: FormGroup;
  returned: string
  edit: boolean = false;

  constructor(private logger: LoggerService, private router: ActivatedRoute, private http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private route: Router, private data: DataService, private storeService: StoreService, private rootFormGroup: FormGroupDirective, private authService: AuthService) {
    setTimeout(() => this.data.updateData(false, 3, 3), 0);

    if (this.route.getCurrentNavigation()?.extras?.state) {
      this.store = this.route.getCurrentNavigation().extras.state["store"];

      this.authService.currentUser.subscribe(result => {

        if (result.permissions === UserPermissions.BANCA) {
          var bank = this.store.bank;

          if (bank !== undefined)
            bank.bank.bank = result.bankName;

          this.updateForm();
        }
      });
      console.log('Store recebddnjkn ', this.store);
    }
  }

  ngOnInit(): void {
    console.log('INIT');
    this.returned = localStorage.getItem("returned");
    this.initializeForm();


    if (this.rootFormGroup.form != null) {
      this.rootFormGroup.form.addControl('bankStores', this.formStores);
      this.edit = true;
      if (this.returned == 'consult') {
        this.formStores.disable();
      }
    } else {
      this.stroreId = Number(this.router.snapshot.params['stroreid']);
      this.subscription = this.data.currentData.subscribe(map => this.map = map);
      this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    }
  }

  /*Controles the radio button changes*/
  radoChangehandler(event: any) {
    this.selectedOption = event.target.value;
    if (this.selectedOption == "Sim") {
      this.auxIban = this.store.bank.bank.iban;
      this.store.bank.bank.iban = this.commIban;
      this.idisabled = true;
    } else {
      this.store.bank.bank.iban = this.auxIban;
      this.idisabled = false;
    }
    
  }

  submit() {
    this.store.bank.userMerchantBank = this.formStores.get("bankInformation").value;
    this.store.bank.bank.bank = this.formStores.get("supportBank").value;

    var navigationExtras: NavigationExtras = {
      state: {
        store: this.store
      }
    }

    this.route.navigate(['add-store-product'], navigationExtras);
  }

  selectFile(event: any) {
    this.IBANToShow = { tipo: "Comprovativo de IBAN", dataDocumento:"01-08-2022" }
    this.newStore.id = 1;
    this.newStore.iban = "teste";
    const files = <File[]>event.target.files;
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      const sizeFile = file.size / (1024 * 1024);
      var extensoesPermitidas = /(.pdf)$/i;
      const limSize = 10;
      this.result = this.http.put(this.baseUrl + 'ServicesComprovativos/', this.newStore.id);
      if (this.result != null) {
        if ((sizeFile <= limSize) && (extensoesPermitidas.exec(file.name))) {
          if (event.target.files && files[i]) {
            var reader = new FileReader();
            reader.onload = (event: any) => {
              this.localUrl = event.target.result;
            }
            reader.readAsDataURL(files[i]);
            this.files.push(file);
          } else {
            alert("Verifique o tipo / tamanho do ficheiro");
          }
        }
      }
    }
    this.logger.debug(this.files);
  }

  isIBAN(isIBANConsidered: boolean) {
    this.isIBANConsidered = isIBANConsidered;
  }

  initializeForm() {
    this.formStores = new FormGroup({
      supportBank: new FormControl((this.store.bank !== null && this.store.bank.bank) ? this.store.bank.bank.bank : '', Validators.required),
      bankInformation: new FormControl((this.store.bank.userMerchantBank !== null) ? this.store.bank.userMerchantBank : '', Validators.required),
    });
  }

  updateForm() {
    this.formStores.get('supportBank').setValue(this.store.bank.bank.bank);
  }

}
