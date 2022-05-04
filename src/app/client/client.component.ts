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

  hasClient: boolean = false;
  showWarning: boolean = false;

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

// Search for a client
  getValueSearch(val: string) {
    console.warn("client.component recebeu: ", val)
    this.displayValueSearch = val;

    this.http.get<Client>(this.baseUrl + 'BEClients/GetClientByNewClientNr/' + this.displayValueSearch).subscribe(result => {
      this.newClient = result;
    }, error => console.error(error));
    console.log(this.newClient);

    if (this.newClient.newClientNr == 0) {
      //There is no client - Show the warning and erase the 
      this.toggleShowWarning(true);
      this.hasClient == false;
    } else {
      this.toggleShowWarning(false);
    }
    console.warn("get enviado: ", val)
    this.sendClient(this.newClient);
    return this.newClient;

  }
  sendToParent() {
    this.nameEmitter.emit(this.displayValueSearch);
  }

  toggleShowWarning(value: Boolean) {
    //There is no client
    if (value == true) {
      this.showWarning = true
    } else {
      this.showWarning = false
    }
  }

  sendClient(client: Client) {
    //clear the array
    this.clientsForSearch = [];
    this.hasClient = true;
    console.log(this.clientsForSearch);
    this.clientsForSearch.push(client);

    if (client.newClientNr == 0) {
      this.hasClient = false;
    }
  }

  ngOnInit(): void {
  }

  submit(form: any) {
  }

}
