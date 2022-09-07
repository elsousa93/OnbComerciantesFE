import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Renderer2 } from '@angular/core';
import { Component, Inject, Input, OnInit, VERSION, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription, take } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { Client } from '../client/Client.interface';
import { Configuration, configurationToken } from '../configuration';
import { DataService } from '../nav-menu-interna/data.service';
import { Process } from '../process/process.interface';
import { ProcessGet, ProcessList, ProcessService } from '../process/process.service';
import { LoggerService } from 'src/app/logger.service';


@Component({
  selector: 'queues-detail',
  templateUrl: './queues-detail.component.html'
})

export class QueuesDetailComponent implements OnInit{
  form: FormGroup;

  @Input() queueName: string;

  public map = new Map();
  public currentPage: number;
  public subscription: Subscription;

  public processId: string;
  public process: ProcessList;

  constructor(private logger : LoggerService, private http: HttpClient, @Inject(configurationToken) private configuration: Configuration,
    private route: Router, private data: DataService,
    private router: ActivatedRoute, private processService: ProcessService) {

    //Gets Queue Name from the Dashboard component 
    if (this.route.getCurrentNavigation().extras.state) {
      this.queueName = this.route.getCurrentNavigation().extras.state["queueName"];
    }

    this.ngOnInit();
    this.logger.debug('Process Id ' + this.processId);

    this.data.updateData(true, 0);

    this.processService.getProcessById(this.processId).subscribe(result => {
      this.process = result;
    });

  }

ngOnInit(): void {
  this.subscription = this.data.currentData.subscribe(map => this.map = map);
  this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
  this.data.historyStream$.next(true);
  this.processId = decodeURIComponent(this.router.snapshot.paramMap.get('id'));
  console.log('Process id ', this.processId);
  var context = this;
}


  nextPage() {
    this.logger.debug('Valor do returned ' + localStorage.getItem("returned"));
    if (localStorage.getItem("returned") != 'consult') {
      localStorage.setItem('returned', 'edit');
      this.logger.debug('Valor do returned' + localStorage.getItem("returned"));
    }
    localStorage.setItem('processNumber', this.process.processNumber);
    this.logger.debug('Valor do processNumber ' + localStorage.getItem("processNumber"));

    this.route.navigate(['/client']);
  }

}
