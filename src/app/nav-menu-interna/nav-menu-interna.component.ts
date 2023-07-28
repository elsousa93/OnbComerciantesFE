import { EventEmitter, Output, ViewChild } from '@angular/core';
import { ViewChildren } from '@angular/core';
import { Component, Input, OnInit } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { DataService } from './data.service';
import { NavigationExtras, Router } from '@angular/router';
import { AutoHideSidenavAdjustBarraTopo } from '../animation';
import { LoggerService } from 'src/app/logger.service';
import { ProcessNumberService } from '../nav-menu-presencial/process-number.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { IStakeholders } from '../stakeholders/IStakeholders.interface';
import { StakeholderService } from '../stakeholders/stakeholder.service';
import { ClientService } from '../client/client.service';
import { Client } from '../client/Client.interface';
import { SubmissionDocumentService } from '../submission/document/submission-document.service';
import { StoreService } from '../store/store.service';

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
  @ViewChild('returnModal') returnModal;
  returnModalRef: BsModalRef | undefined;
  returned: string;
  submissionStakeholders: IStakeholders[] = [];
  merchantInfo: Client;

  constructor(private logger: LoggerService, private data: DataService, private route: Router, private processNrService: ProcessNumberService, private modalService: BsModalService, private stakeholderService: StakeholderService, private clientService: ClientService, private documentService: SubmissionDocumentService, private storeService: StoreService) {
  }

  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    this.returned = localStorage.getItem("returned");
    var prevScrollpos = window.pageYOffset;

    window.addEventListener("scroll", this.autohide.bind(this), false);

    this.historySubscription = this.data.historyStream$.subscribe((result) => {
      this.isHistory = result;
    });

    this.resizeObservable$ = fromEvent(window, "resize");
    this.resizeObservable$.subscribe(evt => {
      if (window.outerWidth > 1024) {
        this.isMinWidth = false;
      } else {
        this.isMinWidth = true;
      }
    });
  }

  setListItem(page: number) {
    if (window.outerWidth > 1024) {
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
    if (window.outerWidth > 1024) {
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
    if (window.outerWidth > 1024) {
      if (page == this.currentPage) {
        return 'icone-menu-secundario'; //caso seja a página atual
      }
    }
  }

  setImageSrc(page: number) {
    if (window.outerWidth > 1024) {
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
      } else if (queueName == 'history') {
        this.logger.info("Redirecting to History page");
        this.route.navigate(['/app-history/', processId]);
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

  openReturnPopup() {
    if (!this.isHistory) {
      if (this.returned == null) {
        var subPage = 0;
        this.data.currentSubPage.subscribe(page => subPage = page);
        if (subPage == 1 && this.currentPage == 1) {

        } else {
          this.returnModalRef = this.modalService.show(this.returnModal);
        }
      }
      if (this.returned == 'consult') {
        this.route.navigate(['app-consultas']);
      }
    } else {
      if (this.currentPage > 1 || this.map.get(1) != undefined) {
        this.logger.info("Redirecting to Client page");
        this.route.navigate(['clientbyid']);
      }
    }
  }

  closeReturnPopup() {
    this.returnModalRef?.hide();
  }

  goToCliente() {
    if (this.currentPage > 1 || this.map.get(1) != undefined) {
      this.returnModalRef?.hide();
      var length = 0;
      var context = this;
      context.stakeholderService.GetAllStakeholdersFromSubmission(localStorage.getItem("submissionId")).then(result => {
        context.logger.info("Get all stakeholders from submission result: " + JSON.stringify(result));
        var stakeholders = result.result;
        stakeholders.forEach(function (value, index) {
          context.stakeholderService.GetStakeholderFromSubmission(localStorage.getItem("submissionId"), value.id).then(res => {
            length++;
            context.logger.info("Get stakeholder from submission result: " + JSON.stringify(res));
            context.submissionStakeholders.push(res.result);
            if (stakeholders.length == length) {
              if (context.submissionStakeholders.length > 0) {
                context.submissionStakeholders.forEach(stake => {
                  context.stakeholderService.DeleteStakeholder(localStorage.getItem("submissionId"), stake.id).subscribe(result => {
                    context.logger.info("Deleted stakeholder result: " + JSON.stringify(result));
                  });
                });
              }
            }
          }, error => {
            context.logger.error(error);
          });
        });
      }, error => {
        context.logger.error(error);
      });

      this.storeService.getSubmissionShopsList(localStorage.getItem("submissionId")).then(result => {
        var shops = result.result;
        if (shops.length > 0) {
          shops.forEach(val => {
            context.storeService.deleteSubmissionShop(localStorage.getItem("submissionId"), val.id).subscribe(res => {
              context.logger.info("Deleted store result: " + JSON.stringify(res));
            });
          });
        }
      });

      this.documentService.GetSubmissionDocuments(localStorage.getItem("submissionId")).subscribe(docs => {
        if (docs.length > 0) {
          docs.forEach(val => {
            context.documentService.DeleteDocumentFromSubmission(localStorage.getItem("submissionId"), val.id).subscribe(res => {
              context.logger.info("Deleted document result: " + JSON.stringify(res));
            });
          });
        }
      });

      this.data.changeData(new Map().set(0, undefined)
        .set(1, undefined)
        .set(2, undefined)
        .set(3, undefined)
        .set(4, undefined)
        .set(5, undefined)
        .set(6, undefined));
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
