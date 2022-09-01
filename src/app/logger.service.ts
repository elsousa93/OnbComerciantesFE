import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  constructor(private logger : NGXLogger) {}

  request(method:string, url: string, header: string, body:string, messageId: string ){
    this.logger.info(`${method} request made to ${url}`, "int", header, body, messageId);
  }

  response(method:string, url: string, header: string, body:string, messageId: string, status: string  ){
    this.logger.info(`${method} response recieved from ${url} with status code ${status}`, "int", header, body, messageId, status);
  }

  exception(exception:string, context:string, description: string){
    this.logger.error(description, "app", exception, context);
  }

  trace(description: any){
    this.logger.trace(description, "app");
  }

  info(description: any){
    this.logger.info(description, "app");
  }

  debug(description: any){
    this.logger.debug(description, "app");
  }

  error(description: any, error?: Error){
    this.logger.error(description, "app", error.name, error.stack);
  }
}