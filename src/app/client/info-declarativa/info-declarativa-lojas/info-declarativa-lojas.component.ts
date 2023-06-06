import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { NavigationExtras, Router } from '@angular/router';
import { DataService } from 'src/app/nav-menu-interna/data.service';
import { ShopDetailsAcquiring } from '../../../store/IStore.interface';
import { StoreService } from '../../../store/store.service';
import { CountryInformation } from '../../../table-info/ITable-info.interface';
import { TableInfoService } from '../../../table-info/table-info.service';
import { Client, Phone } from '../../Client.interface';
import { ClientService } from '../../client.service';
import { validPhoneNumber, validPhoneAndMobileNumber } from '../info-declarativa.model';
import { LoggerService } from 'src/app/logger.service';
import { EquipmentOwnershipTypeEnum, CommunicationOwnershipTypeEnum, ProductPackKindEnum } from '../../../commercial-offer/ICommercialOffer.interface';
import { distinctUntilChanged, Observable, of, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ProcessService } from '../../../process/process.service';
import { ProcessNumberService } from '../../../nav-menu-presencial/process-number.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-info-declarativa-lojas',
  templateUrl: './info-declarativa-lojas.component.html',
  styleUrls: ['./info-declarativa-lojas.component.css']
})

export class InfoDeclarativaLojasComponent implements OnInit, AfterViewInit {
  public EquipmentOwnershipTypeEnum = EquipmentOwnershipTypeEnum;
  public CommunicationOwnershipTypeEnum = CommunicationOwnershipTypeEnum;
  public ProductPackKindEnum = ProductPackKindEnum;

  public stores: ShopDetailsAcquiring[] = [];

  public selectedStore: ShopDetailsAcquiring = null;

  displayedColumns: string[] = ['nameEstab', 'activityEstab', 'subActivityEstab', 'zoneEstab'];
  dataSource: MatTableDataSource<ShopDetailsAcquiring>;

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
  queueName: string = "";
  title: string;
  public subscription: Subscription;
  public visitedStores: string[] = [];

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  public subs: Subscription[] = [];
  returnedFrontOffice: boolean = false;
  processId: string;
  updateProcessId: string;

  constructor(private logger: LoggerService, private formBuilder: FormBuilder, private route: Router, private data: DataService, private tableInfo: TableInfoService, private storeService: StoreService, private clientService: ClientService, private translate: TranslateService, private processService: ProcessService, private processNrService: ProcessNumberService, private snackBar: MatSnackBar) {
    if (this.route?.getCurrentNavigation()?.extras?.state) {
      this.returnedFrontOffice = this.route.getCurrentNavigation().extras.state["returnedFrontOffice"];
    }
    this.subscription = this.processNrService.processId.subscribe(id => this.processId = id);
    this.subscription = this.processNrService.updateProcessId.subscribe(id => this.updateProcessId = id);
    this.returned = localStorage.getItem("returned");
    this.subs.push(this.tableInfo.GetAllCountries().subscribe(result => {
      this.logger.info("Fetch all countries " + JSON.stringify(result));
      this.internationalCallingCodes = result;
      this.internationalCallingCodes = this.internationalCallingCodes.sort(function (a, b) {
        return a.description.localeCompare(b.description, 'pt-PT');
      }); //ordenar resposta
    }, error => this.logger.error(error)));

    if (this.returned == null || this.returned == 'edit' && (this.processId == null || this.processId == '')) {
      this.clientService.GetClientByIdAcquiring(localStorage.getItem("submissionId")).then(result => {
        this.logger.info("Get client by id result: " + result);
        this.client = result;
      });
    } else {
      if (this.returned == 'consult') {
        this.processService.getMerchantFromProcess(this.processId).subscribe(result => {
          this.client = result;
        });
      } else {
        this.processService.getUpdateProcessInfo(this.processId, this.updateProcessId).then(result => {
          this.client = result.result.merchant;
        });
      }
    }

  }

