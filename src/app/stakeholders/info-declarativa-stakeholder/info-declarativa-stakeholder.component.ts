import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { IStakeholders, StakeholdersCompleteInformation } from '../IStakeholders.interface'
import { NavigationExtras, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { EventEmitter, Output } from '@angular/core';
import { TableInfoService } from '../../table-info/table-info.service';
import { DataService } from 'src/app/nav-menu-interna/data.service';
import { StakeholderService } from '../stakeholder.service';
import { IPep, KindPep } from 'src/app/pep/IPep.interface';
import { PepComponent } from '../../pep/pep.component';
import { Observable, of, Subscription } from 'rxjs';
import { InfoStakeholderComponent } from '../info-stakeholder/info-stakeholder.component';
import { LoggerService } from '../../logger.service';
import { TranslateService } from '@ngx-translate/core';
import { ProcessService } from '../../process/process.service';
import { ProcessNumberService } from '../../nav-menu-presencial/process-number.service';
import { Client } from '../../client/Client.interface';
import { ClientService } from '../../client/client.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-info-declarativa-stakeholder',
  templateUrl: './info-declarativa-stakeholder.component.html',
  styleUrls: ['./info-declarativa-stakeholder.component.css']
})
/**
 * Nesta página há vários Form Groups
 * */
export class InfoDeclarativaStakeholderComponent implements OnInit, AfterViewInit {
  private baseUrl: string;

  callingCodeStakeholder?: string = "";
  displayValueSearch = '';
  submissionStakeholders: IStakeholders[] = [];
  submissionId: string;
  processNumber: string;
  currentStakeholder: StakeholdersCompleteInformation;

  @Output() nameEmitter = new EventEmitter<string>();

  stakeholders: IStakeholders[] = [];
  displayedColumns: string[] = ['fiscalId', 'shortName', 'identificationDocumentId', 'elegible', 'valid'];
  selectedStakeholder = {} as IStakeholders;
  returned: string;
  currentIdx: number = 0;
  infoStakeholders: FormGroup;
  stakesLength: number;

  @ViewChild(PepComponent) pepComponent: PepComponent;
  @ViewChild(InfoStakeholderComponent) infoStakeComponent: InfoStakeholderComponent;

  updatedStakeholderEvent: Observable<{ stake: IStakeholders, idx: number }>;
  previousStakeholderEvent: Observable<number>;
  public visitedStakes: string[] = [];
  returnedFrontOffice: boolean = false;
  queueName: string = "";
  title: string;
  public subscription: Subscription;
  processId: string;
  updateProcessId: string;
  merchant: Client;

  emitPreviousStakeholder(idx) {
    this.previousStakeholderEvent = idx;
  }

  emitUpdatedStakeholder(info) {
    this.updatedStakeholderEvent = info;
  }

  ngAfterViewInit() {
  }

  constructor(private formBuilder: FormBuilder, private route: Router, private data: DataService, private tableInfo: TableInfoService, private stakeholderService: StakeholderService, private logger: LoggerService, private translate: TranslateService, private processService: ProcessService, private processNrService: ProcessNumberService, private clientService: ClientService, private snackBar: MatSnackBar) {
    if (this.route?.getCurrentNavigation()?.extras?.state) {
      this.returnedFrontOffice = this.route.getCurrentNavigation().extras.state["returnedFrontOffice"];
    }

    this.infoStakeholders = this.formBuilder.group({
      contacts: this.formBuilder.group({
      }),
      pep: this.formBuilder.group({
      })
    });
  }

  ngOnInit(): void {
    this.data.updateData(false, 6, 2);
    this.subscription = this.processNrService.processId.subscribe(id => this.processId = id);
    this.subscription = this.processNrService.updateProcessId.subscribe(id => this.updateProcessId = id);
    this.subscription = this.data.currentQueueName.subscribe(queueName => {
      if (queueName != null) {
        this.translate.get('homepage.diaryPerformance').subscribe((translated: string) => {
          this.queueName = this.translate.instant('homepage.' + queueName);
          this.title = this.translate.instant('declarativeInformation.title');
        });
      }
    });
    this.returned = localStorage.getItem("returned");
    this.submissionId = localStorage.getItem("submissionId");
    this.processNumber = localStorage.getItem("processNumber");
  }

