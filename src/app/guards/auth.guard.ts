import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service'
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private cookie: CookieService) { }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.isLoggedIn()) {
      return true;
    }
    // navigate to login page as user is not authenticated      
    this.router.navigate(['/login']);
    return false;
  }
  public isLoggedIn(): boolean {
    let status = false;
    console.log(this.cookie.get("jwToken"));
    console.log(this.cookie.get("jwToken") === "undefined");
    if (this.cookie.get("jwToken") != "" && this.cookie.get("jwToken") !== "undefined" && this.cookie.get("jwToken") !== null) {
      console.log("Sessão validada")
      status = true;
    }
    else {
      console.log("Sessão Não validada")
      status = false;
    }
    return status;
  }
}
