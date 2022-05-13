import { HttpClient } from '@angular/common/http';
import { Inject } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { HttpUtilService } from '../comprovativos/services/http.services';
import { IReadCard } from './IReadCard.interface';

@Component({
  selector: 'app-readcard',
  templateUrl: './readcard.component.html',
  styleUrls: ['./readcard.component.css']
})
export class ReadcardComponent implements OnInit {
  API_URL:string = '';
  readcard:IReadCard[]= [];
  
  constructor(public http: HttpClient, @Inject('BASE_URL') baseUrl: string, private httpUtil: HttpUtilService) {
    this.API_URL = baseUrl;
   }

  ngOnInit(): void {
  }

  obterSelecionado(){
    this.http.get(this.API_URL + `CitizenCard`).subscribe(result => {
        if(result != null){
          console.log(result);
          this.readcard= Object.keys(result).map(function (key) { return result[key]; });
          
        }
      }, error => console.error("error"));
    
   
  }
}


