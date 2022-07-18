import { Component, Injectable, OnInit } from '@angular/core';

@Component({
  selector: 'app-countrys',
  templateUrl: './countrys.component.html'
})
export class CountrysComponent {
  continente = '';

  lstCountry;
  lstCountry1;
  lstCountry2;
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

  constructor() {

  }


  countrys(continente: string) {
    this.valueInput();
    switch (continente) {
      case 'EUROPA':
        if (this.inputEuropa == false) {
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
          this.lstCountry = [];
          this.lstCountry1 = []
          this.lstCountry2 = [];
        }
        break;
      case 'AFRICA':
        if (this.inputAfrica == false) {
          this.lstCountry = ['África do Sul', 'Angola', 'Argélia', 'Benim', 'Botsuana', 'Burquina Faso', 'Burúndi', 'Cabo Verde', 'Camarões', 'Chade', 'Comores', 'Congo-Brazzaville', 'Costa do Marfim', 'Egito', 'Eritreia', 'Essuatíni', 'Etiópia', 'Gabão', 'Gâmbia', 'Gana'];
          for (var i = 0; i <= this.lstCountry.length; i++) {
            this.contPais[this.lstCountry[i]] = true;
          }

          this.lstCountry1 = ['Guiné', 'Guiné Equatorial', 'Guiné-Bissau', 'Jibuti', 'Lesoto', 'Libéria', 'Líbia', 'Madagáscar', 'Maláui', 'Mali', 'Marrocos', 'Maurícia', 'Mauritânia', 'Moçambique', 'Namíbia', 'Níger', 'Nigéria', 'Quénia', 'República Centro-Africana', 'República Democrática do Congo'];
          for (var i = 0; i <= this.lstCountry1.length; i++) {
            this.contPais[this.lstCountry1[i]] = true;
          }

          this.lstCountry2 = ['Ruanda', 'São Tomé e Príncipe', 'Seicheles', 'Senegal', 'Serra Leoa', 'Somália', 'Sudão', 'Sudão do Sul', 'Tanzânia', 'Togo', 'Tunísia', 'Uganda', 'Zâmbia', 'Zimbábue'];
          for (var i = 0; i <= this.lstCountry2.length; i++) {
            this.contPais[this.lstCountry2[i]] = true;
          }


          this.continenteName = continente;
        } else {
          this.lstCountry = [];
          this.lstCountry1 = [];
          this.lstCountry2 = [];
        }
        break;
      case 'OCEANIA':
        if (this.inputOceania == false) {
          this.lstCountry = ['Austrália', 'Fiji', 'Ilhas Marechal', 'Micronésia', 'Nauru', 'Nova Zelândia', 'Palau', 'Papua Nova Guiné', 'Quiribáti', 'Salomão', 'Samoa', 'Timor-Leste', 'Tonga', 'Tuvalu', 'Vanuatu'];
          for (var i = 0; i <= this.lstCountry.length; i++) {
            this.contPais[this.lstCountry[i]] = true;
          }
          this.lstCountry1 = [];
          this.lstCountry2 = [];
          this.continenteName = continente;
        } else {
          this.lstCountry = [];
          this.lstCountry1 = [];
          this.lstCountry2 = [];
        }
        break;
      case 'ASIA':
        if (this.inputAsia == false) {
          this.lstCountry = ['Afeganistão', 'Arábia Saudita', 'Arménia', 'Azerbaijão', 'Bangladexe', 'Barém', 'Brunei', 'Butão', 'Camboja', 'Catar', 'Cazaquistão', 'China', 'Coreia do Norte', 'Coreia do Sul', 'Cuaite', 'Emirados Árabes Unidos', 'Estado da Palestina', 'Filipinas', 'Geórgia', 'Iémen'];
          for (var i = 0; i <= this.lstCountry.length; i++) {
            this.contPais[this.lstCountry[i]] = true;
          }
          this.lstCountry1 = ['Iraque', 'Israel', 'Japão', 'Jordânia', 'Laus', 'Líbano', 'Malásia', 'Maldivas', 'Mianmar', 'Mongólia', 'Nepal', 'Omã', 'Paquistão', 'Quirguistão', 'Singapura', 'Síria', 'Sri Lanca', 'Tailândia', 'Taiuã', 'Tajiquistão'];
          for (var i = 0; i <= this.lstCountry1.length; i++) {
            this.contPais[this.lstCountry1[i]] = true;
          }

          this.lstCountry2 = ['Turcomenistão', 'Turquia', 'Usbequistão', 'Vietname'];
          for (var i = 0; i <= this.lstCountry2.length; i++) {
            this.contPais[this.lstCountry2[i]] = true;
          }
          this.continenteName = continente;
        } else {
          this.lstCountry = [];
          this.lstCountry1 = [];
          this.lstCountry2 = [];
        }
        break;
      case 'AMERICA DO NORTE / SUL':
        if (this.inputAmericas == false) {
          this.lstCountry = ['Antiga e Barbuda', 'Argentina', 'Bahamas', 'Barbados', 'Belize', 'Bolívia', 'Brasil', 'Canadá', 'Chile', 'Colômbia', 'Costa Rica', 'Cuba', 'Dominica', 'Equador', 'Estados Unidos', 'Granada', 'Guatemala', 'Guiana'];
          for (var i = 0; i <= this.lstCountry.length; i++) {
            this.contPais[this.lstCountry[i]] = true;
          }

          this.lstCountry1 = ['Haiti', 'Honduras', 'Jamaica', 'México', 'Nicarágua', 'Panamá', 'Paraguai', 'Peru', 'República Dominicana', 'Salvador', 'Santa Lúcia', 'São Cristóvão e Neves', 'São Vicente e Granadinas', 'Suriname', 'Trindade e Tobago', 'Uruguai', 'Venezuela'];
          for (var i = 0; i <= this.lstCountry1.length; i++) {
            this.contPais[this.lstCountry1[i]] = true;
          }

          this.lstCountry2 = [];
          this.continenteName = continente;
        } else {
          this.lstCountry = [];
          this.lstCountry1 = [];
          this.lstCountry2 = [];
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
    console.log(this.contPais);
    this.contPais.forEach(element => {
      this.lstPaisPreenchido.push(element);
      console.log(element)
    });
    
    
    console.log(this.lstPaisPreenchido);

  }
}
