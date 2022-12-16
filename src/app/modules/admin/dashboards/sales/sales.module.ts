import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';

import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRippleModule } from '@angular/material/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';

import { TranslocoModule } from '@ngneat/transloco';
import { NgApexchartsModule } from 'ng-apexcharts';
import { SharedModule } from 'app/shared/shared.module';

import { FilterMenuModule } from 'app/layout/common/filter-menu/filter-menu.module';
import { DemoSidebarModule } from 'app/layout/common/demo-sidebar/demo-sidebar.module';
import { SalesComponent } from 'app/modules/admin/dashboards/sales/sales.component';
import { SalesDataResolver } from './sales.resolvers';
import { salesRoutes } from './sales.routing';

@NgModule({
    declarations: [
        SalesComponent
    ],
    imports     : [
        RouterModule.forChild(salesRoutes),
        
        FilterMenuModule,
        DemoSidebarModule,

        MatButtonModule,
        MatButtonToggleModule,
        MatDividerModule,
        MatIconModule,
        MatMenuModule,
        MatProgressBarModule,
        MatRippleModule,
        MatSidenavModule,
        MatSortModule,
        MatTableModule,
        MatTabsModule,
        MatFormFieldModule,

        NgApexchartsModule,
        TranslocoModule,
        SharedModule
    ]
})
export class SalesModule
{
}
