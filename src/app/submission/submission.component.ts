import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ISubmission } from './ISubmission.interface';
import { Configuration, configurationToken } from '../configuration';
import { LoggerService } from 'src/app/logger.service';

@Component({
  selector: 'app-submission',
  templateUrl: './submission.component.html',
  styleUrls: ['./submission.component.css']
})
export class SubmissionComponent implements OnInit {
  private baseUrl: string;

  isubmission: ISubmission;
  isTable: boolean = false;

  //Data Source
  public submissionsList: ISubmission[] = [];


  constructor(private logger : LoggerService, private router: ActivatedRoute,
    @Inject(configurationToken) private configuration: Configuration,
    private http: HttpClient, private route: Router) {
    this.baseUrl = configuration.baseUrl;
    this.ngOnInit();
    
   
    http.get<ISubmission>(this.baseUrl + 'BESubmission/').subscribe(result => {
      this.submissionsList.push(result); //Recebe um object
      this.isTable = true;
      this.ngOnInit();
    }, error => console.error(error));

 
  }
  
  get listContents(): Array<ISubmission> {
    this.logger.debug((Object as any).values(this.submissionsList));
    return (Object as any).values(this.submissionsList);
  }



  

  //Converter de Objecto para List - com leitura

  ngOnInit(): void {
    this.logger.debug("Submissions List : " + this.submissionsList[0]);
     // Funciona na consola, mas dá erros 
     // this.submissionsList.forEach(function (value) {
     //   this.logger.debug(value); })
  }

}
