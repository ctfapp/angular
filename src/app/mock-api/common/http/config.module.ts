import { ModuleWithProviders, NgModule } from '@angular/core';
import { HttpConfigService } from './config.service';
import { FUSE_APP_CONFIG } from './config.constants';

@NgModule()
export class HttpConfigModule
{
    /**
     * Constructor
     */
    constructor(private _httpConfigService: HttpConfigService)
    {
    }

    /**
     * forRoot method for setting user configuration
     *
     * @param config
     */
    static forRoot(config: any): ModuleWithProviders<HttpConfigModule>
    {
        return {
            ngModule : HttpConfigModule,
            providers: [
                {
                    provide : FUSE_APP_CONFIG,
                    useValue: config
                }
            ]
        };
    }
}
