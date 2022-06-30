import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IStakeholders } from '../../../stakeholders/IStakeholders.interface';

@Component({
  selector: 'app-info-declarativa-assinatura',
  templateUrl: './info-declarativa-assinatura.component.html',
  styleUrls: ['./info-declarativa-assinatura.component.css']
})
export class InfoDeclarativaAssinaturaComponent implements OnInit {

  isSelected: boolean = true;
  isVisible: any;
  stakeholders: IStakeholders[] = [];
  representativesSelected: String[] = [];

  constructor(private http: HttpClient, @Inject('BASE_URL')
    private baseUrl: string, private router: Router) {
    http.get<IStakeholders[]>(baseUrl + 'bestakeholders/GetAllStakes').subscribe(result => {
      this.stakeholders = result;
    }, error => console.error(error));
  }

  ngOnInit(): void {
  }

  changeRepresentativeSelected(event) {
    if (this.representativesSelected.indexOf(event.target.id) > -1) { //fazer o id ser o NIF ou outro identificador que seja apenas de um user
      var index = this.representativesSelected.indexOf(event.target.id);
      this.representativesSelected.splice(index, 1);
    } else {
      this.representativesSelected.push(event.target.id);
    }
    console.log(this.stakeholders);
    console.log(this.representativesSelected);
  }

}
