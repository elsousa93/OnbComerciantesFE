import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Istore } from '../IStore.interface';
import { AppComponent } from '../../app.component';
import { CountryInformation } from '../../table-info/ITable-info.interface';
import { TableInfoService } from '../../table-info/table-info.service';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/nav-menu-interna/data.service';

@Component({
  selector: 'app-add-store',
  templateUrl: './add-store.component.html',
  styleUrls: ['./add-store.component.css']
})

  //This component allows to add a new store or edit the main configutarion of a store
  //If the storeId value is -1 it means that it is a new store to be added - otherwise the storeId corresponds to the id of the store to edit

export class AddStoreComponent implements OnInit {

  //Informação de campos/tabelas
  Countries: CountryInformation[] = [];
  public map: Map<number, boolean>;
  public currentPage: number;
  public subscription: Subscription;

  private baseUrl;


  /*Variable declaration*/
  public stroreId: number = 0;
  store: Istore = {
    id: -1, nameEstab: "", country: "", postalCode: "", address: "", fixedIP: "", postalLocality: "", emailContact: "", cellphoneIndic: "", cellphoneNumber: "", turisticZone: false, activityEstab: "", subActivityEstab: "", zoneEstab: "", subZoneEstab: "", iban: ""} as Istore
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

  constructor(private router: ActivatedRoute, private http: HttpClient, @Inject('BASE_URL') private baseURL: string, private route: Router, public appComp: AppComponent, private tableInfo: TableInfoService, private data: DataService) {
    this.ngOnInit();

    this.loadTableInfo();

    //WS call - Get the fields for the specific store if we are not creatig a new store
    if (this.stroreId != -1) {
      http.get<Istore>(this.baseUrl + 'bestores/GetStoreById/' + this.clientID + '/' + this.stroreId).subscribe(result => {
        this.store = result;
        //Controles the default value of the turistic zone radio button
        if (this.store.turisticZone == true) {
          this.defaultZonaTuristica = 1;
          this.store.turisticZone = true;
        } else {
          this.defaultZonaTuristica = 0;
          this.store.turisticZone = false;
        }
        
      }, error => console.error(error));
    }
    this.data.updateData(false, 3, 2);
  }

  ngOnInit(): void {
    this.appComp.updateNavBar("Adicionar Loja")
    //Get Id from the store
    this.stroreId = Number(this.router.snapshot.params['stroreid']);
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
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

  //Controles the result of the turistic zone radio button
  radoChangehandler($event: any) {
    console.log($event.target.value);
    if ($event.target.value == "Sim") {
      this.store.turisticZone = true;
      console.log("Sim");
    } else {
      this.store.turisticZone = false;
      console.log("Não");
    }
  }

  /*Controles the radio button changes*/
  radioAddChangehandler(event: any) {
    this.selectedAddOption = event.target.value;
    if (this.selectedAddOption == "Sim") {
      /*Update Country according to the default from Client*/
      this.auxCountry = this.store.country;
      this.store.country = this.commCountry;
      /*Update Postal Code according to the default from Client*/
      this.auxPostal = this.store.postalCode;
      this.store.postalCode = this.commPostal;
      /*Update Address according to the default from Client*/
      this.auxAddress = this.store.address;
      this.store.address = this.commAddress;
      /*Update IP according to the default from Client*/
      this.auxIP = this.store.fixedIP;
      this.store.fixedIP = this.commIP;
      /*Update Locale according to the default from Client*/
      this.auxLocal = this.store.postalLocality;
      this.store.postalLocality = this.commLocal;

      /*Disable the fields from the address*/
      this.idisabledAdd = true;
    } else {
      /*Update Country according to the previous value selected*/
      this.store.country = this.auxCountry;
      /*Update Postal Code according to the previous value selected*/
      this.store.postalCode = this.auxPostal;
      /*Update Addresss according to the previous value selected*/
      this.store.address = this.auxAddress;
      /*Update IP according to the previous value selected*/
      this.store.fixedIP = this.auxIP;
      /*Update Locale according to the previous value selected*/
      this.store.postalLocality = this.auxLocal;

      /*Enable the fields from the address*/
      this.idisabledAdd = false;
    }

  }

  radioContactChangehandler(event: any) {
    this.selectedContactOption = event.target.value;
    if (this.selectedContactOption == "Sim") {
      /*Update Email according to the default from Client*/
      this.auxEmail = this.store.emailContact;
      this.store.emailContact = this.commEmail;
      /*Update Indicative according to the default from Client*/
      this.auxInd = this.store.cellphoneIndic;
      this.store.cellphoneIndic = this.commInd;
      /*Update Cellphone number according to the default from Client*/
      this.auxCellNumber = this.store.cellphoneNumber;
      this.store.cellphoneNumber = this.commCellNumber;

      /*Disable the fields from the address*/
      this.idisabledContact = true;
    } else {
      /*Update Email according to the previous value selected*/
      this.store.emailContact = this.auxEmail;
      /*Update Indicative according to the previous value selected*/
      this.store.cellphoneIndic = this.auxInd;
      /*Update Indicative according to the previous value selected*/
      this.store.cellphoneNumber = this.auxCellNumber;

      /*Enable the fields from the address*/
      this.idisabledContact = false;
    }
  }

  //Submit form to Back-end
  submit(FormStores: any) {
    if (this.stroreId == -1) {
      this.http.post<number>(this.baseUrl + 'bestores/PostStore/' + this.clientID, this.store).subscribe(result => {
        this.stroreId = result;
        this.route.navigate(['add-store-iban/' + this.stroreId]);
      }, error => console.error(error));
    } else {
      this.http.put<Istore>(this.baseUrl + 'bestores/PutStoreById/' + this.clientID + '/' + this.stroreId, this.store).subscribe(result => {
        this.route.navigate(['add-store-iban/' + this.stroreId]);
      }, error => console.error(error));
    }
  }
}
