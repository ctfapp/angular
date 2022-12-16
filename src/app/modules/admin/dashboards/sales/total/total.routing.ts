import { Route } from '@angular/router';
import { ProjectComponent } from 'app/modules/admin/dashboards/sales/total/total.component';
import { ProjectResolver } from 'app/modules/admin/dashboards/sales/total/total.resolvers';

export const projectRoutes: Route[] = [
    {
        path     : '',
        component: ProjectComponent,
        resolve  : {
            data: ProjectResolver
        }
    }
];
