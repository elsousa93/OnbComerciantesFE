import { Component, OnInit, Inject, Output, EventEmitter  } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { StakeholdersComponent } from '../stakeholders.component';
import { IStakeholders } from '../IStakeholders.interface';

import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-new-stakeholder',
  templateUrl: './new-stakeholder.component.html',
  styleUrls: ['./new-stakeholder.component.css']
})

/**
 * Child component of Stakeholders Component
*/

export class NewStakeholderComponent implements OnInit {
 // public nif: number = 320987523;

  constructor(private router: ActivatedRoute,
    private http: HttpClient, @Inject('BASE_URL')
    private baseUrl: string, private route: Router) {  }

  //@Output()  newStakeholderAdded = new EventEmitter<any>();

  @Output() newItemEvent = new EventEmitter<string>();
  addNewItem(value: string) {
    this.newItemEvent.emit(value);
  }


    ngOnInit(): void {
        throw new Error('Method not implemented.');
  }

  
   submit(stake: any) {
     console.log("form submitted from child: ", stake)
     this.http.post<IStakeholders[]>(this.baseUrl + 'bestakeholders/PostNewStakeholder/' + stake.nif, stake).subscribe(result => {
        console.log(result);
      }, error => console.error(error));
    }
}

