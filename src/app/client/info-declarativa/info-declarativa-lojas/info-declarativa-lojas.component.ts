import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Configuration, configurationToken } from 'src/app/configuration';
import { DataService } from 'src/app/nav-menu-interna/data.service';
import { Istore } from '../../../store/IStore.interface';
import { CountryInformation } from '../../../table-info/ITable-info.interface';
import { TableInfoService } from '../../../table-info/table-info.service';
import { infoDeclarativaForm, validPhoneNumber } from '../info-declarativa.model';

@Component({
  selector: 'app-info-declarativa-lojas',
  templateUrl: './info-declarativa-lojas.component.html',
  styleUrls: ['./info-declarativa-lojas.component.css']
})
export class InfoDeclarativaLojasComponent implements OnInit, AfterViewInit {

  private baseUrl: string;

  public stores: Istore[] = [];
  public clientID: number = 12345678;

  public selectedStore = {
    activityEstab: "",
    address: "",
    cellphoneIndic: "",
    cellphoneNumber: "",
    country: "",
    emailContact: "",
    fixedIP: "",
    iban: "",
    id: 0,
    nameEstab: "",
    postalCode: "",
    postalLocality: "",
    subActivityEstab: "",
    subZoneEstab: "",
    turisticZone: false,
    zoneEstab: ""
  } as Istore;

  //listValue!: FormGroup;

  displayedColumns: string[] = ['nameEstab', 'activityEstab', 'subActivityEstab', 'zoneEstab'];
  dataSource = new MatTableDataSource<Istore>(this.stores);

  @ViewChild(MatPaginator) paginator: MatPaginator;

  //Informação de campos/tabelas
  internationalCallingCodes: CountryInformation[];

  listValue!: FormGroup;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  constructor(private formBuilder: FormBuilder, http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private route: Router, private data: DataService, private tableInfo: TableInfoService) {
    this.baseUrl = configuration.baseUrl;
    this.ngOnInit();
    /*Get from the backend the full list of stores existing for the client*/
    http.get<Istore[]>(this.baseUrl + 'BEStores/GetAllStores/' + this.clientID).subscribe(result => {
      this.stores = result;
      this.dataSource.data = this.stores;
    }, error => console.error(error));

    this.tableInfo.GetAllCountries().subscribe(result => {
      this.internationalCallingCodes = result;
    }, error => console.log(error));

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
    this.data.updateData(false, 6, 3);
    this.selectedStore = JSON.parse(localStorage.getItem("info-declarativa"))?.store ?? this.selectedStore;

    this.listValue = this.formBuilder.group({
      cellphone : this.formBuilder.group({
        countryCode: new FormControl(this.selectedStore.cellphoneIndic), //telemovel
        phoneNumber: new FormControl(this.selectedStore.cellphoneNumber)
      }, {validators : validPhoneNumber}),
      telephone : this.formBuilder.group({
        countryCode: new FormControl(''), //telefone
        phoneNumber: new FormControl('')
      }, {validators : validPhoneNumber}),
      email: new FormControl(this.selectedStore.emailContact, Validators.required),
    });
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
  //  console.log(e.target.id);
  }

  selectRow(store: any) {
    this.selectedStore = store;
  }

  submit() {

    this.selectedStore.cellphoneIndic = this.listValue.value.cellphoneCountryCode;
    this.selectedStore.cellphoneNumber = this.listValue.value.cellphoneNumber;
    this.selectedStore.emailContact = this.listValue.value.email;
    let storedForm: infoDeclarativaForm = JSON.parse(localStorage.getItem("info-declarativa")) ?? new infoDeclarativaForm();
    storedForm.store = this.selectedStore
    localStorage.setItem("info-declarativa", JSON.stringify(storedForm));
    this.route.navigate(['/info-declarativa-assinatura']);
  }
}
