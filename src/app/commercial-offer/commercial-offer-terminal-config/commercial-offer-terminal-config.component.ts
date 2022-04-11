import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ICommercialOffer } from '../ICommercialOffer.interface';

@Component({
  selector: 'app-commercial-offer-terminal-config',
  templateUrl: './commercial-offer-terminal-config.component.html',
  styleUrls: ['./commercial-offer-terminal-config.component.css']
})
export class CommercialOfferTerminalConfigComponent implements OnInit {

  public clientID: number = 12345678;
  public stroreId: number = 0;
  public commofid: number = 0;


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

  /*Is it supposed to relicate the Commercial offert from another store?*/
  selectionsReplicate = ['Sim', 'Não'];
  /*Default case*/
  selectedOption = 'Sim';

  /*What terminal Types can the client choose?*/
  selectionsTerminalType = ['Fixo', 'Móvel'];

  /*What terminal Types can the client choose?*/
  selectionsCommunicationType = ['GPRS', 'Linha Comutada'];

  constructor(private router: ActivatedRoute, private http: HttpClient, @Inject('BASE_URL') private baseUrl: string, private route: Router) {
    this.ngOnInit();

    if (this.commofid != -1) {
      http.get<ICommercialOffer>(baseUrl + 'becommercialoffer/GetOfferById/' + this.clientID + '/' + this.stroreId + '/' + this.commofid).subscribe(result => {
        this.commOffer = result;
      }, error => console.error(error));
    }

  }

  ngOnInit(): void {
    this.selectedOption = 'Sim';
    this.stroreId = Number(this.router.snapshot.params['stroreid']);
    this.commofid = Number(this.router.snapshot.params['commofid']);
  }

  /*Controles the radio button changes*/
  radoChangehandler(event: any) {
    this.selectedOption = event.target.value;
    console.log(this.selectedOption)
  }

  /*Controls the cancel button */
  onCickCancel() {
    this.route.navigate(['commercial-offert-store-list/' + this.stroreId]);
  }

  /*controls the delete button*/
  onCickDelete() {

    if (this.stroreId != -1) {
      console.log("delete:" + this.stroreId);
      this.http.delete<ICommercialOffer>(this.baseUrl + 'becommercialoffer/DeleteOfferById/' + this.clientID + '/' + this.stroreId + '/' + this.commofid).subscribe(result => {
        console.log(result);
      }, error => console.error(error));
    }

    this.route.navigate(['commercial-offert-store-list/' + this.stroreId]);
  }

  /*Submits the form to the backend*/
  submit(FormCommercialOffer: any) {
    console.log('parabens', FormCommercialOffer)

    /*edit existing commercial offer*/
    this.http.put<ICommercialOffer>(this.baseUrl + 'becommercialoffer/PutOfferById/' + this.clientID + '/' + this.stroreId + '/' + this.commofid, this.commOffer).subscribe(result => {
      console.log(result);
    }, error => console.error(error));

    this.route.navigate(['commercial-offert-store-list/' + this.stroreId]);
  }

}
