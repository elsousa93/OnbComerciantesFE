import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/nav-menu-interna/data.service';
import { Bank, ShopBank, ShopBankingInformation, ShopDetailsAcquiring } from '../IStore.interface';
import { FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserPermissions } from '../../userPermissions/user-permissions';
import { EquipmentOwnershipTypeEnum, CommunicationOwnershipTypeEnum, ProductPackKindEnum } from '../../commercial-offer/ICommercialOffer.interface';
import { TableInfoService } from 'src/app/table-info/table-info.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { SubmissionDocumentService } from '../../submission/document/submission-document.service';

@Component({
  selector: 'app-store-iban',
  templateUrl: './store-iban.component.html',
  styleUrls: ['./store-iban.component.css']
})

//This component allows to edit the iban field from the store. THere are two options
//1. Use the iban from the cient.
//2. Insert a new iban for the store
export class StoreIbanComponent implements OnInit, OnChanges {
  @Input() parentFormGroup: FormGroup;

  public EquipmentOwnershipTypeEnum = EquipmentOwnershipTypeEnum;
  public CommunicationOwnershipTypeEnum = CommunicationOwnershipTypeEnum;
  public ProductPackKindEnum = ProductPackKindEnum;
  private baseUrl;

  /*variable declarations*/
  public stroreId: number = 0;
  public isIBANConsidered: boolean = null;
  @Input() public IBANToShow: { tipo: string, dataDocumento: string, file: File, id: string };
  public result: any;
  localUrl: any;

  public isCardPresent: boolean = false;
  public isCardNotPresent: boolean = false;
  public isCombinedOffer: boolean = false;
  public isURLFilled: boolean = false;
  public map: Map<number, boolean>;
  public currentPage: number;
  public subscription: Subscription;

  /*CHANGE - Get via service from the clients */
  public commIban: string = "";
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

  constructor(private translate: TranslateService, private datePipe: DatePipe, private snackBar: MatSnackBar, private router: ActivatedRoute, private tableInfo: TableInfoService, private route: Router, private data: DataService, private rootFormGroup: FormGroupDirective, private authService: AuthService, private docService: SubmissionDocumentService) {
    setTimeout(() => this.data.updateData(true, 3, 3), 0);

    this.initializeForm();
    this.authService.currentUser.subscribe(result => {

      if (result.permissions === UserPermissions.BANCA) {
        this.bank = this.authService.GetBank();
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

  onDelete(id: string) {
    if (id != "0") {
      this.docService.DeleteDocumentFromSubmission(this.submissionId, id).subscribe(result => { });
    }
    this.IBANToShow = null;
    this.fileToDelete = null;
    this.formStores.get('bankIban').setValue('');
    this.fileEmitter.emit(null);
  }

  selectFile(event: any) {
    if (this.IBANToShow != null) {
      this.onDelete(this.IBANToShow.id);
    }
    this.files = [];
    const files = <File[]>event.target.files;
    this.IBANToShow = { tipo: this.translate.instant('supportingDocuments.checklistModal.IBAN'), dataDocumento: this.datePipe.transform(new Date(), 'dd-MM-yyyy'), file: files[0], id: "0" }
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      const sizeFile = file.size / (1024 * 1024);
      var extensoesPermitidas = /(.pdf)$/i;
      const limSize = 10;
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
    this.IBANToShow = null;
    this.fileEmitter.emit(null);
  }
}
