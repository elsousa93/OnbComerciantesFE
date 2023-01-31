import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoggerService } from '../logger.service';
import { AuthService } from '../services/auth.service';
import { Bank } from '../store/IStore.interface';
import { TableInfoService } from '../table-info/table-info.service';
import { TokenService } from '../token.service';
import { User } from '../userPermissions/user';
import { role, roles, UserPermissions } from '../userPermissions/user-permissions';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {

  authForm: FormGroup;
  tokenSubscription = new Subscription();
  timeout;

  //Informação das tabelas
  roles: role[] = roles; //roles é uma const
  banks: Bank[];

  constructor(private token: TokenService, private authService: AuthService, private router: Router, private tableInfo: TableInfoService, private logger: LoggerService) { }

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
    this.logger.debug("Login form: " + this.authForm);
    if (this.authForm.invalid) {
      return;
    }

    var user: User = {};

    user.userName = this.authForm.get('userName').value;
    user.bankName = this.authForm.get('bankName').value;
    user.bankLocation = this.authForm.get('bankLocation').value;
    user.permissions = this.authForm.get('role').value;
    user.authTime = (new Date()).toLocaleString('pt-PT');

    //fazer um if para quando o utilizador for unicre ou banca conseguir realizar o login neste portal, caso contrario não deve ser possível

    this.token.getLoginToken(user.userName, user.bankName, user.bankLocation).then(result => {
      this.logger.info("Get login token result: " + result);
      user.token = result.access_token;

      this.token.getLoginTokenInfo(user.token).then(res => {
        user.userName = res.name;
        user.bankName = res["ext-bank"];
        user.bankLocation = res["ext-bankLocation"];
        var newDate = new Date(res.exp * 1000);
        this.timeout = newDate.getTime() - new Date().getTime();
        this.expirationCounter(this.timeout);
        this.authService.changeUser(user);
        this.router.navigate(['/']);
      });
    });
  }

  noToken() {
    var user: User = {};
    user.userName = this.authForm.get('userName').value;
    user.bankName = this.authForm.get('bankName').value;
    user.bankLocation = this.authForm.get('bankLocation').value;
    user.permissions = UserPermissions.ADMIN;
    user.authTime = (new Date()).toLocaleString('pt-PT');
    user.token = ''
    this.authService.changeUser(user);
    this.router.navigate(['/']);
  }

  openDiv: boolean = false;
  getsToken: any = null;

  getAccessToken() {
    this.openDiv = true;
    this.getsToken = this.token.getAccessToken();
  }

  generateAuthForm() {
    this.authForm = new FormGroup({
      userName: new FormControl('', Validators.required),
      bankName: new FormControl('', Validators.required),
      bankLocation: new FormControl('', Validators.required),
      role: new FormControl('', Validators.required)
    })
  }

  expirationCounter(timeout) {
    setTimeout(() => {
      this.logger.info('Token expired');
      this.logout();
    }, timeout)
  }

  logout() {
    localStorage.removeItem('auth');
    this.authService.reset();
  }
}
