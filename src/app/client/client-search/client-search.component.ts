import { HttpClient } from '@angular/common/http';
import { Component, Input, Output, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { Configuration, configurationToken } from '../../configuration';
import { AuthService } from '../../services/auth.service';
import { Client } from '../Client.interface';
import { ClientService } from '../client.service';

@Component({
  selector: 'app-client-search',
  templateUrl: './client-search.component.html',
  styleUrls: ['./client-search.component.css']
})
export class ClientSearchComponent implements OnInit {
  // Inputs do componente (searchType e requestID não foram desenhados ainda)
  @Input() clientID: string;
  @Input() searchType?: string = "por mudar";
  @Input() requestID?: string = "por mudar";
  //@Input() canEdit?: boolean = false; Pode vir a ser preciso
  @Input() canSelect?: boolean = true;

  //Output
  @Output() selectedClient: Client;
  @Output() foundClients: boolean = false;

  clientsToShow: Client[] = [];
  
  constructor(private router: ActivatedRoute, private http: HttpClient, private logger: NGXLogger,
    @Inject(configurationToken) private configuration: Configuration,
    private route: Router, private clientService: ClientService, private authService: AuthService) { }

  ngOnInit(): void {
  }

  searchClients() {
    var context = this;
    this.clientService.SearchClientByQuery(this.clientID, this.searchType, this.requestID, "por mudar").subscribe(o => {
      var clients = o;

      var context2 = this;

      context.clientsToShow = [];
      if (clients.length > 0) {
        context.foundClients = true;
        clients.forEach(function (value, index) {
          context.logger.debug(value);
          context2.clientService.getClientByID(value.merchantId, "por mudar", "por mudar").subscribe(c => {
            context.logger.debug(c);
            var client = {
              "clientId": c.merchantId,
              "commercialName": c.commercialName,
              "address": "Rua Gomes Artur",
              "ZIPCode": "1000-001",
              "locality": "Lisboa",
              "country": "Portugal",
            }
            context.clientsToShow.push(client);
            context.logger.debug(context.clientsToShow);
          });
        })
      } else {
        context.foundClients = false;
        //this.showFoundClient = false;
        //context.resultError = "Não existe Comerciante com esse número.";
        //this.searchDone = true;
      }
    }, error => {
      context.foundClients = false;
      //context.showFoundClient = false;
      //context.resultError = "Não existe Comerciante com esse número.";
      //this.searchDone = true;

    });
  }

}
