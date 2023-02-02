import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoggerService } from '../../logger.service';
import { DataService } from '../../nav-menu-interna/data.service';
import { StakeholdersCompleteInformation, StakeholdersProcess } from '../../stakeholders/IStakeholders.interface';
import { ClientContext } from '../clientById/clientById.model';

@Component({
  selector: 'app-representation-power',
  templateUrl: './representation-power.component.html',
  styleUrls: ['./representation-power.component.css']
})
export class RepresentationPowerComponent implements OnInit, OnChanges {

  @Input() clientContext: ClientContext;
  @Input() processNumber?: string;
  submissionStakeholders: StakeholdersCompleteInformation[] = [];

  public map: Map<number, boolean>;
  public currentPage: number;
  public subscription: Subscription;
  public stakeholders: StakeholdersCompleteInformation[];
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

  loadStakeholders() {
    this.clientContext?.currentStakeholdersToInsert?.subscribe(result => {
      this.stakeholdersToInsert = result;
    });
  }

  constructor(private route: ActivatedRoute, private router: Router, private data: DataService, private logger: LoggerService) {
    this.submissionId = localStorage.getItem('submissionId');
    this.returned = localStorage.getItem('returned');
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.loadStakeholders();
    }

  ngOnInit(): void {
    this.logger.debug("Context inside representation.component: " + JSON.stringify(this.clientContext));
  }

  submit() {

  }
}
