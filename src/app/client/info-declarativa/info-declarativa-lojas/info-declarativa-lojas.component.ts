import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Configuration, configurationToken } from 'src/app/configuration';
import { DataService } from 'src/app/nav-menu-interna/data.service';
import { Istore, ShopDetailsAcquiring } from '../../../store/IStore.interface';
import { StoreService } from '../../../store/store.service';
import { CountryInformation } from '../../../table-info/ITable-info.interface';
import { TableInfoService } from '../../../table-info/table-info.service';
import { Client, Phone } from '../../Client.interface';
import { ClientService } from '../../client.service';
import { infoDeclarativaForm, validPhoneNumber } from '../info-declarativa.model';
import { LoggerService } from 'src/app/logger.service';
import { EquipmentOwnershipTypeEnum, CommunicationOwnershipTypeEnum, ProductPackKindEnum } from '../../../commercial-offer/ICommercialOffer.interface';
import { distinctUntilChanged, Observable, of, Subscription } from 'rxjs';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-info-declarativa-lojas',
  templateUrl: './info-declarativa-lojas.component.html',
  styleUrls: ['./info-declarativa-lojas.component.css']
})

export class InfoDeclarativaLojasComponent implements OnInit, AfterViewInit {
  public EquipmentOwnershipTypeEnum = EquipmentOwnershipTypeEnum;
  public CommunicationOwnershipTypeEnum = CommunicationOwnershipTypeEnum;
  public ProductPackKindEnum = ProductPackKindEnum;

  private baseUrl: string;

  public stores: ShopDetailsAcquiring[] = [];

  public selectedStore: ShopDetailsAcquiring = null;
  //listValue!: FormGroup;

  displayedColumns: string[] = ['nameEstab', 'activityEstab', 'subActivityEstab', 'zoneEstab'];
  dataSource : MatTableDataSource<ShopDetailsAcquiring>;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  //Informação de campos/tabelas
  internationalCallingCodes: CountryInformation[];

  listValue!: FormGroup;
  currentIdx: number = 0;

  client: Client;
  returned: string;
  submissionId: string;
  processNumber: string;

  storesLength: number;
  updatedStoreEvent: Observable<{ store: ShopDetailsAcquiring, idx: number }>;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  public subs: Subscription[] = [];


  constructor(private logger: LoggerService, private formBuilder: FormBuilder, http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private route: Router, private data: DataService, private tableInfo: TableInfoService, private storeService: StoreService, private clientService: ClientService) {
    this.baseUrl = configuration.baseUrl;
    //this.ngOnInit();
    
    this.subs.push(this.tableInfo.GetAllCountries().subscribe(result => {
      this.internationalCallingCodes = result;
      this.internationalCallingCodes = this.internationalCallingCodes.sort((a, b) => a.description> b.description? 1 : -1); //ordenar resposta
    }, error => this.logger.debug(error)));

    this.clientService.GetClientByIdAcquiring(localStorage.getItem("submissionId")).then(result => {
      this.client = result;
      this.getCountryInternationalCallingCode1();
      this.getCountryInternationalCallingCode2();
    });


  } 

