import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Inject } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Client } from '../Client.interface';

@Component({
  selector: 'app-new-client',
  templateUrl: './new-client.component.html'
})
export class NewClientComponent implements OnInit {

  addNewClient: Client = {} as Client
  stringJson: any;

  constructor(private router: ActivatedRoute, private http: HttpClient, @Inject('BASE_URL') private baseUrl: string, private route: Router) {
    console.log(this.addNewClient.fiscalId);
  }

  ngOnInit(): void {

  }

  obterComprovativos() {
    //this.route.navigate(['/nav-interna/', "COMPROVATIVOS"]);
    //this.route.navigate(['/comprovativos/', this.clientNr]);
  }

  submit(form: any) {

 //fazer todos os campos
    //this.addNewClient.newClientNr = form.newClientNr;

    this.addNewClient.billingEmail = form.billingEmail;

    console.log(this.addNewClient);

    //Nao esta a ser usado
    this.stringJson = JSON.stringify(this.addNewClient);
    console.log("String json object :", this.stringJson);

    this.http.post<Client>(this.baseUrl + 'BEClients/',this.addNewClient).subscribe(result => {
      console.log(result);
    }, error => console.error(error));


  }
}
