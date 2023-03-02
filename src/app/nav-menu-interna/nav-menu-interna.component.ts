import { EventEmitter, Output } from '@angular/core';
import { ViewChildren } from '@angular/core';
import { Component, Input, OnInit } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { DataService } from './data.service';
import { NavigationExtras, Router } from '@angular/router';
import { AutoHideSidenavAdjustBarraTopo } from '../animation';
import { LoggerService } from 'src/app/logger.service';
import { ProcessNumberService } from '../nav-menu-presencial/process-number.service';

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
  wnd: any = window;
  resizeObservable$;
  isMinWidth: boolean;

  constructor(private logger: LoggerService, private data: DataService, private route: Router, private processNrService: ProcessNumberService) {
  }

  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);

    var prevScrollpos = window.pageYOffset;

    window.addEventListener("scroll", this.autohide.bind(this), false);

    this.historySubscription = this.data.historyStream$.subscribe((result) => {
      this.isHistory = result;
    });

    this.resizeObservable$ = fromEvent(window, "resize");
    this.resizeObservable$.subscribe(evt => {
      if (window.outerWidth > 768) {
        this.isMinWidth = false;
      } else {
        this.isMinWidth = true;
      }
    });
  }

  setListItem(page: number) {
    if (window.outerWidth > 768) {
      this.isMinWidth = false;
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
    } else {
      this.isMinWidth = true;
      if (page == this.currentPage) {
        return 'text-center text-lg-center text-center align-self-start';
      } else {
        return 'text-center align-self-start align-self-center';
      }
    }
  }

  setAnchor(page: number) {
    if (window.outerWidth > 768) {
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
    } else {
        return 'invisible';
    }
  }

  setImage(page: number) {
    if (window.outerWidth > 768) {
      if (page == this.currentPage) {
        return 'icone-menu-secundario'; //caso seja a página atual
      }
    }
  }

  setImageSrc(page: number) {
    if (window.outerWidth > 768) {
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
    } else {
      return this.getResponsiveImg(page);
    }
  }

  getResponsiveImg(page: number) {
    if (page == 0) { //Histórico
      if (this.currentPage == page) {
        return 'assets/images/published_with_changes.svg';
      } else {
        if (this.map.get(page)) {
          return 'assets/images/published_with_changes_blue.svg';
        }
        if (this.map.get(page) == false) {
          return 'assets/images/published_with_changes_error.svg';
        }
        return 'assets/images/published_with_changes_responsive.svg';
      }
    }
    if (page == 1) { //Cliente
      if (this.currentPage == page) {
        return 'assets/images/group_add_blue_white.svg'
      } else {
        if (this.map.get(page)) {
          return 'assets/images/group_add_blue.svg';
        }
        if (this.map.get(page) == false) {
          return 'assets/images/group_add_blue_error.svg';
        }
        return 'assets/images/group_add_blue_responsive.svg';
      }
    }
    if (page == 2) { //Stakeholders
      if (this.currentPage == page) {
        return 'assets/images/groups_3_white.svg';
      } else {
        if (this.map.get(page)) {
          return 'assets/images/groups_3.svg';
        }
        if (this.map.get(page) == false) {
          return 'assets/images/groups_3_error.svg';
        }
        return 'assets/images/groups_3_responsive.svg';
      }
    }
    if (page == 3) { //Lojas
      if (this.currentPage == page) {
        return 'assets/images/storefront_white.svg';
      } else {
        if (this.map.get(page)) {
          return 'assets/images/storefront.svg';
        }
        if (this.map.get(page) == false) {
          return 'assets/images/storefront_error.svg';
        }
        return 'assets/images/storefront_responsive.svg';
      }
    }
    if (page == 4) { //Comprovativos
      if (this.currentPage == page) {
        return 'assets/images/attach_file_white.svg';
      } else {
        if (this.map.get(page)) {
          return 'assets/images/attach_file.svg';
        }
        if (this.map.get(page) == false) {
          return 'assets/images/attach_file_error.svg';
        }
        return 'assets/images/attach_file_responsive.svg';
      }
    }
    if (page == 5) { //Oferta Comercial
      if (this.currentPage == page) {
        return 'assets/images/shopping_cart_white.svg';
      } else {
        if (this.map.get(page)) {
          return 'assets/images/shopping_cart.svg';
        }
        if (this.map.get(page) == false) {
          return 'assets/images/shopping_cart_error.svg';
        }
        return 'assets/images/shopping_cart_responsive.svg';
      }
    }
    if (page == 6) { //Info Declarativa
      if (this.currentPage == page) {
        return 'assets/images/manage_accounts_white.svg';
      } else {
        if (this.map.get(page)) {
          return 'assets/images/manage_accounts_responsive.svg';
        }
        if (this.map.get(page) == false) {
          return 'assets/images/manage_accounts_error.svg';
        }
        return 'assets/images/manage_accounts_responsive.svg';
      }
    }
  }

  goToAppDevolucao() {
    if (this.currentPage > 0 || this.map.get(0) != undefined) {
      var queueName = "";
      var processId = "";
      this.processNrService.queueName.subscribe(name => queueName = name);
      this.processNrService.processId.subscribe(id => processId = id);
      if (queueName == 'devolucao') {
        this.logger.info('Redirecting to Devolucao page');
        this.route.navigate(['/app-devolucao/', processId]);
      } else if (queueName == 'aceitacao') {
        this.logger.info("Redirecting to Aceitacao page");
        this.route.navigate(['/app-aceitacao/', processId]);
      } else {
        let navigationExtras: NavigationExtras = {
          state: {
            queueName: queueName,
            processId: processId
          }
        };
        this.logger.info('Redirecting to Queues Detail page');
        this.route.navigate(["/queues-detail"], navigationExtras);
      }
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
