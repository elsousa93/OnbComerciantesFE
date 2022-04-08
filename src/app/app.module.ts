import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { HomeComponent } from './home/home.component';
import { ComprovativosComponent } from './comprovativos/comprovativos.component';
import { UploadService } from './comprovativos/services/upload.services';
import { HttpUtilService } from './comprovativos/services/http.services';
import { RouterModule, Routes } from '@angular/router';
import { CounterComponent } from './counter/counter.component';
import { FetchDataComponent } from './fetch-data/fetch-data.component';
import { StoreComponent } from './store/store-list/store-list.component';
import { ClientComponent } from './client/client.component';
import { AddStoreComponent } from './store/add-store/add-store.component';
import { DropDownComponent } from './drop-down/drop-down.component';
import { StakeholdersComponent } from './stakeholders/stakeholders.component';
import { NewStakeholderComponent } from './stakeholders/new-stakeholder/new-stakeholder.component';
import { CommercialOfferListComponent } from './commercial-offer/commercial-offer-list/commercial-offer-list.component';
import { CommercialOfferDetailComponent } from './commercial-offer/commercial-offer-detail/commercial-offer-detail.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CheckDocumentsComponent } from './comprovativos/check-documents/check-documents.component';

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
    CommercialOfferListComponent,
    ComprovativosComponent,
    CommercialOfferDetailComponent,
    CheckDocumentsComponent
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
      { path: 'store-comp', component: StoreComponent },
      { path: 'client', component: ClientComponent },
      { path: 'drop-down', component: DropDownComponent },
      { path: 'stakeholders', component: StakeholdersComponent },
     // { path: 'stakeholders/:contractSearch', component: StakeholdersComponent },
      { path: 'add-stakeholder', component: NewStakeholderComponent },
      { path: 'add-store/:stroreid', component: AddStoreComponent },
      { path: 'comprovativos', component: ComprovativosComponent },
      { path: 'commercial-offert-list', component: CommercialOfferListComponent },
      { path: 'commercial-offert-detail/:stroreid', component: CommercialOfferDetailComponent },
      { path: 'app-comprovativos/:id', component: ComprovativosComponent },
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
