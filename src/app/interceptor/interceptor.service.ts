import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators'
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class Interceptor implements HttpInterceptor {
  isRefreshing: boolean = false;

  constructor(private authService: AuthService, private snackBar: MatSnackBar, private translate: TranslateService) {

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
        let errorMsg = '';
        if (error instanceof HttpErrorResponse && !request.url.includes('/token') && error.status === 401) {
          return this.handle401Error(request, next);
        }
        if (error.error instanceof ErrorEvent) {
          errorMsg = 'Error: ' + error.error.message;
          this.snackBar.open(errorMsg, 'Error', { duration: 4000, panelClass: ['snack-bar'] });
        } else {
          if (error.status === 500) {
            this.getErrorMsg(error.status, null);
          }
          this.getErrorMsg(error.status, error?.error?.errors);
        }
        return throwError(() => error);
      })
    );
  }

  private getErrorMsg(status: number, errors: any) {
    let errorMsg = '';
    errorMsg = errorMsg + this.translate.instant('errorMessages.startMsg');
    errorMsg = errorMsg + this.translate.instant('errorMessages.' + status);
    if (status === 400) {
      for (let key of Object.keys(errors)) {
        let errorList = '';
        let detail = errors[key];
        detail.forEach(err => {
          errorList = errorList + err + ",\r\n";
        });
        errorMsg = errorMsg + " " + key + ": " + errorList;
      }
    }
    this.snackBar.open(errorMsg, '', { duration: 4000, panelClass: ['snack-bar'] });
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
