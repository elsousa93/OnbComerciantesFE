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
}
