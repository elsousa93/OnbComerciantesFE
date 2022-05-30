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
  docType?: string = "";

  hasClient: boolean = false;
  showWarning: boolean = false;
  hasClientT: boolean = false;
  showWarningT: boolean = false;
  showButtons: boolean = false;
  showSeguinte: boolean = false;
  resultError: string ="";
  newClient: Client = {} as Client;

  @Output() nameEmitter = new EventEmitter<string>();
  //clientID: string;

  constructor(private router: ActivatedRoute,
    private http: HttpClient, @Inject('BASE_URL')
    private baseUrl: string, private route: Router) {
    this.activateButtons(true);
    console.log(baseUrl);
    http.get<Client[]>(baseUrl + 'BEClients/GetAllClients/').subscribe(result => {
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
  this.activateButtons(true);
  this.displayValueSearch = val;


  this.http.get<Client>(this.baseUrl + 'BEClients/GetClientById/' + this.displayValueSearch).subscribe(result => {
    this.newClient = result;
  }, error => console.error(error));
  console.log(this.newClient);

  if (this.newClient.newClientNr == 0) {
    //There is no client - Show the warning and erase the 
    this.toggleShowWarning(true);
    this.showWarningT =true;
    this.hasClientT =false;
    this.hasClient == false;
    this.resultError = "Não existe Comerciante com esse número.";
  } else {
    this.toggleShowWarning(false);
    this.showWarningT =false;
    this.hasClientT =true;
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
    this.showWarningT =false;
    this.hasClientT =true;
  }

  submit(form: any) {
  }

  changeListElementDocType(docType, e: any) {
    this.activateButtons(true);
    this.toggleShowWarning(false);
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

  createNewClient(){
    this.route.navigate(['/app-new-client/']);
  }

  close(){
    this.route.navigate(['/']);
  }

  newSearch(){
    location.reload();
  }

}