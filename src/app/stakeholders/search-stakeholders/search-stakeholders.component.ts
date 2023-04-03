import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { IStakeholders, StakeholderOutbound } from '../IStakeholders.interface';
import { StakeholderService } from '../stakeholder.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from '../../logger.service';
import { ClientService } from '../../client/client.service';

@Component({
  selector: 'app-search-stakeholders',
  templateUrl: './search-stakeholders.component.html',
  styleUrls: ['./search-stakeholders.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchStakeholdersComponent implements OnInit {

  private eventsSubscription: Subscription;

  displayedColumns: string[] = ['select', 'stakeFiscalId', 'stakeName'];
  displayedColumnsFound: string[] = ['select', 'stakeID', 'stakeName', 'address', 'ZIPCode', 'locale', 'country'];

  //Variáveis de Input
  @Input() clientID: Observable<string>;
  @Input() searchType?: string;
  @Input() requestID?: string = "por mudar";
  @Input() canSelect?: boolean = true;
  @Input() currentIdx?: number;
  @Input() stakeholderType: string;

  //Output
  @Output() selectedStakeholderEmitter = new EventEmitter<{
    stakeholder: IStakeholders
  }>();

  @Output() searchAditionalInfoEmitter = new EventEmitter<{
    found: boolean,
    errorMsg?: string,
    stakesList?: IStakeholders[]
  }>();

  //Variáveis locais
  stakeholdersToShow: IStakeholders[] = [];
  UUIDAPI: string = "eefe0ecd-4986-4ceb-9171-99c0b1d14658";
  currentStakeholder: IStakeholders = {};

  foundStakeholders: boolean;

  constructor(private stakeholderService: StakeholderService, private translate: TranslateService, private logger: LoggerService, private clientService: ClientService) {
  }

  stakesMat = new MatTableDataSource<any>();
  @ViewChild('paginator') set paginator(pager: MatPaginator) {
    if (pager) {
      this.stakesMat.paginator = pager;
      this.stakesMat.paginator._intl = new MatPaginatorIntl();
      this.stakesMat.paginator._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');
    }
  }

  stakesFoundMat = new MatTableDataSource<any>();
  @ViewChild('paginator') set paginatorFound(pager: MatPaginator) {
    if (pager) {
      this.stakesFoundMat.paginator = pager;
      this.stakesFoundMat.paginator._intl = new MatPaginatorIntl();
      this.stakesFoundMat.paginator._intl.itemsPerPageLabel = this.translate.instant('generalKeywords.itemsPerPage');
    }
  }

  ngOnInit() {
    var context = this;
    this.eventsSubscription = this.clientID.subscribe(result => {
      context.searchStakeholders(result);
    });
  }

  searchStakeholders(clientID) {
    var context = this;
    var stakeholder = null;

    if (this.stakeholderType === 'Particular') {
      this.stakeholderService.SearchStakeholderByQuery(clientID, this.searchType, this.UUIDAPI, "2").then(res => {
        this.logger.info("Search stakeholder by query result: " + JSON.stringify(res));
        var clients = res.result;
        if (clients.length > 0) {
          context.stakeholdersToShow = [];
          var subpromises = [];
          clients.forEach(function (value, index) {
            subpromises.push(context.stakeholderService.getStakeholderByID(value.stakeholderId, "por mudar", "por mudar"));
          });
          const allPromisesWithErrorHandler = subpromises.map(promise =>
            promise.catch(error => null)
          );

          Promise.all(allPromisesWithErrorHandler).then(res => {
            var stake = res;

            stake.forEach(function (value, idx) {
              if (value != null) {
                var stakeInfo = value.result;
                stakeholder = {
                  "stakeholderNumber": stakeInfo.stakeholderId,
                  "stakeholderName": stakeInfo.shortName,
                  "stakeholderNIF": stakeInfo.fiscalIdentification.fiscalId,
                  "address": stakeInfo.address,
                  "elegible": "elegivel",
                  "associated": "SIM"
                } as IStakeholders;

                context.stakeholdersToShow.push(stakeholder);
              }
            });
          }, error => {
            this.logger.error(error, "", "Error occured while searching stakeholder");
          }).then(res => {
            this.logger.info("Found stakeholders: " + JSON.stringify(context.stakeholdersToShow));
            context.foundStakeholders = true;
            context.searchAditionalInfoEmitter.emit({
              found: true,
              errorMsg: '',
              stakesList: context.stakeholdersToShow
            });
            context.stakesFoundMat.data = context.stakeholdersToShow;
          });
        } else {
          context.stakeholdersToShow = [];
          context.foundStakeholders = false;
          context.searchAditionalInfoEmitter.emit({
            found: false,
            errorMsg: "No results"
          });
        }
      }, error => {
        context.logger.error(error, "", "Error while searching for stakeholders");
        context.stakeholdersToShow = [];
        context.foundStakeholders = false;
        context.searchAditionalInfoEmitter.emit({
          found: false,
          errorMsg: "No results"
        });
      });
    } else {
      this.clientService.SearchClientByQuery(clientID, this.searchType, this.UUIDAPI, "2").subscribe(res => {
        this.logger.info("Search merchant by query result: " + JSON.stringify(res));
        var clients = res;
        if (clients.length > 0) {
          context.stakeholdersToShow = [];
          var subpromises = [];
          clients.forEach(function (value, index) {
            subpromises.push(context.clientService.getClientByID(value.merchantId, "por mudar", "por mudar"));
          });
          const allPromisesWithErrorHandler = subpromises.map(promise =>
            promise.catch(error => null)
          );

          Promise.all(allPromisesWithErrorHandler).then(res => {
            var stake = res;

            stake.forEach(function (value, idx) {
              if (value != null) {
                var stakeInfo = value.result;
                stakeholder = {
                  "stakeholderNumber": stakeInfo.merchantId,
                  "stakeholderName": stakeInfo.shortName,
                  "stakeholderNIF": stakeInfo.fiscalIdentification.fiscalId,
                  "address": stakeInfo.headquartersAddress,
                  "elegible": "elegivel",
                  "associated": "SIM"
                } as IStakeholders;

                context.stakeholdersToShow.push(stakeholder);
              }
            });
          }, error => {
            this.logger.error(error, "", "Error occured while searching stakeholder");
          }).then(res => {
            this.logger.info("Found merchants: " + JSON.stringify(context.stakeholdersToShow));
            context.foundStakeholders = true;
            context.searchAditionalInfoEmitter.emit({
              found: true,
              errorMsg: '',
              stakesList: context.stakeholdersToShow
            });
            context.stakesFoundMat.data = context.stakeholdersToShow;
          });
        } else {
          context.stakeholdersToShow = [];
          context.foundStakeholders = false;
          context.searchAditionalInfoEmitter.emit({
            found: false,
            errorMsg: "No results"
          });
        }
      }, error => {
        context.logger.error(error, "", "Error while searching for merchants");
        context.stakeholdersToShow = [];
        context.foundStakeholders = false;
        context.searchAditionalInfoEmitter.emit({
          found: false,
          errorMsg: "No results"
        });
      });
    }
  }

  aButtons(id: boolean, stake: StakeholderOutbound) {
    this.selectedStakeholderEmitter.emit({
      stakeholder: stake
    });
    if (id == true) {
      this.currentStakeholder.id = stake.stakeholderId;
    }
  }
  ngOnChanges() {
  }
}
