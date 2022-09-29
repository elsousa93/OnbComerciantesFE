import { HttpClient } from '@angular/common/http';
import { Component, Input, Output, EventEmitter, OnInit, Inject, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoggerService } from 'src/app/logger.service';
import { config, Observable, Subscription } from 'rxjs';
import { ClientService } from '../../client/client.service';
import { Configuration, configurationToken } from '../../configuration';
import { AuthService } from '../../services/auth.service';
import { IStakeholders } from '../IStakeholders.interface';
import { StakeholderService } from '../stakeholder.service';

@Component({
  selector: 'app-search-stakeholders',
  templateUrl: './search-stakeholders.component.html',
  styleUrls: ['./search-stakeholders.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchStakeholdersComponent implements OnInit {

  private eventsSubscription: Subscription;

  //Variáveis de Input
  @Input() clientID: Observable<string>;
  @Input() searchType?: string = "por mudar";
  @Input() requestID?: string = "por mudar";
  //@Input() canEdit?: boolean = false; Pode vir a ser preciso
  @Input() canSelect?: boolean = true;

  //Output
  @Output() selectedStakeholderEmitter = new EventEmitter<{
    stakeholder: IStakeholders,
    idx: number
  }>();

  @Output() searchAditionalInfoEmitter = new EventEmitter<{
    found: boolean,
    errorMsg?: string
  }>();

  //Variáveis locais
  stakeholdersToShow: IStakeholders[] = [];
  UUIDAPI: string = "eefe0ecd-4986-4ceb-9171-99c0b1d14658";
  currentStakeholder: IStakeholders = {};

  constructor(private router: ActivatedRoute, private http: HttpClient, private logger: LoggerService,
    @Inject(configurationToken) private configuration: Configuration,
    private route: Router, private stakeholderService: StakeholderService, private authService: AuthService) {
    
  }

  ngOnInit() {
    var context = this;
    this.eventsSubscription = this.clientID.subscribe(result => {
      context.searchStakeholders(result);
    });
  }

  searchStakeholders(clientID) {
    console.log("entrou na pesquisa de um stakeholder");
    var context = this;

    /*this.onSearchSimulation(22181900000011);*/
    this.stakeholderService.SearchStakeholderByQuery(clientID, "por mudar", this.UUIDAPI, "2").subscribe(o => {
      var clients = o;

      //context.isShown = true;

      if (clients.length > 0) {
        //context.deactivateNotFoundForm();
        context.searchAditionalInfoEmitter.emit({
          found: true,
          errorMsg: ''
        });
        context.stakeholdersToShow = [];
        clients.forEach(function (value, index) {
          context.stakeholderService.getStakeholderByID(value.stakeholderId, "por mudar", "por mudar").subscribe(c => {
            var stakeholder = {
              "stakeholderNumber": c.stakeholderId,
              "stakeholderName": c.shortName,
              "stakeholderNIF": c.fiscalIdentification.fiscalId,
              "elegible": "elegivel",
              "associated": "SIM"
            } as IStakeholders;

            context.stakeholdersToShow.push(stakeholder);
          });
        })
      } else {
        //context.initializeNotFoundForm();
        context.stakeholdersToShow = [];
        context.searchAditionalInfoEmitter.emit({
          found: false,
          errorMsg: "Sem resultados"
        });
      }
    }, error => {
      context.searchAditionalInfoEmitter.emit({
        found: false,
        errorMsg: "Ocorreu um erro, tente novamente"
      });
      //context.showFoundClient = false;
      //this.logger.debug("entrou aqui no erro huajshudsj");
      //context.resultError = "Não existe Comerciante com esse número.";
      //this.searchDone = true;
    });

    console.log('passou pela pesquisa e o valor encontrado foi ', this.stakeholdersToShow);
  }

  selectStakeholder(stakeholder, index) {
    this.selectedStakeholderEmitter.emit({
      stakeholder: stakeholder,
      idx: index
    });

    this.currentStakeholder = stakeholder;
    console.log(this.currentStakeholder);
  }
  
  ngOnChanges(){
    this.ngOnInit();
  }

}
