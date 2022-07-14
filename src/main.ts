import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

//Para local dev: 'https://localhost:7270/';
//Para dev SIBS: 'http://localhost:12000/BackendPortal/';

export function getBaseUrl() {
  //var baseUrl = 'http://localhost:12000/BackendPortal/';
  var baseUrl = 'http://localhost:12000/AcquiringAPI/api/';
  return baseUrl;
}

export function getDOCASUrl() {
  var DOCASUrl = 'http://localhost:11000/api/';
  return DOCASUrl;
}

export function getPostmanUrl() {
  var postmanUrl = 'https://7929bf0d-1abd-4943-878b-1859269bc442.mock.pstmn.io/';
  return postmanUrl;
}

const providers = [
  { provide: 'BASE_URL', useFactory: getBaseUrl, deps: [] },
  { provide: 'DOCAS_URL', useFactory: getDOCASUrl, deps: [] },
  { provide: 'POSTMAN_URL', useFactory: getPostmanUrl, deps: [] }
];

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic(providers).bootstrapModule(AppModule)
  .catch(err => console.log(err));
