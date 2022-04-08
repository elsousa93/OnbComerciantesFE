import { HttpClient } from '@angular/common/http';
import { ElementRef, Renderer2 } from '@angular/core';
import { Component, Inject, Input, OnInit, VERSION, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { CheckDocumentsComponent } from './check-documents/check-documents.component';
import { IComprovativos } from './IComprovativos.interface';
import { UploadService } from './services/upload.services';


@Component({
  //moduleId: module.id,
  selector: 'app-comprovativos',
  templateUrl: './comprovativos.component.html'
})
export class ComprovativosComponent implements OnInit {
  public comprovativos: IComprovativos[] = [];
  public result: any;

  file?: File;
  localUrl: any;
  fileName: any;
  @ViewChild('delete') deleteButton: ElementRef | any;
  @ViewChild('search') searchButton: ElementRef | any;
  @ViewChild('download') downloadButton: ElementRef | any;
  urlImage: string | any;

  constructor(http: HttpClient, @Inject('BASE_URL') baseUrl: string, private router: ActivatedRoute, private uploadService: UploadService, private renderer: Renderer2, private modalService: BsModalService) {
    http.get<IComprovativos[]>(baseUrl + `BEComprovativos`).subscribe(result => {
      this.comprovativos = result;
      
    }, error => console.error(error));
  }

  ngOnInit(): void {
    console.log(Number(this.router.snapshot.params['id']))
  }
/*
  onSelect(comp: any) {
    this.router.navigate(['/upload', comp.id]);
  }
*/

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
        this.uploadFile();
      }
    } else {
      alert("Verifique o tipo / tamanho do ficheiro");
    }   
  }

  uploadFile() {
    if (this.file != undefined) {
      this.uploadService.uploadFile(this.file).subscribe((data) => {
        if (data != null) {
          //Botão download
          this.downloadButton.nativeElement.style.display = "block";
          this.downloadButton.nativeElement.addEventListener("click", function (name: any) {
            const el = name;
            const fileName = new Blob([data], { type: 'image/jpg' });
            console.log(data.imgName);
            const blob = window.URL.createObjectURL(fileName);
            const link = document.createElement('a');

            console.log(blob);
            link.href = blob;
            link.download = data.imgName;
            link.click();
            window.URL.revokeObjectURL(blob);
            link.remove();
              
          });
          
          //Botão visualizar
          this.searchButton.nativeElement.style.display = 'block';
          this.searchButton.nativeElement.target = '_Blank';
          this.searchButton.nativeElement.href = data.urlImagem;
          
          //Botão apagar
          this.deleteButton.nativeElement.style.display = 'block';
          this.deleteButton.nativeElement.addEventListener("click", function (id: any) {
              location.reload();
          });
          alert("Upload efetuado!")
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
  
  detalhes(id:Number){
    const bsModalRef: BsModalRef = this.modalService.show(CheckDocumentsComponent);
  }
}