  checkVisitedStakes(visitedStakes) {
    this.visitedStakes = visitedStakes;
  }

  selectStakeholder(info) {
    if (info != null) {
      if (info.clickedTable) {
        this.submit(true);
      }
      if (this.merchant == null) {
        if (this.returned == null || (this.returned == 'edit' && (this.processId == null || this.processId == ''))) {
          this.clientService.GetClientByIdAcquiring(this.submissionId).then(result => {
            this.merchant = result;
          }).finally(() => {
            this.currentStakeholder = info.stakeholder;
            this.currentIdx = info.idx;
            this.logger.info("Selected stakeholder: " + JSON.stringify(this.currentStakeholder));
            this.logger.info("Selected stakeholder index: " + this.currentIdx);
            setTimeout(() => this.setFormData(), 500);
          });
        } else {
          if (this.returned == 'consult') {
            this.processService.getMerchantFromProcess(this.processId).subscribe(client => {
              this.merchant = client;
              this.currentStakeholder = info.stakeholder;
              this.currentIdx = info.idx;
              this.logger.info("Selected stakeholder: " + JSON.stringify(this.currentStakeholder));
              this.logger.info("Selected stakeholder index: " + this.currentIdx);
              setTimeout(() => this.setFormData(), 500);
            });
          } else {
            this.processService.getUpdateProcessInfo(this.processId, this.updateProcessId).then(result => {
              this.merchant = result.result.merchant;
              this.currentStakeholder = info.stakeholder;
              this.currentIdx = info.idx;
              this.logger.info("Selected stakeholder: " + JSON.stringify(this.currentStakeholder));
              this.logger.info("Selected stakeholder index: " + this.currentIdx);
              setTimeout(() => this.setFormData(), 500);
            });
          }
        }
      } else {
        this.currentStakeholder = info.stakeholder;
        this.currentIdx = info.idx;
        this.logger.info("Selected stakeholder: " + JSON.stringify(this.currentStakeholder));
        this.logger.info("Selected stakeholder index: " + this.currentIdx);
        setTimeout(() => this.setFormData(), 500);
      }
    }
  }

