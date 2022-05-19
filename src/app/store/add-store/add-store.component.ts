import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Istore } from '../IStore.interface';
import { AppComponent } from '../../app.component';

@Component({
  selector: 'app-add-store',
  templateUrl: './add-store.component.html',
  styleUrls: ['./add-store.component.css']
})

  //This component allows to add a new store or edit the main configutarion of a store
  //If the storeId value is -1 it means that it is a new store to be added - otherwise the storeId corresponds to the id of the store to edit

export class AddStoreComponent implements OnInit {

  /*Variable declaration*/
  public stroreId: number = 0;
  store: Istore = {
    id: -1, nameEstab: "", country: "", postalCode: "", address: "", fixedIP: "", postalLocality: "", emailContact: "", cellphoneIndic: "", cellphoneNumber: "", turisticZone: false, activityEstab: "", subActivityEstab: "", zoneEstab: "", subZoneEstab: "", iban: ""} as Istore
  public clientID: number = 12345678;
  public totalUrl: string = "";

  public zonasTuristicas: string[] = ["Não", "Sim"];
  defaultZonaTuristica: number = 0;

  constructor(private router: ActivatedRoute, private http: HttpClient, @Inject('BASE_URL') private baseUrl: string, private route: Router, public appComp: AppComponent) {

    this.ngOnInit();

    //WS call - Get the fields for the specific store if we are not creatig a new store
    if (this.stroreId != -1) {
      http.get<Istore>(baseUrl + 'bestores/GetStoreById/' + this.clientID + '/' + this.stroreId).subscribe(result => {
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
  }

  ngOnInit(): void {
    console.log("Entrei On init")
    this.appComp.updateNavBar("Adicionar Loja")
    //Get Id from the store
    this.stroreId = Number(this.router.snapshot.params['stroreid']);
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
