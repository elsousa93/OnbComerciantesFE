import { Component, Input, Output, OnInit, EventEmitter, ViewChild, AfterViewInit, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { MatPaginator, MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { Client } from '../../client/Client.interface';
import { ClientService } from '../../client/client.service';
import { LoggerService } from '../../logger.service';
import { DataService } from '../../nav-menu-interna/data.service';
import { IStakeholders, StakeholdersCompleteInformation } from '../IStakeholders.interface';
import { StakeholderService } from '../stakeholder.service';

@Component({
  selector: 'app-stakeholders-list',
  templateUrl: './stakeholders-list.component.html',
  styleUrls: ['./stakeholders-list.component.css']
})
export class StakeholdersListComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('selectedBlueDiv') selectedBlueDiv: ElementRef<HTMLElement>;

  public submissionClient: Client;

  constructor(private translate: TranslateService, public modalService: BsModalService, private route: Router, private stakeholderService: StakeholderService, private clientService: ClientService, private dataService: DataService, private logger: LoggerService) {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["insertStakeholderEvent"]) {
      this.insertStakeholderEvent?.subscribe(result => {
        if (result.fiscalId === null) {
          result.fiscalId = (result as any).fiscalIdentification.fiscalId;
        }
        var stakeToInsert = {
          stakeholderAcquiring: result,
          stakeholderOutbound: undefined,
          displayName: "",
          eligibility: false
        } as StakeholdersCompleteInformation;

        this.submissionStakeholders.push(stakeToInsert);
        this.listLengthEmitter.emit(this.submissionStakeholders.length);
        this.loadStakeholders(this.submissionStakeholders);
      });
    }
    if (changes["updatedStakeholderEvent"]) {
      this.updatedStakeholderEvent?.subscribe(result => {
        var nextIdx = result.idx + 1;
        if (nextIdx >= this.submissionStakeholders.length) {
          nextIdx = 0;
        } else {
          if (nextIdx >= (this.stakesMat.paginator.pageSize * (this.stakesMat.paginator.pageIndex + 1))) {
            this.stakesMat.paginator.pageIndex = this.stakesMat.paginator.pageIndex + 1;
            const event: PageEvent = {
              length: this.stakesMat.paginator.length,
              pageIndex: this.stakesMat.paginator.pageIndex,
              pageSize: this.stakesMat.paginator.pageSize
            };
            this.stakesMat.paginator.page.next(event);
          }
        }

        this.emitSelectedStakeholder(this.submissionStakeholders[nextIdx], nextIdx);
      });
    }
    if (changes["previousStakeholderEvent"]) {
      this.previousStakeholderEvent?.subscribe(result => {
        if (result > 0) {
          var prevIdx = result - 1;
          if (prevIdx < (this.stakesMat.paginator.pageSize * this.stakesMat.paginator.pageIndex) && this.stakesMat.paginator.pageIndex >= 1) {
            this.stakesMat.paginator.pageIndex = this.stakesMat.paginator.pageIndex - 1;
            const event: PageEvent = {
              length: this.stakesMat.paginator.length,
              pageIndex: this.stakesMat.paginator.pageIndex,
              pageSize: this.stakesMat.paginator.pageSize
            };
            this.stakesMat.paginator.page.next(event);
          }
          this.emitSelectedStakeholder(this.submissionStakeholders[prevIdx], prevIdx);
        }
      })
    }
    if (changes["sameNIFEvent"]) {
      this.sameNIFEvent?.subscribe(result => {
        var sameNIFStake = this.submissionStakeholders.find(stakeNIF => result === stakeNIF.stakeholderAcquiring.fiscalId || result === stakeNIF.stakeholderAcquiring.identificationDocument?.number);
        if (sameNIFStake != undefined) {
          this.sameNIFEmitter.emit(true);
        } else {
          this.sameNIFEmitter.emit(false);
        }
      });
    }
    if (!changes["isInfoDeclarativa"]?.currentValue) {
      this.clientService.GetClientByIdAcquiring(localStorage.getItem("submissionId")).then(client => {
        this.submissionClient = client;
      });
    }
    if (changes["canSelect"]?.currentValue == true) {
      if (this.submissionStakeholders.length > 0) {
        this.emitSelectedStakeholder(this.submissionStakeholders[0], 0);
      }
    }
  }

  stakesMat = new MatTableDataSource<StakeholdersCompleteInformation>();
  @ViewChild('paginator') set paginator(pager: MatPaginator) {
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
  @Input() isInfoDeclarativa?: boolean = false;
  @Input() insertStakeholderEvent?: Observable<IStakeholders>;
  @Input() updatedStakeholderEvent?: Observable<{ stake: IStakeholders, idx: number }>;
  @Input() previousStakeholderEvent?: Observable<number>;
  @Input() sameNIFEvent?: Observable<string>;

  //Variáveis que vão retornar informação
  @Output() selectedStakeholderEmitter = new EventEmitter<{
    stakeholder: StakeholdersCompleteInformation,
    idx: number
  }>();

  @Output() listLengthEmitter = new EventEmitter<number>();
  @Output() sameNIFEmitter = new EventEmitter<boolean>();

  submissionStakeholders: StakeholdersCompleteInformation[] = [];
  selectedStakeholder: StakeholdersCompleteInformation = {};
  returned: string;
  displayedColumns: string[] = ['stakeholderAcquiring.shortName', 'stakeholderAcquiring.fiscalId', 'entityType', 'relationType', 'elegible', 'stakeholderAcquiring.stakeholderId', 'stakeholderAcquiring.isProxy', 'delete'];
  firstTimeStake: boolean;

  ngOnInit(): void {
    this.returned = localStorage.getItem("returned");
    this.dataService.currentFirstTimeStake.subscribe(firstTime => this.firstTimeStake = firstTime);
    this.getSubmissionStakeholders();
  }

  ngAfterViewInit(): void {
    this.stakesMat.sort = this.sort;
  }

  getSubmissionStakeholders() {
    var context = this;
    this.getSubmissionStakeholdersPromise();
    this.getSubmissionCorporatePromise();
  }

  async getSubmissionCorporatePromise() {
    var context = this;
    context.submissionStakeholders = [];
    const promises = [
      this.stakeholderService.GetCorporateEntityList(this.submissionId)
    ]

    var subpromises = [];

    Promise.all(promises).then(res => {
      var corporate = res[0].result;

      corporate.forEach(function (value, index) {
        subpromises.push(context.getAllCorporateInfo(context.submissionId, value.id));
      });

      const allPromisesWithErrorHandler = subpromises.map(promise =>
        promise.catch(error => error),
      );

      Promise.all(allPromisesWithErrorHandler).then(resolve => {
        context.logger.info("Success fetching stakeholders");
      }, error => {
        context.logger.error(error, "", "Error when fetching stakeholders");
      }).then(stakeholderInfo => {
        this.loadStakeholders(context.submissionStakeholders);
        this.listLengthEmitter.emit(context.submissionStakeholders.length);
        this.emitSelectedStakeholder(context.submissionStakeholders[0], 0);
      });
    })
  }

  async getSubmissionStakeholdersAux() {
    var context = this;
    if (this.submissionId != null) {
      await this.stakeholderService.GetAllStakeholdersFromSubmission(this.submissionId).then(result => {
        context.logger.info("Get all stakeholders from submission result: " + JSON.stringify(result));
        var results = result.result;
        results.forEach(function (value, index) {
          context.stakeholderService.GetStakeholderFromSubmission(context.submissionId, value.id).subscribe(res => {
            context.logger.info("Get stakeholder from submission result: " + JSON.stringify(res));
            var AcquiringStakeholder = res;
            var stakeholderToInsert = {
              displayName: '',
              eligibility: false,
              stakeholderAcquiring: AcquiringStakeholder,
              stakeholderOutbound: undefined
            }
            if (AcquiringStakeholder.id != null) {
              context.stakeholderService.getStakeholderByID(AcquiringStakeholder.id, "requestID", "AcquiringUserID").then(success => {
                context.logger.info("Get stakeholder by id result: " + JSON.stringify(success));
                stakeholderToInsert.stakeholderOutbound = success.result;
              }, error => {
                context.logger.error(error, "", "Error when searching for stakeholder");
              }).then(success => {
                context.submissionStakeholders.push(stakeholderToInsert);
              });
            }
          }, error => {
            context.logger.error(error, "", "Error when searching for stakeholder");
          });
        });
      }, error => {
        context.logger.error(error, "", "Error fetching all stakeholders from submission");
      }).then(success => {
        context.listLengthEmitter.emit(context.submissionStakeholders.length);
        context.loadStakeholders(context.submissionStakeholders);
        context.selectedStakeholder = context.submissionStakeholders[0];
        context.selectedStakeholderEmitter.emit({ stakeholder: context.submissionStakeholders[0], idx: 0 });
      }, error => {
        context.logger.error(error, "", "Error");
      });
    }
  }

  getAllCorporateInfo(submissionID, corporateID) {
    var context = this;
    return new Promise((resolve, reject) => {
      context.stakeholderService.GetCorporateEntityById(submissionID, corporateID).then(res => {
        context.logger.info("Get stakeholder from submission result: " + JSON.stringify(res.result));
        var AcquiringStakeholder = res.result;
        var stakeholderToInsert = {
          displayName: AcquiringStakeholder.shortName,
          eligibility: false,
          stakeholderAcquiring: AcquiringStakeholder,
          stakeholderOutbound: undefined
        } as StakeholdersCompleteInformation
          context.submissionStakeholders.push(stakeholderToInsert);
          resolve(null);
      });
    });
  }

  getAllStakeholderInfo(submissionID, stakeholderID) {
    var context = this;
    return new Promise((resolve, reject) => {
      context.stakeholderService.GetStakeholderFromSubmission(submissionID, stakeholderID).then(res => {
        context.logger.info("Get stakeholder from submission result: " + JSON.stringify(res));
        var AcquiringStakeholder = res.result;
        var stakeholderToInsert = {
          displayName: AcquiringStakeholder.shortName,
          eligibility: false,
          stakeholderAcquiring: AcquiringStakeholder,
          stakeholderOutbound: undefined
        } as StakeholdersCompleteInformation

        if (AcquiringStakeholder.fiscalId != "" && !this.isInfoDeclarativa && this.firstTimeStake) {
          context.stakeholderService.SearchStakeholderByQuery(AcquiringStakeholder.fiscalId, '0501', 'eefe0ecd-4986-4ceb-9171-99c0b1d14658', "AcquiringUserID").then(res => {
            context.logger.info("Search stakeholder by query result: " + JSON.stringify(res));
            if (res.result.length == 1) {
              if (res.result[0].stakeholderId != null) {
                stakeholderToInsert.stakeholderAcquiring.stakeholderId = res.result[0].stakeholderId;
                stakeholderToInsert.stakeholderAcquiring.clientId = res.result[0].stakeholderId;
                context.stakeholderService.getStakeholderByID(res.result[0].stakeholderId, '0501', 'eefe0ecd-4986-4ceb-9171-99c0b1d14658', "AcquiringUserID").then(r => {
                  context.logger.info("Get stakeholder by id result: " + JSON.stringify(r));
                  stakeholderToInsert.stakeholderOutbound = r.result;
                  stakeholderToInsert.stakeholderAcquiring.birthDate = stakeholderToInsert.stakeholderOutbound.birthDate;
                  stakeholderToInsert.stakeholderAcquiring.contactName = stakeholderToInsert.stakeholderOutbound.shortName;
                  stakeholderToInsert.stakeholderAcquiring.email = stakeholderToInsert.stakeholderOutbound.contacts.email;
                  stakeholderToInsert.stakeholderAcquiring.fiscalAddress = stakeholderToInsert.stakeholderOutbound.address;
                  stakeholderToInsert.stakeholderAcquiring.fullName = stakeholderToInsert.stakeholderOutbound.fullName;
                  stakeholderToInsert.stakeholderAcquiring.identificationDocument = stakeholderToInsert.stakeholderOutbound.identificationDocument;
                  stakeholderToInsert.stakeholderAcquiring.pep = stakeholderToInsert.stakeholderOutbound.pep;
                  stakeholderToInsert.stakeholderAcquiring.phone1 = stakeholderToInsert.stakeholderOutbound.contacts.phone1;
                  stakeholderToInsert.stakeholderAcquiring.phone2 = stakeholderToInsert.stakeholderOutbound.contacts.phone2;
                  stakeholderToInsert.stakeholderAcquiring.shortName = stakeholderToInsert.stakeholderOutbound.shortName;
                  context.logger.info("Stakeholder data to update: " + JSON.stringify(stakeholderToInsert.stakeholderAcquiring));
                  context.stakeholderService.UpdateStakeholder(context.submissionId, stakeholderToInsert.stakeholderAcquiring.id, stakeholderToInsert.stakeholderAcquiring).subscribe(stake => {
                    context.logger.info("Updated stakeholder result: " + JSON.stringify(stake));
                    resolve(null);
                  }, rej => {
                    context.logger.error(rej, "", "Error updating stakeholder");
                    resolve(null);
                  });
                }, rej => {
                  context.logger.error(rej, "", "Error getting stakeholder");
                  resolve(null);
                }).then(res => {
                  resolve(null);
                });
              }
            }
            if (res.result.length > 1) { 
              res.result.forEach(stake => {
                if (stake.stakeholderId != null && stake.stakeholderId === AcquiringStakeholder.clientId) {
                  stakeholderToInsert.stakeholderAcquiring.stakeholderId = stake.stakeholderId;
                  stakeholderToInsert.stakeholderAcquiring.clientId = stake.stakeholderId;
                  context.stakeholderService.getStakeholderByID(stake.stakeholderId, '0501', 'eefe0ecd-4986-4ceb-9171-99c0b1d14658', "AcquiringUserID").then(r => {
                    context.logger.info("Get stakeholder by id result: " + JSON.stringify(r));
                    stakeholderToInsert.stakeholderOutbound = r.result;
                    stakeholderToInsert.stakeholderAcquiring.birthDate = stakeholderToInsert.stakeholderOutbound.birthDate;
                    stakeholderToInsert.stakeholderAcquiring.contactName = stakeholderToInsert.stakeholderOutbound.shortName;
                    stakeholderToInsert.stakeholderAcquiring.email = stakeholderToInsert.stakeholderOutbound.contacts.email;
                    stakeholderToInsert.stakeholderAcquiring.fiscalAddress = stakeholderToInsert.stakeholderOutbound.address;
                    stakeholderToInsert.stakeholderAcquiring.fullName = stakeholderToInsert.stakeholderOutbound.fullName;
                    stakeholderToInsert.stakeholderAcquiring.identificationDocument = stakeholderToInsert.stakeholderOutbound.identificationDocument;
                    stakeholderToInsert.stakeholderAcquiring.pep = stakeholderToInsert.stakeholderOutbound.pep;
                    stakeholderToInsert.stakeholderAcquiring.phone1 = stakeholderToInsert.stakeholderOutbound.contacts.phone1;
                    stakeholderToInsert.stakeholderAcquiring.phone2 = stakeholderToInsert.stakeholderOutbound.contacts.phone2;
                    stakeholderToInsert.stakeholderAcquiring.shortName = stakeholderToInsert.stakeholderOutbound.shortName;
                    context.logger.info("Stakeholder data to update: " + JSON.stringify(stakeholderToInsert.stakeholderAcquiring));
                    context.stakeholderService.UpdateStakeholder(context.submissionId, stakeholderToInsert.stakeholderAcquiring.id, stakeholderToInsert.stakeholderAcquiring).subscribe(stake => {
                      context.logger.info("Updated stakeholder result: " + JSON.stringify(stake));
                      resolve(null);
                    }, rej => {
                      context.logger.error(rej, "", "Error updating stakeholder");
                      resolve(null);
                    });
                  }, rej => {
                    context.logger.error(rej, "", "Error getting stakeholder");
                    resolve(null);
                  }).then(res => {
                    resolve(null);
                  });
                }
              });
            }
          }, rej => {
            context.logger.error(rej, "", "Error searching stakeholder");
            resolve(null);
          }).then(res => {
            context.submissionStakeholders.push(stakeholderToInsert);
            resolve(null);
          })
        } else {
          context.submissionStakeholders.push(stakeholderToInsert);
          resolve(null);
        }
      });
    });
  }

  getSubmissionStakeholdersPromise() {
    var context = this;
    context.submissionStakeholders = [];
    const promises = [
      this.stakeholderService.GetAllStakeholdersFromSubmission(this.submissionId)
    ]

    var subpromises = [];

    Promise.all(promises).then(res => {
      var stakeholders = res[0].result;

      stakeholders.forEach(function (value, index) {
        subpromises.push(context.getAllStakeholderInfo(context.submissionId, value.id));
      });

      const allPromisesWithErrorHandler = subpromises.map(promise =>
        promise.catch(error => error),
      );

      Promise.all(allPromisesWithErrorHandler).then(resolve => {
        context.logger.info("Success fetching stakeholders");
      }, error => {
        context.logger.error(error, "", "Error when fetching stakeholders");
      }).then(stakeholderInfo => {
        this.dataService.changeCurrentFirstTimeStake(false);
        this.loadStakeholders(context.submissionStakeholders);
        this.listLengthEmitter.emit(context.submissionStakeholders.length);
        this.emitSelectedStakeholder(context.submissionStakeholders[0], 0);
      });
    })
  }

  emitSelectedStakeholder(stakeholder, idx) {
    if (!this.canSelect)
      return;
    this.selectedStakeholderEmitter.emit({ stakeholder: stakeholder, idx: idx });
    this.selectedStakeholder = stakeholder;
  }

  loadStakeholders(stakesList: StakeholdersCompleteInformation[]) {
    this.stakesMat.data = stakesList;
    this.stakesMat.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'stakeholderAcquiring.shortName': return item.stakeholderAcquiring.shortName;
        case 'stakeholderAcquiring.fiscalId': return item.stakeholderAcquiring.fiscalId;
        case 'stakeholderAcquiring.clientId': return item.stakeholderAcquiring.clientId;
        case 'stakeholderAcquiring.isProxy': return item.stakeholderAcquiring.isProxy;
        default: return item[property];
      }
    };
    this.stakesMat.sort = this.sort;
  }

  reloadCurrentRoute() {
    let currentRoute = this.route.url;
    this.route.navigate([currentRoute], { skipLocationChange: true }).then(() => {
      window.location.replace(currentRoute);
    });
  }

  removeStakeholder(stakeholder) {
    this.logger.info("Stakeholder to remove: " + JSON.stringify(stakeholder));

    if (stakeholder?.stakeholderAcquiring?.signType != null && stakeholder?.stakeholderAcquiring?.signType !== '') {
      this.stakeholderService.DeleteStakeholder(this.submissionId, stakeholder.stakeholderAcquiring.id).subscribe(result => {
        this.logger.info("Deleted stakeholder result: " + JSON.stringify(result));
        const index = this.submissionStakeholders.findIndex(stake => stake.stakeholderAcquiring.id === stakeholder.stakeholderAcquiring.id);
        this.submissionStakeholders.splice(index, 1);
        this.loadStakeholders(this.submissionStakeholders);
        this.listLengthEmitter.emit(this.submissionStakeholders.length);
      }, error => {
        this.logger.error(error, "", "Error when deleting stakeholder");
      });
    } else {
      this.stakeholderService.DeleteCorporateEntity(this.submissionId, stakeholder.stakeholderAcquiring.id).then(result => {
        this.logger.info("Deleted stakeholder result: " + JSON.stringify(result.result));
        const index = this.submissionStakeholders.findIndex(stake => stake.stakeholderAcquiring["id"] === stakeholder.stakeholderAcquiring["id"]);
        this.submissionStakeholders.splice(index, 1);
        this.loadStakeholders(this.submissionStakeholders);
        this.listLengthEmitter.emit(this.submissionStakeholders.length);
      }, error => {
        this.logger.error(error, "", "Error when deleting stakeholder");
      });
    }
  }
}
