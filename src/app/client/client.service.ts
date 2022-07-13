import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Client } from './Client.interface';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  constructor(private router: ActivatedRoute,
    private http: HttpClient, @Inject('BASE_URL')
    private baseUrl: string, private route: Router) { }

  GetClientById(clientID: string): any {
    return this.http.get<Client>(this.baseUrl + 'submission/' + clientID + "/merchant");
  }

  EditClient(clientID: string, newClient: Client) {
    return this.http.put<Client>(this.baseUrl + 'submission/' + clientID + "/merchant", newClient);
  }
}
