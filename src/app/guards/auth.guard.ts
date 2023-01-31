import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service'
import { LoggerService } from 'src/app/logger.service';
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private logger: LoggerService, private router: Router, private cookie: CookieService) { }
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
    this.logger.info(this.cookie.get("jwToken"));
    this.logger.info(this.cookie.get("jwToken") === "undefined");
    if (this.cookie.get("jwToken") != "" && this.cookie.get("jwToken") !== "undefined" && this.cookie.get("jwToken") !== null) {
      this.logger.info("Valid session")
      status = true;
    }
    else {
      this.logger.info("Non valid session");
      status = false;
    }
    return status;
  }
}
