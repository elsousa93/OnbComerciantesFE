import { HttpClient } from '@angular/common/http';
import { HostListener } from '@angular/core';
import { ElementRef, Renderer2 } from '@angular/core';
import { Component, Inject, Input, OnInit, VERSION, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { numbers } from '@material/checkbox';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { take } from 'rxjs';
import { ajax } from 'rxjs/ajax';
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

  file?: File;
  localUrl: any;
  fileName: any;
  urlImage: string | any;
  mostrar: boolean = false;
  deleteModalRef: BsModalRef | undefined;

  @ViewChild('deleteModal') deleteModal;
  constructor(public http: HttpClient, @Inject('BASE_URL') baseUrl: string, private router: ActivatedRoute, private compService: ComprovativosService, private renderer: Renderer2,
   private modalService: BsModalService) {
    http.get<IComprovativos[]>(baseUrl + `BEComprovativos/`).subscribe(result => {
      this.comprovativos = result;
    }, error => console.error(error));
  }

  ngOnInit(): void {
    
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
    }else {
      alert("Selecione um arquivo!")
    }
  }

  load() {
    location.reload()
  }
  
  search(url: any, imgName: any){
    window.open(url+imgName, '_blank' , 
      `margin: auto;
      width: 50%;
      padding: 10px;
      text-align: center;
      border: 3px solid green;
      `);
    
  }

  download(url: any, imgName: any){
    const fileName = new Blob([imgName], { type: 'application/pdf;base64'});
    const blob = window.URL.createObjectURL(fileName);
    const link = document.createElement('a');
    link.href = blob;
    link.download = imgName;
    link.click();
  }

  onDelete(id: any){
    this.deleteModalRef =this.modalService.show(this.deleteModal, {class: 'modal-sm'});
  }
  
  confirmDelete(id: any) {
    this.compService.delFile(id)
    //this.compService.deleteFile(id);
    this.deleteModalRef?.hide();
  }
 
  declineDelete(){
    this.deleteModalRef?.hide();
  }
  
  openModalWithComponent(ident: any) {
    this.modalService.show(CheckDocumentsComponent);
  }
}



