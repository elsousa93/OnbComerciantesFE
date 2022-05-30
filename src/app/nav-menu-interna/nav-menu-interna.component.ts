import { ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { QueryList } from '@angular/core';
import { ViewChildren } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ColdObservable } from 'rxjs/internal/testing/ColdObservable';

@Component({
  selector: 'app-nav-menu-interna',
  templateUrl: './nav-menu-interna.component.html',
  styleUrls: ['./nav-menu-interna.component.css']
})
export class NavMenuInternaComponent implements OnInit{
  boss: string;
  boss1: string;
  intervenientes: string;
  lojas: string;
  oferta: string;
  info: string;
  sub: any;
  name: any;
  
  @ViewChildren('myItem') item;


  onClick(e) {
    alert(this.item.name);
  }

  constructor(private router: ActivatedRoute) { }

  ngOnInit() {
    //this.onClick(null);
  }
  /*onClick(e :any) {
   
    console.log(e);
    if(e != null){
      //this.someInput.nativeElement.class = 'Whale!';
      switch (e) {
        case "COMERCIANTE":
          this.comerciante = 'fas fa-circle icone-menu-secundario';
          this.comprovativos = 'far fa-circle icone-menu-secundario-inactivo';
          this.intervenientes = 'far fa-circle icone-menu-secundario-inactivo';
          this.lojas = 'far fa-circle icone-menu-secundario-inactivo';
          this.oferta = 'far fa-circle icone-menu-secundario-inactivo';
          this.info = 'far fa-circle icone-menu-secundario-inactivo';
          break;
  
        case "COMPROVATIVOS":
          this.comerciante = 'far fa-circle icone-menu-secundario-inactivo';
          this.comprovativos = 'fas fa-circle icone-menu-secundario';
          this.intervenientes = 'far fa-circle icone-menu-secundario-inactivo';
          this.lojas = 'far fa-circle icone-menu-secundario-inactivo';
          this.oferta = 'far fa-circle icone-menu-secundario-inactivo';
          this.info = 'far fa-circle icone-menu-secundario-inactivo';
          break;
  
        case "INTERVENIENTES":
          this.comerciante = 'far fa-circle icone-menu-secundario-inactivo';
          this.comprovativos = 'far fa-circle icone-menu-secundario-inactivo';
          this.intervenientes = 'fas fa-circle icone-menu-secundario';
          this.lojas = 'far fa-circle icone-menu-secundario-inactivo';
          this.oferta = 'far fa-circle icone-menu-secundario-inactivo';
          this.info = 'far fa-circle icone-menu-secundario-inactivo';
          break;
  
        case "LOJAS":
          this.comerciante = 'far fa-circle icone-menu-secundario-inactivo';
          this.comprovativos = 'far fa-circle icone-menu-secundario-inactivo';
          this.intervenientes = 'far fa-circle icone-menu-secundario-inactivo';
          this.lojas = 'fas fa-circle icone-menu-secundario';
          this.oferta = 'far fa-circle icone-menu-secundario-inactivo';
          this.info = 'far fa-circle icone-menu-secundario-inactivo';
          break;
  
        case "OFERTA COMERCIAL":
          this.comerciante = 'far fa-circle icone-menu-secundario-inactivo';
          this.comprovativos = 'far fa-circle icone-menu-secundario-inactivo';
          this.intervenientes = 'far fa-circle icone-menu-secundario-inactivo';
          this.lojas = 'far fa-circle icone-menu-secundario-inactivo';
          this.oferta = 'fas fa-circle icone-menu-secundario';
          this.info = 'far fa-circle icone-menu-secundario-inactivo';
          break;
  
        case "INFO DECLARATIVA":
          this.comerciante = 'far fa-circle icone-menu-secundario-inactivo';
          this.comprovativos = 'far fa-circle icone-menu-secundario-inactivo';
          this.intervenientes = 'far fa-circle icone-menu-secundario-inactivo';
          this.lojas = 'far fa-circle icone-menu-secundario-inactivo';
          this.oferta = 'far fa-circle icone-menu-secundario-inactivo';
          this.info = 'fas fa-circle icone-menu-secundario';
          break;
  
      }
    }else{
        this.comerciante = 'fas fa-circle icone-menu-secundario';
        this.comprovativos = 'far fa-circle icone-menu-secundario-inactivo';
        this.intervenientes = 'far fa-circle icone-menu-secundario-inactivo';
        this.lojas = 'far fa-circle icone-menu-secundario-inactivo';
        this.oferta = 'far fa-circle icone-menu-secundario-inactivo';
        this.info = 'far fa-circle icone-menu-secundario-inactivo';
      

    }
    
*/
  
}
