import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Renderer2 } from '@angular/core';
import { Component, Inject, Input, OnInit, VERSION, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { Subscription, take } from 'rxjs';


@Component({
  selector: 'app-obter-pack-contratual',
  templateUrl: './obter-pack-contratual.component.html'
})

export class ObterPackContratualComponent implements OnInit{
  form: FormGroup;

  public map = new Map();
  public currentPage: number;
  public subscription: Subscription;

  
  validatedDocuments: boolean = false;

  
  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string,
  private route: Router,
  private router: ActivatedRoute) {

    this.ngOnInit();
  
}

ngOnInit(): void {

  var context = this;
}

validatedDocumentsChange(value: boolean) {
  this.validatedDocuments = value;
}

}