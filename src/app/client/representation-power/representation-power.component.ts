import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DataService } from '../../nav-menu-interna/data.service';
import { IStakeholders, StakeholdersProcess } from '../../stakeholders/IStakeholders.interface';
import { Client } from '../Client.interface';

@Component({
  selector: 'app-representation-power',
  templateUrl: './representation-power.component.html',
  styleUrls: ['./representation-power.component.css']
})
export class RepresentationPowerComponent implements OnInit {

  public map: Map<number, boolean>;
  public currentPage: number;
  public subscription: Subscription;

  public returned: string;
  public submissionId: string;

  clientExists: boolean;
  tipologia: string;
  NIFNIPC: string;
  client: any;
  clientId: string;
  processId: string;
  stakeholdersToInsert: StakeholdersProcess[];
  merchantInfo: any;
  crc: any;


  public stakeholders: IStakeholders[] = [
    {
      shortName: "Bijal de Canela",
      fiscalId: "123456789",
    },
    {
      shortName: "Maria Santos",
      fiscalId: "987654321"
    }
  ];

  constructor(private route: ActivatedRoute, private router: Router, private data: DataService) {
    this.submissionId = localStorage.getItem('submissionId');
    this.returned = localStorage.getItem('returned');

    this.ngOnInit();

    if (this.router.getCurrentNavigation().extras.state) {
      this.clientExists = this.router.getCurrentNavigation().extras.state["clientExists"];
      this.tipologia = this.router.getCurrentNavigation().extras.state["tipologia"];
      this.NIFNIPC = this.router.getCurrentNavigation().extras.state["NIFNIPC"];
      this.client = this.router.getCurrentNavigation().extras.state["client"];
      this.clientId = this.router.getCurrentNavigation().extras.state["clientId"];
      this.processId = this.router.getCurrentNavigation().extras.state["processId"];
      this.stakeholdersToInsert = this.router.getCurrentNavigation().extras.state["stakeholders"];
      this.merchantInfo = this.router.getCurrentNavigation().extras.state["merchantInfo"];
      if (this.router.getCurrentNavigation().extras.state["crc"])
        this.crc = this.router.getCurrentNavigation().extras.state["crc"];
    }
  }

  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    this.data.updateData(false, 1, 3);
  }

  goToNextPage() {
    this.router.navigate(['stakeholders']);
  }

  goToPreviousPage() {
    var navigationExtras: NavigationExtras = {
      state: {
        clientExists: this.clientExists,
        tipologia: this.tipologia,
        NIFNIPC: this.NIFNIPC,
        client: this.client,
        clientId: this.clientId,
        processId: this.processId,
        stakeholdersToInsert: this.stakeholdersToInsert,
        merchantInfo: this.merchantInfo,
        crc: this.crc
      }
    }
    this.router.navigate(['client-additional-info', this.route.snapshot.paramMap.get('id')], navigationExtras);
  }
}
