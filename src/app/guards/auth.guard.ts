import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service'
import { NGXLogger } from 'ngx-logger';
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private logger : NGXLogger, private router: Router, private cookie: CookieService) { }
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
    this.logger.debug(this.cookie.get("jwToken"));
    this.logger.debug(this.cookie.get("jwToken") === "undefined");
    if (this.cookie.get("jwToken") != "" && this.cookie.get("jwToken") !== "undefined" && this.cookie.get("jwToken") !== null) {
      this.logger.debug("Sessão validada")
      status = true;
    }
    else {
      this.logger.debug("Sessão Não validada")
      status = false;
    }
    return status;
  }
}
