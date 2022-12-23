import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Configuration } from './configuration';

@Injectable()
export class AppConfigService {
  private appConfig: Configuration;

  constructor(private http: HttpClient) { }

  loadAppConfig() {
    let path = environment.production ? './assets/config/config.prod.json' : './assets/config/config.json';
    return this.http.get<Configuration>(path)
      .toPromise()
      .then(data => {
        this.appConfig = data;
      });
  }

  getConfig() {
    return this.appConfig;
  }
}
