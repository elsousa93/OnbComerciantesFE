import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Configuration, configurationToken } from 'src/app/configuration';
import { DataService } from 'src/app/nav-menu-interna/data.service';
import { Istore, ShopDetailsAcquiring } from '../../../store/IStore.interface';
import { StoreService } from '../../../store/store.service';
import { CountryInformation } from '../../../table-info/ITable-info.interface';
import { TableInfoService } from '../../../table-info/table-info.service';
import { infoDeclarativaForm, validPhoneNumber } from '../info-declarativa.model';

const testValues: ShopDetailsAcquiring[] = [
  {
    activity: "Activity1",
    address:
    {
      isInsideShoppingCenter: true, sameAsMerchantAddress: true, shoppingCenter: "Colombo",
      address:
      {
        address: "A",
        country: "B",
        postalArea: "C",
        postalCode: "123"
      }
    },
    bank: {
      bank:
      {
        bank: "Banco",
        iban: "893018920"
      },
      userMerchantBank: true
    },
    documents:
    {
      href: "",
      type: "",
      id: ""
    },
    id: "1",
    manager: "Manager1",
    name: "ShopName",
    productCode: "432",
    subActivity: "99",
    subproductCode: "0",
    website: "google.com"
  },
  {
    activity: "Activity2",
    address:
    {
      isInsideShoppingCenter: true,
      sameAsMerchantAddress: true,
      shoppingCenter: "Colombo2",
      address:
      {
        address: "A2",
        country: "B2",
        postalArea: "C2",
        postalCode: "1232"
      }
    },
    bank: {
      bank:
      {
        bank: "Banco2",
        iban: "893018920"
      },
      userMerchantBank: true
    },
    documents:
    {
      href: "",
      type: "",
      id: ""
    },
    id: "2",
    manager: "Manager2",
    name: "ShopName2",
    productCode: "432",
    subActivity: "99",
    subproductCode: "01",
    website: "google.com"
  },
]

@Component({
  selector: 'app-info-declarativa-lojas',
  templateUrl: './info-declarativa-lojas.component.html',
  styleUrls: ['./info-declarativa-lojas.component.css']
})

export class InfoDeclarativaLojasComponent implements OnInit, AfterViewInit {

  private baseUrl: string;

  public stores: ShopDetailsAcquiring[] = [];
  public clientID: number = 12345678;

  public selectedStore = {
    activityEstab: "",
    address: "",
    cellphoneIndic: "",
    cellphoneNumber: "",
    country: "",
    emailContact: "",
    fixedIP: "",
    iban: "",
    id: 0,
    nameEstab: "",
    postalCode: "",
    postalLocality: "",
    subActivityEstab: "",
    subZoneEstab: "",
    turisticZone: false,
    zoneEstab: ""
  } as Istore;

  //listValue!: FormGroup;

  displayedColumns: string[] = ['nameEstab', 'activityEstab', 'subActivityEstab', 'zoneEstab'];
  dataSource : MatTableDataSource<ShopDetailsAcquiring>;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  //Informação de campos/tabelas
  internationalCallingCodes: CountryInformation[];

  listValue!: FormGroup;
  currentIdx: number = 0;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  constructor(private formBuilder: FormBuilder, http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private route: Router, private data: DataService, private tableInfo: TableInfoService, private storeService: StoreService) {
    this.baseUrl = configuration.baseUrl;
    this.ngOnInit();
    

    this.tableInfo.GetAllCountries().subscribe(result => {
      this.internationalCallingCodes = result;
    }, error => console.log(error));

    this.storeService.getSubmissionShopsList(localStorage.getItem("submissionId")).subscribe(result => {
      result.forEach(value => {
        this.storeService.getSubmissionShopDetails(localStorage.getItem("submissionId"), value.id).subscribe(res => {
          this.stores.push(res);
        });
      });
      this.loadStores(this.stores);
    });

    //this.internationalCallingCodes = tableInfo.GetAllCountries();

 /*    //se o telemovel estiver vazio, o numero de telefone é obrigatorio
    this.listValue.controls["cellphoneNumber"].valueChanges.subscribe(data => {
      if (data === '') {
        this.listValue.controls["telephoneNumber"].setValidators([Validators.required]);
      } else {
        this.listValue.controls["telephoneNumber"].clearValidators();
      }
      this.listValue.controls["telephoneNumber"].updateValueAndValidity();
    });

    //se o telefone esta vazio, o numero de telemovel é obrigatorio
    this.listValue.controls["telephoneNumber"].valueChanges.subscribe(data => {
      if (data !== '') {
        this.listValue.controls["cellphoneNumber"].setValidators([Validators.required]);
      } else {
        this.listValue.controls["cellphoneNumber"].clearValidators();
      }
      this.listValue.controls["cellphoneNumber"].updateValueAndValidity();
    });*/
  } 

  ngOnInit(): void {
    this.data.updateData(false, 6, 3);
    this.selectedStore = JSON.parse(localStorage.getItem("info-declarativa"))?.store ?? this.selectedStore;

    this.listValue = this.formBuilder.group({
      cellphone : this.formBuilder.group({
        countryCode: new FormControl(this.selectedStore.cellphoneIndic), //telemovel
        phoneNumber: new FormControl(this.selectedStore.cellphoneNumber)
      }, {validators : validPhoneNumber}),
      telephone : this.formBuilder.group({
        countryCode: new FormControl(''), //telefone
        phoneNumber: new FormControl('')
      }, {validators : validPhoneNumber}),
      email: new FormControl(this.selectedStore.emailContact, Validators.required),
    });
    this.loadStores();
  }

  

  changeListElement(variavel: string, e: any) {
  //  if (e.target.id == '') {
  //    this. = e.target.value;
  //  }
  //  if (e.target.id == '') {
  //    this. = e.target.value;
  //  }
  //  if (e.target.id == '') {
  //    this. = e.target.value;
  //  }
  //  console.log(e.target.id);
  }

  selectRow(store: any, idx: number) {
    this.selectedStore = store;
    this.currentIdx = idx;
    console.log("Store selected ", this.selectedStore);
    console.log("Current index ", this.currentIdx);
    console.log(this.selectedStore === store);
  }

  submit() {

    this.selectedStore.cellphoneIndic = this.listValue.value.cellphoneCountryCode;
    this.selectedStore.cellphoneNumber = this.listValue.value.cellphoneNumber;
    this.selectedStore.emailContact = this.listValue.value.email;
    let storedForm: infoDeclarativaForm = JSON.parse(localStorage.getItem("info-declarativa")) ?? new infoDeclarativaForm();
    storedForm.store = this.selectedStore
    localStorage.setItem("info-declarativa", JSON.stringify(storedForm));
    this.route.navigate(['/info-declarativa-assinatura']);
  }


  loadStores(storesValues: ShopDetailsAcquiring[] = testValues) {
    this.dataSource = new MatTableDataSource(storesValues);
    this.dataSource.paginator = this.paginator;
  }
}
