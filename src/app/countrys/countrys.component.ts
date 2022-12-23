import { Component, Inject, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { distinctUntilChanged, Subscription } from 'rxjs';
import { DataService } from '../nav-menu-interna/data.service';
import { CountryInformation, Franchise } from '../table-info/ITable-info.interface';
import { TableInfoService } from '../table-info/table-info.service';
import * as $ from 'jquery';
import { SubmissionPostTemplate } from '../submission/ISubmission.interface';
import { ProcessNumberService } from '../nav-menu-presencial/process-number.service';
import { StakeholdersProcess } from '../stakeholders/IStakeholders.interface';
import { Configuration, configurationToken } from '../configuration';
import { LoggerService } from 'src/app/logger.service';
import { FileAndDetailsCC } from '../readcard/fileAndDetailsCC.interface';
import { AuthService } from '../services/auth.service';
import { ClientContext } from '../client/clientById/clientById.model';
import { ComprovativosService } from '../comprovativos/services/comprovativos.services';
import { AcquiringClientPost } from '../client/Client.interface';

@Component({
  selector: 'app-countrys',
  templateUrl: './countrys.component.html'
})
export class CountrysComponent implements OnInit {
  continente = '';
  @Input() inline : boolean;
  @Input() clientContext: ClientContext;

  lstCountry: CountryInformation[] = [];
  lstCountry1 : CountryInformation[] = [];
  lstCountry2: CountryInformation[] = [];
  lstCountry3: CountryInformation[] = [];
  contPais : CountryInformation[] = [];

  continenteName: string;

  lstPaisPreenchido: CountryInformation[] = [];

  inputEuropa: boolean = false;
  inputOceania: boolean = false;
  inputAsia: boolean = false;
  inputAfrica: boolean = false;
  inputAmericas: boolean = false;
  inputTypeEuropa: boolean;
  inputTypeOceania: boolean;
  inputTypeAmericas: boolean;
  inputTypeAsia: boolean;
  inputTypeAfrica: boolean;
  statusValue: boolean = false;

  clientExists: boolean;
  associatedWithGroupOrFranchise: boolean = false;
  isAssociatedWithFranchise: boolean;
  form: AbstractControl;

  public map = new Map();
  public currentPage: number;
  public subscription: Subscription;

  countryList: CountryInformation[] = [];
  continentsList: string[] = [];
  checkedContinents = [];


  tipologia: any;
  NIFNIPC: any;
  client: AcquiringClientPost;
  clientId: string;
  processId: string;

  currentClient: any = {};
  crc;
  documentsList = []; //lista de documentos do utilizador

  processNumber: string;
  franchises: Franchise[] = [];

  returned: string;
  merchantInfo: any;
  consult: any;

  stakeholdersToInsert: StakeholdersProcess[];

  @Output() formCountrysReady: EventEmitter<AbstractControl> = new EventEmitter();
  @Output() countryIsValid: EventEmitter<boolean> = new EventEmitter();

  countriesCheckBox = [
    {
      "value": "EUROPA",
      "formControlName": "inputEuropa",
      "isSelected": false
    },
    {
      "value": "AFRICA",
      "formControlName": "inputAfrica",
      "isSelected": false
    },
    {
      "value": "ASIA",
      "formControlName": "inputAsia",
      "isSelected": false
    },
    {
      "value": "AMERICA DO NORTE / SUL",
      "formControlName": "inputAmerica",
      "isSelected": false
    },
    {
      "value": "OCEANIA",
      "formControlName": "inputOceania",
      "isSelected": false
    },

  ];
  comprovativoCC: FileAndDetailsCC;

  countryError: boolean;
  errorMsg: string;
  rootForm: FormGroup;

  ngOnInit() {
    this.subscription = this.processNrService.processNumber.subscribe(processNumber => this.processNumber = processNumber);
    this.returned = localStorage.getItem("returned");
    this.subscription = this.data.currentData.subscribe(map => this.map = map);

    this.client = {
      clientId: '',
        fiscalId: '',
          legalName: '',
            shortName: '',
              headquartersAddress: { },
      merchantType: '',
        commercialName: '',
          legalNature: '',
            legalNature2: '',
              incorporationStatement: { },
      shareCapital: { },
      byLaws: '',
        mainEconomicActivity: '',
          otherEconomicActivities: [],
            mainTaxCode: '',
              otherTaxCodes: [],
                incorporationDate: null,
                  businessGroup: { },
      knowYourSales: { },
      bankInformation: { },
      contacts: { },
      documentationDeliveryMethod: '',
        billingEmail: '',
          merchantRegistrationId: ''
    };


    this.initializeForm();

    if (this.returned == null) {
      if (!this.clientContext.clientExists && this.map.get(2) == undefined) { // garantir que só adicionamos Portugal por default, se o cliente não existir E se o tabulador dos intervenientes ainda não foi visitado
        this.subs.push(this.tableInfo.GetCountryById('PT').subscribe(result => {
          this.contPais.push(result);
          this.inserirText(null);
        }));
      }
    } else {
      if (!this.clientContext?.isClient) {
        this.getMerchantInfoAsync().then(res => {
          this.getClientContextValues();
        });
      }
    }

  }

  getMerchantInfoAsync() {
    return new Promise(resolve => {
      this.clientContext.merchantInfo.subscribe(result => {
        this.merchantInfo = result;
        resolve(true);
      })
    });
  }

  updateValues() {
    var context = this;
    this.clientExists = this.clientContext.clientExists;
    this.tipologia = this.clientContext.tipologia;
    //this.NIFNIPC = this.clientContext.getNIFNIPC();
    this.clientId = this.clientContext.clientId;
    this.processId = this.clientContext.processId;
    this.comprovativoCC = this.clientContext.comprovativoCC;
    this.crc = this.clientContext.crc;
    if (this.returned == null) {
      this.clientContext.currentMerchantInfo.subscribe(result => {
        if (result !== undefined && result !== null) {
          this.newSubmission.merchant = result;
          this.merchantInfo = result;

          console.log("Form: ", this.form);
        }
      })

      this.clientContext.currentClient.subscribe(result => {
        this.client = result;
      });
    } else {
      this.client = this.merchantInfo;
      this.client["documents"] = [];
    }

    this.insertValues();
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub?.unsubscribe);
  }

  public subs: Subscription[] = [];

  constructor(private logger: LoggerService, private authService: AuthService,
    private route: Router, private tableInfo: TableInfoService, private data: DataService, 
    private router: ActivatedRoute, private processNrService: ProcessNumberService,
    private rootFormDirective: FormGroupDirective, private comprovativoService: ComprovativosService) {
    
    var auth = authService.GetCurrentUser();
    this.newSubmission.submissionUser.user = auth.userName;
    this.newSubmission.submissionUser.branch = auth.bankName;
    this.newSubmission.submissionUser.partner = "SIBS";
    this.rootForm = this.rootFormDirective.form;
    //this.form = this.rootForm.get("countrysForm");

    this.subs.push(this.tableInfo.GetAllFranchises().subscribe(result => {
      this.franchises = result;
      this.franchises = this.franchises.sort((a, b) => a.description> b.description? 1 : -1); //ordenar resposta
    }));

    //Chamada à API para receber todos os Paises
    this.subs.push(this.tableInfo.GetAllCountries().subscribe(result => {
      this.countryList = result;
      this.countryList = this.countryList.sort((a, b) => a.description > b.description ? 1 : -1); //ordenar resposta
    }, error => this.logger.debug(error)));

  }

  changeFormStructure(newForm: FormGroup){
    this.rootForm.setControl("countrysForm", newForm);
    this.form = this.rootForm.get("countrysForm");
  }

  insertValues() {

    if (this.clientExists) {
      this.changeFormStructure(new FormGroup({
        expectableAnualInvoicing: new FormControl(this.client.knowYourSales?.estimatedAnualRevenue/*, disabled: true*/ , Validators.required),/*this.client.sales.annualEstimatedRevenue, Validators.required),*/
        services: new FormControl(this.client?.knowYourSales?.servicesOrProductsSold[0]/*, disabled: true */, Validators.required),
        transactionsAverage: new FormControl(this.client.knowYourSales.transactionsAverage/*, disabled: true */, Validators.required/*this.client.sales.averageTransactions, Validators.required*/),
        associatedWithGroupOrFranchise: new FormControl(this.associatedWithGroupOrFranchise, Validators.required),
        preferenceDocuments: new FormControl((this.client?.documentationDeliveryMethod != "viaDigital" && this.client?.documentationDeliveryMethod != 'Portal') ? 'Mail' : 'Portal'),
        inputEuropa: new FormControl(this.inputEuropa),
        inputAfrica: new FormControl(this.inputAfrica),
        inputAmerica: new FormControl(this.inputAmericas),
        inputOceania: new FormControl(this.inputOceania),
        inputAsia: new FormControl(this.inputTypeAsia),
        franchiseName: new FormControl(this.client?.businessGroup?.type == 'Franchise' ? this.client?.businessGroup?.branch : null),
        NIPCGroup: new FormControl(this.client?.businessGroup?.type == 'Group' ? this.client?.businessGroup?.branch : '')
      }));
      this.editCountries(true);
    } else {
      this.changeFormStructure(new FormGroup({
        expectableAnualInvoicing: new FormControl((this.returned != null && this.merchantInfo != undefined && this.merchantInfo.knowYourSales != undefined) ? this.merchantInfo.knowYourSales?.estimatedAnualRevenue : this.client?.knowYourSales?.estimatedAnualRevenue/*, disabled: true*/, Validators.required),/*this.client.sales.annualEstimatedRevenue, Validators.required),*/
        services: new FormControl((this.returned != null && this.merchantInfo != undefined && this.merchantInfo.knowYourSales != undefined) ? this.merchantInfo.knowYourSales.servicesOrProductsSold[0] : this.client?.knowYourSales?.servicesOrProductsSold[0]/*, disabled: true */, Validators.required),
        transactionsAverage: new FormControl((this.returned != null && this.merchantInfo.knowYourSales != undefined) ? this.merchantInfo.knowYourSales.transactionsAverage : this.client?.knowYourSales?.transactionsAverage/*, disabled: true */, Validators.required/*this.client.sales.averageTransactions, Validators.required*/),
        associatedWithGroupOrFranchise: new FormControl(this.associatedWithGroupOrFranchise, Validators.required),
        preferenceDocuments: new FormControl((this.returned != null) ? this.merchantInfo.documentationDeliveryMethod : (this.client?.documentationDeliveryMethod != "viaDigital" && this.client?.documentationDeliveryMethod != 'Portal') ? 'Mail' : 'Portal'),
        inputEuropa: new FormControl(this.inputEuropa),
        inputAfrica: new FormControl(this.inputAfrica),
        inputAmerica: new FormControl(this.inputAmericas),
        inputOceania: new FormControl(this.inputOceania),
        inputAsia: new FormControl(this.inputTypeAsia),
        franchiseName: new FormControl((this.returned != null && this.merchantInfo != undefined && this.merchantInfo?.businessGroup != null && this.merchantInfo?.businessGroup?.type == 'Franchise') ? this.merchantInfo?.businessGroup?.branch : null),
        NIPCGroup: new FormControl((this.returned != null && this.merchantInfo != undefined && this.merchantInfo?.businessGroup != null && this.merchantInfo?.businessGroup?.type == 'Group') ? this.merchantInfo?.businessGroup?.branch : '')
      }));

      if (this.returned != null) {
        this.editCountries(false);
      } else {
        this.editCountries(true);
      }
    }

    

    this.form.get("franchiseName").valueChanges.pipe(distinctUntilChanged()).subscribe(v => {
      if (v != "" && v != null) {
        this.isAssociatedWithFranchise = true;
        this.form.get("franchiseName").setValidators(Validators.required);
        this.form.get("NIPCGroup").setValidators(null);
      } else {
        this.isAssociatedWithFranchise = undefined;
      }
      this.form.get("franchiseName").updateValueAndValidity();
      this.form.get("NIPCGroup").updateValueAndValidity();
    });

    this.form.get("NIPCGroup").valueChanges.pipe(distinctUntilChanged()).subscribe(v => {
      if (v != "" && v != null) {
        this.isAssociatedWithFranchise = false;
        this.form.get("NIPCGroup").setValidators(Validators.required);
        this.form.get("franchiseName").setValidators(null);
      } else {
        this.isAssociatedWithFranchise = undefined;
      }
      this.form.get("franchiseName").updateValueAndValidity();
      this.form.get("NIPCGroup").updateValueAndValidity();
    });


  }

  initializeForm() {
    console.log("form inicializado");
    this.changeFormStructure(new FormGroup({
      expectableAnualInvoicing: new FormControl('', Validators.required),/*this.client.sales.annualEstimatedRevenue, Validators.required),*/
      services: new FormControl('', Validators.required),
      transactionsAverage: new FormControl('', Validators.required/*this.client.sales.averageTransactions, Validators.required*/),
      associatedWithGroupOrFranchise: new FormControl(false, Validators.required),
      preferenceDocuments: new FormControl('Portal', Validators.required),
      inputEuropa: new FormControl(this.inputEuropa),
      inputAfrica: new FormControl(this.inputAfrica),
      inputAmerica: new FormControl(this.inputAmericas),
      inputOceania: new FormControl(this.inputOceania),
      inputAsia: new FormControl(this.inputTypeAsia),
      franchiseName: new FormControl(null),
      NIPCGroup: new FormControl('')
    }));    

    this.form.get("franchiseName").valueChanges.pipe(distinctUntilChanged()).subscribe(v => {
      if (v != "" && v != null) {
        this.isAssociatedWithFranchise = true;
        this.form.get("franchiseName").setValidators(Validators.required);
        this.form.get("NIPCGroup").setValidators(null);
      } else {
        this.isAssociatedWithFranchise = undefined;
      }
      this.form.get("franchiseName").updateValueAndValidity();
      this.form.get("NIPCGroup").updateValueAndValidity();
    });

    this.form.get("NIPCGroup").valueChanges.pipe(distinctUntilChanged()).subscribe(v => {
      if (v != "" && v != null) {
        this.isAssociatedWithFranchise = false;
        this.form.get("NIPCGroup").setValidators(Validators.required);
        this.form.get("franchiseName").setValidators(null);
      } else {
        this.isAssociatedWithFranchise = undefined;
      }
      this.form.get("franchiseName").updateValueAndValidity();
      this.form.get("NIPCGroup").updateValueAndValidity();
    });

    this.formCountrysReady.emit(this.form);
    console.log('FORM DOS COUNTRIES INICIALIZADO ', this.form);
  }

  newSubmission: SubmissionPostTemplate = {
    "submissionType": "DigitalFirstHalf",
    "processKind": "MerchantOnboarding",
    "processType": "Standard",
    "isClientAwaiting": true,
    "submissionUser": {
      "user": "teste",
      "branch": "branch01",
      "partner": "SIBS"
    },
    "startedAt": new Date() + '',
    "state": "Incomplete",
    "bank": "0800", //no futuro e para usar o token
    "merchant": null,
    "stakeholders": null,
    "documents": null
  }

  submit() {
    var client: AcquiringClientPost = this.clientContext.getClient() as AcquiringClientPost;

    client["knowYourSales"]["estimatedAnualRevenue"] = this.form.get("expectableAnualInvoicing").value;
    client["knowYourSales"]["transactionsAverage"] = this.form.get("transactionsAverage").value;
    client["knowYourSales"]["servicesOrProductsSold"] = [this.form.get("services").value]; //
    client["knowYourSales"]["servicesOrProductsDestinations"] = this.lstPaisPreenchido.map(country => country.code);
    client["documentationDeliveryMethod"] = this.form.get("preferenceDocuments").value;


    this.clientContext.setClient(client);
    //var navigationExtras: NavigationExtras = {
    //  state: {
    //    clientExists: this.clientExists,
    //    tipologia: this.tipologia,
    //    NIFNIPC: this.NIFNIPC,
    //    client: this.client,
    //    clientId: this.clientId,
    //    processId: this.processId,
    //    stakeholdersToInsert: this.stakeholdersToInsert,
    //    merchantInfo: this.merchantInfo,
    //    crc: this.crc
    //  }
    //}
  }

  b64toBlob(b64Data: any, contentType: string, sliceSize: number) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    const blobUrl = window.URL.createObjectURL(blob);
    window.open(blobUrl, '_blank',
      `margin: auto;
      width: 50%;
      padding: 10px;
      text-align: center;
      border: 3px solid green;` );
  }

  setAssociatedWith(value: boolean) {
    this.associatedWithGroupOrFranchise = value;
    if (value) {
      this.form.get("franchiseName").setValidators(Validators.required);
      this.form.get("NIPCGroup").setValidators(Validators.required);
    } else {
      this.form.get("franchiseName").setValidators(null);
      this.form.get("NIPCGroup").setValidators(null);
      this.form.get("franchiseName").setValue(null);
      this.form.get("NIPCGroup").setValue('');
    }
    this.form.get("franchiseName").updateValueAndValidity();
    this.form.get("NIPCGroup").updateValueAndValidity();
    console.log('O FORM ESTÁ VÁLIDO? ', this.form.valid);
  }

  onCountryChange(country) {
    var index = this.contPais.findIndex(elem => elem.description == country.description);
    if (index > -1) {
      this.contPais.splice(index, 1);
    } else {
      this.contPais.push(country);
    }
  }

  countryExists(item) {
    var index = this.contPais.findIndex(elem => elem.description == item.description);
    if (index > -1)
      return true;
    return false;
  }

  countrys(item) {
    this.countriesCheckBox.forEach(val => {
      if (val.value == item.value) {
        val.isSelected = !val.isSelected;
      } else {
        val.isSelected = false;
      }
    });

    this.lstCountry.splice(0, this.lstCountry.length);
    this.lstCountry1.splice(0, this.lstCountry1.length);
    this.lstCountry2.splice(0, this.lstCountry2.length);
    this.lstCountry3.splice(0, this.lstCountry3.length);

    this.valueInput();
    var count = 0;
    switch (item.value) {
      case 'EUROPA':
        if (this.inputEuropa == false) {
          this.inputEuropa = true;
          this.inputAfrica = false;
          this.inputAmericas = false;
          this.inputAsia = false;
          this.inputOceania = false;
          this.countryList.forEach(country => {
            if (country.continent == "Europa") {
              if (count <= 11) {
                this.lstCountry.push(country)
              } else {
                if (count <= 23) {
                  this.lstCountry1.push(country);
                } else {
                  if (count <= 35) {
                    this.lstCountry2.push(country);
                  } else {
                    this.lstCountry3.push(country);
                  }
                }
              }
              count++;
            }
          });

        } else {
          this.inputEuropa = false;
        }
        break;
      case 'AFRICA':
        if (this.inputAfrica == false) {
          this.inputAfrica = true;
          this.inputEuropa = false;
          this.inputAmericas = false;
          this.inputAsia = false;
          this.inputOceania = false;
          this.countryList.forEach(country => {
            if (country.continent == "Africa") {
              if (count <= 11) {
                this.lstCountry.push(country)
              } else {
                if (count <= 23) {
                  this.lstCountry1.push(country);
                } else {
                  if (count <= 35) {
                    this.lstCountry2.push(country);
                  } else {
                    this.lstCountry3.push(country);
                  }
                }
              }
              count++;
            }
          });

        } else {
          this.inputAfrica = false;
        }
        break;
      case 'OCEANIA':
        if (this.inputOceania == false) {
          this.inputOceania = true;
          this.inputAfrica = false;
          this.inputAmericas = false;
          this.inputAsia = false;
          this.inputEuropa = false;
          this.countryList.forEach(country => {
            if (country.continent == "Oceania") {
              if (count <= 11) {
                this.lstCountry.push(country)
              } else {
                if (count <= 23) {
                  this.lstCountry1.push(country);
                } else {
                  if (count <= 35) {
                    this.lstCountry2.push(country);
                  } else {
                    this.lstCountry3.push(country);
                  }
                }
              }
              count++;
            }
          });

        } else {
          this.inputOceania = false;
        }
        break;
      case 'ASIA':
        if (this.inputAsia == false) {
          this.inputAsia = true;
          this.inputAfrica = false;
          this.inputAmericas = false;
          this.inputEuropa = false;
          this.inputOceania = false;
          this.countryList.forEach(country => {
            if (country.continent == "Ásia") {
              if (count <= 11) {
                this.lstCountry.push(country)
              } else {
                if (count <= 23) {
                  this.lstCountry1.push(country);
                } else {
                  if (count <= 35) {
                    this.lstCountry2.push(country);
                  } else {
                    this.lstCountry3.push(country);
                  }
                }
              }
              count++;
            }
          });

        } else {
          this.inputAsia = false;
        }
        break;
      case 'AMERICA DO NORTE / SUL':
        if (this.inputAmericas == false) {
          this.inputAmericas = true;
          this.inputAfrica = false;
          this.inputEuropa = false;
          this.inputAsia = false;
          this.inputOceania = false;
          this.countryList.forEach(country => {
            if (country.continent == "América Norte" || country.continent == "América Central" || country.continent == "América Sul") {
              if (count <= 11) {
                this.lstCountry.push(country)
              } else {
                if (count <= 23) {
                  this.lstCountry1.push(country);
                } else {
                  if (count <= 35) {
                    this.lstCountry2.push(country);
                  } else {
                    this.lstCountry3.push(country);
                  }
                }
              }
              count++;
            }
          });

        } else {
          this.inputAmericas = false;
        }
        break;
    }
  }

  removeCountryFromList(country: CountryInformation, countryList: CountryInformation[]) {
    var index = countryList.findIndex(elem => elem.description == country.description);
    if (index > -1) {
      countryList.splice(index, 1);
    }
  }

  valueInput() {
    this.inputTypeEuropa = this.inputEuropa;
    this.inputTypeOceania = this.inputOceania;
    this.inputTypeAmericas = this.inputAmericas;
    this.inputTypeAsia = this.inputAsia;
    this.inputTypeAfrica = this.inputAfrica;
  }

  inserirText(form: any) {

    $('#text5').val('');

    if (this.contPais.length > 0) {
      this.lstPaisPreenchido = [];

      this.contPais.forEach(elem => {
        this.lstPaisPreenchido.push(elem);
      });


      this.lstPaisPreenchido.forEach(country => {
        $('#text5').val($('#text5').val() + country.description + ', ');
      });

    }
    this.emitteCountrySize();
  }

  redirectToClientById() {
    let navigationExtras: NavigationExtras = {
      state: {
        NIFNIPC: this.NIFNIPC,
        tipologia: this.tipologia
      }
    };
    this.route.navigate(["/clientbyid", this.router.snapshot.paramMap.get('id')], navigationExtras);
  }

  goBackToHomePage() {
    this.route.navigate(["/"]);
  }

  editCountries(normalSubmssion: boolean) {
    if (normalSubmssion) {
      this.client.knowYourSales.servicesOrProductsDestinations.forEach(countryID => {
        this.subs.push(this.tableInfo.GetCountryById(countryID).subscribe(result => {
          this.contPais.push(result);
          this.inserirText(null);
        }));
      });
    } else {
      this.merchantInfo.knowYourSales.servicesOrProductsDestinations.forEach(countryID => {
        this.subs.push(this.tableInfo.GetCountryById(countryID).subscribe(result => {
          this.contPais.push(result);
          this.inserirText(null);
        }));
      });
    }
    this.emitteCountrySize();
  }

  loadClientDocument(documentReference) {

    this.comprovativoService.viewDocument(documentReference);
  }

  numericOnly(event): boolean { // restrict e,+,-,E characters in  input type number
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode == 101 || charCode == 69 || charCode == 45 || charCode == 43) {
      return false;
    }
    return true;

  }

  emitteCountrySize() {
    this.countryIsValid.emit((this.lstPaisPreenchido.length > 0)); // antes estava countryList
  }

  getCurrentClientAsync() {
    return new Promise(resolve => {
      this.clientContext.currentClient.subscribe(result => {
        this.client = result;
        resolve(true);
      });
    });
  }

  getClientContextValues() {

    if (this.returned != 'consult') {
      this.clientExists = this.clientContext?.clientExists;
    } else {
      console.log('CLIENT CONTEXT ', this.clientContext);
      this.clientExists = false;
    }

    this.getCurrentClientAsync().then(val => {

      if (this.client?.knowYourSales?.servicesOrProductsDestinations?.length == 0) {
        this.subs.push(this.tableInfo.GetCountryById('PT').subscribe(result => {
          this.contPais.push(result);
          this.inserirText(null);
        }));
      }

      this.insertValues();

      if (this.client.businessGroup.type == "Holding") {
        this.setAssociatedWith(true);
        this.form.get("NIPCGroup").setValue(this.client.businessGroup.branch);
      }
      if (this.client.businessGroup.type == "Franchising") {
        this.setAssociatedWith(true);
        this.form.get("NIPCGroup").setValue(this.client.businessGroup.branch);
      }

      this.formCountrysReady.emit(this.form);
      console.log('FORM EMITIDO DO GET CLIENT CONTEXT ', this.form);
    });

  }
}
