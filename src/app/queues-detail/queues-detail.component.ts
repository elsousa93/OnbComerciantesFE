import { HttpClient } from '@angular/common/http';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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
import { EligibilityAssessment, ExternalState, RiskAssessment, State, StateResultDiscriminatorEnum } from './IQueues.interface';
import { PostDocument } from '../submission/document/ISubmission-document';
import { ComprovativosService } from '../comprovativos/services/comprovativos.services';
import { queue } from 'jquery';


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
  //public externalState: ExternalState;

  constructor(private logger: LoggerService, private http: HttpClient, @Inject(configurationToken) private configuration: Configuration,
    private route: Router, private data: DataService, private queuesInfo: QueuesService, private documentService: ComprovativosService) {

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

  initializeElegibilityForm() {
    this.form = new FormGroup({
      observation: new FormControl(''),
      stakeholdersEligibility: new FormGroup({})
    });
  }

  updateForm() {
    var formGroupStakeholdersEligibility = new FormGroup({});
    this.stakesList.forEach(function (value, idx) {
      formGroupStakeholdersEligibility.addControl(value.id, new FormControl('', Validators.required));
    });

    this.form.setControl("stakeholdersEligibility", formGroupStakeholdersEligibility);
  }



  ngOnInit(): void {
    this.subscription = this.data.currentData.subscribe(map => this.map = map);
    this.subscription = this.data.currentPage.subscribe(currentPage => this.currentPage = currentPage);
    this.data.historyStream$.next(true);
    this.initializeElegibilityForm();
  }

  loadStakeholdersFromProcess() {
    //Listar os stakeholders do processo
    var currentLength = 0;
    return new Promise(async (resolve, reject) => {
      this.queuesInfo.getProcessStakeholdersList(this.processId).then(result => {
        console.log("stakeholders");
        var stakeholders = result.result;
        var totalLength = stakeholders.length;

        stakeholders.forEach(value => {
          console.log("stakeholder");
          // Obter o detalhe dos stakeholders
          this.queuesInfo.getProcessStakeholderDetails(this.processId, value.id).then(res => {
            console.log("stakeholder iter");
            var stakeholder = res.result;
            var stakeholderGroup = this.form.get('stakeholdersEligibility') as FormGroup;

            stakeholderGroup.addControl(value.id, new FormControl('', Validators.required));
            this.stakesList.push(stakeholder);

            if (++currentLength == totalLength)
              resolve(null);
          });
        });
        this.logger.debug("stakeholders do processo: " + stakeholders);
      }).then(next => {
        console.log("acabou");
        resolve(null);
      });
    });
  }

  loadShopsFromProcess() {
    return new Promise(async (resolve, reject) => {
      await this.queuesInfo.getProcessShopsList(this.processId).then(result => {
        console.log("Loja");
        var shops = result.result;
        shops.forEach(value => {
          // Obter o detalhe das lojas
          this.queuesInfo.getProcessShopDetails(this.processId, value.id).then(res => {
            var shop = res.result;
            this.shopsList.push(shop);
            // Obter os equipamentos das lojas
            this.queuesInfo.getProcessShopEquipmentsList(this.processId, shop.id).then(eq => {
              var equipments = eq.result;
              equipments.forEach(val => {
                // Obter o detalhe dos equipamentos das lojas
                this.queuesInfo.getProcessShopEquipmentDetails(this.processId, shop.id, val.id).then(r => {
                  var equipment = r.result;
                  this.equipmentList.push(equipment);
                })
              })
            })
          });
        });
        this.logger.debug("lojas do processo: " + shops);
        this.logger.debug("equipamentos das lojas do processo: " + this.equipmentList);
      }).then(after => {
        console.log("Ja acabou");
        resolve(null);
      });
    })
  }

  fetchStartingInfo() {

    this.loadStakeholdersFromProcess().then(success => {
      this.loadShopsFromProcess().then(next => {
      }, reject => {

      })
    })
    //Listar as lojas do processo
    
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

  concludeOpinion(/*state, externalState*/) {
    var context = this;

    var queueModel;
    if (this.queueName === 'eligibility') {
      this.state = State.ELIGIBILITY_ASSESSMENT;

      queueModel = {} as EligibilityAssessment;
      var observation = this.form.get('observation').value;
      queueModel.type = StateResultDiscriminatorEnum.ELIGIBILITY_ASSESSMENT;
      queueModel.userObservations = observation;

      var stakeholders = this.form.get("stakeholdersEligibility") as FormGroup;
      queueModel.stakeholderAssessment = [];

      for (const cont in stakeholders.controls) {
        console.log("Control dentro do group: ", cont);
        const control = this.form.get("stakeholdersEligibility").get(cont);
        console.log("valor do control: ", control.value);
        queueModel.stakeholderAssessment.push({
          stakeholderId: cont,
          accepted: control.value
        });
      }
      console.log("Queue model final: ", queueModel);
      queueModel.merchantAssessment = {
        accepted: true,
        merchantId: null
      };
    } else if (this.queueName === 'risk') {
      this.state = State.RISK_ASSESSMENT;
      queueModel = {} as RiskAssessment;

      var observation = this.form.get('observation').value;
      queueModel.type = StateResultDiscriminatorEnum.ELIGIBILITY_ASSESSMENT;
      queueModel.userObservations = observation;

      var stakeholders = this.form.get("stakeholdersEligibility") as FormGroup;
      queueModel.stakeholderAssessment = [];

      for (const cont in stakeholders.controls) {
        console.log("Control dentro do group: ", cont);
        const control = this.form.get("stakeholdersEligibility").get(cont);
        console.log("valor do control: ", control.value);
        queueModel.stakeholderAssessment.push({
          stakeholderId: cont,
          accepted: control.value
        });
      }
      console.log("Queue model final: ", queueModel);
      queueModel.merchantAssessment = {
        accepted: true,
        merchantId: null
      };
    }

    this.files.forEach(function (value, idx) {
      context.documentService.readBase64(value).then(data => {
        var document: PostDocument = {
          documentType: null,
          file: {
            fileType: "PDF",
            binary: data.split(',')[1]
          },
          validUntil: new Date().toISOString(),
          data: {}
        }

        context.queuesInfo.postProcessDocuments(document, context.processId, context.state);
      });
    })

    this.queuesInfo.postExternalState(this.processId, this.state, queueModel).subscribe(result => {
      console.log("resultado do post external state: ", queueModel);
      //this.logger.debug("Send external state - Eligibility");
    })
  }

}
