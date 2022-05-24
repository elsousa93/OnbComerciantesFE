import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Process } from './process.interface';
import { FormGroup, FormControl, NgForm } from '@angular/forms';


@Component({
  selector: 'app-process',
  templateUrl: './process.component.html',
  styleUrls: ['./process.component.css']
})
export class ProcessComponent implements OnInit {

  public allProcesses: Process[] = [];

  constructor(private router: ActivatedRoute,
    private http: HttpClient, @Inject('BASE_URL')
    private baseUrl: string, private route: Router) {

    this.ngOnInit();

    http.get<Process[]>(baseUrl + 'BEProcess/GetAllProcesses').subscribe(result => {
      this.allProcesses = result;
      console.log(this.allProcesses);
      }, error => console.error(error));

    
  }

  ngOnInit(): void {
  }

}
