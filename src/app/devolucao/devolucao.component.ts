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


@Component({
  selector: 'app-devolucao',
  templateUrl: './devolucao.component.html'
})

export class DevolucaoComponent implements OnInit{
  form: FormGroup;

  public map = new Map();
  public currentPage: number;
  public subscription: Subscription;

  public processId: string;
  public process: ProcessList;

  constructor(private http: HttpClient, @Inject(configurationToken) private configuration: Configuration,
    private route: Router, private data: DataService,
    private router: ActivatedRoute, private processService: ProcessService) {

    this.ngOnInit();
    console.log('Process Id ', this.processId);

    this.processService.getProcessById(this.processId).subscribe(result => {
      this.process = result;
    });
}

ngOnInit(): void {
  this.subscription = this.data.currentData.subscribe(map => this.map = map);
  this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
  this.data.historyStream$.next(true);
  this.processId = this.router.snapshot.paramMap.get('id');
  var context = this;
}


  nextPage() {
    localStorage.setItem('returned', 'edit');
    console.log('Valor do returned', localStorage.getItem("returned"));

    localStorage.setItem('processNumber', this.process.processNumber);
    console.log('Valor do processNumber ', localStorage.getItem("processNumber"));

    this.route.navigate(['/client']);
  }

}
