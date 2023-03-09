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

  emitPreviousStakeholder(idx) {
    this.previousStakeholderEvent = idx;
  }

  emitUpdatedStakeholder(info) {
    this.updatedStakeholderEvent = info;
  }

  ngAfterViewInit() {
  }

  constructor(private formBuilder: FormBuilder, private route: Router, private data: DataService, private tableInfo: TableInfoService, private stakeholderService: StakeholderService, private logger: LoggerService, private translate: TranslateService) {
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

  selectStakeholder(info) {
    if (info != null) {
      this.currentStakeholder = info.stakeholder;
      this.currentIdx = info.idx;
      this.logger.info("Selected stakeholder: " + JSON.stringify(this.currentStakeholder));
      this.logger.info("Selected stakeholder index: " + this.currentIdx);
      setTimeout(() => this.setFormData(), 500);
    }
  }

  setFormData() {
    this.pepComponent.resetForm();
    this.infoStakeComponent.resetForm();

    var contacts = this.infoStakeholders.controls["contacts"];
    var stake = this.currentStakeholder.stakeholderAcquiring;

    if (stake.phone1 != undefined || stake.phone1 != null) {
      contacts.get("phone").get("countryCode").setValue(stake.phone1?.countryCode);
      contacts.get("phone").get("phoneNumber").setValue(stake.phone1?.phoneNumber);
    }

    if (stake.email != '' && stake.email != null) {
      contacts.get("email").setValue(stake.email);
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
  }

  submit() {
    if (this.returned != 'consult') {
      if (this.infoStakeholders.valid) {
        var contacts = this.infoStakeholders.get("contacts");

        if (contacts.get("phone").value) {
          if (this.currentStakeholder.stakeholderAcquiring.phone1 === null) {
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
        this.stakeholderService.UpdateStakeholder(this.submissionId, this.currentStakeholder.stakeholderAcquiring.id, this.currentStakeholder.stakeholderAcquiring).subscribe(result => {
          this.logger.info("Updated stakeholder result: " + JSON.stringify(result));
          this.visitedStakes.push(this.currentStakeholder.stakeholderAcquiring.id);
          this.visitedStakes = Array.from(new Set(this.visitedStakes));
          if (this.visitedStakes.length < (this.stakesLength)) {
            this.emitUpdatedStakeholder(of({ stake: this.currentStakeholder, idx: this.currentIdx }));
          } else {
            this.data.updateData(false, 6, 3);
            this.logger.info("Redirecting to Info Declarativa Lojas page");
            this.route.navigate(['info-declarativa-lojas']);
          }
        });
      }
    } else {
      this.data.updateData(false, 6, 3);
      this.logger.info("Redirecting to Info Declarativa Lojas page");
      this.route.navigate(['info-declarativa-lojas']);
    }
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

  //getCountryInternationalCallingCode() {
  //  return new Promise(resolve => {
  //    if (this.currentStakeholder.stakeholderAcquiring?.phone1?.countryCode != null && !this.currentStakeholder?.stakeholderAcquiring?.phone1?.countryCode.startsWith("+")) {
  //      this.tableInfo.GetCountryById(this.currentStakeholder?.stakeholderAcquiring?.phone1?.countryCode).subscribe(result => {
  //        this.logger.info("Get country by id result: " + JSON.stringify(result));
  //        if (result != null) {
  //          this.currentStakeholder.stakeholderAcquiring.phone1.countryCode = result.internationalCallingCode;
  //        }
  //        resolve(true);
  //      }, error => resolve(false));
  //    } else {
  //      resolve(false);
  //    }
  //  });
  //}

}