  ngOnInit(): void {
    this.data.updateData(false, 6, 3);
    this.subscription = this.data.currentQueueName.subscribe(queueName => {
      if (queueName != null) {
        this.translate.get('homepage.diaryPerformance').subscribe((translated: string) => {
          this.queueName = this.translate.instant('homepage.' + queueName);
          this.title = this.translate.instant('declarativeInformation.title');
        });
      }
    });
    this.submissionId = localStorage.getItem("submissionId");
    this.processNumber = localStorage.getItem("processNumber");

    this.listValue = this.formBuilder.group({
      cellphone: this.formBuilder.group({
        countryCode: new FormControl(this.selectedStore?.phone1 != null ? this.selectedStore?.phone1?.phoneIndicative : this.client?.contacts?.phone1?.phoneIndicative),
        phoneNumber: new FormControl(this.selectedStore?.phone1 != null ? this.selectedStore?.phone1?.phoneNumber : this.client?.contacts?.phone1?.phoneNumber, Validators.required)
      }, { validators: [validPhoneNumber] }),
      telephone: this.formBuilder.group({
        countryCode: new FormControl(this.selectedStore?.phone2 != null ? this.selectedStore?.phone2?.phoneIndicative : this.client?.contacts?.phone2?.phoneIndicative), //telefone
        phoneNumber: new FormControl(this.selectedStore?.phone2 != null ? this.selectedStore?.phone2?.phoneNumber : this.client?.contacts?.phone2?.phoneNumber, Validators.required)
      }, { validators: [validPhoneAndMobileNumber] }),
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
    });

    this.listValue.get("telephone").get("phoneNumber").valueChanges.pipe(distinctUntilChanged()).subscribe(val => {
      if (val != null && val != "") {
        this.listValue.get("cellphone").get("phoneNumber").setValidators(null);
      } else {
        this.listValue.get("cellphone").get("phoneNumber").setValidators(Validators.required);
      }
      this.listValue.get("cellphone").get("phoneNumber").updateValueAndValidity();
    });

    if (this.returned == 'consult') {
      this.listValue.disable();
    }
  }

