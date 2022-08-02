import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Configuration, configurationToken } from 'src/app/configuration';
import { IComprovativos } from '../IComprovativos.interface';

@Component({
  selector: 'app-check-documents',
  templateUrl: './check-documents.component.html'
})
export class CheckDocumentsComponent implements OnInit {
  private baseUrl: string;

  public compCheckDocs: IComprovativos[] = [];
  private _compId: number = 0;

  constructor(public bsModalRef: BsModalRef, @Inject(configurationToken) private configuration: Configuration, private router: ActivatedRoute, private http: HttpClient ) {
    this.baseUrl = configuration.baseUrl;

    http.get<IComprovativos[]>(this.baseUrl + `BEComprovativos`).subscribe(result => {
      this.compCheckDocs = result;
      }, error => console.error(error));this.compCheckDocs;
   }

  ngOnInit(): void {
    this._compId = Number(this.router.snapshot.params['id']);
    console.log(this._compId);
  }

  onClose(){
    this.bsModalRef.hide();
  }
}
