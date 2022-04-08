import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ICommercialOffer } from '../ICommercialOffer.interface';

@Component({
  selector: 'app-commercial-offer-detail',
  templateUrl: './commercial-offer-detail.component.html',
  styleUrls: ['./commercial-offer-detail.component.css']
})
export class CommercialOfferDetailComponent implements OnInit {

  public clientID: number = 12345678;
  public stroreId: number = 0;

  /*Is it supposed to relicate the Commercial offert from another store?*/
  selectionsReplicate = ['Sim', 'Não'];
  /*Default case*/
  selectedOption = 'Não';

  /*Save the number of terminals selected*/
  numberofTerminals: number = 0;

  /*What solutions can be choose?*/
  selectionsSolutionType = ['CardPresent', 'CardNotPresent', 'Combined'];

  /*Dinamic list of the brands to present*/
  selectedBrands: {"field": string, "selected": boolean; "editable": boolean}[] =
    [
      { field: "Visa", selected: false, editable: false },
      { field: "Mastercard", selected: true, editable: true },
      { field: "MB", selected: false, editable: true },
      { field: "MBWay", selected: true, editable: false },
    ]

  /*Dinamic list of the packages to present*/
  selectedPackages: { "field": string, "selected": boolean; "editable": boolean }[] =
    [
      { field: "Tradicional", selected: false, editable: false },
      { field: "Smart SIBS", selected: false, editable: false },
    ]

  /*Dinamic list of the Additional inormation to present*/
  selectedAdditionalInfos: { "field": string, "selected": boolean; "editable": boolean }[] =
    [
      { field: "Preçário TSC", selected: true, editable: true },
      { field: "Gratificações", selected: true, editable: false },
      { field: "DCC", selected: true, editable: false },
    ]

  /*Commercial offert object*/
  commOffer: ICommercialOffer = {
    id: 123,
    solutionType: '',
    ConfigID: 'Store Config',
    numberOfTerminals: 0,
    CommePack: {
      Brands: {},
      Packages: {},
      AdditionalInfo: {}
    }
  }

  constructor(private router: ActivatedRoute, private http: HttpClient, @Inject('BASE_URL') private baseUrl: string, private route: Router) { }

  ngOnInit(): void {
    this.selectedOption = 'Não';
    this.stroreId = Number(this.router.snapshot.params['stroreid']);
  }

  /*Controles the radio button changes*/
  radoChangehandler(event: any) {
    this.selectedOption = event.target.value;
    console.log(this.selectedOption)
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
    const field = $event.target.value;
    const isChecked = $event.target.checked;
    console.log(field, isChecked);

    this.selectedBrands.map((d) => {
      if (d.field === field) {
        d.selected = isChecked;
      }
      return d;

    });
    console.log(this.selectedBrands);
  }

  /*Controles the checkbox of the Packages*/
  onChangePackage($event: any) {
    const field = $event.target.value;
    const isChecked = $event.target.checked;
    console.log(field, isChecked);

    this.selectedPackages.map((d) => {
      if (d.field === field) {
        d.selected = isChecked;
      }
      return d;

    });
    console.log(this.selectedPackages);
  }

  /*Controles the checkbox of the Additional information*/
  onChangeAdditionalInfo($event: any) {
    const field = $event.target.value;
    const isChecked = $event.target.checked;
    console.log(field, isChecked);

    this.selectedAdditionalInfos.map((d) => {
      if (d.field === field) {
        d.selected = isChecked;
      }
      return d;

    });
    console.log(this.selectedAdditionalInfos);
  }

  /*Submits the form to the backend*/
  submit(FormCommercialOffer: any) {
    console.log('parabens', FormCommercialOffer)
    this.commOffer.CommePack.Brands = this.selectedBrands;
    this.commOffer.CommePack.Packages = this.selectedPackages;
    this.commOffer.CommePack.AdditionalInfo = this.selectedAdditionalInfos;
    this.commOffer.numberOfTerminals = this.numberofTerminals;
    console.log(this.commOffer)

    this.http.post<ICommercialOffer>(this.baseUrl + 'becommercialoffer/PostConfig/' + this.clientID + '/' + this.stroreId, this.commOffer).subscribe(result => {
      console.log(result);
    }, error => console.error(error));
  }

}
