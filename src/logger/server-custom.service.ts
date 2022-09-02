import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { INGXLoggerConfig, INGXLoggerMetadata, NGXLoggerServerService } from "ngx-logger";
import { Configuration } from 'src/app/configuration';

@Injectable()
export class ServerCustomService extends NGXLoggerServerService {
    private url: string;

    override sendToServer(metadata: INGXLoggerMetadata, configuration: INGXLoggerConfig): void{

        if (!this.url){
            
            let path = environment.production ? './assets/config/config.prod.json' : './assets/config/config.json';


            fetch(path)
            .then(file => file.json())
            .then((config : Configuration) => {
                this.url = config.neyondBackUrl + configuration.serverLoggingUrl;
                configuration.serverLoggingUrl = this.url;
                this.send(metadata, configuration)
            })
        }
        else {
            configuration.serverLoggingUrl = this.url;
            this.send(metadata, configuration)
        }
    };

    private send(metadata: INGXLoggerMetadata, configuration: INGXLoggerConfig): void{
        if (metadata.additional[0] == "app"){
            configuration.serverLoggingUrl = this.url + "/Application";
            metadata.additional.shift()
        }
        else if (metadata.additional[0] == "int"){
            configuration.serverLoggingUrl = this.url + "/Integration";
            metadata.additional.shift()
        }
        else {
            return;
        }
        super.sendToServer(metadata, configuration);
    }

}