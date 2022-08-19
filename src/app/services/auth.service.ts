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
  private authenticated = new BehaviorSubject(false);

  currentUser = this.dataSource.asObservable();
  hasAuthenticated = this.authenticated.asObservable();

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

  reset() {
    this.dataSource = new BehaviorSubject(this.user);
    this.authenticated.next(false);
  }

  constructor(private router: Router) {
    var auth = localStorage.getItem("auth");

    console.log("auth: ", auth);

    if (auth !== undefined && auth !== null && auth !== '') {
      this.changeUser(JSON.parse(auth));
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
