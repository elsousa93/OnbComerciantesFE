import { DataSource } from '@angular/cdk/collections';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ILogin } from 'src/app/login/ILogin.interface';
import { User } from '../userPermissions/user';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

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

  reset() {
    this.dataSource = new BehaviorSubject(this.user);
    this.authenticated.next(false);
  }

  constructor() { }
  logout(): void {
    localStorage.setItem('isLoggedIn', 'false');
    localStorage.removeItem('token');
  }
}
