import { MediaMatcher } from '@angular/cdk/layout';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {

  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  pageName: string = 'Teste';
  title = 'app';

  isToggle: boolean = true;

  constructor(public translate: TranslateService, private http: HttpClient, private cookie: CookieService, private router: Router,
    changeDetectorRef: ChangeDetectorRef, media: MediaMatcher  ) {
    translate.addLangs(['pt', 'en']);
    translate.setDefaultLang('pt');
    this.mobileQuery = media.matchMedia('(max-width: 850px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit() {
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
    console.log(this.pageName);
  }

  toggleSideNav(toggled: boolean) {
    this.isToggle = toggled;
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }
}
