import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Bank } from '../store/IStore.interface';
import { TableInfoService } from '../table-info/table-info.service';
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
  banks: Bank[];

  constructor(private token: TokenService, private authService: AuthService, private router: Router, private tableInfo: TableInfoService) { }

  ngOnInit(): void {
    this.generateAuthForm();

    this.authService.currentUser.subscribe(result => {
    })

    this.tableInfo.GetBanks().subscribe(result => {
      this.banks = result;
      this.banks = this.banks.sort((a, b) => a.description > b.description ? 1 : -1); //ordenar resposta
    });

  }

  submit() {
    console.log("Form da autenticação: " + this.authForm);

    if (this.authForm.invalid) {
      return;
    }

    var user: User = {};

    user.userName = this.authForm.get('userName').value;
    user.bankName = this.authForm.get('bankName').value;
    user.bankLocation = this.authForm.get('bankLocation').value;
    user.permissions = this.authForm.get('role').value;
    user.authTime = (new Date()).toLocaleString('pt-PT');

    this.token.getLoginToken().then(result => {
      user.loginToken = result.access_token;
      this.authService.changeUser(user);
    }).then(res => {
      this.token.getAccessToken().then(result => {
        user.token = result.access_token;
        this.authService.changeUser(user);
        this.router.navigate(['/']);
      });
    });
  }

  noToken() {
    console.log(this.authForm);

    //if (this.authForm.invalid) {
    //  return;
    //}

    var user: User = {};

    user.userName = this.authForm.get('userName').value;
    user.bankName = this.authForm.get('bankName').value;
    user.bankLocation = this.authForm.get('bankLocation').value;
    user.permissions = UserPermissions.ADMIN;
    user.authTime = (new Date()).toLocaleString('pt-PT');
    user.token = ''
    
    this.authService.changeUser(user);

    console.log("Form da autenticação: " + this.authService);

    this.router.navigate(['/']);
  
  }

  openDiv: boolean = false;
  getsToken: any  = null;
  getAccessToken() {
    this.openDiv = true;
    this.getsToken = this.token.getAccessToken();
    console.log("Token de acesso: " + this.getsToken);

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
