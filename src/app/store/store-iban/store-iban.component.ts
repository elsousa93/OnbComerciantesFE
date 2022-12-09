import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/nav-menu-interna/data.service';
import { Bank, Istore, ShopBank, ShopBankingInformation, ShopDetailsAcquiring } from '../IStore.interface';
import { Configuration, configurationToken } from 'src/app/configuration';
import { FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserPermissions } from '../../userPermissions/user-permissions';
import { LoggerService } from 'src/app/logger.service';
import { EquipmentOwnershipTypeEnum, CommunicationOwnershipTypeEnum, ProductPackKindEnum } from '../../commercial-offer/ICommercialOffer.interface';
import { TableInfoService } from 'src/app/table-info/table-info.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-store-iban',
  templateUrl: './store-iban.component.html',
  styleUrls: ['./store-iban.component.css']
})

//This component allows to edit the iban field from the store. THere are two options
//1. Use the iban from the cient.
//2. Insert a new iban for the store
export class StoreIbanComponent implements OnInit, OnChanges {
  @Input() parentFormGroup : FormGroup;

  public EquipmentOwnershipTypeEnum = EquipmentOwnershipTypeEnum;
  public CommunicationOwnershipTypeEnum = CommunicationOwnershipTypeEnum;
  public ProductPackKindEnum = ProductPackKindEnum;


  private baseUrl;

  /*variable declarations*/
  public stroreId: number = 0;

  public isIBANConsidered: boolean = null;
  @Input() public IBANToShow: { tipo: string, dataDocumento: string, file: File, id: string };
  // @Input() ibansToShow?: { tipo: string, dataDocumento: string, file: File, id: string }[] = [];
  public result: any;
  localUrl: any;

  public isCardPresent: boolean = false;
  public isCardNotPresent: boolean = false;
  public isCombinedOffer: boolean = false;

  public isURLFilled: boolean = false;

  public newStore: Istore = {
    "id": 1,
    "nameEstab": "",
    "country": "",
    "postalCode": "",
    "address": "",
    "fixedIP": "",
    "postalLocality": "",
    "emailContact": "",
    "cellphoneIndic": "",
    "cellphoneNumber": "",
    "activityEstab": "",
    "subActivityEstab": "",
    "zoneEstab": "",
    "subZoneEstab": "",
    "iban": ""
  };


  public map: Map<number, boolean>;
  public currentPage: number;
  public subscription: Subscription;

  /*CHANGE - Get via service from the clients */
  public commIban: string = "232323232";
  public auxIban: string = "";
  public bank: string;

  /*Is it supposed to relicate the Commercial offert from another store?*/
  selectionsReplicate = ['Não', 'Sim'];
  /*Default case*/
  selectedOption = 'Não';
  public idisabled: boolean = false;

  files?: File[] = [];
  fileToDelete?: File;
  supportBank?: string = "";

  banks: Bank[];

  public store: ShopDetailsAcquiring = new ShopDetailsAcquiring();

  formStores!: FormGroup;
  submissionId: string;
  returned: string
  edit: boolean = false;

  @Output() fileEmitter = new EventEmitter<{ tipo: string, dataDocumento: string, file: File, id: string }>();

