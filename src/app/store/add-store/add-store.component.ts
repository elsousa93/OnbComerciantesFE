import { HttpClient } from '@angular/common/http';
import { Component, Host, Inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Istore, ShopDetailsAcquiring } from '../IStore.interface';
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

@Component({
  selector: 'app-add-store',
  templateUrl: './add-store.component.html',
  styleUrls: ['./add-store.component.css']
})

  //This component allows to add a new store or edit the main configutarion of a store
  //If the storeId value is -1 it means that it is a new store to be added - otherwise the storeId corresponds to the id of the store to edit

export class AddStoreComponent implements OnInit {

  @Input() edit: string;

  //Submissao
  submissionId: string;
  submission: SubmissionGetTemplate;
  submissionClient: Client;

  //Informação de campos/tabelas
  Countries: CountryInformation[] = [];
  public map: Map<number, boolean>;
  public currentPage: number;
  public subscription: Subscription;

  public isComercialCentreStore: boolean = null;

  private baseUrl;

  public chooseAddressV: boolean = false;
  formStores!: FormGroup;
  editForm!: FormGroup;

  /*Variable declaration*/
  public stroreId: number = 0;
  store: ShopDetailsAcquiring = {
    address: {
      address: {
        address: "",
        country: "",
        postalArea: "",
        postalCode: ""
      }
    }
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


  loadTableInfo() {
    this.tableInfo.GetAllCountries().subscribe(res => {
      this.Countries = res;
    })
  }

  fetchStartingInfo() {
    //this.submissionService.GetSubmissionByID(this.submissionId).subscribe(result => {
    //  this.submission = result;

    //  this.clientService.GetClientById(this.submissionId).subscribe(client => {
    //    this.submissionClient = client;

    //    console.log("submissao correta? ", this.submission);
    //    console.log("cliente da submissao: ", this.submissionClient);
    //  });
    //});
    this.clientService.GetClientById(this.submissionId).subscribe(client => {
      this.submissionClient = client;
      //console.log("submissao correta? ", this.submission);
      console.log("cliente da submissao: ", this.submissionClient);
    });
  }

  constructor(private router: ActivatedRoute, private http: HttpClient, private tableData: TableInfoService, @Inject(configurationToken) private configuration: Configuration, private route: Router, public appComp: AppComponent, private tableInfo: TableInfoService, private data: DataService, private submissionService: SubmissionService, private clientService: ClientService, private rootFormGroup: FormGroupDirective) {
    this.submissionId = localStorage.getItem("submissionId");

    //this.fetchStartingInfo();

    //this.loadTableInfo();

    this.data.updateData(false, 3, 2);
    console.log("Valor do editar ", this.edit);
  }

  ngOnInit(): void {
    this.appComp.updateNavBar("Adicionar Loja")
    //Get Id from the store
    this.stroreId = Number(this.router.snapshot.params['stroreid']);
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);

    this.initializeForm();

    if (this.rootFormGroup.form != null) {
      console.log('Edit form ', this.rootFormGroup);
      this.rootFormGroup.form.addControl('formStores', this.formStores);
      console.log('ROOT ', this.rootFormGroup);
    } else {
      console.log('O Form é null, nesse caso continuamos com a lógica normal');
    }
    console.log('AAAAAAAAAAAAAAAAAA ', this.rootFormGroup);
  }

  //When canceling the create new store feature the user must navigate back to store list
  onCickCancel() {
    this.route.navigate(['store-comp']);
  }

