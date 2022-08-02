import { Component, OnInit, Inject, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, NgForm, FormGroup, FormControl } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StakeholdersComponent } from '../stakeholders.component';
import { IStakeholders } from '../IStakeholders.interface';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
//import { IReadCard } from '..//IReadCard.interface';
import { DataService } from '../../nav-menu-interna/data.service';
import { TableInfoService } from '../../table-info/table-info.service';
import { StakeholderService } from '../stakeholder.service';
import { IReadCard } from '../new-stakeholder/IReadCard.interface';

@Component({
  selector: 'app-info-stakeholder',
  templateUrl: './info-stakeholder.component.html',
  styleUrls: ['./info-stakeholder.component.css']
})
export class InfoStakeholderComponent implements OnInit {
  

  constructor(private router: ActivatedRoute,
    private http: HttpClient, private route: Router, private fb: FormBuilder, private data: TableInfoService, private stakeService: StakeholderService) {

    this.ngOnInit();

  }

  ngOnInit(): void {

  }

}
