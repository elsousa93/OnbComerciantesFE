import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Process } from './process.interface';
import { FormGroup, FormControl, NgForm } from '@angular/forms';
import { ProcessService } from './process.service';


@Component({
  selector: 'app-process',
  templateUrl: './process.component.html',
  styleUrls: ['./process.component.css']
})
export class ProcessComponent implements OnInit {

  public allProcesses: Process[] = [];
  public allSuccessProcesses: Process[] = [];
  public allIncompletedProcesses: Process[] = [];

  constructor(private router: ActivatedRoute,
    private http: HttpClient, @Inject('BASE_URL')
    private baseUrl: string, private route: Router,
    private ProcessService: ProcessService) {

    this.ngOnInit();

    ProcessService.getAllProcessSubmissions("olaa").subscribe(result => {
      this.allProcesses = result;
    });

    ProcessService.getAllSuccessSubmissions("olaa").subscribe(result => {
      this.allSuccessProcesses = result;
    });

    ProcessService.getAllIncompletedSubmissions("olaa").subscribe(result => {
      this.allIncompletedProcesses = result;
    });

    //http.get<Process[]>(baseUrl + 'BEProcess/GetAllProcesses/ghjkl').subscribe(result => {
    //  this.allProcesses = result;
    //  console.log(this.allProcesses);
    //  }, error => console.error(error));
    
  }

  ngOnInit(): void {
  }

}
