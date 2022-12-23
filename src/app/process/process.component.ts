import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Process } from './process.interface';
import { FormGroup, FormControl, NgForm } from '@angular/forms';
import { ProcessService } from './process.service';
import { Configuration, configurationToken } from '../configuration';
import { LoggerService } from 'src/app/logger.service';


@Component({
  selector: 'app-process',
  templateUrl: './process.component.html',
  styleUrls: ['./process.component.css']
})
export class ProcessComponent implements OnInit {
  private baseUrl: string;

  public allProcesses: Process[] = [];
  public allSuccessProcesses: Process[] = [];
  public allIncompletedProcesses: Process[] = [];

  constructor(private logger : LoggerService, private router: ActivatedRoute,
    private http: HttpClient,
    private route: Router,
    private ProcessService: ProcessService) {


    this.ngOnInit();

    ProcessService.getAllProcessSubmissions("1").subscribe(result => {
      this.allProcesses = result;
    });

    ProcessService.getAllSuccessSubmissions("1").subscribe(result => {
      this.allSuccessProcesses = result;
    });

    ProcessService.getAllIncompletedSubmissions("2").subscribe(result => {
      this.allIncompletedProcesses = result;
    });

    //http.get<Process[]>(baseUrl + 'BEProcess/GetAllProcesses/ghjkl').subscribe(result => {
    //  this.allProcesses = result;
    //  this.logger.debug(this.allProcesses);
    //  }, error => console.error(error));
    
  }

  redirectToMoreInformation(id) {

    this.route.navigate(['/acceptance/', id]);

  }

  ngOnInit(): void {
  }

}
