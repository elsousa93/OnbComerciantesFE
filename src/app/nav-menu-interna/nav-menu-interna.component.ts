import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService } from './data.service';


@Component({
  selector: 'app-nav-menu-interna',
  templateUrl: './nav-menu-interna.component.html',
  styleUrls: ['./nav-menu-interna.component.css']
})
export class NavMenuInternaComponent implements OnInit {

  //map para saber o estado que deve ser mostrado em cada uma das páginas (undefined -> se a página ainda não foi visitada)
  //(false -> se foi visitada, mas o seguimento da página não foi seguido, ou seja, os campos não foram todos preenchidos): ainda n está completo
  //(true -> se foi visitada e todos os campos necessários foram preenchidos): ainda não está completo porque ainda n se sabe quais os forms que serão usados
  public map: Map<number, boolean>;

  //o numero da pagina atual em que estamos
  public currentPage: number;

  //subscription para os valores do map e da currentPage que vêm do dataService
  public subscription: Subscription; 

  public isActive: boolean;

  public startedEditing: boolean; //preciso de ter associado a página

  constructor(private data: DataService) {
  }

  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    console.log(this.map);
  }

  setListItem(page: number) {
    if (page == this.currentPage) {
      return 'text-center align-self-start text-xxl-center text-md-center';
    } else {
      if (this.map.get(page)) {
        return 'text-xxl-center text-lg-center text-md-center align-self-start';
      }
      if (this.map.get(page) == false) {
        return 'text-xxl-center text-lg-center text-md-center align-self-start align-self-xxl-center';
      }
      return 'text-center align-self-start align-self-xxl-center mt-xxl-3';
    }
  }

  setI(page: number) {
    if (page == this.currentPage) {
      return 'fas fa-circle icone-menu-secundario';
    } else {
      if (this.map.get(page)) { //value do map (undefined, true ou false)
        return 'far fa-check-circle icone-menu-secundario'; // por a aparecer o certo 
      } else {
        if (this.map.get(page) == false) {
          return 'fas fa-exclamation-triangle icone-menu-secundario-incompleto'; //laranja
        }
        return 'far fa-circle icone-menu-secundario-inactivo';  //desativo
      }
    }
  }

  setAnchor(page: number) {
    if (page == this.currentPage || this.map.get(page)) {
      return 'text-white texto-menu-secundario';
    } else {
      if (this.map.get(page) == false) {
        return 'texto-menu-secundario-incompleto text-danger';
      }
      return 'texto-menu-secundario text-success';
    }
  }

}
