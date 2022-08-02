import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Istore } from '../IStore.interface';
import { Router } from '@angular/router';
import { DataService } from '../../nav-menu-interna/data.service';
import { Subscription } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Configuration, configurationToken } from 'src/app/configuration';


interface Stores {
  storeName: string;
  activity: string;
  subactivity: string;
  zone: string;
}

const testValues : Stores[] = [
  {storeName: "TESTE 1, LDA", activity:"RESTAURAÇÃO",subactivity: "RESTAURAÇÃO", zone: "COIMBRA"},
  {storeName: "TESTE 1, LDA", activity:"RESTAURAÇÃO",subactivity: "RESTAURAÇÃO", zone: "COIMBRA"},
  {storeName: "TESTE 1, LDA", activity:"RESTAURAÇÃO",subactivity: "RESTAURAÇÃO", zone: "COIMBRA"},
  {storeName: "TESTE 1, LDA", activity:"RESTAURAÇÃO",subactivity: "RESTAURAÇÃO", zone: "COIMBRA"},
  {storeName: "TESTE 1, LDA", activity:"RESTAURAÇÃO",subactivity: "RESTAURAÇÃO", zone: "COIMBRA"},
  {storeName: "TESTE 1, LDA", activity:"RESTAURAÇÃO",subactivity: "RESTAURAÇÃO", zone: "COIMBRA"},
  {storeName: "TESTE 1, LDA", activity:"RESTAURAÇÃO",subactivity: "RESTAURAÇÃO", zone: "COIMBRA"},
  {storeName: "TESTE 1, LDA", activity:"RESTAURAÇÃO",subactivity: "RESTAURAÇÃO", zone: "COIMBRA"},
  {storeName: "TESTE 1, LDA", activity:"RESTAURAÇÃO",subactivity: "RESTAURAÇÃO", zone: "COIMBRA"},
  {storeName: "TESTE 1, LDA", activity:"RESTAURAÇÃO",subactivity: "RESTAURAÇÃO", zone: "COIMBRA"},
  {storeName: "TESTE 1, LDA", activity:"RESTAURAÇÃO",subactivity: "RESTAURAÇÃO", zone: "COIMBRA"},
  {storeName: "TESTE 1, LDA", activity:"RESTAURAÇÃO",subactivity: "RESTAURAÇÃO", zone: "COIMBRA"},
  {storeName: "TESTE 1, LDA", activity:"RESTAURAÇÃO",subactivity: "RESTAURAÇÃO", zone: "COIMBRA"},
  {storeName: "TESTE 1, LDA", activity:"RESTAURAÇÃO",subactivity: "RESTAURAÇÃO", zone: "COIMBRA"},
  {storeName: "TESTE 1, LDA", activity:"RESTAURAÇÃO",subactivity: "RESTAURAÇÃO", zone: "COIMBRA"},
  {storeName: "TESTE 1, LDA", activity:"RESTAURAÇÃO",subactivity: "RESTAURAÇÃO", zone: "COIMBRA"},
  {storeName: "TESTE 1, LDA", activity:"RESTAURAÇÃO",subactivity: "RESTAURAÇÃO", zone: "COIMBRA"},
  {storeName: "TESTE 1, LDA", activity:"RESTAURAÇÃO",subactivity: "RESTAURAÇÃO", zone: "COIMBRA"},
  {storeName: "TESTE 1, LDA", activity:"RESTAURAÇÃO",subactivity: "RESTAURAÇÃO", zone: "COIMBRA"},
  {storeName: "TESTE 1, LDA", activity:"RESTAURAÇÃO",subactivity: "RESTAURAÇÃO", zone: "COIMBRA"},
  {storeName: "TESTE 1, LDA", activity:"RESTAURAÇÃO",subactivity: "RESTAURAÇÃO", zone: "COIMBRA"},
  {storeName: "TESTE 1, LDA", activity:"RESTAURAÇÃO",subactivity: "RESTAURAÇÃO", zone: "COIMBRA"}
]

//This component displays the list of the existing stores

@Component({
  selector: 'app-store-list',
  templateUrl: './store-list.component.html',
  styleUrls: ['./store-list.component.css']
})
export class StoreComponent implements AfterViewInit{
  storesMat: MatTableDataSource<Stores>;

  private baseUrl: string;


  /*variable declaration*/
  public stores: Istore[] = [];
  public clientID: number = 12345678;

  public map: Map<number, boolean>;
  public currentPage: number;
  public subscription: Subscription;

  displayedColumns: string[] = ['nameEstab', 'activityEstab', 'subActivityEstab', 'zoneEstab'];
  dataSource = new MatTableDataSource<Istore>(this.stores);

  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  constructor(http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private route: Router, private data: DataService)
  {
    this.baseUrl = configuration.baseUrl;

    this.ngOnInit();
    /*Get from the backend the full list of stores existing for the client*/
    http.get<Istore[]>(this.baseUrl + 'bestores/GetAllStores/' + this.clientID).subscribe(result => {
      this.stores = result;
      this.dataSource.data = this.stores;
    }, error => console.error(error));
    this.data.updateData(false, 3);
  }
  
  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);

    this.loadStores();
  }

  navigateTo(id: number) {
    this.route.navigate(['/add-store/', id]);
  }

  loadStores(storesValues: Stores[] = testValues){
    this.storesMat = new MatTableDataSource(storesValues);
  }
  
}
