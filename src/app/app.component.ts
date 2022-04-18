import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'app';
  constructor(public translate: TranslateService, private http: HttpClient) {
    translate.addLangs(['pt', 'en']);
    translate.setDefaultLang('pt');
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
  }
}


