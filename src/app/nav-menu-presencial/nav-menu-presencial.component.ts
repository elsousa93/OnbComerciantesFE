import { Component, HostBinding, OnInit } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from 'src/app/logger.service';
import { Subscription } from 'rxjs';
import { AutoHideLogo } from '../animation';
import { DataService } from '../nav-menu-interna/data.service';
import { AuthService } from '../services/auth.service';
import { TranslationLanguage, translationLanguages } from '../translationLanguages';
import { User } from '../userPermissions/user';
import { ProcessNumberService } from './process-number.service';
import { progressSteps } from './progressSteps';
import { MenuPermissions, UserPermissions, getMenuPermissions } from '../userPermissions/user-permissions';
import { TableInfoService } from '../table-info/table-info.service';
import { Location } from '@angular/common';
import { ProcessService } from '../process/process.service';
import { Bank } from '../store/IStore.interface';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-nav-menu-presencial',
  templateUrl: './nav-menu-presencial.component.html',
  styleUrls: ['./nav-menu-presencial.component.css'],
  animations: [AutoHideLogo]
})
export class NavMenuPresencialComponent implements OnInit {

  //Procura de processo
  processNumberToSearch: string;

  @Output() toggleNavEvent = new EventEmitter<boolean>();
  @Output() autoHide = new EventEmitter<boolean>();

  isToggle: boolean = true;
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
  processNumber: string;
  subscription: Subscription;
  returned: string = "";
  currentPage: number = 0;
  currentSubPage: number = 0;
  progressImage: string;
  encodedCode: string;
  currentUser: User = {};
  translationLanguages = translationLanguages;
  currentLanguage: TranslationLanguage;
  userPermissions: MenuPermissions;

  banks: Bank[];
  bank: string;

  constructor(private route: Router, private snackBar: MatSnackBar, private processNrService: ProcessNumberService, private processService: ProcessService, private dataService: DataService, private authService: AuthService, public _location: Location, private logger: LoggerService, public translate: TranslateService, private tableInfo: TableInfoService) {
    authService.currentUser.subscribe(user => this.currentUser = user);
    this.progressImage = undefined;
    this.processNumber = null;
    this.processNrService.changeProcessNumber(localStorage.getItem("processNumber"));
    this.translate.use(this.translate.getDefaultLang()); //definir a linguagem para que o select venha com um valor predefinido
    this.chooseLanguage(this.translate.getDefaultLang());
  }

  ngOnInit(): void {
    this.dataService.changeData(new Map());
    this.dataService.updateData(null, null, null);

    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      var a = UserPermissions[this.currentUser.permissions];
      this.logger.info("User permissions: " + this.currentUser.permissions);
      this.userPermissions = getMenuPermissions(a);
    });

    this.tableInfo.GetBanks().subscribe(result => {
      this.banks = result;
      if (this.banks !== undefined) {
        var index = this.banks.findIndex(b => b.code == this.currentUser.bankName);
        if (index >= 0) {
          this.bank = this.banks[index].description;
        }
      }
    });

    this.subscription = this.processNrService.processNumber.subscribe(processNumber => this.processNumber = processNumber);

    this.dataService.currentPage.subscribe((currentPage) => {
      this.currentPage = currentPage;
      if (this.currentPage != 0 && this.currentPage != null) {
        this.isToggle = false;
        this.toggleNavEvent.emit(this.isToggle);
      } else if (this.currentPage == 0 || this.currentPage == null) {
        this.isToggle = true;
        this.toggleNavEvent.emit(this.isToggle);
      }
      this.updateProgress();
    });
    this.dataService.currentSubPage.subscribe((currentSubPage) => {
      this.currentSubPage = currentSubPage;
      if (this.currentSubPage != 0 && this.currentPage != null) {
        this.isToggle = false;
        this.toggleNavEvent.emit(this.isToggle);
      } else if (this.currentSubPage == 0 || this.currentSubPage == null) {
        this.isToggle = true;
        this.toggleNavEvent.emit(this.isToggle);
      }
      this.updateProgress();
    });

    var prevScrollpos = window.pageYOffset;

    window.addEventListener("scroll", this.autohide.bind(this), false);
  }

  openProcess() {
    if (this.processNumberToSearch !== "") {
      this.encodedCode = encodeURIComponent(this.processNumberToSearch);
      this.searchProcess(this.processNumberToSearch);
    }
  }

  updateProgress() {
    if (localStorage.getItem("returned") != null) {
      this.returned = localStorage.getItem("returned");
      this.currentPage = 0;
      this.currentSubPage = 0;
      this.processNumber = localStorage.getItem("processNumber");
    } else {
      this.returned = "";
    }
    if (this.currentPage == 0 || this.currentSubPage == 0 || this.currentPage == null) {
      this.progressImage = undefined;
      return;
    } else {
      let progress = progressSteps[this.currentPage - 1][this.currentSubPage - 1];
      this.progressImage = "assets/images/progress_bar/progress_bar_" + progress + ".svg"
      this.logger.info("New progress image" + this.progressImage);
    }
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

  searchProcess(process) {
    this.processService.searchProcessByNumber(this.encodedCode, 0, 1).subscribe(resul => {
      this.logger.info("Search process result:" + resul);
      if (resul.items.length != 0) {
        localStorage.setItem("processNumber", process);
        this.processNrService.changeProcessNumber(process);
        localStorage.setItem("returned", 'consult');
        this.logger.info("Redirecting to Client by id page");
        this.route.navigate(['/clientbyid', this.encodedCode]);
      } else {
        let navigationExtras: NavigationExtras = {
          state: {
            processNumber: this.encodedCode,
          }
        };
        this.processNumberToSearch = ''; // to clean processNr
        this.logger.info("Redirecting to App Consultas page");
        this.route.navigate(['/app-consultas'], navigationExtras);
      }
    }, error => {
      this.logger.error(error, "", "Error while searching for process");
    });
  }

  changeLanguage(language) {
    this.translate.use(language);
    this.getLanguageInfo(language);
    this.tableInfo.languageStream$.next(language);
    this.logger.info("Redirecting to Dashboard page");
    this.route.navigate(['/']);
    let currentRoute = this.route.url;
    let currentState = this.route.getCurrentNavigation()?.extras.state;

    if (currentRoute === '/') {
      this.route.navigate(["dashboard"], language);
    }
  }

  chooseLanguage(language) {
    this.translate.use(language);
    this.getLanguageInfo(language);
    this.tableInfo.languageStream$.next(language);
  }


  getLanguageInfo(language: string) {
    this.translationLanguages.forEach(value => {
      if (language == value.abbreviation) {
        this.currentLanguage = value;
      }
    });
  }

  logout() {
    localStorage.removeItem('auth');
    this.authService.reset();
    this.snackBar.open(this.translate.instant('generalKeywords.logout'), '', {
      duration: 4000,
      panelClass: ['snack-bar']
    });
  }

  login() {
    this.authService.reset();
    this.logout();
  }
}
