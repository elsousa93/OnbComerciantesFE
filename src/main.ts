import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { Configuration, configurationToken } from 'src/app/configuration';


//Para local dev: 'https://localhost:7270/';
//Para dev SIBS: 'http://localhost:12000/BackendPortal/';


let path = environment.production ? './assets/config/config.prod.json' : './assets/config/config.json';


fetch(path)
  .then(file => file.json())
  .then((config : Configuration) => {
    if (environment.production){
      enableProdMode();
    }
    return platformBrowserDynamic([
      { provide: configurationToken, useValue: config },
  ]).bootstrapModule(AppModule);
  }).catch(err => console.log(err));

