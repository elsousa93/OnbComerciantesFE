import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Client, Contacts, Phone } from '../Client.interface'
import { FormBuilder } from '@angular/forms';
import { EventEmitter, Output } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { DataService } from '../../nav-menu-interna/data.service';
import { distinctUntilChanged, Subscription } from 'rxjs';
import { TableInfoService } from '../../table-info/table-info.service';
import { CountryInformation } from '../../table-info/ITable-info.interface';
import { SubmissionService } from '../../submission/service/submission-service.service';
import { ClientService } from '../client.service';
import { infoDeclarativaForm, validPhoneNumber, validPhoneAndMobileNumber } from 'src/app/client/info-declarativa/info-declarativa.model';
import { LoggerService } from 'src/app/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { ProcessService } from '../../process/process.service';
import { ProcessNumberService } from '../../nav-menu-presencial/process-number.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-info-declarativa',
  templateUrl: './info-declarativa.component.html',
  styleUrls: ['./info-declarativa.component.css']
})
export class InfoDeclarativaComponent implements OnInit {

  public oferta = "";
  e: any;

  listValue!: FormGroup;
  phone1: AbstractControl;
  phone2: AbstractControl;
  phone1CountryCode?: string = "";
  phone2CountryCode?: string = "";
  faxPhoneNumber?: string = "";
  faxCountryCode?: string = "";

  displayValueSearch = '';

  //Informação de campos/tabelas
  internationalCallingCodes: CountryInformation[];

  public newClient: Client = null;

  @Output() nameEmitter = new EventEmitter<string>();

  public map: Map<number, boolean>;
  public currentPage: number;
  public subscription: Subscription;

  public returned: string;
  public merchantInfo: any;

  public emailRegex: string;
  returnedFrontOffice: boolean = false;
  queueName: string = "";
  title: string;
  processId: string;
  updateProcessId: string;

  setForm(client: Client) {
    this.newClient = client;
    this.listValue.get("comercialName").setValue(client?.commercialName);
    this.listValue.get("phone1").get("countryCode").setValue((client?.contacts?.phone1?.countryCode != "" && client?.contacts?.phone1?.countryCode != null) ? client?.contacts?.phone1?.countryCode : 'PT')
    this.listValue.get("phone1").get("phoneNumber").setValue(client?.contacts?.phone1?.phoneNumber);
    this.listValue.get("phone2").get("countryCode").setValue(client?.contacts?.phone2?.countryCode);
    this.listValue.get("phone2").get("phoneNumber").setValue(client?.contacts?.phone2?.phoneNumber);
    this.listValue.get("email").setValue(client?.contacts?.email);
    if (client?.billingEmail == null || client?.billingEmail == "") {
      this.listValue.get("billingEmail").setValue(client?.contacts?.email);
    } else {
      this.listValue.get("billingEmail").setValue(client?.billingEmail);
    }
  }

  public subs: Subscription[] = [];

  constructor(private logger: LoggerService, private formBuilder: FormBuilder, private router: Router, private data: DataService, private tableInfo: TableInfoService, private submissionService: SubmissionService, private clientService: ClientService, private translate: TranslateService, private processService: ProcessService, private processNrService: ProcessNumberService, private snackBar: MatSnackBar) {

    if (this.router?.getCurrentNavigation()?.extras?.state) {
      this.returnedFrontOffice = this.router.getCurrentNavigation().extras.state["returnedFrontOffice"];
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

    this.emailRegex = '^(([^<>()\\[\\]\\\.,;:\\s@"]+(\.[^<>()\\[\\]\\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\.[0-9]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$';

    this.listValue = this.formBuilder.group({
      comercialName: new FormControl(this.newClient?.commercialName, Validators.required),
      phone1: this.formBuilder.group({
        countryCode: new FormControl((this.newClient?.contacts?.phone1?.countryCode != null && this.newClient?.contacts?.phone1?.countryCode != "") ? this.newClient?.contacts?.phone1?.countryCode : 'PT'),
        phoneNumber: new FormControl(this.newClient?.contacts?.phone1?.phoneNumber, Validators.required),
      }, { validators: [validPhoneNumber] }),
      phone2: this.formBuilder.group({
        countryCode: new FormControl(this.newClient?.contacts?.phone2?.countryCode),
        phoneNumber: new FormControl(this.newClient?.contacts?.phone2?.phoneNumber, Validators.required),
      }, { validators: [validPhoneAndMobileNumber] }),
      email: new FormControl(this.newClient?.contacts?.email, [Validators.required, Validators.pattern(this.emailRegex)]),
      billingEmail: new FormControl((this.newClient?.billingEmail != null || this.newClient?.billingEmail != "") ? this.newClient?.billingEmail : this.newClient?.contacts?.email, [Validators.pattern(this.emailRegex)])
    });

    this.phone1 = this.listValue.get("phone1");
    this.phone2 = this.listValue.get("phone2");

    this.listValue.get("phone1").get("phoneNumber").valueChanges.pipe(distinctUntilChanged()).subscribe(val => {
      if (val != null && val != "") {
        this.listValue.get("phone2").get("phoneNumber").setValidators(null);
      } else {
        this.listValue.get("phone2").get("phoneNumber").setValidators(Validators.required);
      }
      this.listValue.get("phone2").get("phoneNumber").updateValueAndValidity();
    });

    this.listValue.get("phone2").get("phoneNumber").valueChanges.pipe(distinctUntilChanged()).subscribe(val => {
      if (val != null && val != "") {
        this.listValue.get("phone1").get("phoneNumber").setValidators(null);
      } else {
        this.listValue.get("phone1").get("phoneNumber").setValidators(Validators.required);
      }
      this.listValue.get("phone1").get("phoneNumber").updateValueAndValidity();
    });

    if (!this.newClient) {
      if (this.returned == null || (this.returned == 'edit' && (this.processId == null || this.processId == ''))) {
        this.clientService.GetClientByIdAcquiring(localStorage.getItem("submissionId")).then(res => {
          this.logger.info("Get Merchant from submission " + JSON.stringify(res));
          this.setForm(res);
        });
      } else {
        if (this.returned == 'consult') {
          this.processService.getMerchantFromProcess(this.processId).subscribe(res => {
            this.logger.info("Get process client by id result: " + JSON.stringify(res));
            this.setForm(res);
          });
        } else {
          this.processService.getUpdateProcessInfo(this.processId, this.updateProcessId).then(res => {
            this.setForm(res.result.merchant);
          });
        }
      }
    } else {
      this.logger.info("Get Merchant from local storage " + JSON.stringify(this.newClient));
    }
  }

  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    this.subscription = this.data.currentQueueName.subscribe(queueName => {
      if (queueName != null) {
        this.translate.get('homepage.diaryPerformance').subscribe((translated: string) => {
          this.queueName = this.translate.instant('homepage.' + queueName);
          this.title = this.translate.instant('declarativeInformation.title');
        });
      }
    });
    this.data.updateData(false, 6, 1);
    this.newClient = JSON.parse(localStorage.getItem("info-declarativa"))?.client ?? this.newClient;
  }

