import { HttpClient } from '@angular/common/http';
import { Component, Inject, Injectable, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
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
import { ProcessService } from '../process/process.service';
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
  client: Client;
  clientId: string;
  processId: string;

  currentClient: any = {};
  documentsList = []; //lista de documentos do utilizador


  ngOnInit() {
    this.initializeForm();
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    
  }

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string,
    private route: Router, private tableInfo: TableInfoService, private submissionService: SubmissionService, private data: DataService, private processService: ProcessService,
    private router: ActivatedRoute, private clientService: ClientService) {

    if (this.route.getCurrentNavigation().extras.state) {
      this.clientExists = this.route.getCurrentNavigation().extras.state["clientExists"];
      this.tipologia = this.route.getCurrentNavigation().extras.state["tipologia"];
      this.NIFNIPC = this.route.getCurrentNavigation().extras.state["NIFNIPC"];
      this.client = this.route.getCurrentNavigation().extras.state["client"];
      this.clientId = this.route.getCurrentNavigation().extras.state["clientId"];
      this.processId = this.route.getCurrentNavigation().extras.state["processId"];
      console.log("client exists ", this.clientExists);
      console.log(this.route.getCurrentNavigation().extras);
    }

    this.clientId = String(this.router.snapshot.params['id']);

    console.log(this.clientId);
    //Chamada à API para receber todos os Paises
    this.tableInfo.GetAllCountries().subscribe(result => {
      this.countryList = result;
      console.log("FETCH PAISES");
    }, error => console.log(error));

    console.log("por entrar no clientbyid");
    this.clientService.getClientByID("88dab4e9-3818-4491-addb-f518ae649e5a", "8ed4a062-b943-51ad-4ea9-392bb0a23bac", "22195900002451", "fQkRbjO+7kGqtbjwnDMAag==").subscribe(result => {
      console.log("entrou no getclientbyid");
      this.currentClient = result;
      console.log(result);
      console.log(this.currentClient);
    });
  }

  initializeForm() {
    this.form = new FormGroup({
      expectableAnualInvoicing: new FormControl(/*this.client.knowYourSales.estimatedAnualRevenue, Validators.required*/),
      services: new FormControl('', /*Validators.required*/),
      transactionsAverage: new FormControl(/*this.client.knowYourSales.averageTransactions, Validators.required*/),
      associatedWithGroupOrFranchise: new FormControl(this.associatedWithGroupOrFranchise),
      preferenceDocuments: new FormControl(/*this.client.documentationDeliveryMethod, Validators.required*/),
      inputEuropa: new FormControl(this.inputEuropa),
      inputAfrica: new FormControl(this.inputAfrica),
      inputAmerica: new FormControl(this.inputAmericas),
      inputOceania: new FormControl(this.inputOceania),
      inputAsia: new FormControl(this.inputTypeAsia)
    })
  }

  updateData(value: boolean, currentPage: number) {
    this.map.set(currentPage, value);
    this.data.changeData(this.map);
    this.data.changeCurrentPage(currentPage);
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
    this.updateData(true, 1);
    this.newSubmission.merchant.commercialName = "string";
    this.newSubmission.merchant.billingEmail = this.client.billingEmail;
    //this.newSubmission.merchant.businessGroup = this.client.businessGroup;
    this.newSubmission.merchant.bankInformation = this.client.bankInformation;
    this.newSubmission.merchant.byLaws = this.client.byLaws;
    this.newSubmission.merchant.clientId = this.client.clientId;
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
    this.newSubmission.merchant.knowYourSales.servicesOrProductsDestinations = this.lstPaisPreenchido; //tenho de mandar apenas o CODE
    this.newSubmission.merchant.legalName = this.client.legalName;
    this.newSubmission.merchant.legalNature = this.client.legalNature;
    this.newSubmission.merchant.legalNature2 = this.client.legalNature2;
    this.newSubmission.merchant.mainEconomicActivity = this.client.mainEconomicActivity;
    this.newSubmission.merchant.mainOfficeAddress = this.client.mainOfficeAddress;
    //this.newSubmission.merchant.merchantType = this.client.merchantType;
    this.newSubmission.merchant.otherEconomicActivities = this.client.otherEconomicActivities;
    this.newSubmission.merchant.shareCapital = this.client.shareCapital;
    this.newSubmission.merchant.shortName = this.client.shortName;
    

    console.log('Submissao ', this.newSubmission);

    this.submissionService.InsertSubmission(this.newSubmission).subscribe(result => {
      console.log('Resultado obtido ', result);
    });

    this.processService.createMerchant(this.newSubmission.merchant, "por mudar", "por mudar", "por mudar").subscribe(o => {
      console.log("deu create merchant");
      console.log(o);
      
    });

    //this.route.navigate(['stakeholders/']);
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
              this.contPais.push(country);
              count++;
            }
          });

          //this.lstCountry = ['Albânia', 'Alemanha', 'Andorra', 'Áustria', 'Bélgica', 'Bielorrússia', 'Bósnia e Herzegovina', 'Bulgária', 'Chipre', 'Cosovo', 'Croácia', 'Dinamarca', 'Eslováquia', 'Eslovénia', 'Espanha', 'Estónia', 'Finlândia', 'França', 'Grécia', 'Hungria'];
          //for (var i = 0; i <= this.lstCountry.length; i++) {
          //  this.contPais[this.lstCountry[i]] = true;
          //}
          //this.lstCountry1 = ['Irlanda', 'Islândia', 'Itália', 'Letónia', 'Listenstaine', 'Lituânia', 'Luxemburgo', 'Macedónia do Norte', 'Malta', 'Moldávia', 'Mónaco', 'Montenegro', 'Noruega', 'Países Baixos', 'Polónia', 'Portugal', 'Reino Unido', 'República Checa', 'Roménia', 'Rússia']
          //for (var i = 0; i <= this.lstCountry1.length; i++) {
          //  this.contPais[this.lstCountry1[i]] = true;
          //}
          //this.lstCountry2 = ['São Marinho', 'Sérvia', 'Suécia', 'Suíça', 'Ucrânia', 'Vaticano'];
          //for (var i = 0; i <= this.lstCountry2.length; i++) {
          //  this.contPais[this.lstCountry2[i]] = true;
          //}
          this.continenteName = continente;
        } else {
          this.inputEuropa = false;
          //this.lstCountry = []; // só podemos retirar da lista os paises deste continente 
          //this.lstCountry1 = []
          //this.lstCountry2 = [];

          this.countryList.forEach(country => {
            if (country.continent == "Europa") {
              var index = this.lstCountry.findIndex(elem => {
                if (elem.description == country.description) {
                  return true;
                } else {
                  return false;
                }
              });
              if (index > -1) {
                this.lstCountry.splice(index, 1);
              }

              //if (this.lstCountry.indexOf(country.description) > -1) {
              //  var index = this.lstCountry.indexOf(country.description);
              //  this.lstCountry.splice(index, 1);
              //}

              var index1 = this.lstCountry1.findIndex(elem => {
                if (elem.description == country.description) {
                  return true;
                } else {
                  return false;
                }
              });
              if (index1 > -1) {
                this.lstCountry1.splice(index, 1);
              }

              //if (this.lstCountry1.indexOf(country.description) > -1) {
              //  var index = this.lstCountry1.indexOf(country.description);
              //  this.lstCountry1.splice(index, 1);
              //}

              var index2 = this.lstCountry2.findIndex(elem => {
                if (elem.description == country.description) {
                  return true;
                } else {
                  return false;
                }
              });
              if (index2 > -1) {
                this.lstCountry2.splice(index, 1);
              }
              //if (this.lstCountry2.indexOf(country.description) > -1) {
              //  var index = this.lstCountry2.indexOf(country.description);
              //  this.lstCountry2.splice(index, 1);
              //}
            }
          });

          //remover os paises relativos a este continente
          this.countryList.forEach(country => {
            if (country.continent == "Europa") {
              var index = this.contPais.indexOf(country);
              this.contPais.splice(index, 1);
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
              this.contPais.push(country);
              count++;
            }
          });

          //this.lstCountry = ['África do Sul', 'Angola', 'Argélia', 'Benim', 'Botsuana', 'Burquina Faso', 'Burúndi', 'Cabo Verde', 'Camarões', 'Chade', 'Comores', 'Congo-Brazzaville', 'Costa do Marfim', 'Egito', 'Eritreia', 'Essuatíni', 'Etiópia', 'Gabão', 'Gâmbia', 'Gana'];
          //for (var i = 0; i <= this.lstCountry.length; i++) {
          //  this.contPais[this.lstCountry[i]] = true;
          //}

          //this.lstCountry1 = ['Guiné', 'Guiné Equatorial', 'Guiné-Bissau', 'Jibuti', 'Lesoto', 'Libéria', 'Líbia', 'Madagáscar', 'Maláui', 'Mali', 'Marrocos', 'Maurícia', 'Mauritânia', 'Moçambique', 'Namíbia', 'Níger', 'Nigéria', 'Quénia', 'República Centro-Africana', 'República Democrática do Congo'];
          //for (var i = 0; i <= this.lstCountry1.length; i++) {
          //  this.contPais[this.lstCountry1[i]] = true;
          //}

          //this.lstCountry2 = ['Ruanda', 'São Tomé e Príncipe', 'Seicheles', 'Senegal', 'Serra Leoa', 'Somália', 'Sudão', 'Sudão do Sul', 'Tanzânia', 'Togo', 'Tunísia', 'Uganda', 'Zâmbia', 'Zimbábue'];
          //for (var i = 0; i <= this.lstCountry2.length; i++) {
          //  this.contPais[this.lstCountry2[i]] = true;
          //}


          this.continenteName = continente;
        } else {
          this.inputAfrica = false;
          //this.lstCountry = [];
          //this.lstCountry1 = [];
          //this.lstCountry2 = [];

          this.countryList.forEach(country => {
            if (country.continent == "Africa") {
              var index = this.lstCountry.findIndex(elem => {
                if (elem.description == country.description) {
                  return true;
                } else {
                  return false;
                }
              });
              if (index > -1) {
                this.lstCountry.splice(index, 1);
              }

              //if (this.lstCountry.indexOf(country.description) > -1) {
              //  var index = this.lstCountry.indexOf(country.description);
              //  this.lstCountry.splice(index, 1);
              //}

              var index1 = this.lstCountry1.findIndex(elem => {
                if (elem.description == country.description) {
                  return true;
                } else {
                  return false;
                }
              });
              if (index1 > -1) {
                this.lstCountry1.splice(index, 1);
              }

              //if (this.lstCountry1.indexOf(country.description) > -1) {
              //  var index = this.lstCountry1.indexOf(country.description);
              //  this.lstCountry1.splice(index, 1);
              //}

              var index2 = this.lstCountry2.findIndex(elem => {
                if (elem.description == country.description) {
                  return true;
                } else {
                  return false;
                }
              });
              if (index2 > -1) {
                this.lstCountry2.splice(index, 1);
              }
            }
          });

          //remover os paises relativos a este continente
          this.countryList.forEach(country => {
            if (country.continent == "Africa") {
              var index = this.contPais.indexOf(country);
              this.contPais.splice(index, 1);
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
              this.contPais.push(country);
              count++;
            }
          });
          //this.lstCountry = ['Austrália', 'Fiji', 'Ilhas Marechal', 'Micronésia', 'Nauru', 'Nova Zelândia', 'Palau', 'Papua Nova Guiné', 'Quiribáti', 'Salomão', 'Samoa', 'Timor-Leste', 'Tonga', 'Tuvalu', 'Vanuatu'];
          //for (var i = 0; i <= this.lstCountry.length; i++) {
          //  this.contPais[this.lstCountry[i]] = true;
          //}
          //this.lstCountry1 = [];
          //this.lstCountry2 = [];
          this.continenteName = continente;
        } else {
          this.inputOceania = false;
          //this.lstCountry = [];
          //this.lstCountry1 = [];
          //this.lstCountry2 = [];

          this.countryList.forEach(country => {
            if (country.continent == "Oceania") {
              var index = this.lstCountry.findIndex(elem => {
                if (elem.description == country.description) {
                  return true;
                } else {
                  return false;
                }
              });
              if (index > -1) {
                this.lstCountry.splice(index, 1);
              }

              //if (this.lstCountry.indexOf(country.description) > -1) {
              //  var index = this.lstCountry.indexOf(country.description);
              //  this.lstCountry.splice(index, 1);
              //}

              var index1 = this.lstCountry1.findIndex(elem => {
                if (elem.description == country.description) {
                  return true;
                } else {
                  return false;
                }
              });
              if (index1 > -1) {
                this.lstCountry1.splice(index, 1);
              }

              //if (this.lstCountry1.indexOf(country.description) > -1) {
              //  var index = this.lstCountry1.indexOf(country.description);
              //  this.lstCountry1.splice(index, 1);
              //}

              var index2 = this.lstCountry2.findIndex(elem => {
                if (elem.description == country.description) {
                  return true;
                } else {
                  return false;
                }
              });
              if (index2 > -1) {
                this.lstCountry2.splice(index, 1);
              }
            }
          });

          //remover os paises relativos a este continente
          this.countryList.forEach(country => {
            if (country.continent == "Oceania") {
              var index = this.contPais.indexOf(country);
              this.contPais.splice(index, 1);
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
              this.contPais.push(country);
              count++;
            }
          });

          //this.lstCountry = ['Afeganistão', 'Arábia Saudita', 'Arménia', 'Azerbaijão', 'Bangladexe', 'Barém', 'Brunei', 'Butão', 'Camboja', 'Catar', 'Cazaquistão', 'China', 'Coreia do Norte', 'Coreia do Sul', 'Cuaite', 'Emirados Árabes Unidos', 'Estado da Palestina', 'Filipinas', 'Geórgia', 'Iémen'];
          //for (var i = 0; i <= this.lstCountry.length; i++) {
          //  this.contPais[this.lstCountry[i]] = true;
          //}
          //this.lstCountry1 = ['Iraque', 'Israel', 'Japão', 'Jordânia', 'Laus', 'Líbano', 'Malásia', 'Maldivas', 'Mianmar', 'Mongólia', 'Nepal', 'Omã', 'Paquistão', 'Quirguistão', 'Singapura', 'Síria', 'Sri Lanca', 'Tailândia', 'Taiuã', 'Tajiquistão'];
          //for (var i = 0; i <= this.lstCountry1.length; i++) {
          //  this.contPais[this.lstCountry1[i]] = true;
          //}
          //this.lstCountry2 = ['Turcomenistão', 'Turquia', 'Usbequistão', 'Vietname'];
          //for (var i = 0; i <= this.lstCountry2.length; i++) {
          //  this.contPais[this.lstCountry2[i]] = true;
          //}
          this.continenteName = continente;
        } else {
          this.inputAsia = false;
          //this.lstCountry = [];
          //this.lstCountry1 = [];
          //this.lstCountry2 = [];

          this.countryList.forEach(country => {
            if (country.continent == "Ásia") {
              var index = this.lstCountry.findIndex(elem => {
                if (elem.description == country.description) {
                  return true;
                } else {
                  return false;
                }
              });
              if (index > -1) {
                this.lstCountry.splice(index, 1);
              }

              //if (this.lstCountry.indexOf(country.description) > -1) {
              //  var index = this.lstCountry.indexOf(country.description);
              //  this.lstCountry.splice(index, 1);
              //}

              var index1 = this.lstCountry1.findIndex(elem1 => {
                if (elem1.description == country.description) {
                  return true;
                } else {
                  return false;
                }
              });
              if (index1 > -1) {
                this.lstCountry1.splice(index, 1);
              }

              //if (this.lstCountry1.indexOf(country.description) > -1) {
              //  var index = this.lstCountry1.indexOf(country.description);
              //  this.lstCountry1.splice(index, 1);
              //}

              var index2 = this.lstCountry2.findIndex(elem2 => {
                if (elem2.description == country.description) {
                  return true;
                } else {
                  return false;
                }
              });
              if (index2 > -1) {
                this.lstCountry2.splice(index, 1);
              }
            }
          });

          //remover os paises relativos a este continente
          this.countryList.forEach(country => {
            if (country.continent == "Ásia") {
              var index = this.contPais.indexOf(country);
              this.contPais.splice(index, 1);
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
              this.contPais.push(country);
              count++;
            }
          });
          //this.lstCountry = ['Antiga e Barbuda', 'Argentina', 'Bahamas', 'Barbados', 'Belize', 'Bolívia', 'Brasil', 'Canadá', 'Chile', 'Colômbia', 'Costa Rica', 'Cuba', 'Dominica', 'Equador', 'Estados Unidos', 'Granada', 'Guatemala', 'Guiana'];
          //for (var i = 0; i <= this.lstCountry.length; i++) {
          //  this.contPais[this.lstCountry[i]] = true;
          //}

          //this.lstCountry1 = ['Haiti', 'Honduras', 'Jamaica', 'México', 'Nicarágua', 'Panamá', 'Paraguai', 'Peru', 'República Dominicana', 'Salvador', 'Santa Lúcia', 'São Cristóvão e Neves', 'São Vicente e Granadinas', 'Suriname', 'Trindade e Tobago', 'Uruguai', 'Venezuela'];
          //for (var i = 0; i <= this.lstCountry1.length; i++) {
          //  this.contPais[this.lstCountry1[i]] = true;
          //}

          //this.lstCountry2 = [];

          this.continenteName = continente;
        } else {
          this.inputAmericas = false;
          //this.lstCountry = [];
          //this.lstCountry1 = [];
          //this.lstCountry2 = [];

          this.countryList.forEach(country => {
            if (country.continent == "América Norte" || country.continent == "América Central" || country.continent == "América Sul") {
              var index = this.lstCountry.findIndex(elem => {
                if (elem.description == country.description) {
                  return true;
                } else {
                  return false;
                }
              });
              if (index > -1) {
                this.lstCountry.splice(index, 1);
              }

              var index1 = this.lstCountry1.findIndex(elem => {
                if (elem.description == country.description) {
                  return true;
                } else {
                  return false;
                }
              });
              if (index1 > -1) {
                this.lstCountry1.splice(index, 1);
              }

              var index2 = this.lstCountry2.findIndex(elem => {
                if (elem.description == country.description) {
                  return true;
                } else {
                  return false;
                }
              });
              if (index2 > -1) {
                this.lstCountry2.splice(index, 1);
              }
            }
          });

          //remover os paises relativos a este continente
          this.countryList.forEach(country => {
            if (country.continent == "América Norte" || country.continent == "América Central" || country.continent == "América Sul") {
              var index = this.contPais.indexOf(country);
              this.contPais.splice(index, 1);
            }
          });
        }
        break;

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
    console.log('Lista contPais', this.contPais);
    this.contPais.forEach(element => {
      var index = this.lstPaisPreenchido.findIndex(elem => {
        if (element.description == elem.description) {
          return true;
        }
        return false;
      });
      if (index == -1) {
        this.lstPaisPreenchido.push(element);
        console.log('Elementos na lista contPais ', element);
      }
    });
    
    
    console.log('Lista de todos os elementos passados (lstPaisPreenchido) ', this.lstPaisPreenchido);

    this.lstPaisPreenchido.forEach(country => {
      $('#text5').val($('#text5').val() + country.description + ', ' );
    });
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


}
