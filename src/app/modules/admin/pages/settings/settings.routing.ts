import { Route } from '@angular/router';
import { SettingsComponent } from 'app/modules/admin/pages/settings/settings.component';
import { SettingsResolver } from './settings.resolvers';

export const settingsRoutes: Route[] = [
    {
        path     : '',
        component: SettingsComponent,
        resolve  : {
            data: SettingsResolver
        }
    }
];

