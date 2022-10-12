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

  foundStakeholders: boolean;

  constructor(private router: ActivatedRoute, private http: HttpClient, private logger: LoggerService,
    @Inject(configurationToken) private configuration: Configuration, 
    private route: Router, private stakeholderService: StakeholderService, private authService: AuthService) {
    
  }

  ngOnInit() {
    var context = this;
    this.eventsSubscription = this.clientID.subscribe(result => {
      console.log("entrou no clientID: ", result);
      context.searchStakeholders(result);
    });
  }

  searchStakeholders(clientID) {
    console.log("entrou na pesquisa de um stakeholder");
    var context = this;
    var stakeholder = null;
    /*this.onSearchSimulation(22181900000011);*/
    this.stakeholderService.SearchStakeholderByQuery(clientID, "por mudar", this.UUIDAPI, "2").then(res => {
      console.log("a");
      var clients = res.result;

      //context.isShown = true;

      if (clients.length > 0) {
        //context.deactivateNotFoundForm();

        context.stakeholdersToShow = [];

        var subpromises = [];
        clients.forEach(function (value, index) {
          console.log("b");
          subpromises.push(context.stakeholderService.getStakeholderByID(value.stakeholderId, "por mudar", "por mudar"));
        });

        const allPromisesWithErrorHandler = subpromises.map(promise =>
          promise.catch(error => error)
         );

        Promise.all(allPromisesWithErrorHandler).then(res => {
          console.log("c");
          var stake = res;

          stake.forEach(function (value, idx) {
            console.log("d");
            var stakeInfo = value.result;
            stakeholder = {
              "stakeholderNumber": stakeInfo.stakeholderId,
              "stakeholderName": stakeInfo.shortName,
              "stakeholderNIF": stakeInfo.fiscalIdentification.fiscalId,
              "elegible": "elegivel",
              "associated": "SIM"
            } as IStakeholders;
            console.log('Dentro do forEach, valor de um stake ', stakeholder);
            console.log('Valor do stakeholderNIF ', stakeholder["stakeholderNIF"]);

            context.stakeholdersToShow.push(stakeholder);
            console.log('Lista de stakeholdersToShow depois de adicionar o stake ', context.stakeholdersToShow);

          });
        }, error => {
          console.log('ocorreu um erro!');
        }).then(res => {
          console.log("nao encontrou!!");
          context.foundStakeholders = true;
          context.searchAditionalInfoEmitter.emit({
            found: true,
            errorMsg: ''
          });
        });

        //context.stakeholderService.getStakeholderByID(value.stakeholderId, "por mudar", "por mudar").subscribe(c => {
        //  var stakeholder = {
        //    "stakeholderNumber": c.stakeholderId,
        //    "stakeholderName": c.shortName,
        //    "stakeholderNIF": c.fiscalIdentification.fiscalId,
        //    "elegible": "elegivel",
        //    "associated": "SIM"
        //  } as IStakeholders;
        //  console.log('Dentro do forEach, valor de um stake ', stakeholder);
        //  console.log('Valor do stakeholderNIF ', stakeholder["stakeholderNIF"]);
        //  context.stakeholdersToShow.push(stakeholder);
        //  console.log('Lista de stakeholdersToShow depois de adicionar o stake ', context.stakeholdersToShow);
        //});
      } else {
        console.log("sem resultados");
        context.stakeholdersToShow = [];
        context.foundStakeholders = false;
        context.searchAditionalInfoEmitter.emit({
          found: false,
          errorMsg: "Sem resultados"
        });
      }
    }, error => {
      console.log("deu erro");
      context.stakeholdersToShow = [];
      context.foundStakeholders = false;
      context.searchAditionalInfoEmitter.emit({
        found: false,
        errorMsg: "Sem resultados"
      });
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
