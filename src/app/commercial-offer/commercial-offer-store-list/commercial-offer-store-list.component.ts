import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Configuration, configurationToken } from 'src/app/configuration';
import { Istore } from '../../store/IStore.interface';
import { ICommercialOffer } from '../ICommercialOffer';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-commercial-offer-store-list',
  templateUrl: './commercial-offer-store-list.component.html',
  styleUrls: ['./commercial-offer-store-list.component.css']
})
export class CommercialOfferStoreListComponent implements OnInit {

  private baseUrl;


  /*Commercial Offer Object*/
  public comercialOffers: ICommercialOffer[] = [];
  public clientID: number = 12345678;

  public stroreId: number = 0;
  public storeToReplicate: number = 0;

  public stores: Istore[] = [];
  public comercialOffersToReplicate!: ICommercialOffer[];

  /*Is it supposed to relicate the Commercial offert from another store?*/
  selectionsReplicate = ['Não', 'Sim'];
  /*Default case*/
  selectedOption = 'Não';


  ngOnInit(): void {
    this.selectedOption = 'Não';
    this.stroreId = Number(this.router.snapshot.params['stroreid']);
  }

  constructor(private logger : NGXLogger, private router: ActivatedRoute, private http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private route: Router) {

    this.baseUrl = configuration.baseUrl;

    
    this.ngOnInit();
    /*Get all offers for that specific store*/
    http.get<ICommercialOffer[]>(this.baseUrl + 'becommercialoffer/GetAllOffersByStores/' + this.clientID + '/' + this.stroreId).subscribe(result => {
      this.logger.debug(result);
      this.comercialOffers = result;
    }, error => console.error(error));

    /*Get the list of all stores*/
    http.get<Istore[]>(this.baseUrl + 'bestores/GetAllStores/' + this.clientID).subscribe(result => {
      this.logger.debug(result);
      this.stores = result;
    }, error => console.error(error));

  }

  /*Controlles the add store button*/
  onCickAdd() {
    this.route.navigate(['commercial-offert-detail/' + this.stroreId + '/-1']);
  }

  /*Controlles the return button*/
  onCickReturn() {
    this.route.navigate(['commercial-offert-list']);
  }

  /*Controles the radio button changes*/
  radoChangehandler(event: any) {
    this.selectedOption = event.target.value;
    this.logger.debug(this.selectedOption)
  }

  /*Submits the form*/
  submit(FormCommercialOffer: any) {
    /*Case when the offer is NOT replicated from another store*/
    if (this.selectedOption == 'Não') {
      this.logger.debug('parabens', FormCommercialOffer)

    } else {

      /*Case when the offer IS replicated from another store*/
      this.logger.debug(this.storeToReplicate)
      this.http.get<ICommercialOffer[]>(this.baseUrl + 'becommercialoffer/GetAllOffersByStores/' + this.clientID + '/' + this.stroreId).subscribe(result => {
        this.comercialOffersToReplicate = result;
        this.logger.debug(this.comercialOffersToReplicate);
        if (this.comercialOffers.length == 0) {
          /*Post a new Config replicated by a store*/
          this.http.post<number>(this.baseUrl + 'becommercialoffer/PostListConfig/' + this.clientID + '/' + this.stroreId, this.comercialOffersToReplicate).subscribe(result => {
            this.logger.debug(result);
          }, error => console.error(error));

        } else {
          /*Alter a Config replicated by a store*/
          this.http.put<number>(this.baseUrl + 'becommercialoffer/PutOfferListById/' + this.clientID + '/' + this.stroreId, this.comercialOffersToReplicate).subscribe(result => {
            this.logger.debug(result);
          }, error => console.error(error));
        }
      }, error => console.error(error));
      window.location.reload();
    }
  }


}
