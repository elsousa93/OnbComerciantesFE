import { Component, Input, Output, OnInit, EventEmitter, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { SubmissionService } from '../../submission/service/submission-service.service';
import { StakeholdersCompleteInformation } from '../IStakeholders.interface';
import { StakeholderService } from '../stakeholder.service';

@Component({
  selector: 'app-stakeholders-list',
  templateUrl: './stakeholders-list.component.html',
  styleUrls: ['./stakeholders-list.component.css']
})
export class StakeholdersListComponent implements OnInit, AfterViewInit {
 @ViewChild('selectedBlueDiv') selectedBlueDiv: ElementRef<HTMLElement>;

  triggerFalseClick() {
    let el: HTMLElement = this.selectedBlueDiv.nativeElement;
    el.click();
  }

  constructor(private translate: TranslateService, public modalService: BsModalService, private route: Router, private stakeholderService: StakeholderService, private submissionService: SubmissionService) {
     // this.triggerFalseClick();
  }
 
  stakesMat = new MatTableDataSource<StakeholdersCompleteInformation>();
  @ViewChild('paginator') set paginator(pager:MatPaginator) {
    if (pager) {
      this.stakesMat.paginator = pager;
      this.stakesMat.paginator._intl = new MatPaginatorIntl();
      this.stakesMat.paginator._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');
    }
  }

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

  @Output() listLengthEmitter = new EventEmitter<{
    length: number
  }>();

  submissionStakeholders: StakeholdersCompleteInformation[] = [];

  selectedStakeholder: StakeholdersCompleteInformation = {};
  returned: string;

  displayedColumns: string[] = ['shortName', 'fiscalId', 'entityType', 'relationType', 'elegible', 'clientNumber', 'signature', 'delete'];

  //subStakeholders: StakeholdersCompleteInformation[] = [];

  ngOnInit(): void {
    this.returned = localStorage.getItem("returned");
    console.log("Valor do submissionId no INIT ", this.submissionId);
    this.getSubmissionStakeholders();
    setTimeout(() => this.stakesMat.data = this.submissionStakeholders, 2000);
    this.listLengthEmitter.emit({ length: this.submissionStakeholders.length });
  }

  ngAfterViewInit(): void {
    //this.stakesMat.data = this.submissionStakeholders;
    // this.stakesMat.paginator = this.paginator;
    this.stakesMat.sort = this.sort;
  }

  getSubmissionStakeholders() {
    var context = this;
    if (this.returned != null) {
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
    console.log('Valor do submission id dentro da chamada do getSubmissionStakeholdersAux', this.submissionId);
    console.log('Valor do localStorage ', localStorage.getItem("submissionId"));
    if (this.submissionId != null) {
      this.stakeholderService.GetAllStakeholdersFromSubmission(this.submissionId).then(result => {
        var results = result.result;
        console.log('Get All stakes from submission ', results);
        results.forEach(function (value, index) {
          context.stakeholderService.GetStakeholderFromSubmission(context.submissionId, value.id).subscribe(res => {
            console.log('Stake especifico ', res);
            var AcquiringStakeholder = res;
            var stakeholderToInsert = {
              displayName: '',
              eligibility: false,
              stakeholderAcquiring: AcquiringStakeholder,
              stakeholderOutbound: undefined
            }

            //context.submissionStakeholders.push(stakeholderToInsert);

            //context.stakeholderService.getStakeholderByID(tempStakeholderID/*AcquiringStakeholder.stakeholderId*/, "por mudar", "por mudar").subscribe(outboundResult => {
            //  stakeholderToInsert.stakeholderOutbound = outboundResult;
            //  context.submissionStakeholders.push(stakeholderToInsert);

            //})
            if (AcquiringStakeholder.stakeholderId != null) { 
              var stakeholderFunction = context.stakeholderService.getStakeholderByID(AcquiringStakeholder.stakeholderId, "por mudar", "por mudar").toPromise();

              stakeholderFunction.then(success => {
                stakeholderToInsert.stakeholderOutbound = success;
              }).then(success =>{
                context.submissionStakeholders.push(stakeholderToInsert);
              });
              console.log("array que ainda está a ser preenchida: ", context.submissionStakeholders);
            }

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
    this.stakesMat.data = stakesList;
    // this.stakesMat.paginator = this.paginator;
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
