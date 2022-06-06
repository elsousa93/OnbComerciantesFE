import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  //map para saber o estado que deve ser mostrado em cada uma das páginas (undefined -> se a página ainda não foi visitada)
  //(false -> se foi visitada, mas o seguimento da página não foi seguido, ou seja, os campos não foram todos preenchidos): ainda n está completo
  //(true -> se foi visitada e todos os campos necessários foram preenchidos): ainda não está completo porque ainda n se sabe quais os forms que serão usados
  private dataSource = new BehaviorSubject(new Map().set(1, undefined)
    .set(2, undefined)
    .set(3, undefined)
    .set(4, undefined)
    .set(5, undefined)
    .set(6, undefined));

  //número da página em que estamos atualmente
  private dataPage = new BehaviorSubject(0);

  currentData = this.dataSource.asObservable();
  currentPage = this.dataPage.asObservable();

  constructor() { }

  //mudar valores do map
  changeData(values: Map<number, boolean>) {
    this.dataSource.next(values);
  }

  //mudar o valor da página atual
  changeCurrentPage(value: number) {
    this.dataPage.next(value);
  }
}
