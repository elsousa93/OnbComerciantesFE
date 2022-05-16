import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Client } from './Client.interface';
import { FormBuilder, Validators, ReactiveFormsModule, NgForm, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { docType } from './docType'

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

  ListaDocType = docType;
  formDocType!: FormGroup;
  docType?: string = "Outro";

  hasClient: boolean = false;
  showWarning: boolean = false;

  newClient: Client = {} as Client;

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
  changeListElementDocType(docType, e: any) {
    console.log(e.target.value)
    this.docType = e.target.value;
  }

}
