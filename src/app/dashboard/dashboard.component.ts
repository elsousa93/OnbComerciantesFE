import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CookieService } from 'ngx-cookie-service'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  public id: string | null = "";

  constructor(private router: Router, private authService: AuthService, private cookie: CookieService) { }

  ngOnInit() {
    this.id = localStorage.getItem('token');
    console.log(this.id);  
  }

  logout() {
    console.log('logout');
    this.authService.logout();
    window.location.reload();
    this.cookie.delete("jwToken")
    this.router.navigate(['/login']);
   
  }

}
