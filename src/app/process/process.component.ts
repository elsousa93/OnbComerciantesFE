import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Submission } from './submission.interface';
import { FormGroup, FormControl, NgForm } from '@angular/forms';
import { ProcessService } from './process.service';


@Component({
  selector: 'app-process',
  templateUrl: './process.component.html',
  styleUrls: ['./process.component.css']
})
export class ProcessComponent implements OnInit {

  public allProcesses: Submission[] = [];
  public allSuccessProcesses: Submission[] = [];
  public allIncompletedProcesses: Submission[] = [];

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
  }

  redirectToMoreInformation(id) {
    this.route.navigate(['/acceptance/', id]);
  }

  ngOnInit(): void {
  }

}
