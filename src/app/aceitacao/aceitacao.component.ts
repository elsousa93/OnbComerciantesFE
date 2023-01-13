import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppComponent } from '../app.component';
import { ProcessList, ProcessService } from '../process/process.service';

@Component({
  selector: 'app-aceitacao',
  templateUrl: './aceitacao.component.html',
  styleUrls: ['../stakeholders/stakeholders-list/stakeholders-list.component.css']
})

export class AceitacaoComponent implements OnInit {
  form: FormGroup;

  public map = new Map();
  public currentPage: number;
  public subscription: Subscription;
  public processId: string;
  public process: ProcessList;

  constructor(private router: ActivatedRoute, private processService: ProcessService, public appComponent: AppComponent) {

    this.appComponent.toggleSideNav(false);

    this.processService.getProcessById(this.processId).subscribe(result => {
      this.process = result;
    });
  }

  ngOnInit(): void {
    this.processId = this.router.snapshot.paramMap.get('id');
  }
}