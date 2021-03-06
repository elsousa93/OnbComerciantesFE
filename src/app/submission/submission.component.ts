import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ISubmission } from './ISubmission.interface';

@Component({
  selector: 'app-submission',
  templateUrl: './submission.component.html',
  styleUrls: ['./submission.component.css']
})
export class SubmissionComponent implements OnInit {

  isubmission: ISubmission;
  isTable: boolean = false;

  //Data Source
  public submissionsList: ISubmission[] = [];


  constructor(private router: ActivatedRoute,
    private http: HttpClient, @Inject('BASE_URL')
    private baseUrl: string, private route: Router) {
    this.ngOnInit();
     
   
    http.get<ISubmission>(baseUrl + 'BESubmission/').subscribe(result => {
      this.submissionsList.push(result); //Recebe um object
      this.isTable = true;
      this.ngOnInit();
    }, error => console.error(error));

 
  }
  
  get listContents(): Array<ISubmission> {
    console.log((Object as any).values(this.submissionsList));
    return (Object as any).values(this.submissionsList);
  }



  

  //Converter de Objecto para List - com leitura

  ngOnInit(): void {
    console.log("Submissions List : " + this.submissionsList[0]);
     // Funciona na consola, mas dá erros 
     // this.submissionsList.forEach(function (value) {
     //   console.log(value); })
  }

}
