import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Renderer2 } from '@angular/core';
import { Component, Inject, Input, OnInit, VERSION, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { Subscription, take } from 'rxjs';
import { ProcessGet, ProcessService, UpdateProcess } from '../process/process.service';


@Component({
  selector: 'app-aceitacao',
  templateUrl: './aceitacao.component.html'
})

export class AceitacaoComponent implements OnInit{
  form: FormGroup;

  public map = new Map();
  public currentPage: number;
  public subscription: Subscription;

  public processId: string;
  public process: ProcessGet;
  
  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string,
    private route: Router,
    private router: ActivatedRoute, private processService: ProcessService) {

    this.ngOnInit();
    this.processService.getProcessById(this.processId).subscribe(result => {
      this.process = result;
    });

}

ngOnInit(): void {

  this.processId = this.router.snapshot.paramMap.get('id');
  var context = this;
}

}