  get emailValid() {
    return this.listValue.get('email');
  }

  get billingEmailValid() {
    return this.listValue.get('billingEmail');
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub?.unsubscribe);
  }

  changeListElement(variavel: string, e: any) {
    if (e.target.id == 'phone1CountryCode') {
      this.listValue.get("phone1").get("countryCode").setValue(e.target.value);
    }
    if (e.target.id == 'phone2CountryCode') {
      this.listValue.get("phone2").get("countryCode").setValue(e.target.value);
    }
    if (e.target.id == 'faxCountryCode') {
      this.listValue.get("faxCountryCode").setValue(e.target.value);
    }
  }

  submit() {
    if (this.returned != 'consult') {
      this.newClient.contacts = new Contacts();
      this.newClient.contacts.phone1 = new Phone();
      this.newClient.contacts.phone2 = new Phone();
      this.newClient.commercialName = this.listValue.get('comercialName').value;
      this.newClient.contacts.phone1.countryCode = this.listValue.get('phone1').get('countryCode').value;
      this.newClient.contacts.phone1.phoneNumber = this.listValue.get('phone1').get('phoneNumber').value;
      this.newClient.contacts.phone2.countryCode = this.listValue.get('phone2').get('countryCode').value;
      this.newClient.contacts.phone2.phoneNumber = this.listValue.get('phone2').get('phoneNumber').value;
      this.newClient.contacts.email = this.listValue.get('email').value;
      this.newClient.billingEmail = this.listValue.get('billingEmail').value;
      let storedForm: infoDeclarativaForm = JSON.parse(localStorage.getItem("info-declarativa")) ?? new infoDeclarativaForm();
      storedForm.client = this.newClient;
      localStorage.setItem("info-declarativa", JSON.stringify(storedForm));
      if (this.listValue.valid) {
        if (!this.listValue.pristine) {
          this.logger.info("Merchant data to send " + JSON.stringify(this.newClient));
          if (this.returned == null || (this.returned == 'edit' && (this.processId == null || this.processId == ''))) {
            this.clientService.EditClient(localStorage.getItem("submissionId"), this.newClient).subscribe(result => {
              this.logger.info("Updated Merchant " + JSON.stringify(result));
              this.logger.info("Redirecting to Info Declarativa Stakeholder page");
              let navigationExtras = {
                state: {
                  returnedFrontOffice: true
                }
              } as NavigationExtras;
              this.router.navigate(['/info-declarativa-stakeholder'], navigationExtras);
            });
          } else {
            this.processService.updateMerchantProcess(this.processId, this.newClient).then(result => {
              this.logger.info("Updated Merchant " + JSON.stringify(result.result));
              this.logger.info("Redirecting to Info Declarativa Stakeholder page");
              let navigationExtras = {
                state: {
                  returnedFrontOffice: true
                }
              } as NavigationExtras;
              this.router.navigate(['/info-declarativa-stakeholder'], navigationExtras);
            });
          }
        } else {
          this.router.navigate(['/info-declarativa-stakeholder']);
        }
      } else {
        this.listValue.markAllAsTouched();
        this.snackBar.open(this.translate.instant('generalKeywords.formInvalid'), '', {
          duration: 15000,
          panelClass: ['snack-bar']
        });
      }
    } else {
      this.logger.info("Redirecting to Info Declarativa Stakeholder page");
      let navigationExtras = {
        state: {
          returnedFrontOffice: true
        }
      } as NavigationExtras;
      this.router.navigate(['/info-declarativa-stakeholder'], navigationExtras);
    }

  }

  numericOnly(event): boolean {
    var ASCIICode = (event.which) ? event.which : event.keyCode;

    if (ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57))
      return false;
    return true;
  }

  focusOutEvent(event: any) {
    if (!this.emailValid.errors?.['email']) {
      this.listValue.get('billingEmail').setValue(event.target.value);
    }
  }

  openCancelPopup() {
    //this.cancelModalRef = this.modalService.show(this.cancelModal);
    this.router.navigate(['/']);
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
