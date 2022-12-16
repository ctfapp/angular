import { Route } from '@angular/router';

import { TopPerformanceComponent } from './topperformance.component';
import { TopPerformanceResolver } from './topperformance.resolvers';

export const routes: Route[] = [
    {
        path     : '',
        component: TopPerformanceComponent,
        resolve  : {
            data: TopPerformanceResolver
        }
    }
];
