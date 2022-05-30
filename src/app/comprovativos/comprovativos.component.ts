import { HttpClient } from '@angular/common/http';
import { Renderer2 } from '@angular/core';
import { Component, Inject, Input, OnInit, VERSION, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { CheckDocumentsComponent } from './check-documents/check-documents.component';
import { IComprovativos } from './IComprovativos.interface';
import { ComprovativosService } from './services/comprovativos.services';


@Component({
  selector: 'app-comprovativos',
  templateUrl: './comprovativos.component.html'
})
export class ComprovativosComponent implements OnInit {
  public comprovativos: IComprovativos[] = [];
  public result: any;
  public id: number = 0;
  public clientNr: number = 0;

  pageName = "";
  file?: File;
  localUrl: any;
  fileName: any;
  urlImage: string | any;
  mostrar: boolean = false;
  deleteModalRef: BsModalRef | undefined;

  comerciante: string;
  comprovantes: string;
  intervenientes: string;
  lojas: string;
  oferta: string;
  info: string;



  @ViewChild('deleteModal') deleteModal;
  constructor(public http: HttpClient, @Inject('BASE_URL') baseUrl: string, private router: ActivatedRoute, private compService: ComprovativosService, private renderer: Renderer2,
    private modalService: BsModalService) {
    http.get<IComprovativos[]>(baseUrl + `BEComprovativos/`).subscribe(result => {
      this.comprovativos = result;
    }, error => console.error(error));
  }

  ngOnInit(): void {
    this.clientNr = Number(this.router.snapshot.params['id']);
    console.log(String(this.router.snapshot.params['pagename']));
    this.pageName = String(this.router.snapshot.params['pageName']);
  }

  selectFile(event: any, comp: any) {
    this.file = <File>event.target.files[0];
    const sizeFile = this.file.size / (1024 * 1024);
    var extensoesPermitidas = /(.pdf)$/i;
    const limSize = 10;
    if ((sizeFile <= limSize) && (extensoesPermitidas.exec(this.file.name))) {
      if (event.target.files && event.target.files[0]) {
        var reader = new FileReader();
        reader.onload = (event: any) => {
          this.localUrl = event.target.result;
        }
        reader.readAsDataURL(event.target.files[0]);
        this.uploadFile(comp[0].id);
      }
    } else {
      alert("Verifique o tipo / tamanho do ficheiro");
    }
  }

  uploadFile(id: any) {
    if (this.file != undefined) {
      this.compService.uploadFile(this.file, id).subscribe(data => {
        if (data != null) {
          alert("Upload efetuado!");
          var elemento = document.getElementById(id);
          this.load();
        }

      },
        err => {
          console.error(err);
        }
      )
    } else {
      alert("Selecione um arquivo!")
    }
  }

  load() {
    location.reload()
  }

  search(url: any, imgName: any) {
    window.open(url + imgName, '_blank',
      `margin: auto;
      width: 50%;
      padding: 10px;
      text-align: center;
      border: 3px solid green;
      `);

  }

  download(url: any, imgName: any) {
    const fileName = new Blob([imgName], { type: 'application/pdf;base64' });
    const blob = window.URL.createObjectURL(fileName);
    const link = document.createElement('a');
    link.href = blob;
    link.download = imgName;
    link.click();
  }

  onDelete(id: any) {
    this.deleteModalRef = this.modalService.show(this.deleteModal, { class: 'modal-sm' });
  }

  confirmDelete(id: any) {
    this.compService.delFile(id)
    //this.compService.deleteFile(id);
    this.deleteModalRef?.hide();
  }

  declineDelete() {
    this.deleteModalRef?.hide();
  }

  openModalWithComponent(ident: any) {
    this.modalService.show(CheckDocumentsComponent);
  }

  onClick(e) {
    console.log(e);
    switch (e) {
      case null:
        this.comerciante = 'fas fa-circle icone-menu-secundario';
        this.comprovantes = 'far fa-circle icone-menu-secundario-inactivo';
        this.intervenientes = 'far fa-circle icone-menu-secundario-inactivo';
        this.lojas = 'far fa-circle icone-menu-secundario-inactivo';
        this.oferta = 'far fa-circle icone-menu-secundario-inactivo';
        this.info = 'far fa-circle icone-menu-secundario-inactivo';
        break;

      case "COMERCIANTE":
        this.comerciante = 'fas fa-circle icone-menu-secundario';
        this.comprovantes = 'far fa-circle icone-menu-secundario-inactivo';
        this.intervenientes = 'far fa-circle icone-menu-secundario-inactivo';
        this.lojas = 'far fa-circle icone-menu-secundario-inactivo';
        this.oferta = 'far fa-circle icone-menu-secundario-inactivo';
        this.info = 'far fa-circle icone-menu-secundario-inactivo';
        break;

      case "COMPROVATIVOS":
        this.comerciante = 'far fa-circle icone-menu-secundario-inactivo';
        this.comprovantes = 'fas fa-circle icone-menu-secundario';
        this.intervenientes = 'far fa-circle icone-menu-secundario-inactivo';
        this.lojas = 'far fa-circle icone-menu-secundario-inactivo';
        this.oferta = 'far fa-circle icone-menu-secundario-inactivo';
        this.info = 'far fa-circle icone-menu-secundario-inactivo';
        break;

      case "INTERVENIENTES":
        this.comerciante = 'far fa-circle icone-menu-secundario-inactivo';
        this.comprovantes = 'far fa-circle icone-menu-secundario-inactivo';
        this.intervenientes = 'fas fa-circle icone-menu-secundario';
        this.lojas = 'far fa-circle icone-menu-secundario-inactivo';
        this.oferta = 'far fa-circle icone-menu-secundario-inactivo';
        this.info = 'far fa-circle icone-menu-secundario-inactivo';
        break;

      case "LOJAS":
        this.comerciante = 'far fa-circle icone-menu-secundario-inactivo';
        this.comprovantes = 'far fa-circle icone-menu-secundario-inactivo';
        this.intervenientes = 'far fa-circle icone-menu-secundario-inactivo';
        this.lojas = 'fas fa-circle icone-menu-secundario';
        this.oferta = 'far fa-circle icone-menu-secundario-inactivo';
        this.info = 'far fa-circle icone-menu-secundario-inactivo';
        break;

      case "OFERTA COMERCIAL":
        this.comerciante = 'far fa-circle icone-menu-secundario-inactivo';
        this.comprovantes = 'far fa-circle icone-menu-secundario-inactivo';
        this.intervenientes = 'far fa-circle icone-menu-secundario-inactivo';
        this.lojas = 'far fa-circle icone-menu-secundario-inactivo';
        this.oferta = 'fas fa-circle icone-menu-secundario';
        this.info = 'far fa-circle icone-menu-secundario-inactivo';
        break;

      case "INFO DECLARATIVA":
        this.comerciante = 'far fa-circle icone-menu-secundario-inactivo';
        this.comprovantes = 'far fa-circle icone-menu-secundario-inactivo';
        this.intervenientes = 'far fa-circle icone-menu-secundario-inactivo';
        this.lojas = 'far fa-circle icone-menu-secundario-inactivo';
        this.oferta = 'far fa-circle icone-menu-secundario-inactivo';
        this.info = 'fas fa-circle icone-menu-secundario';
        break;

    }

  }

}