  setFormData() {
    if (this.currentStakeholder?.stakeholderAcquiring?.signType === '' || this.currentStakeholder?.stakeholderAcquiring?.signType == null) { // se for Empresa, deixar o botão disponível
      this.infoStakeholders.setErrors(null);
    } else {
      this.pepComponent.resetForm();
      this.infoStakeComponent.resetForm();

      var contacts = this.infoStakeholders.controls["contacts"];
      var stake = this.currentStakeholder.stakeholderAcquiring;

      if (stake.phone1 != undefined || stake.phone1 != null) {
        if (this.merchant.merchantType == "Entrepeneur" && this.merchant.fiscalId == stake.fiscalId) {
          contacts.get("phone").get("countryCode").setValue(this.merchant?.contacts?.phone1?.countryCode);
          contacts.get("phone").get("phoneNumber").setValue(this.merchant?.contacts?.phone1?.phoneNumber);
        } else {
          contacts.get("phone").get("countryCode").setValue(stake.phone1?.countryCode);
          contacts.get("phone").get("phoneNumber").setValue(stake.phone1?.phoneNumber);
        }
      } else {
        if (this.merchant.merchantType == "Entrepeneur" && this.merchant.fiscalId == stake.fiscalId) {
          contacts.get("phone").get("countryCode").setValue(this.merchant?.contacts?.phone1?.countryCode);
          contacts.get("phone").get("phoneNumber").setValue(this.merchant?.contacts?.phone1?.phoneNumber);
        }
      }

      if (stake.email != '' && stake.email != null) {
        if (this.merchant.merchantType == "Entrepeneur" && this.merchant.fiscalId == stake.fiscalId) {
          contacts.get("email").setValue(this.merchant?.contacts?.email);
        } else {
          contacts.get("email").setValue(stake.email);
        }
      } else {
        if (this.merchant.merchantType == "Entrepeneur" && this.merchant.fiscalId == stake.fiscalId) {
          contacts.get("email").setValue(this.merchant?.contacts?.email);
        }
      }

      var pep = this.infoStakeholders.controls["pep"];
      if (stake.pep != undefined || stake.pep != null) {
        if (stake.pep.kind.toLowerCase() === KindPep.PEP && stake.pep.pepSince != '0001-01-01') {
          this.pepComponent.onChangeValues({ target: { value: 'true', name: 'pep12months' } });
          pep.get("pepType").setValue(stake.pep?.pepType);
          pep.get("pepCountry").setValue(stake.pep?.pepCountry);
          pep.get("pepSinceWhen").setValue(stake.pep?.pepSince);
        } else if (stake.pep.kind.toLowerCase() === KindPep.FAMILY && stake.pep.degreeOfRelatedness != null && stake.pep.degreeOfRelatedness != '') {
          this.pepComponent.onChangeValues({ target: { value: 'false', name: 'pep12months' } });
          this.pepComponent.onChangeValues({ target: { value: 'true', name: 'pepFamiliarOf' } });
          pep.get("pepFamilyRelation").setValue(stake.pep?.degreeOfRelatedness);
        } else if (stake.pep.kind.toLowerCase() === KindPep.BUSINESS) {
          this.pepComponent.onChangeValues({ target: { value: 'false', name: 'pep12months' } });
          this.pepComponent.onChangeValues({ target: { value: 'false', name: 'pepFamiliarOf' } });
          this.pepComponent.onChangeValues({ target: { value: 'true', name: 'pepRelations' } });
          pep.get("pepTypeOfRelation").setValue(stake.pep?.businessPartnership);
        } else if (stake.pep.kind.toLowerCase() === KindPep.PEP && stake.pep.pepSince == '0001-01-01') {
          this.pepComponent.onChangeValues({ target: { value: 'false', name: 'pep12months' } });
          this.pepComponent.onChangeValues({ target: { value: 'false', name: 'pepFamiliarOf' } });
          this.pepComponent.onChangeValues({ target: { value: 'false', name: 'pepRelations' } });
          this.pepComponent.onChangeValues({ target: { value: 'true', name: 'pepPoliticalPublicJobs' } });
          pep.get("pepType").setValue(stake.pep?.pepType);
        }
      } else {
        this.pepComponent.onChangeValues({ target: { value: 'false', name: 'pep12months' } });
        this.pepComponent.onChangeValues({ target: { value: 'false', name: 'pepFamiliarOf' } });
        this.pepComponent.onChangeValues({ target: { value: 'false', name: 'pepRelations' } });
        this.pepComponent.onChangeValues({ target: { value: 'false', name: 'pepPoliticalPublicJobs' } });
      }
      if (this.returned == 'consult') {
        this.infoStakeholders.disable();
      }
    }    
  }

