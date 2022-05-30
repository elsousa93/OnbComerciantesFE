import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Client } from '../Client.interface';
import { TestScheduler } from 'rxjs/testing';


@Component({
  selector: 'app-client',
  templateUrl: './clientbyid.component.html'
})

export class ClientByIdComponent implements OnInit {
  
  /*Variable declaration*/
  public clientNr: number = 0;
  client: Client = {
    id: -1, clientTypology: "", newClientNr: 0, docType: "", docNr: "", flagAutCol: false, crcCode: "", socialDenomination: "", 
    natJuridicaN1: "", natJuridicaNIFNIPC: 0, natJuridicaN2: "", categoriaComerciante: "", categoriaNIPC: 0, caePrincipal: "", 
    caeSecundario1: "", caeSecundario2: "", caeSecundario3: "", ramoPrincipal: "", ramoSecundario1: "", ramoSecundario2: "",  
    ramoSecundario3: "",  dataConst: "",  paisSedeSocial: "",  localidadeSedeSocial: "",  cpSedeSocial: "",  moradaSedeSocial: "",  
    franchiseName: "", groupNIPC: 0,  expectableAnualInvoicing: "",  services: "",  transactionsAverage: 0,  preferenceDocuments: "",  
    preferenceContacts: "",  destinationCountries: "",  nameClient: "",  callingCodeLandClient: "",  phoneLandClient: 0,  callingCodeMobileClient: "",
    mobilePhoneClient: 0,  emailClient: "",  callingCodeFaxClient: "",  faxClient: "",  billingEmail: "" } as Client
   
  
  constructor(private router: ActivatedRoute, private http: HttpClient, @Inject('BASE_URL') private baseUrl: string, private route: Router) {
    this.ngOnInit();
    if (this.clientNr != -1) {
      http.get<Client>(baseUrl + 'BEClients/GetClientNr/' + this.clientNr).subscribe(result => {
        this.client = result;
        console.log( this.client);

      }, error => console.error(error));
    }
  }
  
  ngOnInit(): void {
    this.clientNr = Number(this.router.snapshot.params['id']);
  }

  obterComprovativos(){
    this.route.navigate(['/nav-interna/', "COMPROVATIVOS" ]);
    this.route.navigate(['/comprovativos/', this.clientNr ]);
  }
  umdois(){
   
  }
  
}
