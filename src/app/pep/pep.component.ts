import { Component, Inject, OnInit, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IPep } from './IPep.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, NgForm } from '@angular/forms';

@Component({
  selector: 'app-pep',
  templateUrl: './pep.component.html',
  styleUrls: ['./pep.component.css']
})
export class PepComponent implements OnInit {


  newPep: IPep = {

  } as IPep

  PepForm!: FormGroup;


  constructor(private router: ActivatedRoute,
    private http: HttpClient, @Inject('BASE_URL')
    private baseUrl: string, private route: Router) { }

  ngOnInit(): void {
  }


  submit(form : any) {

    //Post a Pep given the Client number
    this.http.post<IPep>(this.baseUrl + 'bepep/AddPep/'
      + this.newPep + '/edit', this.newPep).subscribe(result => {
        console.log("EditStakeholderById");
        console.log(result);
      }, error => console.error(error));

  }

  submitPepRelated(form: any) { }

}
