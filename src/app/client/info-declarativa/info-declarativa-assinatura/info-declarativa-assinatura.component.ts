import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { distinctUntilChanged, Subscription } from 'rxjs';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DataService } from '../../../nav-menu-interna/data.service';
import { IStakeholders } from '../../../stakeholders/IStakeholders.interface';
import { SubmissionService } from '../../../submission/service/submission-service.service'
import { LoggerService } from 'src/app/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SubmissionGetTemplate } from 'src/app/submission/ISubmission.interface';
import { ProcessNumberService } from 'src/app/nav-menu-presencial/process-number.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { StakeholderService } from 'src/app/stakeholders/stakeholder.service';
import { TableInfoService } from '../../../table-info/table-info.service';
import { ContractPackLanguage } from '../../../table-info/ITable-info.interface';
import { ProcessService } from '../../../process/process.service';
import { AuthService } from '../../../services/auth.service';
import { QueuesService } from '../../../queues-detail/queues.service';

@Component({
  selector: 'app-info-declarativa-assinatura',
  templateUrl: './info-declarativa-assinatura.component.html',
  styleUrls: ['./info-declarativa-assinatura.component.css']
})
export class InfoDeclarativaAssinaturaComponent implements OnInit {
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
  returned: string; //variável para saber se estamos a editar um processo
  public submissionAnswer: SubmissionGetTemplate;
  public contractLanguage: ContractPackLanguage[];
  returnedFrontOffice: boolean = false;
  queueName: string = "";
  title: string;
  processId: string;
  currentStakes: Map<string, string> = new Map<string, string>();
  updateProcessId: string;
  @ViewChild('cancelModal') cancelModal;
  cancelModalRef: BsModalRef | undefined;

