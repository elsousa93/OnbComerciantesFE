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
    mockacoUrl: string
}
export const configurationToken = new InjectionToken('Configuration');
