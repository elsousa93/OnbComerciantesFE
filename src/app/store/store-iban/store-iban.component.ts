import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/nav-menu-interna/data.service';
import { Istore } from '../IStore.interface';
import { Configuration, configurationToken } from 'src/app/configuration';

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
  store: Istore = { id: -1 } as Istore
  public clientID: number = 12345678;

  public isIBANConsidered: boolean = null;
  public IBANToShow: {tipo:string, dataDocumento: string};
  public result: any;
  localUrl: any;

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

  constructor(private router: ActivatedRoute, private http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private route: Router, private data: DataService) {
    this.ngOnInit();
    // this.baseUrl = baseUrl;


    /*Get the information from the store we are editing*/
    http.get<Istore>(this.baseUrl + 'bestores/GetStoreById/' + this.clientID + '/' + this.stroreId).subscribe(result => {
      this.store = result;
    }, error => console.error(error));
    this.data.updateData(false, 3, 3);
  }

  ngOnInit(): void {
    //Get Id from the store
    this.stroreId = Number(this.router.snapshot.params['stroreid']);
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
  }

  /*Controles the radio button changes*/
  radoChangehandler(event: any) {
    this.selectedOption = event.target.value;
    if (this.selectedOption == "Sim") {
      this.auxIban = this.store.iban;
      this.store.iban = this.commIban;
      this.idisabled = true;
    } else {
      this.store.iban = this.auxIban;
      this.idisabled = false;
    }
    
  }

  //Submit form to Back-end
  submit(FormStores: any) {
    this.http.put<Istore>(this.baseUrl + 'bestores/PutStoreById/' + this.clientID + '/' + this.stroreId, this.store).subscribe(result => {
    }, error => console.error(error));
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
}
