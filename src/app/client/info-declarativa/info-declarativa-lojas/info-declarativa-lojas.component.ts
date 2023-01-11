import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, AbstractControl } from '@angular/forms';
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
import { infoDeclarativaForm, validPhoneNumber, validEmail, validPhoneAndMobileNumber } from '../info-declarativa.model';
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
  cellphone: AbstractControl;
  telephone: AbstractControl;

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


  constructor(private logger: LoggerService, private formBuilder: FormBuilder, http: HttpClient, private route: Router, private data: DataService, private tableInfo: TableInfoService, private storeService: StoreService, private clientService: ClientService) {
    //this.ngOnInit();
    
    this.subs.push(this.tableInfo.GetAllCountries().subscribe(result => {
      this.internationalCallingCodes = result;
      this.internationalCallingCodes = this.internationalCallingCodes.sort(function (a, b) {
        return a.description.localeCompare(b.description, 'pt-PT');
      }); //ordenar resposta
    }, error => this.logger.debug(error)));

    this.clientService.GetClientByIdAcquiring(localStorage.getItem("submissionId")).then(result => {
      this.client = result;
    });


  } 

  ngOnInit(): void {
    this.data.updateData(false, 6, 3);
    this.returned = localStorage.getItem("returned");
    this.submissionId = localStorage.getItem("submissionId");
    this.processNumber = localStorage.getItem("processNumber");

    this.listValue = this.formBuilder.group({
      cellphone: this.formBuilder.group({
        countryCode: new FormControl(this.selectedStore?.phone1 != null ? this.selectedStore?.phone1?.phoneIndicative : this.client?.contacts?.phone1?.phoneIndicative), 
        phoneNumber: new FormControl(this.selectedStore?.phone1 != null ? this.selectedStore?.phone1?.phoneNumber : this.client?.contacts?.phone1?.phoneNumber, Validators.required)
      }, {validators: [validPhoneNumber]}),
      telephone: this.formBuilder.group({
        countryCode: new FormControl(this.selectedStore?.phone2 != null ? this.selectedStore?.phone2?.phoneIndicative : this.client?.contacts?.phone2?.phoneIndicative), //telefone
        phoneNumber: new FormControl(this.selectedStore?.phone2 != null ? this.selectedStore?.phone2?.phoneNumber : this.client?.contacts?.phone2?.phoneNumber, Validators.required)
      }, {validators: [validPhoneAndMobileNumber]}),
      email: new FormControl(this.selectedStore?.email != null ? this.selectedStore?.email : this.client?.contacts?.email, [Validators.required, Validators.email]),
    });
    this.cellphone = this.listValue.get("cellphone");
    this.telephone = this.listValue.get("telephone");

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

  get emailValid() {
    return this.listValue.get('email');
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
    setTimeout(() => this.setForm(), 500);
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
    this.listValue.get("cellphone").get("countryCode").setValue(this.selectedStore?.phone1 != null ? this.selectedStore?.phone1?.phoneIndicative : this.client?.contacts?.phone1?.phoneIndicative); //eventualmente as '' vão passar a ser o valor dos contactos das Lojas
    this.listValue.get("cellphone").get("phoneNumber").setValue(this.selectedStore?.phone1 != null ? this.selectedStore?.phone1?.phoneNumber : this.client?.contacts?.phone1?.phoneNumber);
    this.listValue.get("telephone").get("countryCode").setValue(this.selectedStore?.phone2 != null ? this.selectedStore?.phone2?.phoneIndicative : this.client?.contacts?.phone2?.phoneIndicative);
    this.listValue.get("telephone").get("phoneNumber").setValue(this.selectedStore?.phone2 != null ? this.selectedStore?.phone2?.phoneNumber : this.client?.contacts?.phone2?.phoneNumber);
    this.listValue.get("email").setValue(this.selectedStore?.email != null ? this.selectedStore?.email : this.client?.contacts?.email);
    if (this.returned == 'consult')
      this.listValue.disable();
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
