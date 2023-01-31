import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { LoggerService } from 'src/app/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TableInfoService } from '../../table-info/table-info.service';
import { ContractPackLanguage } from '../../table-info/ITable-info.interface';

@Component({
  selector: 'app-pack-contratual',
  templateUrl: './pack-contratual.component.html'
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
  public docToShow: { nome: string, NIF: string, poderRepresentacao: string, selecao: boolean };
  files?: File[] = [];

  isPaper: boolean = null;
  showObservations: boolean = false;
  showTable: boolean = false;
  validatedDocuments: boolean = false;
  showAnotherButtons: boolean = false;

  @ViewChild('assinaturaDigitalModal') assinaturaDigitalModal;
  @ViewChild('submeterPedidoModal') submeterPedidoModal;

  contractLanguage: ContractPackLanguage[];

  constructor(private logger: LoggerService,
    private modalService: BsModalService, private translate: TranslateService, private snackBar: MatSnackBar, private tableInfoService: TableInfoService) {

    this.tableInfoService.GetContractualPackLanguage().subscribe(result => {
      this.contractLanguage = result;
    });
  }

  ngOnInit(): void {
    var context = this;
  }

  paperSignature(paper: boolean) {
    this.showTable = true;
    this.showObservations = true;
    this.showAnotherButtons = paper;
    if (paper) {
      this.isPaper = true;
    } else {
      this.isPaper = false;
    }
  }

  validatedDocumentsChange(value: boolean) {
    this.validatedDocuments = value;
  }

  openAssinaturaDigitalModal() {
    this.assinaturaDigitalModalRef = this.modalService.show(this.assinaturaDigitalModal, { class: 'modal-lg' });
  }

  declineAssinaturaDigital() {
    this.assinaturaDigitalModalRef?.hide();
    this.showAnotherButtons = true;
  }

  selectFile(event: any) {
    this.docToShow = { nome: "Teste", NIF: "123456789", poderRepresentacao: "Assina Sozinho", selecao: true }
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
    this.logger.debug("Attached files " + this.files);
  }

  openSubmeterPedidoModal() {
    this.submeterPedidoModalRef = this.modalService.show(this.submeterPedidoModal, { class: 'modal-lg' });
  }

  declineSubmeterPedido() {
    this.submeterPedidoModalRef?.hide();
  }
}
