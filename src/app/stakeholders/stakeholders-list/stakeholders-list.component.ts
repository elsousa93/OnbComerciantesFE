import { Component, Input, Output, OnInit, EventEmitter, ViewChild, AfterViewInit, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Observable, Subject } from 'rxjs';
import { LoggerService } from 'src/app/logger.service';
import { SubmissionService } from '../../submission/service/submission-service.service';
import { IStakeholders, StakeholdersCompleteInformation } from '../IStakeholders.interface';
import { StakeholderService } from '../stakeholder.service';

@Component({
  selector: 'app-stakeholders-list',
  templateUrl: './stakeholders-list.component.html',
  styleUrls: ['./stakeholders-list.component.css']
})
export class StakeholdersListComponent implements OnInit, AfterViewInit, OnChanges {
 @ViewChild('selectedBlueDiv') selectedBlueDiv: ElementRef<HTMLElement>;

  constructor(private translate: TranslateService, public modalService: BsModalService, private route: Router, private stakeholderService: StakeholderService, private logger: LoggerService, private submissionService: SubmissionService) {
    // this.triggerFalseClick();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["insertStakeholderEvent"]) {
      this.insertStakeholderEvent?.subscribe(result => {
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
      console.log("CHANGES NO UPDATE STAKEHOLDER ");
      this.updatedStakeholderEvent?.subscribe(result => {
        var nextIdx = result.idx + 1;
        this.emitSelectedStakeholder(this.submissionStakeholders[nextIdx], nextIdx);
      });
    }
  }
 
  stakesMat = new MatTableDataSource<StakeholdersCompleteInformation>();
  @ViewChild('paginator') set paginator(pager:MatPaginator) {
    if (pager) {
      this.stakesMat.paginator = pager;
      this.stakesMat.paginator._intl = new MatPaginatorIntl();
      this.stakesMat.paginator._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');
    }
  }

  @ViewChild(MatSort) sort : MatSort;
  
  //Variáveis que podem ser preenchidas
  @Input() submissionId: string;
  @Input() processNumber?: string;
  @Input() canDelete?: boolean = true;
  @Input() canSelect?: boolean = true;

  @Input() insertStakeholderEvent?: Observable<IStakeholders>;
  @Input() updatedStakeholderEvent?: Observable<{ stake: IStakeholders, idx: number }>;

  //Variáveis que vão retornar informação
  @Output() selectedStakeholderEmitter = new EventEmitter<{
    stakeholder: StakeholdersCompleteInformation,
    idx: number
  }>();

  @Output() listLengthEmitter = new EventEmitter<number>();

  submissionStakeholders: StakeholdersCompleteInformation[] = [];

  selectedStakeholder: StakeholdersCompleteInformation = {};
  returned: string;

  displayedColumns: string[] = ['stakeholderAcquiring.shortName', 'stakeholderAcquiring.fiscalId', 'entityType', 'relationType', 'elegible', 'stakeholderAcquiring.stakeholderId', 'stakeholderAcquiring.isProxy', 'delete'];

  //subStakeholders: StakeholdersCompleteInformation[] = [];

  ngOnInit(): void {
    this.returned = localStorage.getItem("returned");
    console.log("Valor do submissionId no INIT ", this.submissionId);
    this.getSubmissionStakeholders();
    //setTimeout(() => this.stakesMat.data = this.submissionStakeholders, 2000);
    //this.selectedStakeholder = this.submissionStakeholders[0];
    //console.log('o current stake é ', this.selectedStakeholder);
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

    this.getSubmissionStakeholdersTest();
    //this.getSubmissionStakeholdersAux();

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

  async getSubmissionStakeholdersAux() {
    var context = this;
    console.log('Valor do submission id dentro da chamada do getSubmissionStakeholdersAux', this.submissionId);
    console.log('Valor do localStorage ', localStorage.getItem("submissionId"));
    if (this.submissionId != null) {
      await this.stakeholderService.GetAllStakeholdersFromSubmission(this.submissionId).then(result => {
        console.log("a");
        var results = result.result;
        results.forEach(function (value, index) {
          context.stakeholderService.GetStakeholderFromSubmission(context.submissionId, value.id).subscribe(res => {
            console.log("b");
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

            console.log("stakeholder acquiring: ", AcquiringStakeholder);
            if (AcquiringStakeholder.id != null) {
              console.log("c");
              //var stakeholderFunction = context.stakeholderService.getStakeholderByID(AcquiringStakeholder.id, "por mudar", "por mudar").toPromise();

              context.stakeholderService.getStakeholderByID(AcquiringStakeholder.id, "requestID", "AcquiringUserID").then(success => {
                stakeholderToInsert.stakeholderOutbound = success.result;
              }, error => {
                console.log("Foi rejeitado: ", error);
              }).then(success => {
                console.log("vai adicionar: ", context.submissionStakeholders);
                console.log("stakeholder a adicionar: ", stakeholderToInsert);
                context.submissionStakeholders.push(stakeholderToInsert);

                console.log("adicionou a lista?: ", context.submissionStakeholders);
              });
              console.log("array que ainda está a ser preenchida: ", context.submissionStakeholders);
            }

          }, error => {
          });
        });
      }, error => {
      }).then(success => {
        console.log("d");
        context.listLengthEmitter.emit(context.submissionStakeholders.length);
        context.loadStakeholders(context.submissionStakeholders);
        context.selectedStakeholder = context.submissionStakeholders[0];
        context.selectedStakeholderEmitter.emit({ stakeholder: context.submissionStakeholders[0], idx: 0});
        console.log('o current stake é ', context.selectedStakeholder);
      }, error => {
        console.log("e");
        console.log('Foi rejeitado ', error);
      });
    }
  }

  getAllStakeholderInfo(submissionID, stakeholderID) {
    var context = this;

    return new Promise((resolve, reject) => {
      context.stakeholderService.GetStakeholderFromSubmissionTest(submissionID, stakeholderID).then(res => {
        console.log("c");
        var AcquiringStakeholder = res.result;
        var stakeholderToInsert = {
          displayName: AcquiringStakeholder.shortName,
          eligibility: false,
          stakeholderAcquiring: AcquiringStakeholder,
          stakeholderOutbound: undefined
        } as StakeholdersCompleteInformation


        if (AcquiringStakeholder.id != null) {
          console.log("d");
          //var stakeholderFunction = context.stakeholderService.getStakeholderByID(AcquiringStakeholder.id, "por mudar", "por mudar").toPromise();
          context.stakeholderService.getStakeholderByID(AcquiringStakeholder.id, "requestID", "AcquiringUserID").then(res => {
            console.log("e");
            stakeholderToInsert.stakeholderOutbound = res.result;
            resolve(null);
          }, rej => {
            console.log("nao foi possivel carregar");
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

  getSubmissionStakeholdersTest() {
    var context = this;

    const promises = [
      this.stakeholderService.GetAllStakeholdersFromSubmission(this.submissionId)
    ]

    var subpromises = [];

    Promise.all(promises).then(res => {
      console.log("a");
      var stakeholders = res[0].result;

      stakeholders.forEach(function (value, index) {
        subpromises.push(context.getAllStakeholderInfo(context.submissionId, value.id));
      });

      const allPromisesWithErrorHandler = subpromises.map(promise =>
        promise.catch(error => error),
      );

      Promise.all(allPromisesWithErrorHandler).then(resolve => {
        console.log("com sucesso!!!");
      }, error => {
        console.log("ocorreu um erro");
      }).then(stakeholderInfo => {
          console.log("acabou de preencher: ", context.submissionStakeholders);
          this.selectedStakeholder = context.submissionStakeholders[0];
          this.emitSelectedStakeholder(context.submissionStakeholders[0], 0);
          this.listLengthEmitter.emit(context.submissionStakeholders.length);
          this.loadStakeholders(context.submissionStakeholders);
      });
    })

    //console.log('Valor do submission id dentro da chamada do getSubmissionStakeholdersAux', this.submissionId);
    //console.log('Valor do localStorage ', localStorage.getItem("submissionId"));
    //if (this.submissionId != null) {
    //  this.stakeholderService.GetAllStakeholdersFromSubmission(this.submissionId).then(result => {
    //    console.log("a");
    //    var results = result.result;
    //    results.forEach(function (value, index) {
    //      context.stakeholderService.GetStakeholderFromSubmission(context.submissionId, value.id).subscribe(res => {
    //        console.log("b");
    //        var AcquiringStakeholder = res;
    //        var stakeholderToInsert = {
    //          displayName: '',
    //          eligibility: false,
    //          stakeholderAcquiring: AcquiringStakeholder,
    //          stakeholderOutbound: undefined
    //        }
    //        //context.submissionStakeholders.push(stakeholderToInsert);

    //        //context.stakeholderService.getStakeholderByID(tempStakeholderID/*AcquiringStakeholder.stakeholderId*/, "por mudar", "por mudar").subscribe(outboundResult => {
    //        //  stakeholderToInsert.stakeholderOutbound = outboundResult;
    //        //  context.submissionStakeholders.push(stakeholderToInsert);

    //        //})

    //        console.log("stakeholder acquiring: ", AcquiringStakeholder);
    //        if (AcquiringStakeholder.id != null) {
    //          console.log("c");
    //          //var stakeholderFunction = context.stakeholderService.getStakeholderByID(AcquiringStakeholder.id, "por mudar", "por mudar").toPromise();

    //          context.stakeholderService.getStakeholderByID(AcquiringStakeholder.id, "requestID", "AcquiringUserID").then(success => {
    //            stakeholderToInsert.stakeholderOutbound = success.result;
    //          }, error => {
    //            console.log("Foi rejeitado: ", error);
    //          }).then(success => {
    //            console.log("vai adicionar: ", context.submissionStakeholders);
    //            console.log("stakeholder a adicionar: ", stakeholderToInsert);
    //            context.submissionStakeholders.push(stakeholderToInsert);

    //            console.log("adicionou a lista?: ", context.submissionStakeholders);
    //          });
    //          console.log("array que ainda está a ser preenchida: ", context.submissionStakeholders);
    //        }

    //      }, error => {
    //      });
    //    });
    //  }, error => {
    //  }).then(success => {
    //    console.log("d");
    //    context.listLengthEmitter.emit(context.submissionStakeholders.length);
    //    context.loadStakeholders(context.submissionStakeholders);
    //    context.selectedStakeholder = context.submissionStakeholders[0];
    //    console.log('o current stake é ', context.selectedStakeholder);
    //  }, error => {
    //    console.log("e");
    //    console.log('Foi rejeitado ', error);
    //  });
    //}
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
    this.stakesMat.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'stakeholderAcquiring.shortName': return item.stakeholderAcquiring.shortName;

        case 'stakeholderAcquiring.fiscalId': return item.stakeholderAcquiring.fiscalId;

        case 'stakeholderAcquiring.stakeholderId': return item.stakeholderAcquiring.stakeholderId;

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
