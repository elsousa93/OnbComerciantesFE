import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  pageName: string = 'Teste';
  title = 'app';
  constructor(public translate: TranslateService, private http: HttpClient, private cookie: CookieService, private router: Router) {
    translate.addLangs(['pt', 'en']);
    translate.setDefaultLang('pt');
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
}
