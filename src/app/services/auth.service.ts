import { DataSource } from '@angular/cdk/collections';
import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ILogin } from 'src/app/login/ILogin.interface';
import { User } from '../userPermissions/user';


@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {

  user: User = {
    userName: '',
    bankLocation: '',
    bankName: '',
    permissions: null
  }

  private dataSource = new BehaviorSubject(this.user);
  private bankLocation = new BehaviorSubject(this.user.bankLocation);
  private authenticated = new BehaviorSubject(false);
  private wantsLogin = new BehaviorSubject(false);

  currentUser = this.dataSource.asObservable();
  hasAuthenticated = this.authenticated.asObservable();
  doLogin = this.wantsLogin.asObservable();

  changeUser(user: User) {
    this.dataSource.next(user);
    this.authenticated.next(true);
    console.log("user template: ", this.user);
  }

  GetToken() {
    return this.dataSource.getValue().token;
  }

  GetLoginToken() {
    return this.dataSource.getValue().loginToken;
  }

  GetCurrentUser() {
    return this.dataSource.getValue();
  }

  GetBankLocation(){
    return this.bankLocation.getValue();
  }

  GetBank() {
    return this.dataSource.getValue().bankName;
  }

  hasUser(user: User) {
    return !(user === this.user);
  }

  reset() {
    this.dataSource.next(this.user);
    this.authenticated.next(false);
  }

  constructor(private router: Router) {
    var auth = localStorage.getItem("auth");

    console.log("auth: ", auth);

    if (auth !== undefined && auth !== null && auth !== '') {
      var user = JSON.parse(auth);

      if (this.hasUser(user))
        this.changeUser(JSON.parse(auth));
      else
        console.log("vazio");
    }
  }

  ngOnDestroy(): void {
    console.log("destruido");
    localStorage.setItem("auth", JSON.stringify(this.GetCurrentUser()));
  }

  logout(): void {
    localStorage.setItem('isLoggedIn', 'false');
    localStorage.removeItem('token');
  }
}
