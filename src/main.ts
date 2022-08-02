import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { Configuration, configurationToken } from 'src/app/configuration'


//Para local dev: 'https://localhost:7270/';
//Para dev SIBS: 'http://localhost:12000/BackendPortal/';

export function getBaseUrl() {
 // var baseUrl = 'http://localhost:12000/BackendPortal/';
  var baseUrl = 'http://localhost:12000/AcquiringAPI/api/';
  return baseUrl;
}
export function getNeyondBackend() {
  var neyondBackUrl = 'http://localhost:12000/BackendPortal/';
  return neyondBackUrl;
}

export function getDOCASUrl() {
  var DOCASUrl = 'http://localhost:11000/api/';
  return DOCASUrl;
}

export function getPostmanUrl() {
  var postmanUrl = 'https://7929bf0d-1abd-4943-878b-1859269bc442.mock.pstmn.io/';
  return postmanUrl;
}

export function getAcquiringAPIUrl() {
  var acquiringAPIUrl = 'http://localhost:12000/AcquiringAPI/api/';
  return acquiringAPIUrl;
}


fetch('/assets/config/config.json')
  .then(file => file.json())
  .then((config : Configuration) => {
    if (config.production){
      enableProdMode();
    }
    return platformBrowserDynamic([
      { provide: configurationToken, useValue: config },
  ]).bootstrapModule(AppModule);
  }).catch(err => console.log(err));

