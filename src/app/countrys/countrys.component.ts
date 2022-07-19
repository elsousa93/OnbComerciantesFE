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

  ngOnInit() {
    this.initializeForm();
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    
  }

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string,
    private route: Router, private tableInfo: TableInfoService, private submissionService: SubmissionService, private data: DataService,
    private router: ActivatedRoute) {

    if (this.route.getCurrentNavigation().extras.state) {
      this.clientExists = this.route.getCurrentNavigation().extras.state["clientExists"];
      this.tipologia = this.route.getCurrentNavigation().extras.state["tipologia"];
      this.NIFNIPC = this.route.getCurrentNavigation().extras.state["NIFNIPC"];
      console.log("client exists ", this.clientExists);
      console.log(this.route.getCurrentNavigation().extras);
    }
    //Chamada à API para receber todos os Paises
    this.tableInfo.GetAllCountries().subscribe(result => {
      this.countryList = result;
      console.log("FETCH PAISES");
    }, error => console.log(error));

  }

  initializeForm() {
    this.form = new FormGroup({
      franchiseName: new FormControl(/*this.client.companyName*/'', ),
      expectableAnualInvoicing: new FormControl(/*this.client.knowYourSales.estimatedAnualRevenue, Validators.required*/),
      services: new FormControl('', /*Validators.required*/),
      transactionsAverage: new FormControl(/*this.client.knowYourSales.averageTransactions, Validators.required*/),
      associatedWithGroupOrFranchise: new FormControl(this.associatedWithGroupOrFranchise),
      NIPCGroup: new FormControl(/*this.client.businessGroup.fiscalId*/),
      preferenceDocuments: new FormControl(/*this.client.documentationDeliveryMethod, Validators.required*/),
      inputEuropa: new FormControl(this.inputEuropa),
      inputAfrica: new FormControl(this.inputAfrica),
      inputAmerica: new FormControl(this.inputAmericas),
      inputOceania: new FormControl(this.inputOceania),
      inputAsia: new FormControl(this.inputTypeAsia)
    })

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

  updateData(value: boolean, currentPage: number) {
    this.map.set(currentPage, value);
    this.data.changeData(this.map);
    this.data.changeCurrentPage(currentPage);
  }

  submit() {
    this.updateData(true, 1);

    this.route.navigate(['stakeholders/']);
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

          this.lstCountry = ['Albânia', 'Alemanha', 'Andorra', 'Áustria', 'Bélgica', 'Bielorrússia', 'Bósnia e Herzegovina', 'Bulgária', 'Chipre', 'Cosovo', 'Croácia', 'Dinamarca', 'Eslováquia', 'Eslovénia', 'Espanha', 'Estónia', 'Finlândia', 'França', 'Grécia', 'Hungria'];
          for (var i = 0; i <= this.lstCountry.length; i++) {
            this.contPais[this.lstCountry[i]] = true;
          }
          this.lstCountry1 = ['Irlanda', 'Islândia', 'Itália', 'Letónia', 'Listenstaine', 'Lituânia', 'Luxemburgo', 'Macedónia do Norte', 'Malta', 'Moldávia', 'Mónaco', 'Montenegro', 'Noruega', 'Países Baixos', 'Polónia', 'Portugal', 'Reino Unido', 'República Checa', 'Roménia', 'Rússia']
          for (var i = 0; i <= this.lstCountry1.length; i++) {
            this.contPais[this.lstCountry1[i]] = true;
          }
          this.lstCountry2 = ['São Marinho', 'Sérvia', 'Suécia', 'Suíça', 'Ucrânia', 'Vaticano'];
          for (var i = 0; i <= this.lstCountry2.length; i++) {
            this.contPais[this.lstCountry2[i]] = true;
          }
          this.continenteName = continente;
        } else {
          this.inputEuropa = false;
          //this.lstCountry = []; // só podemos retirar da lista os paises deste continente 
          //this.lstCountry1 = []
          //this.lstCountry2 = [];

          this.countryList.forEach(country => {
            if (country.continent == "Europa") {
              if (this.lstCountry.indexOf(country.description) > -1) {
                var index = this.lstCountry.indexOf(country.description);
                this.lstCountry.splice(index, 1);
              }
              if (this.lstCountry1.indexOf(country.description) > -1) {
                var index = this.lstCountry1.indexOf(country.description);
                this.lstCountry1.splice(index, 1);
              }
              if (this.lstCountry2.indexOf(country.description) > -1) {
                var index = this.lstCountry2.indexOf(country.description);
                this.lstCountry2.splice(index, 1);
              }
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
              if (this.lstCountry.indexOf(country.description) > -1) {
                var index = this.lstCountry.indexOf(country.description);
                this.lstCountry.splice(index, 1);
              }
              if (this.lstCountry1.indexOf(country.description) > -1) {
                var index = this.lstCountry1.indexOf(country.description);
                this.lstCountry1.splice(index, 1);
              }
              if (this.lstCountry2.indexOf(country.description) > -1) {
                var index = this.lstCountry2.indexOf(country.description);
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
              if (this.lstCountry.indexOf(country.description) > -1) {
                var index = this.lstCountry.indexOf(country.description);
                this.lstCountry.splice(index, 1);
              }
              if (this.lstCountry1.indexOf(country.description) > -1) {
                var index = this.lstCountry1.indexOf(country.description);
                this.lstCountry1.splice(index, 1);
              }
              if (this.lstCountry2.indexOf(country.description) > -1) {
                var index = this.lstCountry2.indexOf(country.description);
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
              if (this.lstCountry.indexOf(country.description) > -1) {
                var index = this.lstCountry.indexOf(country.description);
                this.lstCountry.splice(index, 1);
              }
              if (this.lstCountry1.indexOf(country.description) > -1) {
                var index = this.lstCountry1.indexOf(country.description);
                this.lstCountry1.splice(index, 1);
              }
              if (this.lstCountry2.indexOf(country.description) > -1) {
                var index = this.lstCountry2.indexOf(country.description);
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
              if (this.lstCountry.indexOf(country.description) > -1) {
                var index = this.lstCountry.indexOf(country.description);
                this.lstCountry.splice(index, 1);
              }
              if (this.lstCountry1.indexOf(country.description) > -1) {
                var index = this.lstCountry1.indexOf(country.description);
                this.lstCountry1.splice(index, 1);
              }
              if (this.lstCountry2.indexOf(country.description) > -1) {
                var index = this.lstCountry2.indexOf(country.description);
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