  constructor(private logger: LoggerService, private processNrService: ProcessNumberService, private router: Router, private modalService: BsModalService, private data: DataService, private snackBar: MatSnackBar, private translate: TranslateService, private submissionService: SubmissionService, private stakeholderService: StakeholderService, private tableInfoService: TableInfoService, private processService: ProcessService, private authService: AuthService, private queueService: QueuesService) {
    if (this.router?.getCurrentNavigation()?.extras?.state) {
      this.returnedFrontOffice = this.router.getCurrentNavigation().extras.state["returnedFrontOffice"];
    }

    this.submissionId = localStorage.getItem("submissionId");
    this.subscription = this.processNrService.processNumber.subscribe(processNumber => this.processNumber = processNumber);
    this.subscription = this.processNrService.processId.subscribe(processId => this.processId = processId);
    this.subscription = this.processNrService.updateProcessId.subscribe(processId => this.updateProcessId = processId);
    this.initializeForm();

    this.returned = localStorage.getItem("returned");

    if (this.returned == 'consult') {
      this.form.disable();
    }

    this.tableInfoService.GetContractualPackLanguage().subscribe(result => {
      this.contractLanguage = result;
    });
  }

  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    this.subscription = this.data.currentStakes.subscribe(currentStakes => this.currentStakes = currentStakes);
    this.subscription = this.data.currentSignType.subscribe(currentSignType => {
      this.isVisible = currentSignType;
      this.form.get("signature").setValue(currentSignType);
    });
    this.subscription = this.data.currentQueueName.subscribe(queueName => {
      if (queueName != null) {
        this.translate.get('homepage.diaryPerformance').subscribe((translated: string) => {
          this.queueName = this.translate.instant('homepage.' + queueName);
          this.title = this.translate.instant('declarativeInformation.title');
        });
      }
    });
    this.data.updateData(false, 6, 3);
    this.choosePaper(this.isVisible);
  }

  initializeForm() {
    var context = this;

    this.form = new FormGroup({
      language: new FormControl('PT', Validators.required),
      signature: new FormControl(true, Validators.required)
    });

    this.form.statusChanges.pipe(distinctUntilChanged()).subscribe(val => {
      if (val === 'VALID') {
        this.data.updateData(false, 6, 4);
      }
    });

    this.form.valueChanges.pipe(distinctUntilChanged()).subscribe(val => {
      if (this.submissionStakeholders.length > 0) {
        this.submissionStakeholders.forEach(stake => {
          this.data.updateStakeSignature(stake.id, context.form.get(stake.id).value);
        });
      }
    });
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
  }

  declineCloseSubmission() {
    this.closeSubmissionModalRef?.hide();
  }

  choosePaper(paper: boolean) {
    this.isVisible = paper;
    var context = this;
    this.data.changeSignType(paper);
    if (!paper) {
      if (this.submissionStakeholders.length == 0) {
        if (this.returned == null || (this.returned == 'edit' && (this.processId == null || this.processId == ''))) {
          this.stakeholderService.GetAllStakeholdersFromSubmission(this.submissionId).then(result => {
            var stakeholders = result.result;
            stakeholders.forEach(function (value, index) {
              context.stakeholderService.GetStakeholderFromSubmission(context.submissionId, value.id).then(res => {
                var stake = res.result;
                if (stake.signType == 'CitizenCard') {
                  if (context.currentStakes.has(stake.id)) {
                    context.form.addControl(stake.id, new FormControl(context.currentStakes.get(stake.id), Validators.required));
                  } else {
                    context.form.addControl(stake.id, new FormControl(stake.signType, Validators.required));
                  }
                  context.submissionStakeholders.push(stake);
                }
              }, error => {
                context.logger.error(error);
              });
            });
          }, error => {
          });
        } else {
          if (this.returned == 'consult') {
            this.processService.getStakeholdersFromProcess(this.processId).then(result => {
              var stakeholders = result.result;
              stakeholders.forEach(function (value, index) {
                context.processService.getStakeholderByIdFromProcess(context.processId, value.id).subscribe(res => {
                  var stake = res;
                  if (stake.signType == 'CitizenCard') {
                    if (context.currentStakes.has(stake.id)) {
                      context.form.addControl(stake.id, new FormControl(context.currentStakes.get(stake.id), Validators.required));
                    } else {
                      context.form.addControl(stake.id, new FormControl(stake.signType, Validators.required));
                    }
                    context.submissionStakeholders.push(stake);
                  }
                }, error => {
                  context.logger.error(error);
                });
              });
            }, error => {
            });
          } else {
            this.processService.getUpdateProcessInfo(this.processId, this.updateProcessId).then(result => {
              var stakeholders = result.result.stakeholders;
              stakeholders.forEach(stake => {
                if (stake.signType == 'CitizenCard') {
                  if (context.currentStakes.has(stake.id)) {
                    context.form.addControl(stake.id, new FormControl(context.currentStakes.get(stake.id), Validators.required));
                  } else {
                    context.form.addControl(stake.id, new FormControl(stake.signType, Validators.required));
                  }
                  context.submissionStakeholders.push(stake);
                }
              });
            });
          }
        }
      }
    }
  }

  sendFinalSubmission() {
    if (this.returned != 'consult') {
      if (this.form.valid) {
        var context = this;
        this.submissionStakeholders.forEach((stake, index) => {
          var signType = "";
          if (context.isVisible) {
            signType = "CitizenCard";
          } else {
            signType = context.form.get(stake.id).value;
          }
          stake["signType"] = signType;
          if (context.returned == null) {
            context.stakeholderService.UpdateStakeholder(context.submissionId, stake.id, stake).subscribe(res => { });
          } else {
            context.processService.updateStakeholderProcess(context.processId, stake.id, stake).then(res => { });
          }
        });

        if (this.returned == null || (this.returned == 'edit' && (this.processId == null || this.processId == ''))) {
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
              contractPackLanguage: this.form.get("language").value,
              observation: this.submissionAnswer.observation
            }
            this.logger.info("Updated submission data: " + JSON.stringify(submissionToSend));
            this.submissionService.EditSubmission(this.submissionId, submissionToSend).subscribe(result => {
              this.logger.info("Submission updated: " + JSON.stringify(result));
              this.logger.info("Redirecting to Dashboard page");
              this.router.navigate(["/"]);
              this.data.reset();
            });
          });
        } else {
          this.processService.getProcessById(this.processId).subscribe(result => {
            var updateProcessBody = {
              submissionUser: "",
              observation: "",
              contractPackLanguage: "",
              signType: "",
              isClientAwaiting: false
            };
            updateProcessBody.submissionUser = context.authService.GetCurrentUser().userName;
            updateProcessBody.isClientAwaiting = result.isClientAwaiting;
            updateProcessBody.signType = this.isVisible ? "Manual" : "Digital";
            updateProcessBody.contractPackLanguage = "PT";
            context.processService.updateProcess(context.processId, updateProcessBody).then(result => {
              this.logger.info("Process updated: " + JSON.stringify(result));
              this.logger.info("Redirecting to Dashboard page");
              var object = {
                submissionUser: context.authService.GetCurrentUser().userName,
                observations: null
              };
              context.processService.finishProcessUpdate(context.processId, object).then(res => {
                this.router.navigate(["/"]);
                this.data.reset();
              });
            });
          });
        }
      } else {
        this.form.markAllAsTouched();
        this.snackBar.open(this.translate.instant('generalKeywords.formInvalid'), '', {
          duration: 15000,
          panelClass: ['snack-bar']
        });
      }
    } else {
      this.router.navigate(["/"]);
      this.data.reset();
    }
  }

  goBack() {
    let navigationExtras = {
      state: {
        returnedFrontOffice: this.returnedFrontOffice
      }
    } as NavigationExtras;
    this.router.navigate(['info-declarativa-lojas'], navigationExtras);
  }

  openCancelPopup() {
    this.cancelModalRef = this.modalService.show(this.cancelModal);
  }

  closeCancelPopup() {
    this.cancelModalRef?.hide();
  }

  confirmCancel() {
    if (this.returned != 'consult') {
      var context = this;
      var processNumber = "";
      this.processNrService.processNumber.subscribe(res => processNumber = res);
      var encodedCode = encodeURIComponent(processNumber);
      if (this.returned == null || (this.returned == 'edit' && (this.processId == '' || this.processId == null))) {
        this.submissionService.GetSubmissionByProcessNumber(encodedCode).then(result => {
          context.queueService.markToCancel(result.result[0].processId, context.authService.GetCurrentUser().userName).then(res => {
            context.closeCancelPopup();
            context.router.navigate(['/']);
          });
        });
      } else {
        context.queueService.markToCancel(context.processId, context.authService.GetCurrentUser().userName).then(res => {
          context.closeCancelPopup();
          context.router.navigate(['/']);
        });
      }
    }
  }
}
