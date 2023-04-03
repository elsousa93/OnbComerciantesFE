import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { LoggerService } from 'src/app/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TableInfoService } from '../../table-info/table-info.service';
import { ContractPackLanguage } from '../../table-info/ITable-info.interface';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { IStakeholders } from '../../stakeholders/IStakeholders.interface';
import { QueuesService } from '../../queues-detail/queues.service';
import { AceitacaoDoc } from '../../comprovativos/IComprovativos.interface';
import { DatePipe } from '@angular/common';
import { ContractAcceptance, ContractAcceptanceEnum, ContractDigitalAcceptance, ContractDigitalAcceptanceEnum, State } from '../../queues-detail/IQueues.interface';
import { ComprovativosService } from '../../comprovativos/services/comprovativos.services';
import { PostDocument } from '../../submission/document/ISubmission-document';
import { ProcessService } from '../../process/process.service';

@Component({
  selector: 'app-pack-contratual',
  templateUrl: './pack-contratual.component.html',
  providers: [DatePipe]
})

export class PackContratualComponent implements OnInit {
  form: FormGroup;
  public map = new Map();
  public currentPage: number;
  public subscription: Subscription;

  assinaturaDigitalModalRef: BsModalRef | undefined;
  submeterPedidoModalRef: BsModalRef | undefined;

  public result: any;

  // apagar quando tiver com API
  public docToShow: {id: string, type: string, date: string, file: File};
  files?: File[] = [];

  isPaper: boolean = null;
  showObservations: boolean = false;
  showTable: boolean = false;
  validatedDocuments: boolean = false;
  showAnotherButtons: boolean = false;

  @ViewChild('assinaturaDigitalModal') assinaturaDigitalModal;
  @ViewChild('submeterPedidoModal') submeterPedidoModal;

  contractLanguage: ContractPackLanguage[];
  canceled: boolean = false;
  validatedStake: boolean;
  processId: string;
  stakeholdersList: IStakeholders[] = [];
  compsToShow: AceitacaoDoc[] = [];
  observations: string = "";
  updatedInfo: boolean = false;
  manualSignature: boolean = false;
  firstTime: boolean = true;
  state: string = "";
  manualSignatureFileId: string = "";

  constructor(private logger: LoggerService,
    private modalService: BsModalService, private translate: TranslateService, private snackBar: MatSnackBar,
    private tableInfoService: TableInfoService, private router: ActivatedRoute, private queuesInfo: QueuesService, private datepipe: DatePipe,
    private route: Router, private documentService: ComprovativosService, private processService: ProcessService) {
    if (this.route?.getCurrentNavigation()?.extras?.state) {
      this.state = this.route.getCurrentNavigation().extras.state["state"];
    }
  }

  ngOnInit(): void {
    var context = this;
    this.processId = decodeURIComponent(this.router.snapshot.paramMap.get('id'));
    this.fetchStartingInfo();
    this.getDocuments();
    this.form = new FormGroup({
      observations: new FormControl('')
    })
    if (this.state == 'ContractAcceptance') {
      this.manualSignature = true;
    }
  }

  fetchStartingInfo() {
    var context = this;
    if (this.firstTime == false) {
      this.updatedInfo = true;
    }
    this.stakeholdersList = [];
    this.queuesInfo.getProcessStakeholdersList(this.processId).then(result => {
      this.logger.info("Get stakeholders list from process result: " + JSON.stringify(result));
      var stakeholders = result.result;
      stakeholders.forEach(value => {
        this.queuesInfo.getProcessStakeholderDetails(this.processId, value.id).then(result => {
          if (result.result.signType == "NotSign") {
            result.result.signType = context.translate.instant('acceptance.contratualPack.notSign');
          } else if (result.result.signType == "CitizenCard") {
            result.result.signType = context.translate.instant('acceptance.contratualPack.citizenCard');
          } else if (result.result.signType == "DigitalCitizenCard") {
            result.result.signType = context.translate.instant('acceptance.contratualPack.digitalCitizenCard');
          } else if (result.result.signType == "OneTimePassword") {
            result.result.signType = context.translate.instant('acceptance.contratualPack.oneTimePassword');
          } else if (result.result.signType == "Biometric") {
            result.result.signType = context.translate.instant('acceptance.contratualPack.biometric');
          }

          if (result.result.identificationState != "Identified" && result.result.signatureState == "NotSigned") {
            if (result.result.identificationState == "NotIdentified") {
              result.result.identificationState = context.translate.instant('acceptance.contratualPack.notIdentified');
            } else if (result.result.identificationState == "Identified") {
              result.result.identificationState = context.translate.instant('acceptance.contratualPack.identified');
            } else if (result.result.identificationState == "Pending") {
              result.result.identificationState = context.translate.instant('acceptance.contratualPack.pending');
            } else if (result.result.identificationState == "Cancelled") {
              result.result.identificationState = context.translate.instant('acceptance.contratualPack.canceled');
            } else if (result.result.identificationState == "Refused") {
              result.result.identificationState = context.translate.instant('acceptance.contratualPack.refused');
            }
          } else {
            if (result.result.signatureState == "NotSigned") {
              result.result.identificationState = context.translate.instant('acceptance.contratualPack.signature.notSigned');
            } else if (result.result.signatureState == "Signed") {
              result.result.identificationState = context.translate.instant('acceptance.contratualPack.signature.signed');
            } else if (result.result.signatureState == "Pending") {
              result.result.identificationState = context.translate.instant('acceptance.contratualPack.signature.pending');
            } else if (result.result.signatureState == "Cancelled") {
              result.result.identificationState = context.translate.instant('acceptance.contratualPack.signature.canceled');
            } else if (result.result.signatureState == "Refused") {
              result.result.identificationState = context.translate.instant('acceptance.contratualPack.signature.refused');
            }
          }

          this.stakeholdersList.push(result.result);
        });
      });
    });
    this.firstTime = false;
  }

