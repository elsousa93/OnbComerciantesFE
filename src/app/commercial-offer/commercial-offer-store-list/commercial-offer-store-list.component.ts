import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Istore } from '../../store/IStore.interface';
import { ICommercialOffer } from '../ICommercialOffer.interface';

@Component({
  selector: 'app-commercial-offer-store-list',
  templateUrl: './commercial-offer-store-list.component.html',
  styleUrls: ['./commercial-offer-store-list.component.css']
})
export class CommercialOfferStoreListComponent implements OnInit {

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

  constructor(private router: ActivatedRoute, private http: HttpClient, @Inject('BASE_URL') private baseUrl: string, private route: Router) {

    this.ngOnInit();

    http.get<ICommercialOffer[]>(baseUrl + 'becommercialoffer/GetAllOffersByStores/' + this.clientID + '/' + this.stroreId).subscribe(result => {
      console.log(result);
      this.comercialOffers = result;
    }, error => console.error(error));

    http.get<Istore[]>(baseUrl + 'bestores/GetAllStores/' + this.clientID).subscribe(result => {
      console.log(result);
      this.stores = result;
    }, error => console.error(error));

  }


  onCickAdd() {
    this.route.navigate(['commercial-offert-detail/' + this.stroreId + '/-1']);
  }

  onCickReturn() {
    this.route.navigate(['commercial-offert-list']);
  }

  /*Controles the radio button changes*/
  radoChangehandler(event: any) {
    this.selectedOption = event.target.value;
    console.log(this.selectedOption)
  }

  submit(FormCommercialOffer: any) {
    /*Case when the offer is NOT replicated from another store*/
    if (this.selectedOption == 'Não') {
      console.log('parabens', FormCommercialOffer)

    } else {

      /*Case when the offer IS replicated from another store*/
      console.log(this.storeToReplicate)
      this.http.get<ICommercialOffer[]>(this.baseUrl + 'becommercialoffer/GetAllOffersByStores/' + this.clientID + '/' + this.stroreId).subscribe(result => {
        this.comercialOffersToReplicate = result;
        console.log(this.comercialOffersToReplicate);
        if (this.comercialOffers.length == 0) {
          /*Post a new Config replicated by a store*/
          this.http.post<number>(this.baseUrl + 'becommercialoffer/PostListConfig/' + this.clientID + '/' + this.stroreId, this.comercialOffersToReplicate).subscribe(result => {
            console.log(result);
          }, error => console.error(error));

        } else {
          /*Alter a Config replicated by a store*/
          this.http.put<number>(this.baseUrl + 'becommercialoffer/PutOfferListById/' + this.clientID + '/' + this.stroreId, this.comercialOffersToReplicate).subscribe(result => {
            console.log(result);
          }, error => console.error(error));
        }
      }, error => console.error(error));
      window.location.reload();
    }
  }


}
