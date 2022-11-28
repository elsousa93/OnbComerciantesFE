import { EventEmitter, Output, ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { QueryList } from '@angular/core';
import { ViewChildren } from '@angular/core';

import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService } from './data.service';
import { Router } from '@angular/router';
import { AutoHideSidenavAdjustBarraTopo } from '../animation';
import { LoggerService } from 'src/app/logger.service';
import { AuthService } from '../services/auth.service';
import { User } from '../userPermissions/user';


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
  public historySubscription: Subscription;

  public isActive: boolean;

  public startedEditing: boolean; //preciso de ter associado a página

  prevScrollpos: number = window.pageYOffset;

  public isHistory: boolean = false;


  constructor(private logger: LoggerService, private data: DataService, private route: Router) {
  }

  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);

    var prevScrollpos = window.pageYOffset;

    window.addEventListener("scroll", this.autohide.bind(this), false);

    this.logger.debug(this.map);

    this.historySubscription = this.data.historyStream$.subscribe((result) => {
      this.isHistory = result;
    });
  }

  setListItem(page: number) {
    if (page == this.currentPage) {
      return 'text-center text-lg-center text-center align-self-start mt-4'; //ativo -> atualizado
    } else {
      if (this.map.get(page)) {
        return 'text-center align-self-start align-self-center mt-5'; //se já foi visitado e foi concluido ->atualizado
      }
      if (this.map.get(page) == false) {
        return 'text-center align-self-start align-self-center mt-5'; // se foi visitado, mas n foi concluido
      }
      return 'text-center align-self-start align-self-center mt-5'; //ainda nao foi visitado -> atualizado
    }
  }

  //setI(page: number) {
  //  if (page == this.currentPage) {
  //    return 'fas fa-circle icone-menu-secundario';
  //  } else {
  //    if (this.map.get(page)) { //value do map (undefined, true ou false)
  //      return 'far fa-check-circle icone-menu-secundario'; // por a aparecer o certo 
  //    } else {
  //      if (this.map.get(page) == false) {
  //        return 'fas fa-exclamation-triangle icone-menu-secundario-incompleto'; //laranja
  //      }
  //      return 'far fa-circle icone-menu-secundario-inactivo';  //desativo
  //    }
  //  }
  //}

  setAnchor(page: number) {
    if (page == this.currentPage) {
      return 'active text-white texto-menu-secundario'; // página atual -> atualizado
    } else {
      if (this.map.get(page)) {
        return 'texto-menu-secundario text-success'; //pagina visitada e concluida -> atualizado
      }
      if (this.map.get(page) == false) {
        return 'texto-menu-secundario text-danger'; //pagina visitada e quando esta incompleta    -> deixo o inativo ou deixo o normal
      }
      return 'texto-menu-secundario-inativo text-success'; // ainda nao foi visitada -> atualizado
    }
  }

  setImage(page: number) {
    if (page == this.currentPage) 
    {
      return 'icone-menu-secundario'; //caso seja a página atual
    }
  }

  setImageSrc(page: number) {
    if (page == this.currentPage) {
      return 'assets/images/circle-solid.svg';
    } else {
      if (this.map.get(page)) {
        return 'assets/images/circle-check-regular.svg'; //caso já tenha sido visitado e foi concluido
      }
      if (this.map.get(page) == false) {
        return 'assets/images/triangle-exclamation-solid.svg'; //caso já tenha sido visitado mas ainda n foi concluido
      }
      return 'assets/images/circle-regular.svg'; //caso ainda n tenha sido visitado;
    }

  }

  onClick(e) {
    alert(this.item.name);
  }

  goToAppDevolucao() {
    if (this.currentPage > 0) {
      this.route.navigate(['/app-devolucao']);
    }
  }

  goToCliente() {
    if (this.currentPage > 1 || this.map.get(1) != undefined) {
      this.route.navigate(['client']);
    }
  }

  //Redirecionar para as páginas - contemplar sessão
  goToStakeholders() {
    if (this.currentPage > 2 || this.map.get(2) != undefined) {
      this.route.navigate(['stakeholders/']);
    }
  }

  goToStores() {
    if (this.currentPage > 3 || this.map.get(3) != undefined) {
      this.route.navigate(['store-comp']);
    }
    
  }

  goToComprovativos() {
    if (this.currentPage > 4 || this.map.get(4) != undefined) {
      this.route.navigate(['comprovativos']);
    }
  }

  goToInfoDeclarativa() {
    if (this.currentPage > 6 || this.map.get(6) != undefined) {
      this.route.navigate(['info-declarativa']);
    }
  }

  goToComercialOffer() {
    if (this.currentPage > 5 || this.map.get(5) != undefined) {
      this.route.navigate(['commercial-offert-list']);
    }
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

  ngOnDestroy(){
    this.historySubscription?.unsubscribe();
    this.data.updateData(false,0,0);
  }
}

