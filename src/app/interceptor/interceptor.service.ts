import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators'
import { AuthService } from '../services/auth.service';

@Injectable()
export class Interceptor implements HttpInterceptor {
  isRefreshing: boolean = false;

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

    return next.handle(request).pipe(
      catchError((error) => {
        if (
          error instanceof HttpErrorResponse &&
          !request.url.includes('/token') &&
          error.status === 401
        ) {
          return this.handle401Error(request, next);
        }

        return throwError(() => error);
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      localStorage.removeItem('auth');
      this.authService.reset();
    }

    return next.handle(request);
  }
}