  get emailValid() {
    return this.listValue.get('email');
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub?.unsubscribe);
  }

  getVisitedStores(visitedStores) {
    this.visitedStores = visitedStores;
  }

  changeListElement(variavel: string, e: any) {
  }

  selectStore(info) {
    if (info.clickedTable) {
      this.submit(true);
    }
    this.selectedStore = info.store;
    this.currentIdx = info.idx;
    this.logger.info("Selected store " + JSON.stringify(this.selectedStore));
    this.logger.info("Selected store index " + this.currentIdx);
    setTimeout(() => this.setForm(), 500);
  }

  submit(clickedTable: boolean = false) {
    if (this.returned != 'consult') {
      if (this.listValue.valid) {
        this.selectedStore.email = this.listValue.get("email").value;
        this.selectedStore.phone1 = new Phone();
        this.selectedStore.phone2 = new Phone();
        this.selectedStore.phone1.countryCode = this.listValue.get("cellphone").get("countryCode").value;
        this.selectedStore.phone1.phoneNumber = this.listValue.get("cellphone").get("phoneNumber").value;
        this.selectedStore.phone2.countryCode = this.listValue.get("telephone").get("countryCode").value;
        this.selectedStore.phone2.phoneNumber = this.listValue.get("telephone").get("phoneNumber").value;
        this.logger.info("Shop data to send " + JSON.stringify(this.selectedStore));
        if (this.returned == null || (this.returned == 'edit' && (this.processId == null || this.processId == ''))) {
          if (!this.listValue.pristine) {
            this.storeService.updateSubmissionShop(localStorage.getItem("submissionId"), this.selectedStore.id, this.selectedStore).subscribe(result => {
              this.visitedStores.push(result.id);
              this.visitedStores = Array.from(new Set(this.visitedStores));
              if (!clickedTable) {
                if (this.visitedStores.length < this.storesLength) {
                  this.emitUpdatedStore(of({ store: this.selectedStore, idx: this.currentIdx }));
                  this.onActivate();
                  this.logger.info("Updated shop: " + JSON.stringify(result));
                } else {
                  this.logger.info("Redirecting to Info Declarativa Assinatura page");
                  this.route.navigate(['/info-declarativa-assinatura']);
                }
              }
            });
          } else {
            this.visitedStores.push(this.selectedStore.id);
            this.visitedStores = Array.from(new Set(this.visitedStores));
            if (!clickedTable) {
              if (this.visitedStores.length < this.storesLength) {
                this.emitUpdatedStore(of({ store: this.selectedStore, idx: this.currentIdx }));
                this.onActivate();
              } else {
                this.logger.info("Redirecting to Info Declarativa Assinatura page");
                this.route.navigate(['/info-declarativa-assinatura']);
              }
            }
          }
        } else {
          if (!this.listValue.pristine) {
            this.processService.updateShopProcess(this.processId, this.selectedStore.id, this.selectedStore).then(result => {
              this.visitedStores.push(result.result.id);
              this.visitedStores = Array.from(new Set(this.visitedStores));
              if (!clickedTable) {
                if (this.visitedStores.length < this.storesLength) {
                  this.emitUpdatedStore(of({ store: this.selectedStore, idx: this.currentIdx }));
                  this.onActivate();
                  this.logger.info("Updated shop: " + JSON.stringify(result));
                } else {
                  this.logger.info("Redirecting to Info Declarativa Assinatura page");
                  this.route.navigate(['/info-declarativa-assinatura']);
                }
              }
            });
          } else {
            this.visitedStores.push(this.selectedStore.id);
            this.visitedStores = Array.from(new Set(this.visitedStores));
            if (!clickedTable) {
              if (this.visitedStores.length < this.storesLength) {
                this.emitUpdatedStore(of({ store: this.selectedStore, idx: this.currentIdx }));
                this.onActivate();
              } else {
                this.logger.info("Redirecting to Info Declarativa Assinatura page");
                this.route.navigate(['/info-declarativa-assinatura']);
              }
            }
          }
        }
      } else {
        this.listValue.markAllAsTouched();
        this.snackBar.open(this.translate.instant('generalKeywords.formInvalid'), '', {
          duration: 15000,
          panelClass: ['snack-bar']
        });
      }
    } else {
      if (!clickedTable) {
        this.logger.info("Redirecting to Info Declarativa Assinatura page");
        this.route.navigate(['/info-declarativa-assinatura']);
      }
    }
    this.listValue.markAsPristine();
    this.listValue.markAsUntouched();
  }

  loadStores(storesValues: ShopDetailsAcquiring[]) {
    this.dataSource = new MatTableDataSource(storesValues);
    this.dataSource.paginator = this.paginator;
  }

  setForm() {
    this.listValue.get("cellphone").get("countryCode").setValue(this.selectedStore?.phone1 != null ? this.selectedStore?.phone1?.countryCode : this.client?.contacts?.phone1?.countryCode);
    this.listValue.get("cellphone").get("phoneNumber").setValue(this.selectedStore?.phone1 != null ? this.selectedStore?.phone1?.phoneNumber : this.client?.contacts?.phone1?.phoneNumber);
    this.listValue.get("telephone").get("countryCode").setValue(this.selectedStore?.phone2 != null ? this.selectedStore?.phone2?.countryCode : this.client?.contacts?.phone2?.countryCode);
    this.listValue.get("telephone").get("phoneNumber").setValue(this.selectedStore?.phone2 != null ? this.selectedStore?.phone2?.phoneNumber : this.client?.contacts?.phone2?.phoneNumber);
    this.listValue.get("email").setValue(this.selectedStore?.email != null ? this.selectedStore?.email : this.client?.contacts?.email);
    if (this.selectedStore.phone1 == null && this.selectedStore.phone2 == null) {
        this.listValue.markAsDirty();
    }
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

  goBack() {
    let navigationExtras = {
      state: {
        returnedFrontOffice: this.returnedFrontOffice
      }
    } as NavigationExtras;
    this.route.navigate(['info-declarativa-stakeholder'], navigationExtras);
  }

  openCancelPopup() {
    //this.cancelModalRef = this.modalService.show(this.cancelModal);
    this.route.navigate(['/']);
  }

  closeCancelPopup() {
    //this.cancelModalRef?.hide();
  }

  confirmCancel() {
    //var context = this;
    //var processNumber = "";
    //this.processNrService.processNumber.subscribe(res => processNumber = res);
    //var encodedCode = encodeURIComponent(processNumber);
    //var baseUrl = this.configuration.getConfig().acquiringAPIUrl;
    //var url = baseUrl + 'process?number=' + encodedCode;
    //this.processService.advancedSearch(url, 0, 1).subscribe(result => {
    //  context.queueService.markToCancel(result.items[0].processId, context.authService.GetCurrentUser().userName).then(res => {
    //    context.closeCancelPopup();
    //    context.route.navigate(['/']);
    //  });
    //});
  }
}
