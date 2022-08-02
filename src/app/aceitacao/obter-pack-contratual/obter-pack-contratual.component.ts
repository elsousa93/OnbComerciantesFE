import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Renderer2 } from '@angular/core';
import { Component, Inject, Input, OnInit, VERSION, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { Subscription, take } from 'rxjs';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Configuration, configurationToken } from 'src/app/configuration';


@Component({
  selector: 'app-obter-pack-contratual',
  templateUrl: './obter-pack-contratual.component.html'
})

export class ObterPackContratualComponent implements OnInit{
  form: FormGroup;

  public map = new Map();
  public currentPage: number;
  public subscription: Subscription;
  deleteModalRef: BsModalRef | undefined;
  submissionModalRef: BsModalRef | undefined;

  public docToShow: {tipo:string, interveniente: string, dataEntrada: string};

  
  validatedDocuments: boolean = false;
  files?: File[] = [];
  fileToDelete?: File;
  localUrl: any;

  public url1: string = "assets/forms/contrato_adesao.pdf";
  public url2: string = "assets/forms/contrato_adesao.pdf";
  public url3: string = "assets/forms/contrato_adesao.pdf";

  @ViewChild('deleteModal') deleteModal;
  @ViewChild('submissionModal') submissionModal;
  
  constructor(private http: HttpClient, @Inject(configurationToken) private configuration: Configuration,
  private route: Router,
  private router: ActivatedRoute, private modalService: BsModalService) {

    this.ngOnInit();
  
}

ngOnInit(): void {

  var context = this;
}

validatedDocumentsChange(value: boolean) {
  this.validatedDocuments = value;
}

downloadForm(url: string){
  const link = document.createElement('a');
  link.href = url;
  link.download = url.split("/")[2];
  link.click();
}

downloadFormAll(){
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
onDelete(tipo:string, interveniente: string, dataEntrada: string) {
  this.docToShow.tipo = tipo;
  this.docToShow.interveniente = interveniente;
  this.docToShow.dataEntrada = dataEntrada;
  this.deleteModalRef = this.modalService.show(this.deleteModal, { class: 'modal-lg' });
  // this.fileToDelete = file;
}

submission(){
  this.submissionModalRef = this.modalService.show(this.submissionModal, { class: 'modal-lg' });
}

selectFile(event: any) {
  this.docToShow = { tipo: "pdf", interveniente: "Manuel", dataEntrada: new Date() + ""}

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
        } else {
          alert("Verifique o tipo / tamanho do ficheiro");
        }

       }
   // }

  }
  console.log(this.files);
}

confirmDelete() {

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

}

}