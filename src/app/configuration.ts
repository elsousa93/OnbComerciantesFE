import { InjectionToken } from "@angular/core";

export interface Configuration {
  production: boolean,
  baseUrl: string,
  neyondBackUrl: string,
  DOCASUrl: string,
  postmanUrl: string,
  acquiringAPIUrl: string,
  outboundUrl: string,
  authTokenUrl: string,
  mockacoUrl: string,
  tokenUrl: string,
  clientID: string,
  loginClientID: string,
  clientSecret: string,
  timeout: number,
  tenant: string,
  redirectUrl: {

  }
}
export const configurationToken = new InjectionToken('Configuration');
