import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AceitacaoService } from '../services/aceitacao.services';
import { PostDocument } from '../../submission/document/ISubmission-document';
import { ProcessService } from '../../process/process.service';
import { LoggerService } from 'src/app/logger.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-obter-pack-contratual',
  templateUrl: './obter-pack-contratual.component.html'
})

export class ObterPackContratualComponent implements OnInit {
  form: FormGroup;
  public id: number = 0;
  public map = new Map();
  public currentPage: number;
  public subscription: Subscription;
  deleteModalRef: BsModalRef | undefined;
  submissionModalRef: BsModalRef | undefined;

  public docToShow: { tipo: string, interveniente: string, dataEntrada: string };


  validatedDocuments: boolean = false;
  files?: File[] = [];
  fileToDelete?: File;
  localUrl: any;

  public url1: string = "assets/forms/contrato_adesao.pdf";
  public url2: string = "assets/forms/contrato_adesao.pdf";
  public url3: string = "assets/forms/contrato_adesao.pdf";

  @ViewChild('deleteModal') deleteModal;
  @ViewChild('submissionModal') submissionModal;

  constructor(private logger: LoggerService, private http: HttpClient,
    private router: Router, private translate: TranslateService, private snackBar: MatSnackBar, private modalService: BsModalService, private processService: ProcessService, public aceitacao: AceitacaoService) {

  }

  ngOnInit(): void {

    var context = this;
  }

  validatedDocumentsChange(value: boolean) {
    this.validatedDocuments = value;
  }

  downloadForm(url: string) {
    const link = document.createElement('a');
    link.href = url;
    link.download = url.split("/")[2];
    link.click();
  }

  downloadFormAll() {
    // contrato de adesao ao sistema reduniq
    const link1 = document.createElement('a');
    link1.href = this.url1;
    link1.download = this.url1.split("/")[2];
    link1.click();

    // formulário 1
    const link2 = document.createElement('a');
    link2.href = this.url2;
    link2.download = this.url2.split("/")[2];
    link2.click();

    // formulário 2
    const link3 = document.createElement('a');
    link3.href = this.url3;
    link3.download = this.url3.split("/")[2];
    link3.click();
  }

  // por terminar
  onDelete(tipo: string, interveniente: string, dataEntrada: string, file: File) {
    this.docToShow.tipo = tipo;
    this.docToShow.interveniente = interveniente;
    this.docToShow.dataEntrada = dataEntrada;
    this.deleteModalRef = this.modalService.show(this.deleteModal, { class: 'modal-lg' });
    this.fileToDelete = file;
  }

  submission() {
    this.submissionModalRef = this.modalService.show(this.submissionModal, { class: 'modal-lg' });

    this.logger.debug("ficheiros a inserir: " + this.files.toString());
    var context = this;
    this.files.forEach(function (file, idx) {
      context.readBase64(file).then((data) => {
        var docToSend: PostDocument = {
          "documentType": "string",
          "documentPurpose": "Identification",
          "validUntil": "2022-07-20T11:03:13.001Z",
          "data": data.split(',')[1]
        }
        var processId = 'a5b04add-2179-4d0e-99ba-18c5622536cb';

        context.processService.postProcessDocuments(processId, 'ContractAcceptance', docToSend).subscribe(result => {
          this.logger.debug('Ficheiro foi submetido ' + result);
        });
      })
    });

  }

  selectFile(event: any) {
    this.docToShow = { tipo: "desconhecido", interveniente: "desconhecido", dataEntrada: "desconhecido" }

    const files = <File[]>event.target.files;
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      const sizeFile = file.size / (1024 * 1024);
      var extensoesPermitidas = /(.pdf)$/i;
      const limSize = 10;
      // this.result = this.http.put(this.url + 'ServicesComprovativos/', this.newComp.clientId);
      // if (this.result != null) {
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
      // }

    }
    this.logger.debug(this.files);
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

  confirmDelete() {
    this.deleteModalRef?.hide();
    const index = this.files.indexOf(this.fileToDelete);
    if (index > -1) {
      this.files.splice(index, 1);
    }
    this.aceitacao.delFile(this.id).subscribe(data => {
      this.logger.debug("DATA: " + data);
      if (data != null) {
        this.load();
      }
    },
      err => {
        console.error(err);
      }
    )
  }

  declineDelete() {
    this.deleteModalRef?.hide();
  }

  declineDeleteDoc() {
    this.deleteModalRef?.hide();
  }

  declineSubmission() {
    this.submissionModalRef?.hide();
  }

  confirmSubmission() {
    this.router.navigate(["/"]);
  }
  load() {
    location.reload()
  }

  private readBase64(file): Promise<any> {
    const reader = new FileReader();
    const future = new Promise((resolve, reject) => {
      reader.addEventListener('load', function () {
        resolve(reader.result);
      }, false);
      reader.addEventListener('error', function (event) {
        reject(event);
      }, false);

      reader.readAsDataURL(file);
    });
    return future;
  }
}
