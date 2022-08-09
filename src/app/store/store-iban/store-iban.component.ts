import { HttpClient } from '@angular/common/http';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/nav-menu-interna/data.service';
import { Istore, ShopDetailsAcquiring } from '../IStore.interface';
import { Configuration, configurationToken } from 'src/app/configuration';
import { FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { StoreService } from '../store.service';

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

  @Input() edit: string; 

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
    productCode: "cardNotPresent",
    subActivity: "99",
    subproductCode: "easy",
    website: "google.com"
  } as ShopDetailsAcquiring;

  formStores!: FormGroup;
  returned: string

  constructor(private router: ActivatedRoute, private http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private route: Router, private data: DataService, private storeService: StoreService, private rootFormGroup: FormGroupDirective) {
    this.ngOnInit();

    //if (this.route.getCurrentNavigation().extras.state) {
    //  //this.store = this.route.getCurrentNavigation().extras.state["store"];
    //}

    //if (this.returned !== null) {
    //  if (this.store.productCode == '') { 
    //    this.chooseSolution(true, false, false);
    //  }

    //  if (this.store.productCode == '') { 
    //    this.chooseSolution(false, true, false);
    //  }

    //  if (this.store.productCode == '') { 
    //    this.chooseSolution(false, false, true);
    //  }

    //}
    this.initializeForm();

    this.data.updateData(false, 3, 3);
  }

  ngOnInit(): void {
    //Get Id from the store
    this.stroreId = Number(this.router.snapshot.params['stroreid']);
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    this.returned = localStorage.getItem("returned");

    if (this.rootFormGroup.form != null) {
      console.log('O root form é diferente de null');
    } else {
      console.log('O root form não tem valor');
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
    //CAMPOS QUE FALTAM
    //banco de apoio
    //informação bancária
    this.store.bank.bank.bank = this.formStores.get("supportBank").value;
    this.store.productCode = this.formStores.get("solutionType").value;
    this.store.subproductCode = this.formStores.get("subProduct").value;
    this.store.website = this.formStores.get("url").value;

    this.storeService.addShopToSubmission(localStorage.getItem("submissionId"), this.store).subscribe(result => {
      console.log("Uma nova loja foi adicionada à submissão", result);
    });

    this.route.navigate(['store-comp']);
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
    console.log(this.files);
  }

  isIBAN(isIBANConsidered: boolean) {
    this.isIBANConsidered = isIBANConsidered;
  }

  chooseSolution(cardPresent: boolean, cardNotPresent: boolean, combinedOffer: boolean){
    console.log("cardPresent: " + cardPresent);
    console.log("cardNotPresent: " + cardNotPresent);
    console.log("combinedOffer: " + combinedOffer);
    if (cardPresent){
      this.isCardPresent = cardPresent;
      this.isCardNotPresent = false;
      this.isCombinedOffer = false;
    } else if (cardNotPresent){
      this.isCardPresent = false;
      this.isCardNotPresent = cardNotPresent;
      this.isCombinedOffer = false;
    } else if (combinedOffer) {
      this.isCardPresent = false;
      this.isCardNotPresent = false;
      this.isCombinedOffer = combinedOffer;
    }
  }

  URLFilled(filled: boolean){
    this.isURLFilled = filled;
  }

  initializeForm() {
    this.formStores = new FormGroup({
      supportBank: new FormControl((this.store.bank !== null && this.store.bank.bank) ? this.store.bank.bank.bank : '', Validators.required),
      bankInformation: new FormControl((this.store.bank.userMerchantBank !== null) ? this.store.bank.userMerchantBank : '', Validators.required),
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
}
