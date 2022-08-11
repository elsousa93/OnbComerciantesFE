import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ICommercialOffer } from '../ICommercialOffer';
import { Istore } from '../../store/IStore.interface';
import { Configuration, configurationToken } from 'src/app/configuration';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-commercial-offer-detail',
  templateUrl: './commercial-offer-detail.component.html',
  styleUrls: ['./commercial-offer-detail.component.css']
})
export class CommercialOfferDetailComponent implements OnInit {

  private baseUrl;


  public clientID: number = 12345678;
  public stroreId: number = 0;
  public commofid: number = 0;
  public storeToReplicate: number = 0;

  public stores: Istore[] = [];
  public comercialOffersToReplicate!: ICommercialOffer[];

  /*Save the number of terminals selected*/
  numberofTerminals: number = 0;

  /*What solutions can the client choose?*/
  selectionsSolutionType = ['CardPresent', 'CardNotPresent', 'Combined'];

  /*Dinamic list of the brands to present*/
  selectedBrands: {"fieldName": string, "selected": boolean; "editable": boolean}[] =
    [
      { fieldName: "Visa", selected: false, editable: false },
      { fieldName: "Mastercard", selected: true, editable: true },
      { fieldName: "MB", selected: false, editable: true },
      { fieldName: "MBWay", selected: true, editable: false },
    ]

  /*Dinamic list of the packages to present*/
  selectedPackages: { "fieldName": string, "selected": boolean; "editable": boolean }[] =
    [
      { fieldName: "Tradicional", selected: false, editable: false },
      { fieldName: "Smart SIBS", selected: false, editable: false },
    ]

  /*Dinamic list of the Additional inormation to present*/
  selectedAdditionalInfos: { "fieldName": string, "selected": boolean; "editable": boolean }[] =
    [
      { fieldName: "Preçário TSC", selected: true, editable: true },
      { fieldName: "Gratificações", selected: true, editable: false },
      { fieldName: "DCC", selected: true, editable: false },
    ]

  /*Commercial offert object*/
  commOffer: ICommercialOffer = {
    id: 123,
    solutionType: '',
    configID: 'Store Config',
    numberOfTerminals: 0,
    brands: [],
    packages: [],
    additionalInfo: [],
    terminalType: '',
    communicationType: ''
  }

  constructor(private logger : NGXLogger, private router: ActivatedRoute, private http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private route: Router) {
    this.baseUrl = configuration.baseUrl;
    
    this.ngOnInit();
    /*In the case of beeing n exising offer*/
    if (this.commofid != -1) {
      http.get<ICommercialOffer>(this.baseUrl + 'becommercialoffer/GetOfferById/' + this.clientID + '/' + this.stroreId + '/' + this.commofid).subscribe(result => {
        /*Get commercial offer information*/
        this.commOffer = result;
        this.selectedBrands = this.commOffer.brands;
        this.selectedAdditionalInfos = this.commOffer.additionalInfo;
        this.selectedPackages = this.commOffer.packages;
        this.numberofTerminals = result.numberOfTerminals;
      }, error => console.error(error));
    }

    /*Get all the stores*/
    http.get<Istore[]>(this.baseUrl + 'bestores/GetAllStores/' + this.clientID).subscribe(result => {
      this.logger.debug(result);
      this.stores = result;
    }, error => console.error(error));

  }

  ngOnInit(): void {
    this.stroreId = Number(this.router.snapshot.params['stroreid']);
    this.commofid = Number(this.router.snapshot.params['commofid']);
  }

  /*Controles the increment or decrement of the number of terminals*/
  incrementCounter() {
    this.numberofTerminals++;
  }

  decrementCounter() {
    if (this.numberofTerminals > 0) {
      this.numberofTerminals--;
    }
    
  }

  /*Controles the checkbox of the Brands*/
  onChangeBrand($event: any) {
    const fieldName = $event.target.value;
    const isChecked = $event.target.checked;
    this.logger.debug(fieldName, isChecked);

    this.selectedBrands.map((d) => {
      if (d.fieldName === fieldName) {
        d.selected = isChecked;
      }
      return d;

    });
    this.logger.debug(this.selectedBrands);
  }

  /*Controles the checkbox of the Packages*/
  onChangePackage($event: any) {
    const fieldName = $event.target.value;
    const isChecked = $event.target.checked;
    this.logger.debug(fieldName, isChecked);

    this.selectedPackages.map((d) => {
      if (d.fieldName === fieldName) {
        d.selected = isChecked;
      }
      return d;

    });
    this.logger.debug(this.selectedPackages);
  }

  /*Controles the checkbox of the Additional information*/
  onChangeAdditionalInfo($event: any) {
    const fieldName = $event.target.value;
    const isChecked = $event.target.checked;
    this.logger.debug(fieldName, isChecked);

    this.selectedAdditionalInfos.map((d) => {
      if (d.fieldName === fieldName) {
        d.selected = isChecked;
      }
      return d;

    });
    this.logger.debug(this.selectedAdditionalInfos);
  }


  /*Controls the cancel button */
  onCickCancel() {
    this.route.navigate(['commercial-offert-store-list/' + this.stroreId]);
  }

  /*controls the delete button*/
  onCickDelete() {

    if (this.stroreId != -1) {
      this.logger.debug("delete:" + this.stroreId);
      this.http.delete<ICommercialOffer>(this.baseUrl + 'becommercialoffer/DeleteOfferById/' + this.clientID + '/' + this.stroreId + '/' + this.commofid).subscribe(result => {
        this.logger.debug(result);
      }, error => console.error(error));
    }

    this.route.navigate(['commercial-offert-store-list/' + this.stroreId]);
  }

  /*Submits the form to the backend*/
  submit(FormCommercialOffer: any) {
  /*Case when the offer is NOT replicated from another store*/
    this.logger.debug('parabens', FormCommercialOffer)

    this.commOffer.brands = this.selectedBrands;
    this.commOffer.packages = this.selectedPackages;
    this.commOffer.additionalInfo = this.selectedAdditionalInfos;
    this.commOffer.numberOfTerminals = this.numberofTerminals;


    if (this.commofid == -1) {
      /*create new commercial offer*/
      this.http.post<number>(this.baseUrl + 'becommercialoffer/PostConfig/' + this.clientID + '/' + this.stroreId, this.commOffer).subscribe(result => {
        this.logger.debug(result);
        this.commofid = result;
        this.route.navigate(['commercial-offert-terminal-config/' + this.stroreId + '/' + this.commofid]);
      }, error => console.error(error));
    } else {
      /*edit existing commercial offer*/
      this.http.put<ICommercialOffer>(this.baseUrl + 'becommercialoffer/PutOfferById/' + this.clientID + '/' + this.stroreId + '/' + this.commofid, this.commOffer).subscribe(result => {
        this.logger.debug(result);
      }, error => console.error(error));
      this.route.navigate(['commercial-offert-terminal-config/' + this.stroreId + '/' + this.commofid]);
    }
  }
}