  getDocuments() {
    this.processService.getDocumentFromProcess(this.processId).subscribe(result => {
      if (result.length > 0) {
        result.forEach(doc => {
          if (doc.type == "1101") {
            this.manualSignatureFileId = doc.id;
          }
        });
      }
    });
  }

  validatedDocumentsChange(value: boolean) {
    this.validatedDocuments = value;
  }

  //validatedStakeIdentification(value: boolean) {
  //  this.validatedStake = value;
  //}

  openAssinaturaDigitalModal() {
    this.assinaturaDigitalModalRef = this.modalService.show(this.assinaturaDigitalModal, { class: 'modal-lg' });
  }

  declineAssinaturaDigital() {
    this.assinaturaDigitalModalRef?.hide();
    this.showAnotherButtons = true;
  }

  selectFile(event: any) {
    this.docToShow = {id: "", type: "Teste", date: "123456789", file: null}
    const files = <File[]>event.target.files;
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      const sizeFile = file.size / (1024 * 1024);
      var extensoesPermitidas = /(.pdf)$/i;
      const limSize = 10;
      this.result = "teste";
      if (this.result != null) {
        if ((sizeFile <= limSize) && (extensoesPermitidas.exec(file.name))) {
          if (event.target.files && files[i]) {
            var reader = new FileReader();
            reader.onload = (event: any) => {
            }
            reader.readAsDataURL(files[i]);
            this.files.push(file);
            this.compsToShow.push({
              id: "0",
              type: "CONTRATO ASSINADO",
              date: this.datepipe.transform(new Date(), 'dd-MM-yyyy'),
              file: file
            });
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
    this.logger.debug("Attached files " + JSON.stringify(this.files));
  }

  search(/*url: any, imgName: any*/ file: File) {
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

  onDelete(file: File) {
    let index = this.files.findIndex(f => f.lastModified === file.lastModified);
    let index1 = this.compsToShow.findIndex(f => f.file.lastModified === file.lastModified);

    if (index1 > -1)
      this.compsToShow.splice(index1, 1);

    if (index > -1)
      this.files.splice(index, 1);
  }

  openSubmeterPedidoModal() {
    this.submeterPedidoModalRef = this.modalService.show(this.submeterPedidoModal, { class: 'modal-lg' });
  }

  declineSubmeterPedido() {
    this.submeterPedidoModalRef?.hide();
  }

  changeToManual() {
    this.manualSignature = true;
    this.submit('ChangeToManualSignature'); 
  }

  cancelIdentification() {
    if (this.updatedInfo) {
      this.canceled = true;
      this.submit('CancelDigitalSignature');
    } else {
      this.submit('CancelDigitalIdentification');
    }
  }

  downloadAll() {
    if (this.manualSignatureFileId != "") {
      this.processService.getDocumentImageFromProcess(this.processId, this.manualSignatureFileId).subscribe(result => {
        this.b64toBlob(result.binary, 'application/pdf', 512, true);
      });
    }
  }

  submit(state: string) {
    var context = this;
    var externalState;
    var stateType;
    if (!this.manualSignature) { //digital
      externalState = {} as ContractDigitalAcceptance;
      stateType = State.CONTRACT_DIGITAL_ACCEPTANCE;
      externalState.$type = stateType;
      externalState.contractDigitalAcceptanceResult = state;
    } else { //manual
      externalState = {} as ContractAcceptance;
      stateType = State.CONTRACT_ACCEPTANCE;
      externalState.$type = stateType;
      externalState.contractAcceptanceResult = state;
    }
    externalState.userObservations = this.form.get("observations").value;

    if (this.compsToShow.length > 0) {
      let length = 0;
      this.compsToShow.forEach(function (value, idx) {
        length++;
        context.documentService.readBase64(value.file).then(data => {
          var document: PostDocument = {
            documentType: null,
            file: {
              fileType: "PDF",
              binary: data.split(',')[1]
            },
            validUntil: new Date().toISOString(),
            data: {}
          }
          context.queuesInfo.postProcessDocuments(document, context.processId, stateType).then(res => {
            if (context.compsToShow.length == length) {
              context.queuesInfo.postExternalState(context.processId, stateType, externalState).then(res => {
                context.route.navigate(['/']);
              });
            }
          });
        });
      })
    } else {
      this.queuesInfo.postExternalState(this.processId, stateType, externalState).then(res => {
        //if (state == 'Cancel') {
        //  let navigationExtras = {
        //    state: {
        //      returnedFrontOffice: true
        //    }
        //  } as NavigationExtras;
        //  this.queuesInfo.markToCancel(this.processId).then(res => {
        //    this.route.navigate(['/info-declarativa'], navigationExtras);
        //  });
        //}
        this.route.navigate(['/']);
      });
    }
  }

  b64toBlob(b64Data: any, contentType: string, sliceSize: number, download: boolean = false) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    const blobUrl = window.URL.createObjectURL(blob);
    if (download) {
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'contrato';
      link.click();
    } else {
      window.open(blobUrl, '_blank',
        `margin: auto;
      width: 50%;
      padding: 10px;
      text-align: center;
      border: 3px solid green;` );
    }
  }
}
