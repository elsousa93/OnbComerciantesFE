import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse, HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators'
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import * as jsonData from '../../assets/errorMapping.json';
import { LoadingService } from '../loading.service';

@Injectable()
export class Interceptor implements HttpInterceptor {
  isRefreshing: boolean = false;
  private url: string = 'assets/errorMapping.json';
  private data: any = jsonData;
  totalRequests = 0;
  completedRequests = 0;
  constructor(private authService: AuthService, private snackBar: MatSnackBar, private translate: TranslateService, private http: HttpClient, private loader: LoadingService) {

  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.headers.get('Authorization') == null) {
      request = request.clone({
        setHeaders: {
          Authorization: 'Bearer ' + this.authService.GetToken()
        }
      });
    }

    if (request.url !== this.url) {
      this.loader.show();
      this.totalRequests++;
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
              this.getErrorMsg(error.status, null, request.url);
            }
            this.getErrorMsg(error.status, error?.error?.errors, request.url);
          }

          return throwError(() => error);
        }),
        finalize(() => {
          this.completedRequests++;
          if (this.completedRequests === this.totalRequests) {
            this.loader.hide();
            this.completedRequests = 0;
            this.totalRequests = 0;
          }
        })
      );
    }

  }

  private getErrorMsg(status: number, errors: any, url: string) {
    let currentPage = location.href.split("/")[5];
    let errorMsg = '';
    errorMsg = errorMsg + this.translate.instant('errorMessages.startMsg') + " ";
    if (status === 404) {
      if (url.includes('/merchant') && !url.includes('/shop') && !url.includes('/equipment')) {
        this.handle404Error("merchant", currentPage, url, errorMsg);
      }
      if (url.includes('/stakeholder')) {
        this.handle404Error("stakeholder", currentPage, url, errorMsg);
      }
      if (url.includes('/merchant') && url.includes('/shop') && !url.includes('/equipment')) {
        this.handle404Error("shop", currentPage, url, errorMsg);
      }
      if (url.includes('/merchant') && url.includes('/shop') && url.includes('/equipment')) {
        this.handle404Error("equipment", currentPage, url, errorMsg);
      }
      if (url.includes('/document')) {
        this.handle404Error("document", currentPage, url, errorMsg);
      }
      if (url.includes('/address') && !url.includes('/shoppingcenter')) {
        this.handle404Error("postalCode", currentPage, url, errorMsg);
      }
    } else {
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
  }

  private handle404Error(entity: string, currentPage: string, url: string, errorMsg: string) {
    if (currentPage == "clientbyid") {
      currentPage = "client";
    }
    this.data["404"][entity][currentPage].forEach(value => {
      var splitAPI = value.api.split("/"); //api process - merchant -
      var splitUrl = url.split("/"); //[4] se fizermos o split por "/" o 4º index terá sempre o valor 'api'
      for (var i = 0; i < splitAPI.length; i++) {
        if (splitAPI[i] !== splitUrl[4 + i]) {
          if (splitAPI[i] !== "-") {
            return;
          }
        }
        if (i == splitAPI.length - 1) {
          errorMsg = errorMsg + this.translate.instant('errorMessages.404.' + value.error);
          this.snackBar.open(errorMsg, '', { duration: 4000, panelClass: ['snack-bar'] });
        }
      }
    });
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
