import { Component, Inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Client } from './Client.interface'

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css']
})

export class ClientComponent implements OnInit {
  public clients: Client[] = [];
  //public clientsForSearch: Client[] = [];
  public searchParameter: any;
  public result: any;


  constructor(http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
    console.log(baseUrl);
    http.get<Client[]>(baseUrl + 'BEClients').subscribe(result => {
      console.log(result);
      this.clients = result;
    }, error => console.error(error));
  }
  receiveSearchValue(box: string) {
    console.warn("VALOR RECEBIDO no Client", box);
    // this.searchParameter.push(box);
    this.searchParameter = (box);
  }

  ngOnInit(): void {
  }

  submit(form: any) {


  }

}
