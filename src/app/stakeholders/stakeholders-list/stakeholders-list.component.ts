import { HttpClient } from '@angular/common/http';
import { Component, Input, Output, OnInit, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { DataService } from '../../nav-menu-interna/data.service';
import { ReadcardService } from '../../readcard/readcard.service';
import { SubmissionService } from '../../submission/service/submission-service.service';
import { IStakeholders, StakeholderOutbound, StakeholdersCompleteInformation } from '../IStakeholders.interface';
import { StakeholderService } from '../stakeholder.service';

@Component({
  selector: 'app-stakeholders-list',
  templateUrl: './stakeholders-list.component.html',
  styleUrls: ['./stakeholders-list.component.css']
})
export class StakeholdersListComponent implements OnInit, AfterViewInit {

  constructor(private router: ActivatedRoute, public modalService: BsModalService, private readCardService: ReadcardService,
    private http: HttpClient, private route: Router, private data: DataService, private fb: FormBuilder, private stakeholderService: StakeholderService, private submissionService: SubmissionService) { }

  stakesMat = new MatTableDataSource<StakeholdersCompleteInformation>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  //Variáveis que podem ser preenchidas
  @Input() submissionId: string;
  @Input() processNumber?: string;
  @Input() canDelete?: boolean = true;
  @Input() canSelect?: boolean = true;

  //Variáveis que vão retornar informação
  @Output() selectedStakeholderEmitter = new EventEmitter<{
    stakeholder: StakeholdersCompleteInformation,
    idx: number
  }>();

  submissionStakeholders: StakeholdersCompleteInformation[] = [];

  selectedStakeholder: StakeholdersCompleteInformation = {};
  returned: string;

  displayedColumns: string[] = ['shortName', 'fiscalId', 'entityType', 'relationType', 'elegible', 'clientNumber', 'signature', 'delete'];

  //subStakeholders: StakeholdersCompleteInformation[] = [];

  ngOnInit(): void {
    this.returned = localStorage.getItem("returned");
    this.getSubmissionStakeholders();
    setTimeout(() => this.stakesMat.data = this.submissionStakeholders, 2000);
  }

  ngAfterViewInit(): void {
    //this.stakesMat.data = this.submissionStakeholders;
    this.stakesMat.paginator = this.paginator;
    this.stakesMat.sort = this.sort;
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
              }, error => {
              });
            }, error => {
            });
          });
        });
      });
    }

    this.getSubmissionStakeholdersAux();

    //if (this.submissionId !== null) {
    //  this.stakeholderService.GetAllStakeholdersFromSubmission(this.submissionId).then(result => {
    //    var results = result.result;
    //    results.forEach(function (value, index) {
    //      context.stakeholderService.GetStakeholderFromSubmission(context.submissionId, value.id).subscribe(result => {
    //        var AcquiringStakeholder = result;
    //        var stakeholderToInsert = {
    //          displayName: '',
    //          eligibility: false,
    //          stakeholderAcquiring: AcquiringStakeholder,
    //          stakeholderOutbound: undefined
    //        }

    //        var tempStakeholderID = "75c99155-f3a8-45e2-9bd3-56a39d8a68ae";

    //        context.stakeholderService.getStakeholderByID(tempStakeholderID/*AcquiringStakeholder.stakeholderId*/, "por mudar", "por mudar").subscribe(outboundResult => {
    //          stakeholderToInsert.stakeholderOutbound = outboundResult;
    //          context.submissionStakeholders.push(stakeholderToInsert);

    //        })
    //        //context.submissionStakeholders.push({
    //        //  displayName: '',
    //        //  eligibility: false,
    //        //  stakeholderAcquiring: result,
    //        //  stakeholderOutbound: undefined
    //        //});
    //        console.log("array que ainda está a ser preenchida: ", context.submissionStakeholders);
    //      }, error => {
    //      });
    //    });
    //  }, error => {
    //  });
    //}

    //if (this.submissionId !== null) {
    //  console.log("submission: ", this.submissionId);
    //  this.stakeholderService.GetAllStakeholdersFromSubmission(this.submissionId).subscribe(result => {
    //    var allSubmissionStakeholders = result;
    //    console.log("todos os stakeholders: ", allSubmissionStakeholders);
    //    allSubmissionStakeholders.forEach(function (value, index) {
    //      var submissionStakeholder = value;
    //      context.stakeholderService.GetStakeholderFromSubmission(context.submissionId, submissionStakeholder.id).subscribe(result => {
    //        var AcquiringStakeholder = result;
    //        console.log("info stakeholder: ", AcquiringStakeholder);
    //        context.subStakeholders.push({
    //          displayName: '',
    //          stakeholderAcquiring: result,
    //          stakeholderOutbound: undefined,
    //          elegibility: false
    //        })
    //      });
    //    });
    //  })
    //}

  }

  getSubmissionStakeholdersAux() {
    var context = this;

    if (this.submissionId !== null) {
      this.stakeholderService.GetAllStakeholdersFromSubmission(this.submissionId).then(result => {
        var results = result.result;
        results.forEach(function (value, index) {
          context.stakeholderService.GetStakeholderFromSubmission(context.submissionId, value.id).subscribe(result => {
            var AcquiringStakeholder = result;
            var stakeholderToInsert = {
              displayName: '',
              eligibility: false,
              stakeholderAcquiring: AcquiringStakeholder,
              stakeholderOutbound: undefined
            }

            var tempStakeholderID = "75c99155-f3a8-45e2-9bd3-56a39d8a68ae";

            context.submissionStakeholders.push(stakeholderToInsert);

            context.stakeholderService.getStakeholderByIDNew("75c99155-f3a8-45e2-9bd3-56a39d8a68ae").then(success => {
              console.log("Foi buscar o stakeholderbyidnew com sucesso: ", success);
            }, error => {
              console.log("Não conseguiu ir buscar o stakeholderbyidnew: ", error);
            });

            //context.stakeholderService.getStakeholderByID(tempStakeholderID/*AcquiringStakeholder.stakeholderId*/, "por mudar", "por mudar").subscribe(outboundResult => {
            //  stakeholderToInsert.stakeholderOutbound = outboundResult;
            //  context.submissionStakeholders.push(stakeholderToInsert);

            //})
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
      }).then(teste => {
        context.loadStakeholders(context.submissionStakeholders);
      });
    }
  }

  emitSelectedStakeholder(stakeholder, idx) {
    if (!this.canSelect)
      return;
    console.log("stakeholder escolhido: ", stakeholder);
    this.selectedStakeholderEmitter.emit({ stakeholder: stakeholder, idx: idx });
    this.selectedStakeholder = stakeholder;
  }

  loadStakeholders(stakesList: StakeholdersCompleteInformation[]) {
    this.stakesMat = new MatTableDataSource(stakesList);
    this.stakesMat.paginator = this.paginator;
    this.stakesMat.sort = this.sort;
  }

  reloadCurrentRoute() {
    let currentRoute = this.route.url;
    this.route.navigate([currentRoute], { skipLocationChange: true }).then(() => {
      window.location.replace(currentRoute);
    });

  }

  removeStakeholder(stakeholder) {
    console.log("stakeholder a remover: ", stakeholder);
    this.stakeholderService.DeleteStakeholder(this.submissionId, stakeholder.stakeholderAcquiring.id).subscribe(result => {
      const index = this.submissionStakeholders.indexOf(stakeholder);
      this.submissionStakeholders.splice(index, 1);
      this.loadStakeholders(this.submissionStakeholders);
    }, error => {
      console.log("error: ", error);
    });

    //this.reloadCurrentRoute();

  }

}
