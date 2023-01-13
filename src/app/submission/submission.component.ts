import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ISubmission } from './ISubmission.interface';
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

  constructor(private logger: LoggerService, private http: HttpClient) {

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

  ngOnInit(): void {
    this.logger.debug("Submissions List : " + this.submissionsList[0]);

  }
}
