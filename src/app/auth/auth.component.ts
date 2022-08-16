import { Component, OnInit } from '@angular/core';
import { TokenService } from '../token.service';


@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {

  constructor(private token: TokenService) { }

  ngOnInit(): void {
  }

  openDiv: boolean = false;
  getsToken: any  = null;
  getAccessToken() {
    this.openDiv = true;
    this.getsToken = this.token.getAccessToken();
    console.log(this.getsToken);

  }

}
