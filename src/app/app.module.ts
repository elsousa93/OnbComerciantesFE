import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { ComprovativosService } from './comprovativos/services/comprovativos.services';
import { HttpUtilService } from './comprovativos/services/http.services';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroupDirective } from '@angular/forms';
import { ModalModule, BsModalService } from 'ngx-bootstrap/modal';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

import { AppComponent } from './app.component';
import { ComprovativosComponent } from './comprovativos/comprovativos.component';
import { ClientComponent } from './client/client.component';
import { StakeholdersComponent } from './stakeholders/stakeholders.component';
import { NewStakeholderComponent } from './stakeholders/new-stakeholder/new-stakeholder.component';
import { StoreIbanComponent } from './store/store-iban/store-iban.component';
import { StoreComponent } from './store/store-list/store-list.component';
import { AddStoreComponent } from './store/add-store/add-store.component';
import { CommercialOfferListComponent } from './commercial-offer/commercial-offer-list/commercial-offer-list.component';
import { CommercialOfferNewConfigurationComponent } from './commercial-offer/commercial-offer-new-configuration/commercial-offer-new-configuration.component';
import { InfoDeclarativaComponent } from './client/info-declarativa/info-declarativa.component';
import { InfoDeclarativaStakeholderComponent } from './stakeholders/info-declarativa-stakeholder/info-declarativa-stakeholder.component';
import { ClientByIdComponent } from './client/clientById/clientbyid.component';
import { ReadcardComponent } from './readcard/readcard.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { CookieService } from 'ngx-cookie-service';
import { PepComponent } from './pep/pep.component';
import { NavMenuInternaComponent } from './nav-menu-interna/nav-menu-interna.component';
import { ProcessComponent } from './process/process.component';
import { SubmissionComponent } from './submission/submission.component';
import { NavMenuPresencialComponent } from './nav-menu-presencial/nav-menu-presencial.component';
import { MaterialModule } from './material/material.module';
import { FooterPresencialComponent } from './footer-presencial/footer-presencial.component';
import { SidenavPresencialComponent } from './sidenav-presencial/sidenav-presencial.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InfoDeclarativaAssinaturaComponent } from './client/info-declarativa/info-declarativa-assinatura/info-declarativa-assinatura.component';
import { StakeholderService } from './stakeholders/stakeholder.service';
import { NumberCounterComponent } from './number-counter/number-counter.component';
import { UpdateStakeholderComponent } from './stakeholders/update-stakeholder/update-stakeholder.component';
import { TableInfoService } from './table-info/table-info.service';
import { InfoDeclarativaLojasComponent } from './client/info-declarativa/info-declarativa-lojas/info-declarativa-lojas.component';
import { CountrysComponent } from './countrys/countrys.component';
import { DevolucaoComponent } from './devolucao/devolucao.component';
import { QueuesDetailComponent } from './queues-detail/queues-detail.component';
import { AceitacaoComponent } from './aceitacao/aceitacao.component';
import { ConsultasComponent } from './consultas/consultas.component';
import { ConsultasFTComponent } from './consultas-ft/consultas-ft.component';
import { PackContratualComponent } from './aceitacao/pack-contratual/pack-contratual.component';
import { ObterPackContratualComponent } from './aceitacao/obter-pack-contratual/obter-pack-contratual.component';
import { InfoStakeholderComponent } from './stakeholders/info-stakeholder/info-stakeholder.component';
import { CreateStakeholderComponent } from './stakeholders/create-stakeholder/create-stakeholder.component';
import { LoggerModule, NgxLoggerLevel, TOKEN_LOGGER_WRITER_SERVICE, TOKEN_LOGGER_SERVER_SERVICE } from 'ngx-logger';
import { WriterCustomService } from 'src/logger/writer-custom.service';
import { ServerCustomService } from 'src/logger/server-custom.service';
import { AuthComponent } from './auth/auth.component';
import { RepresentationPowerComponent } from './client/representation-power/representation-power.component';

//import da linguages e configurações de hora
import { registerLocaleData } from '@angular/common';
import localePT from '@angular/common/locales/pt';
import { environment } from 'src/environments/environment';
import { ProductSelectionComponent } from './store/product-selection/product-selection.component';
import { StakeholdersListComponent } from './stakeholders/stakeholders-list/stakeholders-list.component';
import { AuthService } from './services/auth.service';
import { ClientSearchComponent } from './client/client-search/client-search.component';
import { SearchStakeholdersComponent } from './stakeholders/search-stakeholders/search-stakeholders.component';
import { StoreTableComponent } from './store/store-table/store-table.component';
import { LoggingInterceptor } from 'src/logger/loggerInterceptor';
import { ClientCharacterizationComponent } from './client/clientCharacterization/clientcharacterization.component';
import { RepresentationPowerListComponent } from './client/representation-power/representation-power-list/representation-power-list.component';

registerLocaleData(localePT);


export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, './assets/i18n/');
}