  submit(clickedTable: boolean = false) {
    this.closeAccordion();
    let updateAction = null;
    if (this.returned != 'consult') {
      if (this.infoStakeholders.valid) {
        if (this.currentStakeholder.stakeholderAcquiring?.signType != null) {
          var contacts = this.infoStakeholders.get("contacts");

          if (contacts.get("phone").value) {
            if (this.currentStakeholder.stakeholderAcquiring.phone1 == null) {
              this.currentStakeholder.stakeholderAcquiring.phone1 = {};
            }
            this.currentStakeholder.stakeholderAcquiring.phone1.countryCode = contacts.get("phone").get("countryCode").value;
            this.currentStakeholder.stakeholderAcquiring.phone1.phoneNumber = contacts.get("phone").get("phoneNumber").value;
          }

          if (contacts.get("email").value) {
            this.currentStakeholder.stakeholderAcquiring.email = contacts.get("email").value;
          }

          var pep = this.infoStakeholders.get("pep");

          if (pep.get("pep12months").value == "true") {
            this.currentStakeholder.stakeholderAcquiring.pep = new IPep();
            this.currentStakeholder.stakeholderAcquiring.pep.kind = KindPep.PEP;
            this.currentStakeholder.stakeholderAcquiring.pep.pepType = pep.get("pepType").value;
            this.currentStakeholder.stakeholderAcquiring.pep.pepCountry = pep.get("pepCountry").value;
            this.currentStakeholder.stakeholderAcquiring.pep.pepSince = pep.get("pepSinceWhen").value;
          } else if (pep.get("pepFamiliarOf").value == "true") {
            this.currentStakeholder.stakeholderAcquiring.pep = new IPep();
            this.currentStakeholder.stakeholderAcquiring.pep.kind = KindPep.FAMILY;
            this.currentStakeholder.stakeholderAcquiring.pep.pepType = "RFAM";
            this.currentStakeholder.stakeholderAcquiring.pep.degreeOfRelatedness = pep.get("pepFamilyRelation").value;
          } else if (pep.get("pepRelations").value == "true") {
            this.currentStakeholder.stakeholderAcquiring.pep = new IPep();
            this.currentStakeholder.stakeholderAcquiring.pep.kind = KindPep.BUSINESS;
            this.currentStakeholder.stakeholderAcquiring.pep.pepType = "RSOC";
            this.currentStakeholder.stakeholderAcquiring.pep.businessPartnership = pep.get("pepTypeOfRelation").value;
          } else if (pep.get("pepPoliticalPublicJobs").value == "true") {
            this.currentStakeholder.stakeholderAcquiring.pep = new IPep();
            this.currentStakeholder.stakeholderAcquiring.pep.kind = KindPep.PEP;
            this.currentStakeholder.stakeholderAcquiring.pep.pepType = pep.get("pepType").value;
          } else if (pep.get("pepPoliticalPublicJobs").value == 'false') {
            this.currentStakeholder.stakeholderAcquiring.pep = null;
          }
          this.logger.info("Stakeholder to update: " + JSON.stringify(this.currentStakeholder.stakeholderAcquiring));
          if (this.returned == null || (this.returned == 'edit' && (this.processId == null || this.processId == ''))) {
            this.stakeholderService.UpdateStakeholder(this.submissionId, this.currentStakeholder.stakeholderAcquiring.id, this.currentStakeholder.stakeholderAcquiring).subscribe(result => {
              this.logger.info("Updated stakeholder result: " + JSON.stringify(result));
              this.visitedStakes.push(result.id);
              this.visitedStakes = Array.from(new Set(this.visitedStakes));
              if (!clickedTable) {
                if (this.visitedStakes.length < (this.stakesLength)) {
                  this.emitUpdatedStakeholder(of({ stake: this.currentStakeholder, idx: this.currentIdx }));
                } else {
                  this.data.updateData(false, 6, 3);
                  this.logger.info("Redirecting to Info Declarativa Lojas page");
                  this.route.navigate(['info-declarativa-lojas']);
                }
              }
            });
          } else {
            if (this.updateProcessId != null && this.updateProcessId != "") {
              updateAction = this.currentStakeholder.stakeholderAcquiring["updateProcessAction"];
              this.currentStakeholder.stakeholderAcquiring["updateProcessAction"] = null;
            }
            let o = Object.fromEntries(Object.entries(this.currentStakeholder.stakeholderAcquiring).filter(([_, v]) => v != null));
            this.processService.updateStakeholderProcess(this.processId, this.currentStakeholder.stakeholderAcquiring.id, this.currentStakeholder.stakeholderAcquiring).then(result => {
              this.logger.info("Updated stakeholder result: " + JSON.stringify(result));
              this.visitedStakes.push(result.result.id);
              this.visitedStakes = Array.from(new Set(this.visitedStakes));
              if (this.updateProcessId != null && this.updateProcessId != "") {
                this.currentStakeholder.stakeholderAcquiring["updateProcessAction"] = updateAction;
              }
              if (!clickedTable) {
                if (this.visitedStakes.length < (this.stakesLength)) {
                  this.emitUpdatedStakeholder(of({ stake: this.currentStakeholder, idx: this.currentIdx }));
                } else {
                  this.data.updateData(false, 6, 3);
                  this.logger.info("Redirecting to Info Declarativa Lojas page");
                  this.route.navigate(['info-declarativa-lojas']);
                }
              }
            });
          }
        } else {
          this.visitedStakes.push(this.currentStakeholder.stakeholderAcquiring.id);
          this.visitedStakes = Array.from(new Set(this.visitedStakes));
          if (!clickedTable) {
            if (this.visitedStakes.length < (this.stakesLength)) {
              this.emitUpdatedStakeholder(of({ stake: this.currentStakeholder, idx: this.currentIdx }));
            } else {
              this.data.updateData(false, 6, 3);
              this.logger.info("Redirecting to Info Declarativa Lojas page");
              this.route.navigate(['info-declarativa-lojas']);
            }
          }
        }
      } else {
        this.openAccordeons();
        this.infoStakeholders.markAllAsTouched();
        this.snackBar.open(this.translate.instant('generalKeywords.formInvalid'), '', {
          duration: 15000,
          panelClass: ['snack-bar']
        });
      } 
    } else {
      if (!clickedTable) {
        this.data.updateData(true, 6, 3);
        this.logger.info("Redirecting to Info Declarativa Lojas page");
        this.route.navigate(['info-declarativa-lojas']);
      }
    }
  }

