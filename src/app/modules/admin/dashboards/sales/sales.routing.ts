import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { SalesComponent } from './sales.component';
import { SalesDataResolver } from './sales.resolvers';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const salesRoutes: Route[] = [

    /// Redirect empty path to '/total'
    {path: '', pathMatch : 'full', redirectTo: 'total'},

    {
        path     : '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: SalesComponent,
        data: {
            layout: 'classic'
        },
        resolve    : {
            initialData: SalesDataResolver,
        },
        children   : [
            {path: 'total', loadChildren: () => import('app/modules/admin/dashboards/sales/total/total.module').then(m => m.ProjectModule)},
            {path: 'topperformance', loadChildren: () => import('app/modules/admin/dashboards/sales/topperformance/topperformance.module').then(m => m.TopPerformanceModule)},

            // 404
            {path: '**', redirectTo: '404-not-found'}
        ]
    }
];
