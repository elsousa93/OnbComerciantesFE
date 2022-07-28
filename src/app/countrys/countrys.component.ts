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
import { Client } from '../client/Client.interface';
import { ClientService } from '../client/client.service';
import { ClientForProcess, ProcessService } from '../process/process.service';
import { SubmissionDocumentService } from '../submission/document/submission-document.service';
import { ProcessNumberService } from '../nav-menu-presencial/process-number.service';
import { StakeholderService } from '../stakeholders/stakeholder.service';
import { StakeholdersProcess } from '../stakeholders/IStakeholders.interface';
@Component({
  selector: 'app-countrys',
  templateUrl: './countrys.component.html'
})
export class CountrysComponent implements OnInit {
  continente = '';

  lstCountry = [];
  lstCountry1 = [];
  lstCountry2 = [];
  contPais = [];

  continenteName: string;

  lstPaisPreenchido = [];

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
  documentsList = []; //lista de documentos do utilizador

  processNumber: string;

  returned: string;
  merchantInfo: any;

  stakeholdersToInsert: StakeholdersProcess[];

  ngOnInit() {
    this.initializeForm();
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    this.data.updateData(false, 1, 3);
    this.subscription = this.processNrService.processNumber.subscribe(processNumber => this.processNumber = processNumber);
    this.returned = localStorage.getItem("returned");
  }

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string,
    private route: Router, private tableInfo: TableInfoService, private submissionService: SubmissionService, private data: DataService, private processService: ProcessService,
    private router: ActivatedRoute, private clientService: ClientService, private documentService: SubmissionDocumentService, private processNrService: ProcessNumberService, private stakeholderService: StakeholderService) {

    if (this.route.getCurrentNavigation().extras.state) {
      this.clientExists = this.route.getCurrentNavigation().extras.state["clientExists"];
      this.tipologia = this.route.getCurrentNavigation().extras.state["tipologia"];
      this.NIFNIPC = this.route.getCurrentNavigation().extras.state["NIFNIPC"];
      this.client = this.route.getCurrentNavigation().extras.state["client"];
      this.clientId = this.route.getCurrentNavigation().extras.state["clientId"];
      this.processId = this.route.getCurrentNavigation().extras.state["processId"];
      this.stakeholdersToInsert = this.route.getCurrentNavigation().extras.state["stakeholders"];
      this.merchantInfo = this.route.getCurrentNavigation().extras.state["merchantInfo"];
      console.log("client exists ", this.clientExists);
      console.log(this.route.getCurrentNavigation().extras);
    }

    console.log('Fora do if do edit countries');
    if (this.merchantInfo != null) {
      console.log('Entrei no if do edit countries');
      this.editCountries();
    }
    console.log('Depois do if do edit countries');

    console.log(this.clientId);
    //Chamada à API para receber todos os Paises
    this.tableInfo.GetAllCountries().subscribe(result => {
      this.countryList = result;
    }, error => console.log(error));

    //console.log("por entrar no clientbyid");
    //this.clientService.getClientByID(this.clientId, "8ed4a062-b943-51ad-4ea9-392bb0a23bac", "22195900002451", "fQkRbjO+7kGqtbjwnDMAag==").subscribe(result => {
    //  console.log("entrou no getclientbyid");
    //  this.currentClient = result;
    //  console.log(result);
    //  console.log(this.currentClient);
    //});

    //this.documentService.GetSubmissionDocuments("1a1e127a-ef25-49a1-a0c6-4e99b3c4c949").subscribe(result => {
    //  console.log('Lista de documentos de uma submissao ', result);
    //  this.documentService.GetSubmissionDocumentById("1a1e127a-ef25-49a1-a0c6-4e99b3c4c949", result.id).subscribe(resul => {
    //    console.log("Info de um documento ", resul);
    //    this.documentService.GetDocumentImage("1a1e127a-ef25-49a1-a0c6-4e99b3c4c949", result.id);
    //  });
    //});
  }

  initializeForm() {

    if (this.clientExists) {
      this.form = new FormGroup({
        expectableAnualInvoicing: new FormControl({ value: (this.returned != null) ? this.merchantInfo.sales.annualEstimatedRevenue : this.client.sales.annualEstimatedRevenue, disabled: true }, Validators.required),/*this.client.knowYourSales.estimatedAnualRevenue, Validators.required),*/
        services: new FormControl({ value: '', disabled: true }, Validators.required),
        transactionsAverage: new FormControl({ value: (this.returned != null) ? this.merchantInfo.sales.transactionsAverage : this.client.sales.transactionsAverage, disabled: true }, Validators.required/*this.client.knowYourSales.averageTransactions, Validators.required*/),
        associatedWithGroupOrFranchise: new FormControl('false', Validators.required),//this.associatedWithGroupOrFranchise),
        preferenceDocuments: new FormControl((this.returned != null) ? this.merchantInfo.documentationDeliveryMethod : this.client.documentationDeliveryMethod, Validators.required/*this.client.documentationDeliveryMethod, Validators.required*/),
        inputEuropa: new FormControl(this.inputEuropa),
        inputAfrica: new FormControl(this.inputAfrica),
        inputAmerica: new FormControl(this.inputAmericas),
        inputOceania: new FormControl(this.inputOceania),
        inputAsia: new FormControl(this.inputTypeAsia)
      });
    } else {
      this.form = new FormGroup({
        expectableAnualInvoicing: new FormControl((this.returned != null) ? this.merchantInfo.sales.annualEstimatedRevenue : '', Validators.required),/*this.client.knowYourSales.estimatedAnualRevenue, Validators.required),*/
        services: new FormControl('', Validators.required),
        transactionsAverage: new FormControl((this.returned != null) ? this.merchantInfo.sales.transactionsAverage : '', Validators.required/*this.client.knowYourSales.averageTransactions, Validators.required*/),
        associatedWithGroupOrFranchise: new FormControl('false', Validators.required),//this.associatedWithGroupOrFranchise),
        preferenceDocuments: new FormControl((this.returned != null) ? this.merchantInfo.documentationDeliveryMethod : 'Portal', Validators.required/*this.client.documentationDeliveryMethod, Validators.required*/),
        inputEuropa: new FormControl(this.inputEuropa),
        inputAfrica: new FormControl(this.inputAfrica),
        inputAmerica: new FormControl(this.inputAmericas),
        inputOceania: new FormControl(this.inputOceania),
        inputAsia: new FormControl(this.inputTypeAsia)
      });
    }
    
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
      "merchantType": "Corporate",
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
      {
        "archiveSource": "undefined",
        "purpose": "undefined",
        "validUntil": "2022-07-20",
        "receivedAt": "2022-07-20",
        "documentType": "",
        "uniqueReference": "",
      }
    ]
  }

  submit() {
    console.log('Cliente recebido ', this.client);

    console.log("lista de paises preenchidos");
    console.log(this.lstPaisPreenchido);
    this.data.updateData(true, 1);
    if (this.returned == null) { 
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

      console.log(this.newSubmission.merchant);
    } else {
      this.newSubmission.merchant.commercialName = this.merchantInfo.companyName;
      this.newSubmission.merchant.billingEmail = this.merchantInfo.billingEmail;
      //this.newSubmission.merchant.businessGroup = this.client.businessGroup;
      this.newSubmission.merchant.bankInformation = this.merchantInfo.bankInformation;
      this.newSubmission.merchant.byLaws = this.merchantInfo.byLaws;
      //this.newSubmission.merchant.clientId = this.client.clientId;
      this.newSubmission.merchant.companyName = this.merchantInfo.companyName;
      this.newSubmission.merchant.contacts = this.merchantInfo.contacts;
      this.newSubmission.merchant.crc = this.merchantInfo.crc;
      this.newSubmission.merchant.documentationDeliveryMethod = this.form.get("preferenceDocuments").value;
      this.newSubmission.merchant.establishmentDate = this.merchantInfo.establishmentDate;
      this.newSubmission.merchant.fiscalId = this.merchantInfo.fiscalId;
      this.newSubmission.merchant.foreignFiscalInformation = this.merchantInfo.foreignFiscalInformation;
      this.newSubmission.merchant.headquartersAddress = this.merchantInfo.headquartersAddress;
      this.newSubmission.merchant.id = this.merchantInfo.merchantId;
      this.newSubmission.merchant.knowYourSales.estimatedAnualRevenue = this.form.get("expectableAnualInvoicing").value;
      this.newSubmission.merchant.knowYourSales.averageTransactions = this.form.get("transactionsAverage").value;
      this.newSubmission.merchant.knowYourSales.servicesOrProductsSold = [];
      this.newSubmission.merchant.knowYourSales.servicesOrProductsDestinations = this.lstPaisPreenchido.map(country => country.code); //tenho de mandar apenas o CODE
      this.newSubmission.merchant.legalName = this.merchantInfo.legalName;
      this.newSubmission.merchant.legalNature = this.merchantInfo.legalNature;
      this.newSubmission.merchant.legalNature2 = this.merchantInfo.legalNature2;
      this.newSubmission.merchant.mainEconomicActivity = this.merchantInfo.mainEconomicActivity;
      this.newSubmission.merchant.mainOfficeAddress = this.merchantInfo.mainOfficeAddress;
      this.newSubmission.merchant.merchantType = "Corporate";
      this.newSubmission.merchant.otherEconomicActivities = this.merchantInfo.otherEconomicActivities;
      this.newSubmission.merchant.shareCapital = this.merchantInfo.shareCapital;
      this.newSubmission.merchant.shortName = this.merchantInfo.shortName;

      this.newSubmission.processNumber = localStorage.getItem("processNumber");


    }
    //var clientToAdd = {} as ClientForProcess;
    //var a = this.stakeholdersToInsert; 
    //for (var i = 0, len = a.length; i < len; i++) {
    //  this.newSubmission.stakeholders.push({
    //    fiscalId: a[i].fiscalId,
        
    //  });
    //}

    console.log("Submissao tratada! uysidghsiudghisudh");
    console.log(this.newSubmission);
    console.log("----------------------");
    console.log(this.stakeholdersToInsert);
    //console.log(this.newSubmission.merchant);

    var context = this;
    this.submissionService.InsertSubmission(this.newSubmission).subscribe(result => {
      console.log("dentro do submission service");
      console.log(result);
      localStorage.setItem("submissionId", result.id);
      this.processNrService.changeProcessNumber(result.processNumber);

      this.route.navigate(['stakeholders/']);
      
    });
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

  onCountryChange(event) {
    var index = this.contPais.findIndex(elem => {
      if (elem.description == event.target.id.description) {
        return true;
      }
      return false;
    });
    if (index > -1) {
      this.contPais.splice(index, 1);
    } else {
      this.contPais.push(event.target.id);
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
    var index = this.contPais.findIndex(elem => {
      if (elem.description == item.description) {
        return true;
      }
      return false;
    });

    if (index > -1) {
      return true;
    }
      return false;
    
  }

  countrys(continente: string) {
    this.valueInput();
    var count = 0;
    switch (continente) {
      case 'EUROPA':
        if (this.inputEuropa == false) {
          this.inputEuropa = true;
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
              //this.contPais.push(country);
              count++;
            }
          });

          this.continenteName = continente;
        } else {
          this.inputEuropa = false;
          this.countryList.forEach(country => {
            if (country.continent == "Europa") {
              this.removeCountryFromList(country, this.lstCountry);
              this.removeCountryFromList(country, this.lstCountry1);
              this.removeCountryFromList(country, this.lstCountry2);
              this.removeCountryFromList(country, this.contPais);
            }
          });
        }
        break;
      case 'AFRICA':
        if (this.inputAfrica == false) {
          this.inputAfrica = true;

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
              //this.contPais.push(country);
              count++;
            }
          });
          this.continenteName = continente;
        } else {
          this.inputAfrica = false;

          this.countryList.forEach(country => {
            if (country.continent == "Africa") {
              this.removeCountryFromList(country, this.lstCountry);
              this.removeCountryFromList(country, this.lstCountry1);
              this.removeCountryFromList(country, this.lstCountry2);
              this.removeCountryFromList(country, this.contPais);
            }
          });
        }
        break;
      case 'OCEANIA':
        if (this.inputOceania == false) {
          this.inputOceania = true;

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
              //this.contPais.push(country);
              count++;
            }
          });

          this.continenteName = continente;
        } else {
          this.inputOceania = false;

          this.countryList.forEach(country => {
            if (country.continent == "Oceania") {
              this.removeCountryFromList(country, this.lstCountry);
              this.removeCountryFromList(country, this.lstCountry1);
              this.removeCountryFromList(country, this.lstCountry2);
              this.removeCountryFromList(country, this.contPais);
            }
          });
        }
        break;
      case 'ASIA':
        if (this.inputAsia == false) {
          this.inputAsia = true;

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
             // this.contPais.push(country);
              count++;
            }
          });

          this.continenteName = continente;
        } else {
          this.inputAsia = false;

          this.countryList.forEach(country => {
            if (country.continent == "Ásia") {
              this.removeCountryFromList(country, this.lstCountry);
              this.removeCountryFromList(country, this.lstCountry1);
              this.removeCountryFromList(country, this.lstCountry2);
              this.removeCountryFromList(country, this.contPais);
            }
          });
        }
        break;
      case 'AMERICA DO NORTE / SUL':
        if (this.inputAmericas == false) {
          this.inputAmericas = true;

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
              //this.contPais.push(country);
              count++;
            }
          });

          this.continenteName = continente;
        } else {
          this.inputAmericas = false;

          this.countryList.forEach(country => {
            if (country.continent == "América Norte" || country.continent == "América Central" || country.continent == "América Sul") {
              this.removeCountryFromList(country, this.lstCountry);
              this.removeCountryFromList(country, this.lstCountry1);
              this.removeCountryFromList(country, this.lstCountry2);
              this.removeCountryFromList(country, this.contPais);
            }
          });
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
    if (this.contPais.length > 0) {
      this.contPais.forEach(element => {
        var index = this.lstPaisPreenchido.findIndex(elem => elem.description == element.description);
        if (index == -1) {
          this.lstPaisPreenchido.push(element);
        }
      });

      //se a lstPaisPreenchido tiver um country que a contPais não tem
      this.lstPaisPreenchido.forEach(element => {
        var index = this.contPais.findIndex(elem => elem.description == element.description);
        if (index == -1) {
          this.lstPaisPreenchido.splice(index, 1);
        }
      });

      this.lstPaisPreenchido.forEach(country => {
        $('#text5').val($('#text5').val() + country.description + ', ');
      });
    } else {
      $('#text5').val('');
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
    this.merchantInfo.sales.servicesOrProductsDestinations.forEach(countryID => {
      this.tableInfo.GetCountryById(countryID).subscribe(result => {
        console.log('Países encontrados na lista do merchant ', result);
        if (result.continent == 'Europa') {
          if (!this.inputEuropa) {
            this.countrys('EUROPA');
          }
        }

        if (result.continent == 'Africa') {
          if (!this.inputEuropa) {
            this.countrys('AFRICA');
          }
        }

        if (result.continent == 'Ásia') {
          if (!this.inputEuropa) {
            this.countrys('ASIA');
          }
        }

        if (result.continent == 'América Norte' || result.continent == 'América Central' || result.continent == 'América Sul') {
          if (!this.inputEuropa) {
            this.countrys('AMERICA DO NORTE / SUL');
          }
        }

        if (result.continent == 'Oceania') {
          if (!this.inputEuropa) {
            this.countrys('OCEANIA');
          }
        }

        this.contPais.push(result);
      });
    });
    console.log("Cont pais depois de ir buscar todos os paises do merchant ", this.contPais);
    this.inserirText(null);
    console.log("LstPaisPreenchidos depois de ir inserir os valores na textarea ", this.lstPaisPreenchido);
  }


}
