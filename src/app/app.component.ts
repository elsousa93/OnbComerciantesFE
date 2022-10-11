import { MediaMatcher } from '@angular/cdk/layout';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { CRCService } from './CRC/crcservice.service';
import { AuthService } from './services/auth.service';
import { translationLanguages } from './translationLanguages';
import { LoggerService } from 'src/app/logger.service';
import { TableInfoService } from './table-info/table-info.service';
import { HttpMethod } from './enums/enum-data';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})

export class AppComponent {

  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  pageName: string = 'Teste';
  title = 'app';

  isToggle: boolean = false;
  isAutoHide: boolean = false;

  hasAuthenticated: boolean = true;
  wantsLogin: boolean = false;


  translationLanguages = translationLanguages;

    constructor(private logger: LoggerService, public translate: TranslateService, private http: HttpClient, private cookie: CookieService, private router: Router,
    changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, crcService: CRCService, private authService: AuthService, private tableInfo: TableInfoService) {
    tableInfo.GetAddressByZipCodeTeste(2830, 105).then(success => {
      console.log("sucesso: ", success);
    }, error => {
      console.log("error: ", error);
    });

    //ir buscar as linguagens disponiveis. para adicionar uma nova linguagem basta adicionar à lista que se encontra no 'translationLanguages.ts'
    let langs = this.translationLanguages.map(val => {
      return val.abbreviation;
    });
    translate.addLangs(langs);
    translate.setDefaultLang('pt');
    this.tableInfo.languageStream$.next('pt');
    this.mobileQuery = media.matchMedia('(max-width: 850px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    
    crcService.getAccessToken().then(result => {
      this.logger.debug("gerou!!");
      localStorage.setItem("accessToken", result.access_token);
    });

    authService.hasAuthenticated.subscribe(auth => {
      this.hasAuthenticated = auth;
    });

  }

  @Input() url: string;

  ngOnInit() {
    var context = this;
    window.addEventListener('beforeunload', function () {
      context.saveAuthState();
    });

    this.router.events.subscribe((event) => {
      if (!(event instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0)
    });
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
  }

  setCookie() {
    this.cookie.set("jwToken", "TokenExemplo")
  }

  updateNavBar(pageNameInput: string){
    this.pageName = pageNameInput;
  }

  toggleSideNav(toggled: boolean) {
    this.isToggle = toggled;
  }

  toggleAutoHide(toggled: boolean) {
    this.isAutoHide = toggled;
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  refresh(): void {
    console.log("a guardar: ", this.authService.GetCurrentUser());
    localStorage.setItem("auth", JSON.stringify(this.authService.GetCurrentUser()));
      window.location.reload();
  }

  saveAuthState() {
    localStorage.setItem("auth", JSON.stringify(this.authService.GetCurrentUser()));
  }

}
