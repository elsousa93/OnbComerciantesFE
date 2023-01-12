import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { LoggerService } from 'src/app/logger.service';
import { Client } from '../Client.interface';
import { ClientService } from '../client.service';

@Component({
  selector: 'app-client-search',
  templateUrl: './client-search.component.html',
  styleUrls: ['./client-search.component.css']
})
export class ClientSearchComponent implements OnInit {
  // Inputs do componente (searchType e requestID não foram desenhados ainda)
  @Input() clientID: string = "";
  @Input() searchType?: string;
  @Input() requestID?: string = "por mudar";
  @Input() canSelect?: boolean = true;

  //Output
  @Output() selectedClientEmitter = new EventEmitter<{
    client: Client,
    idx: number
  }>();
  @Output() foundClients: boolean = false;

  //Variáveis locais
  clientsToShow: Client[] = [];

  constructor(private logger: LoggerService, private clientService: ClientService) { }

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
          context2.clientService.getClientByID(value.merchantId, "por mudar", "por mudar").then(c => {
            context.logger.debug(c);
            var client = {
              "clientId": c.result.merchantId,
              "commercialName": c.result.commercialName,
              "address": c.result.headquartersAddress.address,
              "ZIPCode": c.result.headquartersAddress.postalCode,
              "locality": c.result.headquartersAddress.postalArea,
              "country": c.result.headquartersAddress.country,
            }
            context.clientsToShow.push(client);
            context.logger.debug(context.clientsToShow);
          });
        })
      } else {
        context.foundClients = false;
      }
    }, error => {
      context.foundClients = false;

    });
  }

  emitSelectedClient(client, idx) {
    if (!this.canSelect) //Se não for escolher, terminar logo a função
      return;

    this.selectedClientEmitter.emit({
      client: client,
      idx: idx
    });
  }

}