  ngOnInit(): void {
    this.data.updateData(false, 6, 4);
    this.selectedStore = JSON.parse(localStorage.getItem("info-declarativa"))?.store ?? this.selectedStore;
    this.returned = localStorage.getItem("returned");
    this.submissionId = localStorage.getItem("submissionId");
    this.processNumber = localStorage.getItem("processNumber");

    this.listValue = this.formBuilder.group({
      cellphone: this.formBuilder.group({
        countryCode: new FormControl(this.selectedStore?.phone1 != null ? this.selectedStore?.phone1?.countryCode : this.client?.contacts?.phone1?.countryCode), 
        phoneNumber: new FormControl(this.selectedStore?.phone1 != null ? this.selectedStore?.phone1?.phoneNumber : this.client?.contacts?.phone1?.phoneNumber, Validators.required)
      }, { validators: validPhoneNumber}),
      telephone: this.formBuilder.group({
        countryCode: new FormControl(this.selectedStore?.phone2 != null ? this.selectedStore?.phone2?.countryCode : this.client?.contacts?.phone2?.countryCode), //telefone
        phoneNumber: new FormControl(this.selectedStore?.phone2 != null ? this.selectedStore?.phone2?.phoneNumber : this.client?.contacts?.phone2?.phoneNumber, Validators.required)
      }, { validators: validPhoneNumber }),
      email: new FormControl(this.selectedStore?.email != null ? this.selectedStore?.email : this.client?.contacts?.email, Validators.required),
    });

    this.listValue.get("cellphone").get("phoneNumber").valueChanges.pipe(distinctUntilChanged()).subscribe(val => {
      if (val != null && val != "") {
        this.listValue.get("telephone").get("phoneNumber").setValidators(null);
      } else {
        this.listValue.get("telephone").get("phoneNumber").setValidators(Validators.required);
      }
      this.listValue.get("telephone").get("phoneNumber").updateValueAndValidity();
      console.log('Valor do form ', this.listValue);
    });

    this.listValue.get("telephone").get("phoneNumber").valueChanges.pipe(distinctUntilChanged()).subscribe(val => {
      if (val != null && val != "") {
        this.listValue.get("cellphone").get("phoneNumber").setValidators(null);
      } else {
        this.listValue.get("cellphone").get("phoneNumber").setValidators(Validators.required);
      }
      this.listValue.get("cellphone").get("phoneNumber").updateValueAndValidity();
      console.log('Valor do form 1', this.listValue);
    });
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub?.unsubscribe);
  }
  

  changeListElement(variavel: string, e: any) {
  //  if (e.target.id == '') {
  //    this. = e.target.value;
  //  }
  //  if (e.target.id == '') {
  //    this. = e.target.value;
  //  }
  //  if (e.target.id == '') {
  //    this. = e.target.value;
  //  }
  //  this.logger.debug(e.target.id);
  }

  selectStore(info) {
    this.selectedStore = info.store;
    this.currentIdx = info.idx;
    this.setForm();
  }

  submit() {
    if (this.listValue.valid) {
      this.selectedStore.email = this.listValue.get("email").value;

      this.selectedStore.phone1 = new Phone();
      this.selectedStore.phone2 = new Phone();

      this.selectedStore.phone1.countryCode = this.listValue.get("cellphone").get("countryCode").value;
      this.selectedStore.phone1.phoneNumber = this.listValue.get("cellphone").get("phoneNumber").value;
      this.selectedStore.phone2.countryCode = this.listValue.get("telephone").get("countryCode").value;
      this.selectedStore.phone2.phoneNumber = this.listValue.get("telephone").get("phoneNumber").value;

      let storedForm: infoDeclarativaForm = JSON.parse(localStorage.getItem("info-declarativa")) ?? new infoDeclarativaForm();
      storedForm.store = this.selectedStore;
      localStorage.setItem("info-declarativa", JSON.stringify(storedForm));

      console.log("Estrutura dos dados da Loja ", this.selectedStore);

      this.storeService.updateSubmissionShop(localStorage.getItem("submissionId"), this.selectedStore.id, this.selectedStore).subscribe(result => {
        if (this.currentIdx < (this.storesLength - 1)) {
          console.log("Loja atualizada ", result);
          this.emitUpdatedStore(of({ store: this.selectedStore, idx: this.currentIdx }));
          this.onActivate();
        } else {
          this.route.navigate(['/info-declarativa-assinatura']);
        }
      });

    }
  }

  loadStores(storesValues: ShopDetailsAcquiring[]) {
    this.dataSource = new MatTableDataSource(storesValues);
    this.dataSource.paginator = this.paginator;
  }

  setForm() {
    
    this.listValue.get("cellphone").get("countryCode").setValue(this.selectedStore?.phone1 != null ? this.selectedStore?.phone1?.countryCode : this.client.contacts.phone1.countryCode); //eventualmente as '' vão passar a ser o valor dos contactos das Lojas
    this.listValue.get("cellphone").get("phoneNumber").setValue(this.selectedStore?.phone1 != null ? this.selectedStore?.phone1?.phoneNumber : this.client?.contacts?.phone1?.phoneNumber);
    this.listValue.get("telephone").get("countryCode").setValue(this.selectedStore?.phone2 != null ? this.selectedStore?.phone2?.countryCode : this.client.contacts.phone2.countryCode);
    this.listValue.get("telephone").get("phoneNumber").setValue(this.selectedStore?.phone2 != null ? this.selectedStore?.phone2?.phoneNumber : this.client?.contacts?.phone2?.phoneNumber);
    this.listValue.get("email").setValue(this.selectedStore?.email != null ? this.selectedStore?.email : this.client?.contacts?.email);
    if (this.returned == 'consult')
      this.listValue.disable();
  }

  // na api é alterado o indicativo para o país e nós precisamos aqui do indicativo
  getCountryInternationalCallingCode1(){
    if (this.client.contacts.phone1.countryCode != null) {
      this.tableInfo.GetCountryById(this.client.contacts.phone1.countryCode).subscribe(result => {
       this.client.contacts.phone1.countryCode = result.internationalCallingCode;
      }, error => this.logger.debug(error));
    }
    
  }

  getCountryInternationalCallingCode2(){
    if (this.client.contacts.phone1.countryCode != null) {
      this.tableInfo.GetCountryById(this.client.contacts.phone2.countryCode).subscribe(result => {
        this.client.contacts.phone2.countryCode = result.internationalCallingCode;
      }, error => this.logger.debug(error));
    }
  }
  

  onActivate() {
    let scrollToTop = window.setInterval(() => {
      let pos = window.pageYOffset;
      if (pos > 0) {
        window.scrollTo(0, pos - 100); // how far to scroll on each step
      } else {
        window.clearInterval(scrollToTop);
      }
    }, 16);
  }

  getStoresListLength(length) {
    this.storesLength = length;
  }

  emitUpdatedStore(info) {
    this.updatedStoreEvent = info;
  }

  numericOnly(event): boolean {
    var ASCIICode = (event.which) ? event.which : event.keyCode;

    if (ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57))
      return false;
    return true;
  }
}
