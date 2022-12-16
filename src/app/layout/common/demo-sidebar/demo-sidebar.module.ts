import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';

import { FuseDrawerModule } from '@fuse/components/drawer';
import { FuseNavigationModule } from '@fuse/components/navigation/navigation.module';

import { DemoSidebarComponent } from 'app/layout/common/demo-sidebar/demo-sidebar.component';


@NgModule({
    declarations: [
        DemoSidebarComponent
    ],
    imports     : [
        CommonModule,
        RouterModule.forChild([]),
        MatIconModule,
        MatTooltipModule,
        MatButtonModule,
        MatProgressBarModule,
        FuseDrawerModule,
        FuseNavigationModule
    ],
    exports     : [
        DemoSidebarComponent
    ]
})
export class DemoSidebarModule
{
}
