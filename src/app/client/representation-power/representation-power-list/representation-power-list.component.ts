import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../../nav-menu-interna/data.service';
import { StakeholdersCompleteInformation } from '../../../stakeholders/IStakeholders.interface';
import { StakeholderService } from '../../../stakeholders/stakeholder.service';
import { SubmissionService } from '../../../submission/service/submission-service.service';

@Component({
  selector: 'app-representation-power-list',
  templateUrl: './representation-power-list.component.html',
  styleUrls: ['./representation-power-list.component.css']
})
export class RepresentationPowerListComponent implements OnInit {

  @Input() submissionID: string = "";
  @Input() searchType?: string = "por mudar";
  @Input() requestID?: string = "por mudar";
  //@Input() canEdit?: boolean = false; Pode vir a ser preciso
  @Input() canSelect?: boolean = true;

  //Output
  //@Output() selectedClientEmitter = new EventEmitter<{
  //  client: Client,
  //  idx: number
  //}>();
  //@Output() foundClients: boolean = false;

  //Variáveis locais
  stakeholdersToShow: StakeholdersCompleteInformation[] = [];


  constructor(private route: ActivatedRoute, private router: Router, private data: DataService, private submissionService: SubmissionService, private stakeholderService: StakeholderService) { }

  ngOnInit(): void {

  }

}
