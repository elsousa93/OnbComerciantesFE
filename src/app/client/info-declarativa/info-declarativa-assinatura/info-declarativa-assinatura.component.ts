import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Configuration, configurationToken } from 'src/app/configuration';
import { DataService } from '../../../nav-menu-interna/data.service';
import { IStakeholders } from '../../../stakeholders/IStakeholders.interface';
import { CountryInformation } from '../../../table-info/ITable-info.interface';
import { TableInfoService } from '../../../table-info/table-info.service';

@Component({
  selector: 'app-info-declarativa-assinatura',
  templateUrl: './info-declarativa-assinatura.component.html',
  styleUrls: ['./info-declarativa-assinatura.component.css']
})
export class InfoDeclarativaAssinaturaComponent implements OnInit {
  private baseUrl: string;

  isSelected: boolean = true;
  isVisible: any;
  stakeholders: IStakeholders[] = [];
  representativesSelected: String[] = [];

  public map: Map<number, boolean>;
  public currentPage: number;
  public subscription: Subscription; 

  constructor(private http: HttpClient,@Inject(configurationToken) private configuration: Configuration, private router: Router, private data: DataService) {
    this.baseUrl = configuration.baseUrl;
    http.get<IStakeholders[]>(this.baseUrl + 'bestakeholders/GetAllStakes').subscribe(result => {
      this.stakeholders = result;
    }, error => console.error(error));

  }

  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    this.data.updateData(false, 6,4);
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

  redirectHomePage() {

    this.router.navigate(["/"]);
  }


}
