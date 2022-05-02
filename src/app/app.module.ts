import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { UploadService } from './comprovativos/services/upload.services';
import { HttpUtilService } from './comprovativos/services/http.services';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { HomeComponent } from './home/home.component';
import { ComprovativosComponent } from './comprovativos/comprovativos.component';
import { CounterComponent } from './counter/counter.component';
import { FetchDataComponent } from './fetch-data/fetch-data.component';
import { ClientComponent } from './client/client.component';
import { DropDownComponent } from './drop-down/drop-down.component';
import { StakeholdersComponent } from './stakeholders/stakeholders.component';
import { NewStakeholderComponent } from './stakeholders/new-stakeholder/new-stakeholder.component';
import { CheckDocumentsComponent } from './comprovativos/check-documents/check-documents.component';
import { StoreIbanComponent } from './store/store-iban/store-iban.component';
import { StoreComponent } from './store/store-list/store-list.component';
import { AddStoreComponent } from './store/add-store/add-store.component';
import { CommercialOfferListComponent } from './commercial-offer/commercial-offer-list/commercial-offer-list.component';
import { CommercialOfferDetailComponent } from './commercial-offer/commercial-offer-detail/commercial-offer-detail.component';
import { CommercialOfferStoreListComponent } from './commercial-offer/commercial-offer-store-list/commercial-offer-store-list.component';
import { CommercialOfferTerminalConfigComponent } from './commercial-offer/commercial-offer-terminal-config/commercial-offer-terminal-config.component';
import { CommercialOfferPricingComponent } from './commercial-offer/commercial-offer-pricing/commercial-offer-pricing.component';
import { InfoDeclarativaComponent } from './client/info-declarativa/info-declarativa.component';
import { InfoDeclarativaStakeholderComponent } from './stakeholders/info-declarativa-stakeholder/info-declarativa-stakeholder.component';


export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient);
}

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    CounterComponent,
    FetchDataComponent,
    StoreComponent,
    ClientComponent,
    AddStoreComponent,
    DropDownComponent,
    StakeholdersComponent,
    NewStakeholderComponent,
    ComprovativosComponent,
    CheckDocumentsComponent,
    CommercialOfferListComponent,
    CommercialOfferDetailComponent,
    CommercialOfferStoreListComponent,
    CommercialOfferTerminalConfigComponent,
    CommercialOfferPricingComponent,
    StoreIbanComponent,
    InfoDeclarativaComponent,
    InfoDeclarativaStakeholderComponent,

   
  ],
  imports: [
    BrowserModule,
    CommonModule,
    ModalModule.forRoot(),
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot([
      { path: '', component: HomeComponent, pathMatch: 'full' },
      { path: 'counter', component: CounterComponent },
      { path: 'fetch-data', component: FetchDataComponent },
      { path: 'client', component: ClientComponent },
      { path: 'client/:id', component: ClientComponent }, 
      { path: 'client/:newClientNr', component: ClientComponent },
      { path: 'drop-down', component: DropDownComponent },
      { path: 'stakeholders', component: StakeholdersComponent },
      { path: 'stakeholders/:nif', component: StakeholdersComponent },
      { path: 'add-stakeholder', component: NewStakeholderComponent },
      { path: 'add-stakeholder/:stakenif', component: NewStakeholderComponent },
      { path: 'comprovativos', component: ComprovativosComponent },
      { path: 'app-comprovativos/:id', component: ComprovativosComponent },
      { path: 'store-comp', component: StoreComponent },
      { path: 'add-store/:stroreid', component: AddStoreComponent },
      { path: 'add-store-iban/:stroreid', component: StoreIbanComponent },
      { path: 'commercial-offert-list', component: CommercialOfferListComponent },
      { path: 'commercial-offert-detail/:stroreid/:commofid', component: CommercialOfferDetailComponent },
      { path: 'commercial-offert-store-list/:stroreid', component: CommercialOfferStoreListComponent },
      { path: 'commercial-offert-terminal-config/:stroreid/:commofid', component: CommercialOfferTerminalConfigComponent },
      { path: 'commercial-offert-pricing', component: CommercialOfferPricingComponent },
      { path: 'info-declarativa', component: InfoDeclarativaComponent },
      { path: 'info-declarativa-stakeholder', component: InfoDeclarativaStakeholderComponent }
      
    ]),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [UploadService, HttpUtilService],
  bootstrap: [AppComponent]
})
export class AppModule { }
