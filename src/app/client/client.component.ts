import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Client } from './Client.interface';
import { FormBuilder, Validators, ReactiveFormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css']
})

export class ClientComponent implements OnInit {
  public clients: Client[] = [];
  public clientsForSearch: Client[] = [];
  public searchParameter: any;
  public result: any;
  public displayValueSearch: any;

  hasClient: boolean = false;

  newClient: Client = {  } as Client;

  @Output() nameEmitter = new EventEmitter<string>();
    //clientID: string;

  constructor(private router: ActivatedRoute,
    private http: HttpClient, @Inject('BASE_URL')
    private baseUrl: string, private route: Router) {

    console.log(baseUrl);
    http.get<Client[]>(baseUrl + 'BEClients/GetAllClients/').subscribe(result => {
      console.log(result);
      this.clients = result;
    }, error => console.error(error));
  }


  receiveSearchValue(box: string) {
    console.warn("VALOR RECEBIDO no Client", box);
    // this.searchParameter.push(box);
    this.searchParameter = (box);
  }


  // Search de um cliente -------------------------

  getValueSearch(val: string) {
    console.warn("client.component recebeu: ", val)
    this.displayValueSearch = val;

    this.http.get<Client>(this.baseUrl + 'BEClients/GetClientByNewClientNr/' + this.displayValueSearch).subscribe(result => {
      this.newClient = result;
    }, error => console.error(error));
    console.log(this.newClient);
    console.warn("get enviado: ", val)
    this.sendClient(this.newClient);

    return this.newClient;

  }
  sendToParent() {
    this.nameEmitter.emit(this.displayValueSearch);
  }

  sendClient(client: Client) {
    //clear the array
    this.clientsForSearch = [];
    this.hasClient = true;
    console.log(this.clientsForSearch);

    this.clientsForSearch.push(client);


  }

  //------------------------------------------------


  getStore


  ngOnInit(): void {
  }

  submit(form: any) {


  }

}
