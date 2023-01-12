import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { StakeholderService } from 'src/app/stakeholders/stakeholder.service';
import { SubmissionService } from 'src/app/submission/service/submission-service.service';
import { DataService } from '../../nav-menu-interna/data.service';
import { IStakeholders, StakeholdersCompleteInformation, StakeholdersProcess } from '../../stakeholders/IStakeholders.interface';
import { ClientContext } from '../clientById/clientById.model';

@Component({
  selector: 'app-representation-power',
  templateUrl: './representation-power.component.html',
  styleUrls: ['./representation-power.component.css']
})
export class RepresentationPowerComponent implements OnInit, OnChanges{

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


  constructor(private route: ActivatedRoute, private router: Router, private data: DataService, private submissionService: SubmissionService, private stakeholderService: StakeholderService) {
    this.submissionId = localStorage.getItem('submissionId');
    this.returned = localStorage.getItem('returned');
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.loadStakeholders();
    }

  ngOnInit(): void {
    console.log("contexto dentro do representation: ", this.clientContext);
  }


  submit() {
    //var stakeholdersLength = this.stakeholdersToInsert.length;

    //var newSubmission = this.clientContext.newSubmission;

    //newSubmission.stakeholders = [];
    //this.stakeholdersToInsert.forEach(function (value, idx) {
    //  console.log("stakeholder: ", value);
    //  var fiscalID = value.fiscalId;

    //  var stakeholderToInsert = {
    //    "fiscalId": (fiscalID !== null && fiscalID !== undefined) ? fiscalID : '',
    //    "shortName": value.name,
    //    "fiscalAddress": {
    //      "postalCode": "",
    //      "postalArea": "",
    //      "country": "",
    //      "address": ""
    //    }
    //  } as IStakeholders;

    //  newSubmission.stakeholders.push(stakeholderToInsert);

    //});

    //localStorage.setItem("crcStakeholders", JSON.stringify(this.stakeholdersToInsert));

    //newSubmission.documents = [];

    //this.crc = this.clientContext.crc;

    //if (this.crc !== null && this.crc !== undefined) {
    //  newSubmission.documents.push({
    //    documentType: "0034", 
    //    documentPurpose: 'CompanyIdentification',
    //    file: {
    //      fileType: 'PDF',
    //      binary: this.crc.pdf
    //    },
    //    validUntil: this.crc.expirationDate,
    //    data: null
    //  })
    //}

    //var comprovativoCC = this.clientContext.comprovativoCC;

    //if (comprovativoCC !== null && comprovativoCC !== undefined) {
    //  newSubmission.documents.push({
    //    documentType: "0018", 
    //    documentPurpose: 'Identification',
    //    file: {
    //      fileType: 'PDF',
    //      binary: comprovativoCC.file
    //    },
    //    validUntil: comprovativoCC.expirationDate,
    //    data: null
    //  })
    //}
    //this.clientContext.newSubmission = newSubmission;

  }
}
