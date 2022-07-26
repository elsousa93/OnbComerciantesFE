import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Renderer2 } from '@angular/core';
import { Component, Inject, Input, OnInit, VERSION, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { Subscription, take } from 'rxjs';


@Component({
  selector: 'app-pack-contratual',
  templateUrl: './pack-contratual.component.html'
})

export class PackContratualComponent implements OnInit{
  form: FormGroup;

  public map = new Map();
  public currentPage: number;
  public subscription: Subscription;

  isPaper: boolean = null;

  
  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string,
  private route: Router,
  private router: ActivatedRoute) {

    this.ngOnInit();
  
}

ngOnInit(): void {

  var context = this;
}

paperSignature(paper: boolean) {
  if (paper){
    this.isPaper = true;
  } else {
    this.isPaper = false;
  }
}

}