import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DataService } from '../nav-menu-interna/data.service';
import { ProcessList } from '../process/process.service';
import { LoggerService } from 'src/app/logger.service';
import { QueuesService } from './queues.service';
import { IStakeholders } from '../stakeholders/IStakeholders.interface';
import { ShopDetailsAcquiring, ShopEquipment } from '../store/IStore.interface';
import { EligibilityAssessment, RiskAssessment, StandardIndustryClassificationChoice, State, StateResultDiscriminatorEnum } from './IQueues.interface';
import { PostDocument } from '../submission/document/ISubmission-document';
import { ComprovativosService } from '../comprovativos/services/comprovativos.services';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';


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

  public checkButton: boolean = false;

  stakesList: IStakeholders[] = [];
  shopsList: ShopDetailsAcquiring[] = [];
  equipmentList: ShopEquipment[] = [];

  public state: State;
  //public externalState: ExternalState;

  constructor(private logger: LoggerService, private translate: TranslateService, private snackBar: MatSnackBar, private http: HttpClient,
    private route: Router, private data: DataService, private queuesInfo: QueuesService, private documentService: ComprovativosService) {

    //Gets Queue Name and processId from the Dashboard component 
    if (this.route.getCurrentNavigation().extras.state) {
      this.queueName = this.route.getCurrentNavigation().extras.state["queueName"];
      this.processId = this.route.getCurrentNavigation().extras.state["processId"];
    }

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

  initializeMCCForm() {
    this.form = new FormGroup({
      shopsMCC: new FormGroup({})
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

  getStakeholderInfo(processId, stakeholderId) {
    return new Promise((resolve, reject) => {
      this.queuesInfo.getProcessStakeholderDetails(processId, stakeholderId).then(res => {
        var stakeholder = res.result;
        var stakeholderGroup = this.form.get('stakeholdersEligibility') as FormGroup;

        stakeholderGroup.addControl(stakeholderId, new FormControl('', Validators.required));
        this.stakesList.push(stakeholder);
        resolve;
      })
    });
  }

  loadStakeholdersFromProcess() {
    //Listar os stakeholders do processo
    var currentLength = 0;
    return new Promise((resolve, reject) => {
      this.queuesInfo.getProcessStakeholdersList(this.processId).then(result => {
        var stakeholders = result.result;
        var totalLength = stakeholders.length;

        var stakeholderInfoPromises = [];

        stakeholders.forEach(value => {
          // Obter o detalhe dos stakeholders
          stakeholderInfoPromises.push(this.getStakeholderInfo(this.processId, value.id));
        });

        Promise.all(stakeholderInfoPromises).then(res => {
          resolve;
        });

        this.logger.debug("stakeholders do processo: " + stakeholders);
      });
    });
  }

  getShopEquipmentInfo(processId, shopId, shopEquipmentId) {
    var context = this;

    return new Promise((resolve, reject) => {
      this.queuesInfo.getProcessShopEquipmentDetails(processId, shopId, shopEquipmentId).then(r => {
        var equipment = r.result;
        this.equipmentList.push(equipment);
        resolve;
      });
    });
  }

  getShopInfo(processId, shopId) {
    var context = this;

    return new Promise((resolve, reject) => {
      this.queuesInfo.getProcessShopDetails(processId, shopId).then(result => {
        var shop = result.result;

        var shopMCC = this.form.get("shopsMCC") as FormGroup

        shopMCC.addControl(shop.id + "", new FormControl(Validators.required));
        this.shopsList.push(shop);

        this.queuesInfo.getShopEquipmentConfigurationsFromProcess(this.processId, shop.id).then(eq => {
          var equipments = eq.result;

          var shopEquipmentPromisses = [];
          equipments.forEach(val => {
            // Obter o detalhe dos equipamentos das lojas
            shopEquipmentPromisses.push(context.getShopEquipmentInfo(processId, shop.id, val.id));
          })

          Promise.all(shopEquipmentPromisses).then(res => {
            resolve;
          })
        });
      })
    });
  }

  loadShopsFromProcess() {
    var context = this;
    var subPromisses = [];
    return new Promise((resolve, reject) => {
      this.queuesInfo.getProcessShopsList(this.processId).then(result => {
        var shops = result.result;
        shops.forEach(value => {
          subPromisses.push(context.getShopInfo(this.processId, value.id));
        });

        Promise.all(subPromisses).then(success => {
          resolve;
        });
      });
    })
  }

  fetchStartingInfo() {

    this.queuesInfo.GetProcessStakeholders(this.processId).then(success => {
      var stakeholdersList = success;
      this.stakesList = stakeholdersList;
      this.loadShopsFromProcess().then(next => {
      }, reject => {

      })
    })
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
            this.snackBar.open(this.translate.instant('queues.attach.success'), '', {
              duration: 4000,
              panelClass: ['snack-bar']
            });
          } else {
            alert("Verifique o tipo / tamanho do ficheiro");
          }
        }
      }
    }
    this.logger.debug(this.files);
  }

  openFile(/*url: any, imgName: any*/ file: File) {
    let blob = new Blob([file], { type: file.type });
    let url = window.URL.createObjectURL(blob);

    window.open(url, '_blank',
      `margin: auto;
      width: 50%;
      padding: 10px;
      text-align: center;
      border: 3px solid green;
      `);
  }

  check() {
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
        const control = this.form.get("stakeholdersEligibility").get(cont);
        queueModel.stakeholderAssessment.push({
          stakeholderId: cont,
          accepted: control.value
        });
      }
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
        const control = this.form.get("stakeholdersEligibility").get(cont);
        queueModel.stakeholderAssessment.push({
          stakeholderId: cont,
          accepted: control.value
        });
      }
      queueModel.merchantAssessment = {
        accepted: true,
        merchantId: null
      };
    } else if (this.queueName === 'MCC') {
      this.state = State.STANDARD_INDUSTRY_CLASSIFICATION_CHOICE;
      queueModel = {} as StandardIndustryClassificationChoice;

      var stakeholders = this.form.get("shopsMCC") as FormGroup;
      queueModel.shopClassifications = {
        shopId: null,
        schemaClassification: []
      }

      for (const cont in stakeholders.controls) {
        const control = this.form.get("shopsMCC").get(cont);

        queueModel.shopClassifications.schemaClassification.push({
          paymentSchemaId: null,
          classification: control.value
        });
      }
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
    })
  }
}