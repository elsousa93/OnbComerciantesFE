
import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
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
  private authenticated = new BehaviorSubject(true); //antes estava a false
  private wantsLogin = new BehaviorSubject(false);
  private expired = new BehaviorSubject(false);

  currentUser = this.dataSource.asObservable();
  hasAuthenticated = this.authenticated.asObservable();
  doLogin = this.wantsLogin.asObservable();
  hasExpired = this.expired.asObservable();

  changeAuthenticated(bool: boolean) {
    this.authenticated.next(bool);
  }

  changeExpired(bool: boolean) {
    this.expired.next(bool);
  }

  changeUser(user: User) {
    this.dataSource.next(user);
    this.authenticated.next(true);
  }

  GetToken() {
    return this.dataSource.getValue().token;
  }

  GetCurrentUser() {
    return this.dataSource.getValue();
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

    if (auth !== undefined && auth !== null && auth !== '') {
      var user = JSON.parse(auth);

      if (this.hasUser(user))
        this.changeUser(JSON.parse(auth));
      else
        console.log("vazio");
    }
  }

  ngOnDestroy(): void {
    localStorage.setItem("auth", JSON.stringify(this.GetCurrentUser()));
  }

  logout(): void {
    localStorage.setItem('isLoggedIn', 'false');
    localStorage.removeItem('token');
  }
}
