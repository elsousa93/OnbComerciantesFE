import { HttpClient } from '@angular/common/http';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Configuration, configurationToken } from '../configuration';
import { DataService } from '../nav-menu-interna/data.service';
import { ProcessList, ProcessService } from '../process/process.service';
import { LoggerService } from 'src/app/logger.service';
import { QueuesService } from './queues.service';
import { SimplifiedReference } from '../submission/ISubmission.interface';
import { IStakeholders } from '../stakeholders/IStakeholders.interface';
import { ShopDetailsAcquiring, ShopEquipment } from '../store/IStore.interface';
import { ExternalState, State } from './IQueues.interface';


@Component({
  selector: 'queues-detail',
  templateUrl: './queues-detail.component.html'
})

export class QueuesDetailComponent implements OnInit {
  form: FormGroup;

  @Input() queueName: string;
  @Input() processId: string;

  private baseUrl;
  localUrl: any;

  public map = new Map();
  public currentPage: number;
  public subscription: Subscription;
  public process: ProcessList;
  public type: string;

  files?: File[] = [];

  public attach: { tipo: string, dataDocumento: string };
  public result: any;

  public fillComments: string;
  public enrollmentMerchantNumber: string;
  public enrollmentStoreNumber: string;
  public enrollmentTerminalNumber: string;

  public elegibilityStatus: string;

  public subs: Subscription[] = [];

  public riskRequest;

  public checkButton:boolean = false;

  stakesList: IStakeholders[] = [];
  shopsList: ShopDetailsAcquiring[] = [];
  equipmentList: ShopEquipment[] = [];

  public state: State;
  public externalState: ExternalState;

  constructor(private logger: LoggerService, private http: HttpClient, @Inject(configurationToken) private configuration: Configuration,
    private route: Router, private data: DataService, private queuesInfo: QueuesService) {

    //Gets Queue Name and processId from the Dashboard component 
    if (this.route.getCurrentNavigation().extras.state) {
      this.queueName = this.route.getCurrentNavigation().extras.state["queueName"];
      this.processId = this.route.getCurrentNavigation().extras.state["processId"];
    }

    this.ngOnInit();
    this.logger.debug('Process Id ' + this.processId);

    // Preencher os dados da fila de trabalho consoante o processId recebido
    this.fetchStartingInfo();

    this.data.updateData(true, 0);

  }

  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    this.data.historyStream$.next(true);
  }

  fetchStartingInfo() {
    //Listar os stakeholders do processo
    this.queuesInfo.getProcessStakeholdersList(this.processId).subscribe(result => {
      var stakeholders = result;
      stakeholders.forEach(value => {
        // Obter o detalhe dos stakeholders
        this.queuesInfo.getProcessStakeholderDetails(this.processId, value.id).subscribe(res => {
          var stakeholder = res;
          this.stakesList.push(stakeholder);
        });
      });
      this.logger.debug("stakeholders do processo: " + stakeholders);
    });

    //Listar as lojas do processo
    this.queuesInfo.getProcessShopsList(this.processId).subscribe(result => {
      var shops = result;
      shops.forEach(value => {
        // Obter o detalhe das lojas
        this.queuesInfo.getProcessShopDetails(this.processId, value.id).subscribe(res => {
          var shop = res;
          this.shopsList.push(shop);
          // Obter os equipamentos das lojas
          this.queuesInfo.getProcessShopEquipmentsList(this.processId, shop.id).subscribe(eq => {
            var equipments = eq;
            equipments.forEach(val => {
              // Obter o detalhe dos equipamentos das lojas
              this.queuesInfo.getProcessShopEquipmentDetails(this.processId, shop.id, val.id).subscribe(r => {
                var equipment = r;
                this.equipmentList.push(equipment);
              })
            })
          })
        });
      });
      this.logger.debug("lojas do processo: " + shops);
      this.logger.debug("equipamentos das lojas do processo: " + this.equipmentList);
    });
  }

  nextPage() {
    this.logger.debug('Valor do returned ' + localStorage.getItem("returned"));
    if (localStorage.getItem("returned") != 'consult') {
      localStorage.setItem('returned', 'edit');
      this.logger.debug('Valor do returned' + localStorage.getItem("returned"));
    }

    this.route.navigate(['/client']);
  }

  selectFile(event: any) {
    if (this.queueName === "eligibility") {
      this.type = "queues.attach.eligibility"
    } else if (this.queueName === "compliance") {
      this.type = "queues.attach.compliance"
    } else if (this.queueName === "DOValidation") {
      this.type = "queues.attach.DOValidation"
    } else if (this.queueName === "risk") {
      this.type = "queues.attach.risk"
    } else if (this.queueName === "negotiationAproval") {
      this.type = "queues.attach.negotiationApproval"
    }
    this.attach = { tipo: this.type, dataDocumento: "01-08-2022" }
    const files = <File[]>event.target.files;
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      const sizeFile = file.size / (1024 * 1024);
      var extensoesPermitidas = /(.pdf)$/i;
      const limSize = 10;
      this.result = this.http.put(this.baseUrl + 'ServicesComprovativos/', 1);
      if (this.result != null) {
        if ((sizeFile <= limSize) && (extensoesPermitidas.exec(file.name))) {
          if (event.target.files && files[i]) {
            var reader = new FileReader();
            reader.onload = (event: any) => {
              this.localUrl = event.target.result;
            }
            reader.readAsDataURL(files[i]);
            this.files.push(file);
          } else {
            alert("Verifique o tipo / tamanho do ficheiro");
          }
        }
      }
    }
    this.logger.debug(this.files);
  }

  check(){
    this.checkButton = true;
  }

  concludeOpinion(state, externalState) {
    this.queuesInfo.postExternalState(this.processId, state, externalState).subscribe(result => {
      this.logger.debug("Send external state - Eligibility");
    })
  }

}
