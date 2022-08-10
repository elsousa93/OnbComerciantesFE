import { Injectable } from '@angular/core';
import { INGXLoggerConfig, INGXLoggerMetadata, NGXLoggerWriterService } from "ngx-logger";

@Injectable()
export class WriterCustomService extends NGXLoggerWriterService {

    protected override getFileDetailsToWrite(metadata: INGXLoggerMetadata, config: INGXLoggerConfig): string {
        return config.disableFileDetails === true ? '' : `[${metadata.fileName.split('/').pop()}:${metadata.lineNumber}:${metadata.columnNumber}]`;
    }
}