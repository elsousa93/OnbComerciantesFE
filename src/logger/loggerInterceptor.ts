import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpEventType
} from '@angular/common/http';
import { tap } from 'rxjs/operators'; 
import { Observable } from 'rxjs/internal/Observable';
import { LoggerService } from 'src/app/logger.service';

@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
    private messageId = "";
    constructor(private logger: LoggerService){

    }
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!request.url.match(/(Acquiring)|(Outbound)/i)){
            return next.handle(request);
        }
        this.logger.requestObj(request);
        return next.handle(request).pipe(
        tap(
            {next: (event) => {
                if (event.type == HttpEventType.Response) {
                    this.logger.responseObj(event as HttpResponse<any>, this.messageId)
                }
            }, error: (error) =>{
                this.logger.responseError(error, this.messageId);
            }
        }));
  }
}