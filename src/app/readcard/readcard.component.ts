import { HttpClient } from '@angular/common/http';
import { Inject } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { HttpUtilService } from '../comprovativos/services/http.services';
import { Configuration, configurationToken } from '../configuration';
import { IReadCard } from './IReadCard.interface';

@Component({
  selector: 'app-readcard',
  templateUrl: './readcard.component.html'
})
export class ReadcardComponent implements OnInit {
  private baseUrl: string;

  API_URL:string = '';
  readcard:IReadCard[]= [];
  
  constructor(public http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private httpUtil: HttpUtilService) {
    this.baseUrl = configuration.baseUrl;
    this.API_URL = this.baseUrl;
   }

  ngOnInit(): void {
  }

  obterSelecionado(){
    this.http.get(this.API_URL + `CitizenCard`).subscribe(result => {
        if(result != null){
          this.readcard= Object.keys(result).map(function (key) { return result[key]; });
          
        }
      }, error => console.error("error"));
    
   
  }
}