@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    StoreComponent,
    ClientComponent,
    AddStoreComponent,
    StakeholdersComponent,
    NewStakeholderComponent,
    UpdateStakeholderComponent,
    ComprovativosComponent,
    CommercialOfferListComponent,
    CommercialOfferNewConfigurationComponent,
    StoreIbanComponent,
    InfoDeclarativaComponent,
    InfoDeclarativaStakeholderComponent,
    PepComponent,
    ClientByIdComponent,
    ClientCharacterizationComponent,
    ReadcardComponent,
    DevolucaoComponent,
    QueuesDetailComponent,
    AceitacaoComponent,
    ConsultasComponent,
    ConsultasFTComponent,
    PackContratualComponent,
    ObterPackContratualComponent,
    NavMenuInternaComponent,
    ProcessComponent,
    LoginComponent,
    NavMenuPresencialComponent,
    FooterPresencialComponent,
    SidenavPresencialComponent,
    InfoDeclarativaAssinaturaComponent,

    NumberCounterComponent,
    InfoDeclarativaLojasComponent,
    CountrysComponent,
    CreateStakeholderComponent,
    AuthComponent,
    RepresentationPowerComponent,
    ProductSelectionComponent,
    StakeholdersListComponent,
    ClientSearchComponent,
    SearchStakeholdersComponent,
    StoreTableComponent,
    RepresentationPowerListComponent,
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
      { path: '', component: DashboardComponent, pathMatch: 'full' },
      { path: 'client', component: ClientComponent },
      { path: 'clientbyid/:id', component: ClientByIdComponent },
      { path: 'clientbyid', component: ClientByIdComponent },
      { path: 'client/:id', component: ClientComponent },
      { path: 'stakeholders', component: StakeholdersComponent },
      { path: 'stakeholders/:nif', component: StakeholdersComponent },
      { path: 'create-stakeholder', component: CreateStakeholderComponent },
      { path: 'add-stakeholder', component: NewStakeholderComponent },
      { path: 'add-stakeholder/:nif', component: NewStakeholderComponent },
      { path: 'new-stakeholder/:nif/edit', component: NewStakeholderComponent },
      { path: 'add-stakeholder/:nif/:clientNr/delete', component: NewStakeholderComponent },
      { path: 'info-stakeholders', component: InfoStakeholderComponent },
      { path: 'update-stakeholder/:nif', component: UpdateStakeholderComponent },
      { path: 'app-pep', component: PepComponent },
      { path: 'app-aceitacao', component: AceitacaoComponent },
      { path: 'app-aceitacao/:id', component: AceitacaoComponent },
      { path: 'app-devolucao', component: DevolucaoComponent },
      { path: 'queues-detail', component: QueuesDetailComponent },
      { path: 'app-devolucao/:id', component: DevolucaoComponent },
      { path: 'app-consultas', component: ConsultasComponent },
      { path: 'app-consultas-ft', component: ConsultasFTComponent },
      { path: 'app-consultas/:id', component: ConsultasComponent },
      { path: 'app-pack-contratual', component: PackContratualComponent},
      { path: 'app-obter-pack-contratual', component: ObterPackContratualComponent},
      { path: 'comprovativos', component: ComprovativosComponent },
      { path: 'comprovativos/:id', component: ComprovativosComponent },
      { path: 'app-comprovativos/:id', component: ComprovativosComponent },
      { path: 'store-comp', component: StoreComponent },
      { path: 'add-store/:stroreid', component: AddStoreComponent },
      { path: 'add-store', component: AddStoreComponent },
      { path: 'add-store-iban/:stroreid', component: StoreIbanComponent },
      { path: 'add-store-iban', component: StoreIbanComponent },
      { path: 'commercial-offert-list', component: CommercialOfferListComponent },
      { path: 'commercial-offert-new-configuration', component: CommercialOfferNewConfigurationComponent },
      { path: 'info-declarativa', component: InfoDeclarativaComponent },
      { path: 'info-declarativa-stakeholder', component: InfoDeclarativaStakeholderComponent },
      { path: 'login', component: LoginComponent },
      { path: 'login/:tokenid', component: LoginComponent },
      { path: 'dashboard', component: DashboardComponent},

      { path: 'nav-interna/:pag', component: NavMenuInternaComponent },

      { path: 'readcardcc', component: ReadcardComponent },
      { path: 'submission/:id/merchant', component: SubmissionComponent },
      { path: 'submission', component: SubmissionComponent },
      { path: 'process', component: ProcessComponent },
      { path: 'info-declarativa-assinatura', component: InfoDeclarativaAssinaturaComponent },
      { path: 'info-declarativa-lojas', component: InfoDeclarativaLojasComponent },
      { path: 'client-additional-info/:id', component: CountrysComponent },
      { path: 'client-additional-info/', component: CountrysComponent },
      { path: 'auth', component: AuthComponent },
      { path: 'client-power-representation/:id', component: RepresentationPowerComponent },
      { path: 'client-power-representation/', component: RepresentationPowerComponent },
      { path: 'add-store-product', component: ProductSelectionComponent }

    ], { onSameUrlNavigation: 'reload' }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    LoggerModule.forRoot({
      level : environment.production ? NgxLoggerLevel.LOG : NgxLoggerLevel.DEBUG,
      enableSourceMaps: true,
      serverLoggingUrl:"BELogging",
      serverLogLevel:NgxLoggerLevel.DEBUG
      
    },{
      writerProvider : {
          provide: TOKEN_LOGGER_WRITER_SERVICE, useClass: WriterCustomService
        },
      serverProvider : {
          provide: TOKEN_LOGGER_SERVER_SERVICE, useClass: ServerCustomService
        }
    }),
  ],
  providers: [{provide:HTTP_INTERCEPTORS, useClass:LoggingInterceptor, multi:true}, ComprovativosService, HttpUtilService, AuthGuard, CookieService, BsModalService, StakeholderService, TableInfoService, DatePipe, AuthService, { provide: LocationStrategy, useClass: HashLocationStrategy }, FormGroupDirective],
  bootstrap: [AppComponent]
})
export class AppModule { }
