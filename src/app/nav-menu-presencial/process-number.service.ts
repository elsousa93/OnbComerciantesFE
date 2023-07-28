import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ProcessNumberService {

  private dataProcessNumber = new BehaviorSubject('');
  processNumber = this.dataProcessNumber.asObservable();
  private dataProcessId = new BehaviorSubject('');
  processId = this.dataProcessId.asObservable();
  private dataQueueName = new BehaviorSubject('');
  queueName = this.dataQueueName.asObservable();
  private dataUpdateProcessId = new BehaviorSubject('');
  updateProcessId = this.dataUpdateProcessId.asObservable();
  private dataObservation = new BehaviorSubject('');
  observation = this.dataObservation.asObservable();
  private dataMerchant = new BehaviorSubject<any>('');
  merchant = this.dataMerchant.asObservable();
  private dataList = new BehaviorSubject([]);
  list = this.dataList.asObservable();
  private dataEdit = new BehaviorSubject(true);
  edit = this.dataEdit.asObservable();
  private dataHasChange = new BehaviorSubject(false);
  hasChange = this.dataHasChange.asObservable();

  constructor() { }
  changeProcessNumber(value: string) {
    this.dataProcessNumber.next(value);
  }

  changeProcessId(value: string) {
    this.dataProcessId.next(value);
  }

  changeQueueName(value: string) {
    this.dataQueueName.next(value);
  }

  changeUpdateProcessId(value: string) {
    this.dataUpdateProcessId.next(value);
  }

  changeObservation(value: string) {
    this.dataObservation.next(value);
  }

  changeMerchant(value: any) {
    this.dataMerchant.next(value);
  }

  changeList(value: any[]) {
    this.dataList.next(value);
  }

  changeEdit(value: boolean) {
    this.dataEdit.next(value);
  }

  changeHasChange(value: boolean) {
    this.dataHasChange.next(value);
  }
}
