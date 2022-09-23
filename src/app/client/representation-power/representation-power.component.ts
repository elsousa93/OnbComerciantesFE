import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { StakeholderService } from 'src/app/stakeholders/stakeholder.service';
import { SubmissionService } from 'src/app/submission/service/submission-service.service';
import { DataService } from '../../nav-menu-interna/data.service';
import { IStakeholders, StakeholdersCompleteInformation, StakeholdersProcess } from '../../stakeholders/IStakeholders.interface';
import { Client } from '../Client.interface';

@Component({
  selector: 'app-representation-power',
  templateUrl: './representation-power.component.html',
  styleUrls: ['./representation-power.component.css']
})
export class RepresentationPowerComponent implements OnInit {

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


  // public stakeholders: IStakeholders[] = [
  //   {
  //     shortName: "Bijal de Canela",
  //     fiscalId: "123456789",
  //   },
  //   {
  //     shortName: "Maria Santos",
  //     fiscalId: "987654321"
  //   }
  // ];

  loadSubmissionStakeholders() {

  }

  constructor(private route: ActivatedRoute, private router: Router, private data: DataService, private submissionService: SubmissionService, private stakeholderService: StakeholderService) {
    this.submissionId = localStorage.getItem('submissionId');
    this.returned = localStorage.getItem('returned');

    this.ngOnInit();
    this.getSubmissionStakeholders();

    if (this.router.getCurrentNavigation().extras.state) {
      this.clientExists = this.router.getCurrentNavigation().extras.state["clientExists"];
      this.tipologia = this.router.getCurrentNavigation().extras.state["tipologia"];
      //this.NIFNIPC = this.router.getCurrentNavigation().extras.state["NIFNIPC"];
      this.NIFNIPC = this.route.snapshot.params["id"];
      this.client = this.router.getCurrentNavigation().extras.state["client"];
      this.clientId = this.router.getCurrentNavigation().extras.state["clientId"];
      this.processId = this.router.getCurrentNavigation().extras.state["processId"];
      this.stakeholdersToInsert = this.router.getCurrentNavigation().extras.state["stakeholders"];
      this.merchantInfo = this.router.getCurrentNavigation().extras.state["merchantInfo"];
      if (this.router.getCurrentNavigation().extras.state["crc"])
        this.crc = this.router.getCurrentNavigation().extras.state["crc"];
    }
  }

  getSubmissionStakeholders() {
    var context = this;
    if (this.returned !== null) { 
      this.submissionService.GetSubmissionByProcessNumber(this.processNumber).subscribe(result => {
        this.submissionService.GetSubmissionByID(result[0].submissionId).subscribe(resul => {
          this.stakeholderService.GetAllStakeholdersFromSubmission(result[0].submissionId).then(res => {
            res.forEach(function (value, index) {
              context.stakeholderService.GetStakeholderFromSubmission(result[0].submissionId, value.id).subscribe(r => {
                console.log("stakeholder: ", r);
                context.submissionStakeholders.push({
                  displayName: '',
                  eligibility: false,
                  stakeholderAcquiring: r,
                  stakeholderOutbound: undefined
                });
                this.stakeholders.append(r);
              }, error => {
              });
            }, error => {
            });
          });
        });
      });
    }

    if (this.submissionId !== null) {
      this.stakeholderService.GetAllStakeholdersFromSubmission(this.submissionId).then(result => {
        result.result.forEach(function (value, index) {
          context.stakeholderService.GetStakeholderFromSubmission(context.submissionId, value.id).subscribe(result => {
            var AcquiringStakeholder = result;
            var stakeholderToInsert = {
              displayName: '',
              eligibility: false,
              stakeholderAcquiring: AcquiringStakeholder,
              stakeholderOutbound: undefined
            }

            context.stakeholderService.getStakeholderByID(AcquiringStakeholder.stakeholderId, "por mudar", "por mudar").subscribe(outboundResult => {
              stakeholderToInsert.stakeholderOutbound = outboundResult;
              context.submissionStakeholders.push(stakeholderToInsert);
              
            })
            //context.submissionStakeholders.push({
            //  displayName: '',
            //  eligibility: false,
            //  stakeholderAcquiring: result,
            //  stakeholderOutbound: undefined
            //});
            console.log("array que ainda está a ser preenchida: ", context.submissionStakeholders);
          }, error => {
          });
        });
      }, error => {
      });
    }
  }

  ngOnInit(): void {
  }

  goToNextPage() {
    this.data.updateData(true, 1);
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
