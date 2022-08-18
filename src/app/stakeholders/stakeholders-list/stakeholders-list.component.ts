import { HttpClient } from '@angular/common/http';
import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { DataService } from '../../nav-menu-interna/data.service';
import { ReadcardService } from '../../readcard/readcard.service';
import { SubmissionService } from '../../submission/service/submission-service.service';
import { IStakeholders, StakeholderOutbound } from '../IStakeholders.interface';
import { StakeholderService } from '../stakeholder.service';

@Component({
  selector: 'app-stakeholders-list',
  templateUrl: './stakeholders-list.component.html',
  styleUrls: ['./stakeholders-list.component.css']
})
export class StakeholdersListComponent implements OnInit {

  constructor(private router: ActivatedRoute, public modalService: BsModalService, private readCardService: ReadcardService,
    private http: HttpClient, private route: Router, private data: DataService, private fb: FormBuilder, private stakeholderService: StakeholderService, private submissionService: SubmissionService) { }

  //Variáveis que podem ser preenchidas
  @Input() submissionId: string;
  @Input() processNumber?: string;
  @Input() canDelete?: boolean = true;
  @Input() canSelect?: boolean = true;

  //Variáveis que vão retornar informação
  @Output() selectedStakeholderEmitter = new EventEmitter<{
    stakeholder: IStakeholders,
    idx: number
  }>();

  submissionStakeholders: IStakeholders[] = [];

  selectedStakeholder: IStakeholders = {};

  ngOnInit(): void {

    this.getSubmissionStakeholders();
  }

  getSubmissionStakeholders() {
    var context = this;
    this.submissionService.GetSubmissionByProcessNumber(this.processNumber).subscribe(result => {
      this.submissionService.GetSubmissionByID(result[0].submissionId).subscribe(resul => {
        this.stakeholderService.GetAllStakeholdersFromSubmission(result[0].submissionId).subscribe(res => {
          res.forEach(function (value, index) {
            context.stakeholderService.GetStakeholderFromSubmission(result[0].submissionId, value.id).subscribe(r => {
              context.submissionStakeholders.push(r);
            }, error => {
            });
          }, error => {
          });
        });
      });
    });

    if (this.submissionId !== null) {
      this.stakeholderService.GetAllStakeholdersFromSubmission(this.submissionId).subscribe(result => {
        result.forEach(function (value, index) {
          context.stakeholderService.GetStakeholderFromSubmission(context.submissionId, value.id).subscribe(result => {
            context.submissionStakeholders.push(result);
          }, error => {
          });
        });
      }, error => {
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

}
