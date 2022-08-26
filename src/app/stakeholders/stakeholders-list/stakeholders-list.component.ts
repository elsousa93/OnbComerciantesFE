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
  returned: string;

  ngOnInit(): void {
    this.returned = localStorage.getItem("returned");
    this.getSubmissionStakeholders();
  }

  getSubmissionStakeholders() {
    var context = this;
    if (this.returned !== null) { 
      this.submissionService.GetSubmissionByProcessNumber(this.processNumber).subscribe(result => {
        this.submissionService.GetSubmissionByID(result[0].submissionId).subscribe(resul => {
          this.stakeholderService.GetAllStakeholdersFromSubmission(result[0].submissionId).subscribe(res => {
            res.forEach(function (value, index) {
              context.stakeholderService.GetStakeholderFromSubmission(result[0].submissionId, value.id).subscribe(r => {
                console.log("stakeholder: ", r);
                context.submissionStakeholders.push(r);
              }, error => {
              });
            }, error => {
            });
          });
        });
      });
    }

    if (this.submissionId !== null) {
      console.log("submissionId é !== null");
      this.stakeholderService.GetAllStakeholdersFromSubmission(this.submissionId).subscribe(result => {
        console.log("resultado: todos os stakeholders: ", result);
        result.forEach(function (value, index) {
          console.log("valor de cada iteração foreach: ", value);
          context.stakeholderService.GetStakeholderFromSubmission(context.submissionId, value.id).subscribe(result => {
            console.log("stakeholder individual: ", result);
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
