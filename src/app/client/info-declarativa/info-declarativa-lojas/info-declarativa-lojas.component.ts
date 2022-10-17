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
import { Client } from '../../Client.interface';
import { ClientService } from '../../client.service';
import { infoDeclarativaForm, validPhoneNumber } from '../info-declarativa.model';
import { LoggerService } from 'src/app/logger.service';
import { EquipmentOwnershipTypeEnum, CommunicationOwnershipTypeEnum, ProductPackKindEnum } from '../../../commercial-offer/ICommercialOffer.interface';
import { Subscription } from 'rxjs';

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
  public clientID: number = 12345678;

  public selectedStore = null;
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

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  public subs: Subscription[] = [];


    constructor(private logger: LoggerService, private formBuilder: FormBuilder, http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private route: Router, private data: DataService, private tableInfo: TableInfoService, private storeService: StoreService, private clientService: ClientService) {
    this.baseUrl = configuration.baseUrl;
    this.ngOnInit();
    
    this.subs.push(this.tableInfo.GetAllCountries().subscribe(result => {
      this.internationalCallingCodes = result;
      this.internationalCallingCodes = this.internationalCallingCodes.sort((a, b) => a.description> b.description? 1 : -1); //ordenar resposta
    }, error => this.logger.debug(error)));

    this.clientService.GetClientByIdAcquiring(localStorage.getItem("submissionId")).then(result => {
      this.client = result;
    });


      this.storeService.getSubmissionShopsList(localStorage.getItem("submissionId")).then(result => {
        var shops = result.result;
      shops.forEach(value => {
        this.storeService.getSubmissionShopDetails(localStorage.getItem("submissionId"), value.id).then(res => {
          var shop = res.result;
          this.stores.push(shop);
        });
      });
      this.loadStores(this.stores);
    });

    //this.internationalCallingCodes = tableInfo.GetAllCountries();

 /*    //se o telemovel estiver vazio, o numero de telefone é obrigatorio
    this.listValue.controls["cellphoneNumber"].valueChanges.subscribe(data => {
      if (data === '') {
        this.listValue.controls["telephoneNumber"].setValidators([Validators.required]);
      } else {
        this.listValue.controls["telephoneNumber"].clearValidators();
      }
      this.listValue.controls["telephoneNumber"].updateValueAndValidity();
    });

    //se o telefone esta vazio, o numero de telemovel é obrigatorio
    this.listValue.controls["telephoneNumber"].valueChanges.subscribe(data => {
      if (data !== '') {
        this.listValue.controls["cellphoneNumber"].setValidators([Validators.required]);
      } else {
        this.listValue.controls["cellphoneNumber"].clearValidators();
      }
      this.listValue.controls["cellphoneNumber"].updateValueAndValidity();
    });*/
  } 

  ngOnInit(): void {
    this.data.updateData(false, 6, 4);
    this.selectedStore = JSON.parse(localStorage.getItem("info-declarativa"))?.store ?? this.selectedStore;
    this.returned = localStorage.getItem("returned");
    this.submissionId = localStorage.getItem("submissionId");
    this.processNumber = localStorage.getItem("processNumber");

    this.listValue = this.formBuilder.group({
      cellphone: this.formBuilder.group({
        countryCode: new FormControl('' /* Quando for adicionado a possibilidade de inserir os contactos de uma Loja na acquiringAPI */), //telemovel
        phoneNumber: new FormControl('')
      }, {validators : validPhoneNumber}),
      telephone: this.formBuilder.group({
        countryCode: new FormControl(''), //telefone
        phoneNumber: new FormControl('')
      }, { validators: validPhoneNumber }),
      email: new FormControl('', Validators.required),
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
      //this.selectedStore.cellphoneIndic = this.listValue.value.cellphoneCountryCode;
      //this.selectedStore.cellphoneNumber = this.listValue.value.cellphoneNumber;
      //this.selectedStore.emailContact = this.listValue.value.email;
      let storedForm: infoDeclarativaForm = JSON.parse(localStorage.getItem("info-declarativa")) ?? new infoDeclarativaForm();
      storedForm.store = this.selectedStore;
      localStorage.setItem("info-declarativa", JSON.stringify(storedForm));

      //this.storeService.updateSubmissionShop(localStorage.getItem("submissionId"), this.selectedStore.id, this.selectedStore).subscribe(result => {
      if (this.currentIdx < (this.stores.length - 1)) {
        this.currentIdx = this.currentIdx + 1;
        this.onActivate();
        this.selectStore({ store: this.stores[this.currentIdx], idx: this.currentIdx });
        } else {
          this.route.navigate(['/info-declarativa-assinatura']);
        }
      //});

    }
  }

  loadStores(storesValues: ShopDetailsAcquiring[]) {
    this.dataSource = new MatTableDataSource(storesValues);
    this.dataSource.paginator = this.paginator;
  }

  setForm() {
    this.listValue.get("cellphone").get("countryCode").setValue((this.client?.contacts != null) ? this.client.contacts?.phone1?.countryCode : '');
    this.listValue.get("cellphone").get("phoneNumber").setValue((this.client?.contacts != null) ? this.client.contacts?.phone1?.phoneNumber : '');
    this.listValue.get("telephone").get("countryCode").setValue((this.client?.contacts != null) ? this.client.contacts?.phone2?.countryCode : '');
    this.listValue.get("telephone").get("phoneNumber").setValue((this.client?.contacts != null) ? this.client.contacts?.phone2?.phoneNumber : '');
    this.listValue.get("email").setValue((this.client.contacts != null) ? this.client?.contacts?.email : '');
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
}
