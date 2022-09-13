import { Component, HostBinding, OnInit } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { LangChangeEvent, TranslateService, TranslateModule } from '@ngx-translate/core';
import { LoggerService } from 'src/app/logger.service';
import { Subscription } from 'rxjs';
import { AutoHideClientBarAdjust, AutoHideNavbarAdjust, AutoHideLogo } from '../animation';
import { DataService } from '../nav-menu-interna/data.service';
import { AuthService } from '../services/auth.service';
import { TranslationLanguage, translationLanguages } from '../translationLanguages';
import { User } from '../userPermissions/user';
import { ProcessNumberService } from './process-number.service';
import { progressSteps } from './progressSteps';
import { MenuPermissions, UserPermissions, getMenuPermissions } from '../userPermissions/user-permissions';
import { TableInfoService } from '../table-info/table-info.service';
import { Location } from '@angular/common';


@Component({
  selector: 'app-nav-menu-presencial',
  templateUrl: './nav-menu-presencial.component.html',
  styleUrls: ['./nav-menu-presencial.component.css'],
  animations: [AutoHideClientBarAdjust, AutoHideNavbarAdjust, AutoHideLogo]
})
export class NavMenuPresencialComponent implements OnInit {

  //Procura de processo
  processNumberToSearch: string;
  /////////////////////

  @Output() toggleNavEvent = new EventEmitter<boolean>();
  @Output() autoHide = new EventEmitter<boolean>();
  

  isToggle: boolean = false;
  isAutohide: boolean = false;

  // progress bar behaviour
  isClientFirstPage: boolean = false;
  isClientSecondPage: boolean = false;
  isClientThirdPage: boolean = false;
  isStakeholderFirstPage: boolean = false;
  isStakeholderSecondPage: boolean = false;
  isComprovativos: boolean = false;
  isInfoDeclarativaClient: boolean = false;
  isInfoDeclarativaStakeholder: boolean = false;
  isInfoDeclarativaAssinaturaPack: boolean = false;


  @HostBinding('style.--navPosition') public navPosition: string = '0';

  prevScrollpos: number = window.pageYOffset;

  processNumber: string = "";
  subscription: Subscription;

  currentPage:number = 0;
  currentSubPage:number = 0;
  progressImage: string;

  currentUser: User = {};

  translationLanguages = translationLanguages;
  currentLanguage: TranslationLanguage;

  userType: string = "Banca";
  userPermissions: MenuPermissions;

  constructor(private route: Router, private processNrService: ProcessNumberService, private dataService: DataService, private authService: AuthService, public _location: Location, private logger: LoggerService, public translate: TranslateService, private tableInfo: TableInfoService) {
    authService.currentUser.subscribe(user => this.currentUser = user);
    this.processNrService.changeProcessNumber(localStorage.getItem("processNumber"));
    this.translate.use(this.translate.getDefaultLang()); //definir a linguagem para que o select venha com um valor predefinido
    this.changeLanguage(this.translate.getDefaultLang());
  }

  ngOnInit(): void {

    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      var a = UserPermissions[this.currentUser.permissions];

      this.logger.debug("permissões: " + this.currentUser.permissions);
      this.logger.debug("userPermission tratada: " + a);

      this.userPermissions = getMenuPermissions(a);

    });
    this.subscription = this.processNrService.processNumber.subscribe(processNumber => this.processNumber = processNumber);
    this.dataService.currentPage.subscribe((currentPage) => {
      this.currentPage = currentPage;
      this.updateProgress();
    });
    this.dataService.currentSubPage.subscribe((currentSubPage) => {
      this.currentSubPage = currentSubPage
      this.updateProgress();
    });

    setTimeout(this.toggleEvent.bind(this), 800);

    //this.navPosition = '0';
    var prevScrollpos = window.pageYOffset;
    
    window.addEventListener("scroll", this.autohide.bind(this), false);

    //this.navPosition = '0';
    //this.autohide();
    
  }

  openProcess(process) {
    this.logger.debug("Opening process: " + process);
    var encodedCode = encodeURIComponent(process);
    localStorage.setItem("processNumber", process);
    this.processNrService.changeProcessNumber(process);
    localStorage.setItem("returned", 'consult');

    this.route.navigate(['/app-devolucao/', encodedCode]);
    //this.submissionService.GetSubmissionByProcessNumber(localStorage.getItem("processNumber")).subscribe(result => {
    //  this.logger.debug('Submissão retornada quando pesquisada pelo número de processo', result);
    //  this.submissionService.GetSubmissionByID(result[0].submissionId).subscribe(resul => {
    //    this.logger.debug('Submissão com detalhes mais especificos ', resul);
    //    this.clientService.GetClientById(resul.id).subscribe(res => {
    //      this.route.navigate(['/client']);
    //    });
    //  });
    //});

  }

  updateProgress(){
    if (this.currentPage == 0 || this.currentSubPage == 0){
      this.progressImage = undefined;
      return;
    }
    let progress = progressSteps[this.currentPage-1][this.currentSubPage-1];
    this.progressImage = "assets/images/progress_bar/progress_bar_" + progress + ".svg"
    this.logger.debug("New process image" + this.progressImage);
  }

  toggleEvent() {
    this.isToggle = !this.isToggle;
    this.toggleNavEvent.emit(this.isToggle);
  }

  public autohide() {
    var currentScrollPos = window.pageYOffset;
    if (this.prevScrollpos > currentScrollPos) {
      this.autoHide.emit(false);
      this.isAutohide = false;
    } else {
      this.autoHide.emit(true);
      this.isAutohide = true;
    }
    this.prevScrollpos = currentScrollPos;
  }

  searchProcess() {
    this.logger.debug("Searching process " + this.processNumberToSearch);
    this.route.navigate(['/app-consultas/', this.processNumberToSearch]);
  }

  changeLanguage(language) {
    this.translate.use(language);
    this.getLanguageInfo(language);
    this.tableInfo.languageStream$.next(language);
    let currentRoute = [this.route.url];
    let currentState = this.route.getCurrentNavigation()?.extras.state;
    this.route.navigate(['/'], {skipLocationChange: true}).then(() => {
      this.route.navigate(currentRoute, {queryParamsHandling: "preserve", skipLocationChange: true, state: currentState});
    });

    // this.route.navigateByUrl("/", { skipLocationChange: true }).then(() => {
    //   console.log(decodeURI(this._location.path()));
    //   this.route.navigate([decodeURI(this._location.path())]);
    //   });
  }

  getLanguageInfo(language: string) {
    this.translationLanguages.forEach(value => {
      if (language == value.abbreviation) {
        this.currentLanguage = value;
      }
    });
  }

  testeAuth() {
    console.log(this.currentUser);
    console.log(this.userPermissions);
  }

  logout() {
    localStorage.removeItem('auth');
    this.authService.reset();
  }

  login() {
    this.authService.reset();

    console.log("currentUser: ", this.authService.GetCurrentUser());

    this.logout();
  }
}
