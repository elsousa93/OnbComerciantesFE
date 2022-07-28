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

  historyStream$ = new BehaviorSubject<boolean>(false);

  //número da página em que estamos atualmente
  private dataPage = new BehaviorSubject(0);
  private dataSubPage = new BehaviorSubject(0);

  currentData = this.dataSource.asObservable();
  currentPage = this.dataPage.asObservable();
  currentSubPage = this.dataSubPage.asObservable();

  constructor() { }

  //mudar valores do map
  changeData(values: Map<number, boolean>) {
    this.dataSource.next(values);
  }

  //função que altera o valor do map e da currentPage
  updateData(value: boolean, currentPage: number, currentSubPage: number = 1) {
    let map = this.dataSource.getValue()
    map.set(currentPage, value);
    this.changeData(map);
    this.changeCurrentPage(currentPage);
    this.changeCurrentSubPage(currentSubPage);
  }

  //mudar o valor da página atual
  changeCurrentPage(value: number) {
    console.log("Page change "+value);
    this.dataPage.next(value);
    this.dataSubPage.next(1);
  }
  changeCurrentSubPage(value: number) {
    console.log("SubPage change "+value);
    this.dataSubPage.next(value);
  }

  ngOnDestroy(){
    this.historyStream$?.complete();
  }
}