  openAccordeons() {
    document.getElementById("flush-collapseOne").className = "accordion-collapse collapse show";
    document.getElementById("accordionButton1").className = "accordion1-button";
    document.getElementById("flush-collapseTwo").className = "accordion-collapse collapse show";
    document.getElementById("accordionButton2").className = "accordion1-button";
  }

  getStakesListLength(value) {
    this.stakesLength = value;
  }

  goToInfoDeclarativa() {
    if ((this.currentIdx - 1) >= 0) {
      this.emitPreviousStakeholder(of(this.currentIdx));
    } else {
      let navigationExtras = {
        state: {
          returnedFrontOffice: this.returnedFrontOffice
        }
      } as NavigationExtras;
      this.logger.info("Redirecting to Info Declarativa page");
      this.route.navigate(['/info-declarativa'], navigationExtras);
    }
  }

  closeAccordion() {
    document.getElementById("flush-collapseOne").className = "accordion-collapse collapse show";
    document.getElementById("accordionButton1").className = "accordion1-button";
    document.getElementById("flush-collapseTwo").className = "accordion-collapse collapse";
    document.getElementById("accordionButton2").className = "accordion1-button collapsed";
  }

  openCancelPopup() {
    //this.cancelModalRef = this.modalService.show(this.cancelModal);
    this.route.navigate(['/']);
  }

  closeCancelPopup() {
    //this.cancelModalRef?.hide();
  }

  confirmCancel() {
    //var context = this;
    //var processNumber = "";
    //this.processNrService.processNumber.subscribe(res => processNumber = res);
    //var encodedCode = encodeURIComponent(processNumber);
    //var baseUrl = this.configuration.getConfig().acquiringAPIUrl;
    //var url = baseUrl + 'process?number=' + encodedCode;
    //this.processService.advancedSearch(url, 0, 1).subscribe(result => {
    //  context.queueService.markToCancel(result.items[0].processId, context.authService.GetCurrentUser().userName).then(res => {
    //    context.closeCancelPopup();
    //    context.route.navigate(['/']);
    //  });
    //});
  }

}
