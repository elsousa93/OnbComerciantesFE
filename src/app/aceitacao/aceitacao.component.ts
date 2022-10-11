import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Renderer2 } from '@angular/core';
import { Component, Inject, Input, OnInit, VERSION, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { Subscription, take } from 'rxjs';
import { AppComponent } from '../app.component';
import { DataService } from '../nav-menu-interna/data.service';
import { ProcessGet, ProcessList, ProcessService, UpdateProcess } from '../process/process.service';


@Component({
  selector: 'app-aceitacao',
  templateUrl: './aceitacao.component.html',
  styleUrls: ['../stakeholders/stakeholders-list/stakeholders-list.component.css']
})

export class AceitacaoComponent implements OnInit{
  form: FormGroup;

  public map = new Map();
  public currentPage: number;
  public subscription: Subscription;

  public processId: string;
  public process: ProcessList;
  
  constructor(private http: HttpClient,
    private route: Router,
    private router: ActivatedRoute, private processService: ProcessService, private data: DataService, public appComponent: AppComponent) {

    this.appComponent.toggleSideNav(false);

    this.ngOnInit();
    this.processService.getProcessById(this.processId).subscribe(result => {
      this.process = result;
    });
    //this.data.updateData(false, 0, 0);

}

ngOnInit(): void {

  this.processId = this.router.snapshot.paramMap.get('id');
  var context = this;
}

}