  constructor(private logger: LoggerService, private translate: TranslateService,private datePipe: DatePipe, private snackBar: MatSnackBar, private router: ActivatedRoute, private tableInfo: TableInfoService, private http: HttpClient, @Inject(configurationToken) private configuration: Configuration, private route: Router, private data: DataService, private rootFormGroup: FormGroupDirective, private authService: AuthService) {
    setTimeout(() => this.data.updateData(true, 3, 3), 0);

    this.initializeForm();

    this.authService.currentUser.subscribe(result => {

      if (result.permissions === UserPermissions.BANCA) {
        this.bank = this.authService.GetBank();
        console.log('VALOR DO BANK ', this.bank);
        this.updateForm();
      }
    });

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["IBANToShow"] && changes["IBANToShow"].currentValue != null) {
      this.IBANToShow = changes["IBANToShow"].currentValue;
    }
  }

  ngOnInit(): void {
    this.tableInfo.GetBanks().subscribe(result => {
      this.banks = result;
      this.banks = this.banks.sort((a, b) => a.description > b.description ? 1 : -1); //ordenar resposta
    });

    this.returned = localStorage.getItem("returned");
    this.submissionId = localStorage.getItem("submissionId")

    if (this.rootFormGroup.form != null) {
      this.rootFormGroup.form.setControl('bankStores', this.formStores);
      this.edit = true;
      if (this.returned == 'consult') {
        this.formStores.disable();
      }
    } else {
      this.stroreId = Number(this.router.snapshot.params['stroreid']);
      this.subscription = this.data.currentData.subscribe(map => this.map = map);
      this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    }
  }



  /*Controles the radio button changes*/
  radoChangehandler(event: any) {
    this.selectedOption = event.target.value;
    if (this.selectedOption == "Sim") {
      this.auxIban = this.store.bank.bank.iban;
      this.store.bank.bank.iban = this.commIban;
      this.idisabled = true;
    } else {
      this.store.bank.bank.iban = this.auxIban;
      this.idisabled = false;
    }

  }

  submit() {
    this.store.bank.bank = new ShopBankingInformation();

    this.store.bank.useMerchantBank = this.formStores.get("bankInformation").value;
    if (!this.store.bank.useMerchantBank) {
      this.formStores.get("bankIban").addValidators(Validators.required);
      this.formStores.get("bankIban").updateValueAndValidity();
      this.store.bank.bank.iban = this.formStores.get("bankIban").value;
    }
    this.store.bank.bank.bank = this.formStores.get("supportBank").value;

    var navigationExtras: NavigationExtras = {
      state: {
        store: this.store
      }
    }

    this.route.navigate(['add-store-product'], navigationExtras);
  }

  onDelete(file: File) {
    if (this.IBANToShow.id != "0") {
      this.tableInfo.deleteDocument(this.submissionId, this.IBANToShow.id).then(sucess => {
        console.log("Sucesso a apagar um documento: ", sucess.msg);
      }, error => {
        console.log("Erro a apagar um ficheiro: ", error.msg);
      });
    }
    this.fileToDelete = file;
    this.IBANToShow = null;

    // const index1 = this.ibansToShow.findIndex(value => value.file == this.fileToDelete);
    // if (index1 > -1)
    //   this.ibansToShow.splice(index1, 1);

    //const index = this.files.indexOf(this.fileToDelete);
    //if (index > -1) {
    //  this.files.splice(index, 1);
    //}

    this.fileToDelete = null;
    // console.log('LISTA DE FILES DEPOIS ELIMINAR ', this.ibansToShow);
    // this.fileEmitter.emit({ ibansToShow: this.ibansToShow });
  }
  
  selectFile(event: any) {
    this.files = [];
    this.newStore.id = 1;
    this.newStore.iban = "teste";
    const files = <File[]>event.target.files;
    this.IBANToShow = { tipo: this.translate.instant('supportingDocuments.checklistModal.IBAN'), dataDocumento: this.datePipe.transform(new Date(), 'dd-MM-yyyy'), file: files[0], id: "0" }
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      const sizeFile = file.size / (1024 * 1024);
      var extensoesPermitidas = /(.pdf)$/i;
      const limSize = 10;
      //this.result = this.http.put(this.baseUrl + 'ServicesComprovativos/', this.newStore.id);
      //if (this.result != null) {
        if ((sizeFile <= limSize) && (extensoesPermitidas.exec(file.name))) {
          if (event.target.files && files[i]) {
            var reader = new FileReader();
            reader.onload = (event: any) => {
              this.localUrl = event.target.result;
            }
            reader.readAsDataURL(files[i]);
            this.files.push(file);
            this.formStores.get('bankIban').setValue(file);
            this.snackBar.open(this.translate.instant('queues.attach.success'), '', {
              duration: 4000,
              panelClass: ['snack-bar']
            });
          } else {
            alert("Verifique o tipo / tamanho do ficheiro");
          }
        }
      //}
    }
    this.fileEmitter.emit({ tipo: this.IBANToShow.tipo, dataDocumento: this.IBANToShow.dataDocumento, file: this.IBANToShow.file, id: this.IBANToShow.id });
  }

  isIBAN(isIBANConsidered: boolean) {
    this.isIBANConsidered = isIBANConsidered;

    if (!isIBANConsidered) {
      this.formStores.get("bankIban").addValidators(Validators.required);
      this.formStores.get("bankIban").updateValueAndValidity();
    } else {
      this.formStores.get("bankIban").setValidators(null);
      this.formStores.get("bankIban").updateValueAndValidity();
    }
  }

  initializeForm() {
    this.store.bank = new ShopBank();
    this.formStores = new FormGroup({
      supportBank: new FormControl((this.bank != null) ? this.bank : '', Validators.required),
      bankInformation: new FormControl((this.store.bank.useMerchantBank != null) ? this.store.bank.useMerchantBank : '', Validators.required),
      bankIban: new FormControl((this.store.bank?.bank?.iban != null) ? this.store.bank.bank.iban : '')
    });
  }

  updateForm() {
    this.formStores.get('supportBank').setValue(this.bank);
  }

  openFile(/*url: any, imgName: any*/ file: File) {
    let blob = new Blob([file], { type: file.type });
    let url = window.URL.createObjectURL(blob);

    window.open(url, '_blank',
      `margin: auto;
      width: 50%;
      padding: 10px;
      text-align: center;
      border: 3px solid green;
      `);

  }

  removeFiles() {
    //this.files = [];
    this.IBANToShow = null;
  }

}
