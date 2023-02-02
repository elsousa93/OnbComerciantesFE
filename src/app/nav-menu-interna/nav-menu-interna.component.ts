import { EventEmitter, Output } from '@angular/core';
import { ViewChildren } from '@angular/core';
import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService } from './data.service';
import { Router } from '@angular/router';
import { AutoHideSidenavAdjustBarraTopo } from '../animation';
import { LoggerService } from 'src/app/logger.service';

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
    if (page == this.currentPage) {
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

  goToAppDevolucao() {
    if (this.currentPage > 0 || this.map.get(0) != undefined) {
      this.logger.info("Redirecting to Devolucao page");
      this.route.navigate(['/app-devolucao']);
    }
  }

  goToCliente() {
    if (this.currentPage > 1 || this.map.get(1) != undefined) {
      this.logger.info("Redirecting to Client page");
      this.route.navigate(['client']);
    }
  }

  //Redirecionar para as páginas - contemplar sessão
  goToStakeholders() {
    if (this.currentPage > 2 || this.map.get(2) != undefined) {
      this.logger.info("Redirecting to Stakeholders page");
      this.route.navigate(['stakeholders/']);
    }
  }

  goToStores() {
    if (this.currentPage > 3 || this.map.get(3) != undefined) {
      this.logger.info("Redirecting to Store comp page");
      this.route.navigate(['store-comp']);
    }
  }

  goToComprovativos() {
    if (this.currentPage > 4 || this.map.get(4) != undefined) {
      this.logger.info("Redirecting to Comprovativos page");
      this.route.navigate(['comprovativos']);
    }
  }

  goToInfoDeclarativa() {
    if (this.currentPage > 6 || this.map.get(6) != undefined) {
      this.logger.info("Redirecting to Info Declarativa page");
      this.route.navigate(['info-declarativa']);
    }
  }

  goToComercialOffer() {
    if (this.currentPage > 5 || this.map.get(5) != undefined) {
      this.logger.info("Redirecting to Commercial Offer List page");
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

  ngOnDestroy() {

  }
}
