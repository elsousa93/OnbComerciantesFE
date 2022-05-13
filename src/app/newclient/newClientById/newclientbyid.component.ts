import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Client } from '../Iclient.interface';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-client',
  templateUrl: './newclientbyid.component.html',
  styleUrls: ['./newclientbyid.component.css']
})

export class NewClientByIdComponent implements OnInit {
  
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
    
    console.log(this.clientNr);

    if (this.clientNr != -1) {
      http.get<Client>(baseUrl + 'BEClients/GetNewClientNr/' + this.clientNr).subscribe(result => {
        this.client = result;
      }, error => console.error(error));
    }
  }
  
  ngOnInit(): void {
    this.clientNr = Number(this.router.snapshot.params['id']);
  }
}
