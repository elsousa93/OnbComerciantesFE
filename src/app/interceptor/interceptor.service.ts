import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class Interceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {

  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.headers.get('Authorization') == null) {
      request = request.clone({
        setHeaders: {
          Authorization: 'Bearer ' + this.authService.GetToken()
        }
      });
    }
    return next.handle(request);
  }

}