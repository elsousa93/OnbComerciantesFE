import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Client } from './Client.interface';
import { FormBuilder, Validators, ReactiveFormsModule, NgForm, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { docType } from './docType'
import { DataService } from '../nav-menu-interna/data.service';
import { Subscription } from 'rxjs';

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
  docType?: string = "";

  hasClient: boolean = false;
  showWarning: boolean = false;
  showButtons: boolean = false;
  showSeguinte: boolean = false;
 
  newClient: Client = {} as Client;

  @Output() nameEmitter = new EventEmitter<string>();
  //clientID: string;

  public map = new Map();
  public currentPage: number;
  public subscription : Subscription;

  constructor(private router: ActivatedRoute,
    private http: HttpClient, @Inject('BASE_URL')
    private baseUrl: string, private route: Router,
    private data: DataService) {
    this.ngOnInit();
    console.log(baseUrl);
    http.get<Client[]>(baseUrl + 'BEClients/GetAllClients/').subscribe(result => {
      this.clients = result;
    }, error => console.error(error));
    this.updateData(true,1);
  }


  receiveSearchValue(box: string) {
    console.warn("VALOR RECEBIDO no Client", box);
    // this.searchParameter.push(box);
    this.searchParameter = (box);
  }

// Search for a client
getValueSearch(val: string) {
  this.activateButtons(true);
  this.displayValueSearch = val;

  this.http.get<Client>(this.baseUrl + 'BEClients/GetClientNr/' + this.displayValueSearch).subscribe(result => {
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

// Search for a client
// old version
/*  getValueSearch(val: string) {
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
*/
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
    this.clientsForSearch.push(client);

    if (client.newClientNr == 0) {
      this.hasClient = false;
    }
  }

  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
  }

  //função que altera o valor do map e da currentPage
  updateData(value: boolean, currentPage: number) {
    this.map.set(1, value);
    this.data.changeData(this.map);
    this.data.changeCurrentPage(currentPage);
  }

  submit(form: any) {
  }

  changeListElementDocType(docType, e: any) {
    this.activateButtons(true);
    this.toggleShowWarning(true);
    this.docType = e.target.value;
  }

  obterSelecionado(id: any){
    this.route.navigate(['/clientbyid/', id]);
  }

  activateButtons(id: boolean){
    if (id == true) {
      this.showButtons = true
    } else {
      this.showButtons = false
    }
  }

  aButtons(id: boolean){
    if (id == true) {
      this.showSeguinte = true
    } else {
      this.showSeguinte = false
    }
  }
}
