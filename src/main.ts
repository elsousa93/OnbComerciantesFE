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

window.addEventListener('unload', function () {
  console.log("deu unload");
});

function addLeadingZero(event) {

  // get maxlength attr
  const maxLength = parseInt(event.target.getAttribute("maxlength"))
  // check and flag if negative
  const isNegative = parseInt(event.target.value) < 0
  // "0".repeat(maxLength) <-- create default pad with maxlength given
  // Math.abs(event.target.value) to make sure we proceed with positive value
  // append zero and slice last of attr maxlength value
  let newValue = ("0".repeat(maxLength) + Math.abs(event.target.value).toString()).slice(-maxLength);
  // add - if flag negative is true
  if (isNegative) {
    newValue = "-" + newValue
  }
  // change the value of input
  event.target.value = newValue
}

