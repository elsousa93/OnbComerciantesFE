import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../token.service';
import { User } from '../userPermissions/user';
import { getMenuPermissions, role, roles, UserPermissions } from '../userPermissions/user-permissions';


@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {

  authForm: FormGroup;


  //Informação das tabelas
  roles: role[] = roles; //roles é uma const

  constructor(private token: TokenService, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    console.log("roles: ", this.roles);
    this.generateAuthForm();
  }

  submit() {
    console.log(this.authForm);

    if (this.authForm.invalid) {
      console.log("inválido");
      return;
    }

    var user: User = {};

    user.userName = this.authForm.get('userName').value;
    user.bankName = this.authForm.get('bankName').value;
    user.bankLocation = this.authForm.get('bankLocation').value;
    user.permissions = this.authForm.get('role').value;
    user.authTime = (new Date()).toISOString();

    this.authService.changeUser(user);

    console.log(this.authService);

    this.router.navigate(['/']);
  }

  openDiv: boolean = false;
  getsToken: any  = null;
  getAccessToken() {
    this.openDiv = true;
    this.getsToken = this.token.getAccessToken();
    console.log(this.getsToken);

  }

  generateAuthForm() {
    this.authForm = new FormGroup({
      userName: new FormControl('', Validators.required),
      bankName: new FormControl('', Validators.required),
      bankLocation: new FormControl('', Validators.required),
      role: new FormControl('', Validators.required)
    })
  }

}
