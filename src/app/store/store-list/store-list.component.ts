import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Istore } from '../IStore.interface';
import { Router } from '@angular/router';



@Component({
  selector: 'app-store-list',
  templateUrl: './store-list.component.html',
  styleUrls: ['./store-list.component.css']
})
export class StoreComponent{

  public stores: Istore[] = [];
  public clientID: number = 12345678;

  constructor(http: HttpClient, @Inject('BASE_URL') baseUrl: string, private route: Router)
  {
    http.get<Istore[]>(baseUrl + 'bestores/GetAllStores/' + this.clientID).subscribe(result => {
      console.log(result);
      this.stores = result;
    }, error => console.error(error));

  }
  
  ngOnInit(): void {
  }

  onCickAdd() {
    this.route.navigate(['add-store/-1']);
  }

}