  //Call instruction to delete from the back-end
  onCickDelete() {
    if (this.stroreId != -1) {
      this.http.delete<Istore>(this.baseUrl + 'bestores/DeleteStoreById/' + this.clientID + '/' + this.stroreId).subscribe(result => {
      }, error => console.error(error));
    }
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

      this.formStores.addControl('localeStore', new FormControl(this.store.address.address.postalArea, Validators.required));
      this.formStores.addControl('addressStore', new FormControl(this.store.address.address.address, Validators.required));
      this.formStores.addControl('countryStore', new FormControl(this.store.address.address.country, Validators.required));
      this.formStores.addControl('zipCodeStore', new FormControl(this.store.address.address.postalCode, Validators.required));
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

      //remover formControls
      this.formStores.removeControl('localeStore');
      this.formStores.removeControl('addressStore');
      this.formStores.removeControl('countryStore');
      this.formStores.removeControl('zipCodeStore');
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

  //Submit form to Back-end
  submit() {
    //if (this.stroreId == -1) {
    //  this.http.post<number>(this.baseUrl + 'bestores/PostStore/' + this.clientID, this.store).subscribe(result => {
    //    this.stroreId = result;
    //    this.route.navigate(['add-store-iban/' + this.stroreId]);
    //  }, error => console.error(error));
    //} else {
    //  this.http.put<Istore>(this.baseUrl + 'bestores/PutStoreById/' + this.clientID + '/' + this.stroreId, this.store).subscribe(result => {
    //    this.route.navigate(['add-store-iban/' + this.stroreId]);
    //  }, error => console.error(error));
    //}

    //this.store.name = this.formStores.get("storeName").value;
    //if (this.submissionClient.merchantType == 'Entrepreneur')
    //  this.store.manager = this.submissionClient.legalName; // caso o cliente seja ENI, o nome do ponto de contacto fica com o nome do comerciante
    //else
    //  this.store.manager = this.formStores.get("contactPoint").value;

    //this.store.activity = this.formStores.get("activityStores").value;
    //this.store.subActivity = this.formStores.get("subactivityStores").value;
    //if (this.selectedAddOption == "Sim") {
    //  this.store.address.address.address = this.formStores.get("addressStore").value;
    //  this.store.address.address.country = this.formStores.get("countryStore").value;
    //  this.store.address.address.postalArea = this.formStores.get("localeStore").value;
    //  this.store.address.address.postalCode = this.formStores.get("zipCodeStore").value;
    //} else {
    //  //this.store.address.address = this.submissionClient.address; replicar a morada do cliente para a loja
    //  this.store.address.sameAsMerchantAddress = true;
    //}

    //if (this.isComercialCentreStore){
    //  this.store.address.shoppingCenter = this.formStores.get("subZoneStore").value; // n sei qual é o valor que corresponde na Loja
    //  
    //}

    //this.store.address.isInsideShoppingCenter = this.isComercialCentreStore;

    //console.log(this.formStores);
    let navigationExtras: NavigationExtras = {
      state: {
        store: this.store
      }
    }

    this.route.navigate(['/add-store-iban'], navigationExtras);
  }

  chooseAddress(toChoose: boolean) {
    this.chooseAddressV = toChoose;
  }

  GetCountryByZipCode() {
    var currentCountry = this.formStores.get('Country').value;
    console.log("Pais escolhido atual");

    if (currentCountry === 'PT') {
      var zipcode = this.formStores.value['ZIPCode'];
      if (zipcode.length === 8) {
        var zipCode = zipcode.split('-');

        this.tableData.GetAddressByZipCode(Number(zipCode[0]), Number(zipCode[1])).subscribe(address => {

          var addressToShow = address[0];

          this.formStores.get('Address').setValue(addressToShow.address);
          this.formStores.get('Country').setValue(addressToShow.country);
          this.formStores.get('Locality').setValue(addressToShow.postalArea);

          this.formStores.updateValueAndValidity();
        });
      }
    }
  }

  initializeForm() {
    var storename = '';
    //if (this.submission.merchant)

    this.formStores = new FormGroup({
      storeName: new FormControl('', Validators.required),
      activityStores: new FormControl('', Validators.required),
      countryStore: new FormControl(''),
      zipCodeStore: new FormControl(''),
      subZoneStore: new FormControl(''),
      contactPoint: new FormControl(/*(this.submissionClient.merchantType == 'Entrepreneur') ? this.submissionClient.legalName : */'', Validators.required),
      subactivityStore: new FormControl('', Validators.required),
      localeStore: new FormControl(''),
      addressStore: new FormControl('')
    })
}

comercialCentre(isCentre: boolean) {
  this.isComercialCentreStore = isCentre;
  if (isCentre)
    this.formStores.addControl('subZoneStore', new FormControl('', Validators.required));
  else
    this.formStores.removeControl('subZoneStore');
}
}
