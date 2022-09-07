import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  constructor(private logger : NGXLogger) {}

  request(method:string, url: string, header: string, body:string, messageId: string ){
    this.logger.info(`${method} request made to ${url}`, "int", method, url, header, body, messageId, "");
  }

  responseCustom(url: string, header: string, body:string, messageId: string, status: string  ){
    this.logger.info(`Response recieved from ${url} with status code ${status}`, "int", "", url, header, body, messageId, status);
  }

  responseError(error: any, messageId: string){
    this.responseCustom(error.url, JSON.stringify(error.headers.headers), error.message, messageId, error.status.toString());
  }

  response(response: HttpResponse<any>, messageId: string ){
    this.responseCustom(response.url, JSON.stringify(response.headers), JSON.stringify(response.body), messageId, response.status.toString())
  }

  exception(exception:string, context:string, description: string){
    this.logger.error(description, "app", exception, context);
  }

  trace(description: any, messageId: string = ""){
    this.logger.trace(description, "app", "", "", messageId);
  }

  info(description: any, messageId: string = ""){
    this.logger.info(description, "app", "", "", messageId);
  }

  debug(description: any, messageId: string = ""){
    this.logger.debug(description, "app", "", "", messageId);
  }

  error(description: any, error?: Error, messageId: string = ""){
    this.logger.error(description, "app", error.name || "", error.stack || "", messageId);
  }
}