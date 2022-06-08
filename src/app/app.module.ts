import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { ComprovativosService } from './comprovativos/services/comprovativos.services';
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
import { ClientComponent } from './client/client.component';
import { ClientExtendedComponent } from './client/client-extended/client-extended.component';
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
import { CommercialOfferTariffComponent } from './commercial-offer/commercial-offer-tariff/commercial-offer-tariff.component';
import { ClientByIdComponent } from './client/clientById/clientbyid.component';
import { ReadcardComponent } from './readcard/readcard.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { CookieService } from 'ngx-cookie-service';
import { PepComponent } from './pep/pep.component';
import { NavMenuInternaComponent } from './nav-menu-interna/nav-menu-interna.component';
import { FooterComponent } from './footer/footer.component';
import { NewClientComponent } from './client/new-client/new-client.component';
import { CircularProgressComponent } from './circular-progress/circular-progress.component';
import { ProcessComponent } from './process/process.component';
import { BannerHomeComponent } from './banner-home/banner-home.component';
import { BarrazulHomeComponent } from './barrazul-home/barrazul-home.component';
import { SubmissionComponent } from './submission/submission.component';
import { AcceptanceComponent } from './process/acceptance/acceptance.component';
import { NavMenuPresencialComponent } from './nav-menu-presencial/nav-menu-presencial.component';
import { MaterialModule } from './material/material.module';
import { FooterPresencialComponent } from './footer-presencial/footer-presencial.component';
import { SidenavPresencialComponent } from './sidenav-presencial/sidenav-presencial.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient);
}

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    StoreComponent,
    ClientComponent,
    AddStoreComponent,
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
    PepComponent,
    CommercialOfferTariffComponent,
    ClientByIdComponent,
    ClientExtendedComponent,
    ReadcardComponent,

    ReadcardComponent,
    NavMenuInternaComponent,
    FooterComponent,
    CircularProgressComponent,
    ProcessComponent,
    NewClientComponent,
    BannerHomeComponent,
    LoginComponent,
    BarrazulHomeComponent,
    AcceptanceComponent,
    NavMenuPresencialComponent,
    FooterPresencialComponent,
    SidenavPresencialComponent
  ],
  imports: [
    ReactiveFormsModule,
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    ModalModule.forRoot(),
    HttpClientModule,
    FormsModule,
    MaterialModule,
    BrowserAnimationsModule,
    RouterModule.forRoot([
      { path: '', component: HomeComponent, pathMatch: 'full' },
      { path: 'client', component: ClientComponent },
      { path: 'clientbyid/:id', component: ClientByIdComponent },
      { path: 'client/:id', component: ClientComponent },
      { path: 'client-extended', component: ClientExtendedComponent },
      { path: 'client-extended/:id', component: ClientExtendedComponent },
      { path: 'stakeholders', component: StakeholdersComponent },
      { path: 'stakeholders/:nif', component: StakeholdersComponent },
      { path: 'add-stakeholder', component: NewStakeholderComponent },
      { path: 'add-stakeholder/:nif', component: NewStakeholderComponent },
      { path: 'new-stakeholder/:nif/edit', component: NewStakeholderComponent },
      { path: 'add-stakeholder/:nif/:clientNr/delete', component: NewStakeholderComponent },
      { path: 'pep', component: PepComponent },
      { path: 'pep/:id', component: PepComponent },
      { path: 'comprovativos', component: ComprovativosComponent },
      { path: 'comprovativos/:id', component: ComprovativosComponent },
      { path: 'app-comprovativos/:id', component: ComprovativosComponent },
      { path: 'store-comp', component: StoreComponent, canActivate: [AuthGuard] },
      { path: 'add-store/:stroreid', component: AddStoreComponent },
      { path: 'add-store-iban/:stroreid', component: StoreIbanComponent },
      { path: 'commercial-offert-list', component: CommercialOfferListComponent },
      { path: 'commercial-offert-detail/:stroreid/:commofid', component: CommercialOfferDetailComponent },
      { path: 'commercial-offert-store-list/:stroreid', component: CommercialOfferStoreListComponent },
      { path: 'commercial-offert-terminal-config/:stroreid/:commofid', component: CommercialOfferTerminalConfigComponent },
      { path: 'commercial-offert-pricing', component: CommercialOfferPricingComponent },
      { path: 'commercial-offert-tariff', component: CommercialOfferTariffComponent },
      { path: 'info-declarativa', component: InfoDeclarativaComponent },
      { path: 'info-declarativa-stakeholder', component: InfoDeclarativaStakeholderComponent },
      { path: 'login', component: LoginComponent },
      { path: 'login/:tokenid', component: LoginComponent },
      { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
      { path: 'info-declarativa-stakeholder', component: InfoDeclarativaStakeholderComponent },

      { path: 'nav-interna/:pag', component: NavMenuInternaComponent },
      { path: 'app-new-client/:id', component: NewClientComponent },
      { path: 'app-client-extended', component: ClientExtendedComponent },

      { path: 'readcardcc', component: ReadcardComponent },
      { path: 'submission/:id/merchant', component: SubmissionComponent },
      { path: 'submission', component: SubmissionComponent },
      { path: 'acceptance', component: AcceptanceComponent },

    ]),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [ComprovativosService, HttpUtilService, AuthGuard, CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { }
