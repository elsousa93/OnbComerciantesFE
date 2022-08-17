import { HttpClient } from '@angular/common/http';
import { Component, Inject, Injectable, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DataService } from '../nav-menu-interna/data.service';
import { SubmissionService } from '../submission/service/submission-service.service';
import { CountryInformation } from '../table-info/ITable-info.interface';
import { TableInfoService } from '../table-info/table-info.service';
import * as $ from 'jquery';
import { SubmissionPostTemplate } from '../submission/ISubmission.interface';
import { Client, Crc } from '../client/Client.interface';
import { ClientService } from '../client/client.service';
import { ClientForProcess, ProcessService } from '../process/process.service';
import { SubmissionDocumentService } from '../submission/document/submission-document.service';
import { ProcessNumberService } from '../nav-menu-presencial/process-number.service';
import { StakeholderService } from '../stakeholders/stakeholder.service';
import { StakeholdersProcess } from '../stakeholders/IStakeholders.interface';
import { Configuration, configurationToken } from '../configuration';
import { StoreService } from '../store/store.service';
import { ShopDetailsAcquiring } from '../store/IStore.interface';
import { NGXLogger } from 'ngx-logger';
@Component({
  selector: 'app-countrys',
  templateUrl: './countrys.component.html'
})
export class CountrysComponent implements OnInit {
  continente = '';

  lstCountry: CountryInformation[] = [];
  lstCountry1 : CountryInformation[] = [];
  lstCountry2 : CountryInformation[] = [];
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
  form: FormGroup;

  public map = new Map();
  public currentPage: number;
  public subscription: Subscription;

  countryList: CountryInformation[] = [];
  continentsList: string[] = [];
  checkedContinents = [];

  tipologia: any;
  NIFNIPC: any;
  client: any;
  clientId: string;
  processId: string;

  currentClient: any = {};
  crc;
  documentsList = []; //lista de documentos do utilizador

  processNumber: string;

  returned: string;
  merchantInfo: any;
  consult: any;

  stakeholdersToInsert: StakeholdersProcess[];

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

  ngOnInit() {
    this.initializeForm();
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    this.data.updateData(false, 1, 3);
    this.subscription = this.processNrService.processNumber.subscribe(processNumber => this.processNumber = processNumber);
    this.returned = localStorage.getItem("returned");
  }

  constructor(private logger : NGXLogger, private http: HttpClient, @Inject(configurationToken) private configuration: Configuration,
    private route: Router, private tableInfo: TableInfoService, private submissionService: SubmissionService, private data: DataService, private processService: ProcessService,
    private router: ActivatedRoute, private clientService: ClientService, private documentService: SubmissionDocumentService, private processNrService: ProcessNumberService, private stakeholderService: StakeholderService, private storeService: StoreService) {
    this.ngOnInit();
    if (this.route.getCurrentNavigation().extras.state) {
      this.clientExists = this.route.getCurrentNavigation().extras.state["clientExists"];
      this.tipologia = this.route.getCurrentNavigation().extras.state["tipologia"];
      this.NIFNIPC = this.route.getCurrentNavigation().extras.state["NIFNIPC"];
      this.client = this.route.getCurrentNavigation().extras.state["client"];
      this.clientId = this.route.getCurrentNavigation().extras.state["clientId"];
      this.processId = this.route.getCurrentNavigation().extras.state["processId"];
      this.stakeholdersToInsert = this.route.getCurrentNavigation().extras.state["stakeholders"];
      this.merchantInfo = this.route.getCurrentNavigation().extras.state["merchantInfo"];
      if (this.route.getCurrentNavigation().extras.state["crc"])
        this.crc = this.route.getCurrentNavigation().extras.state["crc"];
    }

    if (this.returned !== null) {
      if (this.merchantInfo.documentationDeliveryMethod == 'viaDigital') {
        this.form.get("preferenceDocuments").setValue("viaDigital");
      } else {
        this.form.get("preferenceDocuments").setValue("Mail");
      }

      if (this.merchantInfo.businessGroup !== null) {
        if (this.merchantInfo.businessGroup.type === 'Franchise') {
          this.form.get("franchiseName").setValue(this.merchantInfo.businessGroup.branch);
          this.setAssociatedWith(true);
        }
        if (this.merchantInfo.businessGroup.type === 'Group') {
          this.form.get("NIPCGroup").setValue(this.merchantInfo.businessGroup.branch);
          this.setAssociatedWith(true);
        }
        if (this.merchantInfo.businessGroup.type === 'Isolated') {
          this.setAssociatedWith(false);
        }
      } else {
        this.setAssociatedWith(false);
      }
      this.editCountries();
    }

    //Chamada à API para receber todos os Paises
    this.tableInfo.GetAllCountries().subscribe(result => {
      this.countryList = result;
    }, error => this.logger.debug(error));

    //this.logger.debug("por entrar no clientbyid");
    //this.clientService.getClientByID(this.clientId, "8ed4a062-b943-51ad-4ea9-392bb0a23bac", "22195900002451", "fQkRbjO+7kGqtbjwnDMAag==").subscribe(result => {
    //  this.logger.debug("entrou no getclientbyid");
    //  this.currentClient = result;
    //  this.logger.debug(result);
    //  this.logger.debug(this.currentClient);
    //});

    //this.documentService.GetSubmissionDocuments("1a1e127a-ef25-49a1-a0c6-4e99b3c4c949").subscribe(result => {
    //  this.logger.debug('Lista de documentos de uma submissao ', result);
    //  this.documentService.GetSubmissionDocumentById("1a1e127a-ef25-49a1-a0c6-4e99b3c4c949", result.id).subscribe(resul => {
    //    this.logger.debug("Info de um documento ", resul);
    //    this.documentService.GetDocumentImage("1a1e127a-ef25-49a1-a0c6-4e99b3c4c949", result.id);
    //  });
    //});
  }

  initializeForm() {
    if (this.clientExists) {
      this.form = new FormGroup({
        expectableAnualInvoicing: new FormControl({ value: (this.returned != null && this.merchantInfo !== undefined && this.merchantInfo.knowYourSales !== undefined) ? this.merchantInfo.knowYourSales.annualEstimatedRevenue : this.client.sales.annualEstimatedRevenue, disabled: true }, Validators.required),/*this.client.sales.annualEstimatedRevenue, Validators.required),*/
        services: new FormControl({ value: 'aaa', disabled: true }, Validators.required),
        transactionsAverage: new FormControl({ value: (this.returned != null && this.merchantInfo.knowYourSales !== undefined) ? this.merchantInfo.knowYourSales.transactionsAverage : this.client.sales.transactionsAverage, disabled: true }, Validators.required/*this.client.sales.averageTransactions, Validators.required*/),
        associatedWithGroupOrFranchise: new FormControl(this.associatedWithGroupOrFranchise, Validators.required),
        preferenceDocuments: new FormControl((this.returned != null) ? this.merchantInfo.documentationDeliveryMethod : ''/*this.client.documentationDeliveryMethod*/, Validators.required/*this.client.documentationDeliveryMethod, Validators.required*/),
        inputEuropa: new FormControl(this.inputEuropa),
        inputAfrica: new FormControl(this.inputAfrica),
        inputAmerica: new FormControl(this.inputAmericas),
        inputOceania: new FormControl(this.inputOceania),
        inputAsia: new FormControl(this.inputTypeAsia),
        franchiseName: new FormControl(''),
        NIPCGroup: new FormControl('')
      });
    } else {
      this.form = new FormGroup({
        expectableAnualInvoicing: new FormControl((this.returned != null && this.merchantInfo.knowYourSales !== undefined) ? this.merchantInfo.knowYourSales.annualEstimatedRevenue : '', Validators.required),/*this.client.sales.annualEstimatedRevenue, Validators.required),*/
        services: new FormControl('aaa', Validators.required),
        transactionsAverage: new FormControl((this.returned != null && this.merchantInfo.knowYourSales !== undefined) ? this.merchantInfo.knowYourSales.transactionsAverage : '', Validators.required/*this.client.sales.averageTransactions, Validators.required*/),
        associatedWithGroupOrFranchise: new FormControl(this.associatedWithGroupOrFranchise, Validators.required),//this.associatedWithGroupOrFranchise),
        preferenceDocuments: new FormControl((this.returned != null) ? this.merchantInfo.documentationDeliveryMethod : '', Validators.required/*this.client.documentationDeliveryMethod, Validators.required*/),
        inputEuropa: new FormControl(this.inputEuropa),
        inputAfrica: new FormControl(this.inputAfrica),
        inputAmerica: new FormControl(this.inputAmericas),
        inputOceania: new FormControl(this.inputOceania),
        inputAsia: new FormControl(this.inputTypeAsia),
        franchiseName: new FormControl(''),
        NIPCGroup: new FormControl('')
      });
    }

    this.form.get("franchiseName").valueChanges.subscribe(v => {
      if (v !== '') {
        this.isAssociatedWithFranchise = true;
      } else {
        this.isAssociatedWithFranchise = undefined;
      }
    })

    this.form.get("NIPCGroup").valueChanges.subscribe(v => {
      if (v !== null) {
        this.isAssociatedWithFranchise = false;
      } else {
        this.isAssociatedWithFranchise = undefined;
      }
    })


  }

  newSubmission: SubmissionPostTemplate = {
    "submissionType": "DigitalComplete",
    "processKind": "MerchantOnboarding",
    "processType": "Standard",
    "isClientAwaiting": true,
    "submissionUser": {
      "user": "teste",
      "branch": "branch01",
      "partner": "SIBS"
    },
    "startedAt": "2022-07-13T11:10:13.420Z",
    "state": "Incomplete",
    "bank": "0800",
    "merchant": {
      "fiscalId": "585597856",
      "legalName": "BATATA FRITA CIA LTDA",
      "shortName": "BATATA FRITA LTDA",
      "headquartersAddress": {
        "address": "Rua gusta 3",
        "postalCode": "2454-298",
        "postalArea": "Aldeia Vegetariana",
        "country": "PT"
      },
      "merchantType": "Corporate", //ou Entrepreneur -> ENI
      "commercialName": "BATATAS FRITAS",
      "legalNature": "35",
      "crc": {
        "code": "0000-0000-0001",
        "validUntil": "2022-07-13T11:10:13.420Z"
      },
      "shareCapital": {
        "capital": 50000.2,
        "date": "2022-07-13T11:10:13.420Z"
      },
      "byLaws": "O Joao pode assinar tudo, like a boss",
      "mainEconomicActivity": "90010",
      "otherEconomicActivities": [
        "055111"
      ],
      "establishmentDate": "2022-07-13T11:10:13.420Z",
      "businessGroup": {
        "type": "Isolated",
        "branch": "branch01"
      },
      "knowYourSales": {
        "estimatedAnualRevenue": 45892255.0,
        "averageTransactions": 46895,
        "servicesOrProductsSold": [
          "Fries"
        ],
        "servicesOrProductsDestinations": [
          "Fries"
        ]
      },
      "bankInformation": {
        "bank": "0033",
        "iban": "PT00333506518874499677629"
      },
      "contacts": {
        "email": "joao@silvestre.pt",
        "phone1": {
          "countryCode": "+351",
          "phoneNumber": "919654422"
        },
        "phone2": {
          "countryCode": "+351",
          "phoneNumber": "919654421"
        }
      },
      "documentationDeliveryMethod": "MAIL",
      "billingEmail": "joao@silvestre.pt"
    },
    "stakeholders": [
      {
        "fiscalId": "232012610",
        "identificationDocument": {
          "type": "0020",
          "number": "13713441",
          "country": "PT",
          "expirationDate": "2022-07-13T11:10:13.420Z"
        },
        "fullName": "Joao Paulo Ferreira Silvestre",
        "contactName": "Joao o maior Silvestre",
        "shortName": "Joao Silvestre",
        "fiscalAddress": {
          "address": "Rua da Azoia 4",
          "postalCode": "2625-236",
          "postalArea": "Povoa de Santa Iria",
          "country": "PT"
        },
        "isProxy": false,
        "phone1": {
          "countryCode": "+351",
          "phoneNumber": "919654422"
        },
        "email": "joao@silvestre.pt",
        "birthDate": "1990-08-11"
      }
    ],
    "documents": [
      
    ]
  }

  submit() {
    var context = this;

    var navigationExtras: NavigationExtras = {
      state: {
        clientExists: this.clientExists,
        tipologia: this.tipologia,
        NIFNIPC: this.NIFNIPC,
        client: this.client,
        clientId: this.clientId,
        processId: this.processId,
        stakeholdersToInsert: this.stakeholdersToInsert,
        merchantInfo: this.merchantInfo,
        crc: this.crc
      }
    }

    if (this.returned !== 'consult') {
      this.data.updateData(true, 1);
      this.newSubmission.startedAt = new Date().toISOString();
      this.newSubmission.merchant.commercialName = "string";
      this.newSubmission.merchant.billingEmail = this.client.billingEmail;
      //this.newSubmission.merchant.businessGroup = this.client.businessGroup;
      this.newSubmission.merchant.bankInformation = this.client.bankInformation;
      this.newSubmission.merchant.byLaws = this.client.byLaws;
      //this.newSubmission.merchant.clientId = this.client.clientId;
      this.newSubmission.merchant.companyName = this.client.companyName;
      this.newSubmission.merchant.contacts = this.client.contacts;
      this.newSubmission.merchant.crc = this.client.crc;
      this.newSubmission.merchant.documentationDeliveryMethod = this.form.get("preferenceDocuments").value;
      this.newSubmission.merchant.establishmentDate = this.client.establishmentDate;
      this.newSubmission.merchant.fiscalId = this.client.fiscalId;
      this.newSubmission.merchant.foreignFiscalInformation = this.client.foreignFiscalInformation;
      this.newSubmission.merchant.headquartersAddress = this.client.headquartersAddress;
      this.newSubmission.merchant.id = this.client.id;
      this.newSubmission.merchant.knowYourSales.estimatedAnualRevenue = this.form.get("expectableAnualInvoicing").value;
      this.newSubmission.merchant.knowYourSales.averageTransactions = this.form.get("transactionsAverage").value;
      this.newSubmission.merchant.knowYourSales.servicesOrProductsSold = [];
      this.newSubmission.merchant.knowYourSales.servicesOrProductsDestinations = this.lstPaisPreenchido.map(country => country.code); //tenho de mandar apenas o CODE
      this.newSubmission.merchant.legalName = this.client.legalName;
      this.newSubmission.merchant.legalNature = this.client.legalNature;
      this.newSubmission.merchant.legalNature2 = this.client.legalNature2;
      this.newSubmission.merchant.mainEconomicActivity = this.client.mainEconomicActivity;
      this.newSubmission.merchant.mainOfficeAddress = this.client.mainOfficeAddress;
      this.newSubmission.merchant.merchantType = "Corporate";
      this.newSubmission.merchant.otherEconomicActivities = this.client.otherEconomicActivities;
      this.newSubmission.merchant.shareCapital = this.client.shareCapital;
      this.newSubmission.merchant.shortName = this.client.shortName;
      //this.newSubmission.stakeholders = this.stakeholdersToInsert;
      var context = this;

      if (this.returned !== null) {
        //this.newSubmission.processNumber = localStorage.getItem("processNumber");
      }


      //this.newSubmission.merchant.commercialName = this.merchantInfo.companyName;
      //this.newSubmission.merchant.billingEmail = this.merchantInfo.billingEmail;
      ////this.newSubmission.merchant.businessGroup = this.client.businessGroup;
      //this.newSubmission.merchant.bankInformation = this.merchantInfo.bankInformation;
      //this.newSubmission.merchant.byLaws = this.merchantInfo.byLaws;
      ////this.newSubmission.merchant.clientId = this.client.clientId;
      //this.newSubmission.merchant.companyName = this.merchantInfo.companyName;
      //this.newSubmission.merchant.contacts = this.merchantInfo.contacts;
      //this.newSubmission.merchant.crc = this.merchantInfo.crc;
      //this.newSubmission.merchant.documentationDeliveryMethod = this.form.get("preferenceDocuments").value;
      //this.newSubmission.merchant.establishmentDate = this.merchantInfo.establishmentDate;
      //this.newSubmission.merchant.fiscalId = this.merchantInfo.fiscalId;
      //this.newSubmission.merchant.foreignFiscalInformation = this.merchantInfo.foreignFiscalInformation;
      //this.newSubmission.merchant.headquartersAddress = this.merchantInfo.headquartersAddress;
      //this.newSubmission.merchant.id = this.merchantInfo.merchantId;
      //this.newSubmission.merchant.knowYourSales.annualEstimatedRevenue = this.form.get("expectableAnualInvoicing").value;
      //this.newSubmission.merchant.knowYourSales.averageTransactions = this.form.get("transactionsAverage").value;
      //this.newSubmission.merchant.knowYourSales.servicesOrProductsSold = [];
      //this.newSubmission.merchant.knowYourSales.servicesOrProductsDestinations = this.lstPaisPreenchido.map(country => country.code); //tenho de mandar apenas o CODE
      //this.newSubmission.merchant.legalName = this.merchantInfo.legalName;
      //this.newSubmission.merchant.legalNature = this.merchantInfo.legalNature;
      //this.newSubmission.merchant.legalNature2 = this.merchantInfo.legalNature2;
      //this.newSubmission.merchant.mainEconomicActivity = this.merchantInfo.mainEconomicActivity;
      //this.newSubmission.merchant.mainOfficeAddress = this.merchantInfo.mainOfficeAddress;
      //this.newSubmission.merchant.merchantType = "Corporate";
      //this.newSubmission.merchant.otherEconomicActivities = this.merchantInfo.otherEconomicActivities;
      //this.newSubmission.merchant.shareCapital = this.merchantInfo.shareCapital;
      //this.newSubmission.merchant.shortName = this.merchantInfo.shortName;





      //var clientToAdd = {} as ClientForProcess;
      //var a = this.stakeholdersToInsert; 
      //for (var i = 0, len = a.length; i < len; i++) {
      //  this.newSubmission.stakeholders.push({
      //    fiscalId: a[i].fiscalId,

      //  });
      //}

      var context = this;
      localStorage.setItem("crcStakeholders", JSON.stringify(this.stakeholdersToInsert));
      //this.logger.debug(this.newSubmission.merchant);

      this.stakeholdersToInsert.forEach(function (value, idx) {
        context.newSubmission.stakeholders.push({
          "fiscalId": value.fiscalId,
          "shortName": value.name
        })
      });
      if (this.crc !== null && this.crc !== undefined) {
        this.newSubmission.documents.push({
          documentType: 'crcPDF',
          documentPurpose: 'CompanyIdentification',
          file: {
            fileType: 'PDF',
            binary: this.crc.pdf
          },
          validUntil: this.crc.expirationDate,
          data: null
        })
      }
      if (this.tipologia == 'Company')
        this.newSubmission.merchant.merchantType = 'Corporate';
      else
        this.newSubmission.merchant.merchantType = 'Entrepeneur';

      this.submissionService.InsertSubmission(this.newSubmission).subscribe(result => {
        localStorage.setItem("submissionId", result.id);
        this.processNrService.changeProcessNumber(result.processNumber);

        //this.storeService.getShopsListOutbound(this.newSubmission.merchant.id, "por mudar", "por mudar").subscribe(res => {
        //  res.forEach(value => {
        //    this.storeService.getShopInfoOutbound(context.newSubmission.merchant.id, value.shopId, "por mudar", "por mudar").subscribe(r => {
        //      var storeToAdd: ShopDetailsAcquiring = {
        //        activity: r.activity,
        //        subActivity: r.secondaryActivity,
        //        address: {
        //          address: r.address.address,
        //          isInsideShoppingCenter: r.address.isInsideShoppingCenter,
        //          shoppingCenter: r.address.shoppingCenter,
        //          useMerchantAddress: r.address.sameAsMerchantAddress
        //        },
        //        bank: {
        //          bank: r.bankingInformation
        //        },
        //        name: r.name,
        //        productCode: r.product,
        //        subproductCode: r.subproduct,
        //        website: r.url,
        //      }

        //      context.storeService.addShopToSubmission(result.id, storeToAdd).subscribe(shop => {

        //      });
        //    });
        //  });
        //});



      //localStorage.setItem("crcStakeholders", JSON.stringify());

        this.route.navigate(['client-power-representation/', this.router.snapshot.paramMap.get('id')], navigationExtras);

      });
    } else {
      this.route.navigate(['client-power-representation/', this.router.snapshot.paramMap.get('id')], navigationExtras);
    }
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
  }

  onCountryChange(country) {
    var index = this.contPais.findIndex(elem => elem.description == country.description);
    if (index > -1) {
      this.contPais.splice(index, 1);
    } else {
      this.contPais.push(country);
    }

    //var index1 = this.lstCountry.findIndex(elem => {
    //  if (elem.description == event.target.id.description) {
    //    return true;
    //  }
    //  return false;
    //});
    //if (index1 > -1) {
    //  this.lstCountry.splice(index1, 1);
    //} else {
    //  this.lstCountry.push(event.target.id);
    //}

    //var index2 = this.lstCountry1.findIndex(elem => {
    //  if (elem.description == event.target.id.description) {
    //    return true;
    //  }
    //  return false;
    //});
    //if (index2 > -1) {
    //  this.lstCountry1.splice(index2, 1);
    //} else {
    //  this.lstCountry1.push(event.target.id);
    //}

    //var index3 = this.lstCountry2.findIndex(elem => {
    //  if (elem.description == event.target.id.description) {
    //    return true;
    //  }
    //  return false;
    //});
    //if (index3 > -1) {
    //  this.lstCountry2.splice(index3, 1);
    //} else {
    //  this.lstCountry2.push(event.target.id);
    //}

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
              if (count <= 19) {
                this.lstCountry.push(country)
              } else {
                if (count <= 39) {
                  this.lstCountry1.push(country);
                } else {
                  this.lstCountry2.push(country);
                }
              }
              count++;
            }
          });

        } else {
          this.inputEuropa = false;
        //  //this.countryList.forEach(country => {
        //  //  if (country.continent == "Europa") {
        //  //    this.removeCountryFromList(country, this.lstCountry);
        //  //    this.removeCountryFromList(country, this.lstCountry1);
        //  //    this.removeCountryFromList(country, this.lstCountry2);
        //  //    //this.removeCountryFromList(country, this.contPais);
        //  //  }
        //  //});
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
              if (count <= 19) {
                this.lstCountry.push(country)
              } else {
                if (count <= 39) {
                  this.lstCountry1.push(country);
                } else {
                  this.lstCountry2.push(country);
                }
              }
              count++;
            }
          });

        } else {
          this.inputAfrica = false;

        //  //this.countryList.forEach(country => {
        //  //  if (country.continent == "Africa") {
        //  //    this.removeCountryFromList(country, this.lstCountry);
        //  //    this.removeCountryFromList(country, this.lstCountry1);
        //  //    this.removeCountryFromList(country, this.lstCountry2);
        //  //    //this.removeCountryFromList(country, this.contPais);
        //  //  }
        //  //});
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
              if (count <= 19) {
                this.lstCountry.push(country)
              } else {
                if (count <= 39) {
                  this.lstCountry1.push(country);
                } else {
                  this.lstCountry2.push(country);
                }
              }
              count++;
            }
          });

        } else {
          this.inputOceania = false;

        //  //this.countryList.forEach(country => {
        //  //  if (country.continent == "Oceania") {
        //  //    this.removeCountryFromList(country, this.lstCountry);
        //  //    this.removeCountryFromList(country, this.lstCountry1);
        //  //    this.removeCountryFromList(country, this.lstCountry2);
        //  //    //this.removeCountryFromList(country, this.contPais);
        //  //  }
        //  //});
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
              if (count <= 19) {
                this.lstCountry.push(country)
              } else {
                if (count <= 39) {
                  this.lstCountry1.push(country);
                } else {
                  this.lstCountry2.push(country);
                }
              }
              count++;
            }
          });

        } else {
          this.inputAsia = false;

        //  //this.countryList.forEach(country => {
        //  //  if (country.continent == "Ásia") {
        //  //    this.removeCountryFromList(country, this.lstCountry);
        //  //    this.removeCountryFromList(country, this.lstCountry1);
        //  //    this.removeCountryFromList(country, this.lstCountry2);
        //  //    //this.removeCountryFromList(country, this.contPais);
        //  //  }
        //  //});
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
              if (count <= 19) {
                this.lstCountry.push(country)
              } else {
                if (count <= 39) {
                  this.lstCountry1.push(country);
                } else {
                  this.lstCountry2.push(country);
                }
              }
              count++;
            }
          });

        } else {
          this.inputAmericas = false;

        //  //this.countryList.forEach(country => {
        //  //  if (country.continent == "América Norte" || country.continent == "América Central" || country.continent == "América Sul") {
        //  //    this.removeCountryFromList(country, this.lstCountry);
        //  //    this.removeCountryFromList(country, this.lstCountry1);
        //  //    this.removeCountryFromList(country, this.lstCountry2);
        //  //    //this.removeCountryFromList(country, this.contPais);
        //  //  }
        //  //});
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

  editCountries() {
    this.merchantInfo.knowYourSales.servicesOrProductsDestinations.forEach(countryID => {
      this.tableInfo.GetCountryById(countryID).subscribe(result => {
        this.contPais.push(result);
        this.inserirText(null);
      });
    });
  }


}
