import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Renderer2 } from '@angular/core';
import { Component, Inject, Input, OnInit, VERSION, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { Subscription, take } from 'rxjs';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';


@Component({
  selector: 'app-pack-contratual',
  templateUrl: './pack-contratual.component.html'
})

export class PackContratualComponent implements OnInit{
  form: FormGroup;

  public map = new Map();
  public currentPage: number;
  public subscription: Subscription;

  assinaturaDigitalModalRef: BsModalRef | undefined;
  submeterPedidoModalRef: BsModalRef | undefined;

  public result: any;

  // apagar quando tiver com API
  public docToShow: {nome:string, NIF: string, poderRepresentacao: string, selecao: boolean};
  files?: File[] = [];

  isPaper: boolean = null;
  showObservations: boolean = false;
  validatedDocuments: boolean = false;
  showAnotherButtons: boolean = false;

  @ViewChild('assinaturaDigitalModal') assinaturaDigitalModal;
  @ViewChild('submeterPedidoModal') submeterPedidoModal;

  
  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string,
  private route: Router,
  private router: ActivatedRoute, private modalService: BsModalService,) {

    this.ngOnInit();
  
}

ngOnInit(): void {

  var context = this;
}

paperSignature(paper: boolean) {
  this.showObservations = true;
  if (paper){
    this.isPaper = true;
  } else {
    this.isPaper = false;
  }
}

validatedDocumentsChange(value: boolean) {
  this.validatedDocuments = value;
}

openAssinaturaDigitalModal(){
  this.assinaturaDigitalModalRef = this.modalService.show(this.assinaturaDigitalModal, { class: 'modal-sm' });
}

declineAssinaturaDigital(){
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
            // this.localUrl = event.target.result;
          }
          reader.readAsDataURL(files[i]);
          this.files.push(file);
        } else {
          alert("Verifique o tipo / tamanho do ficheiro");
        }

      }
    }

  }
  console.log(this.files);

  }

  openSubmeterPedidoModal(){
    this.submeterPedidoModalRef = this.modalService.show(this.submeterPedidoModal, { class: 'modal-sm' });
  }

  declineSubmeterPedido(){
    this.submeterPedidoModalRef?.hide();
  }

}