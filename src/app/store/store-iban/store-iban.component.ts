import { HttpClient } from '@angular/common/http';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/nav-menu-interna/data.service';
import { Bank, Istore, ShopDetailsAcquiring } from '../IStore.interface';
import { Configuration, configurationToken } from 'src/app/configuration';
import { FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { StoreService } from '../store.service';
import { AuthService } from '../../services/auth.service';
import { UserPermissions } from '../../userPermissions/user-permissions';
import { LoggerService } from 'src/app/logger.service';
import { EquipmentOwnershipTypeEnum, CommunicationOwnershipTypeEnum, ProductPackKindEnum } from '../../commercial-offer/ICommercialOffer.interface';
import { BankInformation } from 'src/app/client/Client.interface';
import { TableInfoService } from 'src/app/table-info/table-info.service';


@Component({
  selector: 'app-store-iban',
  templateUrl: './store-iban.component.html',
  styleUrls: ['./store-iban.component.css']
})

//This component allows to edit the iban field from the store. THere are two options
//1. Use the iban from the cient.
//2. Insert a new iban for the store
export class StoreIbanComponent implements OnInit {
  @Input() parentFormGroup : FormGroup;

  public EquipmentOwnershipTypeEnum = EquipmentOwnershipTypeEnum;
  public CommunicationOwnershipTypeEnum = CommunicationOwnershipTypeEnum;
  public ProductPackKindEnum = ProductPackKindEnum;


  private baseUrl;

  /*variable declarations*/
  public stroreId: number = 0;
  //store: Istore = { id: -1 } as Istore
  public clientID: number = 12345678;

  public isIBANConsidered: boolean = null;
  public IBANToShow: { tipo: string, dataDocumento: string };
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
  public bank: string;

  /*Is it supposed to relicate the Commercial offert from another store?*/
  selectionsReplicate = ['Não', 'Sim'];
  /*Default case*/
  selectedOption = 'Não';
  public idisabled: boolean = false;

  files?: File[] = [];
  supportBank?: string = "";

  banks: Bank[];

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

  formStores!: FormGroup;
  returned: string
  edit: boolean = false;

  constructor(private logger: LoggerService, private router: ActivatedRoute, private tableInfo: TableInfoService, private http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private route: Router, private data: DataService, private storeService: StoreService, private rootFormGroup: FormGroupDirective, private authService: AuthService) {
    setTimeout(() => this.data.updateData(true, 3, 3), 0);

    this.initializeForm();

    this.authService.currentUser.subscribe(result => {

        if (result.permissions === UserPermissions.BANCA) {
          this.bank = this.authService.GetBankLocation();

          this.updateForm();
        }
      });

    this.tableInfo.GetBanks().subscribe(result => {
      this.banks = result;
      this.banks = this.banks.sort((a, b) => a.description > b.description? 1 : -1); //ordenar resposta
    });

  }

  ngOnInit(): void {
    this.returned = localStorage.getItem("returned");
    //this.initializeForm();


    if (this.rootFormGroup.form != null) {
      this.rootFormGroup.form.setControl('bankStores', this.formStores);
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
    this.store.bank.useMerchantBank = this.formStores.get("bankInformation").value;
    this.store.bank.bank.bank = this.formStores.get("supportBank").value;

    var navigationExtras: NavigationExtras = {
      state: {
        store: this.store
      }
    }

    this.route.navigate(['add-store-product'], navigationExtras);
  }

  selectFile(event: any) {
    this.files = [];
    this.IBANToShow = { tipo: "Comprovativo de IBAN", dataDocumento: "01-08-2022" }
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
      supportBank: new FormControl((this.bank !== null) ? this.bank : '', Validators.required),
      bankInformation: new FormControl((this.store.bank.useMerchantBank !== null) ? this.store.bank.useMerchantBank : '', Validators.required),
    });
  }

  updateForm() {
    this.formStores.get('supportBank').setValue(this.bank);
  }

  openFile(/*url: any, imgName: any*/ file: File) {
    let blob = new Blob([file], { type: file.type });
    let url = window.URL.createObjectURL(blob);

    window.open(url, '_blank',
      `margin: auto;
      width: 50%;
      padding: 10px;
      text-align: center;
      border: 3px solid green;
      `);

  }

}
