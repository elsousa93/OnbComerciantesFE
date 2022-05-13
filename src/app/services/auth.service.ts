import { Injectable } from '@angular/core';
import { ILogin } from 'src/app/login/ILogin.interface';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor() { }
  logout(): void {
    localStorage.setItem('isLoggedIn', 'false');
    localStorage.removeItem('token');
  }
}
