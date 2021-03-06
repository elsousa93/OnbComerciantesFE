import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Renderer2 } from '@angular/core';
import { Component, Inject, Input, OnInit, VERSION, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription, take } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { Client } from '../client/Client.interface';
import { DataService } from '../nav-menu-interna/data.service';


@Component({
  selector: 'app-devolucao',
  templateUrl: './devolucao.component.html'
})

export class DevolucaoComponent implements OnInit{
  form: FormGroup;

  public map = new Map();
  public currentPage: number;
  public subscription: Subscription;

  
  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string,
  private route: Router, private data: DataService,
  private router: ActivatedRoute) {

    this.ngOnInit();
    this.updateData(false, 1);
  
}

ngOnInit(): void {
  this.subscription = this.data.currentData.subscribe(map => this.map = map);
  this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);

  var context = this;
}

//função que altera o valor do map e da currentPage
updateData(value: boolean, currentPage: number) {
  this.map.set(currentPage, value);
  this.data.changeData(this.map);
  this.data.changeCurrentPage(currentPage);
}

}