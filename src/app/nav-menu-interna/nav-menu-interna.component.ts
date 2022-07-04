import { ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { QueryList } from '@angular/core';
import { ViewChildren } from '@angular/core';

import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService } from './data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ColdObservable } from 'rxjs/internal/testing/ColdObservable';


@Component({
  selector: 'app-nav-menu-interna',
  templateUrl: './nav-menu-interna.component.html',
  styleUrls: ['./nav-menu-interna.component.css']
})
export class NavMenuInternaComponent implements OnInit {

  boss1: string;
  intervenientes: string;
  lojas: string;
  oferta: string;
  info: string;
  sub: any;
  name: any;

  @ViewChildren('myItem') item;

  //map para saber o estado que deve ser mostrado em cada uma das páginas (undefined -> se a página ainda não foi visitada)
  //(false -> se foi visitada, mas o seguimento da página não foi seguido, ou seja, os campos não foram todos preenchidos): ainda n está completo
  //(true -> se foi visitada e todos os campos necessários foram preenchidos): ainda não está completo porque ainda n se sabe quais os forms que serão usados
  public map: Map<number, boolean>;

  //o numero da pagina atual em que estamos
  public currentPage: number;

  //subscription para os valores do map e da currentPage que vêm do dataService
  public subscription: Subscription;

  public isActive: boolean;

  public startedEditing: boolean; //preciso de ter associado a página

  constructor(private data: DataService, private route: Router) {
  }

  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    console.log(this.map);
  }

  setListItem(page: number) {
    if (page == this.currentPage) {
      return 'text-center align-self-start text-xxl-center text-md-center';
    } else {
      if (this.map.get(page)) {
        return 'text-xxl-center text-lg-center text-md-center align-self-start';
      }
      if (this.map.get(page) == false) {
        return 'text-xxl-center text-lg-center text-md-center align-self-start align-self-xxl-center';
      }
      return 'text-center align-self-start align-self-xxl-center mt-xxl-3';
    }
  }

  setI(page: number) {
    if (page == this.currentPage) {
      return 'fas fa-circle icone-menu-secundario';
    } else {
      if (this.map.get(page)) { //value do map (undefined, true ou false)
        return 'far fa-check-circle icone-menu-secundario'; // por a aparecer o certo 
      } else {
        if (this.map.get(page) == false) {
          return 'fas fa-exclamation-triangle icone-menu-secundario-incompleto'; //laranja
        }
        return 'far fa-circle icone-menu-secundario-inactivo';  //desativo
      }
    }
  }

  setAnchor(page: number) {
    if (page == this.currentPage || this.map.get(page)) {
      return 'text-white texto-menu-secundario';
    } else {
      if (this.map.get(page) == false) {
        return 'texto-menu-secundario-incompleto text-danger';
      }
      return 'texto-menu-secundario text-success';
    }
  }

  onClick(e) {
    alert(this.item.name);
  }


//Redirecionar para as páginas - contemplar sessão
  goToStakeholders() {
    this.route.navigate(['stakeholders/']);
  }
  goToComprovativos() {
    this.route.navigate(['comprovativos']);
  }
  goToStores() {
    this.route.navigate(['store']);
  }
  goToInfoDeclarativa() {
    this.route.navigate(['info-declarativa']);
  }
  goToComercialOffer() {
    this.route.navigate(['app-commercial-offer-list']);
  }

  /*onClick(e :any) {
   
    console.log(e);
    if(e != null){
      //this.someInput.nativeElement.class = 'Whale!';
      switch (e) {
        case "COMERCIANTE":
          this.comerciante = 'fas fa-circle icone-menu-secundario';
          this.comprovativos = 'far fa-circle icone-menu-secundario-inactivo';
          this.intervenientes = 'far fa-circle icone-menu-secundario-inactivo';
          this.lojas = 'far fa-circle icone-menu-secundario-inactivo';
          this.oferta = 'far fa-circle icone-menu-secundario-inactivo';
          this.info = 'far fa-circle icone-menu-secundario-inactivo';
          break;
  
        case "COMPROVATIVOS":
          this.comerciante = 'far fa-circle icone-menu-secundario-inactivo';
          this.comprovativos = 'fas fa-circle icone-menu-secundario';
          this.intervenientes = 'far fa-circle icone-menu-secundario-inactivo';
          this.lojas = 'far fa-circle icone-menu-secundario-inactivo';
          this.oferta = 'far fa-circle icone-menu-secundario-inactivo';
          this.info = 'far fa-circle icone-menu-secundario-inactivo';
          break;
  
        case "INTERVENIENTES":
          this.comerciante = 'far fa-circle icone-menu-secundario-inactivo';
          this.comprovativos = 'far fa-circle icone-menu-secundario-inactivo';
          this.intervenientes = 'fas fa-circle icone-menu-secundario';
          this.lojas = 'far fa-circle icone-menu-secundario-inactivo';
          this.oferta = 'far fa-circle icone-menu-secundario-inactivo';
          this.info = 'far fa-circle icone-menu-secundario-inactivo';
          break;
  
        case "LOJAS":
          this.comerciante = 'far fa-circle icone-menu-secundario-inactivo';
          this.comprovativos = 'far fa-circle icone-menu-secundario-inactivo';
          this.intervenientes = 'far fa-circle icone-menu-secundario-inactivo';
          this.lojas = 'fas fa-circle icone-menu-secundario';
          this.oferta = 'far fa-circle icone-menu-secundario-inactivo';
          this.info = 'far fa-circle icone-menu-secundario-inactivo';
          break;
  
        case "OFERTA COMERCIAL":
          this.comerciante = 'far fa-circle icone-menu-secundario-inactivo';
          this.comprovativos = 'far fa-circle icone-menu-secundario-inactivo';
          this.intervenientes = 'far fa-circle icone-menu-secundario-inactivo';
          this.lojas = 'far fa-circle icone-menu-secundario-inactivo';
          this.oferta = 'fas fa-circle icone-menu-secundario';
          this.info = 'far fa-circle icone-menu-secundario-inactivo';
          break;
  
        case "INFO DECLARATIVA":
          this.comerciante = 'far fa-circle icone-menu-secundario-inactivo';
          this.comprovativos = 'far fa-circle icone-menu-secundario-inactivo';
          this.intervenientes = 'far fa-circle icone-menu-secundario-inactivo';
          this.lojas = 'far fa-circle icone-menu-secundario-inactivo';
          this.oferta = 'far fa-circle icone-menu-secundario-inactivo';
          this.info = 'fas fa-circle icone-menu-secundario';
          break;
  
      }
    }else{
        this.comerciante = 'fas fa-circle icone-menu-secundario';
        this.comprovativos = 'far fa-circle icone-menu-secundario-inactivo';
        this.intervenientes = 'far fa-circle icone-menu-secundario-inactivo';
        this.lojas = 'far fa-circle icone-menu-secundario-inactivo';
        this.oferta = 'far fa-circle icone-menu-secundario-inactivo';
        this.info = 'far fa-circle icone-menu-secundario-inactivo';
      

    }
  }
  */
}

