import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
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
import { MatFormFieldModule } from '@angular/material/form-field'
import { TranslocoModule } from '@ngneat/transloco';
import { NgApexchartsModule } from 'ng-apexcharts';
import { SharedModule } from 'app/shared/shared.module';
import { TopPerformanceComponent } from './topperformance.component';
import { routes } from './topperformance.routing';
import { FilterMenuComponent } from 'app/layout/common/filter-menu/filter-menu.component';
import { FilterMenuModule } from 'app/layout/common/filter-menu/filter-menu.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';


@NgModule({
    declarations: [
        TopPerformanceComponent
    ],
    imports     : [
        RouterModule.forChild(routes),

        FilterMenuModule,

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
        MatTooltipModule,
        MatChipsModule,

        NgApexchartsModule,
        TranslocoModule,
        SharedModule
    ],
    //providers: [FilterMenuService]
})
export class TopPerformanceModule
{
}
