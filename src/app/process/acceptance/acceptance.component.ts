import { HttpClient } from '@angular/common/http';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Submission } from '../submission.interface';
import { ProcessService } from '../process.service';
import { ComprovativosService } from '../../comprovativos/services/comprovativos.services';
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-acceptance',
  templateUrl: './acceptance.component.html',
  styleUrls: ['./acceptance.component.css']
})
export class AcceptanceComponent implements OnInit {

  processId: string = this.router.snapshot.params['submissionID'];
  //public documents: Process[] = [];

  process: Submission;
  isVisible: any;
  isSelected: boolean = true;
  //file?: File;
  files: File[] = [];
  localUrl: any;
  fileName: any;

  downloadPath: string = "./write.pdf";
  download: string = "write.pdf";


  constructor(private router: ActivatedRoute,
    private http: HttpClient, @Inject('BASE_URL')
    private baseUrl: string, private route: Router,
    private ProcessService: ProcessService,
    private compService: ComprovativosService  ) {

    //this.process = this.ProcessService;
    this.ngOnInit();

    this.ProcessService.getSubmissionByID(this.processId).subscribe(result => {
      console.log(this.processId);
      console.log(result);
      this.process = result;
      
    });


    //temos de ir buscar um processo e também os os representantes da empresa

    /*http.get<Process>(baseUrl + 'BEProcess/GetAllProcesses').subscribe(result => {
      this.process = result;
      console.log(this.process);
    }, error => console.error(error));*/

  }

  ngOnInit(): void {
    console.log(this.isSelected);
  }

  removeFile(file: any) {
    //return this.files.filter(function (ele) {
    //  console.log(ele);
    //  console.log(file);
    //  if (ele.name === file.name) {
    //    console.log("sim");
    //  }
    //  return ele.name !== file.name;
    //});

    const index = this.files.indexOf(file);
    console.log(index);
    if (index > -1) {
      this.files.splice(index, 1);
    }
  }

  selectFile(event: any, comp: any) {
    console.log(event);
    //this.file = <File>event.target.files[0];
    //const sizeFile = this.file.size / (1024 * 1024);
    //var file = <File>event.target.files[0];
    //const sizeFile = file.size / (1024 * 1024);
    //var extensoesPermitidas = /(.pdf)$/i;
    //const limSize = 10;
    //if ((sizeFile <= limSize) && (extensoesPermitidas.exec(file.name))) {
    //  if (event.target.files && event.target.files[0]) {
    //    var reader = new FileReader();
    //    reader.onload = (event: any) => {
    //      this.localUrl = event.target.result;
    //    }
    //    reader.readAsDataURL(event.target.files[0]);
    //    this.files.push(file);
    //    //this.uploadFile(comp[0].processNumber);
    //  }
    //} else {
    //  alert("Verifique o tipo / tamanho do ficheiro");
    //}

    const files = <File[]>event.target.files;
    console.log(files);
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      const sizeFile = file.size / (1024 * 1024);
      var extensoesPermitidas = /(.pdf)$/i;
      const limSize = 10;
      if ((sizeFile <= limSize) && (extensoesPermitidas.exec(file.name))) {
        if (event.target.files && files[i]) {
          var reader = new FileReader();
          reader.onload = (event: any) => {
            this.localUrl = event.target.result;
          }
          reader.readAsDataURL(files[i]);
          this.files.push(file);
          //this.uploadFile(comp[0].processNumber);
        }
      } else {
        alert("Verifique o tipo / tamanho do ficheiro");
      }
    }
  }

  uploadFiles() {
    console.log("ola");
    for (var i = 0; i < this.files.length; i++) {
      this.compService.uploadFile(this.files[i], 999).subscribe(data => {
        if (data != null) {
          console.log("upload feito com sucesso");
        }
      },
        err => {
          console.error(err);
        })
    }

    //if (this.file != undefined) {
    //  this.compService.uploadFile(this.file, 999).subscribe(data => {
    //    if (data != null) {
    //      alert("Upload efetuado!");
    //      var elemento = document.getElementById(id);
    //      this.load();
    //    }
    //  },
    //    err => {
    //      console.error(err);
    //    }
    //  )
    //} else {
    //  alert("Selecione um arquivo!")
    //}
  }

  load() {
    location.reload()
  }

  downloadFile(element) {
    console.log(element);
  }

}
