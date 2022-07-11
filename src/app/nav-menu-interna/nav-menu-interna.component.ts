import { EventEmitter, Output, ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { QueryList } from '@angular/core';
import { ViewChildren } from '@angular/core';

import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService } from './data.service';
import { Router } from '@angular/router';
import { AutoHideSidenavAdjustBarraTopo } from '../animation';


@Component({
  selector: 'app-nav-menu-interna',
  templateUrl: './nav-menu-interna.component.html',
  styleUrls: ['./nav-menu-interna.component.css'],
  animations: [AutoHideSidenavAdjustBarraTopo]
})
export class NavMenuInternaComponent implements OnInit {
  boss1: string;
  intervenientes: string;
  lojas: string;
  oferta: string;
  info: string;
  sub: any;
  name: any;

  @Input() isAutohideBarra: boolean = false;
  @Output() autoHide = new EventEmitter<boolean>();

  @ViewChildren('myItem') item;
  public map: Map<number, boolean>;

  //o numero da pagina atual em que estamos
  public currentPage: number;

  //subscription para os valores do map e da currentPage que vêm do dataService
  public subscription: Subscription;

  public isActive: boolean;

  public startedEditing: boolean; //preciso de ter associado a página

  prevScrollpos:number = window.pageYOffset;

  constructor(private data: DataService, private route: Router) {
  }

  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);

    var prevScrollpos = window.pageYOffset;
    
    window.addEventListener("scroll", this.autohide.bind(this), false);

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


  public autohide() {
    var currentScrollPos = window.pageYOffset;
    if (this.prevScrollpos > currentScrollPos) {
      this.autoHide.emit(false);
      this.isAutohideBarra = false;
    } else {
      this.autoHide.emit(true);
      this.isAutohideBarra = true;
    }
    this.prevScrollpos = currentScrollPos;
  }
}

