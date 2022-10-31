import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Configuration, configurationToken } from 'src/app/configuration';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DataService } from '../../../nav-menu-interna/data.service';
import { IStakeholders } from '../../../stakeholders/IStakeholders.interface';
import { SubmissionService } from '../../../submission/service/submission-service.service'
import { LoggerService } from 'src/app/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SubmissionGet } from 'src/app/submission/ISubmission.interface';
import { ProcessNumberService } from 'src/app/nav-menu-presencial/process-number.service';

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

  closeSubmissionModalRef: BsModalRef | undefined;

  @ViewChild('closeSubmissionModal') closeSubmissionModal;

  public map: Map<number, boolean>;
  public currentPage: number;
  submissionId: string;
  processNumber: string;
  public subscription: Subscription; 
  public submissionAnswer: SubmissionGet;

  constructor(private logger : LoggerService, private processNrService: ProcessNumberService, private http: HttpClient,@Inject(configurationToken) private configuration: Configuration, private router: Router, private modalService: BsModalService, private data: DataService, private snackBar: MatSnackBar, private translate: TranslateService, private submissionService: SubmissionService) {
    this.baseUrl = configuration.baseUrl;
    this.submissionId = localStorage.getItem("submissionId");
    this.subscription = this.processNrService.processNumber.subscribe(processNumber => this.processNumber = processNumber);
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
    this.logger.debug(this.stakeholders);
    this.logger.debug(this.representativesSelected);
  }

  openCloseSubmissionModal() {
    this.closeSubmissionModalRef = this.modalService.show(this.closeSubmissionModal, { class: 'modal-lg' });
  }

  closeSubmission() {
    this.closeSubmissionModalRef?.hide();
    this.snackBar.open(this.translate.instant('declarativeInformation.signature.finalSubmission'), '', {
      duration: 4000,
      panelClass: ['snack-bar']
    });
    this.getSubmission();
    this.submissionAnswer.submissionType = "DigitalComplete";
    this.submissionAnswer.state = "Ready";
    this.submissionService.EditSubmission(this.submissionId, this.submissionAnswer).subscribe(result => {
      console.log("Submissão terminada");
    })
    this.router.navigate(["/"]);
    this.data.reset();
  }

  declineCloseSubmission(){
    this.closeSubmissionModalRef?.hide();
  }

  getSubmission() {
    this.submissionService.GetSubmissionByProcessNumber(this.processNumber).then(result => {
      this.submissionAnswer = result.result[0];
    })
  }


}
