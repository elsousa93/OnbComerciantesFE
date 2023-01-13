import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ProcessNumberService {

  private dataProcessNumber = new BehaviorSubject('');
  processNumber = this.dataProcessNumber.asObservable();
  constructor() { }
  changeProcessNumber(value: string) {
    this.dataProcessNumber.next(value);
  }
}