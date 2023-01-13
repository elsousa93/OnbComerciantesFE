import { HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  constructor(private logger: NGXLogger) { }

  requestObj(request: HttpRequest<any>) {
    this.request(request.method, request.urlWithParams, this.serializeHeaders(request.headers), JSON.stringify(request.body), "");
  }

  request(method: string, url: string, header: string, body: string, messageId: string) {
    this.logger.info(`${method} request made to ${url}`, "int", method, url, header, body, messageId, "");
  }

  response(url: string, header: string, body: string, messageId: string, status: string) {
    this.logger.info(`Response recieved from ${url} with status code ${status}`, "int", "", url, header, body, messageId, status);
  }

  responseError(error: any, messageId: string) {
    this.response(error.url, JSON.stringify(error.headers.headers), error.message, messageId, error.status.toString());
  }

  responseObj(response: HttpResponse<any>, messageId: string) {
    this.response(response.url, JSON.stringify(response.headers), JSON.stringify(response.body), messageId, response.status.toString())
  }

  exception(exception: string, context: string, description: string) {
    this.logger.error(description ?? "", "app", exception, context);
  }

  trace(description: any, messageId: string = "") {
    this.logger.trace(description ?? "", "app", "", this.getContext(), messageId);
  }

  info(description: any, messageId: string = "") {
    this.logger.info(description ?? "", "app", "", this.getContext(), messageId);
  }

  debug(description: any, messageId: string = "") {
    this.logger.debug(description ?? "", "app", "", this.getContext(), messageId);
  }

  error(error?: Error, messageId: string = "", description?: string) {
    this.logger.error(description ?? error?.message ?? "", "app", error?.name || "", error?.stack || "", messageId);
  }
  serializeHeaders(headers: HttpHeaders) {
    const headersObj = {};
    for (let key in headers.keys()) {
      if (key.match(/token/i)) {
        headersObj[key] = headers.get(key).slice(0, 10) + "...";
      } else {
        headersObj[key] = headers.get(key);
      }
    }
    return JSON.stringify(headers);
  }
  getContext() {
    try {
      throw new Error();
    } catch (err) {
      let context = err.stack.split('\n').slice(3).join('\n'); // first 3 lines removed
      return context;
    }
  }
}