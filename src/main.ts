import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

export function getBaseUrl() {
  var baseUrl = 'http://localhost:12000/BackendPortal/'
  return baseUrl;
}

export function getPostmanUrl() {
  var postmanUrl = 'https://7929bf0d-1abd-4943-878b-1859269bc442.mock.pstmn.io/';
  return postmanUrl;
}

const providers = [
  { provide: 'BASE_URL', useFactory: getBaseUrl, deps: [] },
  { provide: 'POSTMAN_URL', useFactory: getPostmanUrl, deps: [] }
];

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic(providers).bootstrapModule(AppModule)
  .catch(err => console.log(err));
