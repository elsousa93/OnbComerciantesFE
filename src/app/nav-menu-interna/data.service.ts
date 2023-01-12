import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LoggerService } from 'src/app/logger.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  //map para saber o estado que deve ser mostrado em cada uma das páginas (undefined -> se a página ainda não foi visitada)
  //(false -> se foi visitada, mas o seguimento da página não foi seguido, ou seja, os campos não foram todos preenchidos): ainda n está completo
  //(true -> se foi visitada e todos os campos necessários foram preenchidos): ainda não está completo porque ainda n se sabe quais os forms que serão usados
  private dataSource = new BehaviorSubject(new Map().set(0, undefined)
    .set(1, undefined)
    .set(2, undefined)
    .set(3, undefined)
    .set(4, undefined)
    .set(5, undefined)
    .set(6, undefined));

  historyStream$ = new BehaviorSubject<boolean>(false);

  //número da página em que estamos atualmente
  private dataPage = new BehaviorSubject(0);
  private dataSubPage = new BehaviorSubject(0);
  private updateComprovativos = new BehaviorSubject(false);

  private tipologia = new BehaviorSubject("");
  private isClient = new BehaviorSubject(null);
  private dataCC = new BehaviorSubject(null);
  private comprovativoCC = new BehaviorSubject(null);
  private updateClient = new BehaviorSubject(false);
  private firstTimeStake = new BehaviorSubject(true);

  currentData = this.dataSource.asObservable();
  currentPage = this.dataPage.asObservable();
  currentSubPage = this.dataSubPage.asObservable();
  updatedComprovativos = this.updateComprovativos.asObservable();
  updatedClient = this.updateClient.asObservable();

  currentTipologia = this.tipologia.asObservable();
  currentIsClient = this.isClient.asObservable();
  currentDataCC = this.dataCC.asObservable();
  currentComprovativoCC = this.comprovativoCC.asObservable();
  currentFirstTimeStake = this.firstTimeStake.asObservable();

  historyStream = this.historyStream$.asObservable();

  constructor(private logger: LoggerService,) { }

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
    this.logger.debug("Page change " + value);
    this.dataPage.next(value);
    this.dataSubPage.next(1);
  }
  changeCurrentSubPage(value: number) {
    this.logger.debug("SubPage change " + value);
    this.dataSubPage.next(value);
  }

  changeUpdatedComprovativos(value: boolean) {
    this.updateComprovativos.next(value);
  }

  changeUpdatedClient(value: boolean) {
    this.updateClient.next(value);
  }

  changeCurrentTipologia(value: string) {
    this.tipologia.next(value);
  }

  changeCurrentIsClient(value: boolean) {
    this.isClient.next(value);
  }

  changeCurrentDataCC(value: any) {
    this.dataCC.next(value);
  }

  changeCurrentComprovativoCC(value: any) {
    this.comprovativoCC.next(value);
  }

  changeCurrentFirstTimeStake(value: boolean) {
    this.firstTimeStake.next(value);
  }

  reset() {
    this.dataSource = new BehaviorSubject(new Map().set(0, undefined)
      .set(1, undefined)
      .set(2, undefined)
      .set(3, undefined)
      .set(4, undefined)
      .set(5, undefined)
      .set(6, undefined));
    this.currentData = this.dataSource.asObservable();
    this.currentPage = this.dataPage.asObservable();
    this.currentSubPage = this.dataSubPage.asObservable();
    this.updatedComprovativos = this.updateComprovativos.asObservable();
    this.currentTipologia = this.tipologia.asObservable();
    this.currentIsClient = this.isClient.asObservable();
    this.currentDataCC = this.dataCC.asObservable();
    this.currentComprovativoCC = this.comprovativoCC.asObservable();
    this.updatedClient = this.updateClient.asObservable();
    this.currentFirstTimeStake = this.firstTimeStake.asObservable();
    this.historyStream$.next(false);
  }

  ngOnDestroy() {
    this.historyStream$?.complete();
  }
}