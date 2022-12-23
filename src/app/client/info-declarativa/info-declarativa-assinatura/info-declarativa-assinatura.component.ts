import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { distinctUntilChanged, Subscription } from 'rxjs';
import { Configuration, configurationToken } from 'src/app/configuration';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DataService } from '../../../nav-menu-interna/data.service';
import { IStakeholders } from '../../../stakeholders/IStakeholders.interface';
import { SubmissionService } from '../../../submission/service/submission-service.service'
import { LoggerService } from 'src/app/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SubmissionGet, SubmissionGetTemplate, SubmissionPutTemplate } from 'src/app/submission/ISubmission.interface';
import { ProcessNumberService } from 'src/app/nav-menu-presencial/process-number.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { StakeholderService } from 'src/app/stakeholders/stakeholder.service';

@Component({
  selector: 'app-info-declarativa-assinatura',
  templateUrl: './info-declarativa-assinatura.component.html',
  styleUrls: ['./info-declarativa-assinatura.component.css']
})
export class InfoDeclarativaAssinaturaComponent implements OnInit {
  private baseUrl: string;
  isVisible: boolean = true;
  stakeholders: IStakeholders[] = [];
  submissionStakeholders: IStakeholders[] = [];
  representativesSelected: String[] = [];
  form: FormGroup;

  closeSubmissionModalRef: BsModalRef | undefined;

  @ViewChild('closeSubmissionModal') closeSubmissionModal;

  public map: Map<number, boolean>;
  public currentPage: number;
  submissionId: string;
  processNumber: string;
  public subscription: Subscription;
  public submissionAnswer: SubmissionGetTemplate;

  constructor(private logger: LoggerService, private processNrService: ProcessNumberService, private http: HttpClient, private router: Router, private modalService: BsModalService, private data: DataService, private snackBar: MatSnackBar, private translate: TranslateService, private submissionService: SubmissionService, private stakeholderService: StakeholderService) {
    this.submissionId = localStorage.getItem("submissionId");
    this.subscription = this.processNrService.processNumber.subscribe(processNumber => this.processNumber = processNumber);

    var context = this;
    this.initializeForm();


    this.stakeholderService.GetAllStakeholdersFromSubmission(this.submissionId).then(result => {

      var stakeholders = result.result;

      stakeholders.forEach(function (value, index) {
        context.stakeholderService.GetStakeholderFromSubmission(context.submissionId, value.id).subscribe(res => {
          console.log("stakeholder adicionado com sucesso");
          context.form.addControl(index + "", new FormControl(""));
          context.submissionStakeholders.push(res);
        }, error => {
          console.log("Erro a adicionar stakeholder");
        });
      });
    }, error => {
    });
  }

  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    this.data.updateData(false, 6, 3);
    this.initializeForm();
  }

  initializeForm() {
    this.form = new FormGroup({
      language: new FormControl('', Validators.required),
      signature: new FormControl(true, Validators.required)
    });

    //this.submissionStakeholders.forEach((stake, index) => {
    //  this.form.addControl(index + "", new FormControl(""));
    //});

    this.form.statusChanges.pipe(distinctUntilChanged()).subscribe(val => {
      if (val === 'VALID') {
        this.data.updateData(false, 6, 4);
      }
    });
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
    this.sendFinalSubmission();

    this.router.navigate(["/"]);
    this.data.reset();
  }

  declineCloseSubmission() {
    this.closeSubmissionModalRef?.hide();
  }

  choosePaper(paper: boolean) {
    this.isVisible = paper;
  }

  sendFinalSubmission() {
    if (this.form.valid) {
      var context = this;

      this.submissionStakeholders.forEach((stake, index) => {
        var signType = "";
        if (context.isVisible) {
          signType = "CitizenCard";
        } else {
          signType = context.form.get(index + "").value;
        }
        stake["signType"] = signType;
        this.stakeholderService.UpdateStakeholder(this.submissionId, stake.id, stake).subscribe(res => {
          console.log("Stake atualizado ", res);
        });
      });

      this.submissionService.GetSubmissionByID(this.submissionId).then(result => {
        this.submissionAnswer = result.result;

        var submissionToSend = {
          submissionType: "DigitalComplete",
          processNumber: this.submissionAnswer.processNumber,
          processKind: this.submissionAnswer.processKind,
          processType: this.submissionAnswer.processType,
          signType: this.isVisible ? "Manual" : "Digital",
          isClientAwaiting: this.submissionAnswer.isClientAwaiting,
          submissionUser: this.submissionAnswer.submissionUser,
          id: this.submissionAnswer.id,
          bank: this.submissionAnswer.bank,
          state: "Ready",
          startedAt: new Date().toISOString(),
          //: this.form.get("language").value
        }

        this.submissionService.EditSubmission(this.submissionId, submissionToSend).subscribe(result => {
          console.log("Submissão terminada");
        });

      });
      //this.submissionService.GetSubmissionByProcessNumber(this.processNumber).then(result => {
      //  this.submissionAnswer = result.result[0];
      //  this.submissionAnswer.submissionType = "DigitalComplete";
      //  this.submissionAnswer.state = "Ready";
      //  this.submissionAnswer.submissionUser = {
      //    user: "",
      //    branch: "",
      //    partner: ""
      //  };
      //  this.submissionAnswer.bank = "";
        
      //  this.submissionService.EditSubmission(this.submissionId, this.submissionAnswer).subscribe(result => {
      //    console.log("Submissão terminada");
      //  })
      //})
    }

  }


}
