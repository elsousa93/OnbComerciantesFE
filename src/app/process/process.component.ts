import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Process } from './process.interface';
import { ProcessService } from './process.service';


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

  constructor(private route: Router,
    private ProcessService: ProcessService) {

    ProcessService.getAllProcessSubmissions("1").subscribe(result => {
      this.allProcesses = result;
    });

    ProcessService.getAllSuccessSubmissions("1").subscribe(result => {
      this.allSuccessProcesses = result;
    });

    ProcessService.getAllIncompletedSubmissions("2").subscribe(result => {
      this.allIncompletedProcesses = result;
    });
  }

  redirectToMoreInformation(id) {
    this.route.navigate(['/acceptance/', id]);
  }

  ngOnInit(): void {
  }
}