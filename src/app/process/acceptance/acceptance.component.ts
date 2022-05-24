import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Process } from '../process.interface';

@Component({
  selector: 'app-acceptance',
  templateUrl: './acceptance.component.html',
  styleUrls: ['./acceptance.component.css']
})
export class AcceptanceComponent implements OnInit {

  processId: number = 123456;
  process: Process;
  isVisible: any;
  isSelected: boolean = true;


  constructor(private router: ActivatedRoute,
    private http: HttpClient, @Inject('BASE_URL')
    private baseUrl: string, private route: Router) {

    this.ngOnInit();

    //temos de ir buscar um processo e também os os representantes da empresa

    /*http.get<Process>(baseUrl + 'BEProcess/GetAllProcesses').subscribe(result => {
      this.process = result;
      console.log(this.process);
    }, error => console.error(error));*/

  }

  ngOnInit(): void {
    console.log(this.isSelected);
  }

}
